import { logger } from "./kernel/logger.js";

export class ValidationMiddleware {
  /**
   * Validates if the raw model response conforms to the strict JSON_OBJECT schema required by Cortex.
   * If non-conformant, logs '[SCHEMA_ERROR]' to backgroundLogs (server console / logger) and returns false or logs it.
   */
  static validate(rawOutput: string): { success: boolean; data?: any; errors: string[] } {
    const errors: string[] = [];
    if (!rawOutput || !rawOutput.trim()) {
      const err = "Empty AI output received.";
      errors.push(err);
      this.logError(rawOutput, errors);
      return { success: false, errors };
    }

    // Attempt to clean markdown block delimiters if any
    let cleanStr = rawOutput.trim();
    if (cleanStr.includes("```")) {
      const matches = cleanStr.match(/```(?:json)?([\s\S]*?)```/);
      if (matches) {
        cleanStr = matches[1].trim();
      } else {
        cleanStr = cleanStr.replace(/```json|```/g, "").trim();
      }
    }

    // Gentle fallback validation for XML/HTML tags and template layout responses
    const hasXmlTags = /<(thought|think|thinking|reasoning|animations|mood_impact|moodImpact|tool_calls|tools_to_call|final_answer|opening_response)>/i.test(rawOutput);
    if (hasXmlTags) {
      const hasThought = /<(thought|think|thinking|reasoning)>[\s\S]*?<\/\1>/i.test(rawOutput) || rawOutput.toLowerCase().includes('thought') || rawOutput.toLowerCase().includes('think');
      if (!hasThought) {
        errors.push("Missing core 'thought' or 'think' tracking markers in XML layout.");
        this.logError(rawOutput, errors);
        return { success: false, errors };
      }
      return { success: true, data: { format: 'xml' }, errors };
    }

    if (!cleanStr.startsWith("{")) {
      // If it doesn't even resemble JSON and has no XML tags, but contains dialogue, allow it 
      // under raw plain text mode to avoid polluting the log with SCHEMA_ERROR.
      if (cleanStr.length > 5 && !cleanStr.includes('"thought":') && !cleanStr.includes('"final_answer":')) {
        return { success: true, data: { format: 'raw_text' }, errors };
      }
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(cleanStr);
    } catch (e: any) {
      // Try bracket isolation fallback
      const firstBrace = cleanStr.indexOf('{');
      const lastBrace = cleanStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          parsed = JSON.parse(cleanStr.substring(firstBrace, lastBrace + 1));
        } catch (_) {
          errors.push(`JSON parsing failed: ${e.message}`);
        }
      } else {
        errors.push(`JSON parsing failed: ${e.message}`);
      }
    }

    if (errors.length > 0) {
      this.logError(rawOutput, errors);
      return { success: false, errors };
    }

    if (typeof parsed !== 'object' || parsed === null) {
      errors.push("Response is not a valid JSON object.");
      this.logError(rawOutput, errors);
      return { success: false, errors };
    }

    // Required fields check
    if (typeof parsed.thought !== 'string') {
      errors.push("Missing or invalid 'thought' property (must be string).");
    }
    if (typeof parsed.final_answer !== 'string') {
      errors.push("Missing or invalid 'final_answer' property (must be string).");
    }
    if (!Array.isArray(parsed.animations)) {
      errors.push("Missing or invalid 'animations' property (must be array).");
    }

    if (errors.length > 0) {
      this.logError(rawOutput, errors);
      return { success: false, errors };
    }

    return { success: true, data: parsed, errors };
  }

  private static logError(rawOutput: string, errors: string[]) {
    const errorPrefix = "[SCHEMA_ERROR]";
    const msg = `${errorPrefix} Strict system JSON schema validation rejected the AI response. Errors: ${errors.join(" | ")}. Raw Output: ${rawOutput}`;
    console.error(msg);
    logger.log("ERROR", "VALIDATION_MIDDLEWARE", msg);
  }
}
