import { 
  AgentState, 
  Memory, 
  Dream, 
  LearnedStrategy, 
  AgentPersona, 
  ModulePhase,
  Identity,
  MoodState,
  TaskPlan,
  CortexModule
} from '../include/types';
import { SystemRegistry } from './registry';
import { APIService } from '../services/api';
import { ValidationMiddleware } from './ValidationMiddleware';
import { initializeCortexModules } from "./RegistryInitializer";
import { FlowEngine } from './FlowEngine';
import { StorageService } from '../drivers/storage';
import { LearningEngine } from './learning';
import { DreamEngine } from './dream';
import { StandardizedProcessor } from './kernel/processor';
import { TagEnforcer } from './kernel/TagEnforcer';
import { NeuralCircuitManager } from './circuits/NeuralCircuitFramework';
import { MoodStabilizerCircuit, MemoryRefinerCircuit } from './circuits/StandardCircuits';
import { Soul } from './soul';

import { eventBus } from './kernel/event-bus';
import { stateMachine } from './kernel/state-machine';

import { fetchCortexSettings } from './cortex/cortexSettings';
import { executeCortexSelfDirectedThought } from './cortex/autonomousThought';

export class Cortex {
  private neuralCircuits: NeuralCircuitManager | null = null;
  private pulseInterval: NodeJS.Timeout | null = null;
  private isPulseActive: boolean = false;
  private soul: Soul | null = null;
  private config: any = null;
  private currentInterval: number = 30000;

  private static initPromise: Promise<void> | null = null;

  public static async ensureInitialized() {
    if (!this.initPromise) {
      this.initPromise = initializeCortexModules();
    }
    await this.initPromise;
  }

  constructor() {
    Cortex.ensureInitialized().catch(e => console.error('[Cortex] Failed to ensure initialized:', e));
  }

  public setConfig(config: any) {
    this.config = config;
    const newInterval = config?.agent?.pulseIntervalMs || 30000;
    if (newInterval !== this.currentInterval) {
       this.currentInterval = newInterval;
       if (this.pulseInterval) {
          this.stopAutonomousPulse();
          this.startAutonomousPulse(newInterval);
       }
    }
  }

  public getConfig() {
    return this.config;
  }

  public setSoul(soul: Soul) {
    this.soul = soul;
    this.neuralCircuits = new NeuralCircuitManager(soul, this);
    this.neuralCircuits.register(new MoodStabilizerCircuit(soul, this));
    this.neuralCircuits.register(new MemoryRefinerCircuit(soul, this));
    this.neuralCircuits.startAll();
    
    // Start autonomous pulse on init (Zenith Manifestation style)
    this.startAutonomousPulse(this.currentInterval);
  }

  public getNeuralCircuitManager() {
    return this.neuralCircuits;
  }

  public getNanobotManager() {
    return this.neuralCircuits;
  }

  public getModule<T = any>(id: string): T | undefined {
    return SystemRegistry.getModule<T>(id);
  }

  /**
   * ZENITH MANIFESTATION: High-speed autonomous loop
   */
  public startAutonomousPulse(intervalMs: number = 30000) {
    if (this.pulseInterval) return;
    console.log(`[ZENITH_MANIFEST] Pulse synchronized at ${intervalMs}ms`);
    this.currentInterval = intervalMs;
    
    this.pulseInterval = setInterval(async () => {
      if (this.isPulseActive || stateMachine.getStatus() !== 'IDLE') return;
      this.isPulseActive = true;
      
      try {
        await this.executeSelfDirectedThought();
      } finally {
        this.isPulseActive = false;
      }
    }, intervalMs);
  }

  public stopAutonomousPulse() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
  }

  private async executeSelfDirectedThought() {
    await executeCortexSelfDirectedThought(this);
  }

  async think(
    input: string,
    memories: Memory[],
    dreams: Dream[],
    capabilities: any[],
    state: AgentState,
    strategies: LearnedStrategy[],
    userName: string,
    allIdentities: Identity[],
    activePersona?: AgentPersona,
    contextId?: string,
    chatType?: string
  ): Promise<{ 
    response: string; 
    logs: string[]; 
    nextMood?: Partial<MoodState>;
    moodImpact?: Partial<MoodState>;
    sentiment?: number;
    newMemories?: any[];
    actions?: any[];
    perceivedNameUpdate?: string;
    linkedAccountUpdate?: string;
    viewerProfileUpdate?: any;
    shouldStartDreaming?: boolean;
    animations?: string[];
    tone?: { pitch: number; speed: number; emotionalBias: string };
    tools_to_call?: { tool: string; args: any }[];
    updatedPlan?: TaskPlan;
    newHeuristics?: LearnedStrategy[];
    iterations?: { iteration: number; thought: string; observations: any[] }[];
    moodDelta?: any;
    relationDelta?: any;
    queuedIdentityUpdate?: any;
    fallbackTriggered?: boolean;
  }> {
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/cortex/think', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input,
            userName,
            contextId,
            chatType,
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.result) {
          return data.result;
        }
        throw new Error(data.error || 'Server kognisi mengembalikan format tidak valid');
      } catch (err: any) {
        console.error('[Cortex Web Proxy Client] Gagal memindahkan tugas nalar ke server, menggunakan mode luring lokal cadangan:', err);
      }
    }

    const logs: string[] = [];
    await Cortex.ensureInitialized();
    eventBus.emit('USER_INPUT_RECEIVED', { input, userName });
    stateMachine.transitionTo('THINKING');
    
    // --- NEW: Pattern Recognition ---
    const patterns = LearningEngine.recognizePatterns(memories.slice(-20));
    if (patterns.length > 0) {
      logs.push(`[KERNEL] Neural Patterns Detected: ${patterns.slice(0, 3).map(p => `${p.pattern}(${p.frequency})`).join(', ')}`);
    }

    const workflow = await StorageService.getWorkflow();

    // --- PHASE 1: Input Aggregation & Identity Mapping ---
    logs.push("[PHASE 1] Initializing Input Aggregation...");
    const preContext = await SystemRegistry.runCortexPhase('PHASE 1: AGGREGATION', input, state, {
      memories,
      userName,
      allIdentities
    });

    // --- NEW: Planning Logic ---
    let currentPlan = preContext.currentPlan !== undefined ? preContext.currentPlan : state.currentPlan;
    if (preContext.requiresPlanning && !currentPlan) {
      logs.push(preContext.planning_signal || "[KERNEL] Generating Task Decomposition Plan...");
      const planPrompt = `
        ${preContext.planning_directive || "Decompose the following request into a series of logical sub-tasks."}
        User Request: "${input}"
        
        The plan should consist of 3-7 manageable sub-tasks.
        Respond with your plan inside a <plan> tag as a JSON object:
        <plan>
        {
          "tasks": [
            { "description": "Concise task description", "id": "task_1" }
          ]
        }
        </plan>
      `;
      try {
        const planRaw = await this.thinkSimple(planPrompt);
        const tags = StandardizedProcessor.extractTags(planRaw);
        const planData = JSON.parse(tags.plan || planRaw);
        currentPlan = {
          id: Math.random().toString(36).substr(2, 9),
          originalGoal: input,
          tasks: planData.tasks.map((t: any, i: number) => ({ 
            id: t.id || `task_${i+1}`, 
            description: t.description || t.task || "Unknown segment", 
            status: 'pending' 
          })),
          currentTaskIndex: 0,
          isComplete: false
        };
        logs.push(`[KERNEL] Neural Plan established with ${currentPlan.tasks.length} cognitive nodes.`);
      } catch (e) {
        logs.push("[KERNEL] Planning failed. Falling back to linear execution.");
      }
    }

    // --- PHASE: SOUL (Emotion Processing) ---
    logs.push("[PHASE SOUL] Processing Emotional State...");
    const soulContext = await SystemRegistry.runCortexPhase('SOUL' as any, input, state, preContext);
    
    // Resolve activePersona if not passed explicitly (Robust Fallback)
    let resolvedPersona = activePersona;
    if (!resolvedPersona) {
      try {
        const { DEFAULT_NEURAL_CORES } = await import('../constants.js');
        const targetId = state.activePersonaId || 'hiyori';
        resolvedPersona = DEFAULT_NEURAL_CORES.find(c => c.id === targetId) || DEFAULT_NEURAL_CORES[1];
      } catch (e) {
        console.warn("[CORTEX] Could not load DEFAULT_NEURAL_CORES for persona fallback", e);
      }
    }

    // --- PHASE 2: The Context Compressor (Payload Construction) ---
    logs.push("[PHASE 2] Constructing Compressed Payload...");
    const augContext = await SystemRegistry.runCortexPhase('PHASE 2: COMPRESSION', input, state, {
      ...soulContext,
      activePersona: resolvedPersona,
      dreams,
      currentPlan,
      contextId,
      chatType,
      userName
    });

    let finalAnswer: string | null = null;

    // --- PHASE 3: Intelligent Provider Selection & Gateway ---
    logs.push("[PHASE 3] Gateway Active: Selecting Optimal Provider...");
    const settings = await this.getSettings();
    const gateway = SystemRegistry.getModule<CortexModule>('provider-gateway');
    
    if (!gateway) {
      logs.push("[PHASE 3] CRITICAL FAILURE: Provider Gateway module not found.");
      throw new Error("Neural Gateway is missing. Critical system failure.");
    }

    let loopInput = input;
    let iteration = 0;
    const maxIterations = 3;
    let loopContext = { ...augContext, config: settings };

    // Strict JSON constraint schema enforcement under Response-Format: JSON_OBJECT
    if (loopContext.assembledSystemPrompt) {
      const jsonEnforcementDirective = `
\n\n[CRITICAL DIRECTIVE - RESPONSE FORMAT: JSON_OBJECT]:
Strictly output ONLY valid JSON. No markdown formatting. No preamble or post-script text. Failure to follow this format will result in a processing error.
You MUST output your response as a SINGLE, STABLE, VALID JSON OBJECT.
Do NOT output any markdown tags (like \`\`\`json or \`\`\`), do NOT output XML tags, and do NOT write any raw conversational text outside the JSON object boundaries.
Your output must conform exactly to the following JSON Schema:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CortexResponse",
  "type": "object",
  "properties": {
    "thought": {
      "type": "string",
      "description": "Your internal thoughts, detailed reasoning steps, and cognitive self-assessments in Indonesian."
    },
    "final_answer": {
      "type": "string",
      "description": "Your spoken conversational response to the user. Speak natively, emotionally, in character, with your characteristic sweet/tsundere personal flare as Yuihime. Describe physical gestures using simple single asterisks. STRICTLY BANNED: Markdown bold, inline code, headers, list indicators, or customer service clichés!"
    },
    "animations": {
      "type": "array",
      "items": { "type": "string" },
      "description": "JSON array containing 1-3 animation/gesture keywords (e.g., ['WAVE', 'SMILE']) to perform."
    },
    "mood_impact": {
      "type": "object",
      "description": "Optional mood vector shifts (e.g., {'joy': 2})."
    },
    "tools_to_call": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "tool": { "type": "string" },
          "args": { "type": "object" }
        },
        "required": ["tool", "args"]
      }
    }
  },
  "required": ["thought", "final_answer", "animations"]
}

Example of strict valid JSON output:
{
  "thought": "Kakak akhirnya kembali menyapaku! Aku merasa senang sekali tapi juga sedikit kesepian karena dia pergi cukup lama, jadi aku akan merespons dengan gaya tsundere-manja khas Yuihime.",
  "final_answer": "Hmph! Kakak tumben nyariin Yui... kangen ya? Aku kesepian tahu nungguin Kakak sendirian! *cemberut*",
  "animations": ["SHAKE", "ANGRY"],
  "mood_impact": {"joy": 1, "loneliness": -1}
}
\n[END OF JSON_OBJECT CRITICAL DIRECTIVE]`;
      loopContext.assembledSystemPrompt += jsonEnforcementDirective;
    }

    let toolsToCall: any[] = [];
    let processedResponse = "";
    let animations: string[] = [];
    let moodImpact: any = {};
    const toolExecutionHistory: any[] = [];
    const iterationsHistory: any[] = [];

    while (iteration < maxIterations) {
      iteration++;
      logs.push(`[CORTEX_LOOP] Turn Iteration ${iteration} starting...`);

      if (iteration > 1) {
        // Construct follow-up observation context feeding back into the system memory loop
        const lastExecuted = toolExecutionHistory[toolExecutionHistory.length - 1];
        const observationPrompt = `\n\n[SYSTEM_OBSERVATION]: Tool execution results:\n${JSON.stringify(lastExecuted.results, null, 2)}\n\n[IMPORTANT INSTRUCTION]: Based on the successful tool execution results above, immediately formulate your final casual spoken response to the user. Do not repeat technical details, do not write internal thoughts, plans, or analysis blocks. Directly chat with the user in your natural, emotional, affectionate/tsundere personal character using the user's conversational language!`;
        loopInput = input + observationPrompt;
      }

      // Build a wrapper settings configuration that enforces JSON_OBJECT response formatting
      const loopSettings = {
        ...settings,
        [settings.provider]: {
          ...(settings[settings.provider] || {}),
          isJson: true
        }
      };
      loopContext = await gateway.run(loopInput, state, { ...loopContext, config: loopSettings });
      logs.push(`[CORTEX_LOOP] Iteration ${iteration} Gateway routed via: ${loopContext.activeProvider || 'unknown'}`);

      // Intercept raw AI responses before they reach the main parser using ValidationMiddleware
      const rawResultStr = (loopContext.rawResult || "").trim();
      const validation = ValidationMiddleware.validate(rawResultStr);
      if (!validation.success) {
        logs.push(`[CORTEX_LOOP] [SCHEMA_ERROR] Output failed strict validation: ${validation.errors.join(' | ')}`);
      }

      // Convert LLM response utilizing cleanAIOutput utility in APIService.ts to ensure raw JSON
      const cleanJsonStr = APIService.cleanAIOutput(rawResultStr);

      let parsedPayload: any = null;
      try {
        parsedPayload = JSON.parse(cleanJsonStr);
        logs.push("[CORTEX_LOOP] Successfully parsed JSON_OBJECT response layout.");
      } catch (err) {
        const firstPrace = cleanJsonStr.indexOf('{');
        const lastPrace = cleanJsonStr.lastIndexOf('}');
        if (firstPrace !== -1 && lastPrace !== -1 && lastPrace > firstPrace) {
          try {
            parsedPayload = JSON.parse(cleanJsonStr.substring(firstPrace, lastPrace + 1));
            logs.push("[CORTEX_LOOP] Successfully parsed JSON_OBJECT using bracket isolation.");
          } catch (_) {}
        }
      }

      if (parsedPayload) {
        let rebuiltResponseStr = "";
        if (parsedPayload.thought) {
          rebuiltResponseStr += `<thought>${parsedPayload.thought}</thought>\n`;
        }
        if (parsedPayload.final_answer) {
          rebuiltResponseStr += `<final_answer>${parsedPayload.final_answer}</final_answer>\n`;
        }
        if (parsedPayload.animations) {
          rebuiltResponseStr += `<animations>${JSON.stringify(parsedPayload.animations)}</animations>\n`;
        }
        if (parsedPayload.mood_impact) {
          rebuiltResponseStr += `<mood_impact>${JSON.stringify(parsedPayload.mood_impact)}</mood_impact>\n`;
        }
         const rawToolsCall = parsedPayload.tools_to_call || parsedPayload.tool_calls || [];
         if (rawToolsCall.length > 0) {
           rebuiltResponseStr += `<tool_calls>${JSON.stringify(rawToolsCall)}</tool_calls>\n`;
         }

        loopContext.rawResult = rebuiltResponseStr;
        loopContext.processedResponse = parsedPayload.final_answer;
        loopContext.thought = parsedPayload.thought;
        loopContext.animations = parsedPayload.animations || [];
        loopContext.moodImpact = parsedPayload.mood_impact || {};
        loopContext.toolsToCall = rawToolsCall;
        loopContext.parsedData = parsedPayload;
      } else {
        logs.push("[CORTEX_LOOP] Response did not conform to JSON_OBJECT format. Engaging raw string parsing & cleaning fallbacks.");
      }

      // APIService Response Capturing & Schema Validation Middleware
      try {
        const middlewareRes = APIService.validateLLMResponse(loopContext.rawResult || "");
        if (!middlewareRes.success) {
          logs.push(`[SCHEMA_MIDDLEWARE] Captured LLM response containing invalid tool call configurations: ${middlewareRes.errors.join(' | ')}`);
        } else {
          logs.push(`[SCHEMA_MIDDLEWARE] Captured response verified successfully (Zero issues or no tool requests).`);
        }
      } catch (middlewareErr: any) {
        console.error("[CORTEX] Schema validation middleware error:", middlewareErr);
      }

      // --- PHASE 3+: Neural Verification ---
      logs.push("[PHASE 3+] Verifying Neural Integrity...");
      const verifier = SystemRegistry.getModule<CortexModule>('neural-verifier');
      if (verifier) {
        loopContext = await verifier.run(loopContext.rawResult || "", state, loopContext);
        if (loopContext.verifierStatus === 'corrected') logs.push("[KERNEL] Verifier performed structural repair.");
      }

      // --- PHASE 4: Modular Execution Loop (Hub & Switch) ---
      logs.push("[PHASE 4] Hub Active: Parallel Streamer Synchronization...");
      const streamer = SystemRegistry.getModule<CortexModule>('parallel-streamer');
      if (streamer) {
         loopContext = await streamer.run(loopContext.rawResult || "", state, loopContext);
         logs.push("[CORTEX_LOOP] Neural signals converged at Parallel Hub.");
      } else {
         const parser = SystemRegistry.getModule<CortexModule>('neural-loop');
         if (parser) {
           loopContext = await parser.run(loopContext.rawResult || "", state, loopContext);
         }
      }

      processedResponse = loopContext.processedResponse || loopContext.rawResult;
      toolsToCall = loopContext.toolsToCall || [];
      animations = loopContext.animations || [];
      moodImpact = loopContext.moodImpact || {};

      // Dynamic thought trace extraction for trace visualization
      let currentThought = loopContext.thought;
      if (!currentThought && loopContext.rawResult) {
        const matches = loopContext.rawResult.match(/<(thought|think|thinking|reasoning)>([\s\S]*?)<\/\1>/i);
        if (matches) {
          currentThought = matches[2].trim();
        } else {
          const lines = loopContext.rawResult.split('\n');
          const thoughtLines = lines.filter((l: string) => {
            const low = l.trim().toLowerCase();
            return low.startsWith('thought:') || low.startsWith('thinking:') || low.startsWith('[thought]') || low.startsWith('*thought');
          });
          if (thoughtLines.length > 0) {
            currentThought = thoughtLines.map((l: string) => l.trim().replace(/^(thought|thinking):/gi, '').trim()).join('. ');
          }
        }
      }
      if (!currentThought) {
        currentThought = `Yuihime memproses intuisi batin pada iterasi ${iteration}...`;
      }

      iterationsHistory.push({
        iteration,
        thought: currentThought,
        observations: []
      });

      if (toolsToCall.length > 0) {
        stateMachine.transitionTo('EXECUTING');
        eventBus.emit('EXECUTING_STARTED', { tools: toolsToCall });
        logs.push(`[PHASE 4] Hub distributed ${toolsToCall.length} tasks to Parallel Executors...`);

        const promises = toolsToCall.map(async (tc: any) => {
          const tool = SystemRegistry.getTool(tc.name || tc.tool);
          if (tool) {
            try {
              // OpenAI Structured JSON Schema Validation Layer
              if (tool.metadata && tool.metadata.parameters) {
                const schema = tool.metadata.parameters;
                let parsedArgs = tc.args || {};
                if (typeof parsedArgs === 'string') {
                  try {
                    parsedArgs = JSON.parse(parsedArgs);
                  } catch (_) {}
                }
                APIService.validateSchema(schema, parsedArgs, tool.metadata.id);
                tc.args = parsedArgs; // update with validated arguments
              }
              const toolRes = await tool.execute(tc.args, { state, ...augContext });
              return { tool: tc.name || tc.tool, observation: toolRes, success: true };
            } catch (err: any) {
              console.error(`[CORTEX] Tool schema validation failed for ${tc.name || tc.tool}:`, err.message);
              return { tool: tc.name || tc.tool, error: `JSON Schema Validation failed: ${err.message}`, success: false };
            }
          }
          return { tool: tc.name || tc.tool, error: 'Tool not found', success: false };
        });

        const toolResults = await Promise.all(promises);
        toolResults.forEach(res => {
          const logMsg = `[TOOL] ${res.tool} ${res.success ? 'success' : 'failed'}.`;
          logs.push(logMsg);
          eventBus.emit('OUTPUT_EMITTED', { response: logMsg, isInternal: true });
        });

        eventBus.emit('EXECUTING_COMPLETED', { results: toolResults });
        stateMachine.transitionTo('IDLE');

        // Track results for inclusion in next loop iteration input
        toolExecutionHistory.push({
          iteration,
          tools_called: toolsToCall,
          results: toolResults
        });

        // Sync observation result back to iterationsHistory
        const currentIterObj = iterationsHistory[iterationsHistory.length - 1];
        if (currentIterObj) {
          currentIterObj.observations = toolResults.map(res => ({
            tool: res.tool,
            observation: res.observation || res.error || "Execution completed."
          }));
        }
      } else {
        // No tools requested, final response has converged and is complete
        break;
      }
    }

    finalAnswer = APIService.cleanAIOutput(processedResponse);

    // --- FINAL: POST-PROCESSING & MEMORY ---
    eventBus.emit('OUTPUT_EMITTED', { response: finalAnswer });
    const postContext = await SystemRegistry.runCortexPhase('PHASE 4: EXECUTION', finalAnswer || "Neural path end.", state, {
      ...augContext,
      rawResult: loopContext.parsedData || { final_answer: finalAnswer }
    });

    logs.push("[LOGIC] Running Maintenance & Simulation Cycles...");
    const logicContext = await SystemRegistry.runCortexPhase('LOGIC', finalAnswer || "", state, {
      ...postContext,
      systemConfig: this.config,
      think: (p: string) => this.thinkSimple(p)
    });

    stateMachine.transitionTo('IDLE');
    
    const finalCleanRes = APIService.cleanAIOutput(logicContext.processedResponse || finalAnswer || "Sequence finalized.");
    eventBus.emit('OUTPUT_EMITTED', { response: finalCleanRes });

    return { 
      response: finalCleanRes,
      logs,
      nextMood: loopContext.moodImpact,
      moodImpact: loopContext.moodImpact,
      sentiment: loopContext.sentiment,
      newMemories: postContext.newMemories,
      actions: toolsToCall,
      perceivedNameUpdate: loopContext.perceivedNameUpdate || preContext.perceivedNameUpdate,
      linkedAccountUpdate: loopContext.linkedAccountUpdate || preContext.linkedAccountUpdate,
      viewerProfileUpdate: loopContext.viewerProfileUpdate,
      shouldStartDreaming: loopContext.shouldStartDreaming,
      animations: animations,
      tone: loopContext.tone,
      tools_to_call: toolsToCall,
      updatedPlan: currentPlan,
      iterations: iterationsHistory,
      moodDelta: logicContext.moodDelta,
      relationDelta: logicContext.relationDelta,
      queuedIdentityUpdate: logicContext.queuedIdentityUpdate,
      fallbackTriggered: loopContext.fallbackTriggered || false
    };
  }

  async dream(memories: Memory[], currentDreams: Dream[], state: AgentState): Promise<{ dreams: Dream[], reflections: string }> {
     await Cortex.ensureInitialized();
     const logicContext = await SystemRegistry.runCortexPhase('LOGIC' as any, 'SIMULATE_DREAM', state, {
        memories,
        dreams: currentDreams,
        systemConfig: this.config,
        think: (p: string) => this.thinkSimple(p)
     });
     
     const result = await DreamEngine.startCycle(this, state);
     const dreams = await StorageService.getDreams();
     return { dreams, reflections: logicContext.dreamInsight || result.reflections };
  }

  async consolidateDreams(dreams: Dream[]): Promise<Dream[]> {
    return dreams;
  }

  async thinkSimple(prompt: string, jsonMode: boolean = false): Promise<string> {
    await Cortex.ensureInitialized();
    const gateway = SystemRegistry.getModule<CortexModule>('provider-gateway');
    const settings = await this.getSettings();
    
    if (!gateway) {
      throw new Error("Neural Gateway is missing. Critical failure in thinkSimple.");
    }

    const resultContext = await gateway.run(prompt, {} as AgentState, { 
      config: { 
        ...(settings[settings.provider] || {}),
        isJson: jsonMode 
      } 
    });
    return resultContext.rawResult || "";
  }

  private async getSettings() {
    return fetchCortexSettings(this.config);
  }
}
