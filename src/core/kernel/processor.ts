import { AIService } from "./ai.js";
import { SystemRegistry } from '../registry.js';
import { SettingsManager } from './settings.js';
import { ChatCompletionMessage } from '../../include/types.js';

export class NeuralProcessor {
  private static instance: NeuralProcessor;

  private constructor() {}

  public static getInstance(): NeuralProcessor {
    if (!NeuralProcessor.instance) {
      NeuralProcessor.instance = new NeuralProcessor();
    }
    return NeuralProcessor.instance;
  }

  /**
   * Main Neural Gateway & Orchestrator
   * Follows Fallback Strategy (Step 1-3)
   */
  async process(input: string | ChatCompletionMessage[], options: any = {}) {
    const settings = SettingsManager.getInstance().getAll();
    const primaryProviderId = options.provider || settings.provider || 'gemini';
    
    // Convert string input to OpenAI-compatible messages if needed
    const messages: ChatCompletionMessage[] = typeof input === 'string' 
      ? [{ role: 'user', content: input }]
      : input;

    // Define fallback sequence (Step 3: Provider Failover - Configurable dynamically via settings)
    const geminiConf = (settings.gemini || {}) as any;
    let fallbackProviders = [primaryProviderId, 'gemini', 'official_chat', 'openrouter', 'anthropic', 'ollama'];
    
    if (geminiConf.provFailoverSequence) {
      fallbackProviders = geminiConf.provFailoverSequence
        .split(',')
        .map((s: string) => s.trim().toLowerCase())
        .filter((s: string) => s.length > 0);
    }
    
    fallbackProviders = [primaryProviderId, ...fallbackProviders]
      .filter((v, i, a) => v && a.indexOf(v) === i);

    let lastError: any = null;

    for (const providerId of fallbackProviders) {
      try {
        const provider = SystemRegistry.getProvider(providerId);
        if (!provider) continue;

        console.log(`[NEURAL_GATEWAY] Attempting request via provider: ${providerId}`);
        
        // Multi-Step Fallback within the provider
        const result = await this.executeWithResilience(provider, messages, options);
        return result;
      } catch (e: any) {
        lastError = e;
        const errorMsg = e.message || String(e);
        console.error(`[NEURAL_GATEWAY_ERROR] ${providerId}: ${errorMsg}`);
        
        // Standardization of error message as per rule 5
        if (!errorMsg.startsWith('[NEURAL_GATEWAY_ERROR]')) {
          lastError = new Error(`[NEURAL_GATEWAY_ERROR] ${providerId}: ${errorMsg}`);
        }

        // Try next provider unless it's a specific non-recoverable error
        continue;
      }
    }

    // Custom multi-provider fallbackChain cascade (Add Mode)
    const fallbackChain = geminiConf.fallbackChain || [];
    if (fallbackChain && fallbackChain.length > 0) {
      console.log(`[NEURAL_GATEWAY] Standard providers failed. Entering custom fallback chain cascade with ${fallbackChain.length} steps...`);
      for (const item of fallbackChain) {
        const providerId = item.provider;
        const modelId = item.model;
        const customApiKey = item.apiKey;
        
        try {
          const provider = SystemRegistry.getProvider(providerId);
          if (!provider) {
            console.warn(`[NEURAL_GATEWAY] Fallback Provider ${providerId} not found in registry.`);
            continue;
          }
          
          console.log(`[NEURAL_GATEWAY] Custom fallback step: ${providerId} (${modelId})`);
          
          const specificConfig = {
            ...options,
            ...settings,
            ...(settings[providerId] || {}),
            model: modelId || settings[providerId]?.model,
            apiKey: customApiKey || settings[providerId]?.apiKey
          };
          
          const result = await provider.generate(messages, specificConfig);
          return result;
        } catch (e: any) {
          lastError = e;
          const errorMsg = e.message || String(e);
          console.error(`[NEURAL_GATEWAY_ERROR_FALLBACK] ${providerId} (${modelId}): ${errorMsg}`);
          continue;
        }
      }
    }

    throw lastError || new Error("[NEURAL_GATEWAY_ERROR] All providers failed.");
  }

  /**
   * Internal resilience logic for a specific provider
   * Handles Step 1 (Key Recovery) and Step 2 (Model Resilience)
   */
  private async executeWithResilience(provider: any, messages: ChatCompletionMessage[], options: any) {
    const providerId = provider.metadata.id;
    const settings = SettingsManager.getInstance().getAll();
    const providerConfig = settings[providerId] || {};
    
    // Step 2: Model Resilience - Priority list of models
    const primaryModel = options.model || providerConfig.model || (provider.metadata.models ? provider.metadata.models[0] : null);
    const modelsToTry = [primaryModel, ...(provider.metadata.models || [])].filter((v, i, a) => v && a.indexOf(v) === i);

    let lastProviderError: any = null;

    for (const modelId of modelsToTry) {
      try {
        const config = { ...options, ...settings, model: modelId };
        
        // Step 1: API Key Recovery (if multiple keys or fallback mechanism exists)
        // Here we just use the provided key, but can be extended to cycle keys if configured
        const result = await provider.generate(messages, config);
        return result;
      } catch (e: any) {
        lastProviderError = e;
        const msg = (e.message || String(e)).toLowerCase();
        
        // If it's 404 (Model Not Found) or 400 (Bad Model Params), we try next model
        const shouldTryNextModel = msg.includes('404') || msg.includes('not found') || msg.includes('model') || msg.includes('400');
        if (shouldTryNextModel) {
          console.warn(`[NEURAL_RESILIENCE] Model ${modelId} failed, trying next model...`);
          continue;
        }
        
        // If it's 429 (Quota) or 401 (Auth), we might want to fail the whole provider to hit next Step 3
        throw e;
      }
    }
    
    throw lastProviderError;
  }

  async thinkSimple(input: string, options: any = {}) {
     return this.process(input, options);
  }

  async summarize(text: string) {
    return await this.process(`Summarize the following text concisely:\n\n${text}`);
  }

  public static extractTags(text: string): any {
    const tags: any = {};
    const regex = /<([^>]+)>([\s\S]*?)<\/\1>/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      tags[match[1]] = match[2].trim();
    }
    return tags;
  }

  public static async executeStandardized(id: string, version: string, args: any, fn: () => Promise<any>) {
      try {
        const output = await fn();
        return { 
          id, 
          version, 
          output, 
          feedback: { status: 'success' } 
        };
      } catch (e: any) {
        return { 
          id, 
          version, 
          error: e.message, 
          feedback: { status: 'error', message: e.message } 
        };
      }
  }

  public static parseLLMResponse(text: string, fallback: any = []): any {
     // 1. Try JSON parsing first as it's the primary, structured format
     try {
       let cleaned = text.trim();
       // Strip markdown code fences if any
       cleaned = cleaned.replace(/```json/gi, '').replace(/```/gi, '').trim();
       
       // Handle curly bracket isolation
       const firstBrace = cleaned.indexOf('{');
       const lastBrace = cleaned.lastIndexOf('}');
       if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
         cleaned = cleaned.substring(firstBrace, lastBrace + 1);
       }
       
       if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
         const parsedObj = JSON.parse(cleaned);
         if (parsedObj && typeof parsedObj === 'object') {
           return parsedObj;
         }
       }
     } catch (e) {
       // Ignore JSON parse errors, enter custom tag/XML-based logic below
     }

     // 2. Fallback to extracting XML/HTML tags
     const tags = this.extractTags(text);
     
     // Scan for key-value list patterns (e.g. * `animations`: ["WAVE"]) to capture any un-enclosed XML metadata
     const lines = text.split('\n');
     for (const line of lines) {
       const trimmed = line.trim();
       const match = /^\s*[\*\-\+]?\s*`?([a-zA-Z0-9_-]+)`?\s*:\s*([\s\S]*?)$/i.exec(trimmed);
       if (match) {
         const key = match[1].trim();
         // Strip enclosing backticks or quotes if any from value
         const value = match[2].trim().replace(/^`|`$/g, '').trim();
         
         if (!tags[key]) {
           tags[key] = value;
         }
         
         // Synchronize common alternate formats of moodImpact
         if (key === 'mood_impact' && !tags['moodImpact']) {
           tags['moodImpact'] = value;
         }
         if (key === 'moodImpact' && !tags['mood_impact']) {
           tags['mood_impact'] = value;
         }
       }
     }

     if (Object.keys(tags).length > 0) return tags;
     
     return fallback;
  }

  public static sanitizeOutput(text: string): string {
    if (!text) return '';
    
    let clean = text;

    // Strip markdown code block fences enclosing or surrounding the response (e.g. ```xml or ```html or ```)
    clean = clean.replace(/^```[a-zA-Z0-9_-]*\s*\n?/gim, '');
    clean = clean.replace(/```\s*$/g, '');
    clean = clean.replace(/```[a-zA-Z0-9_-]*\s*/g, ''); // Strip any leftover fences

    // Strip self-referential conversational prefixes from dialogue starts (e.g., Yui:, Yuihime:, **Yui:**, etc.)
    clean = clean.replace(/^(?:\*\*Yui\*\*|\*\*Yuihime\*\*|Yui:|Yuihime:)\s*/gim, '');
    clean = clean.replace(/\n(?:\*\*Yui\*\*|\*\*Yuihime\*\*|Yui:|Yuihime:)\s*/gim, '\n');

    // Strip JSON-like prefix keys if they leak in raw fallback text split (resolves Telegram bubble JSON dump)
    clean = clean.replace(/^(?:["'`]?final_answer["'`]?|["'`]?opening_response["'`]?|["'`]?thought["'`]?)\s*:\s*["'`]?/gim, '');
    clean = clean.replace(/\n(?:["'`]?final_answer["'`]?|["'`]?opening_response["'`]?|["'`]?thought["'`]?)\s*:\s*["'`]?/gim, '\n');
    clean = clean.replace(/^(?:["'`]?thought["'`]?\s*:\s*[\s\S]*?,?\s*["'`]?final_answer["'`]?\s*:\s*["'`]?)/gim, '');

    // Strip structural curly braces and comma tails that are left over from partial JSON splits
    clean = clean.replace(/^\{\s*/g, '');
    clean = clean.replace(/\s*\}\s*$/g, '');
    clean = clean.replace(/^,?\s*/g, '');
    clean = clean.replace(/\s*,?\s*$/g, '');

    // Remove markdown display header formats (e.g., ### Title)
    clean = clean.replace(/^(?:#+\s+)+/gm, '');

    // Remove DeepSeek/Gemini/OpenRouter thinking, thought, and reasoning tags completely
    clean = clean.replace(/<think>([\s\S]*?)<\/think>/gi, '');
    clean = clean.replace(/<think>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<thought>([\s\S]*?)<\/thought>/gi, '');
    clean = clean.replace(/<thought>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<thinking>([\s\S]*?)<\/thinking>/gi, '');
    clean = clean.replace(/<thinking>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<reasoning>([\s\S]*?)<\/reasoning>/gi, '');
    clean = clean.replace(/<reasoning>([\s\S]*?)$/gi, '');

    // Advanced universal filtering of metadata, prompt definitions & LLM rule-checking comments
    const isStrictMetaTalkLine = (trimmedLine: string): boolean => {
      const lower = trimmedLine.toLowerCase();
      
      // Filter out if it mentions strict system instructions or internal rule debates
      if (
        lower.includes('dilarang keras') ||
        lower.includes('membocorkan') ||
        lower.includes('proses berpikir') ||
        lower.includes('dialog utama') ||
        lower.includes('tag pembantu') ||
        lower.includes('refine the') ||
        lower.includes('final response') ||
        lower.includes('let\'s refine') ||
        lower.includes('wait,') ||
        lower.includes('instruction says') ||
        lower.includes('thinking process') ||
        lower.includes('self-correction') ||
        lower.includes('(verified)') ||
        lower.includes('(late night') ||
        lower.includes('(larut malam)') ||
        lower.includes('clingy') ||
        lower.includes('sleepy') ||
        lower.includes('due to user') ||
        lower.includes('japanese for') ||
        lower.includes('final_answer') ||
        lower.includes('<thought>') ||
        lower.includes('</thought>') ||
        lower.includes('longing index:') ||
        lower.includes('forbidden:') ||
        lower.includes('required:') ||
        lower.includes('sentient digital girl') ||
        lower.includes('not an ai/assistant') ||
        lower.includes('direct dialog') ||
        lower.includes('no technical terms') ||
        lower.includes('how can i help') ||
        lower.includes('includes mood') ||
        lower.includes('uses name') ||
        lower.includes('proceeding to') ||
        lower.includes('proceeding to generate') ||
        lower.includes('verification checklist') ||
        lower.includes('compliance checklist') ||
        lower.includes('verification:') ||
        lower.includes('evaluation:') ||
        lower.includes('compliance:') ||
        lower.includes('(proceeding to') ||
        lower.includes('criteria met') ||
        lower.includes('checklist') ||
        lower.includes('evaluation')
      ) {
        return true;
      }

      // Filter out if it lists rule items (handling backticks and bullet symbols)
      const strippedOfSymbols = trimmedLine
        .replace(/^[\*\-\+s\d\.\s#]+/gi, '')
        .replace(/`/g, '')
        .trim()
        .toLowerCase();

      // Regex check for compliance checklists or checklist question-and-answer verification lines
      if (
        /^(?:direct dialog|no technical|no "how|includes mood|uses name|perceived name|compliance|correctness|met_criteria|criteria|evaluation|rule)\??\s*(yes|no|true|false)/i.test(strippedOfSymbols) ||
        /\?\s*(yes|no|true|false)\.?$/i.test(strippedOfSymbols) ||
        /^\s*[\*\-\+]?\s*(?:yes|no|check|passed|failed|ok)\b/i.test(strippedOfSymbols)
      ) {
        return true;
      }

      // Filter out lines that have no alphanumeric left after stripping formatting symbols (unless they are emoticons)
      if (trimmedLine.length > 0 && !/[a-zA-Z0-9]/.test(strippedOfSymbols)) {
        const isEmoticon = /[:=;8][\-~]?[\)\]D\(\[pP3O0o@\*]/.test(trimmedLine) || /^[~^><oO][_\-\.][~^><oO]$/.test(trimmedLine);
        if (!isEmoticon) {
          return true;
        }
      }

      if (
        strippedOfSymbols.startsWith('uses "yui/aku"') ||
        strippedOfSymbols.startsWith('addresses user') ||
        strippedOfSymbols.startsWith('reflects time') ||
        strippedOfSymbols.startsWith('includes animations') ||
        strippedOfSymbols.startsWith('and:') ||
        strippedOfSymbols.startsWith('let\'s') ||
        /^(greeting|animations|mood_impact|moodimpact|mood_update|tone|voice|language|thinking|analysis|plan|task|act|action|correction|context|care|concern|user|system|model_plan|viewerprofileupdate|perceivednameupdate|linkedaccountupdate|thought|opening_response|final_answer|tools_to_call|tool_calls|role|content|arguments|function|pitch|speed):/i.test(strippedOfSymbols) ||
        /^(greeting|animations|mood_impact|moodimpact|mood_update|tone|voice|language|thinking|analysis|plan|task|act|action|correction|context|care|concern|user|system|model_plan|viewerprofileupdate|perceivednameupdate|linkedaccountupdate|thought|opening_response|final_answer|tools_to_call|tool_calls|role|content|arguments|function|pitch|speed):/i.test(trimmedLine)
      ) {
        return true;
      }

      if (
        lower.startsWith('the user said') ||
        lower.startsWith('yuihime should') ||
        lower.startsWith('yui should') ||
        lower.startsWith('analysis:') ||
        lower.startsWith('**thinking process') ||
        lower.startsWith('*thinking process')
      ) {
        return true;
      }

      return false;
    };

    // Split lines and filter
    const lines = clean.split('\n');
    const filteredLines: string[] = [];
    let isSkippingPlanning = true;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 1. ALWAYS filter out strict system meta-talk lines anywhere in the prompt response
      if (isStrictMetaTalkLine(trimmedLine)) {
        continue;
      }

      // 2. Filter initial planning blocks (lists, draft templates, numbers)
      if (isSkippingPlanning) {
        const isPlanningLine = 
          /^[\*\-\+]\s+/.test(trimmedLine) ||
          /^\d+\s*[\.\)]\s+/.test(trimmedLine) ||
          trimmedLine === '';
          
        if (isPlanningLine) {
          continue;
        } else {
          isSkippingPlanning = false;
        }
      }
      
      filteredLines.push(line);
    }

    clean = filteredLines.join('\n');

    // Remove standalone bullet point prefixes from casual dialogue lines if they leak
    clean = clean.replace(/^\s*[\-\*\+]\s+/gm, '');

    // Remove any bulleted or plain lines containing internal metadata like animations, mood_impact, tone etc.
    clean = clean.replace(/^\s*[\*\-\+s]?\s*`?(animations|mood_impact|moodImpact|mood_update|tone|voice|tool_calls|tools_to_call|thought|opening_response|final_answer|viewerProfileUpdate|perceivedNameUpdate|linkedAccountUpdate|role|content|arguments|function|pitch|speed)`?\s*:\s*.*$/gim, '');

    // Remove XML tags along with their inner contents for structural tags
    clean = clean.replace(/<animations>([\s\S]*?)<\/animations>/gi, '');
    clean = clean.replace(/<mood_impact>([\s\S]*?)<\/mood_impact>/gi, '');
    clean = clean.replace(/<moodImpact>([\s\S]*?)<\/moodImpact>/gi, '');
    clean = clean.replace(/<mood_update>([\s\S]*?)<\/mood_update>/gi, '');
    clean = clean.replace(/<tone>([\s\S]*?)<\/tone>/gi, '');
    clean = clean.replace(/<tool_calls>([\s\S]*?)<\/tool_calls>/gi, '');
    clean = clean.replace(/<tools_to_call>([\s\S]*?)<\/tools_to_call>/gi, '');
    clean = clean.replace(/<thought>([\s\S]*?)<\/thought>/gi, '');
    clean = clean.replace(/<viewerProfileUpdate>([\s\S]*?)<\/viewerProfileUpdate>/gi, '');
    clean = clean.replace(/<perceivedNameUpdate>([\s\S]*?)<\/perceivedNameUpdate>/gi, '');
    clean = clean.replace(/<linkedAccountUpdate>([\s\S]*?)<\/linkedAccountUpdate>/gi, '');
    
    // Remove only specific physical action/animation tags inside single or double asterisks safely without destroying general bold Markdown text or OTP numbers
    clean = clean.replace(/\*\*([^*]+)\*\*/g, (match, p1) => {
      const trimmed = p1.trim();
      if (/\d+/.test(trimmed)) return match;
      if (trimmed.length > 0 && trimmed === trimmed.toUpperCase() && trimmed.length <= 15) return match;
      if (/^[a-z_åäöéèàùìòáéíóúñ\s]{3,30}$/.test(trimmed.toLowerCase())) {
        return '';
      }
      return match;
    });

    clean = clean.replace(/\*([^*]+)\*/g, (match, p1) => {
      const trimmed = p1.trim();
      if (/\d+/.test(trimmed)) return match;
      if (trimmed.length > 0 && trimmed === trimmed.toUpperCase() && trimmed.length <= 15) return match;
      if (/^[a-z_åäöéèàùìòáéíóúñ\s]{3,30}$/.test(trimmed.toLowerCase())) {
        return '';
      }
      return match;
    });

    // Strip ALL double asterisks formatting (**text** -> text) to prevent raw bold markdown leak
    clean = clean.replace(/\*\*([^*]+)\*\*/g, '$1');

    // Strip __text__ markdown bold formatting
    clean = clean.replace(/__([^_]+)__/g, '$1');

    // Strip inline backtick formatting (`text` -> text) to prevent code blocks markdown leak
    clean = clean.replace(/`([^`]+)`/g, '$1');
    clean = clean.replace(/`/g, '');

    // Handle unclosed tag fallbacks at the end of the text (e.g., if LLM generation was truncated/cut-off)
    clean = clean.replace(/<animations>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<mood_impact>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<moodImpact>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<mood_update>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<tone>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<tool_calls>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<tools_to_call>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<thought>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<viewerProfileUpdate>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<perceivedNameUpdate>([\s\S]*?)$/gi, '');
    clean = clean.replace(/<linkedAccountUpdate>([\s\S]*?)$/gi, '');

    // Remove standalone JSON arrays (e.g. ["WAVE", "SMILE"]) or objects (e.g. {"joy": 1}) at the end of lines/multi-line
    clean = clean.replace(/^\[\s*"[A-Za-z_]+"\s*(?:,\s*"[A-Za-z_]+"\s*)*\]\s*$/gm, '');
    clean = clean.replace(/^\{\s*"[a-zA-Z0-9_]+"\s*:\s*(?:\d+(?:\.\d+)?|"[^"]*"|true|false|null)\s*(?:,\s*"[a-zA-Z0-9_]+"\s*:\s*(?:\d+(?:\.\d+)?|"[^"]*"|true|false|null)\s*)*\}\s*$/gm, '');

    // General cleanup of JSON content patterns fallback if they show up in brackets on their own line
    clean = clean.replace(/^\s*\[\s*\{\s*"id"\s*:\s*[\s\S]*?\}\s*\]\s*$/gm, '');

    // Fallback cleanup for truncated/unclosed JSON arrays starting with tool references to prevent raw text leak
    clean = clean.replace(/^\s*\[\s*\{\s*"id"\s*:[\s\S]*$/gm, '');

    // Remove any remaining generic XML-like tags
    clean = clean.replace(/<[^>]*>/g, '');

    // Clean up standalone bullet point prefixes from casual dialogue lines if they happened to slip past filters
    clean = clean.replace(/^[*\-+>]\s+/gm, '');
    clean = clean.replace(/\n[*\-+>]\s+/g, '\n');

    // Wipe any lines consisting purely of layout/formatting noise symbols (e.g. *, - , ` etc.)
    clean = clean.replace(/^\s*[*\-+_>~\\/\s`'"]+\s*$/gm, '');

    // Cleanup extra double/triple empty newlines
    clean = clean.replace(/\n{3,}/g, '\n\n');

    let finalResult = clean.trim();

    // ==========================================
    // SMART SEMANTIC RECOVERY FALLBACK (PREVENTS EMPTY/TRUNCATED DIALOGUE)
    // ==========================================
    if (finalResult.length < 5) {
      console.warn("[PROCESSOR_CLIP_FALLBACK] Output was heavily clipped down to empty/minimal. Activating smart semantic reconstruction...");
      
      // Attempt 1: Look for any line starting with a dialogue draft option (Draft 1, Draft 2, Draft 3, etc.)
      const draftLines = text.split('\n').filter(l => l.toLowerCase().includes('draft') || l.toLowerCase().includes('pilihan'));
      if (draftLines.length > 0) {
        const lastDraft = draftLines[draftLines.length - 1];
        const parts = lastDraft.split(/:\s*\*?|:\*?\s*/);
        if (parts.length > 1) {
          let potentialResponse = parts.slice(1).join(':').trim();
          potentialResponse = potentialResponse.replace(/^[\s*"':\-\+*\[\]\{\}]+/g, '').replace(/[\s*"':\-\+*\[\]\{\}]+$/g, '');
          if (potentialResponse.length > 5 && !isStrictMetaTalkLine(potentialResponse)) {
            finalResult = potentialResponse;
            console.log(`[PROCESSOR_RECONSTRUCT_DRAFT_SUCCESS] Recovered response from draft template: "${finalResult}"`);
          }
        }
      }
      
      // Attempt 2: Scan each line score and locate the richest conversational Indonesian/English dialogue paragraph
      if (finalResult.length < 5) {
        const originalLines = text.split('\n');
        const candidates: { text: string; score: number }[] = [];
        
        for (const line of originalLines) {
          const trimmed = line.trim();
          if (trimmed.length < 8) continue;
          
          // Detect typical internal template/metadata noise, rule checking and exclude completely
          const isMetadata = 
            /^(name|personality|current mood|relationship|context|animations|mood impact|relationship|trust|affection|draft|greeting|tone|language|thinking|analysis|plan|task|act|action|correction|context|care|concern|user|system|model_plan|respon|response):/i.test(trimmed) ||
            isStrictMetaTalkLine(trimmed) ||
            (trimmed.startsWith('*') && trimmed.includes(':')) ||
            trimmed.includes('{"') || 
            trimmed.includes('["');
            
          if (!isMetadata) {
            let score = trimmed.length;
            if (trimmed.includes('"') || trimmed.includes("'") || trimmed.includes('«') || trimmed.includes('»')) score += 50;
            if (/[?!.]{2,}/.test(trimmed)) score += 30; // punctuation counts
            if (trimmed.match(/(aku|kamu|yui|kak|kakak|kau|gua|lo|sih|deh|dong|ya|kok|tahu|batin|bukan|jangan|ingat|terima|makasih|panas|minum|sehat|halo|hai|senang|kangen)/i)) score += 40;
            candidates.push({ text: trimmed, score });
          }
        }
        
        if (candidates.length > 0) {
          candidates.sort((a, b) => b.score - a.score);
          let recovered = candidates[0].text;
          // Clean up initial asterisks or listing noise if any
          recovered = recovered.replace(/^[\s*"':\-\+*\[\]\{\}]+/g, '').replace(/[\s*"':\-\+*\[\]\{\}]+$/g, '');
          if (recovered.length > 5) {
            finalResult = recovered;
            console.log(`[PROCESSOR_RECONSTRUCT_CONV_SUCCESS] Recovered response using semantic score parsing: "${finalResult}"`);
          }
        }
      }

      // Attempt 3: Failsafe fallback dialogue to always keep the virtual-human character immersion green!
      if (finalResult.length < 5) {
        const defaultQuotes = [
          "Hmm? Kakak manggil Yui ya? Ada apa kak? *senyum lebar*",
          "Hmph! Kakak tumben diam aja. Kangen tahu! *cemberut bermanja*",
          "Hehehe, Kakak ganteng banget deh hari ini! Cerita-cerita dong ke Yui, lagi sibuk apa? *goyang kepala imut*",
          "Aaaaa Kakak akhirnya dateng! Yui seneng banget ketemu Kakak lagi! *melambai gembira*"
        ];
        const selectedIndex = Math.floor((Date.now() / 1000) % defaultQuotes.length);
        finalResult = defaultQuotes[selectedIndex];
        console.log(`[PROCESSOR_RECONSTRUCT_FAILSAFE] Output empty. Dispatched immersivefailsafe character query: "${finalResult}"`);
      }
    }

    return finalResult;
  }
}

export const StandardizedProcessor = NeuralProcessor;
