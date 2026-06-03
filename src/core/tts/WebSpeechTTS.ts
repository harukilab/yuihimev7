import { TTSModule, ModuleType } from '../../include/types';

export const WebSpeechTTS: TTSModule = {
  metadata: {
    id: 'browser',
    name: 'Browser Web Speech',
    description: 'Native browser text-to-speech engine.',
    version: '1.0.0',
    type: ModuleType.TTS,
    order: 1
  },
  speak: async (text: string, config: any) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      const lang = config.lang || 'id-ID';
      utterance.lang = lang;

      // Try to find a voice for the language
      const voices = window.speechSynthesis.getVoices();
      const langVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (langVoice) utterance.voice = langVoice;

      if (config.pitch) utterance.pitch = config.pitch;
      if (config.speed) utterance.rate = config.speed;
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      window.speechSynthesis.speak(utterance);
    });
  }
};
