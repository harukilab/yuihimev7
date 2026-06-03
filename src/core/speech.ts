import { ProviderConfig, MoodState, AgentState, CortexModule } from "../include/types";
import { StorageService } from "../drivers/storage";
import { SystemRegistry } from "./registry";

export class SpeechService {
  private static synth: SpeechSynthesis = window.speechSynthesis;
  private static voice: SpeechSynthesisVoice | null = null;
  private static enabled: boolean = true;
  private static onSpeakListeners: ((speaking: boolean) => void)[] = [];
  private static onProgressListeners: ((charIndex: number) => void)[] = [];
  private static onVolumeListeners: ((volume: number) => void)[] = [];
  
  private static audioContext: AudioContext | null = null;
  private static analyser: AnalyserNode | null = null;
  private static dataArray: Uint8Array | null = null;
  private static isAnalyzing: boolean = false;

  static subscribe(listener: (speaking: boolean) => void) {
    this.onSpeakListeners.push(listener);
    return () => {
      this.onSpeakListeners = this.onSpeakListeners.filter(l => l !== listener);
    };
  }

  static subscribeProgress(listener: (charIndex: number) => void) {
    this.onProgressListeners.push(listener);
    return () => {
      this.onProgressListeners = this.onProgressListeners.filter(l => l !== listener);
    };
  }

  static subscribeVolume(listener: (volume: number) => void) {
    this.onVolumeListeners.push(listener);
    return () => {
      this.onVolumeListeners = this.onVolumeListeners.filter(l => l !== listener);
    };
  }

  private static notify(speaking: boolean) {
    this.onSpeakListeners.forEach(l => l(speaking));
  }

  private static notifyProgress(charIndex: number) {
    this.onProgressListeners.forEach(l => l(charIndex));
  }

  private static notifyVolume(volume: number) {
    this.onVolumeListeners.forEach(l => l(volume));
  }

  static init() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      this.voice = voices.find(v => v.name.includes('Google') && v.name.includes('Female')) || 
                   voices.find(v => v.name.includes('Female')) || 
                   voices[0];
    };

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }

  static setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.synth.cancel();
  }

  static isEnabled() {
    return this.enabled;
  }

  static isSpeaking() {
    return this.synth.speaking;
  }

  private static async analyzeAudioStream(stream: MediaStream | HTMLAudioElement) {
    try {
      if (!this.audioContext) return;
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = stream instanceof MediaStream 
        ? this.audioContext.createMediaStreamSource(stream)
        : this.audioContext.createMediaElementSource(stream);
        
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      
      if (stream instanceof HTMLAudioElement) {
        this.analyser.connect(this.audioContext.destination);
      }

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.isAnalyzing = true;

      const analyze = () => {
        if (!this.isAnalyzing || !this.analyser || !this.dataArray) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += this.dataArray[i];
        }
        const volume = sum / bufferLength / 255;
        this.notifyVolume(volume);
        
        requestAnimationFrame(analyze);
      };

      analyze();
    } catch (e) {
      console.warn("Audio analysis stream link failed - likely browser policy block:", e);
      this.stopAnalysis();
    }
  }

  private static stopAnalysis() {
    this.isAnalyzing = false;
    this.notifyVolume(0);
  }

  static async speak(text: string, mood?: Partial<MoodState>, tone?: { pitch: number; speed: number; emotionalBias: string }) {
    if (!this.enabled || !text) return;
    
    // Remove animation cues and asterisk-wrapped actions before speaking
    const cleanText = text
      .replace(/\[[A-Z_]+(?::[^\]]+)?\]/g, '') // Remove [WAVE]
      .replace(/\*+.*?\*+/g, '')               // Remove *waves* or **smiles**
      .replace(/\(.*?\)/g, '')                 // Remove (smiles)
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!cleanText) return;
    
    // Resume context if needed (browser requires user interaction which we assume happened as this is called via button click or similar)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try { await this.audioContext.resume(); } catch (e) {}
    }

    const settings = await StorageService.getModularSettings();
    const providerId = settings.ttsProvider || 'browser';
    const ttsModule = SystemRegistry.getTTS(providerId);

    const lang = SpeechService.detectLanguage(cleanText);

    const ttsSelector = SystemRegistry.getModule<CortexModule>('tts-selector');

    if (ttsSelector) {
      this.notify(true);
      await ttsSelector.run(cleanText, {} as AgentState, { 
        lang,
        mood,
        pitch: tone?.pitch,
        speed: tone?.speed
      });
      this.notify(false);
    } else {
      // Emergency Fallback if registry fails
      this.speakBrowser(cleanText, mood, tone);
    }
  }

  public static detectLanguage(text: string): string {
    // Japanese often contains Hiragana/Katakana or Kanji in a specific range
    const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    if (jpRegex.test(text)) return 'ja-JP';

    // Indonesian keywords
    const idKeywords = /\b(yang|dan|di|ini|adalah|saya|kamu|kita|mereka|dengan|untuk|pada|dari|oleh|ke|juga|bisa|ada|tidak|sudah|kalau|akan|itu|anda|kami|banget|kok|sih|deh|kan|yah)\b/i;
    
    // English keywords
    const enKeywords = /\b(the|and|is|it|you|that|was|for|on|are|with|as|at|be|this|have|from|what|all|were|but|not|when|your|can|said|there|use|an|each|which|she|do|how|their|if|will|up|other|about|out|then|them|these|so|some|her|would|make|like|him|into|time|has|look|two|more|write|go|see|number|no|way|could|people|my|than|first|water|been|call|who|oil|its|now|find)\b/i;

    if (idKeywords.test(text)) return 'id-ID';
    if (enKeywords.test(text)) return 'en-US';
    
    return 'id-ID'; // Default to Indonesian for Yuihime context
  }

  private static speakBrowser(text: string, mood?: Partial<MoodState>, tone?: { pitch: number; speed: number; emotionalBias: string }) {
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const lang = this.detectLanguage(text);
    utterance.lang = lang;

    // Pick a voice for the detected language if possible
    const voices = this.synth.getVoices();
    const langVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0])) || this.voice;
    if (langVoice) utterance.voice = langVoice;

    // Default prosody
    let pitch = tone?.pitch ?? 1.1;
    let rate = tone?.speed ?? 1.0;

    // Mood-based prosody if no explicit tone provided
    if (!tone && mood) {
      if (mood.excitement > 50) {
        pitch = 1.4;
        rate = 1.2;
      } else if (mood.joy > 70) {
        pitch = 1.2;
        rate = 1.1;
      } else if (mood.sadness > 40) {
        pitch = 0.8;
        rate = 0.85;
      } else if (mood.anger > 40) {
        pitch = 0.9;
        rate = 1.15;
      } else if (mood.embarrassment > 50) {
        pitch = 1.3;
        rate = 0.95;
      }
    }

    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.notify(true);
      // Fallback fake volume for browser TTS since we can't easily capture its output stream
      this.startFauxVolume();
    };
    utterance.onend = () => {
      this.stopFauxVolume();
      this.notifyProgress(-1);
      this.notify(false);
    };
    utterance.onerror = () => {
      this.stopFauxVolume();
      this.notifyProgress(-1);
      this.notify(false);
    };
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        this.notifyProgress(event.charIndex);
      }
    };

    this.synth.speak(utterance);
  }

  private static fauxVolumeInterval: any = null;
  private static startFauxVolume() {
    this.stopFauxVolume();
    let frame = 0;
    this.fauxVolumeInterval = setInterval(() => {
      frame++;
      // Create a more speech-like envelope using multiple sine waves
      const base = Math.sin(frame * 0.15) * 0.2 + 0.3;
      const detailing = Math.sin(frame * 0.8) * 0.1;
      const noise = Math.random() * 0.15;
      
      // Occasionally "pause" for breath/syllables
      const gating = Math.sin(frame * 0.05) > -0.6 ? 1 : 0;
      
      const volume = (base + detailing + noise) * gating;
      this.notifyVolume(Math.max(0, Math.min(1.0, volume)));
    }, 40);
  }
  private static stopFauxVolume() {
    if (this.fauxVolumeInterval) {
      clearInterval(this.fauxVolumeInterval);
      this.fauxVolumeInterval = null;
    }
    this.notifyVolume(0);
  }

  static stop() {
    this.synth.cancel();
    this.stopAnalysis();
    this.stopFauxVolume();
    this.notify(false);
  }
}
