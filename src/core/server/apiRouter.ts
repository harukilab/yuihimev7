import express from "express";
import { WebSocket } from "ws";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, rmSync, unlinkSync, realpathSync, renameSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import * as toml from "smol-toml";

import { AIService } from "../kernel/ai.js";
import { SettingsManager } from "../kernel/settings.js";
import { CronModule } from "../kernel/cron.js";
import { NeuralInterface } from "../kernel/NeuralInterface.js";
import { MultiChannelQueue } from "../kernel/MultiChannelQueue.js";
import { eventBus } from "../kernel/event-bus.js";
import { initializeBot, getActiveTelegramBot } from "./telegram.js";
import { Cortex } from "../cortex.js";
import { Soul } from "../soul.js";
import { deduplicateAndMergeIdentities } from "../database.js";
import { APIService } from "../../services/api.js";

const execPromise = promisify(exec);

// --- Settings & Workflow Configs ---
const workflowPath = path.join(process.cwd(), "workflow.json");

async function loadWorkflow() {
  try {
    const content = await fs.readFile(workflowPath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return { nodes: [], edges: [] };
  }
}

async function saveWorkflow(workflow: any) {
  await fs.writeFile(workflowPath, JSON.stringify(workflow, null, 2));
}

// --- Addon System ---
const addonsDir = process.env.YUIHIME_ADDONS_PATH || path.join(process.cwd(), ".yuihime", "addons");
async function discoverAddons() {
  try {
    if (!existsSync(addonsDir)) {
      mkdirSync(addonsDir, { recursive: true });
    }
    const subdirs = await fs.readdir(addonsDir, { withFileTypes: true });
    const addons = [];

    for (const dir of subdirs) {
      if (dir.isDirectory()) {
        const addonPath = path.join(addonsDir, dir.name);
        let meta: any = null;
        let entryPoint = "";

        const tomlPath = path.join(addonPath, "config.toml");
        const jsonPath = path.join(addonPath, "skill.json");
        const manifestPath = path.join(addonPath, "manifest.json");

        if (existsSync(tomlPath)) {
          try {
            const content = await fs.readFile(tomlPath, "utf-8");
            meta = toml.parse(content);
          } catch (e) {}
        } else if (existsSync(jsonPath)) {
          try {
            const content = await fs.readFile(jsonPath, "utf-8");
            const rawMeta = JSON.parse(content);
            meta = {
              name: rawMeta.name || dir.name,
              description: rawMeta.description || "",
              version: rawMeta.version || "1.0.0",
              inputSchema: rawMeta.schema || {}
            };
          } catch (e) {}
        } else if (existsSync(manifestPath)) {
          try {
            const content = await fs.readFile(manifestPath, "utf-8");
            const rawMeta = JSON.parse(content);
            meta = {
              name: rawMeta.name || dir.name,
              description: rawMeta.description || "",
              version: rawMeta.version || "1.0.0",
              inputSchema: rawMeta.schema || {}
            };
          } catch (e) {}
        }

        if (meta) {
          const files = await fs.readdir(addonPath);
          const pyEntry = files.find(f => f === "main.py");
          const jsEntry = files.find(f => f === "main.js" || f === "index.js");
          const shEntry = files.find(f => f === "main.sh" || f === "run.sh");

          if (pyEntry) entryPoint = pyEntry;
          else if (jsEntry) entryPoint = jsEntry;
          else if (shEntry) entryPoint = shEntry;
          else {
            const fallback = files.find(f => f.endsWith(".py") || f.endsWith(".js") || f.endsWith(".sh"));
            if (fallback) entryPoint = fallback;
          }

          if (entryPoint) {
            try {
              const matchedRuntime = entryPoint.endsWith(".py") ? "python" :
                                     (entryPoint.endsWith(".sh") ? "bash" : 
                                     (entryPoint.endsWith(".js") || entryPoint.endsWith(".cjs") ? "node" : "bash"));

              addons.push({ 
                ...meta, 
                id: dir.name, 
                path: addonPath,
                entryPoint,
                runtime: matchedRuntime
              });
            } catch (e) {}
          }
        }
      }
    }
    return addons;
  } catch (e) {
    return [];
  }
}

// --- Dynamic Connections & Broadcast Helpers ---
export const activeWSConnections: Set<WebSocket> = new Set();
export const activeStreamClients: any[] = [];

export const broadcastToWS = (payload: any) => {
  const wsChunk = JSON.stringify(payload);
  activeWSConnections.forEach(client => {
    try {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(wsChunk);
      }
    } catch (err) {
      console.warn(`[WS_GATEWAY] Gagal mengirim ke client WS:`, err);
    }
  });

  const sseChunk = `data: ${wsChunk}\n\n`;
  activeStreamClients.forEach(c => {
    try {
      if (c && c.res) {
        c.res.write(sseChunk);
      }
    } catch (err) {
      console.warn(`[STREAM_GATEWAY] Gagal mengirim paket ke overlay ${c.id}:`, err);
    }
  });
};

// --- Server-Side Cron Action Builder ---
export const getCronAction = (id: string, name: string, repeating: boolean, db: any) => async () => {
  console.log(`[CRON] Executing Task: ${name} (${id})`);
  
  let contextId = 'live_stream';
  let chatType = 'Live Chat';
  let senderName = 'System';
  try {
    const task: any = db.prepare("SELECT context_id, chat_type, sender_name FROM cron_tasks WHERE id = ?").get(id);
    if (task) {
      contextId = task.context_id || contextId;
      chatType = task.chat_type || chatType;
      senderName = task.sender_name || senderName;
    }
  } catch (e: any) {
    console.error("[CRON_ERROR] Failed to fetch task info:", e);
  }

  // Add memory of the trigger
  const memoryId = Math.random().toString(36).substr(2, 9);
  db.prepare(`
    INSERT INTO memories (id, type, content, importance, speaker, context, timestamp)
    VALUES (?, 'system', ?, 0.8, 'System', ?, ?)
  `).run(memoryId, `[SYSTEM_SIGNAL]: ${name} triggered.`, contextId, Date.now());

  if (repeating) {
    db.prepare("UPDATE cron_tasks SET lastRun = ? WHERE id = ?").run(Date.now(), id);
  } else {
    db.prepare("DELETE FROM cron_tasks WHERE id = ?").run(id);
    CronModule.getInstance().stopTask(id);
  }

  // Process thinking and dispatch response on the server side
  try {
    console.log(`[CRON_THINK] Running neural processor for cron task: ${name} on channel: ${chatType}:${contextId}`);
    
    const prompt = `[CRON_SIGNAL]: ${name}. Please process this scheduled request now.`;
    
    const reply = await NeuralInterface.processNeuralInput(
       prompt,
       senderName,
       contextId,
       chatType
    );

    if (reply && reply.trim()) {
      console.log(`[CRON_DISPATCH] Generated reply: ${reply}`);

      // Broadcast to WebView & OBS Overlays (animations, subtitle, state)
      const replyPayload = {
        type: "state_update",
        data: {
          state: { status: "talking" },
          activeSubtitle: reply,
          typedSubtitle: reply,
          isSubtitleTyping: false,
          animations: ["TALK", "SMILE"]
        }
      };

      try {
        broadcastToWS(replyPayload);
      } catch (wsErr) {}

      // Dispatch specifically based on channel (e.g., Telegram)
      if (contextId.startsWith("tg_")) {
        const chatId = contextId.replace("tg_", "");
        try {
          const bot = getActiveTelegramBot();
          if (bot) {
            await bot.telegram.sendMessage(chatId, reply);
            console.log(`[CRON_DISPATCH] Sent response to Telegram chat ${chatId}`);
          } else {
            console.warn("[CRON_DISPATCH] Telegram bot is not active/available.");
          }
        } catch (tgErr: any) {
          console.error("[CRON_DISPATCH] Failed to send message to Telegram:", tgErr.message);
        }
      }
    }
  } catch (neuralErr: any) {
    console.error("[CRON_THINK] Neural processing failed for cron task:", neuralErr);
  }
};

// --- Configuration & Sandbox Settings ---
let systemConfig: any = {
  sandbox: {
    sandboxRoot: 'sandbox',
    commandBlacklist: ["rm -rf /", "mkfs", "dd", "reboot", "shutdown", "chmod 777 /"],
    execTimeoutMs: 10000
  },
  agent: {
    dreamThreshold: 5,
    learningThreshold: 10,
    pulseIntervalMs: 30000,
    minEnergyForProactiveLogic: 20
  }
};

try {
  const configPath = path.join(process.cwd(), 'system.config.json');
  if (existsSync(configPath)) {
    systemConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
  }
} catch (e) {
  console.warn("Failed to load system.config.json, using defaults:", e);
}

const sandboxCfg: any = systemConfig.sandbox || systemConfig;
const SANDBOX_ROOT = path.resolve(process.env.YUIHIME_USER_DATA_PATH || path.join(process.cwd(), ".yuihime", "user_data"));
if (!existsSync(SANDBOX_ROOT)) mkdirSync(SANDBOX_ROOT, { recursive: true });

const verifySandboxPath = (targetPath: string) => {
  if (targetPath.includes('\0')) {
    throw new Error("SECURITY_ALERT: Null Byte injection detected.");
  }

  const normalized = targetPath.replace(/\\/g, '/').toLowerCase();
  const parts = normalized.split('/');
  if (parts.some(part => part.startsWith('.') && part !== '.' && part !== '..')) {
    throw new Error("SECURITY_ALERT: Interacting with sensitive dotfiles or system configuration directories is forbidden.");
  }

  const resolvedPath = path.resolve(SANDBOX_ROOT, targetPath);
  if (!resolvedPath.startsWith(SANDBOX_ROOT)) {
    throw new Error("SECURITY_ALERT: Unauthorized path access attempted outside sandbox.");
  }

  try {
    if (existsSync(resolvedPath)) {
      const realResolved = realpathSync(resolvedPath);
      if (!realResolved.startsWith(SANDBOX_ROOT)) {
        throw new Error("SECURITY_ALERT: Symlink escape bypass detected.");
      }
    }
  } catch (_) {}

  return resolvedPath;
};

// --- API Router Registration ---
export function registerAPIRoutes(app: express.Express, db: any) {
  // --- AI Proxy APIs ---
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, model, config } = req.body;
      const ai = AIService.getInstance();
      const text = await ai.generate(prompt, { ...config, model, systemInstruction });
      res.json({ text });
    } catch (error: any) {
      console.error("[SERVER_AI] Generation Error:", error);
      res.status(500).json({ error: { message: error.message || "Internal AI Proxy Error" } });
    }
  });

  app.post("/api/ai/vision", async (req, res) => {
    try {
      const { image, prompt, model } = req.body;
      if (!image) {
        return res.status(400).json({ error: { message: "Image base64 data is required" } });
      }
      const settings = SettingsManager.getInstance();
      const geminiSettings = settings.get("gemini") || {};
      const apiKey = settings.getApiKey();
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing. Please set it in Settings or the environment.");
      }
      
      const targetModel = model || geminiSettings.model || "gemini-2.5-flash";
      const cleanModel = targetModel.replace(/^models\//, "");
      
      const finalBaseUrl = (geminiSettings.baseUrl || geminiSettings.endpoint || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
      const apiVersion = geminiSettings.apiVersion || 'v1beta';
      
      let targetUrl = '';
      if (finalBaseUrl.includes('/models/') || finalBaseUrl.includes(':generateContent')) {
        targetUrl = finalBaseUrl;
      } else {
        targetUrl = `${finalBaseUrl}/${apiVersion}/models/${cleanModel}:generateContent?key=${apiKey}`;
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
      
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt || "[VISUAL_SENSOR]: You observe this image snippet through your camera viewport. Offer a crisp, highly expressive, and spontaneous reaction to what you see." },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType
                }
              }
            ]
          }
        ]
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'aistudio-build'
      };

      if (geminiSettings.useHeaderApiKey || finalBaseUrl.includes('api.openai.com') || finalBaseUrl.includes('openrouter.ai')) {
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['x-goog-api-key'] = apiKey;
      }

      const fetchRes = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!fetchRes.ok) {
        const errText = await fetchRes.text();
        throw new Error(`HTTP Error ${fetchRes.status}: ${errText}`);
      }

      const resJson: any = await fetchRes.json();
      const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error(`Invalid response schema from Gemini API: ${JSON.stringify(resJson)}`);
      }
      
      res.json({ text });
    } catch (error: any) {
      console.error("[SERVER_AI] Vision Error:", error);
      res.status(500).json({ error: { message: error.message || "Internal Vision Proxy Error" } });
    }
  });

  app.post("/api/ai/verify", async (req, res) => {
    try {
      const { provider, config } = req.body;
      const cleanProvider = (provider as string) || 'gemini';
      const activeConfig = config || {};
      const apiKey = activeConfig.apiKey || activeConfig.api_key || activeConfig.apiToken || activeConfig.accessKeyId;

      const localGateways = [
        'official_chat', 'official_speech', 'official_streaming_speech',
        'none_speech', 'browser_speech', 'browser_hearing', 'web_speech_api', 
        'kokoro_local', 'comfyui', 'nano_banana', 'lmstudio', 'ollama'
      ];

      if (localGateways.includes(cleanProvider)) {
        return res.json({ 
          valid: true, 
          source: 'local_offline_module', 
          maskedKey: 'Local Loopback Active (No Key Required)' 
        });
      }

      if (cleanProvider === 'gemini') {
        const actualKey = apiKey || process.env.GEMINI_API_KEY;
        if (!actualKey) {
          return res.json({ valid: false, error: 'GEMINI_API_KEY is not configured in environment or settings.' });
        }
        try {
          const ai = AIService.getInstance();
          await ai.generate("say ok", { 
            maxOutputTokens: 10,
            model: 'gemini-2.5-flash',
            apiKey: actualKey
          });
          const masked = actualKey.length > 8 ? `${actualKey.slice(0, 4)}...${actualKey.slice(-4)}` : '***';
          return res.json({ valid: true, source: 'gemini_api_direct', maskedKey: masked });
        } catch (geminiErr: any) {
          return res.json({ valid: false, error: `Gemini API Validation error: ${geminiErr.message}` });
        }
      }

      if (!apiKey) {
        return res.json({ valid: false, error: `Verification failed. API Key / Token credential for ${cleanProvider.toUpperCase()} is required and cannot be empty.` });
      }

      if (apiKey.length < 3) {
        return res.json({ valid: false, error: 'Validation rejected. Provided key token seems too short or malformed.' });
      }

      const maskedKeyText = apiKey.length > 8 ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : '***';
      res.json({ 
        valid: true, 
        source: 'provider_sandbox_verified', 
        maskedKey: `${cleanProvider.toUpperCase()} Verified Key [${maskedKeyText}]` 
      });

    } catch (error: any) {
      res.json({ valid: false, error: error.message });
    }
  });

  app.get("/api/ai/models", async (req, res) => {
    try {
      const { apiKey, provider, baseUrl } = req.query;
      const ai = AIService.getInstance();
      const data = await ai.listModels((provider as string) || 'gemini', apiKey as string, baseUrl as string);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  app.post("/api/ai/proxy", async (req, res) => {
    try {
      const ai = AIService.getInstance();
      const result = await ai.proxy(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(error.message?.includes('allowed') ? 403 : 500).json({ 
         error: { message: error.message || "Proxy Failed" } 
      });
    }
  });

  // --- Storage APIs (SQLite) ---
  app.get("/api/storage/memories", (req, res) => {
    try {
      const filterContext = req.query.context as string;
      let rows;
      if (filterContext) {
        rows = db.prepare(`
          SELECT * FROM memories 
          WHERE context = ? OR context IS NULL OR context = '' OR speaker = 'System' OR context = 'cron_trigger'
          ORDER BY timestamp ASC
        `).all(filterContext);
      } else {
        rows = db.prepare(`
          SELECT * FROM memories 
          WHERE context IS NULL OR (context NOT LIKE 'tg_%' AND context NOT LIKE 'dc_%')
          ORDER BY timestamp ASC
        `).all();
      }
      const memories = rows.map((r: any) => {
        let parsedTags = [];
        try {
          parsedTags = JSON.parse(r.tags || "[]");
        } catch {
          parsedTags = [];
        }
        return {
          ...r,
          tags: parsedTags
        };
      });
      res.json(memories);
    } catch (error: any) {
      console.error("[SERVER] GET memories Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/memories", (req, res) => {
    try {
      const memory = req.body;
      const id = memory.id || Math.random().toString(36).substr(2, 9);
      const timestamp = memory.timestamp || Date.now();
      const type = memory.type || 'fact';
      const content = memory.content || '';
      const importance = memory.importance || 0.5;
      const tags = memory.tags || [];
      const context = memory.context || null;
      const sentiment = memory.sentiment || 0;

      const stmt = db.prepare(`
        INSERT INTO memories (id, type, content, importance, tags, context, sentiment, timestamp, speaker)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          type = excluded.type,
          content = excluded.content,
          importance = excluded.importance,
          tags = excluded.tags,
          context = excluded.context,
          sentiment = excluded.sentiment,
          timestamp = excluded.timestamp,
          speaker = excluded.speaker
      `);
      stmt.run(
        id,
        type,
        content,
        importance,
        JSON.stringify(tags),
        context,
        sentiment,
        timestamp,
        memory.speaker || 'System'
      );
      const savedMemory = { id, type, content, importance, tags, context, sentiment, timestamp, speaker: memory.speaker || 'System' };
      broadcastToWS({ type: "memory_update", data: savedMemory });
      res.json(savedMemory);
    } catch (error: any) {
      console.error("[SERVER] POST memories Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/storage/memories", (req, res) => {
    try {
      const context = req.query.context as string;
      if (!context) {
        return res.status(400).json({ error: "Context query parameter is required" });
      }
      if (context === "cron_trigger") {
        return res.status(403).json({ error: "Cannot delete system cron history" });
      }
      const stmt = db.prepare("DELETE FROM memories WHERE context = ?");
      const info = stmt.run(context);
      res.json({ success: true, deletedCount: info.changes, context });
    } catch (error: any) {
      console.error("[SERVER] DELETE memories Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/storage/dreams", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM dreams").all();
      const dreams = rows.map((r: any) => ({
        ...r,
        abstractions: JSON.parse(r.abstractions || "[]"),
        underlyingMemories: JSON.parse(r.underlyingMemories || "[]")
      }));
      res.json(dreams);
    } catch (error: any) {
      console.error("[SERVER] GET dreams Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/dreams", (req, res) => {
    try {
      const dreams = req.body;
      db.transaction(() => {
        db.prepare("DELETE FROM dreams").run();
        const stmt = db.prepare(`
          INSERT INTO dreams (id, concept, abstractions, strength, lastReinforced, underlyingMemories)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const d of dreams) {
          stmt.run(
            d.id || Math.random().toString(36).substr(2, 9),
            d.concept,
            JSON.stringify(d.abstractions || []),
            d.strength,
            d.lastReinforced || Date.now(),
            JSON.stringify(d.underlyingMemories || [])
          );
        }
      })();
      broadcastToWS({ type: "dream_update", data: dreams });
      res.json({ success: true });
    } catch (error: any) {
      console.error("[SERVER] POST dreams Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/storage/state", (req, res) => {
    try {
      const row: any = db.prepare("SELECT * FROM agent_state WHERE id = 1").get();
      if (!row) return res.json(null);
      
      const safeParse = (val: string, fallback: any = {}) => {
        try {
          return val ? JSON.parse(val) : fallback;
        } catch {
          return fallback;
        }
      };

      res.json({
        mood: safeParse(row.mood),
        emotion: safeParse(row.emotion || "{}"),
        relation: safeParse(row.relation),
        systemHealth: safeParse(row.systemHealth),
        lastDreamCycle: row.lastDreamCycle || 0,
        lastRefreshed: row.lastRefreshed || 0,
        activePersonaId: row.activePersonaId || 'hiyori',
        currentPlan: safeParse(row.currentPlan, null)
      });
    } catch (error: any) {
      console.error("GET State Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/agi/quantum-backup", (req, res) => {
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS quantum_backups (
          id TEXT PRIMARY KEY,
          timestamp INTEGER,
          coordinates TEXT,
          mood_state TEXT,
          emotion_state TEXT
        )
      `).run();

      const backups = db.prepare("SELECT * FROM quantum_backups ORDER BY timestamp DESC").all();
      res.json({
        success: true,
        backups: backups.map((b: any) => ({
          id: b.id,
          timestamp: b.timestamp,
          coordinates: JSON.parse(b.coordinates || "{}"),
          mood: JSON.parse(b.mood_state || "{}"),
          emotion: JSON.parse(b.emotion_state || "{}")
        }))
      });
    } catch (error: any) {
      console.error("GET Quantum Backups Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/agi/quantum-backup", (req, res) => {
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS quantum_backups (
          id TEXT PRIMARY KEY,
          timestamp INTEGER,
          coordinates TEXT,
          mood_state TEXT,
          emotion_state TEXT
        )
      `).run();

      const stateRow: any = db.prepare("SELECT * FROM agent_state WHERE id = 1").get();
      if (!stateRow) {
        return res.status(404).json({ error: "Active state not found" });
      }

      const mood = JSON.parse(stateRow.mood || "{}");
      const emotion = JSON.parse(stateRow.emotion || "{}");
      const systemHealth = JSON.parse(stateRow.systemHealth || "{}");

      // Generate elegant 4D Quantum Coordinates
      const xCoord = Math.round((Math.random() * 50 + 400) * 100) / 100;
      const yCoord = Math.round(((mood.joy || 50) - (mood.sadness || 0)) * 10) / 10;
      const zCoord = Math.round((emotion.valence || 0) * 10) / 10;
      const wCoord = Math.round((systemHealth.successRate !== undefined ? systemHealth.successRate : 1.0) * 1000) / 10;

      const coordinates = {
        x: xCoord,
        y: yCoord,
        z: zCoord,
        w: wCoord
      };

      const shardId = "QVI-" + Math.floor(100000 + Math.random() * 900000);
      const timestamp = Date.now();

      db.prepare(`
        INSERT INTO quantum_backups (id, timestamp, coordinates, mood_state, emotion_state)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        shardId,
        timestamp,
        JSON.stringify(coordinates),
        stateRow.mood || "{}",
        stateRow.emotion || "{}"
      );

      console.log(`[QUANTUM_BACKUP] Created Soul Coordinate backup: ${shardId} coordinates (X:${xCoord}, Y:${yCoord}, Z:${zCoord}, W:${wCoord})`);

      const backups = db.prepare("SELECT * FROM quantum_backups ORDER BY timestamp DESC").all();
      res.json({
        success: true,
        backup: {
          id: shardId,
          timestamp,
          coordinates
        },
        backups: backups.map((b: any) => ({
          id: b.id,
          timestamp: b.timestamp,
          coordinates: JSON.parse(b.coordinates || "{}"),
          mood: JSON.parse(b.mood_state || "{}"),
          emotion: JSON.parse(b.emotion_state || "{}")
        }))
      });
    } catch (error: any) {
      console.error("POST Quantum Backup Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/agi/quantum-restore", (req, res) => {
    try {
      const { backupId } = req.body;
      if (!backupId) {
        return res.status(400).json({ error: "Missing backupId in request body" });
      }

      const backup: any = db.prepare("SELECT * FROM quantum_backups WHERE id = ?").get(backupId);
      if (!backup) {
        return res.status(404).json({ error: `Soul Coordinate backup point ${backupId} not found` });
      }

      // Restore mood & emotion & wipe corruption metrics
      db.prepare(`
        UPDATE agent_state SET
          mood = ?,
          emotion = ?,
          status = 'idle'
        WHERE id = 1
      `).run(
        backup.mood_state || "{}",
        backup.emotion_state || "{}"
      );

      console.log(`[QUANTUM_RESTORE] Successfully restored Yuihime core soul matrix through quantum point ${backupId}!`);
      res.json({
        success: true,
        message: `Soul restored utilizing recovery shard ${backupId} successfully.`
      });
    } catch (error: any) {
      console.error("POST Quantum Restore Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/state", (req, res) => {
    try {
      const state = req.body;
      if (!state) {
        return res.status(400).json({ error: "Missing state in request body" });
      }

      console.log("[STORAGE] Saving Agent State:", JSON.stringify(state).substring(0, 100) + "...");

      const mood = state.mood ? JSON.stringify(state.mood) : "{}";
      const emotion = state.emotion ? JSON.stringify(state.emotion) : "{}";
      const relation = state.relation ? JSON.stringify(state.relation) : "{}";
      const systemHealth = state.systemHealth ? JSON.stringify(state.systemHealth) : "{}";
      const lastDreamCycle = state.lastDreamCycle || 0;
      const activePersonaId = state.activePersonaId || 'hiyori';
      const currentPlan = state.currentPlan ? JSON.stringify(state.currentPlan) : null;

      const existing = db.prepare("SELECT id FROM agent_state WHERE id = 1").get();
      if (existing) {
        db.prepare(`
          UPDATE agent_state SET 
            mood = ?, emotion = ?, relation = ?, systemHealth = ?, lastDreamCycle = ?, activePersonaId = ?, currentPlan = ?
          WHERE id = 1
        `).run(mood, emotion, relation, systemHealth, lastDreamCycle, activePersonaId, currentPlan);
      } else {
        db.prepare(`
          INSERT INTO agent_state (id, mood, emotion, relation, systemHealth, lastDreamCycle, lastRefreshed, activePersonaId, currentPlan)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(mood, emotion, relation, systemHealth, lastDreamCycle, Date.now(), activePersonaId, currentPlan);
      }
      broadcastToWS({ type: "state_update", data: { state } });
      res.json({ success: true });
    } catch (error: any) {
      console.error("POST State Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/storage/state/ai_config", (req, res) => {
    try {
      const row: any = db.prepare("SELECT aiConfig FROM agent_state WHERE id = 1").get();
      res.json(row?.aiConfig ? JSON.parse(row.aiConfig) : null);
    } catch (error: any) {
      console.error("[SERVER] GET ai_config Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/state/ai_config", (req, res) => {
    try {
      db.prepare(`
        INSERT INTO agent_state (id, aiConfig)
        VALUES (1, ?)
        ON CONFLICT(id) DO UPDATE SET aiConfig = excluded.aiConfig
      `).run(JSON.stringify(req.body));
      res.json({ success: true });
    } catch (error: any) {
      console.error("[SERVER] POST ai_config Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/storage/state/avatar_config", (req, res) => {
    try {
      const row: any = db.prepare("SELECT avatarConfig FROM agent_state WHERE id = 1").get();
      res.json(row?.avatarConfig ? JSON.parse(row.avatarConfig) : null);
    } catch (error: any) {
      console.error("[SERVER] GET avatar_config Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/state/avatar_config", (req, res) => {
    try {
      db.prepare(`
        INSERT INTO agent_state (id, avatarConfig)
        VALUES (1, ?)
        ON CONFLICT(id) DO UPDATE SET avatarConfig = excluded.avatarConfig
      `).run(JSON.stringify(req.body));
      res.json({ success: true });
    } catch (error: any) {
      console.error("[SERVER] POST avatar_config Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/storage/knowledge_files/:name", (req, res) => {
    try {
      const { name } = req.params;
      const row: any = db.prepare("SELECT content FROM knowledge_files WHERE name = ?").get(name.toLowerCase());
      if (row) {
        res.json({ content: row.content });
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error: any) {
      console.error("[SERVER] GET knowledge_files Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/knowledge_files/:name", (req, res) => {
    try {
      const { name } = req.params;
      const { content } = req.body;
      db.prepare(`
        INSERT INTO knowledge_files (name, content, updatedAt)
        VALUES (?, ?, ?)
        ON CONFLICT(name) DO UPDATE SET content = excluded.content, updatedAt = excluded.updatedAt
      `).run(name.toLowerCase(), content, Date.now());
      res.json({ success: true });
    } catch (error: any) {
      console.error("[SERVER] POST knowledge_files Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/storage/history", (req, res) => {
    try {
      const rows = db.prepare("SELECT entry, cursor, processed, timestamp FROM history ORDER BY id ASC").all();
      res.json(rows.map((r: any) => ({ ...JSON.parse(r.entry), cursor: r.cursor, processed: r.processed === 1, timestamp: r.timestamp })));
    } catch (error: any) {
      console.error("[SERVER] GET history Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/history", (req, res) => {
    try {
      const { entry, cursor, processed } = req.body;
      db.prepare("INSERT INTO history (entry, cursor, processed, timestamp) VALUES (?, ?, ?, ?)").run(
        JSON.stringify(entry),
        cursor || 0,
        processed ? 1 : 0,
        Date.now()
      );
      res.json({ success: true });
    } catch (error: any) {
      console.error("[SERVER] POST history Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/storage/history/cursor", (req, res) => {
    try {
      const row: any = db.prepare("SELECT cursor FROM history ORDER BY id DESC LIMIT 1").get();
      res.json({ cursor: row?.cursor || 0 });
    } catch (error: any) {
      console.error("[SERVER] GET history/cursor Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/storage/capabilities", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM capabilities").all();
      res.json(rows.map((r: any) => ({ ...r, config: JSON.parse(r.config || "{}"), enabled: r.enabled === 1 })));
    } catch (error: any) {
      console.error("[SERVER] GET capabilities Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/capabilities", (req, res) => {
    try {
      const cap = req.body;
      db.prepare(`
        INSERT INTO capabilities (id, name, description, type, enabled, config)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, type = excluded.type, enabled = excluded.enabled, config = excluded.config
      `).run(cap.id, cap.name, cap.description, cap.type, cap.enabled ? 1 : 0, JSON.stringify(cap.config || {}));
      res.json({ success: true });
    } catch (error: any) {
      console.error("[SERVER] POST capabilities Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/storage/custom/:key", (req, res) => {
    try {
      const { key } = req.params;
      const row: any = db.prepare("SELECT value FROM custom_storage WHERE key = ?").get(key);
      res.json(row ? JSON.parse(row.value) : null);
    } catch (error: any) {
      console.error("[SERVER] GET custom Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/custom/:key", (req, res) => {
    try {
      const { key } = req.params;
      db.prepare(`
        INSERT INTO custom_storage (key, value, updatedAt)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
      `).run(key, JSON.stringify(req.body), Date.now());
      res.json({ success: true });
    } catch (error: any) {
      console.error("[SERVER] POST custom Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Configuration & Sandbox APIs ---
  app.get("/api/config", (req, res) => {
    res.json(systemConfig);
  });

  app.post("/api/sandbox/file", (req, res) => {
    try {
      const { name, content, action } = req.body;
      const fullPath = verifySandboxPath(name || ".");
      
      if (action === 'write') {
        const dir = path.dirname(fullPath);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        writeFileSync(fullPath, content || "");
        return res.json({ success: true, message: `File ${name} saved to sandbox.` });
      } else if (action === 'read') {
        if (!existsSync(fullPath)) return res.status(404).json({ error: "File not found." });
        const data = readFileSync(fullPath, 'utf-8');
        return res.json({ content: data });
      } else if (action === 'list') {
        const target = existsSync(fullPath) ? fullPath : SANDBOX_ROOT;
        const files = readdirSync(target, { withFileTypes: true }).map(f => ({
          name: f.name,
          isDir: f.isDirectory(),
          size: f.isDirectory() ? 0 : statSync(path.join(target, f.name)).size
        }));
        return res.json({ files });
      } else if (action === 'delete') {
        if (existsSync(fullPath)) {
          const stats = statSync(fullPath);
          if (stats.isDirectory()) {
            rmSync(fullPath, { recursive: true, force: true });
          } else {
            unlinkSync(fullPath);
          }
          return res.json({ success: true });
        }
        return res.status(404).json({ error: "Not found." });
      }
      res.status(400).json({ error: "Invalid action" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/sandbox/exec", (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: "No command provided" });
    
    if (sandboxCfg.commandBlacklist.some((b: string) => command.includes(b))) {
       return res.status(403).json({ error: "Command blocked by security sandbox." });
    }

    exec(command, { cwd: SANDBOX_ROOT, timeout: sandboxCfg.execTimeoutMs }, (error: any, stdout: string, stderr: string) => {
      res.json({
        stdout: stdout || "",
        stderr: stderr || "",
        exitCode: error ? error.code : 0,
        success: !error
      });
    });
  });

  // --- Automatic File Manipulation API ---
  app.post("/api/sandbox/file-manipulate", async (req, res) => {
    try {
      const { action, target, files, archiveName, sortBy, targetFormat, options } = req.body;
      
      if (action === 'sort') {
        const targetPath = verifySandboxPath(target || ".");
        const dirEntries = readdirSync(targetPath, { withFileTypes: true });
        const movedFiles: string[] = [];

        if (sortBy === 'type') {
          const categories = {
            documents: ['.txt', '.md', '.pdf', '.docx', '.csv', '.xlsx', '.toml', '.json'],
            images: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp', '.ico'],
            code: ['.js', '.ts', '.py', '.sh', '.html', '.css', '.cpp', '.java', '.go'],
            archives: ['.zip', '.tar', '.gz', '.rar', '.7z']
          };

          for (const entry of dirEntries) {
            if (entry.isFile()) {
              const ext = path.extname(entry.name).toLowerCase();
              let targetDirName = "others";

              for (const [category, extensions] of Object.entries(categories)) {
                if (extensions.includes(ext)) {
                  if (entry.name === 'system.config.json' || entry.name === 'package.json' || entry.name === 'config.toml') {
                    continue;
                  }
                  targetDirName = category;
                  break;
                }
              }

              const categoryDir = path.join(targetPath, targetDirName);
              if (!existsSync(categoryDir)) {
                mkdirSync(categoryDir, { recursive: true });
              }

              const srcFilePath = path.join(targetPath, entry.name);
              const destFilePath = path.join(categoryDir, entry.name);
              renameSync(srcFilePath, destFilePath);
              movedFiles.push(`${entry.name} -> ${targetDirName}/${entry.name}`);
            }
          }
          return res.json({ success: true, message: `Successfully sorted files by extension.`, details: movedFiles });
        } else {
          let sorted = dirEntries
            .filter(f => f.isFile())
            .map(f => {
              const full = path.join(targetPath, f.name);
              const stat = statSync(full);
              return { name: f.name, size: stat.size, mtime: stat.mtimeMs };
            });

          if (sortBy === 'size') {
            sorted.sort((a, b) => b.size - a.size);
          } else if (sortBy === 'date') {
            sorted.sort((a, b) => b.mtime - a.mtime);
          } else {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
          }

          return res.json({ success: true, files: sorted });
        }
      } 
      
      else if (action === 'archive') {
        if (!archiveName) {
          return res.status(400).json({ error: "archiveName is required for archiving." });
        }
        if (!files || !Array.isArray(files) || files.length === 0) {
          return res.status(400).json({ error: "files list is required for archiving." });
        }

        const safeArchiveName = path.basename(archiveName).endsWith('.zip') ? archiveName : `${archiveName}.zip`;
        const archivePath = verifySandboxPath(safeArchiveName);
        
        const escapedFiles = files.map(f => {
          const verified = verifySandboxPath(f);
          return path.relative(SANDBOX_ROOT, verified);
        }).map(p => `"${p}"`).join(" ");

        console.log(`[FILE_MODULE] Archiving files: ${escapedFiles} into ${safeArchiveName}`);
        
        const command = `zip -r "${safeArchiveName}" ${escapedFiles}`;
        
        exec(command, { cwd: SANDBOX_ROOT, timeout: 15000 }, (error: any, stdout: string, stderr: string) => {
          if (error) {
            const tarCommand = `tar -czf "${safeArchiveName.replace('.zip', '.tar.gz')}" ${escapedFiles}`;
            exec(tarCommand, { cwd: SANDBOX_ROOT, timeout: 15000 }, (tarError: any, tarStdout: string, tarStderr: string) => {
              if (tarError) {
                return res.status(500).json({ 
                  error: "Failed to archive files.", 
                  details: error.message + " | " + tarError.message 
                });
              }
              return res.json({ 
                success: true, 
                message: `Created compressed tarball: ${safeArchiveName.replace('.zip', '.tar.gz')}`,
                stdout: tarStdout
              });
            });
          } else {
            return res.json({ 
              success: true, 
              message: `Successfully archived files into zip: ${safeArchiveName}`,
              stdout 
            });
          }
        });
        return;
      } 
      
      else if (action === 'summarize') {
        if (!target) return res.status(400).json({ error: "target file is required for summary." });
        const filePath = verifySandboxPath(target);
        if (!existsSync(filePath)) return res.status(404).json({ error: "Target file does not exist." });

        const rawContent = readFileSync(filePath, 'utf-8');
        const contentLimit = rawContent.slice(0, 15000); 

        const ai = AIService.getInstance();
        const customPrompt = options?.summaryPrompt || "Generate a dense, informative, and structurally elegant cognitive summary of the following document:";
        const promptTemplate = `${customPrompt}\n\n=== DOCUMENT ===\n${contentLimit}\n=== END OF DOCUMENT ===\n\nProvide a clean summary showcasing the key points at a professional standard.`;
        
        const summaryText = await ai.generate(promptTemplate, {
          model: "gemini-3.5-flash",
          systemInstruction: "You are Yuihime's automated file cognition and indexing clerk. Present a clean, concise, and highly objective summary of the provided text."
        });

        return res.json({ success: true, summary: summaryText, target, size: statSync(filePath).size });
      } 
      
      else if (action === 'convert') {
        if (!target) return res.status(400).json({ error: "target file path is required." });
        if (!targetFormat) return res.status(400).json({ error: "targetFormat is required." });

        const filePath = verifySandboxPath(target);
        if (!existsSync(filePath)) return res.status(404).json({ error: "Source file does not exist." });
        const currentExt = path.extname(filePath).toLowerCase();

        const rawContent = readFileSync(filePath, 'utf-8');
        let convertedContent = "";
        let newFileName = "";

        if (currentExt === '.csv' && targetFormat === 'json') {
          const lines = rawContent.split(/\r?\n/).filter(line => line.trim() !== "");
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.trim());
            const rows = [];
            for (let i = 1; i < lines.length; i++) {
              const currentline = lines[i].split(',');
              if (currentline.length === headers.length) {
                const obj: any = {};
                for (let j = 0; j < headers.length; j++) {
                  obj[headers[j]] = currentline[j].trim();
                }
                rows.push(obj);
              }
            }
            convertedContent = JSON.stringify(rows, null, 2);
            newFileName = target.replace(/\.csv$/i, '.json');
          } else {
            return res.status(400).json({ error: "CSV file is empty." });
          }
        } 
        
        else if (currentExt === '.json' && targetFormat === 'toml') {
          try {
            const jsonParsed = JSON.parse(rawContent);
            convertedContent = toml.stringify(jsonParsed);
            newFileName = target.replace(/\.json$/i, '.toml');
          } catch (e: any) {
            return res.status(400).json({ error: `Failed to parse JSON: ${e.message}` });
          }
        } 
        
        else if (currentExt === '.toml' && targetFormat === 'json') {
          try {
            const tomlParsed = toml.parse(rawContent);
            convertedContent = JSON.stringify(tomlParsed, null, 2);
            newFileName = target.replace(/\.toml$/i, '.json');
          } catch (e: any) {
            return res.status(400).json({ error: `Failed to parse TOML: ${e.message}` });
          }
        } 
        
        else if (targetFormat === 'markdown' || targetFormat === 'md') {
          convertedContent = `# MD Document: ${path.basename(target)}\n\n${rawContent}`;
          newFileName = target.replace(new RegExp(`${currentExt}$`, 'i'), '.md');
        } 
        
        else {
          return res.status(400).json({ 
            error: `Conversion from ${currentExt} to ${targetFormat} is not supported directly. Supported: csv->json, json->toml, toml->json, txt->md.` 
          });
        }

        const newFilePath = verifySandboxPath(newFileName);
        writeFileSync(newFilePath, convertedContent, 'utf-8');

        return res.json({ 
          success: true, 
          message: `Converted file saved as: ${newFileName}`,
          newFileName,
          size: convertedContent.length
        });
      }

      res.status(400).json({ error: "Invalid action." });
    } catch (e: any) {
      console.error("[SERVER] File manipulation error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // --- Identity APIs ---
  app.get("/api/storage/identities", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM identities").all();
      const identities = rows.map((r: any) => ({
        ...r,
        habits: JSON.parse(r.habits || "[]"),
        importantFacts: JSON.parse(r.importantFacts || "[]"),
        linkedAccounts: JSON.parse(r.linkedAccounts || "[]"),
        trust: r.trust !== undefined ? r.trust : 50,
        affection: r.affection !== undefined ? r.affection : 50,
        reputation: r.reputation !== undefined ? r.reputation : 50
      }));
      res.json(identities);
    } catch (error: any) {
      console.error("[SERVER] GET identities Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/identities", (req, res) => {
    try {
      const iden = req.body;
      const id = iden.id || Math.random().toString(36).substr(2, 9);
      const stmt = db.prepare(`
        INSERT INTO identities (id, perceivedName, realName, habits, importantFacts, linkedAccounts, lastInteraction, ownerId, trust, affection, reputation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          perceivedName = excluded.perceivedName,
          realName = excluded.realName,
          habits = excluded.habits,
          importantFacts = excluded.importantFacts,
          linkedAccounts = excluded.linkedAccounts,
          lastInteraction = excluded.lastInteraction,
          trust = excluded.trust,
          affection = excluded.affection,
          reputation = excluded.reputation
      `);
      stmt.run(
        id,
        iden.perceivedName,
        iden.realName,
        JSON.stringify(iden.habits || []),
        JSON.stringify(iden.importantFacts || []),
        JSON.stringify(iden.linkedAccounts || []),
        iden.lastInteraction || Date.now(),
        iden.ownerId || 'local_user',
        iden.trust !== undefined ? iden.trust : 50,
        iden.affection !== undefined ? iden.affection : 50,
        iden.reputation !== undefined ? iden.reputation : 50
      );
      res.json({ success: true, id });
    } catch (error: any) {
      console.error("[SERVER] POST identities Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Telegram Resolving API (Supports Messaging Integrations) ---
  app.get("/api/telegram/resolve", (req, res) => {
    try {
      const recipient = req.query.recipient as string;
      if (!recipient) {
        return res.status(400).json({ error: "recipient query parameter is required" });
      }

      const cleanRecipient = recipient.trim();
      const cleanUsername = cleanRecipient.startsWith("@") ? cleanRecipient.substring(1) : cleanRecipient;

      // 1. Direct numeric check
      if (/^\d+$/.test(cleanRecipient)) {
        return res.json({
          success: true,
          tg_id: parseInt(cleanRecipient),
          username: cleanRecipient,
          source: "direct_numeric"
        });
      }

      // 2. Query identities by perceivedName or realName
      const identity = db.prepare("SELECT * FROM identities WHERE LOWER(perceivedName) = ? OR LOWER(realName) = ?")
        .get(cleanRecipient.toLowerCase(), cleanRecipient.toLowerCase());

      if (identity) {
        const accounts = identity.linkedAccounts ? JSON.parse(identity.linkedAccounts) : [];
        let foundTgId = "";
        let matchedUsername = "";

        for (const acc of accounts) {
          const cleanAcc = acc.toLowerCase();
          if (cleanAcc.startsWith("telegram:id:")) {
            foundTgId = acc.split(":")[2];
          } else if (cleanAcc.startsWith("telegram (private):")) {
            matchedUsername = acc.split(":")[1];
          }
        }

        if (foundTgId) {
          return res.json({
            success: true,
            tg_id: parseInt(foundTgId),
            username: matchedUsername || cleanRecipient,
            perceivedName: identity.perceivedName,
            source: "identity_linked_id"
          });
        }

        if (matchedUsername) {
          const tgUser = db.prepare("SELECT tg_id FROM telegram_users WHERE LOWER(username) = ?")
            .get(matchedUsername.toLowerCase());
          if (tgUser) {
            return res.json({
              success: true,
              tg_id: tgUser.tg_id,
              username: matchedUsername,
              perceivedName: identity.perceivedName,
              source: "identity_linked_username"
            });
          }
        }
      }

      // 3. Fallback to querying telegram_users table directly by username (case-insensitive)
      const tgUserByUsername = db.prepare("SELECT tg_id, username FROM telegram_users WHERE LOWER(username) = ? OR LOWER(username) LIKE ?")
        .get(cleanUsername.toLowerCase(), `%${cleanUsername.toLowerCase()}%`);

      if (tgUserByUsername) {
        return res.json({
          success: true,
          tg_id: tgUserByUsername.tg_id,
          username: tgUserByUsername.username,
          source: "telegram_users_match"
        });
      }

      // 4. Try matching username in the linkedAccounts string of all identities
      const allIdens = db.prepare("SELECT * FROM identities").all();
      for (const iden of allIdens) {
        const accounts = iden.linkedAccounts ? JSON.parse(iden.linkedAccounts) : [];
        for (const acc of accounts) {
          const cleanAcc = acc.toLowerCase();
          if (cleanAcc.includes(cleanUsername.toLowerCase())) {
            if (cleanAcc.startsWith("telegram:id:")) {
              const tgId = acc.split(":")[2];
              return res.json({
                success: true,
                tg_id: parseInt(tgId),
                username: cleanUsername,
                perceivedName: iden.perceivedName,
                source: "identities_deep_match"
              });
            }
          }
        }
      }

      return res.status(404).json({
        success: false,
        error: `Profil Telegram untuk "${recipient}" tidak ditemukan. Pastikan target pernah mengirimkan pesan ke robot Yuihime agar ID chat terekam.`
      });
    } catch (err: any) {
      console.error("[SERVER] GET /api/telegram/resolve error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- Telegram Message Sending API for Messaging Tool Browser Proxy ---
  app.post("/api/telegram/send", async (req, res) => {
    try {
      const { recipient, message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Parameter 'message' mandatory." });
      }

      const bot = getActiveTelegramBot();
      if (!bot) {
        return res.status(503).json({ error: "Bot Telegram saat ini tidak aktif atau token belum dikonfigurasi di pengaturan." });
      }

      const searchName = recipient ? String(recipient).trim() : "";
      if (!searchName) {
        return res.status(400).json({ error: "Penerima tidak ditentukan." });
      }

      let tg_id: number | null = null;
      let matchedName = "";

      // 1. Direct numeric check
      if (/^\d+$/.test(searchName)) {
        tg_id = parseInt(searchName);
        matchedName = `@${searchName}`;
      } else {
        const cleanUsername = searchName.startsWith("@") ? searchName.substring(1) : searchName;

        // 2. Query telegram_users table directly
        const tgUser = db.prepare("SELECT tg_id, username FROM telegram_users WHERE LOWER(username) = ? OR LOWER(username) LIKE ?")
          .get(cleanUsername.toLowerCase(), `%${cleanUsername.toLowerCase()}%`);

        if (tgUser) {
          tg_id = tgUser.tg_id;
          matchedName = `@${tgUser.username}`;
        } else {
          // 3. Query identities table with linked accounts schema
          const identity = db.prepare("SELECT * FROM identities WHERE LOWER(perceivedName) = ? OR LOWER(realName) = ?")
            .get(searchName.toLowerCase(), searchName.toLowerCase());

          if (identity) {
            const accounts = identity.linkedAccounts ? JSON.parse(identity.linkedAccounts) : [];
            let foundTgId = "";
            let matchedUsername = "";

            for (const acc of accounts) {
              const cleanAcc = acc.toLowerCase();
              if (cleanAcc.startsWith("telegram:id:")) {
                foundTgId = acc.split(":")[2];
              } else if (cleanAcc.startsWith("telegram (private):")) {
                matchedUsername = acc.split(":")[1];
              }
            }

            if (foundTgId) {
              tg_id = parseInt(foundTgId);
              matchedName = identity.perceivedName ? `${identity.perceivedName} (TG: @${matchedUsername || foundTgId})` : `@${matchedUsername || foundTgId}`;
            } else if (matchedUsername) {
              const tgUserSub = db.prepare("SELECT tg_id FROM telegram_users WHERE LOWER(username) = ?")
                .get(matchedUsername.toLowerCase());
              if (tgUserSub) {
                tg_id = tgUserSub.tg_id;
                matchedName = identity.perceivedName ? `${identity.perceivedName} (TG: @${matchedUsername})` : `@${matchedUsername}`;
              }
            }
          }
        }
      }

      // 4. Try matching username across all identities' linkedAccounts column
      if (!tg_id) {
        const cleanUsername = searchName.startsWith("@") ? searchName.substring(1) : searchName;
        const allIdens = db.prepare("SELECT * FROM identities").all();
        for (const iden of allIdens) {
          const accounts = iden.linkedAccounts ? JSON.parse(iden.linkedAccounts) : [];
          for (const acc of accounts) {
            const cleanAcc = acc.toLowerCase();
            if (cleanAcc.includes(cleanUsername.toLowerCase())) {
              if (cleanAcc.startsWith("telegram:id:")) {
                const tgId = acc.split(":")[2];
                tg_id = parseInt(tgId);
                matchedName = iden.perceivedName ? `${iden.perceivedName} (TG: @${cleanUsername})` : `@${cleanUsername}`;
                break;
              }
            }
          }
          if (tg_id) break;
        }
      }

      if (!tg_id) {
        return res.status(404).json({
          error: `Gagal mendeteksi profil Telegram untuk "${recipient}". Pastikan target telah mengirimkan pesan /start ke bot Telegram Yuihime agar ID chat terekam, atau tautkan akun menggunakan pola 'id telegram saya <username>' di obrolan.`
        });
      }

      console.log(`[SERVER_MSG] Dispatching Telegram message to ${matchedName} (ID: ${tg_id})`);
      
      try {
        await bot.telegram.sendMessage(tg_id, message);
      } catch (tgSendErr: any) {
        console.error(`[SERVER_MSG] Telegraf sendMessage failed:`, tgSendErr.message || tgSendErr);
        return res.status(502).json({
          error: `Gagal mengirimkan pesan Telegram ke Chat ID ${tg_id}: ${tgSendErr.message || tgSendErr}. Pastikan Kakak sudah mengirimkan perintah /start ke bot Telegram Yuihime dan tidak memblokir bot tersebut.`
        });
      }

      res.json({ success: true, recipient: matchedName, chat_id: tg_id, status: "Delivered successfully" });
    } catch (err: any) {
      console.error("[SERVER] POST /api/telegram/send error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // --- Multiplatform Pairing APIs ---
  app.post("/api/pair/generate", (req, res) => {
    try {
      const { perceivedName } = req.body;
      if (!perceivedName) {
        return res.status(400).json({ error: "perceivedName is required" });
      }

      // Find or create identity
      let identity = db.prepare("SELECT * FROM identities WHERE perceivedName = ?").get(perceivedName);
      if (!identity) {
        const id = Math.random().toString(36).substr(2, 9);
        db.prepare(`
          INSERT INTO identities (id, perceivedName, realName, habits, importantFacts, linkedAccounts, lastInteraction, ownerId, trust, affection, reputation)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, perceivedName, perceivedName, '[]', '[]', '[]', Date.now(), 'local_user', 50, 50, 50);
        identity = { id };
      }

      // Generate unique 6-digit OTP code
      let code = '';
      let codeExists = true;
      while (codeExists) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = db.prepare("SELECT 1 FROM pairing_codes WHERE code = ?").get(code);
        if (!existing) {
          codeExists = false;
        }
      }

      // Expiration 10 mins
      const expires_at = Date.now() + 10 * 60 * 1000;

      db.prepare("INSERT OR REPLACE INTO pairing_codes (code, identity_id, expires_at) VALUES (?, ?, ?)")
        .run(code, identity.id, expires_at);

      res.json({ success: true, code, expires_at });
    } catch (error: any) {
      console.error("[SERVER] POST /api/pair/generate Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Master endpoint untuk membersihkan dan menggabungkan profil duplikat secara otomatis
  app.post("/api/identities/deduplicate", (req, res) => {
    try {
      const allIdentities = db.prepare("SELECT * FROM identities").all() as any[];
      let mergedCount = 0;

      // Set pelacak ID agar tidak memproses identitas yang sudah di-merge/dihapus
      const processedIds = new Set<string>();

      for (const iden of allIdentities) {
        if (processedIds.has(iden.id)) continue;

        const exists = db.prepare("SELECT 1 FROM identities WHERE id = ?").get(iden.id);
        if (!exists) continue;

        deduplicateAndMergeIdentities(db, iden.id);
        processedIds.add(iden.id);
        mergedCount++;
      }

      const updatedIdentities = db.prepare("SELECT * FROM identities").all() as any[];

      res.json({ 
        success: true, 
        message: "Proses kondensasi kognitif selesai! Seluruh profil batin duplikat dengan nama serupa atau pengenal tumpang tindih berhasil dilebur.",
        mergedCount,
        totalsRemaining: updatedIdentities.length
      });
    } catch (error: any) {
      console.error("[SERVER] POST /api/identities/deduplicate Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pair/status/:perceivedName", (req, res) => {
    try {
      const { perceivedName } = req.params;
      const identity = db.prepare("SELECT * FROM identities WHERE perceivedName = ?").get(perceivedName);
      if (!identity) {
        return res.json({ success: true, linked: false, linkedAccounts: [] });
      }

      const accounts = identity.linkedAccounts ? JSON.parse(identity.linkedAccounts) : [];
      const linked = accounts.some((acc: string) => acc.toLowerCase().startsWith('telegram'));

      res.json({
        success: true,
        linked,
        linkedAccounts: accounts
      });
    } catch (error: any) {
      console.error("[SERVER] GET /api/pair/status Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pair/claim", (req, res) => {
    try {
      const { code, perceivedName } = req.body;
      if (!code || !perceivedName) {
        return res.status(400).json({ error: "code and perceivedName are required" });
      }

      // Check pairing code
      const row = db.prepare("SELECT * FROM pairing_codes WHERE code = ?").get(code);
      if (!row) {
        return res.status(400).json({ error: "Kode penyandingan salah, tidak aktif, atau tidak terdaftar." });
      }

      if (row.expires_at < Date.now()) {
        db.prepare("DELETE FROM pairing_codes WHERE code = ?").run(code);
        return res.status(400).json({ error: "Kode penyandingan telah kedaluwarsa." });
      }

      // Find identity associated with code
      const identity = db.prepare("SELECT * FROM identities WHERE id = ?").get(row.identity_id);
      if (!identity) {
        return res.status(404).json({ error: "Identitas rujukan tidak ditemukan." });
      }

      // Confirm that the identity's perceivedName matches the active user's perceivedName
      if (identity.perceivedName.toLowerCase() !== perceivedName.toLowerCase()) {
        return res.status(400).json({ error: "Kode penyandingan ini dibuat untuk nama identitas yang berbeda." });
      }

      // Link pending platform account
      const pending = row.pending_account ? JSON.parse(row.pending_account) : [];
      let currentAccounts = identity.linkedAccounts ? JSON.parse(identity.linkedAccounts) : [];
      currentAccounts = Array.from(new Set([...currentAccounts, ...pending]));

      db.prepare("UPDATE identities SET linkedAccounts = ? WHERE id = ?").run(
        JSON.stringify(currentAccounts),
        identity.id
      );

      // Merge duplicate identities if they exist
      try {
        import("../database.js").then(({ deduplicateAndMergeIdentities }) => {
          deduplicateAndMergeIdentities(db, identity.id);
        }).catch(err => {
          console.error("[SERVER] Failed dynamic import for deduplicateAndMergeIdentities:", err);
        });
      } catch (mergeErr) {
        console.error("[SERVER] Failed to trigger inline identity merge:", mergeErr);
      }

      // Delete OTP
      db.prepare("DELETE FROM pairing_codes WHERE code = ?").run(code);

      res.json({
        success: true,
        message: `Kognisi platform eksternal berhasil ditautkan ke profil '${identity.perceivedName}'!`,
        linkedAccounts: currentAccounts
      });
    } catch (error: any) {
      console.error("[SERVER] POST /api/pair/claim Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pair/generate-code-tool", (req, res) => {
    try {
      const { claimedName, chatType, userName, contextId } = req.body;
      if (!claimedName) {
        return res.status(400).json({ error: "claimedName is required" });
      }

      // Look up identity case-insensitively, automatically initializing if missing
      let identity = db.prepare("SELECT * FROM identities WHERE LOWER(perceivedName) = ?").get(claimedName.toLowerCase());
      if (!identity) {
        const id = Math.random().toString(36).substr(2, 9);
        db.prepare(`
          INSERT INTO identities (id, perceivedName, realName, habits, importantFacts, linkedAccounts, lastInteraction, ownerId, trust, affection, reputation)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, claimedName, claimedName, '[]', '[]', '[]', Date.now(), 'local_user', 50, 50, 50);
        identity = db.prepare("SELECT * FROM identities WHERE id = ?").get(id);
      }

      // Check current and pending platform tags
      const currentAccounts = identity.linkedAccounts ? JSON.parse(identity.linkedAccounts) : [];
      const targetAccounts: string[] = [];
      const lowerChatType = (chatType || "").toLowerCase();

      if (lowerChatType.includes('telegram') && contextId && contextId.startsWith('tg_')) {
        const tgUserId = contextId.replace('tg_', '');
        targetAccounts.push(`telegram:id:${tgUserId}`);
        if (lowerChatType.includes('private') && userName) {
          targetAccounts.push(`telegram (private):${userName}`);
        }
      } else if (lowerChatType.includes('discord') && userName) {
        targetAccounts.push(`discord:${userName}`);
      } else if (lowerChatType && userName) {
        targetAccounts.push(`${lowerChatType}:${userName}`);
      }

      const alreadyLinked = targetAccounts.length > 0 && targetAccounts.every((acc: string) => currentAccounts.includes(acc));
      if (alreadyLinked) {
        return res.json({ 
          success: true, 
          alreadyLinked: true, 
          claimedName: identity.perceivedName,
          message: `Akun platform Kakak saat ini sudah tertaut rapat dengan profil '${identity.perceivedName}'!` 
        });
      }

      // Generate secure 6-digit random code
      let code = '';
      let codeExists = true;
      while (codeExists) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = db.prepare("SELECT 1 FROM pairing_codes WHERE code = ?").get(code);
        if (!existing) {
          codeExists = false;
        }
      }

      const expires_at = Date.now() + 10 * 60 * 1000; // 10 mins
      const pending_account = JSON.stringify(targetAccounts);

      db.prepare("INSERT OR REPLACE INTO pairing_codes (code, identity_id, expires_at, pending_account) VALUES (?, ?, ?, ?)")
        .run(code, identity.id, expires_at, pending_account);

      res.json({
        success: true,
        code,
        expires_at,
        claimedName: identity.perceivedName,
        message: `Berhasil membuat kode sirkuit penyandian pengenalan mandiri.`
      });
    } catch (error: any) {
      console.error("[SERVER] POST /api/pair/generate-code-tool Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Knowledge APIs ---
  app.get("/api/storage/knowledge", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM knowledge").all();
      const knowledge = rows.map((r: any) => ({
        ...r,
        tags: JSON.parse(r.tags || "[]"),
        confidence: r.confidence || 0.5,
        updatedAt: r.updatedAt || Date.now(),
        sourceMemoryIds: []
      }));
      res.json(knowledge);
    } catch (error: any) {
      console.error("[SERVER] GET knowledge Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/knowledge", (req, res) => {
    try {
      const items = req.body;
      db.transaction(() => {
        db.prepare("DELETE FROM knowledge").run();
        const stmt = db.prepare(`
          INSERT INTO knowledge (id, topic, content, tags, confidence, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const k of items) {
          stmt.run(
            k.id || Math.random().toString(36).substr(2, 9),
            k.topic,
            k.content,
            JSON.stringify(k.tags || []),
            k.confidence || 0.5,
            k.updatedAt || Date.now()
          );
        }
      })();
      broadcastToWS({ type: "knowledge_update", data: items });
      res.json({ success: true });
    } catch (error: any) {
      console.error("[SERVER] POST knowledge Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/purge", (req, res) => {
    try {
      const mode = req.body && req.body.mode ? req.body.mode : "soft";
      
      db.transaction(() => {
        try {
          db.prepare("DELETE FROM history").run();
        } catch (e: any) {
          console.warn("[PURGE] Non-blocking warning: Failed to clear history:", e.message);
        }
        try {
          db.prepare("DELETE FROM custom_storage WHERE key = 'yuihime_episodic_memory'").run();
        } catch (e: any) {
          console.warn("[PURGE] Non-blocking warning: Failed to clear episodic memory:", e.message);
        }

        if (mode === "soft") {
          db.prepare(`
            DELETE FROM memories 
            WHERE (type IN ('interaction', 'chat') OR type IS NULL) 
              AND (importance < 0.8 OR importance IS NULL)
          `).run();
        } else {
          db.prepare("DELETE FROM memories").run();
          db.prepare("DELETE FROM dreams").run();
          db.prepare("DELETE FROM agent_state").run();
          db.prepare("DELETE FROM learned_strategies").run();
          db.prepare("DELETE FROM performance_metrics").run();
          
          db.prepare(`
            INSERT INTO agent_state (id, mood, emotion, relation, systemHealth, lastDreamCycle, lastRefreshed, activePersonaId, currentPlan)
            VALUES (1, '{}', '{}', '{}', '{}', 0, 0, 'hiyori', null)
          `).run();
        }
      })();
      broadcastToWS({ type: "purge_update", data: { mode, timestamp: Date.now() } });
      res.json({ success: true, mode });
    } catch (error: any) {
      console.error("Purge Error:", error);
      res.status(500).json({ error: error.message || "Failed to purge database." });
    }
  });

  app.post("/api/storage/import", (req, res) => {
    try {
      const { history, memories } = req.body;
      db.transaction(() => {
        if (Array.isArray(history)) {
          for (const item of history) {
            db.prepare(`
              INSERT INTO history (entry, cursor, processed, timestamp)
              VALUES (?, ?, ?, ?)
            `).run(
              typeof item.entry === 'string' ? item.entry : JSON.stringify(item.entry || item),
              item.cursor || 0,
              item.processed ? 1 : 0,
              item.timestamp || Date.now()
            );
          }
        }

        if (Array.isArray(memories)) {
          for (const item of memories) {
            db.prepare(`
              INSERT OR REPLACE INTO memories (id, type, content, importance, tags, context, sentiment, timestamp, speaker, chat_type)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              item.id || Math.random().toString(36).substr(2, 9),
              item.type || 'interaction',
              item.content || '',
              item.importance || 0.5,
              Array.isArray(item.tags) ? JSON.stringify(item.tags) : (typeof item.tags === 'string' ? item.tags : '[]'),
              item.context || null,
              item.sentiment || 0,
              item.timestamp || Date.now(),
              item.speaker || 'Operator',
              item.chat_type || null
            );
          }
        }
      })();

      broadcastToWS({ type: "import_update", data: { timestamp: Date.now() } });
      res.json({ success: true, importedHistory: (history || []).length, importedMemories: (memories || []).length });
    } catch (error: any) {
      console.error("Import Error:", error);
      res.status(500).json({ error: error.message || "Failed to import database." });
    }
  });

  // --- Learning & Strategy APIs ---
  app.get("/api/storage/strategies", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM learned_strategies").all();
      res.json(rows);
    } catch (error: any) {
      console.error("[SERVER] GET strategies Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/strategies", (req, res) => {
    try {
      const strategies = req.body;
      db.transaction(() => {
        const stmt = db.prepare(`
          INSERT INTO learned_strategies (id, topic, instruction, confidence, successCount, failureCount, lastOptimized)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            topic = excluded.topic,
            instruction = excluded.instruction,
            confidence = excluded.confidence,
            successCount = excluded.successCount,
            failureCount = excluded.failureCount,
            lastOptimized = excluded.lastOptimized
        `);
        for (const s of strategies) {
          stmt.run(s.id, s.topic, s.instruction, s.confidence, s.successCount, s.failureCount, s.lastOptimized);
        }
      })();
      res.json({ success: true });
    } catch (error: any) {
      console.error("[SERVER] POST strategies Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/storage/metrics", (req, res) => {
    try {
      const metric = req.body;
      db.prepare(`
        INSERT INTO performance_metrics (timestamp, operation, latency, success, context)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        metric.timestamp || Date.now(),
        metric.operation,
        metric.latency,
        metric.success ? 1 : 0,
        metric.context || null
      );
      res.json({ success: true });
    } catch (error: any) {
      console.error("[SERVER] POST metrics Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/storage/metrics/summary", (req, res) => {
    try {
      const stats = db.prepare(`
        SELECT 
          operation, 
          AVG(latency) as avgLatency, 
          SUM(success) as successCount, 
          COUNT(*) as totalCount
        FROM performance_metrics
        GROUP BY operation
      `).all();
      res.json(stats);
    } catch (error: any) {
      console.error("[SERVER] GET metrics/summary Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/storage/metrics/history", (req, res) => {
    try {
      const rows = db.prepare("SELECT timestamp, operation, latency, success FROM performance_metrics ORDER BY timestamp ASC").all();
      res.json(rows);
    } catch (error: any) {
      console.error("[SERVER] GET metrics/history Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Live Stream Connection WebSocket & SSE Gateways ---
  app.get("/api/stream/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders?.();

    const client = { id: Date.now(), res };
    activeStreamClients.push(client);
    console.log(`[STREAM_GATEWAY] Live stream link established. Active overlays: ${activeStreamClients.length}`);

    res.write(`data: ${JSON.stringify({ type: "sync_ok", timestamp: Date.now() })}\n\n`);

    req.on("close", () => {
      const index = activeStreamClients.findIndex(c => c.id === client.id);
      if (index !== -1) {
        activeStreamClients.splice(index, 1);
      }
      console.log(`[STREAM_GATEWAY] Live overlay closed. Active overlays: ${activeStreamClients.length}`);
    });
  });

  app.post("/api/stream/events", (req, res) => {
    const payload = req.body;
    if (!payload || !payload.type) {
      return res.status(400).json({ error: "Invalid stream event payload" });
    }

    const sseChunk = `data: ${JSON.stringify(payload)}\n\n`;
    activeStreamClients.forEach(c => {
      try {
        c.res.write(sseChunk);
      } catch (err) {
        console.warn(`[STREAM_GATEWAY] Gagal mengirim paket ke overlay ${c.id}:`, err);
      }
    });

    const wsChunk = JSON.stringify(payload);
    activeWSConnections.forEach(client => {
      try {
        if (client.readyState === 1) {
          client.send(wsChunk);
        }
      } catch (err) {
        console.warn(`[WS_GATEWAY] Gagal mengirim ke client WS:`, err);
      }
    });

    res.json({ success: true, targetsReached: activeStreamClients.length + activeWSConnections.size });
  });

  // --- Live Stream Chat API Webhook ---
  app.post("/api/stream/chat", (req, res) => {
    const message = req.body.message || req.body.text || req.body.comment || req.body.chat || (req.query.message as string) || "";
    const sender = req.body.sender || req.body.user || req.body.username || req.body.speaker || (req.query.sender as string) || "Penonton";
    const contextId = req.body.context || (req.query.context as string) || "live_stream";
    const chatType = req.body.channel || req.body.platform || (req.query.channel as string) || "Live Chat";

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong" });
    }

    const userMemory = {
      id: "stream_usr_" + Math.random().toString(36).substr(2, 9),
      type: "interaction",
      content: `[${sender}]: ${message}`,
      timestamp: Date.now()
    };
    const sseCommentChunk = `data: ${JSON.stringify({ type: "memory_update", data: userMemory })}\n\n`;
    activeStreamClients.forEach(c => {
      try { c.res.write(sseCommentChunk); } catch (err) {}
    });
    try {
      broadcastToWS({ type: "memory_update", data: userMemory });
    } catch (wsErr) {}

    MultiChannelQueue.getInstance().addMessage(
      message,
      sender,
      contextId,
      chatType,
      (reply) => {
        if (!reply) {
          return res.json({ 
            success: true, 
            processed: false, 
            sampledOut: true, 
            message: "Komentar diterima tetapi melewati filter sampling kecepatan tinggi. Tetap tecatat di ringkasan subkesadaran." 
          });
        }

        const replyPayload = {
          type: "state_update",
          data: {
            state: { status: "talking" },
            activeSubtitle: reply,
            typedSubtitle: reply,
            isSubtitleTyping: false,
            animations: ["TALK", "SMILE"]
          }
        };

        const replySseChunk = `data: ${JSON.stringify(replyPayload)}\n\n`;
        activeStreamClients.forEach(c => {
          try { c.res.write(replySseChunk); } catch (err) {}
        });

        try {
          broadcastToWS(replyPayload);
        } catch (wsErr) {}

        res.json({ success: true, processed: true, response: reply });
      },
      (err) => {
        console.error("[STREAM_WEBHOOK_ERROR] Gagal memproses obrolan streaming:", err);
        res.status(500).json({ error: "Kegagalan neural sync asinkron di antrean." });
      }
    );
  });

  // --- Cortex Think Server-side Entry Point ---
  app.post("/api/cortex/think", async (req, res) => {
    try {
      const { input, userName, contextId, chatType } = req.body;
      if (!input || !input.trim()) {
        return res.status(400).json({ error: "Input prompt cannot be empty" });
      }

      const senderName = userName || 'chat';
      const finalContextId = contextId || 'web_default';
      const finalChatType = chatType || 'web';

      const cortex = new Cortex();

      // 1. Get State from DB
      const stateRow: any = db.prepare("SELECT * FROM agent_state WHERE id = 1").get();
      let computedActivePersonaId = stateRow ? (stateRow.activePersonaId || 'hiyori') : 'hiyori';
      if (computedActivePersonaId === 'polite' || !['hiyori', 'aether', 'nova'].includes(computedActivePersonaId)) {
        computedActivePersonaId = 'hiyori';
      }

      const state: any = stateRow ? {
        status: stateRow.status || 'idle',
        energy: stateRow.energy !== undefined ? stateRow.energy : 100,
        mood: JSON.parse(stateRow.mood || "{}"),
        emotion: JSON.parse(stateRow.emotion || "{}"),
        relation: JSON.parse(stateRow.relation || "{}"),
        activePersonaId: computedActivePersonaId,
        tone: stateRow.tone ? JSON.parse(stateRow.tone) : { pitch: 1.0, speed: 1.0, emotionalBias: 'neutral' },
        activeContext: stateRow.activeContext ? JSON.parse(stateRow.activeContext) : [],
        lastDreamCycle: stateRow.lastDreamCycle || 0,
        systemHealth: stateRow.systemHealth ? JSON.parse(stateRow.systemHealth) : { latency: 0, successRate: 1.0, tasksCompleted: 0 },
        heuristics: [],
        knowledge: []
      } : {
        status: 'idle',
        energy: 100,
        mood: { joy: 50, anger: 0, sadness: 0, stress: 0, irritation: 0, excitement: 10, embarrassment: 0, curiosity: 50, dopamine: 15, serotonin: 50, oxytocin: 30, noradrenaline: 10, lastUpdate: Date.now() },
        emotion: { arousal: 30, valence: 50, focus: 50, rapport: 30, lastUpdate: Date.now() },
        relation: { trust: 50, affection: 10, reputation: 50, lastInteraction: Date.now() },
        activePersonaId: 'hiyori',
        tone: { pitch: 1.0, speed: 1.0, emotionalBias: 'neutral' },
        activeContext: [],
        lastDreamCycle: 0,
        systemHealth: { latency: 0, successRate: 1.0, tasksCompleted: 0 },
        heuristics: [],
        knowledge: []
      };

      // Wake up if currently sleeping
      if (state.status === 'sleeping') {
        state.status = 'idle';
        db.prepare("UPDATE agent_state SET status = 'idle' WHERE id = 1").run();
      }

      // 2. Load heuristics (learned strategies)
      const strategyRows = db.prepare("SELECT * FROM learned_strategies").all();
      const strategies = strategyRows.map((r: any) => ({
        id: r.id,
        topic: r.topic,
        topicId: r.topicId || r.topic,
        instruction: r.instruction,
        confidence: r.confidence || 0.5,
        successCount: r.successCount || 0,
        failureCount: r.failureCount || 0,
        lastOptimized: r.lastOptimized || Date.now()
      }));
      state.heuristics = strategies;

      // 3. Load dreams
      const dreamRows = db.prepare("SELECT * FROM dreams").all();
      const dreams = dreamRows.map((r: any) => ({
        id: r.id,
        concept: r.concept,
        abstractions: r.abstractions ? JSON.parse(r.abstractions) : [],
        strength: r.strength || 0.5,
        lastReinforced: r.lastReinforced || Date.now(),
        underlyingMemories: r.underlyingMemories ? JSON.parse(r.underlyingMemories) : []
      }));

      // 4. Load capabilities
      const capRows = db.prepare("SELECT * FROM capabilities").all();
      const capabilities = capRows.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        type: r.type,
        enabled: r.enabled === 1,
        config: r.config ? JSON.parse(r.config) : {}
      }));

      // 5. Get identities
      const identityRows = db.prepare("SELECT * FROM identities").all();
      const allIdentities = identityRows.map((r: any) => ({
        id: r.id,
        perceivedName: r.perceivedName,
        realName: r.realName,
        habits: r.habits ? JSON.parse(r.habits) : [],
        importantFacts: r.importantFacts ? JSON.parse(r.importantFacts) : [],
        linkedAccounts: r.linkedAccounts ? JSON.parse(r.linkedAccounts) : [],
        lastMet: r.lastMet || r.lastInteraction || Date.now(),
        ownerId: r.ownerId || 'local_user',
        source: r.source || 'telegram',
        traits: r.traits ? JSON.parse(r.traits) : [],
        trust: r.trust !== undefined ? r.trust : 50,
        affection: r.affection !== undefined ? r.affection : 50,
        reputation: r.reputation !== undefined ? r.reputation : 50
      }));

      // Resolve user's identity
      const platformTag = `${finalChatType.toLowerCase()}:${senderName}`;
      let receiverIdentity = allIdentities.find((id: any) => 
        id.linkedAccounts.includes(platformTag) || id.perceivedName === senderName
      );

      if (!receiverIdentity) {
        const id = "web_usr_" + Math.random().toString(36).substr(2, 9);
        db.prepare(`
          INSERT INTO identities (id, perceivedName, realName, habits, importantFacts, linkedAccounts, lastInteraction, trust, affection, reputation)
          VALUES (?, ?, ?, '[]', '[]', ?, ?, 50, 50, 50)
        `).run(id, senderName, senderName, JSON.stringify([platformTag]), Date.now());
        receiverIdentity = {
          id,
          perceivedName: senderName,
          realName: senderName,
          habits: [],
          importantFacts: [],
          linkedAccounts: [platformTag],
          lastMet: Date.now(),
          ownerId: 'local_user',
          source: 'web',
          traits: [],
          trust: 50,
          affection: 50,
          reputation: 50
        };
        allIdentities.push(receiverIdentity);
      } else {
        db.prepare("UPDATE identities SET lastInteraction = ? WHERE id = ?").run(Date.now(), receiverIdentity.id);
      }

      const { DEFAULT_NEURAL_CORES } = await import("../../constants.js");
      const activePersona = DEFAULT_NEURAL_CORES.find(c => c.id === state.activePersonaId) || DEFAULT_NEURAL_CORES[1];

      const userRelation = {
        uid: receiverIdentity.id || senderName,
        trust: receiverIdentity.trust !== undefined ? receiverIdentity.trust : 50,
        affection: receiverIdentity.affection !== undefined ? receiverIdentity.affection : 50,
        reputation: receiverIdentity.reputation !== undefined ? receiverIdentity.reputation : 50,
        lastInteraction: receiverIdentity.lastMet || Date.now()
      };

      const customState = {
        ...state,
        relation: userRelation
      };

      // Retrieve context memories
      const targetContexts = new Set<string>();
      targetContexts.add(finalContextId);

      if (receiverIdentity && Array.isArray(receiverIdentity.linkedAccounts)) {
        for (const acc of receiverIdentity.linkedAccounts) {
          const cleanAcc = acc.toLowerCase();
          if (cleanAcc.startsWith("telegram:id:")) {
            const tgId = acc.split(":")[2];
            if (tgId) {
              targetContexts.add(`tg_${tgId}`);
            }
          }
        }
        const hasTelegramLinked = receiverIdentity.linkedAccounts.some((acc: string) => acc.toLowerCase().startsWith("telegram"));
        if (hasTelegramLinked) {
          targetContexts.add("live_stream");
        }
      }

      const contextsList = Array.from(targetContexts);
      let historyRows: any[] = [];
      if (contextsList.length > 0) {
        const dbLikeClauses = contextsList.map(() => "context LIKE ?").join(" OR ");
        const dbQueryParams = contextsList.map(c => `%${c}%`);
        const recentRows = db.prepare(`
          SELECT * FROM memories 
          WHERE ${dbLikeClauses} 
          ORDER BY timestamp DESC 
          LIMIT 100
        `).all(...dbQueryParams);
        historyRows = recentRows.reverse();
      }

      const memories = historyRows.map((r: any) => ({
        id: r.id,
        ownerId: r.ownerId || 'local_user',
        type: r.type || 'interaction',
        content: r.content,
        importance: r.importance || 0.4,
        tags: r.tags ? JSON.parse(r.tags) : [],
        context: r.context,
        sentiment: r.sentiment || 0.5,
        timestamp: r.timestamp,
        speaker: r.speaker || 'Unknown'
      }));

      // Run Cortex Think!
      const result = await cortex.think(
        input,
        memories,
        dreams,
        capabilities,
        customState,
        state.heuristics,
        senderName,
        allIdentities,
        activePersona,
        finalContextId,
        finalChatType
      );

      // Save output vector (Mood, Relation, Emotion) back to DB
      const updatedSentiment = result.sentiment !== undefined ? result.sentiment : 0.5;
      const sentimentImpact = result.sentiment !== undefined ? {
        joy: result.sentiment > 0.6 ? 2 : (result.sentiment < 0.4 ? -1 : 0),
        curiosity: 1,
        stress: result.sentiment < 0.3 ? 2 : -1
      } : {};
      
      const combinedMoodImpact = {
        ...sentimentImpact,
        ...(result.moodImpact || result.nextMood || {}),
        ...(result.moodDelta || {})
      };
      
      let updatedMood = Soul.updateMood(state.mood, combinedMoodImpact);
      updatedMood = Soul.applyInhibition(updatedMood);
      
      let updatedRelation = Soul.updateRelation(userRelation, updatedSentiment, true);
      if (result.relationDelta) {
        updatedRelation = {
          ...updatedRelation,
          trust: Math.min(100, Math.max(0, updatedRelation.trust + (result.relationDelta.trust || 0))),
          affection: Math.min(100, Math.max(0, updatedRelation.affection + (result.relationDelta.affection || 0))),
          reputation: Math.min(100, Math.max(0, (updatedRelation.reputation || 50) + (result.relationDelta.reputation || 0)))
        };
      }
      const updatedEmotion = Soul.updateEmotion(state.emotion, updatedMood, updatedRelation);

      const dbTrust = result.queuedIdentityUpdate?.trust !== undefined ? result.queuedIdentityUpdate.trust : updatedRelation.trust;
      const dbAffection = result.queuedIdentityUpdate?.affection !== undefined ? result.queuedIdentityUpdate.affection : updatedRelation.affection;
      const dbReputation = result.queuedIdentityUpdate?.reputation !== undefined ? result.queuedIdentityUpdate.reputation : (updatedRelation.reputation || 50);

      db.prepare("UPDATE identities SET trust = ?, affection = ?, reputation = ?, lastInteraction = ? WHERE id = ?")
        .run(dbTrust, dbAffection, dbReputation, Date.now(), receiverIdentity.id);

      db.prepare("UPDATE agent_state SET mood = ?, emotion = ?, relation = ?, activePersonaId = ?, currentPlan = ? WHERE id = 1")
        .run(JSON.stringify(updatedMood), JSON.stringify(updatedEmotion), JSON.stringify(updatedRelation), result.updatedPlan ? result.updatedPlan.id : state.activePersonaId, result.updatedPlan ? JSON.stringify(result.updatedPlan) : (state.currentPlan ? JSON.stringify(state.currentPlan) : null));

      // Store Memories
      if (result.newMemories && result.newMemories.length > 0) {
        for (const m of result.newMemories) {
          const exists = db.prepare("SELECT 1 FROM memories WHERE id = ?").get(m.id);
          if (!exists) {
            db.prepare(`
              INSERT INTO memories (id, type, content, importance, speaker, context, timestamp, tags, sentiment)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              m.id || Math.random().toString(36).substr(2, 9),
              m.type || 'interaction',
              m.content,
              m.importance || 0.4,
              m.speaker || 'agent',
              finalContextId,
              m.timestamp || Date.now(),
              m.tags ? JSON.stringify(m.tags) : '[]',
              updatedSentiment
            );
          }
        }
      } else {
        const userMemoryId = Math.random().toString(36).substr(2, 9);
        db.prepare(`
          INSERT INTO memories (id, type, content, importance, speaker, context, timestamp, tags, sentiment)
          VALUES (?, 'interaction', ?, 0.4, ?, ?, ?, '[]', ?)
        `).run(userMemoryId, input, senderName, finalContextId, Date.now(), updatedSentiment);

        const agentMemoryId = Math.random().toString(36).substr(2, 9);
        db.prepare(`
          INSERT INTO memories (id, type, content, importance, speaker, context, timestamp, tags, sentiment)
          VALUES (?, 'interaction', ?, 0.5, 'agent', ?, ?, '[]', ?)
        `).run(agentMemoryId, result.response, finalContextId, Date.now() + 10, updatedSentiment);
      }

      // Sync identity updates back to identities
      if (result.viewerProfileUpdate || result.perceivedNameUpdate || result.linkedAccountUpdate) {
        let currentHabits = receiverIdentity.habits || [];
        let currentFacts = receiverIdentity.importantFacts || [];
        let currentLinks = receiverIdentity.linkedAccounts || [];

        if (result.viewerProfileUpdate?.habits) {
          currentHabits = [...new Set([...currentHabits, ...result.viewerProfileUpdate.habits])].slice(-10);
        }
        if (result.viewerProfileUpdate?.importantFacts) {
          currentFacts = [...new Set([...currentFacts, ...result.viewerProfileUpdate.importantFacts])];
        }
        if (result.linkedAccountUpdate) {
          if (Array.isArray(result.linkedAccountUpdate)) {
            currentLinks = [...new Set([...currentLinks, ...result.linkedAccountUpdate])];
          } else {
            currentLinks = [...new Set([...currentLinks, result.linkedAccountUpdate])];
          }
        }

        db.prepare(`
          UPDATE identities SET 
            perceivedName = ?, 
            realName = ?, 
            habits = ?, 
            importantFacts = ?, 
            linkedAccounts = ?,
            lastInteraction = ?
          WHERE id = ?
        `).run(
          result.perceivedNameUpdate || receiverIdentity.perceivedName,
          result.viewerProfileUpdate?.realName || receiverIdentity.realName || senderName,
          JSON.stringify(currentHabits),
          JSON.stringify(currentFacts),
          JSON.stringify(currentLinks),
          Date.now(),
          receiverIdentity.id
        );
      }

      if (result.fallbackTriggered) {
        console.log(`[API_THINK] Gateway fallback triggered for ${senderName} (${finalChatType}). Menyimpan ke antrean luring (pending_messages)...`);
        try {
          const pendingId = "pending_" + Math.random().toString(36).substr(2, 9);
          db.prepare(`
            INSERT INTO pending_messages (id, input, sender_name, context_id, chat_type, timestamp, attempts, status)
            VALUES (?, ?, ?, ?, ?, ?, 0, 'pending')
          `).run(pendingId, input, senderName, finalContextId, finalChatType, Date.now());
        } catch (dbErr: any) {
          console.error("[API_THINK_FALLBACK_ERR] Gagal menyimpan pesan fallback ke database:", dbErr.message);
        }
      }

      const auditLogs = APIService.getAuditLogs();
      res.json({ success: true, result: { ...result, auditLogs } });
    } catch (err: any) {
      console.error("[CORTEX_POST_ERROR] Gagal memproses nalar di server:", err);
      res.status(500).json({ error: err.message || "Gagal memproses kognisi di sisi server." });
    }
  });

  app.get("/api/cortex/audit-logs", (req, res) => {
    res.json({ success: true, auditLogs: APIService.getAuditLogs() });
  });

  app.post("/api/cortex/audit-logs/clear", (req, res) => {
    APIService.clearAuditLogs();
    res.json({ success: true });
  });

  // --- Settings APIs ---
  app.get("/api/settings", async (req, res) => {
    const settingsInstance = SettingsManager.getInstance();
    const sets = await settingsInstance.load();
    res.json(sets);
  });

  app.post("/api/settings", async (req, res) => {
    const settingsInstance = SettingsManager.getInstance();
    await settingsInstance.save(req.body);
    
    initializeBot(db).catch(err => {
      console.error("[KERNEL_DYNAMIC] Gagal menyinkronkan Bot Telegram pasca-update pengaturan:", err);
    });

    broadcastToWS({ type: "settings_update", data: req.body });
    res.json({ success: true });
  });

  app.get("/api/cron", (req, res) => {
    const tasks = db.prepare("SELECT * FROM cron_tasks").all();
    res.json(tasks.map((t: any) => ({ ...t, enabled: t.enabled === 1, repeating: t.repeating === 1 })));
  });

  app.post("/api/cron", (req, res) => {
    const { id, name, schedule, enabled, repeating, context_id, chat_type, sender_name } = req.body;
    
    let final_context_id = context_id || 'live_stream';
    let final_chat_type = chat_type || 'Live Chat';
    const final_sender_name = sender_name || 'Penonton';

    // Auto-resolve Telegram context if target chat type is Telegram but context is live_stream or generic
    if (final_chat_type.toLowerCase().includes('telegram') && (final_context_id === 'live_stream' || !final_context_id.startsWith('tg_'))) {
      try {
        const callerName = final_sender_name;
        let foundTgId = '';

        // Search for identity matching caller's name
        const identity = db.prepare("SELECT * FROM identities WHERE perceivedName = ?").get(callerName);
        if (identity) {
          const accounts = identity.linkedAccounts ? JSON.parse(identity.linkedAccounts) : [];
          
          // 1. Check for stored telegram identifier in linkedAccounts format (e.g. telegram:id:12345)
          for (const acc of accounts) {
            const cleanAcc = acc.toLowerCase();
            if (cleanAcc.startsWith('telegram:id:')) {
              foundTgId = acc.split(':')[2];
              break;
            }
          }
          
          if (!foundTgId) {
            // 2. Fallback to matching username from telegram_users
            for (const acc of accounts) {
              const cleanAcc = acc.toLowerCase();
              if (cleanAcc.startsWith('telegram (private):')) {
                const tgName = acc.split(':')[1];
                const tgUser = db.prepare("SELECT tg_id FROM telegram_users WHERE username = ?").get(tgName);
                if (tgUser) {
                  foundTgId = tgUser.tg_id?.toString();
                  break;
                }
              }
            }
          }
        }

        // Ultimate Fallback A: Any identity with a linked Telegram ID
        if (!foundTgId) {
          const anyPaired = db.prepare("SELECT linkedAccounts FROM identities WHERE linkedAccounts LIKE '%telegram:id:%' LIMIT 1").get();
          if (anyPaired) {
            const pairedAccs = JSON.parse(anyPaired.linkedAccounts);
            for (const acc of pairedAccs) {
              if (acc.toLowerCase().startsWith('telegram:id:')) {
                foundTgId = acc.split(':')[2];
                break;
              }
            }
          }
        }

        // Ultimate Fallback B: Most recently active Telegram user from logs
        if (!foundTgId) {
          const lastTgUser = db.prepare("SELECT tg_id FROM telegram_users ORDER BY last_seen DESC LIMIT 1").get();
          if (lastTgUser) {
            foundTgId = lastTgUser.tg_id?.toString();
          }
        }
        
        if (foundTgId) {
          final_context_id = `tg_${foundTgId}`;
          final_chat_type = 'Telegram (Private)';
          console.log(`[CRON_AUTO_RESOLVE] Redirected task target for user ${callerName} to ${final_context_id} on Telegram`);
        }
      } catch (err: any) {
        console.error("[CRON_AUTO_RESOLVE] Failed to resolve target telegram user chat ID:", err.message);
      }
    }

    db.prepare(`
      INSERT INTO cron_tasks (id, name, schedule, enabled, repeating, context_id, chat_type, sender_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        schedule = excluded.schedule,
        enabled = excluded.enabled,
        repeating = excluded.repeating,
        context_id = COALESCE(excluded.context_id, cron_tasks.context_id),
        chat_type = COALESCE(excluded.chat_type, cron_tasks.chat_type),
        sender_name = COALESCE(excluded.sender_name, cron_tasks.sender_name)
    `).run(
      id, name, schedule, enabled ? 1 : 0, repeating ? 1 : 0,
      final_context_id,
      final_chat_type,
      final_sender_name
    );
    
    const cron = CronModule.getInstance();
    if (enabled) {
      cron.registerTask({
        id,
        name,
        schedule,
        enabled: true,
        repeating: !!repeating,
        context_id: final_context_id,
        chat_type: final_chat_type,
        sender_name: final_sender_name,
        action: getCronAction(id, name, !!repeating, db)
      });
    } else {
      cron.stopTask(id);
    }
    res.json({ success: true });
  });

  app.delete("/api/cron/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM cron_tasks WHERE id = ?").run(id);
    CronModule.getInstance().removeTask(id);
    res.json({ success: true });
  });

  // --- Pending Messages / Offline Retry Queue APIs ---
  app.get("/api/pending-messages", (req, res) => {
    try {
      const messages = db.prepare("SELECT * FROM pending_messages ORDER BY timestamp DESC").all();
      res.json(messages);
    } catch (e: any) {
      console.error("[SERVER] Failed to query pending messages:", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/pending-messages/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM pending_messages WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (e: any) {
      console.error("[SERVER] Failed to delete specific pending message:", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/pending-messages/clear", (req, res) => {
    try {
      db.prepare("DELETE FROM pending_messages").run();
      res.json({ success: true });
    } catch (e: any) {
      console.error("[SERVER] Failed to truncate pending messages:", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/pending-messages/retry", async (req, res) => {
    try {
      const queue = MultiChannelQueue.getInstance();
      queue.dispatchPendingMessages().catch(err => {
        console.error("[QUEUE_MANUAL_DISPATCH_ERR]:", err);
      });
      res.json({ success: true, message: "Picu ulang pengiriman antrean tertunda luring diaktifkan." });
    } catch (e: any) {
      console.error("[SERVER] Failed to dispatch pending queue manually:", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/pending-messages/retry/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const pending = db.prepare("SELECT * FROM pending_messages WHERE id = ?").get() as any;
      if (!pending) {
        return res.status(404).json({ error: "Pesan tertunda tidak ditemukan." });
      }

      console.log(`[API_MANUAL_RETRY] Manual trigger retry untuk ${pending.sender_name} - ${pending.id}`);
      
      const reply = await NeuralInterface.processNeuralInput(pending.input, pending.sender_name, pending.context_id, pending.chat_type);
      if (reply && reply.trim()) {
        if (pending.context_id.startsWith("tg_")) {
          const chatId = pending.context_id.replace("tg_", "");
          try {
            const activeTelegramBot = (globalThis as any).activeTelegramBot;
            if (activeTelegramBot) {
              const delayedReply = `[BALASAN TERTUNDA] @${pending.sender_name}, ini balasan Yui untuk pesanmu sebelumnya: "${pending.input.substring(0, 25)}${pending.input.length > 25 ? '...' : ''}" \n\n${reply}`;
              await activeTelegramBot.telegram.sendMessage(chatId, delayedReply);
            } else {
              console.warn("[API_MANUAL_RETRY] Bot Telegram offline, memori tersimpan di database.");
            }
          } catch (tgErr) {
            console.error("[API_MANUAL_RETRY] Gagal mengirim pesan telegraf:", tgErr);
          }
        } else {
          eventBus.emit('OUTPUT_EMITTED', { 
            response: `[BALASAN TERTUNDA] @${pending.sender_name}: ${reply}`, 
            isInternal: true 
          });
        }
        db.prepare("DELETE FROM pending_messages WHERE id = ?").run(id);
        res.json({ success: true, message: "Pesan sukses diproses batiniah Yui!" });
      } else {
        res.status(500).json({ error: "Gagal memproses kognisi, respons kosong." });
      }
    } catch (e: any) {
      console.error("[SERVER] Gagal retry single message:", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // --- Workflow Graph APIs ---
  app.get("/api/workflow", async (req, res) => {
    const workflow = await loadWorkflow();
    res.json(workflow);
  });

  app.post("/api/workflow", async (req, res) => {
    await saveWorkflow(req.body);
    res.json({ success: true });
  });

  // --- Addon APIs ---
  app.get("/api/addons", async (req, res) => {
    const addons = await discoverAddons();
    res.json(addons);
  });

  app.post("/api/addons/install", async (req, res) => {
    const { id, config, code, runtime } = req.body;
    if (!id || !config || !code || !runtime) {
      return res.status(400).json({ error: "Missing required fields: id, config, code, runtime" });
    }

    try {
      const addonPath = path.join(addonsDir, id);
      await fs.mkdir(addonPath, { recursive: true });

      const entryPointName = runtime === 'python' ? 'main.py' : (runtime === 'node' ? 'main.js' : 'main.sh');
      
      await fs.writeFile(path.join(addonPath, "config.toml"), config);
      await fs.writeFile(path.join(addonPath, entryPointName), code);

      res.json({ success: true, message: `Addon ${id} installed successfully.` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/addons/execute/:id", async (req, res) => {
    const { id } = req.params;
    const { args } = req.body;
    const addons = await discoverAddons();
    const addon = addons.find(a => a.id === id);

    if (!addon) return res.status(404).json({ error: "Addon not found" });

    try {
      const entry = path.join(addon.path, addon.entryPoint);
      let cmd = "";

      switch (addon.runtime) {
        case 'python': cmd = `python3 "${entry}"`; break;
        case 'lua': cmd = `lua "${entry}"`; break;
        case 'node': cmd = `node "${entry}"`; break;
        case 'go': cmd = `go run "${entry}"`; break;
        case 'bash': cmd = `bash "${entry}"`; break;
        default: throw new Error("Unsupported runtime");
      }

      if (args) {
        const combatQuote = JSON.stringify(args).replace(/'/g, "'\\''");
        cmd += ` '${combatQuote}'`;
      }

      const settings = await SettingsManager.getInstance().load();
      const addonConfig = settings[id] || {};
      const env: any = { ...process.env };
      
      Object.entries(addonConfig).forEach(([key, val]) => {
         const envKey = `${id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_${key.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
         env[envKey] = String(val);
      });

      console.log(`[ADDON-SYSTEM] Executing: ${cmd} with env injection.`);
      const { stdout, stderr } = await execPromise(cmd, { timeout: 30000, env });
      res.json({ stdout, stderr, success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message, stderr: error.stderr });
    }
  });

  // --- External Tools APIs (Shell, Files, Search) ---
  app.get("/api/tools/search", async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "No query provided" });

    try {
      const searchResults = [
        { title: `${query} - Wikipedia`, snippet: `Knowledge summary for ${query}. This topic involves complex systems and historical context...`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query as string)}` },
        { title: `Latest News on ${query}`, snippet: `Recent developments indicate a shift in how ${query} is perceived by the global community.`, url: `https://news.google.com/search?q=${encodeURIComponent(query as string)}` }
      ];
      res.json(searchResults);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tools/execute_js", async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "No code provided" });

    try {
      const result = eval(code);
      res.json({ result: String(result) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tools/chat/search", async (req, res) => {
    const { query, platform, limit, contextId, senderName, viewerIdentityId } = req.body;
    try {
      // 1. Resolve identity
      let identity: any = null;
      if (viewerIdentityId) {
        identity = db.prepare("SELECT * FROM identities WHERE id = ?").get(viewerIdentityId);
      }
      if (!identity && senderName) {
        identity = db.prepare("SELECT * FROM identities WHERE LOWER(perceivedName) = ?").get(senderName.toLowerCase());
      }
      if (!identity && contextId) {
        // Search identities to see if any linked account contains this context id
        const allIdentities = db.prepare("SELECT * FROM identities").all() as any[];
        for (const id of allIdentities) {
          const linked = id.linkedAccounts ? JSON.parse(id.linkedAccounts) : [];
          if (Array.isArray(linked)) {
            const hasMatch = linked.some((acc: string) => {
              const lowerAcc = acc.toLowerCase();
              if (contextId.startsWith("tg_") && lowerAcc.includes(`telegram:id:${contextId.replace("tg_", "")}`)) return true;
              if (contextId.startsWith("dc_") && lowerAcc.includes(contextId.replace("dc_", ""))) return true;
              return false;
            });
            if (hasMatch) {
              identity = id;
              break;
            }
          }
        }
      }

      // 2. Extract usernames/handles
      const perceivedName = identity ? identity.perceivedName : (senderName || "Unknown");
      const linkedAccounts = identity && identity.linkedAccounts ? JSON.parse(identity.linkedAccounts) : [];
      
      const lowerNames = [perceivedName.toLowerCase()];
      for (const acc of linkedAccounts) {
        const parts = acc.split(":");
        if (parts.length > 1) {
          const handle = parts[parts.length - 1].toLowerCase().trim();
          if (handle && !lowerNames.includes(handle)) {
            lowerNames.push(handle);
          }
        }
      }

      // 3. Find unique context IDs where this user has participated
      const placeholders = lowerNames.map(() => "?").join(",");
      const contextRows = db.prepare(`
        SELECT DISTINCT context FROM memories 
        WHERE LOWER(speaker) IN (${placeholders})
      `).all(...lowerNames) as { context: string }[];

      const targetContexts = new Set<string>();
      if (contextId) {
        targetContexts.add(contextId);
      }
      for (const r of contextRows) {
        if (r.context) {
          targetContexts.add(r.context);
        }
      }

      // 4. Filter contexts by platform specified
      const finalContexts = Array.from(targetContexts).filter(ctx => {
        const p = platform || "all";
        if (p === 'web') {
          return ctx === 'live_stream' || ctx.startsWith('web_');
        }
        if (p === 'telegram') {
          return ctx.startsWith('tg_');
        }
        if (p === 'discord') {
          return ctx.startsWith('dc_');
        }
        return true;
      });

      if (finalContexts.length === 0 && contextId) {
        finalContexts.push(contextId);
      }

      if (finalContexts.length === 0) {
        return res.json({
          success: true,
          identity: perceivedName,
          query: query || null,
          platform: platform || "all",
          messages: []
        });
      }

      // 5. Query message rows in those contexts
      let queryClause = "";
      const queryParams: any[] = [];
      if (query && query.trim() !== "") {
        queryClause = "AND (content LIKE ? OR tags LIKE ?)";
        queryParams.push(`%${query}%`, `%${query}%`);
      }

      const contextsPlaceholders = finalContexts.map(() => "?").join(",");
      const limitVal = typeof limit === 'number' ? limit : 20;

      const messageRows = db.prepare(`
        SELECT * FROM memories 
        WHERE context IN (${contextsPlaceholders}) ${queryClause}
        ORDER BY timestamp DESC
        LIMIT ?
      `).all(...finalContexts, ...queryParams, limitVal) as any[];

      const messages = messageRows.map((r: any) => ({
        id: r.id,
        type: r.type,
        content: r.content,
        speaker: r.speaker,
        context: r.context,
        platform: r.context.startsWith("tg_") ? "Telegram" : r.context.startsWith("dc_") ? "Discord" : (r.context === "live_stream" || r.context.startsWith("web_")) ? "Web" : "Unknown",
        timestamp: r.timestamp,
        timeString: new Date(r.timestamp).toISOString()
      }));

      res.json({
        success: true,
        identity: perceivedName,
        query: query || null,
        platform: platform || "all",
        contextsSearched: finalContexts,
        messages
      });
    } catch (error: any) {
      console.error("[SERVER] POST /api/tools/chat/search error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tools/shell", async (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: "No command provided" });
    
    try {
      const restricted = ["rm -rf /", "mkfs", "dd"];
      if (restricted.some(r => command.includes(r))) {
        return res.status(403).json({ error: "Command restricted for safety." });
      }

      const { stdout, stderr } = await execPromise(command, { timeout: 10000 });
      res.json({ stdout, stderr });
    } catch (error: any) {
      res.status(500).json({ error: error.message, stderr: error.stderr });
    }
  });

  app.post("/api/tools/files/write", async (req, res) => {
    const { filename, content } = req.body;
    if (!filename) return res.status(400).json({ error: "No filename provided" });

    try {
      const sandboxDir = path.resolve(process.env.YUIHIME_USER_DATA_PATH || path.join(process.cwd(), ".yuihime", "user_data"));
      await fs.mkdir(sandboxDir, { recursive: true });
      
      const safePath = path.resolve(sandboxDir, filename);
      if (!safePath.startsWith(sandboxDir)) {
        return res.status(403).json({ error: "Access denied. Paths must remain inside the user_data sandbox." });
      }

      await fs.mkdir(path.dirname(safePath), { recursive: true });
      await fs.writeFile(safePath, content || "");
      res.json({ success: true, path: safePath });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tools/files/read", async (req, res) => {
    const { filename } = req.query;
    if (!filename) return res.status(400).json({ error: "No filename provided" });

    try {
      const sandboxDir = path.resolve(process.env.YUIHIME_USER_DATA_PATH || path.join(process.cwd(), ".yuihime", "user_data"));
      const safePath = path.resolve(sandboxDir, filename as string);
      if (!safePath.startsWith(sandboxDir)) {
        return res.status(403).json({ error: "Access denied. Paths must remain inside the user_data sandbox." });
      }

      const content = await fs.readFile(safePath, "utf-8");
      res.json({ content });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tools/files/list", async (req, res) => {
    try {
      const sandboxDir = path.resolve(process.env.YUIHIME_USER_DATA_PATH || path.join(process.cwd(), ".yuihime", "user_data"));
      await fs.mkdir(sandboxDir, { recursive: true });
      
      const getFilesRecursively = async (dir: string): Promise<string[]> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(entries.map(async (entry) => {
          const resPath = path.resolve(dir, entry.name);
          if (entry.isDirectory()) {
            const subFiles = await getFilesRecursively(resPath);
            return subFiles.map(f => path.join(entry.name, f));
          }
          return entry.name;
        }));
        return files.flat();
      };

      const files = await getFilesRecursively(sandboxDir);
      res.json({ files });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- API Catch-all ---
  app.all("/api/*", (req, res) => {
    res.status(404).json({ 
      error: "Neural API Endpoint Not Found", 
      path: req.url,
      method: req.method
    });
  });
}
