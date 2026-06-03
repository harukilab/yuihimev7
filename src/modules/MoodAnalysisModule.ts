import { CortexModule, ModuleType } from '../include/types';

export const MoodAnalysisModule: CortexModule = {
  metadata: {
    id: 'mood-analyzer',
    name: 'Emotional Intelligence',
    description: 'Analyzes user sentiment to adjust internal mood state.',
    version: '1.0.0',
    type: ModuleType.CORTEX,
    order: 1,
    phase: 'pre-process'
  },
  run: async (input) => {
    const stressKeywords = ['bad', 'hate', 'stupid', 'bored', 'angry', 'error', 'wrong'];
    const joyKeywords = ['good', 'love', 'happy', 'cool', 'amazing', 'perfect', 'thanks'];
    
    let shift = { joy: 0, stress: 0 };
    const lowerInput = (input || "").toLowerCase();
    
    stressKeywords.forEach(w => { if (lowerInput.includes(w)) shift.stress += 5; });
    joyKeywords.forEach(w => { if (lowerInput.includes(w)) shift.joy += 5; });
    
    return { moodShift: shift };
  }
};
