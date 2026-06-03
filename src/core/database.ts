import Database from "better-sqlite3";
import path from "path";
import { existsSync, renameSync } from "fs";

const defaultDataDir = process.env.YUIHIME_DATA_DIR || path.join(process.cwd(), ".yuihime", "data");
export let dbPath = process.env.YUIHIME_DB_PATH || path.join(defaultDataDir, "yuihime.db");

let cachedDb: any = null;

export function initializeDatabase() {
  if (cachedDb) return cachedDb;
  try {
    const db = new Database(dbPath, { timeout: 10000 });
    db.pragma('journal_mode = WAL');
    cachedDb = db;
    return db;
  } catch (error) {
    console.error("CRITICAL: Database initialization failed. Attempting recovery...", error);
    
    try {
      if (existsSync(dbPath)) {
        const backupPath = `${dbPath}.backup.${Date.now()}`;
        renameSync(dbPath, backupPath);
        console.log(`Successfully backed up corrupted database to ${backupPath}`);
      }
      
      const db = new Database(dbPath, { timeout: 10000 });
      db.pragma('journal_mode = WAL');
      cachedDb = db;
      return db;
    } catch (recoveryError) {
      console.error("FATAL: Database recovery failed.", recoveryError);
      throw recoveryError;
    }
  }
}

export function setupSchema(db: any) {
  const tables = {
    memories: `
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        type TEXT,
        content TEXT,
        importance REAL,
        tags TEXT,
        context TEXT,
        sentiment REAL,
        timestamp INTEGER,
        speaker TEXT,
        chat_type TEXT
      );
    `,
    dreams: `
      CREATE TABLE IF NOT EXISTS dreams (
        id TEXT PRIMARY KEY,
        concept TEXT,
        abstractions TEXT,
        strength REAL,
        lastReinforced INTEGER,
        underlyingMemories TEXT
      );
    `,
    agent_state: `
      CREATE TABLE IF NOT EXISTS agent_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        status TEXT DEFAULT 'idle',
        mood TEXT,
        emotion TEXT,
        relation TEXT,
        systemHealth TEXT,
        lastDreamCycle INTEGER,
        lastRefreshed INTEGER,
        activePersonaId TEXT,
        currentPlan TEXT,
        aiConfig TEXT,
        avatarConfig TEXT
      );
    `,
    knowledge: `
      CREATE TABLE IF NOT EXISTS knowledge (
        id TEXT PRIMARY KEY,
        topic TEXT,
        content TEXT,
        tags TEXT,
        confidence REAL,
        updatedAt INTEGER
      );
    `,
    knowledge_files: `
      CREATE TABLE IF NOT EXISTS knowledge_files (
        name TEXT PRIMARY KEY,
        content TEXT,
        updatedAt INTEGER
      );
    `,
    history: `
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry TEXT,
        cursor INTEGER,
        processed INTEGER DEFAULT 0,
        timestamp INTEGER
      );
    `,
    capabilities: `
      CREATE TABLE IF NOT EXISTS capabilities (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        type TEXT,
        enabled INTEGER,
        config TEXT
      );
    `,
    custom_storage: `
      CREATE TABLE IF NOT EXISTS custom_storage (
        key TEXT PRIMARY KEY,
        value TEXT,
        updatedAt INTEGER
      );
    `,
    learned_strategies: `
      CREATE TABLE IF NOT EXISTS learned_strategies (
        id TEXT PRIMARY KEY,
        topic TEXT,
        instruction TEXT,
        confidence REAL,
        successCount INTEGER,
        failureCount INTEGER,
        lastOptimized INTEGER
      );
    `,
    performance_metrics: `
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER,
        operation TEXT,
        latency REAL,
        success INTEGER,
        context TEXT
      );
    `,
    telegram_users: `
      CREATE TABLE IF NOT EXISTS telegram_users (
        tg_id INTEGER PRIMARY KEY,
        username TEXT,
        context TEXT,
        last_seen INTEGER
      );
    `,
    identities: `
      CREATE TABLE IF NOT EXISTS identities (
        id TEXT PRIMARY KEY,
        perceivedName TEXT,
        realName TEXT,
        habits TEXT,
        importantFacts TEXT,
        linkedAccounts TEXT,
        lastInteraction INTEGER,
        ownerId TEXT,
        trust INTEGER DEFAULT 50,
        affection INTEGER DEFAULT 50,
        reputation INTEGER DEFAULT 50
      );
    `,
    cron_tasks: `
      CREATE TABLE IF NOT EXISTS cron_tasks (
        id TEXT PRIMARY KEY,
        name TEXT,
        schedule TEXT,
        action TEXT,
        enabled INTEGER,
        repeating INTEGER DEFAULT 0,
        lastRun INTEGER,
        nextRun INTEGER,
        context_id TEXT,
        chat_type TEXT,
        sender_name TEXT
      );
    `,
    pending_messages: `
      CREATE TABLE IF NOT EXISTS pending_messages (
        id TEXT PRIMARY KEY,
        input TEXT,
        sender_name TEXT,
        context_id TEXT,
        chat_type TEXT,
        timestamp INTEGER,
        attempts INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending'
      );
    `,
    pairing_codes: `
      CREATE TABLE IF NOT EXISTS pairing_codes (
        code TEXT PRIMARY KEY,
        identity_id TEXT,
        expires_at INTEGER,
        pending_account TEXT
      );
    `
  };

  for (const [tableName, ddl] of Object.entries(tables)) {
    try {
      db.exec(ddl);
    } catch (e: any) {
      console.error(`ERROR: Failed to create table "${tableName}":`, e.message);
    }
  }

  // Schema Migration
  const migrationTables = ['agent_state', 'knowledge', 'cron_tasks', 'identities', 'pairing_codes', 'memories'];
  for (const table of migrationTables) {
    try {
      const columns = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
      const columnNames = columns.map(c => c.name);
      
      if (table === 'memories') {
        const alterCols = [
          { name: 'chat_type', type: 'TEXT' }
        ];
        for (const col of alterCols) {
          if (!columnNames.includes(col.name)) {
            try {
              db.prepare(`ALTER TABLE memories ADD COLUMN ${col.name} ${col.type}`).run();
            } catch (alterError: any) {
              console.warn(`Migration warn: failed to alter memories and add ${col.name}:`, alterError.message);
            }
          }
        }
      }
      if (table === 'agent_state') {
        const alterCols = [
          { name: 'status', type: "TEXT DEFAULT 'idle'" },
          { name: 'emotion', type: 'TEXT' },
          { name: 'activePersonaId', type: 'TEXT' },
          { name: 'currentPlan', type: 'TEXT' },
          { name: 'aiConfig', type: 'TEXT' },
          { name: 'avatarConfig', type: 'TEXT' }
        ];
        for (const col of alterCols) {
          if (!columnNames.includes(col.name)) {
            try {
              db.prepare(`ALTER TABLE agent_state ADD COLUMN ${col.name} ${col.type}`).run();
            } catch (alterError: any) {
              console.warn(`Migration warn: failed to alter agent_state and add ${col.name}:`, alterError.message);
            }
          }
        }
      }
      if (table === 'identities') {
        const alterCols = [
          { name: 'trust', type: 'INTEGER DEFAULT 50' },
          { name: 'affection', type: 'INTEGER DEFAULT 50' },
          { name: 'reputation', type: 'INTEGER DEFAULT 50' }
        ];
        for (const col of alterCols) {
          if (!columnNames.includes(col.name)) {
            try {
              db.prepare(`ALTER TABLE identities ADD COLUMN ${col.name} ${col.type}`).run();
            } catch (alterError: any) {
              console.warn(`Migration warn: failed to alter identities and add ${col.name}:`, alterError.message);
            }
          }
        }
      }
      if (table === 'knowledge') {
        const alterCols = [
          { name: 'confidence', type: 'REAL' },
          { name: 'updatedAt', type: 'INTEGER' }
        ];
        for (const col of alterCols) {
          if (!columnNames.includes(col.name)) {
            try {
              db.prepare(`ALTER TABLE knowledge ADD COLUMN ${col.name} ${col.type}`).run();
            } catch (alterError: any) {
              console.warn(`Migration warn: failed to alter knowledge and add ${col.name}:`, alterError.message);
            }
          }
        }
      }
      if (table === 'cron_tasks') {
        const alterCols = [
          { name: 'repeating', type: 'INTEGER DEFAULT 0' },
          { name: 'context_id', type: 'TEXT' },
          { name: 'chat_type', type: 'TEXT' },
          { name: 'sender_name', type: 'TEXT' }
        ];
        for (const col of alterCols) {
          if (!columnNames.includes(col.name)) {
            try {
              db.prepare(`ALTER TABLE cron_tasks ADD COLUMN ${col.name} ${col.type}`).run();
            } catch (alterError: any) {
              console.warn(`Migration warn: failed to alter cron_tasks and add ${col.name}:`, alterError.message);
            }
          }
        }
      }
      if (table === 'pairing_codes') {
        const alterCols = [
          { name: 'pending_account', type: 'TEXT' }
        ];
        for (const col of alterCols) {
          if (!columnNames.includes(col.name)) {
            try {
              db.prepare(`ALTER TABLE pairing_codes ADD COLUMN ${col.name} ${col.type}`).run();
            } catch (alterError: any) {
              console.warn(`Migration warn: failed to alter pairing_codes and add ${col.name}:`, alterError.message);
            }
          }
        }
      }
    } catch (tableInfoError: any) {
      console.error(`ERROR: Migration checks failed for table "${table}":`, tableInfoError.message);
    }
  }
}

/**
 * Menggali seluruh pengenal platform unik dari sebuah identitas kognitif
 * guna membandingkan kedekatan identitas multiplatform secara presisi.
 */
function getStandardizedIdentifiers(iden: any): Set<string> {
  const ids = new Set<string>();
  
  // 1. Ekstrak dari id fisik
  if (iden.id) {
    const cleanId = iden.id.trim().toLowerCase();
    ids.add(cleanId);
    
    if (cleanId.startsWith("telegram_")) {
      const num = cleanId.replace("telegram_", "");
      ids.add(`telegram:id:${num}`);
      ids.add(`telegram:${num}`);
    }
  }

  // 2. Ekstrak dari source dan sourceId
  if (iden.sourceId) {
    const rawSrcId = iden.sourceId.trim().toLowerCase();
    ids.add(rawSrcId);
    
    const src = (iden.source || "").trim().toLowerCase();
    if (src) {
      ids.add(`${src}:${rawSrcId}`);
      if (src.includes("telegram")) {
        ids.add(`telegram:id:${rawSrcId}`);
        ids.add(`telegram:${rawSrcId}`);
      }
    }
  }

  // 3. Ekstrak dari daftar linkedAccounts
  let accounts: string[] = [];
  try {
    accounts = iden.linkedAccounts ? JSON.parse(iden.linkedAccounts) : [];
    if (!Array.isArray(accounts)) accounts = [];
  } catch {
    accounts = [];
  }

  for (const acc of accounts) {
    if (acc) {
      const cleanAcc = acc.trim().toLowerCase();
      ids.add(cleanAcc);
      
      if (cleanAcc.startsWith("telegram:id:")) {
        const num = cleanAcc.replace("telegram:id:", "");
        ids.add(`telegram_${num}`);
      } else if (cleanAcc.startsWith("telegram:")) {
        const handle = cleanAcc.replace("telegram:", "");
        ids.add(`telegram_${handle}`);
      }
    }
  }

  return ids;
}

/**
 * Menggabungkan identitas duplikat di database agar Yui tidak menganggap
 * akun Telegram dan sesi Web sebagai dua orang berbeda, melainkan satu kesatuan.
 */
export function deduplicateAndMergeIdentities(db: any, targetIdentityId: string) {
  try {
    const main = db.prepare("SELECT * FROM identities WHERE id = ?").get(targetIdentityId) as any;
    if (!main) return;

    let mainAccounts: string[] = [];
    try {
      mainAccounts = main.linkedAccounts ? JSON.parse(main.linkedAccounts) : [];
      if (!Array.isArray(mainAccounts)) mainAccounts = [];
    } catch {
      mainAccounts = [];
    }

    let mainImportantFacts: string[] = [];
    try {
      mainImportantFacts = main.importantFacts ? JSON.parse(main.importantFacts) : [];
      if (!Array.isArray(mainImportantFacts)) mainImportantFacts = [];
    } catch {
      mainImportantFacts = [];
    }

    let mainHabits: string[] = [];
    try {
      mainHabits = main.habits ? JSON.parse(main.habits) : [];
      if (!Array.isArray(mainHabits)) mainHabits = [];
    } catch {
      mainHabits = [];
    }

    // Set pengecualian pencocokan untuk pengenal generik/lokal agar tidak memicu salah gabung
    const genericIdentifiers = new Set([
      "", "local", "web", "web_local", "anonymous", "local_user", "localuser", 
      "anonymous_user", "local:local", "web:local", "web_local:local", "api"
    ]);

    // Ekstrak token pengenal unik terstandarisasi untuk identitas target utama
    const mainTokens = getStandardizedIdentifiers(main);

    // Cari seluruh identitas lain selain id ini
    const allIdentities = db.prepare("SELECT * FROM identities WHERE id != ?").all(targetIdentityId) as any[];
    const duplicatesToMerge: any[] = [];

    for (const iden of allIdentities) {
      // Ekstrak token pengenal unik terstandarisasi untuk identitas pembanding
      const idenTokens = getStandardizedIdentifiers(iden);
      let hasOverlappingAccount = false;

      // Periksa apakah terdapat pengenal tepercaya milik kedua akun yang saling beririsan
      for (const token of idenTokens) {
        if (!genericIdentifiers.has(token) && mainTokens.has(token)) {
          hasOverlappingAccount = true;
          break;
        }
      }

      const isCaseInsensitiveNameMatch = 
        main.perceivedName && 
        iden.perceivedName && 
        main.perceivedName.trim().toLowerCase() === iden.perceivedName.trim().toLowerCase();

      if (hasOverlappingAccount || isCaseInsensitiveNameMatch) {
        let idenAccounts: string[] = [];
        try {
          idenAccounts = iden.linkedAccounts ? JSON.parse(iden.linkedAccounts) : [];
          if (!Array.isArray(idenAccounts)) idenAccounts = [];
        } catch {
          idenAccounts = [];
        }
        duplicatesToMerge.push({ iden, accounts: idenAccounts });
      }
    }

    if (duplicatesToMerge.length === 0) {
      console.log(`[MERGE_IDENTITIES] Tidak ditemukan identitas duplikat dengan akun terhubung yang cocok untuk '${main.perceivedName}'.`);
      return;
    }

    console.log(`[MERGE_IDENTITIES] Mendeteksi ${duplicatesToMerge.length} identitas duplikat. Memulai penggabungan kognitif ke profil target '${main.perceivedName}' (ID: ${targetIdentityId})...`);

    let mergedAccounts = [...mainAccounts];
    let mergedFacts = [...mainImportantFacts];
    let mergedHabits = [...mainHabits];
    let maxTrust = main.trust !== undefined ? main.trust : 50;
    let maxAffection = main.affection !== undefined ? main.affection : 50;
    let maxReputation = main.reputation !== undefined ? main.reputation : 50;
    let lastInteraction = main.lastInteraction || Date.now();

    for (const dup of duplicatesToMerge) {
      const { iden, accounts } = dup;

      // Gabung akun tertaut
      mergedAccounts = [...mergedAccounts, ...accounts];

      // Gabung fakta penting batin
      try {
        const dupFacts = iden.importantFacts ? JSON.parse(iden.importantFacts) : [];
        if (Array.isArray(dupFacts)) {
          mergedFacts = [...mergedFacts, ...dupFacts];
        }
      } catch {}

      // Gabung rutinitas/habits
      try {
        const dupHabits = iden.habits ? JSON.parse(iden.habits) : [];
        if (Array.isArray(dupHabits)) {
          mergedHabits = [...mergedHabits, ...dupHabits];
        }
      } catch {}

      // Ambil level status relasi tertinggi/maksimum
      if (iden.trust !== undefined && iden.trust > maxTrust) maxTrust = iden.trust;
      if (iden.affection !== undefined && iden.affection > maxAffection) maxAffection = iden.affection;
      if (iden.reputation !== undefined && iden.reputation > maxReputation) maxReputation = iden.reputation;
      if (iden.lastInteraction && iden.lastInteraction > lastInteraction) lastInteraction = iden.lastInteraction;
    }

    // Sanitasi dan hilangkan duplikasi pada nilai array pengenal
    mergedAccounts = Array.from(new Set(mergedAccounts.map(a => a.trim()))).filter(Boolean);
    mergedFacts = Array.from(new Set(mergedFacts.map(f => f.trim()))).filter(Boolean);
    mergedHabits = Array.from(new Set(mergedHabits.map(h => h.trim()))).filter(Boolean);

    // Update profil utama dengan batin yang tergabung
    db.prepare(`
      UPDATE identities 
      SET linkedAccounts = ?, importantFacts = ?, habits = ?, trust = ?, affection = ?, reputation = ?, lastInteraction = ?
      WHERE id = ?
    `).run(
      JSON.stringify(mergedAccounts),
      JSON.stringify(mergedFacts),
      JSON.stringify(mergedHabits),
      maxTrust,
      maxAffection,
      maxReputation,
      lastInteraction,
      targetIdentityId
    );

    // Hapus entri identitas asal yang telah dilebur agar UI tetap ramping
    const deleteStmt = db.prepare(`DELETE FROM identities WHERE id = ?`);
    for (const dup of duplicatesToMerge) {
      deleteStmt.run(dup.iden.id);
      console.log(`[MERGE_IDENTITIES] Sukses mengintegrasikan dan melikuidasi identitas duplikat ID: ${dup.iden.id}`);
    }

    // Hubungkan ulang context_id di telegram_users milik identitas lama ke identitas utama
    const updateTgStmt = db.prepare("UPDATE telegram_users SET context = ? WHERE context = ?");
    for (const dup of duplicatesToMerge) {
      updateTgStmt.run(`linked_identity:${targetIdentityId}`, `linked_identity:${dup.iden.id}`);
    }

    console.log(`[MERGE_IDENTITIES] Penggabungan kognitif lintas-platform tuntas untuk '${main.perceivedName}'!`);
  } catch (err: any) {
    console.error("[MERGE_IDENTITIES_ERROR] Gagal menggabungkan identitas duplikat:", err.message || err);
  }
}
