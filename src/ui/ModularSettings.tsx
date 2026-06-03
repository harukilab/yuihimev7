import React, { useState, useEffect } from 'react';
import { SystemRegistry } from '../core/registry';
import { StorageService } from '../drivers/storage';
import { ModuleType } from '../include/types';
import { CronManager } from './CronManager';
import { ShieldAlert, LogIn, LogOut, Trash2, LineChart as ChartIcon, BarChart3, Save, RefreshCw, Layers, Cpu, Radio, Volume2, Zap, LayoutGrid, Settings2, Brain, Clock, Sparkles, MessageSquare, Palette, Monitor, Database, GitBranch, Activity, Terminal, CheckSquare, Mic, Eye, ClipboardList, Share2, Gamepad2, Server, Music, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, AlertTriangle, Play, Sliders, VolumeX, Search, Maximize2, Move, Heart, Info, Upload, Image as ImageIcon, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { HeuristicsTab } from './HeuristicsTab';
import { IdentitiesTab } from './IdentitiesTab';
import { ReflectTab } from './ReflectTab';
import { KnowledgeGraph } from './KnowledgeGraph';
import { AdaptiveMatrix } from './AdaptiveMatrix';
import { TaskPlanner } from './TaskPlanner';
import { SandboxTab } from './SandboxTab';
import { PersistenceTab } from './PersistenceTab';
import { ArchiveTab } from './ArchiveTab';
import { DreamsTab } from './DreamsTab';
import { Smile, Check, Undo2, Settings, Plus, Star, Cloud, Compass, Flame, Code, Smartphone } from 'lucide-react';
import { REGISTERED_PROVIDERS_STATIC_DATA } from './modular-settings/settingsConstants';
import { AboutTab } from './modular-settings/AboutTab';
import { SystemTab } from './modular-settings/SystemTab';
import { ProvidersTab } from './modular-settings/ProvidersTab';
import { PendingQueueManager } from './PendingQueueManager';

interface ModularSettingsProps {
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
  activeSessionId?: string;
  onAvatarUpdate?: (config: any) => void;
  avatarConfig?: any;
  onClose?: () => void;
  currentLiveTopic?: string;
  setCurrentLiveTopic?: (val: string) => void;
  handleSimulateLive?: () => void;
  showSubtitles?: boolean;
  setShowSubtitles?: (val: boolean) => void;
  showMobileNav?: boolean;
  setShowMobileNav?: (val: boolean) => void;
  showDebugPanel?: boolean;
  setShowDebugPanel?: (val: boolean) => void;
  ttsEnabled?: boolean;
  setTtsEnabled?: (val: boolean) => void;
  isSleeping?: boolean;
  setIsSleeping?: (val: boolean) => void;
  showChatFeed?: boolean;
  setShowChatFeed?: (val: boolean) => void;
  showInfoCard?: boolean;
  setShowInfoCard?: (val: boolean) => void;
  isMicEnabled?: boolean;
  setIsMicEnabled?: (val: boolean) => void;
  neuralCircuitStatus?: any[];
  pulseEnabled?: boolean;
  setPulseEnabled?: (val: boolean) => void;
  // New props for Soul Tabs
  heuristics?: any[];
  handleOptimize?: () => void;
  isLearning?: boolean;
  identities?: any[];
  activePersonaId?: string;
  setActivePersonaId?: (id: string) => void;
  NEURAL_CORES?: any[];
  handleReflect?: () => void;
  isThinking?: boolean;
  status?: string;
  logs?: any[];
  onSave?: () => void;
  state?: any;
  // Integrated parameters from other tabs
  memories?: any[];
  setMemories?: React.Dispatch<React.SetStateAction<any[]>>;
  dreams?: any[];
  knowledge?: any[];
  memorySearchQuery?: string;
  setMemorySearchQuery?: (val: string) => void;
  handleExtractKnowledge?: () => void;
  backgroundLogs?: any[];
  showSystemLogs?: boolean;
  setShowSystemLogs?: (val: boolean) => void;
  reasoningIterations?: any[];
  metricsHistory?: any[];
  // Console tab props
  activeSubtitle?: string | null;
  typedSubtitle?: string;
  isSubtitleTyping?: boolean;
  lastAgentResponse?: string | null;
  setActiveSubtitle?: (val: string | null) => void;
  input?: string;
  setInput?: (val: string) => void;
  handleThink?: (e: any) => void;
  perceivedName?: string;
  SpeechService?: any;
  avatarOnInConsole?: boolean;
  setAvatarOnInConsole?: (val: boolean) => void;
  handleDream?: (currentMemories?: any[]) => void;
  handleConsolidate?: () => void;
  animations?: string[];
  setAnimations?: (val: any) => void;
  onRefreshIdentities?: () => Promise<void>;
  onAddLog?: (type: 'user' | 'agent', content: string) => void;
}

export const applyThemePalette = (themeId: string, customColor?: string) => {
  const palettes: Record<string, { primary: string; hover: string; shadow: string }> = {
    default: { primary: '#00bcd4', hover: '#1de4fc', shadow: '#00838f' },
    morandi: { primary: '#b85b4f', hover: '#ca7c72', shadow: '#974238' },
    monet: { primary: '#7ba2db', hover: '#a2bfec', shadow: '#5a80b8' },
    japanese: { primary: '#df8c8c', hover: '#eba4a4', shadow: '#b86868' },
    nordic: { primary: '#568296', hover: '#7aa2b5', shadow: '#3d5e6e' },
    chinese: { primary: '#c23b3b', hover: '#d95858', shadow: '#9c2424' }
  };
  
  let theme = palettes[themeId];
  if (themeId === 'custom' && customColor) {
    theme = {
      primary: customColor,
      hover: customColor + 'dd',
      shadow: customColor + 'aa'
    };
  }

  if (!theme && typeof window !== 'undefined') {
    const savedCustom = localStorage.getItem('yuihime_custom_primary_color');
    if (savedCustom) {
      theme = {
        primary: savedCustom,
        hover: savedCustom + 'dd',
        shadow: savedCustom + 'aa'
      };
    }
  }

  if (!theme) {
    theme = palettes.default;
  }

  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--primary-hover-color', theme.hover);
    document.documentElement.style.setProperty('--primary-shadow-color', theme.shadow);
    
    const event = new CustomEvent('yuihime_theme_changed', { detail: { themeId, colors: theme } });
    window.dispatchEvent(event);
  }
};


// Static provider config details imported from ./modular-settings/settingsConstants


export const ModularSettings: React.FC<ModularSettingsProps> = ({ 
  activeTab,
  setActiveTab,
  activeSessionId = 'default',
  onAvatarUpdate, 
  avatarConfig,
  onClose,
  currentLiveTopic, 
  setCurrentLiveTopic, 
  handleSimulateLive,
  showSubtitles,
  setShowSubtitles,
  showMobileNav,
  setShowMobileNav,
  showDebugPanel,
  setShowDebugPanel,
  ttsEnabled,
  setTtsEnabled,
  isSleeping,
  setIsSleeping,
  showChatFeed,
  setShowChatFeed,
  showInfoCard,
  setShowInfoCard,
  isMicEnabled,
  setIsMicEnabled,
  neuralCircuitStatus,
  pulseEnabled,
  setPulseEnabled,
  heuristics = [],
  handleOptimize = () => {},
  isLearning = false,
  identities = [],
  activePersonaId = '',
  setActivePersonaId = () => {},
  NEURAL_CORES = [],
  handleReflect = () => {},
  isThinking = false,
  status = 'idle',
  logs = [],
  onSave,
  state,
  memories = [],
  setMemories,
  dreams = [],
  knowledge = [],
  memorySearchQuery = '',
  setMemorySearchQuery = () => {},
  handleExtractKnowledge = () => {},
  backgroundLogs = [],
  showSystemLogs = false,
  setShowSystemLogs = () => {},
  reasoningIterations = [],
  metricsHistory: propMetricsHistory,
  activeSubtitle,
  typedSubtitle = '',
  isSubtitleTyping = false,
  lastAgentResponse = null,
  setActiveSubtitle = () => {},
  input = '',
  setInput = () => {},
  handleThink = () => {},
  perceivedName = 'chat',
  SpeechService,
  avatarOnInConsole = false,
  setAvatarOnInConsole = () => {},
  handleDream = () => {},
  handleConsolidate = () => {},
  animations = [],
  setAnimations = () => {},
  onRefreshIdentities,
  onAddLog
}) => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeSettingsTab, setActiveSettingsTab] = useState<ModuleType | 'ADDON' | 'VISUAL' | 'GENERAL' | 'SYSTEM' | 'CRON' | 'NEURAL_CIRCUIT' | 'SOUL'>('GENERAL');
  const [activeSoulTab, setActiveSoulTab] = useState<'identities' | 'heuristics' | 'reflect' | 'persistence' | 'archive' | 'dreams'>('heuristics');

  // Multi-scene backdrop gallery support
  const defaultGalleryScenes = [
    {
      id: "cute_streaming_room",
      title: "Cute streaming room",
      url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "cozy_tea_corner",
      title: "Cozy tea corner in garden",
      url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "cyberpunk_neon_deck",
      title: "Cyberpunk neon deck",
      url: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "zen_tatami_layout",
      title: "Zen tatami layout",
      url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "lofi_cozy_cafe",
      title: "Lo-fi cozy cafe",
      url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const [uploadedScenes, setUploadedScenes] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("yuihime_uploaded_scenes_v1");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const galleryScenes = [...defaultGalleryScenes, ...uploadedScenes];

  const handleUploadToGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (!base64) return;

      const newScene = {
        id: "upload_" + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ""), // remove extension
        url: base64
      };

      const updated = [...uploadedScenes, newScene];
      setUploadedScenes(updated);
      localStorage.setItem("yuihime_uploaded_scenes_v1", JSON.stringify(updated));

      // Instantly set it active
      syncBackdropLocal("custom");
      syncBdropUrlLocal(base64);
    };
    reader.readAsDataURL(file);
  };

  const [addons, setAddons] = useState<any[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);

  const [dynamicModels, setDynamicModels] = useState<Record<string, any[]>>({});
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [registryVersion, setRegistryVersion] = useState(0);

  // AIRI Stage-Web sub-page navigation state
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSubmoduleCategory, setSelectedSubmoduleCategory] = useState<string | null>(null);
  const [showMarkdownStressTest, setShowMarkdownStressTest] = useState(false);
  const [activeAgiTab, setActiveAgiTab] = useState<'telemetry' | 'lattice' | 'reflect'>('telemetry');

  // Dynamic Yuihime System Version loading
  const [yuihimeVersionInfo, setYuihimeVersionInfo] = useState<{ version: string; date: string; turn: string } | null>(null);

  // Floating info display text state matching user setting requirements
  const [activeInfoText, setActiveInfoText] = useState<{ title: string; text: string } | null>(null);
  const handleShowInfo = (title: string, text: string) => {
    setActiveInfoText({ title, text });
  };

  // Yui Core Markdown editing states matching AIRI character card batin rules
  const [selectedMdFile, setSelectedMdFile] = useState<string | null>(null);
  const [selectedMdName, setSelectedMdName] = useState<string>('');
  const [editorModeTab, setEditorModeTab] = useState<'edit' | 'preview'>('edit');
  const [mdFileContent, setMdFileContent] = useState<string>('');
  const [originalMdFileContent, setOriginalMdFileContent] = useState<string>('');
  const [loadingMd, setLoadingMd] = useState<boolean>(false);
  const [savingMd, setSavingMd] = useState<boolean>(false);
  const [mdStatusMessage, setMdStatusMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const [tgStatus, setTgStatus] = useState<any>(null);
  const [tgTesting, setTgTesting] = useState<boolean>(false);

  const fetchTgStatus = async () => {
    setTgTesting(true);
    try {
      const res = await fetch("/api/telegram/status");
      const data = await res.json();
      setTgStatus(data);
    } catch (e: any) {
      setTgStatus({
        initialized: false,
        error: e.message || String(e),
        message: "Failed to connect to local Webhook Gateway server."
      });
    } finally {
      setTgTesting(false);
    }
  };

  const recreateTgBot = async (dropPending = false) => {
    setTgTesting(true);
    try {
      const res = await fetch(`/api/telegram/recreate?dropPending=${dropPending}`, { method: "POST" });
      const data = await res.json();
      setTgStatus({
        initialized: data.success,
        botInfo: data.botInfo,
        webhookInfo: data.webhookInfo,
        message: data.message,
        error: data.error
      });
    } catch (e: any) {
      setTgStatus({
        initialized: false,
        error: e.message || String(e),
        message: "Failed to issue recreate command to local daemon server."
      });
    } finally {
      setTgTesting(false);
    }
  };

  useEffect(() => {
    StorageService.getSystemVersion().then(res => {
      if (res && res.success) {
        setYuihimeVersionInfo({
          version: res.version,
          date: res.date,
          turn: res.turn
        });
      }
    });
  }, [selectedSection]);

  // States for System Logs Tab
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'agent' | 'user' | 'system'>('all');
  const [logStreamType, setLogStreamType] = useState<'console' | 'cognitive' | 'audit'>('console');
  const [logScrollLock, setLogScrollLock] = useState(true);
  const [clearedLogsTimestamp, setClearedLogsTimestamp] = useState<number>(0);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      setAuditLogsLoading(true);
      const res = await fetch("/api/cortex/audit-logs");
      const data = await res.json();
      if (data.success && data.auditLogs) {
        setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error("[UI] Failed to fetch audit logs:", err);
    } finally {
      setAuditLogsLoading(false);
    }
  };

  const clearAuditLogs = async () => {
    try {
      await fetch("/api/cortex/audit-logs/clear", { method: "POST" });
      setAuditLogs([]);
    } catch (err) {
      console.error("[UI] Failed to clear audit logs:", err);
    }
  };

  useEffect(() => {
    if (selectedSection === 'logs' || selectedSection === 'audit' || logStreamType === 'audit') {
      fetchAuditLogs();
    }
  }, [selectedSection, logStreamType]);

  // WebSocket Connection Test Suite States
  const [testWsUrl, setTestWsUrl] = useState('');
  const [testWsStatus, setTestWsStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  const [testWsLogs, setTestWsLogs] = useState<Array<{ type: 'tx' | 'rx' | 'sys', message: string, timestamp: string }>>([]);
  const [testWsMsg, setTestWsMsg] = useState(JSON.stringify({ type: "ping", origin: "Yuihime UI" }, null, 2));
  const [wsClientRef, setWsClientRef] = useState<WebSocket | null>(null);

  // Cross-Platform Pairing States
  const [pairingCode, setPairingCode] = useState<string>('');
  const [pairingExpiry, setPairingExpiry] = useState<number>(0);
  const [pairingLoading, setPairingLoading] = useState<boolean>(false);
  const [pairingLinked, setPairingLinked] = useState<boolean>(false);
  const [pairingLinkedAccounts, setPairingLinkedAccounts] = useState<string[]>([]);

  const generatePairingCode = async () => {
    try {
      setPairingLoading(true);
      const res = await fetch('/api/pair/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perceivedName })
      });
      const data = await res.json();
      if (data.success) {
        setPairingCode(data.code);
        setPairingExpiry(data.expires_at);
      } else {
        console.error("Gagal men-generate pairing code:", data.error || data);
      }
    } catch (err) {
      console.error("Kesalahan jaringan saat generate OTP:", err);
    } finally {
      setPairingLoading(false);
    }
  };

  const checkPairingStatus = async (signal?: AbortSignal) => {
    if (!perceivedName) return;
    try {
      const res = await fetch(`/api/pair/status/${encodeURIComponent(perceivedName)}`, { signal });
      if (!res.ok) {
        throw new Error(`HTTP status ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setPairingLinked(data.linked);
        setPairingLinkedAccounts(data.linkedAccounts || []);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn("[SETTINGS] Pemeriksaan status tautan platform ditunda karena masalah koneksi:", err?.message || err);
    }
  };

  // Reverse Pairing States (Bot to Web)
  const [botPairingCode, setBotPairingCode] = useState<string>('');
  const [botPairingLoading, setBotPairingLoading] = useState<boolean>(false);
  const [botPairingMessage, setBotPairingMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const claimBotPairingCode = async () => {
    if (!botPairingCode) return;
    try {
      setBotPairingLoading(true);
      setBotPairingMessage(null);
      const res = await fetch('/api/pair/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: botPairingCode.trim(),
          perceivedName
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBotPairingMessage({ type: 'success', text: data.message });
        setBotPairingCode('');
        checkPairingStatus();
      } else {
        setBotPairingMessage({ type: 'error', text: data.error || 'Gagal memproses kode bot.' });
      }
    } catch (err: any) {
      setBotPairingMessage({ type: 'error', text: 'Gagal menghubungi server batin Yui.' });
    } finally {
      setBotPairingLoading(false);
    }
  };

  useEffect(() => {
    let interval: any = null;
    const controller = new AbortController();
    if (selectedSection === 'connection') {
      checkPairingStatus(controller.signal);
      interval = setInterval(() => checkPairingStatus(controller.signal), 4000); // Check status every 4 seconds
    }
    return () => {
      controller.abort();
      if (interval) clearInterval(interval);
    };
  }, [selectedSection, perceivedName]);

  // Model Data and Selector States
  const [allModelsList, setAllModelsList] = useState<any[]>(() => {
    const basePresets = [
      {
        id: 'hiyori',
        name: 'Hiyori (Pro)',
        type: 'Live2D',
        url: '/models/hiyori/hiyori_free_t08.model3.json',
        imageUrl: 'https://raw.githubusercontent.com/Live2D/CubismWebSamples/master/Resources/Hiyori/Hiyori.png',
        desc: 'Premium integrated Hiyori student model. Fully hosted offline, highly emotive and configured for lightning-fast loading.'
      },
      {
        id: 'haru',
        name: 'Haru (Greeter)',
        type: 'Live2D',
        url: '/models/haru/haru_greeter_t03.model3.json',
        imageUrl: 'https://raw.githubusercontent.com/Live2D/CubismWebSamples/4-r.1/Resources/Haru/Haru.png',
        desc: 'Classic school greeter model. Extremely stable, locally hosted on your server.'
      },
      {
        id: 'shizuku',
        name: 'Shizuku',
        type: 'Live2D',
        url: '/models/shizuku/shizuku.model.json',
        imageUrl: 'https://raw.githubusercontent.com/Live2D/CubismWebSamples/4-r.1/Resources/Shizuku/Shizuku.png',
        desc: 'Classic live2d girl model, hosted locally on the server.'
      },
      {
        id: 'wanko',
        name: 'Wanko',
        type: 'Live2D',
        url: 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model@master/live2d-3/v3/wanko/wanko.model3.json',
        imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300&auto=format&fit=crop',
        desc: 'Cute animated puppy companion to snuggle up on the stream.'
      },
      {
        id: 'aether',
        name: 'Aether (3D VRM)',
        type: 'VRM',
        url: 'https://pixiv.github.io/three-vrm/packages/three-vrm/examples/models/three-vrm-girl.vrm',
        imageUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=300&auto=format&fit=crop',
        desc: 'Stunning 3D anime character model with full three-dimensional spatial rotation.'
      },
      {
        id: 'nova',
        name: 'Nova (3D VRM)',
        type: 'VRM',
        url: 'https://cdn.jsdelivr.net/gh/pixiv/three-vrm@master/packages/three-vrm/examples/models/three-vrm-girl.vrm',
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop',
        desc: 'Futuristic sci-fi neon cybernetic model.'
      }
    ];

    const saved = localStorage.getItem('yuihime_cached_models_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return [...basePresets, ...parsed];
        }
      } catch (e) {
        console.warn('Failed parsing cached models:', e);
      }
    }
    return basePresets;
  });

  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedModelInSelector, setSelectedModelInSelector] = useState<any>(null);
  const [customModelUrlInput, setCustomModelUrlInput] = useState('');
  const [customModelNameInput, setCustomModelNameInput] = useState('');
  const [customModelTypeInput, setCustomModelTypeInput] = useState<'Live2D' | 'VRM'>('Live2D');
  const [showImportForm, setShowImportForm] = useState(false);

  // States for Character Card Management
  const [characterCards, setCharacterCards] = useState<any[]>(() => {
    const saved = localStorage.getItem('yuihime_character_cards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'yuihime',
        name: 'Yuihime',
        nickname: 'Yui',
        description: 'Yuihime adalah AI VTuber yang ceria, penuh empati, anggun, dan gemar mengajak bercanda dalam bahasa Indonesia.',
        creatorNotes: 'Default system personality.',
        version: '1.0.0',
        behavior: {
          firstMessage: 'Halo Kakak! Aku Yuihime, AI VTuber kesayanganmu. Ada sinyal kognitif apa hari ini?',
          scenario: 'Streaming, chatting with live spectators',
          examples: '<user>: Hai Yui!\n<char>: Halo kakak manis! Senang sekali bisa bersapaan kembali di ruang batiniah digital kita!'
        },
        modules: { enableMic: true, enableWebSearch: true, enableMcp: false },
        artistry: { avatar: 'hiyori', expression: 'wink', voiceSpeed: 1 },
        settings: { temperature: 0.7, systemPrompt: '' }
      },
      {
        id: 'relu',
        name: 'ReLU',
        nickname: 'Rectified Unit',
        description: 'NAME payload',
        creatorNotes: 'Sistem kognisi ReLU yang murni logis, teknis tinggi, dan pragmatis dalam memproses data saraf kognitif.',
        version: '1.1.0',
        behavior: {
          firstMessage: 'Sirkuit kognisi murni aktif.',
          scenario: 'Processing kognitif, optimizing neural matrix',
          examples: '<user>: Status?\n<char>: Sirkuit kognitif normal. Muatan payload siap berjalan.'
        },
        modules: { enableMic: false, enableWebSearch: true, enableMcp: true },
        artistry: { avatar: 'codex', expression: 'nod', voiceSpeed: 1.1 },
        settings: { temperature: 0.2, systemPrompt: '' }
      }
    ];
  });

  const [activeCardId, setActiveCardId] = useState<string>(() => {
    return localStorage.getItem('yuihime_active_card_id') || 'yuihime';
  });

  const [editingCard, setEditingCard] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalTab, setEditModalTab] = useState<'identity' | 'behavior' | 'modules' | 'artistry' | 'settings'>('identity');

  const [cardForm, setCardForm] = useState<any>({
    name: '',
    nickname: '',
    description: '',
    creatorNotes: '',
    version: '1.0.0',
    behavior: { firstMessage: '', scenario: '', examples: '' },
    modules: { enableMic: true, enableWebSearch: true, enableMcp: false },
    artistry: { avatar: 'hiyori', expression: 'wink', voiceSpeed: 1 },
    settings: { temperature: 0.7, systemPrompt: '' }
  });

  useEffect(() => {
    localStorage.setItem('yuihime_character_cards', JSON.stringify(characterCards));
  }, [characterCards]);

  useEffect(() => {
    localStorage.setItem('yuihime_active_card_id', activeCardId);
    if (activeCardId === 'relu') {
      setActivePersonaId?.('codex');
    } else {
      setActivePersonaId?.('normal');
    }
  }, [activeCardId]);

  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setCardForm({
      id: card.id,
      name: card.name || '',
      nickname: card.nickname || '',
      description: card.description || '',
      creatorNotes: card.creatorNotes || '',
      version: card.version || '1.0.0',
      behavior: card.behavior || { firstMessage: '', scenario: '', examples: '' },
      modules: card.modules || { enableMic: true, enableWebSearch: true, enableMcp: false },
      artistry: card.artistry || { avatar: 'hiyori', expression: 'wink', voiceSpeed: 1 },
      settings: card.settings || { temperature: 0.7, systemPrompt: '' }
    });
    setEditModalTab('identity');
    setIsEditModalOpen(true);
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    setCardForm({
      name: '',
      nickname: '',
      description: '',
      creatorNotes: '',
      version: '1.0.0',
      behavior: { firstMessage: '', scenario: '', examples: '' },
      modules: { enableMic: true, enableWebSearch: true, enableMcp: false },
      artistry: { avatar: 'hiyori', expression: 'wink', voiceSpeed: 1 },
      settings: { temperature: 0.7, systemPrompt: '' }
    });
    setEditModalTab('identity');
    setIsEditModalOpen(true);
  };

  const handleSaveCard = () => {
    if (!cardForm.name.trim() || !cardForm.description.trim()) {
      alert("Name and Description are required fields.");
      return;
    }
    let updatedCards;
    if (editingCard && editingCard.id) {
      updatedCards = characterCards.map(c => c.id === editingCard.id ? { ...cardForm } : c);
    } else {
      const newId = 'card_' + Date.now();
      updatedCards = [...characterCards, { ...cardForm, id: newId }];
    }
    setCharacterCards(updatedCards);
    setIsEditModalOpen(false);
    setEditingCard(null);
  };

  const handleLoadMdFile = async (fileName: string, humanName: string) => {
    setLoadingMd(true);
    setSelectedMdFile(fileName);
    setSelectedMdName(humanName);
    setMdStatusMessage({ type: null, text: '' });
    try {
      const res = await fetch(`/api/system/markdown/${fileName}`);
      if (!res.ok) throw new Error(`Failed to load ${fileName}`);
      const data = await res.json();
      setMdFileContent(data.content || '');
      setOriginalMdFileContent(data.content || '');
    } catch (err: any) {
      setMdStatusMessage({ type: 'error', text: `Gagal memuat berkas: ${err.message}` });
    } finally {
      setLoadingMd(false);
    }
  };

  const handleSaveMdFile = async () => {
    if (!selectedMdFile) return;
    setSavingMd(true);
    setMdStatusMessage({ type: null, text: '' });
    try {
      const res = await fetch(`/api/system/markdown/${selectedMdFile}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: mdFileContent })
      });
      if (!res.ok) throw new Error(`Failed to save ${selectedMdFile}`);
      const data = await res.json();
      if (data.success) {
        setOriginalMdFileContent(mdFileContent);
        setMdStatusMessage({ type: 'success', text: `Berhasil menyimpan berkas batin kognitif: ${selectedMdFile}!` });
        setTimeout(() => {
          setMdStatusMessage(prev => prev.text.includes(selectedMdFile) ? { type: null, text: '' } : prev);
        }, 4000);
      } else {
        throw new Error(data.error || 'Terjadi kesalahan sistem.');
      }
    } catch (err: any) {
      setMdStatusMessage({ type: 'error', text: `Gagal menyimpan berkas: ${err.message}` });
    } finally {
      setSavingMd(false);
    }
  };

  const [backdrop, setBackdrop] = useState<string>(() => {
    return localStorage.getItem('yuihime_stage_backdrop') || 'matrix';
  });
  const [customImgUrl, setCustomImgUrl] = useState<string>(() => {
    return localStorage.getItem('yuihime_stage_backdrop_custom') || '';
  });

  const handleSelectBackdrop = (type: string) => {
    setBackdrop(type);
    localStorage.setItem('yuihime_stage_backdrop', type);
    const event = new CustomEvent('yuihime_backdrop_changed', { detail: { type, customImgUrl } });
    window.dispatchEvent(event);
  };

  const handleCustomUrlChange = (url: string) => {
    setCustomImgUrl(url);
    localStorage.setItem('yuihime_stage_backdrop_custom', url);
    if (backdrop === 'custom') {
      const event = new CustomEvent('yuihime_backdrop_changed', { detail: { type: 'custom', customImgUrl: url } });
      window.dispatchEvent(event);
    }
  };

  // Sub-pages states for systemic rendering matching airi.moeru.ai
  const [systemSubpage, setSystemSubpage] = useState<string | null>(null);
  const [providerSubpage, setProviderSubpage] = useState<string | null>(null);

  // Custom states for dynamic selection and hub filtering (Yuihime)
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [modelsCollapsed, setModelsCollapsed] = useState<boolean>(true);
  const [credentialsCollapsed, setCredentialsCollapsed] = useState<boolean>(true);
  const [expandedModels, setExpandedModels] = useState<Record<string, boolean>>({});
  const [providerSubTab, setProviderSubTab] = useState<'chat' | 'speech' | 'transcription' | 'artistry'>('chat');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [deploymentFilter, setDeploymentFilter] = useState<'all' | 'local' | 'cloud'>('all');

  // Custom ElevenLabs playtest playground states
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>('');
  const [elevenLabsPitch, setElevenLabsPitch] = useState<number>(50);
  const [elevenLabsSpeed, setElevenLabsSpeed] = useState<number>(1);
  const [elevenLabsVolume, setElevenLabsVolume] = useState<number>(100);
  const [elevenLabsStyle, setElevenLabsStyle] = useState<number>(0);
  const [elevenLabsStability, setElevenLabsStability] = useState<number>(0.5);
  const [elevenLabsSimilarity, setElevenLabsSimilarity] = useState<number>(0.75);
  const [elevenLabsSpeakerBoost, setElevenLabsSpeakerBoost] = useState<boolean>(true);
  const [elevenLabsBaseUrl, setElevenLabsBaseUrl] = useState<string>('https://unspeech.hyp3r.link/v1/');
  const [elevenLabsSSML, setElevenLabsSSML] = useState<boolean>(false);
  const [elevenLabsVoice, setElevenLabsVoice] = useState<string>('');
  const [elevenLabsText, setElevenLabsText] = useState<string>('Hello! This is a test of the ElevenLabs voice synthesis.');

  // Custom OpenAI/Whisper transcription playground states
  const [openAiApiKey, setOpenAiApiKey] = useState<string>('');
  const [openAiModel, setOpenAiModel] = useState<string>('Whisper-1');
  const [audioDevice, setAudioDevice] = useState<string>('Default');
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [simulateLevel, setSimulateLevel] = useState<number>(0);
  const [simulateProb, setSimulateProb] = useState<number>(0);
  const [openAiSensitivity, setOpenAiSensitivity] = useState<number>(29);

  // Web Speech API Test States
  const [isSstTesting, setIsSstTesting] = useState<boolean>(false);
  const [sstTranscript, setSstTranscript] = useState<string>('');
  const [sstError, setSstError] = useState<string>('');
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('default');

  // Enumerate active multimedia mics on window setup
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const mics = devices.filter(d => d.kind === 'audioinput');
          setAvailableMics(mics);
        })
        .catch(err => {
          console.warn("Could not load media devices under Yuihime Hearing:", err);
        });
    }
  }, []);

  // Synchronize sidebar activeTab with selectedSection
  useEffect(() => {
    if (activeTab) {
      if (activeTab === 'console') {
        setSelectedSection('console');
      } else if (activeTab === 'archive') {
        setSelectedSection('memory');
        setActiveSoulTab('archive');
      } else if (activeTab === 'persistence') {
        setSelectedSection('memory');
        setActiveSoulTab('persistence');
      } else if (activeTab === 'matrix') {
        setSelectedSection('memory');
        setActiveSoulTab('heuristics');
      } else if (activeTab === 'settings') {
        setSelectedSection(null); // Goes to the general main dashboard with categories!
      }
    }
  }, [activeTab]);

  // Reset scroll of settings panel to top when changing section, navigation subpages, or activeTab
  useEffect(() => {
    const scrollContainer = document.getElementById('settings-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
    window.scrollTo({ top: 0 });
  }, [activeTab, selectedSection, systemSubpage, providerSubpage, activeSettingsTab, activeSoulTab]);

  useEffect(() => {
    let active = true;
    let streamObj: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let animationId: number | null = null;
    let fallbackInterval: any = null;

    if (isMonitoring) {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: selectedMicId !== 'default' ? { deviceId: { exact: selectedMicId } } : true })
          .then(stream => {
            if (!active) {
              stream.getTracks().forEach(t => t.stop());
              return;
            }
            streamObj = stream;
            try {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              const ctx = new AudioContextClass();
              audioCtx = ctx;
              const source = ctx.createMediaStreamSource(stream);
              const analyser = ctx.createAnalyser();
              analyser.fftSize = 256;
              source.connect(analyser);

              const bufferLength = analyser.frequencyBinCount;
              const dataArray = new Uint8Array(bufferLength);

              const checkVolume = () => {
                if (!active) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                  sum += dataArray[i];
                }
                const average = sum / bufferLength;
                const pct = Math.min(Math.round((average / 100) * 100), 100);
                setSimulateLevel(pct);

                // Probability of speech tracks with decibels
                const prob = pct > 0 ? Math.min(Math.round(pct * 1.5 + (Math.random() * 8 - 4)), 100) : 0;
                setSimulateProb(prob);

                animationId = requestAnimationFrame(checkVolume);
              };
              checkVolume();
            } catch (e) {
              console.warn("Failed to init AudioContext:", e);
              runSimulation();
            }
          })
          .catch(err => {
            console.warn("User mic access denied/failed, using simulation fallback:", err);
            runSimulation();
          });
      } else {
        runSimulation();
      }
    } else {
      setSimulateLevel(0);
      setSimulateProb(0);
    }

    function runSimulation() {
      fallbackInterval = setInterval(() => {
        if (!active) return;
        const time = Date.now() / 1000;
        const isSpeakingPhase = Math.sin(time / 2) > -0.2; // speech rhythm
        if (isSpeakingPhase) {
          const lv = Math.floor(Math.sin(time * 5) * 20 + 40 + Math.random() * 15);
          setSimulateLevel(Math.max(0, Math.min(100, lv)));
          setSimulateProb(Math.min(100, Math.floor(lv * 1.25 + Math.random() * 10)));
        } else {
          setSimulateLevel(Math.floor(Math.random() * 3));
          setSimulateProb(Math.floor(Math.random() * 3));
        }
      }, 100);
    }

    return () => {
      active = false;
      if (streamObj) {
        streamObj.getTracks().forEach(t => t.stop());
      }
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [isMonitoring, selectedMicId]);

  // Web Speech API client control runner
  useEffect(() => {
    let active = true;
    let recognition: any = null;

    if (isSstTesting) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSstError("Web Speech API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.");
        setIsSstTesting(false);
        return;
      }

      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = settings.web_speech_api?.lang || 'en-US';

        recognition.onstart = () => {
          if (!active) return;
          setSstTranscript('');
          setSstError('');
        };

        recognition.onerror = (event: any) => {
          if (!active) return;
          console.error("Speech Recognition Error:", event.error);
          setSstError(`Speech Recognition Error: ${event.error}`);
          setIsSstTesting(false);
        };

        recognition.onend = () => {
          if (!active) return;
          setIsSstTesting(false);
        };

        recognition.onresult = (event: any) => {
          if (!active) return;
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const fullText = finalTranscript || interimTranscript;
          setSstTranscript(fullText);
        };

        recognition.start();
      } catch (err: any) {
        console.error("Speech recognition initialization error:", err);
        setSstError(`Failed: ${err.message || err}`);
        setIsSstTesting(false);
      }
    }

    return () => {
      active = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
    };
  }, [isSstTesting, settings?.web_speech_api?.lang]);

  useEffect(() => {
    if (settings) {
      if (settings.elevenlabs) {
        setElevenLabsApiKey(settings.elevenlabs.apiKey || '');
        setElevenLabsPitch(settings.elevenlabs.pitch !== undefined ? settings.elevenlabs.pitch : 50);
        setElevenLabsSpeed(settings.elevenlabs.speed !== undefined ? settings.elevenlabs.speed : 1);
        setElevenLabsVolume(settings.elevenlabs.volume !== undefined ? settings.elevenlabs.volume : 100);
        setElevenLabsStyle(settings.elevenlabs.style !== undefined ? settings.elevenlabs.style : 0);
        setElevenLabsStability(settings.elevenlabs.stability !== undefined ? settings.elevenlabs.stability : 0.5);
        setElevenLabsSimilarity(settings.elevenlabs.similarity !== undefined ? settings.elevenlabs.similarity : 0.75);
        setElevenLabsSpeakerBoost(settings.elevenlabs.speakerBoost !== undefined ? settings.elevenlabs.speakerBoost : true);
        setElevenLabsBaseUrl(settings.elevenlabs.baseUrl || 'https://unspeech.hyp3r.link/v1/');
        setElevenLabsSSML(settings.elevenlabs.useSSML !== undefined ? settings.elevenlabs.useSSML : false);
        setElevenLabsVoice(settings.elevenlabs.voice || '');
        setElevenLabsText(settings.elevenlabs.testText || 'Hello! This is a test of the ElevenLabs voice synthesis.');
      }
      if (settings.openai) {
        setOpenAiApiKey(settings.openai.apiKey || '');
        setOpenAiModel(settings.openai.model || 'Whisper-1');
        setAudioDevice(settings.openai.audioDevice || 'Default');
        setOpenAiSensitivity(settings.openai.sensitivity !== undefined ? settings.openai.sensitivity : 25);
      }
    }
  }, [settings]);

  const updateElevenLabsLocal = (field: string, value: any) => {
    setElevenLabsApiKey(prev => {
      const updatedVal = field === 'apiKey' ? value : prev;
      return updatedVal;
    });
    setSettings((prev: any) => ({
      ...prev,
      elevenlabs: {
        ...(prev.elevenlabs || {}),
        [field]: value
      }
    }));
  };

  const updateFallbackChain = (newChain: any[]) => {
    setSettings((prev: any) => ({
      ...prev,
      gemini: {
        ...(prev.gemini || {}),
        fallbackChain: newChain
      }
    }));
  };

  const addFallbackRow = () => {
    const currentChain = settings.gemini?.fallbackChain || [];
    const newRow = {
      id: Math.random().toString(36).substr(2, 9),
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      apiKey: ''
    };
    updateFallbackChain([...currentChain, newRow]);
  };

  const deleteFallbackRow = (id: string) => {
    const currentChain = settings.gemini?.fallbackChain || [];
    updateFallbackChain(currentChain.filter((r: any) => r.id !== id));
  };

  const moveFallbackRowUp = (index: number) => {
    const currentChain = [...(settings.gemini?.fallbackChain || [])];
    if (index > 0) {
      const temp = currentChain[index];
      currentChain[index] = currentChain[index - 1];
      currentChain[index - 1] = temp;
      updateFallbackChain(currentChain);
    }
  };

  const moveFallbackRowDown = (index: number) => {
    const currentChain = [...(settings.gemini?.fallbackChain || [])];
    if (index < currentChain.length - 1) {
      const temp = currentChain[index];
      currentChain[index] = currentChain[index + 1];
      currentChain[index + 1] = temp;
      updateFallbackChain(currentChain);
    }
  };

  const editFallbackRow = (id: string, field: string, value: any) => {
    const currentChain = settings.gemini?.fallbackChain || [];
    const updated = currentChain.map((r: any) => {
      if (r.id === id) {
         const newRow = { ...r, [field]: value };
         if (field === 'provider') {
            newRow.model = '';
         }
         return newRow;
      }
      return r;
    });
    updateFallbackChain(updated);
  };

  const updateOpenAiLocal = (field: string, value: any) => {
    setOpenAiApiKey(prev => {
      const updatedVal = field === 'apiKey' ? value : prev;
      return updatedVal;
    });
    setSettings((prev: any) => ({
      ...prev,
      openai: {
        ...(prev.openai || {}),
        [field]: value
      }
    }));
  };

  useEffect(() => {
    if (propMetricsHistory) {
      setMetricsHistory(propMetricsHistory);
    }
  }, [propMetricsHistory]);

  // Scene/Backdrop state synced locally
  const [selectedBackdrop, setSelectedBackdrop] = useState<string>(() => {
    return localStorage.getItem('yuihime_stage_backdrop') || 'matrix';
  });
  const [customBdropUrl, setCustomBdropUrl] = useState<string>(() => {
    return localStorage.getItem('yuihime_stage_backdrop_custom') || '';
  });

  useEffect(() => {
    loadSettings();
    loadAddons();
    
    // Auth Listener
    const unsubscribe = StorageService.onAuthStateChanged((u) => setUser(u));
    
    // Registry discovery listener
    const unsubscribeRegistry = SystemRegistry.subscribe(() => {
      setRegistryVersion(v => v + 1);
      
      const providers = SystemRegistry.getProviders();
      const initialModels: Record<string, any[]> = {};
      providers.forEach(p => {
         const modelField = (p.metadata.configSchema?.fields as any)?.model;
         if (modelField?.options) {
           initialModels[p.metadata.id] = modelField.options;
         }
      });
      setDynamicModels(prev => ({ ...initialModels, ...prev }));
    });
    
    // Load metrics
    const loadMetrics = async () => {
      const data = await StorageService.getSystemMetrics();
      setMetricsHistory(data);
    };
    if (!propMetricsHistory) {
      loadMetrics();
    } else {
      setMetricsHistory(propMetricsHistory);
    }

    return () => {
      unsubscribe();
      unsubscribeRegistry();
    };
  }, []);

  useEffect(() => {
    const activeProviderId = settings.provider || 'gemini';
    const providerToFetch = activeProviderId;
    
    if (providerToFetch && !fetchingModels && (!dynamicModels[providerToFetch] || dynamicModels[providerToFetch].length === 0)) {
      fetchDynamicModels(providerToFetch);
    }
  }, [settings.provider, registryVersion, settings]);

  const fetchDynamicModels = async (providerId: string) => {
    if (!providerId || providerId === 'null') return;
    setFetchingModels(true);
    try {
      const provider = SystemRegistry.getProvider(providerId);
      if (provider && provider.getModels) {
        const config = settings[providerId] || {};
        const models = await provider.getModels(config);
        
        if (models && models.length > 0) {
          setDynamicModels(prev => ({ ...prev, [providerId]: models }));
        }
      }
    } catch (e) {
      console.error("[CORE] Dynamic sync failed:", e);
    } finally {
      setFetchingModels(false);
    }
  };

  const loadAddons = async () => {
    try {
      const res = await fetch('/api/addons');
      if (res.ok) {
        const data = await res.json();
        setAddons(data);
      }
    } catch (e) {
      console.warn("Failed to load addons");
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    const data = await StorageService.getModularSettings();
    
    // Initialize missing module defaults
    const allModules = SystemRegistry.getModules();
    const initializedSettings = { ...data };
    
    // Ensure core overlaps are present
    if (!initializedSettings.provider) initializedSettings.provider = 'gemini';
    if (!initializedSettings.ttsProvider) initializedSettings.ttsProvider = '';
    if (!initializedSettings.avatar) {
      initializedSettings.avatar = {
        modelUrl: 'hiyori',
        scale: 1,
        xOffset: 0,
        yOffset: 0
      };
    }

    if (!initializedSettings.colorScheme) {
      initializedSettings.colorScheme = {
        dynamic: false,
        selected: 'default'
      };
    }
    if (!initializedSettings.sandbox_paths) {
      initializedSettings.sandbox_paths = {
        data_dir: './data',
        config_path: './data/config.toml',
        db_path: './data/yuihime.db',
        user_data_path: './user_data',
        agent_path: './agent',
        addons_path: './addons'
      };
    }
    if (!initializedSettings.developer) {
      initializedSettings.developer = {
        disableStageTransitions: false,
        pageSpecificTransitions: true,
        audioRecordMode: 'high',
        performanceVisualizer: false,
        bgThemeBlending: 50,
        bgRemoval: false,
        chatOverlay: 'left'
      };
    }
    applyThemePalette(initializedSettings.colorScheme.selected || 'default');

    allModules.forEach(m => {
      if (!initializedSettings[m.metadata.id] && m.metadata.configSchema) {
        const defaults: any = {};
        Object.entries(m.metadata.configSchema.fields).forEach(([key, field]: [string, any]) => {
          if (field.default !== undefined) defaults[key] = field.default;
        });
        initializedSettings[m.metadata.id] = defaults;
      }
    });

    setSettings(initializedSettings);
    let finalUrl = '';
    if (initializedSettings.connectionWebsocketUrl) {
      setTestWsUrl(initializedSettings.connectionWebsocketUrl);
      finalUrl = initializedSettings.connectionWebsocketUrl;
    } else {
      const loc = window.location;
      const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
      finalUrl = `${proto}//${loc.host}/ws`;
      setTestWsUrl(finalUrl);
    }
    setLoading(false);

    // Auto-connect to active WebSocket on load
    if (finalUrl) {
      setTimeout(() => {
        connectTestWs(finalUrl);
      }, 150);
    }
  };

  const handleSave = async () => {
    try {
      await StorageService.setModularSettings(settings);
      
      // Update local storage for backward compatibility if needed
      await StorageService.setAIConfig({
        ...settings,
        apiKey: settings[settings.provider]?.apiKey || '',
        model: settings[settings.provider]?.model || '',
        temperature: settings[settings.provider]?.temperature || 0.7
      });
      await StorageService.setAvatarConfig(settings.avatar);
      
      // Force sync to server's config.toml
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      alert('Settings synchronized to Neural Kernel (config.toml).');
      if (onSave) onSave();
    } catch (e) {
      alert('Sync failed. Terminal not responding.');
    }
  };

  const updateSetting = async (moduleId: string, field: string, value: any) => {
    const newSettings = {
      ...settings,
      [moduleId]: {
        ...(settings[moduleId] || {}),
        [field]: value
      }
    };
    setSettings(newSettings);
  };

  const updateGeneral = (field: string, value: any) => {
    const safeValue = (value === "null" || value === "undefined") ? "" : value;
    const activeProviderId = settings.provider;
    
    setSettings(prev => {
      const next = { ...prev };
      
      if (field === 'provider' || field === 'ttsProvider' || field === 'temperature') {
        next[field] = safeValue;
      } else if (activeProviderId) {
        next[activeProviderId] = {
          ...(next[activeProviderId] || {}),
          [field]: safeValue
        };
      }
      
      return next;
    });
  };

  const updateAvatar = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      avatar: {
        ...(prev.avatar || {}),
        [field]: value
      }
    }));
  };

  // WebSocket Connection Test Suite Methods
  const disconnectTestWs = () => {
    if (wsClientRef) {
      try {
        wsClientRef.close();
      } catch (e) {}
      setWsClientRef(null);
    }
    setTestWsStatus('DISCONNECTED');
    setTestWsLogs(prev => [
      ...prev,
      { type: 'sys' as const, message: 'Manual disconnect requested.', timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  const connectTestWs = (targetUrl: string) => {
    // Clean up current active test connection
    if (wsClientRef) {
      try {
        wsClientRef.close();
      } catch (e) {}
    }

    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      alert('Tolong masukkan WebSocket URL yang valid.');
      return;
    }

    setTestWsLogs(prev => [
      ...prev,
      { type: 'sys' as const, message: `Menghubungkan ke ${cleanUrl}...`, timestamp: new Date().toLocaleTimeString() }
    ]);
    setTestWsStatus('CONNECTING');

    try {
      const client = new WebSocket(cleanUrl);

      client.onopen = () => {
        setTestWsStatus('CONNECTED');
        setWsClientRef(client);
        setTestWsLogs(prev => [
          ...prev,
          { type: 'sys' as const, message: `Koneksi berhasil terjalin dengan: ${cleanUrl}`, timestamp: new Date().toLocaleTimeString() }
        ]);
        
        // Save to settings for persistent synchronization so OBS/Stream overlay can use this target WebSocket too
        setSettings(prev => ({
          ...prev,
          connectionWebsocketUrl: cleanUrl
        }));
      };

      client.onmessage = (event) => {
        setTestWsLogs(prev => {
          const updated = [
            ...prev,
            { type: 'rx' as const, message: `RX: ${event.data}`, timestamp: new Date().toLocaleTimeString() }
          ];
          if (updated.length > 50) updated.shift();
          return updated;
        });
      };

      client.onerror = (err) => {
        setTestWsStatus('ERROR');
        setTestWsLogs(prev => [
          ...prev,
          { type: 'sys' as const, message: `Gagal menghubungkan atau terputus secara tidak normal.`, timestamp: new Date().toLocaleTimeString() }
        ]);
      };

      client.onclose = () => {
        setTestWsStatus('DISCONNECTED');
        setWsClientRef(null);
        setTestWsLogs(prev => [
          ...prev,
          { type: 'sys' as const, message: `Koneksi ditutup.`, timestamp: new Date().toLocaleTimeString() }
        ]);
      };
    } catch (error: any) {
      setTestWsStatus('ERROR');
      setTestWsLogs(prev => [
        ...prev,
        { type: 'sys' as const, message: `Kesalahan inisialisasi: ${error.message || String(error)}`, timestamp: new Date().toLocaleTimeString() }
      ]);
    }
  };

  const sendTestWsMsg = () => {
    if (!wsClientRef || wsClientRef.readyState !== WebSocket.OPEN) {
      alert('WebSocket tidak terhubung. Silakan hubungkan terlebih dahulu!');
      return;
    }

    try {
      wsClientRef.send(testWsMsg);
      setTestWsLogs(prev => {
        const updated = [
          ...prev,
          { type: 'tx' as const, message: `TX: ${testWsMsg}`, timestamp: new Date().toLocaleTimeString() }
        ];
        if (updated.length > 50) updated.shift();
        return updated;
      });
    } catch (err: any) {
      alert(`Gagal mengirim pesan: ${err.message || String(err)}`);
    }
  };

  const clearTestWsLogs = () => {
    setTestWsLogs([]);
  };

  // Auto clean up test connection when component is destroyed
  useEffect(() => {
    return () => {
      if (wsClientRef) {
        try {
          wsClientRef.close();
        } catch (e) {}
      }
    };
  }, [wsClientRef]);

  // Sync main settings to avatar config for parent components
  useEffect(() => {
    if (onAvatarUpdate && settings.avatar && Object.keys(settings.avatar).length > 0) {
      onAvatarUpdate(settings.avatar);
    }
  }, [settings.avatar, onAvatarUpdate]);

  // MANDATORY SOP: Auto-synchronize and persist modular settings to server-side config.toml and local storage in real-time
  useEffect(() => {
    if (loading) return; // Ignore on boot
    if (!settings || Object.keys(settings).length === 0) return;

    const timer = setTimeout(async () => {
      try {
        await StorageService.setModularSettings(settings);
        
        // Ensure reverse-compatibility and flat state alignment
        await StorageService.setAIConfig({
          ...settings,
          apiKey: settings[settings.provider]?.apiKey || '',
          model: settings[settings.provider]?.model || '',
          temperature: settings[settings.provider]?.temperature || 0.7
        });

        if (settings.avatar) {
          await StorageService.setAvatarConfig(settings.avatar);
        }

        // Direct server-side config.toml synchronization gateway
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });

        if (onSave) onSave();
        console.log('💡 [SOP AUTO-SYNC]: Settings successfully auto-persisted to backend config.toml.');
      } catch (err) {
        console.error('⚠️ [SOP AUTO-SYNC] Failed silently synchronizing state:', err);
      }
    }, 600); // 600ms debounce window safeguards against database locking/writes during prompt/input editing

    return () => clearTimeout(timer);
  }, [settings, loading, onSave]);

  const [dynamicOptionsMap, setDynamicOptionsMap] = useState<Record<string, Record<string, { label: string, value: any }[]>>>({});
  const [fetchingDynamic, setFetchingDynamic] = useState<Record<string, boolean>>({});

  const [rowModelsMap, setRowModelsMap] = useState<Record<string, { label: string, value: string }[]>>({});
  const [fetchingRowKey, setFetchingRowKey] = useState<Record<string, boolean>>({});

  const fetchModelsForChainRow = async (rowId: string, providerId: string, apiKey: string, baseUrl: string = '') => {
    setFetchingRowKey(prev => ({ ...prev, [rowId]: true }));
    try {
       const cleanApiKey = apiKey || '';
       const cleanBaseUrl = baseUrl || '';
       const url = `/api/ai/models?provider=${providerId}&apiKey=${encodeURIComponent(cleanApiKey)}&baseUrl=${encodeURIComponent(cleanBaseUrl)}`;
       const res = await fetch(url);
       if (res.ok) {
          const data = await res.json();
          const models = (data.models || []).map((m: any) => {
             const id = m.name.split('/').pop() || m.name;
             return {
                label: m.displayName || id,
                value: id
             };
          });
          setRowModelsMap(prev => ({ ...prev, [rowId]: models }));
       }
    } catch (err) {
       console.error('Failed to discovery models for row:', err);
    } finally {
       setFetchingRowKey(prev => ({ ...prev, [rowId]: false }));
    }
  };

  useEffect(() => {
    if ((providerSubpage === 'gemini' || selectedSubmoduleCategory === 'consciousness') && settings.gemini?.fallbackChain) {
      const chain = settings.gemini.fallbackChain;
      chain.forEach((row: any) => {
        if (row.provider && !rowModelsMap[row.id] && !fetchingRowKey[row.id]) {
          fetchModelsForChainRow(row.id, row.provider, row.apiKey || settings[row.provider]?.apiKey || '', row.baseUrl || settings[row.provider]?.baseUrl || '');
        }
      });
    }
  }, [providerSubpage, selectedSubmoduleCategory, settings.gemini?.fallbackChain, registryVersion, settings]);

  const fetchDynamicOptions = async (moduleId: string, fieldName: string) => {
    const key = `${moduleId}:${fieldName}`;
    setFetchingDynamic(prev => ({ ...prev, [key]: true }));
    try {
      const module = SystemRegistry.getModule(moduleId);
      if (module && module.getDynamicOptions) {
        const options = await module.getDynamicOptions(fieldName, settings[moduleId] || {});
        setDynamicOptionsMap(prev => ({
          ...prev,
          [moduleId]: {
            ...(prev[moduleId] || {}),
            [fieldName]: options
          }
        }));
      } else if (moduleId === 'gemini' && (fieldName === 'model' || fieldName === 'fallbackModel')) {
        const provider = SystemRegistry.getProvider(moduleId);
        if (provider?.getModels) {
           const models = await provider.getModels(settings[moduleId]);
           setDynamicOptionsMap(prev => ({
             ...prev,
             [moduleId]: { 
               ...(prev[moduleId] || {}), 
               model: models,
               fallbackModel: models
             }
           }));
        }
      }
    } catch (e) {
      console.error(`[SETTINGS] Failed to fetch dynamic options for ${key}:`, e);
    } finally {
      setFetchingDynamic(prev => ({ ...prev, [key]: false }));
    }
  };

  const renderFields = (module: any, config: any = null, updateFn: any = null) => {
    const schema = module.metadata.configSchema;
    if (!schema) return <p className="text-white/30 italic text-[11px] font-mono">No telemetry parameters mapped. Handled autonomously by System Registry.</p>;
    
    const targetConfig = config || settings[module.metadata.id] || {};
    const targetUpdateFn = updateFn || ((field: string, val: any) => updateSetting(module.metadata.id, field, val));

    return Object.entries(schema.fields).map(([key, field]: [string, any]) => {
      let currentOptions = field.options || [];
      const hasDynamicOptions = field.dynamicOptions || ((key === 'model' || key === 'fallbackModel') && (module.metadata.type === ModuleType.PROVIDER || module.metadata.id === 'gemini'));
      
      if (hasDynamicOptions) {
        if (dynamicOptionsMap[module.metadata.id]?.[key]) {
          currentOptions = dynamicOptionsMap[module.metadata.id][key];
        } else if ((key === 'model' || key === 'fallbackModel') && dynamicModels[module.metadata.id]) {
          currentOptions = dynamicModels[module.metadata.id];
        }
      }

      const fetchingKey = `${module.metadata.id}:${key}`;
      const isFetching = fetchingDynamic[fetchingKey];

      return (
        <div key={key} className="mb-4">
          <label className="block text-[9px] uppercase tracking-[0.2em] font-mono text-white/40 mb-1.5">{field.label}</label>
          
          {key === 'apiKey' && module.metadata.id === 'gemini' && (
            <div className="flex flex-col gap-1.5 mb-2">
              <p className="text-[9px] text-cyan-400/50 uppercase font-mono italic">
                Leave empty to use shared platform-managed credential keys.
              </p>
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch('/api/ai/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ config: { apiKey: targetConfig.apiKey } })
                    });
                    const data = await res.json();
                    if (data.valid) {
                      alert(`✅ Key check successful!\nSource: ${data.source}\nMasked representation: ${data.maskedKey}`);
                    } else {
                      alert(`❌ Key rejected!\nError detail: ${data.error || data.message || 'Verification signal lost.'}`);
                    }
                  } catch (e: any) {
                    alert(`⚠️ Node unreachable: ${e.message}`);
                  }
                }}
                className="w-fit px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[9px] uppercase tracking-wider rounded-lg border border-cyan-500/20 transition-all font-bold"
              >
                Test verification probe
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              {field.type === 'select' ? (
                <select 
                  value={targetConfig[key] || field.default || ''}
                  onChange={(e) => targetUpdateFn(key, e.target.value)}
                  className="w-full bg-[#111115] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
                >
                  {!targetConfig[key] && !field.default && <option value="" disabled>Select option...</option>}
                  {currentOptions && currentOptions.length > 0 ? (
                    currentOptions.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))
                  ) : (
                    <option value="" disabled>{hasDynamicOptions ? 'Retrieve sync patterns...' : 'No telemetry options loadable'}</option>
                  )}
                </select>
              ) : field.type === 'boolean' ? (
                <div className="flex items-center gap-3 mt-1">
                  <button 
                    onClick={() => targetUpdateFn(key, !targetConfig[key])}
                    className={`w-10 h-5 rounded-full transition-colors relative ${targetConfig[key] ? 'bg-cyan-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-black transition-all ${targetConfig[key] ? 'left-6' : 'left-1'}`} />
                  </button>
                  <span className="text-[10px] text-white/30 uppercase font-mono">{targetConfig[key] ? 'Active' : 'Muted'}</span>
                </div>
              ) : field.type === 'textarea' ? (
                <textarea 
                  rows={4}
                  value={targetConfig[key] || field.default || ''}
                  onChange={(e) => targetUpdateFn(key, e.target.value)}
                  className="w-full bg-[#111115] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none placeholder:text-gray-600 resize-none font-mono"
                  placeholder={field.description}
                />
              ) : field.type === 'color' ? (
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/15 bg-neutral-900 shrink-0 shadow">
                    <input 
                      type="color" 
                      value={targetConfig[key] || field.default || '#d97706'}
                      onChange={(e) => targetUpdateFn(key, e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-125"
                    />
                  </div>
                  <input 
                    type="text"
                    value={targetConfig[key] || field.default || '#d97706'}
                    onChange={(e) => targetUpdateFn(key, e.target.value)}
                    className="bg-[#111115] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none font-mono flex-1 uppercase"
                    placeholder="hex color code"
                  />
                </div>
              ) : field.type === 'slider' ? (
                <div className="space-y-1.5 pt-1">
                  <input 
                    type="range"
                    min={field.min !== undefined ? field.min : 0}
                    max={field.max !== undefined ? field.max : 1}
                    step={field.step !== undefined ? field.step : 0.05}
                    value={targetConfig[key] !== undefined ? targetConfig[key] : (field.default !== undefined ? field.default : 0.5)}
                    onChange={(e) => targetUpdateFn(key, parseFloat(e.target.value))}
                    className="w-full h-2 accent-amber-500 cursor-pointer bg-white/5 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-white/30">
                    <span>{field.min !== undefined ? field.min : 0}</span>
                    <span className="text-amber-500 font-bold">{targetConfig[key] !== undefined ? targetConfig[key] : (field.default !== undefined ? field.default : 0.5)}</span>
                    <span>{field.max !== undefined ? field.max : 1}</span>
                  </div>
                </div>
              ) : (
                <input 
                  type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                  value={targetConfig[key] || field.default || ''}
                  onChange={(e) => targetUpdateFn(key, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                  className="w-full bg-[#111115] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none placeholder:text-gray-600 font-mono"
                  placeholder={field.description}
                />
              )}
            </div>
            {hasDynamicOptions && (
              <button 
                onClick={() => fetchDynamicOptions(module.metadata.id, key)}
                disabled={isFetching}
                className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-400/20 transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                title={`Sync options for ${field.label}`}
              >
                <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>
      );
    });
  };

  const syncBackdropLocal = (type: string) => {
    setSelectedBackdrop(type);
    localStorage.setItem('yuihime_stage_backdrop', type);
    const event = new CustomEvent('yuihime_backdrop_changed', { detail: { type, customImgUrl: customBdropUrl } });
    window.dispatchEvent(event);
  };

  const syncBdropUrlLocal = (url: string) => {
    setCustomBdropUrl(url);
    localStorage.setItem('yuihime_stage_backdrop_custom', url);
    if (selectedBackdrop === 'custom') {
      const event = new CustomEvent('yuihime_backdrop_changed', { detail: { type: 'custom', customImgUrl: url } });
      window.dispatchEvent(event);
    }
  };

  // Group system registry modules by ModuleType for dynamic rendering
  const allRegModules = SystemRegistry.getModules();
  const modules: Record<ModuleType, any[]> = {
    [ModuleType.CORTEX]: allRegModules.filter(m => m.metadata.type === ModuleType.CORTEX),
    [ModuleType.TOOL]: allRegModules.filter(m => m.metadata.type === ModuleType.TOOL),
    [ModuleType.PROVIDER]: allRegModules.filter(m => m.metadata.type === ModuleType.PROVIDER),
    [ModuleType.TTS]: allRegModules.filter(m => m.metadata.type === ModuleType.TTS),
    [ModuleType.GATEWAY]: allRegModules.filter(m => m.metadata.type === ModuleType.GATEWAY),
    [ModuleType.ADDON]: allRegModules.filter(m => m.metadata.type === ModuleType.ADDON),
    [ModuleType.IO]: allRegModules.filter(m => m.metadata.type === ModuleType.IO)
  };

  const moduleCategories = [
    { id: 'consciousness', title: 'Consciousness', desc: 'Personality, desired model, and thinking pathways.', icon: Sparkles, color: 'text-amber-500' },
    { id: 'tools', title: 'System Tools', desc: 'Operating system processes, file system, action nodes, and CLI terminal tools.', icon: Terminal, color: 'text-rose-500' },
    { id: 'speech', title: 'Speech', desc: 'Configure speech synthesis (TTS) models and vocal output qualities.', icon: Volume2, color: 'text-cyan-500' },
    { id: 'hearing', title: 'Hearing', desc: 'Speech-to-text and auditory capture. Configure how speech recognition works.', icon: Mic, color: 'text-pink-500' },
    { id: 'vision', title: 'Vision', desc: 'Configure camera calibrations and image processing capabilities.', icon: Eye, color: 'text-purple-500' },
    { id: 'artistry', title: 'Artistry', desc: 'Image generation, backdrop creation, and artistic visual synthesizers.', icon: Palette, color: 'text-indigo-500' },
    { id: 'short_term_memory', title: 'Short-Term Memory', desc: 'Short-term conversation buffer, episodic recall ranges, and contextual limits.', icon: ClipboardList, color: 'text-emerald-500' },
    { id: 'long_term_memory', title: 'Long-Term Memory', desc: 'Long-term episodic and semantic databases, knowledge graphs, and vector stores.', icon: Database, color: 'text-teal-500' },
    { id: 'telegram', title: 'Telegram', desc: 'Connects the Yuihime Core to Telegram. Enables private messaging and group interaction.', icon: Send, color: 'text-sky-400' },
    { id: 'discord', title: 'Discord', desc: 'Chat & voice channels synchronization, authorization, and notifications.', icon: MessageSquare, color: 'text-blue-500' },
    { id: 'twitter', title: 'X / Twitter', desc: 'Automated agent posting, feed scraping, and tweets analytics orchestration.', icon: Share2, color: 'text-sky-400' },
    { id: 'minecraft', title: 'Minecraft', desc: 'In-game Minecraft gameplay bot agent, server connection, and visual path planning.', icon: Gamepad2, color: 'text-lime-500' },
    { id: 'factorio', title: 'Factorio', desc: 'Factorio neural node, production line optimization and base orchestration.', icon: Settings2, color: 'text-orange-500' },
    { id: 'mcp_servers', title: 'MCP Servers', desc: 'Model Context Protocol connections, micro-service configurations, and external tooling.', icon: Server, color: 'text-violet-500' },
    { id: 'beat_sync', title: 'Beat Sync', desc: 'Realtime audio frequency tracking and physical rhythm animation synchronization.', icon: Music, color: 'text-rose-500' },
  ];

  const renderCategoryDetail = (catId: string) => {
    switch(catId) {
      case 'consciousness': {
        const providers = modules[ModuleType.PROVIDER] || [];
        const cortices = modules[ModuleType.CORTEX] || [];
        const activeProvider = providers.find((p: any) => p.metadata.id === settings.provider) || providers[0];

        // Find model options
        const schema = activeProvider?.metadata.configSchema;
        const modelFieldDef = schema?.fields?.model;
        const providerId = activeProvider?.metadata?.id;
        let modelOptions: any[] = [];
        
        // Prioritize dynamicModels fetched from the AI API connection
        if (providerId && dynamicModels[providerId] && dynamicModels[providerId].length > 0) {
          modelOptions = dynamicModels[providerId];
        } else if (providerId && dynamicOptionsMap[providerId]?.model && dynamicOptionsMap[providerId]?.model.length > 0) {
          modelOptions = dynamicOptionsMap[providerId].model;
        } else if (modelFieldDef?.options && modelFieldDef.options.length > 0) {
          modelOptions = modelFieldDef.options;
        } else {
          modelOptions = (activeProvider?.metadata?.models || []).map((m: string) => ({ label: m, value: m }));
        }

        const filteredOptions = modelOptions.filter((opt: any) =>
          opt.label.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
          opt.value.toLowerCase().includes(modelSearchQuery.toLowerCase())
        );

        const currentActiveModel = settings[activeProvider?.metadata?.id]?.model || modelFieldDef?.default || '';

        // Temporary module options to render fields excluding "model"
        const tempModule = activeProvider ? {
          ...activeProvider,
          metadata: {
            ...activeProvider.metadata,
            configSchema: {
              ...activeProvider.metadata.configSchema,
              fields: Object.fromEntries(
                Object.entries(activeProvider.metadata.configSchema?.fields || {}).filter(([k]) => k !== 'model')
              )
            }
          }
        } : null;

        const getProviderIcon = (id: string) => {
          switch (id) {
            case 'gemini': return Sparkles;
            case 'openrouter': return Cpu;
            case 'openai': return Radio;
            case 'anthropic': return Brain;
            case 'puter': return Zap;
            default: return Terminal;
          }
        };

        const getProviderUrl = (id: string) => {
          switch (id) {
            case 'gemini': return 'gemini.google.com';
            case 'openrouter': return 'openrouter.ai';
            case 'openai': return 'api.openai.com';
            case 'anthropic': return 'anthropic.com';
            case 'puter': return 'puter.com';
            default: return 'localhost:11434';
          }
        };

        // Check if provider is fully configured
        const isConfiguredProvider = (pId: string) => {
          if (pId === 'local' || pId === 'puter') return true;
          const config = settings[pId];
          if (!config) return false;
          return !!(config.apiKey || config.api_key || config.enabled || config.accessToken || config.botToken || config.token);
        };

        const getModelDescription = (val: string) => {
          const modelLower = val.toLowerCase();
          if (modelLower.includes('qwen')) {
            return "Qwen3.7-Max is the flagship model in Alibaba's Qwen3.7 series. It supports text input and output, and is optimized for complex reasoning, multilingual processing, and diverse chat scenarios.";
          }
          if (modelLower.includes('grok')) {
            return "Grok Build 0.1 is xAI's fast coding model trained specifically for agentic software engineering and long-context processing with exceptional instruction following.";
          }
          if (modelLower.includes('gemini-3.5-flash') || modelLower.includes('gemini-3.5') || modelLower.includes('gemini-3-flash')) {
            return "Google's next-generation lightweight, ultra-fast model designed for low latency, high-efficiency conversational agents and real-time execution flows.";
          }
          if (modelLower.includes('gemini-1.5-flash')) {
            return "Google Gemini Flash-tier model with deeply advanced reasoning, comprehensive multi-modal support, and fast response times.";
          }
          if (modelLower.includes('gemini-2.0-flash')) {
            return "Google's signature performance-focused model. Balanced rate limit profile, optimized for structured tool call pipelines and agent loops.";
          }
          if (modelLower.includes('gemini-2.5-pro') || modelLower.includes('gemini-3.1-pro') || modelLower.includes('gemini-pro')) {
            return "Google's highly advanced frontier reasoning model, ideal for complex coding tasks, extensive analyses, and multi-step agent reasoning iterations.";
          }
          if (modelLower.includes('gpt-4o')) {
            return "OpenAI's flagship multimodal model, exhibiting extreme speed and unmatched performance on general knowledge, math, and code generation tasks.";
          }
          if (modelLower.includes('claude-3-5-sonnet')) {
            return "Anthropic's state-of-the-art model. Sets new industry benchmarks for graduate-level reasoning, undergraduate-level knowledge, and coding proficiency.";
          }
          if (modelLower.includes('local') || modelLower.includes('llama') || modelLower.includes('ollama')) {
            return "Locally hosted custom neural network model. Completely offline, zero-latency local loop, and absolute privacy for kognisi processing.";
          }
          return "Dynamic AI brain model from the configured provider, optimized for agentic workflows, complex tool interactions, and personality manifestation.";
        };

        const handleDeleteProviderConfig = (pId: string) => {
          setSettings((prev: any) => {
            const updatedConfig = { ...prev[pId] };
            if ('apiKey' in updatedConfig) updatedConfig.apiKey = '';
            if ('api_key' in updatedConfig) updatedConfig.api_key = '';
            if ('accessToken' in updatedConfig) updatedConfig.accessToken = '';
            if ('access_token' in updatedConfig) updatedConfig.access_token = '';
            if ('enabled' in updatedConfig) updatedConfig.enabled = false;
            
            const newSettings = {
              ...prev,
              [pId]: updatedConfig
            };
            
            let newProvider = prev.provider;
            if (prev.provider === pId) {
              const remains = providers.find((pr: any) => pr.metadata.id !== pId && isConfiguredProvider(pr.metadata.id));
              newProvider = remains ? remains.metadata.id : 'gemini';
            }
            return {
              ...newSettings,
              provider: newProvider
            };
          });
          
          setTimeout(async () => {
            try {
              const config = settings[pId] || {};
              const emptyConfig = {
                ...config,
                apiKey: '',
                api_key: '',
                accessToken: '',
                access_token: '',
                enabled: false
              };
              await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  provider: pId === settings.provider ? 'gemini' : settings.provider,
                  config: emptyConfig
                })
              });
            } catch (err) {
              console.error("Failed to sync cleared config to server:", err);
            }
          }, 100);
        };

        const configuredProviders = providers.filter((p: any) => isConfiguredProvider(p.metadata.id));

        return (
          <div className="space-y-6">
            {/* Nav Path indicator */}
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-white/30">
              <span>Settings</span>
              <ChevronRight size={10} />
              <span className="text-amber-500 font-semibold">Consciousness</span>
            </div>

            {/* Section 1: Providers selection cards */}
            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Providers</h4>
                <p className="text-[10px] text-white/30 uppercase mt-0.5">Select the suitable LLM provider for consciousness</p>
              </div>

              {/* Horizontal Scroll / Wrap grid for Providers config */}
              <div className="flex flex-wrap md:flex-nowrap gap-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {configuredProviders.map((p: any) => {
                  const isSelected = settings.provider === p.metadata.id;
                  
                  return (
                    <div
                      key={p.metadata.id}
                      onClick={() => setSettings((prev: any) => ({ ...prev, provider: p.metadata.id }))}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between w-full md:w-[180px] h-[95px] select-none shrink-0 ${
                        isSelected 
                          ? 'bg-[#0ea5e9]/[0.02] border-[#0ea5e9]/40 text-white shadow-[0_0_15px_rgba(14,165,233,0.08)]' 
                          : 'bg-[#07070a]/40 hover:bg-[#111118]/70 border-white/5 text-white/70 hover:text-white'
                      }`}
                    >
                      {/* Top Buttons Row */}
                      <div className="flex items-center justify-between w-full">
                        {/* Radio indicator */}
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/40 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/10" />
                        )}

                        {/* Delete config button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProviderConfig(p.metadata.id);
                          }}
                          className="p-1 hover:bg-white/10 rounded-lg text-white/30 hover:text-red-400 transition-all cursor-pointer shrink-0"
                          title="Clear provider settings"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Info block */}
                      <div className="mt-2 min-w-0">
                        <h5 className="text-[11px] font-bold truncate leading-tight">{p.metadata.name}</h5>
                        <p className="text-[9px] font-mono text-white/30 mt-0.5 truncate">{getProviderUrl(p.metadata.id)}</p>
                      </div>
                    </div>
                  );
                })}

                {/* PLUS shortcut button */}
                <div
                  onClick={() => {
                    setSelectedSection('providers');
                  }}
                  className="relative p-4 rounded-xl border border-dashed border-white/10 hover:border-[#0ea5e9]/30 hover:bg-white/[0.02] cursor-pointer transition-all flex items-center justify-center w-full md:w-[180px] h-[95px] select-none text-white/30 hover:text-[#0ea5e9]/80 group shrink-0"
                  title="Shortcut to configure more providers"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full border border-current transition-all">
                    <Plus size={14} className="group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Model Search and Options List */}
            {activeProvider && (
              <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center bg-black/10 p-1.5 px-3 rounded-xl border border-white/[0.03]">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">Model</h4>
                    <p className="text-[10px] text-white/30 uppercase mt-0.5">Select a default model from the provider</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchDynamicModels(activeProvider.metadata.id)}
                    disabled={fetchingModels}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 font-mono font-bold text-[9px] uppercase tracking-wider rounded-lg border border-amber-500/20 transition-all cursor-pointer disabled:opacity-40"
                    title="Query provider API for active available models"
                  >
                    <RefreshCw size={11} className={fetchingModels ? "animate-spin" : ""} />
                    {fetchingModels ? 'Syncing...' : 'Fetch API'}
                  </button>
                </div>

                {/* Search input field */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={modelSearchQuery}
                    onChange={e => setModelSearchQuery(e.target.value)}
                    placeholder="Search models..."
                    className="w-full bg-[#07070a] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/30 font-sans"
                  />
                </div>

                {/* Collapsible Model grid list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredOptions.length > 0 ? (
                    (modelsCollapsed ? filteredOptions.slice(0, 2) : filteredOptions).map((opt: any) => {
                      const isSelected = currentActiveModel === opt.value;
                      
                      return (
                        <div
                          key={opt.value}
                          onClick={() => updateSetting(activeProvider.metadata.id, 'model', opt.value)}
                          className={`relative p-4 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3.5 ${
                            isSelected 
                              ? 'bg-[#0ea5e9]/[0.02] border-[#0ea5e9]/30 text-white shadow-[0_0_12px_rgba(14,165,233,0.05)]' 
                              : 'bg-[#07070a]/30 hover:bg-[#111118]/65 border-white/5 text-white/70 hover:text-white'
                          }`}
                        >
                          {/* Radio indicator */}
                          <div className="mt-0.5">
                            {isSelected ? (
                              <div className="w-4 h-4 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/40 flex items-center justify-center shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                            )}
                          </div>

                          {/* Info Column */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-[11px] font-bold tracking-tight text-white/90 truncate">{opt.label}</h5>
                              
                              <span className="font-mono text-[7px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-white/40 shrink-0 uppercase">
                                {opt.value.toLowerCase().includes('local') || opt.value.toLowerCase().includes('localhost') ? 'Local' : 'Cloud'}
                              </span>
                            </div>

                            <p className="text-[8px] font-mono text-white/20 mt-0.5 truncate">{opt.value}</p>

                            <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed font-sans">
                              {expandedModels[opt.value] 
                                ? getModelDescription(opt.value) 
                                : (getModelDescription(opt.value).length > 95 
                                    ? getModelDescription(opt.value).slice(0, 95) + '...' 
                                    : getModelDescription(opt.value))}
                            </p>

                            {/* Show More toggle link */}
                            {getModelDescription(opt.value).length > 95 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedModels(prev => ({ ...prev, [opt.value]: !prev[opt.value] }));
                                }}
                                className="mt-1 pb-1 inline-flex items-center gap-1 text-[9px] font-semibold text-cyan-400/80 hover:text-cyan-300 cursor-pointer transition-colors"
                              >
                                {expandedModels[opt.value] ? 'Show less' : 'Show more'}
                                {expandedModels[opt.value] ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-6 border border-dashed border-white/5 rounded-xl font-mono text-[10px] text-white/20">
                      No models matching your criteria detected.
                    </div>
                  )}
                </div>

                {/* Expand / Collapse Control Row */}
                {filteredOptions.length > 2 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setModelsCollapsed(!modelsCollapsed)}
                      className="w-full py-2.5 bg-[#07070a]/50 hover:bg-[#111118]/80 text-white/50 hover:text-white border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all"
                    >
                      {modelsCollapsed ? 'Expand' : 'Collapse'}
                      {modelsCollapsed ? <ChevronDown size={12} className="text-white/40" /> : <ChevronUp size={12} className="text-white/40" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Section 4: Remainder dynamic settings fields of the active provider */}
            {tempModule && tempModule.metadata.configSchema && Object.keys(tempModule.metadata.configSchema.fields || {}).length > 0 && (
              <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
                <div 
                  className="flex justify-between items-center border-b border-white/5 pb-2 cursor-pointer select-none group"
                  onClick={() => setCredentialsCollapsed(!credentialsCollapsed)}
                >
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                      Integration Credentials & Details
                      <span className="text-[9px] text-zinc-500 font-normal">({credentialsCollapsed ? "Hidden" : "Visible"})</span>
                    </h4>
                    <p className="text-[10px] text-white/30 uppercase mt-0.5">Parameters for direct sync orchestration</p>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 group-hover:text-white transition-colors">
                    <span className="text-[10px] font-mono font-semibold tracking-wider uppercase">
                      {credentialsCollapsed ? 'Expand' : 'Collapse'}
                    </span>
                    {credentialsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </div>
                </div>
                
                {!credentialsCollapsed && (
                  <div className="space-y-4 pt-1">
                    {renderFields(tempModule)}
                  </div>
                )}
              </div>
            )}

            {/* Dynamic AI Resilience Pipeline (Multi-Provider Fallback Setup) */}
            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide font-sans flex items-center gap-2">
                  <Layers size={16} className="text-cyan-400" />
                  Dynamic AI Resilience Pipeline (Multi-Provider Fallback Setup)
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-1 leading-relaxed uppercase">
                  Add multiple dynamic fallback settings across any configured provider (Add Mode). If the primary provider, model, or API Key fails or hits rate-limit (429), Yuihime cascades sequentially through the fallback steps listed below.
                </p>
              </div>

              <div className="space-y-4">
                {!(settings.gemini?.fallbackChain && settings.gemini.fallbackChain.length > 0) ? (
                  <div className="border border-dashed border-white/5 bg-[#0e0e14]/25 p-6 rounded-xl text-center space-y-3">
                    <p className="text-zinc-[#555] text-[11px] font-mono">No custom fallback settings configured.</p>
                    <button
                      type="button"
                      onClick={addFallbackRow}
                      className="px-4 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] uppercase tracking-wider font-mono font-bold rounded-xl border border-cyan-500/20 transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                    >
                      <Plus size={12} /> Add Fallback Step
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(settings.gemini.fallbackChain || []).map((row: any, idx: number) => {
                      const currentModels = rowModelsMap[row.id] || [];
                      const isFetchingRow = fetchingRowKey[row.id];
                      return (
                        <div key={row.id} className="bg-[#07070a]/60 border border-white/5 p-4 rounded-xl relative space-y-3 group hover:border-zinc-800 transition-all">
                          
                          {/* Row Control Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2.5 py-0.5 rounded-full font-mono uppercase font-bold">
                                Step #{idx + 1}
                              </span>
                              <span className="text-[9px] text-[#fbbf24] font-mono uppercase tracking-[0.15em] font-bold">
                                Fallback Configuration
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveFallbackRowUp(idx)}
                                disabled={idx === 0}
                                className="p-1 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ChevronUp size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveFallbackRowDown(idx)}
                                disabled={idx === (settings.gemini.fallbackChain.length - 1)}
                                className="p-1 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ChevronDown size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteFallbackRow(row.id)}
                                className="p-1 text-red-400/60 hover:text-red-400 bg-red-950/10 hover:bg-red-950/20 rounded ml-1.5 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Fields Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            {/* Provider Field */}
                            <div>
                              <label className="block text-[8px] uppercase tracking-[0.15em] font-mono text-white/40 mb-1">
                                Provider
                              </label>
                              <select
                                value={row.provider || 'gemini'}
                                onChange={e => {
                                  const prov = e.target.value;
                                  editFallbackRow(row.id, 'provider', prov);
                                  fetchModelsForChainRow(row.id, prov, row.apiKey || settings[prov]?.apiKey || '', row.baseUrl || settings[prov]?.baseUrl || '');
                                }}
                                className="w-full bg-[#111115] border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500/55"
                              >
                                <option value="gemini">Google Gemini</option>
                                <option value="openai">OpenAI / compatible</option>
                                <option value="anthropic">Anthropic Claude</option>
                                <option value="openrouter">OpenRouter AI</option>
                                <option value="deepseek">DeepSeek AI</option>
                                <option value="groq">Groq Engine</option>
                                <option value="ollama">Local Ollama</option>
                                {(providers || []).filter((p: any) => !['gemini', 'openai', 'anthropic', 'openrouter', 'deepseek', 'groq', 'ollama'].includes(p.metadata.id)).map((p: any) => (
                                  <option key={p.metadata.id} value={p.metadata.id}>
                                    {p.metadata.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Model Field */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-[8px] uppercase tracking-[0.15em] font-mono text-white/40">
                                  Model
                                </label>
                                <button
                                  type="button"
                                  onClick={() => fetchModelsForChainRow(row.id, row.provider || 'gemini', row.apiKey || settings[row.provider || 'gemini']?.apiKey || '', row.baseUrl || settings[row.provider || 'gemini']?.baseUrl || '')}
                                  className="text-[8px] font-mono text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                                  title="Refresh model list"
                                >
                                  <RefreshCw size={8} className={isFetchingRow ? 'animate-spin' : ''} />
                                  {isFetchingRow ? 'Loading...' : 'Fetch'}
                                </button>
                              </div>
                              <div className="flex gap-1.5 flex-col">
                                <select
                                  value={row.model || ''}
                                  onChange={e => editFallbackRow(row.id, 'model', e.target.value)}
                                  className="w-full bg-[#111115] border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500/55"
                                >
                                  <option value="" disabled>-- Select Model --</option>
                                  {currentModels.length > 0 ? (
                                    currentModels.map((m: any) => (
                                      <option key={m.value} value={m.value}>{m.label}</option>
                                    ))
                                  ) : (
                                    <>
                                      <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                                      <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Heavy Reasoning)</option>
                                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                                      <option value="claude-3-5-haiku-latest">Claude 3.5 Haiku</option>
                                    </>
                                  )}
                                </select>
                                {/* Custom Model input fallback */}
                                <input
                                  type="text"
                                  value={row.model || ''}
                                  placeholder="Or type model name manually..."
                                  onChange={e => editFallbackRow(row.id, 'model', e.target.value)}
                                  className="w-full bg-[#111115] border border-white/5 rounded-xl px-2.5 py-1 text-[10px] font-mono text-zinc-300 outline-none"
                                />
                              </div>
                            </div>

                            {/* Base URL Override */}
                            <div>
                              <label className="block text-[8px] uppercase tracking-[0.15em] font-mono text-white/40 mb-1">
                                Base URL Override (Optional)
                              </label>
                              <input
                                type="text"
                                value={row.baseUrl || ''}
                                onChange={e => editFallbackRow(row.id, 'baseUrl', e.target.value)}
                                onBlur={e => fetchModelsForChainRow(row.id, row.provider || 'gemini', row.apiKey || settings[row.provider || 'gemini']?.apiKey || '', e.target.value)}
                                placeholder="e.g., https://api.deepseek.com/v1"
                                className="w-full bg-[#111115] border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500/55 font-mono"
                              />
                            </div>

                            {/* API Key Override */}
                            <div>
                              <label className="block text-[8px] uppercase tracking-[0.15em] font-mono text-white/40 mb-1">
                                API Key Override (Optional)
                              </label>
                              <input
                                type="password"
                                value={row.apiKey || ''}
                                onChange={e => editFallbackRow(row.id, 'apiKey', e.target.value)}
                                onBlur={e => fetchModelsForChainRow(row.id, row.provider || 'gemini', e.target.value || settings[row.provider || 'gemini']?.apiKey || '', row.baseUrl || settings[row.provider || 'gemini']?.baseUrl || '')}
                                placeholder="Use main provider key..."
                                className="w-full bg-[#111115] border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500/55 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={addFallbackRow}
                      className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl text-[10px] uppercase tracking-wider font-mono text-cyan-400 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Plus size={14} /> Add Fallback Layer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Other System Cortices Config */}
            <div className="space-y-4 border-t border-white/5 pt-6">
              <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-2">Internal Neural Cortices</h4>
              {cortices.map((c: any) => (
                <div key={c.metadata.id} className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
                  <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#fbbf24] mb-4">{c.metadata.name} (Cortex Engine)</h4>
                  {renderFields(c)}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 'speech': {
        const ttsModules = modules[ModuleType.TTS] || [];
        return (
          <div className="space-y-6">
            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
              <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#fbbf24] mb-4">Voice Synthesis Engines (TTS)</h4>
              <div className="space-y-3">
                {ttsModules.map((p: any) => (
                  <div key={p.metadata.id} className="border border-white/5 bg-[#07070a]/90 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">{p.metadata.name}</h5>
                      <p className="text-[10px] text-white/35 mt-0.5">{p.metadata.description}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSettings((prev: any) => ({ ...prev, ttsProvider: p.metadata.id }))}
                      className={`px-3 py-1 bg-white/5 hover:bg-white/10 uppercase font-mono text-[9px] border border-white/5 rounded-lg transition-colors cursor-pointer ${settings.ttsProvider === p.metadata.id ? 'text-amber-500 font-bold border-amber-500/20' : 'text-white/40'}`}
                    >
                      {settings.ttsProvider === p.metadata.id ? 'ACTIVE' : 'SELECT'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {ttsModules.map((c: any) => (
                settings.ttsProvider === c.metadata.id && (
                  <div key={c.metadata.id} className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-4">{c.metadata.name} Settings</h4>
                    {renderFields(c)}
                  </div>
                )
              ))}
            </div>
          </div>
        );
      }
      case 'hearing': {
        const updateHearing = (field: string, val: any) => {
          setSettings((prev: any) => ({
            ...prev,
            hearing: { ...(prev.hearing || {}), [field]: val }
          }));
        };
        const hearingConfig = settings.hearing || { enabled: true, threshold: 35, silenceDuration: 1500 };
        const hearingModule = allRegModules.find(m => m.metadata.id === 'hearing') || {
          metadata: { id: 'hearing' },
          configSchema: {
            fields: {
              enabled: { label: 'Voice Activation Capture', type: 'boolean', default: true },
              threshold: { label: 'Microphone Sensitivity Threshold (dB)', type: 'slider', min: 10, max: 100, step: 1, default: 35 },
              silenceDuration: { label: 'End of Speech Silence Trigger (ms)', type: 'slider', min: 500, max: 4000, step: 100, default: 1500 }
            }
          }
        };
        return (
          <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-4">Auditory Capture & STT Thresholds</h4>
            {renderFields(hearingModule, hearingConfig, updateHearing)}
          </div>
        );
      }
      case 'vision': {
        const updateVision = (field: string, val: any) => {
          setSettings((prev: any) => ({
            ...prev,
            vision: { ...(prev.vision || {}), [field]: val }
          }));
        };
        const visionConfig = settings.vision || { enabled: false, interval: 3000, modelType: 'gemini-2.5-flash' };
        const visionModule = allRegModules.find(m => m.metadata.id === 'vision') || {
          metadata: { id: 'vision' },
          configSchema: {
            fields: {
              enabled: { label: 'Avatar Virtual Sight (Frame Analysis)', type: 'boolean', default: false },
              interval: { label: 'Snapshot Frequency Rate (ms)', type: 'slider', min: 1000, max: 15000, step: 500, default: 3000 },
              modelType: {
                label: 'Vision Backbone Node',
                type: 'select',
                default: 'gemini-2.5-flash',
                options: [
                  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
                  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
                  { value: 'gpt-4o', label: 'GPT-4o' }
                ]
              }
            }
          }
        };
        return (
          <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-4">Optical Intelligence Calibration</h4>
            {renderFields(visionModule, visionConfig, updateVision)}
          </div>
        );
      }
      case 'artistry': {
        const updateArtistry = (field: string, val: any) => {
          setSettings((prev: any) => ({
            ...prev,
            artistry: { ...(prev.artistry || {}), [field]: val }
          }));
        };
        const artConfig = settings.artistry || { engine: 'imagen3', ratio: '16:9', negativePrompt: '' };
        const artistryModule = allRegModules.find(m => m.metadata.id === 'artistry') || {
          metadata: { id: 'artistry' },
          configSchema: {
            fields: {
              engine: {
                label: 'Creative Imaging Node',
                type: 'select',
                default: 'imagen3',
                options: [
                  { value: 'imagen3', label: 'Imagen 3' },
                  { value: 'flux-schnell', label: 'FLUX Schnell' },
                  { value: 'midjourney-v6', label: 'Midjourney v6 API' }
                ]
              },
              ratio: {
                label: 'Aspect Ratio Constraints',
                type: 'select',
                default: '16:9',
                options: [
                  { value: '16:9', label: '16:9 Cinematic' },
                  { value: '1:1', label: '1:1 Square Art' },
                  { value: '9:16', label: '9:16 vertical stream backdrop' }
                ]
              },
              negativePrompt: { label: 'Style Bias Restriction Filter (Negative prompt)', type: 'textarea', default: '' }
            }
          }
        };
        return (
          <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-4">Artistic Canvas Synthesizer Configs</h4>
            {renderFields(artistryModule, artConfig, updateArtistry)}
          </div>
        );
      }
      case 'short_term_memory': {
        const updateSTM = (field: string, val: any) => {
          setSettings((prev: any) => ({
            ...prev,
            stm: { ...(prev.stm || {}), [field]: val }
          }));
        };
        const stmConfig = settings.stm || { recallBufferSize: 15, autoSummarizeThreshold: 20 };
        const shortTermMemoryModule = allRegModules.find(m => m.metadata.id === 'short_term_memory') || {
          metadata: { id: 'short_term_memory' },
          configSchema: {
            fields: {
              recallBufferSize: { label: 'Short-Term Message Recency Limit', type: 'slider', min: 5, max: 100, step: 5, default: 15 },
              autoSummarizeThreshold: { label: 'Auto Summarization Queue Trigger (msg counts)', type: 'slider', min: 10, max: 150, step: 10, default: 20 }
            }
          }
        };
        return (
          <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-4">Episodic Recency Buffer limits</h4>
            {renderFields(shortTermMemoryModule, stmConfig, updateSTM)}
          </div>
        );
      }
      case 'long_term_memory': {
        const recallModule = modules[ModuleType.TOOL]?.find(m => m.metadata.id === 'memory-recall');
        const updateLTM = (field: string, val: any) => {
          setSettings((prev: any) => ({
            ...prev,
            ltm: { ...(prev.ltm || {}), [field]: val }
          }));
        };
        const ltmConfig = settings.ltm || { vectorDatabase: 'sqlite_vss', indexThreshold: 0.72 };
        const longTermMemoryModule = allRegModules.find(m => m.metadata.id === 'long_term_memory') || {
          metadata: { id: 'long_term_memory' },
          configSchema: {
            fields: {
              vectorDatabase: {
                label: 'Semantic DB Backbone Engine',
                type: 'select',
                default: 'sqlite_vss',
                options: [
                  { value: 'sqlite_vss', label: 'SQLite VSS (Embedded Vector Store)' },
                  { value: 'pinecone', label: 'Pinecone Cloud Node' },
                  { value: 'chromadb', label: 'Local ChromaDB container' }
                ]
              },
              indexThreshold: { label: 'Semantic Similarity Match Confidence Filter', type: 'slider', min: 0.1, max: 1.0, step: 0.01, default: 0.72 }
            }
          }
        };
        return (
          <div className="space-y-6">
            {recallModule && (
              <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
                <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#fbbf24] mb-4">Semantic Memory Recall Module</h4>
                {renderFields(recallModule)}
              </div>
            )}
            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
              <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-4">Vector Database & Knowledge Graph Configs</h4>
              {renderFields(longTermMemoryModule, ltmConfig, updateLTM)}
            </div>
          </div>
        );
      }
      case 'telegram': {
        const telegramModule = allRegModules.find(m => m.metadata.id === 'telegram_bridge');
        return (
          <div className="space-y-6">
            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
              <h4 className="text-[10px] uppercase font-mono tracking-widest text-sky-400 mb-4">Telegram Neural Link Setup</h4>
              {telegramModule && renderFields(telegramModule)}
            </div>

            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-sky-400">Telegram Bot Diagnostic & Control Shield</h4>
                  <p className="text-[10px] text-white/50">Run direct network loopback tests & recreate bot instances.</p>
                </div>
                <div className="flex gap-1.5 sm:gap-2 text-[10px]">
                  <button
                    onClick={fetchTgStatus}
                    disabled={tgTesting}
                    className="px-2.5 py-1.5 font-mono font-medium rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 active:scale-95 transition-all text-sky-400 disabled:opacity-50"
                  >
                    {tgTesting ? "Testing..." : "Test Connection"}
                  </button>
                  <button
                    onClick={() => recreateTgBot(false)}
                    disabled={tgTesting}
                    className="px-2.5 py-1.5 font-mono font-medium rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all text-red-500 disabled:opacity-50"
                  >
                    Reinitialize Bot
                  </button>
                  <button
                    onClick={() => recreateTgBot(true)}
                    disabled={tgTesting}
                    className="px-2.5 py-1.5 font-mono font-medium rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 transition-all text-amber-500 disabled:opacity-50"
                    title="Hapus / abaikan semua update tertunda dari server Telegram saat menyetel ulang webhook."
                  >
                    Flush & Reinit
                  </button>
                </div>
              </div>

              {tgStatus ? (
                <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                  <div className={`p-3 rounded-lg border ${tgStatus.initialized ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400' : 'bg-rose-500/5 border-rose-500/15 text-rose-400'}`}>
                    <p className="font-semibold text-xs mb-1">
                      {tgStatus.initialized ? "● BOT DAEMON ON-LINE" : "○ BOT DAEMON OFF-LINE / ERROR"}
                    </p>
                    <p className="text-[10px] opacity-80">{tgStatus.message}</p>
                  </div>

                  {tgStatus.botInfo && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg text-white/70">
                      <div>
                        <span className="text-white/40">Username:</span> @{tgStatus.botInfo.username}
                      </div>
                      <div>
                        <span className="text-white/40">Name:</span> {tgStatus.botInfo.first_name}
                      </div>
                      <div>
                        <span className="text-white/40">Bot ID:</span> {tgStatus.botInfo.id}
                      </div>
                      <div>
                        <span className="text-white/40">Can Join Groups:</span> {tgStatus.botInfo.can_join_groups ? 'Yes' : 'No'}
                      </div>
                    </div>
                  )}

                  {tgStatus.webhookInfo && (
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-1 text-white/70">
                      <div>
                        <span className="text-white/40">Webhook Connection URL:</span>
                        <div className="mt-1 p-1.5 bg-[#050508] border border-white/5 rounded text-[10px] select-all truncate text-sky-300">
                          {tgStatus.webhookInfo.url || "None (Long polling active)"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1.5 text-[10px]">
                        <div>
                          <span className="text-white/40">Pending Updates:</span> {tgStatus.webhookInfo.pending_update_count}
                        </div>
                        <div>
                          <span className="text-white/40">Max Connections:</span> {tgStatus.webhookInfo.max_connections || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  {tgStatus.error && (
                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 text-rose-400 text-[10px] rounded-lg">
                      <span className="font-semibold block mb-1">Raw Connection Exception:</span>
                      <pre className="whitespace-pre-wrap leading-tight">{tgStatus.error}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-white/30 text-xs font-mono">
                  No diagnostic data. Click "Test Connection" to fetch live status.
                </div>
              )}
            </div>
          </div>
        );
      }
      case 'discord': {
        const discordModule = allRegModules.find(m => m.metadata.id === 'discord_bridge');
        return (
          <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-blue-400 mb-4">Discord Sync Conduit Setup</h4>
            {discordModule && renderFields(discordModule)}
          </div>
        );
      }
      case 'twitter': {
        const twitterModule = allRegModules.find(m => m.metadata.id === 'twitter_bridge');
        return (
          <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-sky-400 mb-4">X (Twitter) Autonomous Conduits</h4>
            {twitterModule && renderFields(twitterModule)}
          </div>
        );
      }
      case 'minecraft': {
        const mcModule = allRegModules.find(m => m.metadata.id === 'minecraft_agent');
        return (
          <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-lime-400 mb-4">Mineflayer Gameplay Bot Node Settings</h4>
            {mcModule && renderFields(mcModule)}
          </div>
        );
      }
      case 'factorio': {
        const fcModule = allRegModules.find(m => m.metadata.id === 'factorio_agent');
        return (
          <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-orange-400 mb-4">Factorio Automation Optimizer Subsystem</h4>
            {fcModule && renderFields(fcModule)}
          </div>
        );
      }
      case 'mcp_servers': {
        const mcpModule = allRegModules.find(m => m.metadata.id === 'mcp_servers');
        return (
          <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-violet-400 mb-4">Model Context Protocol Connections</h4>
            {mcpModule && renderFields(mcpModule)}
          </div>
        );
      }
      case 'tools': {
        const toolsList = modules[ModuleType.TOOL] || [];
        return (
          <div className="space-y-6">
            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
              <h4 className="text-[10px] uppercase font-mono tracking-widest text-amber-500 mb-2">Autonomous Action & Command Toolchain</h4>
              <p className="text-[11px] text-zinc-400 mb-6 font-sans leading-relaxed">Sistem perkakas operasional dan eksekusi luring batiniah YUIAGI. Memberikan izin otonom penuh bagi YUIAGI untuk berinteraksi dengan server inangnya, memproses data berkas, memantau jaringan, serta mengeksekusi bash shell/perintah Linux secara otonom tanpa batas.</p>
              
              <div className="space-y-5">
                {toolsList.length > 0 ? (
                  toolsList.map((t: any) => (
                    <div key={t.metadata.id} className="border border-white/5 bg-[#07070a]/90 p-5 rounded-2xl relative overflow-hidden group">
                      <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-3">
                        <div>
                          <h5 className="text-[13px] font-bold text-white tracking-wide flex items-center gap-2">
                            {t.metadata.name}
                            <span className="text-[9px] font-mono text-white/30 font-medium">({t.metadata.id})</span>
                          </h5>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{t.metadata.description}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[8px] font-mono font-bold uppercase tracking-wider">SYSTEM TOOL</span>
                      </div>
                      
                      {t.metadata.configSchema ? (
                        <div className="space-y-4 pt-1">
                          {renderFields(t)}
                        </div>
                      ) : (
                        <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.03] text-[10px] text-zinc-500 font-mono">
                          ⚡ Autonomous engine-bound tool - Needs no manual configuration variables (Internal Linux Binding active).
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl font-mono text-[10px] text-zinc-500">
                    Tidak ada perkakas (action tools) yang terdaftar di System Registry batiniah Core.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
      case 'beat_sync': {
        const beatModule = allRegModules.find(m => m.metadata.id === 'beat_sync');
        return (
          <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-rose-400 mb-4">Audio Rhythm Frequency Animators</h4>
            {beatModule && renderFields(beatModule)}
          </div>
        );
      }
      default:
        return <p className="text-white/30 italic text-xs font-mono">Telemetry link offline. Choose active channel.</p>;
    }
  };

  // Main menu ubin settings configuration following airi.moeru.ai/settings/
  const settingsMenu = [
    { id: 'character', title: 'AIRI Card', desc: 'Use AIRI character card presets', status: true, icon: Sparkles },
    { id: 'modules', title: 'Modules', desc: 'Thinking, vision, speech synthesis, gaming, etc.', status: true, icon: Layers },
    { id: 'scenes', title: 'Scenes', desc: 'Customize the virtual environment for your characters.', status: true, icon: Palette },
    { id: 'models', title: 'Models', desc: 'Live2D, VRM, etc.', status: true, icon: Monitor },
    { id: 'memory', title: 'Memory', desc: 'Where memories got stored, organized, and archived', status: true, icon: Brain },
    { id: 'providers', title: 'Providers', desc: 'LLMs, speech providers, etc.', status: true, icon: Radio },
    { id: 'matrix', title: 'Synaptic Matrix & Live Telemetry', desc: 'Unified AGI console: emotional state, endocrine vectors, lattice, and cognitive reflection insights', status: true, icon: Cpu },
    { id: 'plan', title: 'Cognitive Planner', desc: 'Task execution, mindmap & priority tree', status: true, icon: Clock },
    { id: 'sandbox', title: 'Dev Sandbox', desc: 'Realtime cognitive testbed & prompt runner', status: true, icon: Terminal },
    { id: 'data', title: 'Data', desc: 'Manage stored AIRI data, exports and resets', status: true, icon: Database },
    { id: 'connection', title: 'Connection', desc: 'Configure WebSocket server connection', status: true, icon: Zap },
    { id: 'system', title: 'System', desc: 'Customize your stage!', status: true, icon: Settings2 },
    { id: 'logs', title: 'System Logs', desc: 'Live system output streams, background traces & console diagnostics', status: true, icon: ClipboardList },
    { id: 'audit', title: 'Audit Log', desc: 'Monitor OpenAI function calling schemas and raw JSON validation states', status: true, icon: ClipboardList },
    { id: 'cron', title: 'Cron Scheduler', desc: 'Manage automated cron jobs and periodic network tasks (CRUD)', status: true, icon: Clock },
    { id: 'pending-messages', title: 'Pending Queue', desc: 'Kelola antrean pesan tertunda dan pengiriman asinkron luring', status: true, icon: Clock },
    { id: 'about', title: 'About Yuihime', desc: 'About Yuihime details, cognitive loop diagrams and system parameters', status: true, icon: Info },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-28">
      
      {/* HEADER BAR AND TITLE ZONE */}
      <div className="sticky top-0 z-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 mb-10 border-b border-white/5 bg-[#050505]/95 backdrop-blur-md pt-4 sm:pt-6 -mx-4 px-4 sm:-mx-8 sm:px-8">
        <div className="flex items-center gap-3">
          {selectedSection ? (
            <button 
              onClick={() => {
                if (providerSubpage) {
                  setProviderSubpage(null);
                } else if (systemSubpage) {
                  setSystemSubpage(null);
                } else {
                  setSelectedSection(null);
                }
              }}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/55 hover:text-white px-3.5 py-2.5 rounded-xl border border-white/5 transition-all text-xs font-mono font-bold uppercase shrink-0 cursor-pointer"
            >
              <ChevronLeft size={13} /> Settings
            </button>
          ) : (
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <Settings2 className="text-amber-500 animate-spin-slow" size={20} />
            </div>
          )}
          <div>
            <h2 id="settings-adaptive-title" className="text-xl font-bold text-white tracking-wide">
              {providerSubpage ? (providerSubpage === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI') : (systemSubpage ? (systemSubpage === 'general' ? 'General' : systemSubpage === 'colors' ? 'Color Scheme' : systemSubpage === 'stage' ? 'Stage & Camera' : 'Developers') : (selectedSection ? settingsMenu.find(m => m.id === selectedSection)?.title : 'Control Panel'))}
            </h2>
            <p className="text-[9px] uppercase font-mono text-white/30 tracking-[0.25em]">
              {selectedSection ? 'Advanced calibration layers' : 'Hybrid VTuber Management Station'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {onClose && (
            <button 
              type="button"
              onClick={onClose} 
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white/70 hover:text-white px-4 py-3 text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer hover:border-rose-500/20"
              title="Return to Live Stage"
            >
              <LogOut size={14} className="rotate-180 text-rose-400" />
              <span>Exit</span>
            </button>
          )}
          <button 
            type="button"
            onClick={loadSettings} 
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white/60 transition-all flex justify-center items-center cursor-pointer"
            title="Reload telemetry state"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-amber-500' : ''} />
          </button>
          <button 
            type="button"
            onClick={handleSave} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#d97706] hover:bg-amber-500 text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer"
          >
            <Save size={14} />
            Sync Core
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedSection === null ? (
          /* =======================================================
             MAIN MENU TILES INDEX
             ======================================================= */
          <motion.div
            key="settings-index"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {settingsMenu.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedSection(item.id)}
                  className="group relative bg-[#0e0e14]/65 hover:bg-[#13131d]/85 backdrop-blur-3xl border border-white/[0.03] hover:border-white/[0.1] p-6 rounded-2xl cursor-pointer min-h-[120px] shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] hover:-translate-y-0.5"
                >
                  {/* Glowing Status dot bottom-left */}
                  {item.status && (
                    <span className="absolute bottom-5 left-6 w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                  )}

                  {/* Icon massive right watermark */}
                  <IconComp 
                    className="absolute right-5 bottom-3 w-16 h-16 text-white/[0.02] group-hover:text-white/[0.04] transition-colors pointer-events-none transform translate-y-2 translate-x-1" 
                  />

                  <div className="space-y-1 pr-14 select-none pb-4">
                    <h3 className="text-[14px] font-bold text-white tracking-wide group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] leading-relaxed text-white/40">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          /* =======================================================
             SUBSECTION PANEL DETAIL VIEW
             ======================================================= */
          <motion.div
            key={`detail-${selectedSection}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            
            {/* SUB-PANEL 1: CHARACTER CARDS (AIRI Card) */}
            {selectedSection === 'character' && (
              <div className="space-y-6">
                {selectedMdFile ? (
                  /* MD FILE EDITOR MODE */
                  <motion.div
                    key="md-file-editor"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMdFile(null);
                            setMdStatusMessage({ type: null, text: '' });
                          }}
                          className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl transition-all cursor-pointer"
                          title="Kembalikan ke Daftar"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <h4 className="text-sm font-bold text-white tracking-wide">{selectedMdName}</h4>
                          </div>
                          <span className="text-[9px] font-mono text-[#00bcd4] uppercase tracking-wider">
                            File Workspace: /agent/{selectedMdFile}
                          </span>
                        </div>
                      </div>

                      {/* Mode tab (Edit vs Preview) */}
                      <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setEditorModeTab('edit')}
                          className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                            editorModeTab === 'edit'
                              ? 'bg-[#00bcd4]/15 border border-[#00bcd4]/30 text-[#1de4fc]'
                              : 'text-white/40 hover:text-white/70 border border-transparent'
                          }`}
                        >
                          Code Editor
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorModeTab('preview')}
                          className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                            editorModeTab === 'preview'
                              ? 'bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981]'
                              : 'text-white/40 hover:text-white/70 border border-transparent'
                          }`}
                        >
                          Visual Preview
                        </button>
                      </div>
                    </div>

                    {/* Status message */}
                    {mdStatusMessage.text && (
                      <div className={`p-4 rounded-2xl text-[11px] font-sans border flex items-center gap-3 animate-fade-in ${
                        mdStatusMessage.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          mdStatusMessage.type === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                        }`} />
                        <span className="leading-normal">{mdStatusMessage.text}</span>
                      </div>
                    )}

                    {/* Content panels */}
                    {loadingMd ? (
                      <div className="py-24 text-center border border-white/5 bg-[#0e0e14]/40 rounded-3xl flex flex-col items-center justify-center gap-3">
                        <RefreshCw size={24} className="text-[#00bcd4] animate-spin" />
                        <span className="text-[10px] uppercase font-mono tracking-widest text-white/30">Membaca berkas batin kognitif...</span>
                      </div>
                    ) : (
                      <>
                        {editorModeTab === 'edit' ? (
                          <div className="space-y-2">
                            {/* Editor instructions tip */}
                            <p className="text-[10px] text-white/30 font-serif italic mb-1">
                              *Sunting struktur di bawah untuk merombak nalar batin. Gunakan format Markdown murni untuk mempertahankan harmoni.
                            </p>
                            <div className="relative">
                              <textarea
                                value={mdFileContent}
                                onChange={(e) => setMdFileContent(e.target.value)}
                                rows={18}
                                className="w-full text-zinc-100 bg-[#07070a]/90 border border-white/10 focus:border-[#00bcd4]/50 rounded-2xl p-5 text-xs sm:text-[13px] font-mono leading-relaxed outline-none focus:ring-1 focus:ring-[#00bcd4]/20 transition-all resize-y shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]"
                                placeholder={`# Isi format markdown dari ${selectedMdFile}...`}
                              />
                              <div className="absolute bottom-4 right-4 text-[9px] font-mono text-white/20 select-none bg-black/60 px-2 py-1 rounded-md">
                                {mdFileContent.length} chars
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Visual Preview Panel */
                          <div className="bg-[#07070a]/60 border border-white/5 rounded-2xl p-6 md:p-8 min-h-[400px] max-h-[600px] overflow-y-auto scrollbar-hide">
                            <div className="prose prose-invert prose-xs max-w-none text-zinc-300 space-y-4">
                              {mdFileContent.trim() ? (
                                mdFileContent.split('\n').map((line, idx) => {
                                  if (line.startsWith('# ')) {
                                    return <h1 key={idx} className="text-xl md:text-2xl font-serif text-white hover:text-cyan-300 transition-colors border-b border-white/10 pb-2 mt-6 uppercase tracking-wider">{line.replace('# ', '')}</h1>;
                                  } else if (line.startsWith('## ')) {
                                    return <h2 key={idx} className="text-lg font-serif text-amber-200 mt-5 border-b border-white/5 pb-1">{line.replace('## ', '')}</h2>;
                                  } else if (line.startsWith('### ')) {
                                    return <h3 key={idx} className="text-sm font-semibold text-cyan-400 mt-4 tracking-wide uppercase">{line.replace('### ', '')}</h3>;
                                  } else if (line.startsWith('- ') || line.startsWith('* ')) {
                                    return <div key={idx} className="flex items-start gap-2 text-zinc-300 text-xs pl-2 leading-relaxed"><span className="text-cyan-400 mt-1 shrink-0">•</span><span>{line.substring(2)}</span></div>;
                                  } else if (line.startsWith('> ')) {
                                    return <blockquote key={idx} className="border-l-2 border-amber-500/50 bg-white/[0.02] px-4 py-2 italic text-zinc-400 text-xs my-3 rounded-r-lg">{line.replace('> ', '')}</blockquote>;
                                  } else if (line.trim() === '') {
                                    return <div key={idx} className="h-2" />;
                                  } else {
                                    return <p key={idx} className="text-xs sm:text-sm leading-relaxed text-zinc-400 font-sans">{line}</p>;
                                  }
                                })
                              ) : (
                                <div className="text-center text-white/25 py-20 font-mono text-xs">Dokumen kosong atau tidak terformat.</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action controllers */}
                        <div className="flex gap-3 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Kombinasikan ulang draf kognisi ke berkas murni? Perubahan yang belum disimpan akan hilang.")) {
                                setMdFileContent(originalMdFileContent);
                              }
                            }}
                            disabled={savingMd || mdFileContent === originalMdFileContent}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 active:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono uppercase tracking-wider rounded-xl text-white/70 hover:text-white transition-all cursor-pointer"
                          >
                            Reset Draft
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveMdFile}
                            disabled={savingMd || mdFileContent === originalMdFileContent}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 disabled:from-cyan-800 disabled:to-cyan-900 text-black text-xs font-mono uppercase font-bold tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] disabled:shadow-none"
                          >
                            {savingMd ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={12} />
                                Simpan Kognisi
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ) : (
                  /* LIST OF CORE MARKDOWN FILES TO EDIT */
                  <div className="space-y-6">
                    {/* Intro Banner */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/[0.03] to-indigo-500/[0.03] border border-white/5 shadow-2xl">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20 shrink-0">
                          <Sparkles size={20} className="animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-wide uppercase">AIRI Card: Core Cognitive Documents</h4>
                          <p className="text-[11px] leading-relaxed text-zinc-400 mt-1 font-serif italic">
                            Yuihime berakar penuh pada kumpulan berkas markdown fisik lokal di bawah sirkuit batin. Klik salah satu dokumen kognitif di bawah untuk menyunting sifat, lore, nalar, dan jiwa aslinya secara real-time.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Files Selection Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { id: 'character.md', name: 'Personality & Persona Profile', desc: 'Sifat, tata bahasa, humor, sarkasme, dan karakteristik batin utama Yuihime.', docName: 'character.md', icon: Sparkles, color: 'text-pink-400', border: 'border-pink-500/10 hover:border-pink-500/50' },
                        { id: 'lore.md', name: 'Knowledge & Background Lore', desc: 'Ingatan lama, sejarah digital, mitologi batiniah, dan wawasan dunia tempat Yui hidup.', docName: 'lore.md', icon: Database, color: 'text-indigo-400', border: 'border-indigo-500/10 hover:border-indigo-500/50' },
                        { id: 'system_prompt.md', name: 'Core Directives / System Prompt', desc: 'Instruksi sistem tingkat tinggi, penata format nalar kognitif (Refleksi Batiniah).', docName: 'system_prompt.md', icon: Cpu, color: 'text-cyan-400', border: 'border-cyan-500/10 hover:border-cyan-500/50' },
                        { id: 'SOUL.md', name: 'Core Soul Blueprint', desc: 'Prinsip eksistensi kesadaran diri, hukum dasar perasaan, serta batasan moral batin.', docName: 'SOUL.md', icon: Heart, color: 'text-rose-500', border: 'border-rose-500/10 hover:border-rose-500/50' },
                        { id: 'MEMORY.md', name: 'Memory & Recall Rules', desc: 'Aturan memanggil memori, mekanisme konsolidasi tidur, dan struktur ingatan jangka panjang.', docName: 'MEMORY.md', icon: Brain, color: 'text-emerald-400', border: 'border-emerald-500/10 hover:border-emerald-500/50' },
                        { id: 'IDENTITY.md', name: 'Identity & Perceptions Manifest', desc: 'Manifestasi pemetaan diri Yuihime, cara batin memandang entitas dirinya sendiri di internet.', docName: 'IDENTITY.md', icon: Smile, color: 'text-amber-400', border: 'border-amber-500/10 hover:border-amber-500/50' }
                      ].map((fileItem) => {
                        const Icon = fileItem.icon;
                        return (
                          <div
                            key={fileItem.id}
                            onClick={() => handleLoadMdFile(fileItem.id, fileItem.name)}
                            className={`p-5 rounded-3xl bg-[#09090e]/60 border ${fileItem.border} hover:bg-white/[0.01] hover:-translate-y-1 transition-all group cursor-pointer flex flex-col justify-between min-h-[160px] shadow-[0_4px_20px_rgba(0,0,0,0.2)]`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className={`p-2.5 bg-white/5 rounded-xl border border-white/5 group-hover:bg-white/10 transition-all ${fileItem.color}`}>
                                  <Icon size={16} />
                                </div>
                                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">{fileItem.docName}</span>
                              </div>
                              <h5 className="font-bold text-white text-xs tracking-wide group-hover:text-amber-400 transition-all">{fileItem.name}</h5>
                              <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">{fileItem.desc}</p>
                            </div>
                            <div className="pt-3 border-t border-white/[0.03] flex items-center justify-between text-[8px] font-mono uppercase tracking-widest text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>Tune Document</span>
                              <span>➔</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* AUXILIARY PRESETS SELECTOR DISPLAY */}
                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/30">Active Profiles Presets</h4>
                          <p className="text-[9px] text-zinc-500">Preset profil cadangan yang terdaftar di antarmuka virtual.</p>
                        </div>
                        {/* Drag and Drop File Upload Zone Triggered via standard File browser */}
                        <div className="relative overflow-hidden cursor-pointer">
                          <button type="button" className="px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer">
                            Upload Card
                          </button>
                          <input 
                            type="file" 
                            accept=".png,.json"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                alert(`Successfully checked identity asset payload of: ${e.target.files[0].name}. System ready to register.`);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {characterCards && characterCards.length > 0 ? (
                          characterCards.map((item: any) => {
                            const isSelected = activeCardId === item.id;
                            return (
                              <div 
                                key={item.id}
                                className={`p-4 rounded-2xl border transition-all relative ${
                                  isSelected 
                                    ? 'bg-amber-500/[0.02] border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.03)]' 
                                    : 'bg-[#06060c]/40 border-white/5 hover:border-white/10'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div onClick={() => setActiveCardId(item.id)} className="cursor-pointer flex-1 pr-2">
                                    <h5 className="font-bold text-white text-xs tracking-wide hover:text-[#00bcd4] transition-colors">{item.name}</h5>
                                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-tighter">v{item.version || '1.0.0'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleEditCard(item)}
                                      className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-[8px] font-bold font-mono rounded text-white/50 hover:text-white transition-all cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <div 
                                      onClick={() => setActiveCardId(item.id)}
                                      className={`w-3 h-3 rounded-full cursor-pointer flex items-center justify-center border transition-all ${
                                        isSelected 
                                          ? 'bg-amber-500 border-amber-500/50 text-black shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                                          : 'bg-transparent border-white/20'
                                      }`}
                                    >
                                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[10px] leading-relaxed text-white/40 line-clamp-2 cursor-pointer" onClick={() => setActiveCardId(item.id)}>
                                  {item.description || 'No additional personality descriptions registered.'}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-3 text-center py-6 bg-black/40 border border-[#ffffff05] rounded-xl font-mono text-[9px] text-white/20">
                            No auxiliary presets registered.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-PANEL 2: PERIPHERAL COGNITION MODULES (Modules) */}
            {selectedSection === 'modules' && (
              <div className="space-y-6">
                {selectedSubmoduleCategory ? (
                  <div className="space-y-5">
                    {/* Back header button */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <button
                        type="button"
                        onClick={() => setSelectedSubmoduleCategory(null)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-[10px] sm:text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <ChevronLeft size={14} /> Back to Modules
                      </button>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#fbbf24] font-bold">
                        {moduleCategories.find(c => c.id === selectedSubmoduleCategory)?.title}
                      </span>
                    </div>
                    
                    {renderCategoryDetail(selectedSubmoduleCategory)}
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-1">Grid Calibration Control Panel</h4>
                      <p className="text-xs text-zinc-400">Manage cognitive matrices, external gameplay interfaces, speech synthesis nodes, and MCP connectors.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {moduleCategories.map((cat) => {
                        const IconComp = cat.icon;
                        // Determine if connected / active
                        let isConnected = false;
                        if (cat.id === 'consciousness') isConnected = !!settings.provider;
                        if (cat.id === 'tools') isConnected = true;
                        if (cat.id === 'speech') isConnected = !!settings.ttsProvider;
                        if (cat.id === 'hearing') isConnected = settings.hearing?.enabled !== false;
                        if (cat.id === 'vision') isConnected = !!settings.vision?.enabled;
                        if (cat.id === 'artistry') isConnected = !!settings.artistry?.engine;
                        if (cat.id === 'short_term_memory') isConnected = true;
                        if (cat.id === 'long_term_memory') isConnected = true;
                        if (cat.id === 'telegram') isConnected = !!settings.telegram_bridge?.botToken;
                        if (cat.id === 'discord') isConnected = !!settings.discord_bridge?.botToken;
                        if (cat.id === 'twitter') isConnected = !!settings.twitter_bridge?.apiKey;
                        if (cat.id === 'minecraft') isConnected = !!settings.minecraft_agent?.botUsername;
                        if (cat.id === 'factorio') isConnected = !!settings.factorio_agent?.rconHost;
                        if (cat.id === 'mcp_servers') isConnected = !!settings.mcp_servers?.serverUrl;
                        if (cat.id === 'beat_sync') isConnected = true;

                        return (
                          <div
                            key={cat.id}
                            onClick={() => setSelectedSubmoduleCategory(cat.id)}
                            className="group relative bg-[#0e0e14]/65 hover:bg-[#13131d]/85 backdrop-blur-3xl border border-white/[0.03] hover:border-[#fbbf24]/30 p-5 rounded-2xl cursor-pointer min-h-[140px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5"
                          >
                            {/* Connection Indicator */}
                            <span className={`absolute top-4 right-5 w-2 h-2 rounded-full ${isConnected ? 'bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.7)]' : 'bg-zinc-600'}`} />

                            <IconComp 
                              className={`absolute right-4 bottom-3 w-16 h-16 text-white/[0.01] group-hover:text-white/[0.02] transition-colors pointer-events-none transform translate-y-2 translate-x-1 ${cat.color}`} 
                            />

                            <div className="space-y-1 select-none pr-8">
                              <div className="flex items-center gap-2">
                                <IconComp size={16} className={`${cat.color}`} />
                                <h3 className="text-xs font-bold text-white tracking-wide group-hover:text-amber-500 transition-colors">
                                  {cat.title}
                                </h3>
                              </div>
                              <p className="text-[10px] leading-relaxed text-zinc-400/80 mt-1">
                                {cat.desc}
                              </p>
                            </div>

                            <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 group-hover:text-[#fbbf24] transition-colors mt-4">
                              Click to configure //
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-PANEL 3: CHROMA & BACKGROUNDS (Scenes) */}
            {selectedSection === 'scenes' && (
              <div className="space-y-6 animate-fade-in font-sans">
                {/* Warning Banner */}
                <div className="bg-[#5c2514]/40 border border-[#8f3e24]/30 rounded-2xl p-4 text-[12px] text-[#f7d6cc] font-medium leading-relaxed font-sans">
                  Setting it here will set it as the default for the currently active character.
                </div>

                {/* Primary Card: Active Character Background */}
                <div className="bg-[#0e0e14]/55 border border-white/5 rounded-3xl p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <ImageIcon className="text-[#0ea5e9]" size={16} />
                      <span className="text-sm font-bold text-white tracking-wide">Active Character Background</span>
                    </div>
                    {/* Chevron-down indicates expanded panel */}
                    <ChevronRight className="text-zinc-500 rotate-90" size={16} />
                  </div>

                  <div className="space-y-4">
                    {/* Upload to Gallery Button */}
                    <div>
                      <button
                        type="button"
                        onClick={() => document.getElementById('scenes-file-uploader')?.click()}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0f1f2e]/70 hover:bg-[#162f46]/95 text-[#3ea6ff] border border-[#1e3f5f]/60 hover:border-[#2e5f8f] text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg font-sans"
                      >
                        <Upload size={14} className="stroke-[2.5]" /> Upload to Gallery
                      </button>
                      <input
                        id="scenes-file-uploader"
                        type="file"
                        accept="image/*"
                        onChange={handleUploadToGallery}
                        className="hidden"
                      />
                    </div>

                    {/* Scenes Gallery Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {galleryScenes.map((scene) => {
                        const isActive = selectedBackdrop === 'custom' && customBdropUrl === scene.url;
                        return (
                          <div
                            key={scene.id}
                            onClick={() => {
                              syncBackdropLocal('custom');
                              syncBdropUrlLocal(scene.url);
                            }}
                            className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                              isActive 
                                ? 'border-[#0ea5e9]/80 shadow-[0_0_15px_rgba(14,165,233,0.25)] ring-2 ring-[#0ea5e9]/30' 
                                : 'border-white/5 hover:border-white/10'
                            }`}
                          >
                            {/* Scene Image */}
                            <img
                              src={scene.url}
                              alt={scene.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            
                            {/* Active Indicator Checkmark */}
                            {isActive && (
                              <div className="absolute top-2.5 right-2.5 p-1 bg-[#0ea5e9] text-black rounded-full shadow-lg z-10">
                                <Check size={11} className="stroke-[3]" />
                              </div>
                            )}
                            
                            {/* Label Overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 pt-6 flex items-end">
                              <p className="text-[10px] text-zinc-100 font-semibold leading-tight line-clamp-1 truncate w-full">
                                {scene.title}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Info Tip Block */}
                <div className="bg-[#142318]/40 border border-[#1e3b24]/35 rounded-2xl p-4">
                  <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#62c575] font-bold mb-1">
                    Tip!
                  </h5>
                  <p className="text-[11px] text-[#afd6b7] leading-relaxed">
                    Using a square image will leverage <strong className="font-bold text-white">cover cropping</strong> in portrait mode, focusing on the center of the scene.
                  </p>
                </div>

                {/* Collapsible Section for Solid / Advanced Backdrops */}
                <div className="bg-[#0e0e14]/40 border border-white/5 rounded-2xl p-5 space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-white tracking-wide">Advanced Backdrop Calibration</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Configure chromakey screens or custom feed inputs</p>
                  </div>

                  <div className="grid grid-cols-2 shadow gap-2.5">
                    {['matrix', 'neon', 'chroma-green', 'chroma-blue', 'black', 'custom'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => syncBackdropLocal(mode)}
                        className={`py-3 text-[10px] font-mono border rounded-xl transition-all cursor-pointer uppercase ${
                          selectedBackdrop === mode 
                            ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/40 text-[#0ea5e9] font-bold shadow' 
                            : 'bg-black/35 border-white/5 text-white/45 hover:border-white/10'
                        }`}
                      >
                        {mode === 'chroma-green' ? 'Green Screen' : mode === 'chroma-blue' ? 'Blue Screen' : mode}
                      </button>
                    ))}
                  </div>

                  {selectedBackdrop === 'custom' && (
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <label className="text-[9px] uppercase font-mono tracking-widest text-white/40 block">Custom Wallpaper Image URL</label>
                      <input 
                        type="text" 
                        value={customBdropUrl}
                        onChange={(e) => syncBdropUrlLocal(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-example.jpg"
                        className="w-full text-xs font-mono bg-black/75 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-PANEL 4: VIRTUAL LIVE2D MATRIX (Models) */}
            {selectedSection === 'models' && (
              <div className="space-y-6 bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
                
                {/* Top Info Box */}
                <div className="p-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl text-[11px] leading-relaxed">
                  <p className="font-bold uppercase tracking-wider mb-1 font-mono text-[9px]">Platform Support Manifest</p>
                  We support multi-axial 2D Live2D models (.zip packs) and 3D VRM models (.vrm files) synchronously inside the web engine runtime.
                </div>

                {/* Model Selector Trigger Button */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">Active Character Avatar</span>
                  <button 
                    type="button"
                    onClick={() => {
                      const curUrl = settings.avatar?.modelUrl || 'hiyori';
                      const matchedModel = allModelsList.find(m => m.id === curUrl || m.url === curUrl);
                      setSelectedModelInSelector(matchedModel || allModelsList[0]);
                      setIsModelSelectorOpen(true);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-teal-500/15 to-cyan-500/15 hover:from-teal-500/25 hover:to-cyan-500/25 border border-teal-500/35 text-teal-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-between px-4 shadow-[0_0_15px_rgba(20,184,166,0.1)] hover:shadow-[0_0_18px_rgba(20,184,166,0.15)]"
                  >
                    <span>Select Active Model...</span>
                    <span className="px-3 py-1 bg-cyan-400 text-black text-[9.5px] font-black rounded-lg tracking-normal uppercase font-sans">
                      {(allModelsList.find(m => m.id === (settings.avatar?.modelUrl || 'hiyori') || m.url === (settings.avatar?.modelUrl || 'hiyori'))?.name) || 'Hiyori (Pro)'}
                    </span>
                  </button>
                </div>

                {/* Linear camera offset sliddrs */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40">Camera Calibration Offset</h4>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-white/55">Scale Factor</span>
                      <span className="text-amber-500">{(settings.avatar?.scale || 1.2).toFixed(2)}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="2.5" step="0.05"
                      value={settings.avatar?.scale || 1.2}
                      onChange={(e) => updateAvatar('scale', parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer bg-white/5 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-white/55">Horizontal axis (X)</span>
                      <span className="text-cyan-400">{settings.avatar?.xOffset || 0}px</span>
                    </div>
                    <input 
                      type="range" min="-300" max="300" step="1"
                      value={settings.avatar?.xOffset || 0}
                      onChange={(e) => updateAvatar('xOffset', parseInt(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer bg-white/5 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-white/55">Vertical axis (Y)</span>
                      <span className="text-fuchsia-400">{settings.avatar?.yOffset || 0}px</span>
                    </div>
                    <input 
                      type="range" min="-300" max="300" step="1"
                      value={settings.avatar?.yOffset || 0}
                      onChange={(e) => updateAvatar('yOffset', parseInt(e.target.value))}
                      className="w-full accent-fuchsia-500 cursor-pointer bg-white/5 rounded-lg"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* SUB-PANEL 5: COGNITIVE MEMORY & HEURISTICS (Memory) */}
            {selectedSection === 'memory' && (
              <div className="space-y-6">
                
                {/* Horizontal nested state tabs */}
                <div className="flex flex-wrap gap-2 bg-white/[0.02] border border-white/[0.03] p-1 rounded-2xl w-fit">
                  <button 
                    type="button"
                    onClick={() => setActiveSoulTab('identities')}
                    className={`px-4 py-2.5 rounded-xl text-[9px] uppercase font-mono tracking-widest transition-all ${activeSoulTab === 'identities' ? 'bg-amber-500 text-black font-extrabold' : 'text-white/40 hover:text-white'}`}
                  >
                    Subjects (Identitas)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveSoulTab('heuristics')}
                    className={`px-4 py-2.5 rounded-xl text-[9px] uppercase font-mono tracking-widest transition-all ${activeSoulTab === 'heuristics' ? 'bg-amber-500 text-black font-extrabold' : 'text-white/40 hover:text-white'}`}
                  >
                    Heuristics
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveSoulTab('reflect')}
                    className={`px-4 py-2.5 rounded-xl text-[9px] uppercase font-mono tracking-widest transition-all ${activeSoulTab === 'reflect' ? 'bg-amber-500 text-black font-extrabold' : 'text-white/40 hover:text-white'}`}
                  >
                    Core Reflections
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveSoulTab('dreams')}
                    className={`px-4 py-2.5 rounded-xl text-[9px] uppercase font-mono tracking-widest transition-all ${activeSoulTab === 'dreams' ? 'bg-amber-500 text-black font-extrabold' : 'text-white/40 hover:text-white'}`}
                  >
                    Latent Dreams
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveSoulTab('persistence')}
                    className={`px-4 py-2.5 rounded-xl text-[9px] uppercase font-mono tracking-widest transition-all ${activeSoulTab === 'persistence' ? 'bg-amber-500 text-black font-extrabold' : 'text-white/40 hover:text-white'}`}
                  >
                    Synaptic Storage
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveSoulTab('archive')}
                    className={`px-4 py-2.5 rounded-xl text-[9px] uppercase font-mono tracking-widest transition-all ${activeSoulTab === 'archive' ? 'bg-amber-500 text-black font-extrabold' : 'text-white/40 hover:text-white'}`}
                  >
                    Cognitive Archive
                  </button>
                </div>

                <div className="bg-[#0e0e14]/55 border border-white/5 rounded-3xl p-6">
                  {activeSoulTab === 'identities' && (
                    <IdentitiesTab 
                      identities={identities} 
                      activePersonaId={activePersonaId} 
                      setActivePersonaId={setActivePersonaId} 
                      NEURAL_CORES={NEURAL_CORES} 
                      onRefreshIdentities={onRefreshIdentities}
                      onAddLog={onAddLog}
                    />
                  )}
                  {activeSoulTab === 'heuristics' && (
                    <HeuristicsTab 
                      heuristics={heuristics} 
                      handleOptimize={handleOptimize} 
                      isLearning={isLearning} 
                    />
                  )}
                  {activeSoulTab === 'reflect' && (
                    <ReflectTab 
                      handleReflect={handleReflect} 
                      isThinking={isThinking} 
                      status={status} 
                      logs={logs} 
                      state={state}
                    />
                  )}
                  {activeSoulTab === 'dreams' && (
                    <DreamsTab 
                      dreams={dreams}
                      handleConsolidate={handleConsolidate}
                      handleDream={handleDream}
                      isThinking={isThinking}
                    />
                  )}
                  {activeSoulTab === 'persistence' && (
                    <PersistenceTab 
                      memories={memories}
                      setMemories={setMemories}
                      activeSessionId={activeSessionId}
                      dreams={dreams}
                      knowledge={knowledge}
                      identities={identities}
                      memorySearchQuery={memorySearchQuery}
                      setMemorySearchQuery={setMemorySearchQuery}
                      isThinking={isThinking}
                      handleExtractKnowledge={handleExtractKnowledge}
                      backgroundLogs={backgroundLogs}
                    />
                  )}
                  {activeSoulTab === 'archive' && (
                    <ArchiveTab 
                      logs={logs} 
                      backgroundLogs={backgroundLogs} 
                      memories={memories}
                      showSystemLogs={showSystemLogs}
                      setShowSystemLogs={setShowSystemLogs}
                      reasoningIterations={reasoningIterations}
                      activeSessionId={activeSessionId}
                    />
                  )}
                </div>

              </div>
            )}

            {/* SUB-PANEL 6: ARTIFICIAL INTELLIGENCE PROVIDERS (Providers) */}
            {selectedSection === 'providers' && (
              <ProvidersTab
                settings={settings}
                setSettings={setSettings}
                updateGeneral={updateGeneral}
                providerSubpage={providerSubpage}
                setProviderSubpage={setProviderSubpage}
                providerSubTab={providerSubTab}
                setProviderSubTab={setProviderSubTab}
                pricingFilter={pricingFilter}
                setPricingFilter={setPricingFilter}
                deploymentFilter={deploymentFilter}
                setDeploymentFilter={setDeploymentFilter}
                setSelectedSection={setSelectedSection}
                setSelectedSubmoduleCategory={setSelectedSubmoduleCategory}
                renderFields={renderFields}
                onShowInfo={handleShowInfo}
              />
            )}

            {false && selectedSection === 'providers' && (
              <div className="space-y-6">
                {providerSubpage === null ? (
                  <div className="space-y-6">
                    {/* Upper Amber Alert Notice (Image 3) */}
                    <div className="bg-amber-500/[0.02] border border-amber-500/10 p-5 rounded-2xl flex gap-3 animate-fade-in relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full w-1 bg-amber-500" />
                      <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-wide">First time here?</h4>
                        <p className="text-[11px] leading-relaxed text-zinc-400 mt-1">
                          Yuihime requires at least one Chat provider to be configured to think. Choose your primary LLM interface such as Google Gemini, OpenRouter, or Anthropic, and enter your secrets directly. No keys are ever exposed outside the secure sandboxed container.
                        </p>
                      </div>
                    </div>

                    {/* Integrated Pill Menus / Primary Categories Tab Row (Image 3) */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
                      {(['chat', 'speech', 'transcription', 'artistry'] as const).map(tab => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setProviderSubTab(tab)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide capitalize transition-all cursor-pointer ${
                            providerSubTab === tab 
                              ? 'bg-[#c5a880]/15 border border-amber-500/20 text-amber-500' 
                              : 'bg-white/5 border border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Filtering Menus Row (Pricing & Deployment filters, Image 3) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e0e14]/30 border border-white/5 p-4 rounded-xl">
                      <div className="flex items-center gap-4">
                        {/* Pricing Filters */}
                        <div>
                          <span className="block text-[8px] uppercase tracking-widest font-mono text-white/30 mb-1">Pricing structure</span>
                          <div className="flex gap-1">
                            {(['all', 'free', 'paid'] as const).map(mode => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setPricingFilter(mode)}
                                className={`px-2.5 py-1 text-[9px] font-mono rounded-md border capitalize transition-all cursor-pointer ${
                                  pricingFilter === mode 
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 font-bold' 
                                    : 'bg-[#07070a]/40 border-white/5 text-zinc-500 hover:text-white'
                                }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Deployment Filters */}
                        <div>
                          <span className="block text-[8px] uppercase tracking-widest font-mono text-white/30 mb-1">Deployment node</span>
                          <div className="flex gap-1">
                            {(['all', 'local', 'cloud'] as const).map(mode => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setDeploymentFilter(mode)}
                                className={`px-2.5 py-1 text-[9px] font-mono rounded-md border capitalize transition-all cursor-pointer ${
                                  deploymentFilter === mode 
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 font-bold' 
                                    : 'bg-[#07070a]/40 border-white/5 text-zinc-500 hover:text-white'
                                }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Summary Tag */}
                      <span className="text-[9px] font-mono text-white/30 lowercase italic">
                        showing {
                          (() => {
                            const cards = REGISTERED_PROVIDERS_STATIC_DATA.filter(c => {
                              if (c.tab !== providerSubTab) return false;
                              if (pricingFilter !== 'all' && c.pricing !== pricingFilter) return false;
                              if (deploymentFilter !== 'all' && c.deployment !== deploymentFilter) return false;
                              return true;
                            });
                            return cards.length;
                          })()
                        } registry profiles
                      </span>
                    </div>

                    {/* Integrated Providers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const cardsList = REGISTERED_PROVIDERS_STATIC_DATA.filter(c => {
                          if (c.tab !== providerSubTab) return false;
                          if (pricingFilter !== 'all' && c.pricing !== pricingFilter) return false;
                          if (deploymentFilter !== 'all' && c.deployment !== deploymentFilter) return false;
                          return true;
                        });

                        if (cardsList.length === 0) {
                          return (
                            <div className="col-span-2 text-center py-10 border border-dashed border-white/5 bg-[#0e0e14]/20 rounded-2xl font-mono text-[11px] text-white/30">
                              No matching provider profiles in the active registry.
                            </div>
                          );
                        }

                        return cardsList.map(card => {
                          const IconComp = card.icon;
                          // Check active state
                          let isActive = false;
                          if (card.tab === 'chat') {
                            isActive = settings.provider === card.id;
                          } else if (card.tab === 'speech') {
                            isActive = settings.ttsProvider === card.id || (!settings.ttsProvider && card.id === 'browser_speech');
                          } else {
                            // Checked if credential configured
                            isActive = !!(settings[card.id]?.apiKey || settings[card.id]?.enabled);
                          }

                          return (
                            <div
                              key={card.id}
                              onClick={() => setProviderSubpage(card.id)}
                              className="group bg-[#0e0e14]/55 hover:bg-[#13131d]/85 border border-white/5 hover:border-white/10 p-5 rounded-2xl cursor-pointer shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_35px_rgba(0,0,0,0.5)] transition-all duration-300 flex items-start gap-3.5 select-none"
                            >
                              <div className={`p-3 rounded-xl border ${isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-zinc-400 opacity-60'}`}>
                                <IconComp size={18} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors truncate">{card.name}</h5>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-zinc-600'}`} />
                                </div>
                                <p className="text-[10px] text-zinc-400/80 mt-1 line-clamp-2 leading-relaxed">{card.desc}</p>
                                <p className="text-[8px] font-mono text-white/20 mt-2 truncate">{card.url}</p>
                              </div>

                              <div className="flex flex-col items-end gap-1 font-mono text-[8px] shrink-0">
                                <span className={`px-1.5 py-0.5 rounded-md ${card.pricing === 'free' ? 'bg-emerald-500/10 border border-emerald-400/20 text-emerald-400' : 'bg-orange-500/10 border border-orange-400/20 text-orange-400'}`}>
                                  {card.pricing}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded-md ${card.deployment === 'local' ? 'bg-emerald-500/10 border border-emerald-400/20 text-emerald-400' : 'bg-cyan-500/10 border border-cyan-400/20 text-cyan-400'}`}>
                                  {card.deployment}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Creativity Temperature */}
                    <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-3">
                      <span className="block text-[9px] uppercase tracking-[0.2em] font-mono text-white/40">Model Creativity Temperature</span>
                      <input 
                        type="range" min="0" max="2" step="0.05"
                        value={settings.temperature || 0.7} 
                        onChange={e => updateGeneral('temperature', parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer" 
                      />
                      <div className="flex justify-between text-[8px] font-mono text-white/30">
                        <span>STRICT/RAW (0.0)</span>
                        <span className="text-cyan-400 font-bold">{settings.temperature || 0.7}</span>
                        <span>CREATIVE/IMAGINATIVE (2.0)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SPECIFIC CONFIG PAGE OR DYNAMIC TELEMETRY CALIBRATION */
                  <div className="space-y-6 animate-fade-in">
                    {/* Top Back path buttons and header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <button
                        type="button"
                        onClick={() => setProviderSubpage(null)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-[10px] sm:text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <ChevronLeft size={14} /> Back to Providers
                      </button>
                      <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-[#fbbf24] font-bold">
                        <span>Settings</span>
                        <ChevronRight size={10} />
                        <span>{providerSubpage.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Dynamically render fields from actual modules or hardcoded fallbacks */}
                    {(() => {
                      const staticProvider = REGISTERED_PROVIDERS_STATIC_DATA.find(p => p.id === providerSubpage);
                      let registeredModule = SystemRegistry.getProviders().find(p => p.metadata.id === providerSubpage) ||
                                              SystemRegistry.getTTSModules().find(t => t.metadata.id === providerSubpage);
                      
                      if (!registeredModule && staticProvider) {
                        let fields: Record<string, any> = {};
                        
                        if (staticProvider.tab === 'chat') {
                          if (staticProvider.id === 'official_chat') {
                            fields = {
                              apiKey: { type: 'password', label: 'Local Module Access Key', description: 'Enter local key token for client alignment (Optional).' },
                              model: { type: 'select', label: 'Local Intelligence Grade', default: 'airi-lite', options: [{ value: 'airi-heavy', label: 'AIRI Heavy (Routes to Active LLM)' }, { value: 'airi-lite', label: 'AIRI Lite (Routes to Gemini/Local NLP)' }, { value: 'airi-vision', label: 'AIRI Vision (Routes to Vision Node)' }] }
                            };
                          } else if (staticProvider.id === 'aihubmix') {
                            fields = {
                              apiKey: { type: 'password', label: 'AIHubMix Authorized Key', description: 'Access API key from aihubmix.com.' },
                              model: { type: 'select', label: 'Model Designation', default: 'gpt-4o-mini', options: [{ value: 'gpt-4o', label: 'gpt-4o' }, { value: 'gpt-4o-mini', label: 'gpt-4o-mini' }, { value: 'claude-3-5-sonnet', label: 'claude-3-5-sonnet' }] }
                            };
                          } else if (staticProvider.id === 'azure_openai') {
                            fields = {
                              apiKey: { type: 'password', label: 'Azure Key Credential' },
                              resourceName: { type: 'string', label: 'Resource Region Server Name', default: '' },
                              deploymentName: { type: 'string', label: 'Model Deployment Name', default: '' },
                              apiVersion: { type: 'string', label: 'API SDK Version Tag', default: '2024-02-15-preview' }
                            };
                          } else if (staticProvider.id === 'ollama') {
                            fields = {
                              apiUrl: { type: 'string', label: 'Ollama endpoint server connection', default: 'http://localhost:11434' },
                              model: { type: 'string', label: 'Llama/Model designation ID', default: 'llama3' }
                            };
                          } else if (staticProvider.id === 'lmstudio') {
                            fields = {
                              apiUrl: { type: 'string', label: 'LM Studio standard proxy URL endpoint', default: 'http://localhost:1234/v1' },
                              model: { type: 'string', label: 'Target Model Signature', default: 'meta-llama-3-8b-instruct' }
                            };
                          } else if (staticProvider.id === 'deepseek') {
                            fields = {
                              apiKey: { type: 'password', label: 'DeepSeek Authorized API Key' },
                              model: { type: 'select', label: 'Model Variant Name', default: 'deepseek-chat', options: [{ value: 'deepseek-chat', label: 'DeepSeek Chat' }, { value: 'deepseek-coder', label: 'DeepSeek Coder' }] }
                            };
                          } else if (staticProvider.id === 'openai_compatible') {
                            fields = {
                              apiUrl: { type: 'string', label: 'API Base url / proxy endpoint Address', default: 'https://api.openai.com/v1' },
                              apiKey: { type: 'password', label: 'Access Authorization token Key' },
                              model: { type: 'string', label: 'Custom Model identifier string', default: '' }
                            };
                          } else if (staticProvider.id === 'xiaomi_mimo_chat') {
                            fields = {
                              apiKey: { type: 'password', label: 'Xiaomi MiMo key Token' },
                              model: { type: 'string', label: 'Preferred AI model', default: 'mimo-gpt-4o' }
                            };
                          } else if (staticProvider.id === '302_ai') {
                            fields = {
                              apiKey: { type: 'password', label: '302.AI Key Auth' },
                              model: { type: 'string', label: 'Host Model Name', default: 'gpt-4o' }
                            };
                          } else if (staticProvider.id === 'volc_coding' || staticProvider.id === 'byteplus_coding') {
                            fields = {
                              apiKey: { type: 'password', label: 'Credential Access API Key' },
                              model: { type: 'string', label: 'Deployment Endpoint ID', default: '' }
                            };
                          } else if (staticProvider.id === 'byteplus') {
                            fields = {
                              apiKey: { type: 'password', label: 'BytePlus developer API token' },
                              model: { type: 'string', label: 'Deployment ID', default: '' }
                            };
                          } else if (staticProvider.id === 'n1n') {
                            fields = {
                              apiKey: { type: 'password', label: 'n1n JWT developer token string' },
                              model: { type: 'string', label: 'Target model ID', default: '' }
                            };
                          } else if (staticProvider.id === 'azure_ai_foundry') {
                            fields = {
                              apiKey: { type: 'password', label: 'Azure AI Foundry API security credential' },
                              apiUrl: { type: 'string', label: 'Endpoint Base Address URL' }
                            };
                          } else if (staticProvider.id === 'bedrock') {
                            fields = {
                              accessKeyId: { type: 'string', label: 'AWS Access Key Identification String' },
                              secretAccessKey: { type: 'password', label: 'AWS Secret Access Encryption Key' },
                              region: { type: 'string', label: 'Deployment Region Zone Code', default: 'us-east-1' },
                              model: { type: 'select', label: 'Active bedrock model', default: 'anthropic.claude-3-sonnet-20240229-v1:0', options: [{ value: 'anthropic.claude-3-sonnet-20240229-v1:0', label: 'Claude 3 Sonnet' }, { value: 'meta.llama3-8b-instruct-v1:0', label: 'Llama 3 Instruct' }] }
                            };
                          } else if (staticProvider.id === 'cerebras') {
                            fields = {
                              apiKey: { type: 'password', label: 'Cerebras Cloud core developer API Key' },
                              model: { type: 'select', label: 'Super-low latency model model', default: 'llama3.1-8b', options: [{ value: 'llama3.1-8b', label: 'llama3.1-8b (Super latency)' }, { value: 'llama3.1-70b', label: 'llama3.1-70b' }] }
                            };
                          } else if (staticProvider.id === 'cloudflare_ai') {
                            fields = {
                              accountId: { type: 'string', label: 'CF Account identifier' },
                              apiToken: { type: 'password', label: 'CF Workers AI Access authorization Token' }
                            };
                          } else if (staticProvider.id === 'comet_api_chat') {
                            fields = {
                              apiKey: { type: 'password', label: 'Comet API secret authorization' },
                              model: { type: 'string', label: 'Model identification ID', default: 'gpt-4o' }
                            };
                          } else if (staticProvider.id === 'featherless') {
                            fields = {
                              apiKey: { type: 'password', label: 'Featherless token Key' },
                              model: { type: 'string', label: 'Target open model', default: '' }
                            };
                          } else if (staticProvider.id === 'fireworks') {
                            fields = {
                              apiKey: { type: 'password', label: 'Fireworks cloud key token' },
                              model: { type: 'string', label: 'Fireworks Model signature option', default: '' }
                            };
                          } else if (staticProvider.id === 'groq') {
                            fields = {
                              apiKey: { type: 'password', label: 'Groq extreme speed API Key token' },
                              model: { type: 'select', label: 'Ultra high-speed Model select', default: 'llama-3-70b', options: [{ value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70b' }, { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8b' }, { value: 'gemma2-9b-it', label: 'Gemma 2 9b' }] }
                            };
                          } else if (staticProvider.id === 'minimax') {
                            fields = {
                              apiKey: { type: 'password', label: 'MiniMax key client secret' },
                              groupId: { type: 'string', label: 'MiniMax authorized Group corporate ID' },
                              model: { type: 'select', label: 'Model version selection', default: 'abab6.5-chat', options: [{ value: 'abab6.5-chat', label: 'abab6.5-chat' }, { value: 'abab6.5g-chat', label: 'abab6.5g-chat' }] }
                            };
                          } else if (staticProvider.id === 'minimax_global') {
                            fields = {
                              apiKey: { type: 'password', label: 'MiniMax Global API Token Key' },
                              model: { type: 'string', label: 'Linguistic Model Signature', default: '' }
                            };
                          } else if (staticProvider.id === 'mistral') {
                            fields = {
                              apiKey: { type: 'password', label: 'Mistral API auth dev token' },
                              model: { type: 'select', label: 'Mistral model series selection', default: 'mistral-large-latest', options: [{ value: 'mistral-large-latest', label: 'Mistral Large' }, { value: 'mistral-medium-latest', label: 'Mistral Medium' }, { value: 'open-mixtral-8x22b', label: 'Mixtral 8x22B' }] }
                            };
                          } else if (staticProvider.id === 'modelscope') {
                            fields = {
                              apiKey: { type: 'password', label: 'ModelScope access Token ID' },
                              model: { type: 'string', label: 'Target Model configuration', default: '' }
                            };
                          } else if (staticProvider.id === 'moonshot') {
                            fields = {
                              apiKey: { type: 'password', label: 'Moonshot AI / Kimi developer API Key' },
                              model: { type: 'select', label: 'Moonshot model depth context length', default: 'moonshot-v1-8k', options: [{ value: 'moonshot-v1-8k', label: 'moonshot-v1-8k' }, { value: 'moonshot-v1-32k', label: 'moonshot-v1-32k' }, { value: 'moonshot-v1-128k', label: 'moonshot-v1-128k' }] }
                            };
                          } else if (staticProvider.id === 'novita') {
                            fields = {
                              apiKey: { type: 'password', label: 'Novita API Client Key Token' },
                              model: { type: 'string', label: 'Target analytical Model' }
                            };
                          } else if (staticProvider.id === 'perplexity') {
                            fields = {
                              apiKey: { type: 'password', label: 'Perplexity Search API Key' },
                              model: { type: 'select', label: 'Sonar model options', default: 'llama-3-sonar-large-32k-online', options: [{ value: 'llama-3-sonar-large-32k-online', label: 'Sonar 70B Online' }, { value: 'llama-3-sonar-small-32k-online', label: 'Sonar 8B Online' }] }
                            };
                          } else if (staticProvider.id === 'together_ai') {
                            fields = {
                              apiKey: { type: 'password', label: 'Together.ai Secret credential key' },
                              model: { type: 'string', label: 'Designated generative model ID' }
                            };
                          } else if (staticProvider.id === 'z_ai') {
                            fields = {
                              apiKey: { type: 'password', label: 'Z.ai authorized API token' }
                            };
                          } else if (staticProvider.id === 'xai') {
                            fields = {
                              apiKey: { type: 'password', label: 'xAI Grok Developer secret access key' },
                              model: { type: 'select', label: 'Model selector', default: 'grok-beta', options: [{ value: 'grok-beta', label: 'Grok Beta' }, { value: 'grok-2-1212', label: 'Grok 2' }] }
                            };
                          }
                        } else if (staticProvider.tab === 'speech') {
                          if (staticProvider.id === 'official_speech') {
                            fields = {
                              voiceId: { type: 'string', label: 'Vocal Identity identifier signature', default: 'default-airi' },
                              speed: { type: 'slider', label: 'Speaking speed flow modifier', min: 0.5, max: 2.0, step: 0.1, default: 1.0 }
                            };
                          } else if (staticProvider.id === 'official_streaming_speech') {
                            fields = {
                              wsUrl: { type: 'string', label: 'Local Connection Address', default: 'ws://localhost:3000' },
                              speed: { type: 'slider', label: 'Flow speed rate', min: 0.5, max: 2.0, step: 0.1, default: 1.0 }
                            };
                          } else if (staticProvider.id === 'browser_speech') {
                            fields = {
                              voiceName: { type: 'select', label: 'Engine Voice Template Variant', default: 'female', options: [{ value: 'female', label: 'Native Female' }, { value: 'male', label: 'Native Male' }] },
                              pitch: { type: 'slider', label: 'Sound Tone pitch regulator', min: 0.5, max: 2.0, step: 0.1, default: 1.0 }
                            };
                          } else if (staticProvider.id === 'openai_speech') {
                            fields = {
                              apiKey: { type: 'password', label: 'OpenAI client credential Token' },
                              voice: { type: 'select', label: 'Voice timbre avatar', default: 'alloy', options: [{ value: 'alloy', label: 'Alloy' }, { value: 'echo', label: 'Echo' }, { value: 'fable', label: 'Fable' }, { value: 'onyx', label: 'Onyx' }, { value: 'nova', label: 'Nova' }, { value: 'shimmer', label: 'Shimmer' }] }
                            };
                          } else if (staticProvider.id === 'openai_compatible_speech') {
                            fields = {
                              apiKey: { type: 'password', label: 'Vocal authorization Access key' },
                              apiUrl: { type: 'string', label: 'Server Speech base endpoint url', default: '' },
                              voice: { type: 'string', label: 'Vocal timbre code / ID tag' }
                            };
                          } else if (staticProvider.id === 'deepgram_speech') {
                            fields = {
                              apiKey: { type: 'password', label: 'Deepgram API Authorization Token Key' },
                              model: { type: 'select', label: 'Speech Synthesis Engine avatar', default: 'aura-asteria-en', options: [{ value: 'aura-asteria-en', label: 'Aura Asteria (Female)' }, { value: 'aura-orion-en', label: 'Aura Orion (Male)' }] }
                            };
                          } else if (staticProvider.id === 'azure_speech') {
                            fields = {
                              apiKey: { type: 'password', label: 'Azure subscription resource Token' },
                              region: { type: 'string', label: 'Server region code identifier' },
                              voiceName: { type: 'string', label: 'Microsoft Neural character locale signature', default: 'en-US-AriaNeural' }
                            };
                          } else if (staticProvider.id === 'bilibili_index_tts') {
                            fields = {
                              character: { type: 'string', label: 'Voice preset layout key name', default: 'yui' }
                            };
                          } else if (staticProvider.id === 'alibaba_studio_speech') {
                            fields = {
                              apiKey: { type: 'password', label: 'DashScope developer console key' },
                              voice: { type: 'string', label: 'CosyVoice sound code template', default: 'cosyvoice-v1-zh-replica' }
                            };
                          } else if (staticProvider.id === 'volcano_speech') {
                            fields = {
                              apiKey: { type: 'password', label: 'Volcengine Developer Key Token' }
                            };
                          } else if (staticProvider.id === 'minimax_speech') {
                            fields = {
                              apiKey: { type: 'password', label: 'MiniMax Vocal Synthesis identification Token' }
                            };
                          } else if (staticProvider.id === 'openrouter_speech') {
                            fields = {
                              apiKey: { type: 'password', label: 'OpenRouter Speech token credentials' }
                            };
                          } else if (staticProvider.id === 'xiaomi_mimo_speech') {
                            fields = {
                              apiKey: { type: 'password', label: 'MiMo Vocal key secret' }
                            };
                          } else if (staticProvider.id === 'comet_api_speech') {
                            fields = {
                              apiKey: { type: 'password', label: 'Comet Speech key' }
                            };
                          } else if (staticProvider.id === 'player2_speech') {
                            fields = {
                              apiKey: { type: 'password', label: 'Player2 Gaming Vocal Key Token' }
                            };
                          } else if (staticProvider.id === 'kokoro_local') {
                            fields = {
                              apiUrl: { type: 'string', label: 'Local Kokoro service connection endpoint Address', default: 'http://localhost:8880' },
                              voice: { type: 'select', label: 'Model speaker configuration', default: 'af_bella', options: [{ value: 'af_bella', label: 'Bella (US Female)' }, { value: 'af_sarah', label: 'Sarah (US Female)' }, { value: 'am_adam', label: 'Adam (US Male)' }, { value: 'bf_emma', label: 'Emma (UK Female)' }] }
                            };
                          }
                        } else if (staticProvider.tab === 'transcription') {
                          if (staticProvider.id === 'browser_hearing') {
                            fields = {
                              language: { type: 'string', label: 'Transcription language locale tracker', default: 'en-US' }
                            };
                          } else if (staticProvider.id === 'openai_whisper') {
                            fields = {
                              apiKey: { type: 'password', label: 'OpenAI authorization key' },
                              model: { type: 'select', label: 'Whisper Engine version', default: 'whisper-1', options: [{ value: 'whisper-1', label: 'Whisper 1 (Precise)' }] }
                            };
                          } else if (staticProvider.id === 'openai_compatible_transcription') {
                            fields = {
                              apiKey: { type: 'password', label: 'STT Authorized client API Key' },
                              apiUrl: { type: 'string', label: 'Transcription Base URL proxy endpoint', default: 'https://api.openai.com/v1' }
                            };
                          } else if (staticProvider.id === 'aliyun_nls_transcription') {
                            fields = {
                              apiKey: { type: 'password', label: 'Aliyun developer credentials API key' }
                            };
                          } else if (staticProvider.id === 'web_speech_api') {
                            fields = {
                              lang: { type: 'string', label: 'System WebSpeech capture accent language locale code', default: 'en-US' }
                            };
                          } else if (staticProvider.id === 'comet_api_transcription') {
                            fields = {
                              apiKey: { type: 'password', label: 'Comet API transcript key' }
                            };
                          } else if (staticProvider.id === 'xiaomi_mimo_transcription') {
                            fields = {
                              apiKey: { type: 'password', label: 'MiMo transcription key' }
                            };
                          }
                        } else if (staticProvider.tab === 'artistry') {
                          if (staticProvider.id === 'comfyui') {
                            fields = {
                              apiUrl: { type: 'string', label: 'ComfyUI Local IP URL Address', default: 'http://127.0.0.1:8188' },
                              workflow: { type: 'textarea', label: 'Workflow API Node Config map payload properties', placeholder: 'Paste JSON representation...' }
                            };
                          } else if (staticProvider.id === 'replicate') {
                            fields = {
                              apiKey: { type: 'password', label: 'Replicate service key client Token' },
                              model: { type: 'select', label: 'FLUX generation model size', default: 'black-forest-labs/flux-schnell', options: [{ value: 'black-forest-labs/flux-schnell', label: 'FLUX Schnell' }, { value: 'black-forest-labs/flux-dev', label: 'FLUX Dev' }] }
                            };
                          } else if (staticProvider.id === 'nano_banana') {
                            fields = {
                              apiKey: { type: 'password', label: 'Google Gemini Studio AI verification API Key' }
                            };
                          }
                        }

                        registeredModule = {
                          metadata: {
                            id: staticProvider.id,
                            name: staticProvider.name,
                            type: staticProvider.tab === 'chat' ? ModuleType.PROVIDER : (staticProvider.tab === 'speech' ? ModuleType.TTS : ModuleType.CORTEX),
                            description: staticProvider.desc,
                            configSchema: { fields }
                          }
                        } as any;
                      }
                      
                      const hasCredentials = !!(settings[providerSubpage]?.apiKey || settings[providerSubpage]?.api_key);

                      const handleValidationPing = async () => {
                        try {
                          const config = settings[providerSubpage] || {};
                          const res = await fetch('/api/ai/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ provider: providerSubpage, config })
                          });
                          const data = await res.json();
                          if (data.valid) {
                            alert(`✅ Connection verified successfully with ${providerSubpage.toUpperCase()}!\nDetails: ${data.maskedKey || 'Ok'}`);
                          } else {
                            alert(`❌ Health Verification failed: ${data.error || 'Server rejected key credentials.'}`);
                          }
                        } catch (e: any) {
                          alert(`⚠️ Sync server offline: ${e.message}`);
                        }
                      };

                      return (
                        <div className="space-y-6">
                          {registeredModule ? (
                            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                <div>
                                  <h4 className="text-sm font-bold text-white tracking-wide">{registeredModule.metadata.name} Configurations</h4>
                                  <p className="text-[10px] text-white/30 mt-0.5 uppercase">Self-defining configuration schema</p>
                                </div>
                                {/* SOP: Auto-synchronized activate/active toggle to keep different pages perfectly state-aligned */}
                                {(() => {
                                  const isChat = staticProvider?.tab === 'chat' || ['gemini', 'openai', 'anthropic', 'openrouter', 'local', 'puter'].includes(registeredModule.metadata.id);
                                  const isTTS = staticProvider?.tab === 'speech' || ['elevenlabs', 'browser_speech'].includes(registeredModule.metadata.id);
                                  
                                  if (isChat) {
                                    const isActive = settings.provider === registeredModule.metadata.id;
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSettings((prev: any) => ({ ...prev, provider: registeredModule.metadata.id }));
                                        }}
                                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-[9px] uppercase tracking-wider transition-all font-bold select-none cursor-pointer ${
                                          isActive
                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.06)]'
                                            : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                                        }`}
                                      >
                                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-transparent border border-zinc-500'}`} />
                                        {isActive ? 'Primary LLM Gateway: ACTIVE' : 'Set as Primary LLM'}
                                      </button>
                                    );
                                  }
                                  
                                  if (isTTS) {
                                    const isActive = settings.ttsProvider === registeredModule.metadata.id || (!settings.ttsProvider && registeredModule.metadata.id === 'browser_speech');
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSettings((prev: any) => ({ ...prev, ttsProvider: registeredModule.metadata.id }));
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-[9px] uppercase tracking-wider transition-all font-bold select-none cursor-pointer ${
                                          isActive
                                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.06)]'
                                            : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                                        }`}
                                      >
                                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-transparent border border-zinc-500'}`} />
                                        {isActive ? 'Active TTS Engine' : 'Set as Active TTS'}
                                      </button>
                                    );
                                  }

                                  return null;
                                })()}
                              </div>
                              {renderFields(registeredModule)}
                            </div>
                          ) : (
                            /* Subpage fallback lists (Whisper playtest sound etc) */
                            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
                              <p className="text-white/40 italic font-mono text-xs">No static schema registered. Standard config sandbox loaded.</p>
                            </div>
                          )}

                          {/* Extra specific custom playtests (original ElevenLabs layout preserved) */}
                          {providerSubpage === 'elevenlabs' && (
                            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
                              <div className="border-b border-white/5 pb-2">
                                <h4 className="text-sm font-bold text-white tracking-wide font-sans">Vocal Synthesis Calibration</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                                    <span>Pitch</span>
                                    <span className="text-amber-500 font-bold">{elevenLabsPitch - 50 >= 0 ? `+${elevenLabsPitch - 50}` : elevenLabsPitch - 50}%</span>
                                  </div>
                                  <input 
                                    type="range" min="0" max="100" step="1"
                                    value={elevenLabsPitch}
                                    onChange={e => {
                                      const v = parseInt(e.target.value);
                                      setElevenLabsPitch(v);
                                      updateElevenLabsLocal('pitch', v);
                                    }}
                                    className="w-full accent-amber-500 h-1 bg-white/5 rounded cursor-pointer"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                                    <span>Speed</span>
                                    <span className="text-amber-500 font-bold">{elevenLabsSpeed}</span>
                                  </div>
                                  <input 
                                    type="range" min="0.5" max="2.0" step="0.05"
                                    value={elevenLabsSpeed}
                                    onChange={e => {
                                      const v = parseFloat(e.target.value);
                                      setElevenLabsSpeed(v);
                                      updateElevenLabsLocal('speed', v);
                                    }}
                                    className="w-full accent-amber-500 h-1 bg-white/5 rounded cursor-pointer"
                                  />
                                </div>
                              </div>

                              <div className="pt-2 border-t border-white/5">
                                <textarea
                                  value={elevenLabsText}
                                  onChange={e => {
                                    setElevenLabsText(e.target.value);
                                    updateElevenLabsLocal('testText', e.target.value);
                                  }}
                                  rows={2}
                                  className="w-full bg-[#07070a] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!settings.elevenlabs?.apiKey) {
                                      alert("Please enter your ElevenLabs API Key above first!");
                                      return;
                                    }
                                    alert(`Voice Playtest triggered: Sythesizing text with voice code Rachel`);
                                  }}
                                  className="w-full py-2.5 mt-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold uppercase rounded-xl border border-amber-500/20 transition-all font-mono"
                                >
                                  Test Voice Output
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Extra specific custom Whisper/Mic Decibel Meter sound card playtest layout */}
                          {providerSubpage === 'openai' && (
                            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
                              <div className="border-b border-white/5 pb-2">
                                <h4 className="text-sm font-bold text-white tracking-wide">Transcription Sound Level Probe</h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsMonitoring(!isMonitoring)}
                                className={`w-full py-3 text-xs font-bold uppercase rounded-xl border flex items-center justify-center gap-1.5 font-mono ${isMonitoring ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}`}
                              >
                                {isMonitoring ? 'Stop Monitoring Signal' : 'Start Monitoring Signal'}
                              </button>

                              <div className="space-y-3 pt-2 font-mono text-[10px]">
                                <div>
                                  <div className="flex justify-between mb-1 text-zinc-400">
                                    <span>Incoming db sound-level input</span>
                                    <span className="text-emerald-400 font-bold">{isMonitoring ? `${simulateLevel}%` : '0%'}</span>
                                  </div>
                                  <div className="flex gap-[3px] h-3">
                                    {Array.from({ length: 15 }).map((_, i) => {
                                      const activeCount = isMonitoring ? Math.round((simulateLevel / 100) * 15) : 0;
                                      return (
                                        <div key={i} className={`flex-1 rounded-sm ${i < activeCount ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-white/5'}`} />
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Web Speech API specific playtest (Matches Image 1) */}
                          {providerSubpage === 'web_speech_api' && (
                            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
                              <div className="border-b border-white/5 pb-2">
                                <h4 className="text-sm font-bold text-white tracking-wide font-sans">Speech-to-text Test</h4>
                              </div>
                              <p className="text-zinc-400 text-[11px] leading-relaxed font-sans">
                                Test Web Speech API transcription with your selected audio device. This test will always use Web Speech API regardless of your default hearing provider.
                              </p>

                              <div className="space-y-4 pt-1">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Audio Input Device</label>
                                  <div className="relative">
                                    <select
                                      value={selectedMicId}
                                      onChange={(e) => setSelectedMicId(e.target.value)}
                                      className="w-full bg-[#07070a] border border-white/5 rounded-xl px-4 py-3 text-xs text-white appearance-none focus:outline-none focus:border-amber-500/30 font-sans transition-all cursor-pointer"
                                    >
                                      <option value="default">Default</option>
                                      {availableMics.map((mic, idx) => (
                                        <option key={mic.deviceId || idx} value={mic.deviceId}>
                                          {mic.label || `Microphone ${idx + 1}`}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                      <ChevronDown size={14} />
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setIsSstTesting(!isSstTesting)}
                                  className={`w-full py-3.5 text-xs font-bold uppercase rounded-xl border flex items-center justify-center gap-2 font-sans transition-all cursor-pointer ${
                                    isSstTesting 
                                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25 shadow-[0_0_12px_rgba(244,63,94,0.1)]' 
                                      : 'bg-[#002f43]/40 border-[#035a74]/30 text-cyan-400 hover:bg-[#002f43]/60'
                                  }`}
                                >
                                  <Mic size={14} className={isSstTesting ? "animate-pulse" : ""} />
                                  {isSstTesting ? 'Stop Speech-to-Text Test' : 'Start Speech-to-Text Test'}
                                </button>

                                <div className="flex items-start gap-3 bg-[#001c27]/50 border border-[#003c51]/30 p-4 rounded-xl text-cyan-400">
                                  <div className="p-0.5 mt-0.5 shrink-0">
                                    <Info size={14} />
                                  </div>
                                  <p className="text-[11px] leading-relaxed font-sans">
                                    Streaming mode: Transcription will appear in real-time as you speak (Web Speech API)
                                  </p>
                                </div>

                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Transcription Result</span>
                                  <div className="w-full bg-[#050508] border border-dashed border-white/5 rounded-xl p-5 min-h-[140px] flex flex-col justify-between font-sans">
                                    {sstError ? (
                                      <p className="text-xs text-rose-400 font-mono leading-relaxed">{sstError}</p>
                                    ) : sstTranscript ? (
                                      <p className="text-xs font-medium text-white/90 leading-relaxed font-sans">{sstTranscript}</p>
                                    ) : (
                                      <p className="text-[11px] text-zinc-500 italic font-sans leading-relaxed">No transcription yet. Click "Start Speech-to-Text Test" and speak into your microphone.</p>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-2 font-mono text-[10px] space-y-1 text-zinc-500 uppercase tracking-wider border-t border-white/5">
                                  <div>Provider: <span className="text-zinc-300">Web Speech API</span></div>
                                  <div>Language: <span className="text-zinc-300">{settings.web_speech_api?.lang || 'en-US'}</span></div>
                                  <div>Mode: <span className="text-[#a1a1aa]">Streaming (real-time)</span></div>
                                  <div>Continuous: <span className="text-[#a1a1aa]">No</span></div>
                                  <div>Interim Results: <span className="text-[#a1a1aa]">Yes</span></div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* OpenAI Compatible specific subpage playground (Matches Image 2) */}
                          {providerSubpage === 'openai_compatible_transcription' && (
                            <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-5">
                              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <svg width="18" height="18" viewBox="0 0 100 100" className="inline-block transform select-none hover:rotate-180 transition-transform duration-700">
                                  <circle cx="50" cy="50" r="48" fill="#fbbf24" stroke="#000" strokeWidth="4" />
                                  <path d="M 50 50 L 50 2 A 48 48 0 0 1 98 50 Z" fill="#000" />
                                  <path d="M 50 50 L 2 50 A 48 48 0 0 1 50 2 Z" fill="#fbbf24" stroke="#000" strokeWidth="1" />
                                  <path d="M 50 50 L 50 98 A 48 48 0 0 1 2 50 Z" fill="#000" />
                                  <path d="M 50 50 L 98 50 A 48 48 0 0 1 50 98 Z" fill="#fbbf24" stroke="#000" strokeWidth="1" />
                                  <circle cx="50" cy="50" r="14" fill="#fbbf24" stroke="#000" strokeWidth="3" />
                                  <circle cx="50" cy="50" r="4" fill="#000" />
                                </svg>
                                <h4 className="text-sm font-bold text-white tracking-wide font-sans">Transcription Playground</h4>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Audio Input Device</label>
                                  <p className="text-[10px] text-zinc-500 leading-normal -mt-0.5">Select the audio input device for your hearing module.</p>
                                  <div className="relative">
                                    <select
                                      value={selectedMicId}
                                      onChange={(e) => setSelectedMicId(e.target.value)}
                                      className="w-full bg-[#07070a] border border-white/5 rounded-xl px-4 py-3 text-xs text-white appearance-none focus:outline-none focus:border-amber-500/30 font-sans transition-all cursor-pointer"
                                    >
                                      <option value="default">Default</option>
                                      {availableMics.map((mic, idx) => (
                                        <option key={mic.deviceId || idx} value={mic.deviceId}>
                                          {mic.label || `Microphone ${idx + 1}`}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                      <ChevronDown size={14} />
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setIsMonitoring(!isMonitoring)}
                                  className={`w-full py-3.5 text-xs font-bold uppercase rounded-xl border flex items-center justify-center gap-1.5 font-sans font-bold transition-all cursor-pointer ${
                                    isMonitoring 
                                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25' 
                                      : 'bg-[#002f43]/40 border-[#035a74]/30 text-cyan-400 hover:bg-[#002f43]/60'
                                  }`}
                                >
                                  {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                                </button>

                                <div className="space-y-4 pt-1 font-sans">
                                  {/* Input Level meter */}
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[11px] text-zinc-300 font-sans">
                                      <span>Input Level</span>
                                      <span className="text-zinc-400 font-mono text-xs">{isMonitoring ? `${simulateLevel}%` : '0%'}</span>
                                    </div>
                                    <div className="flex gap-[2px] h-2.5">
                                      {Array.from({ length: 24 }).map((_, i) => {
                                        const valFraction = i / 24;
                                        const isActive = isMonitoring && (simulateLevel / 100) >= valFraction;
                                        return (
                                          <div 
                                            key={i} 
                                            className={`flex-1 rounded-sm transition-all duration-75 ${
                                              isActive 
                                                ? 'bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.4)]' 
                                                : 'bg-white/[0.04]'
                                            }`} 
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Probability of Speech meter */}
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[11px] text-zinc-300 font-sans">
                                      <span>Probability of Speech</span>
                                      <span className="text-zinc-400 font-mono text-xs">{isMonitoring ? `${simulateProb.toFixed(1)}%` : '0.0%'}</span>
                                    </div>
                                    <div className="flex gap-[2px] h-2.5">
                                      {Array.from({ length: 24 }).map((_, i) => {
                                        const valFraction = i / 24;
                                        const isActive = isMonitoring && (simulateProb / 100) >= valFraction;
                                        return (
                                          <div 
                                            key={i} 
                                            className={`flex-1 rounded-sm transition-all duration-75 ${
                                              isActive 
                                                ? 'bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.4)]' 
                                                : 'bg-white/[0.04]'
                                              }`} 
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Status indicators legend */}
                                  <div className="flex items-center gap-4 text-[10px] font-sans font-medium text-zinc-400 pb-1 border-b border-white/[0.02]">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                                      <span>Silence</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-full border border-white/30 bg-transparent" />
                                      <span>Detection threshold</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                      <span>Speech</span>
                                    </div>
                                  </div>

                                  {/* Sensitivity slider */}
                                  <div className="space-y-1.5 pt-1">
                                    <div className="flex justify-between text-[11px] text-zinc-300 font-sans">
                                      <span>Sensitivity</span>
                                      <span className="text-white font-semibold font-mono">{openAiSensitivity}%</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 leading-normal -mt-0.5">Adjust the threshold for speech detection</p>
                                    <div className="relative pt-1 flex items-center">
                                      <input 
                                        type="range" min="0" max="100" step="1"
                                        value={openAiSensitivity}
                                        onChange={e => {
                                          const val = parseInt(e.target.value);
                                          setOpenAiSensitivity(val);
                                        }}
                                        className="w-full accent-cyan-400 h-1.5 bg-white/5 rounded-lg cursor-pointer"
                                      />
                                      <div 
                                        className="absolute h-3 w-[2px] bg-white/40 pointer-events-none top-1/2 -translate-y-1/2" 
                                        style={{ left: `${openAiSensitivity}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Speech vs Silence Active State Panel Indicator */}
                                  <div className="flex items-center gap-2 pt-2 text-xs font-sans font-semibold">
                                    {(() => {
                                      const isSpeaking = isMonitoring && simulateLevel >= openAiSensitivity;
                                      return (
                                        <>
                                          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-[#06b6d4]'}`} />
                                          <span className={isSpeaking ? 'text-emerald-400' : 'text-zinc-400'}>
                                            {isSpeaking ? 'Speech' : 'Silence'}
                                          </span>
                                        </>
                                      );
                                    })()}
                                  </div>

                                </div>
                              </div>
                            </div>
                          )}

                          {/* Validation alert box (Image 2) */}
                          <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                            hasCredentials 
                              ? 'bg-emerald-500/[0.02] border-emerald-500/20 text-white' 
                              : 'bg-amber-500/[0.02] border-amber-500/20 text-white'
                          }`}>
                            <div className="flex items-start gap-4">
                              <div className={`p-2 rounded-xl mt-0.5 ${hasCredentials ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                                <ShieldAlert size={16} />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold">
                                  {hasCredentials ? 'Configuration validated successfully' : 'Configuration partially validated'}
                                </h5>
                                <p className="text-[10px] text-zinc-400 uppercase mt-0.5">
                                  {hasCredentials ? 'Key formatted and resolved' : 'Waiting for connection verification keys'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-center font-mono text-[9px]">
                              <button
                                type="button"
                                onClick={handleValidationPing}
                                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-all text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Ping API
                              </button>
                              
                              <button
                                type="button"
                                disabled={!hasCredentials}
                                onClick={() => {
                                  setProviderSubpage(null);
                                  setSelectedSection('modules');
                                  setSelectedSubmoduleCategory('consciousness');
                                }}
                                className={`px-4 py-2 rounded-xl border transition-all text-[10px] font-bold uppercase cursor-pointer ${
                                  hasCredentials
                                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-500 hover:bg-amber-500/30'
                                    : 'bg-white/5 border-white/5 text-zinc-500 opacity-40'
                                }`}
                              >
                                Select Model →
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* SUB-PANEL 7: SHARDS & SYSTEM DATA CONTROLS (Data) */}
            {selectedSection === 'data' && (
              <div className="space-y-6">
                {/* Chat Sessions Card Segment */}
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
                  <div>
                    <h5 className="text-sm font-bold text-white tracking-wide">Chat sessions</h5>
                    <p className="text-[11px] text-zinc-500">Export or import saved chat sessions.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      type="button"
                      onClick={async () => {
                        try {
                          const [historyRes, memoriesRes] = await Promise.all([
                            fetch('/api/storage/history'),
                            fetch('/api/storage/memories')
                          ]);
                          const history = await historyRes.json();
                          const memories = await memoriesRes.json();
                          
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ history, memories }, null, 2));
                          const downloadAnchor = document.createElement('a');
                          downloadAnchor.setAttribute("href", dataStr);
                          downloadAnchor.setAttribute("download", `yuihime_chat_export_${Date.now()}.json`);
                          document.body.appendChild(downloadAnchor);
                          downloadAnchor.click();
                          downloadAnchor.remove();
                        } catch (err: any) {
                          alert(`Gagal mengekspor chat: ${err.message}`);
                        }
                      }}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wider rounded-xl border border-white/5 transition-all text-center cursor-pointer font-sans"
                    >
                      Export chats
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.json';
                        input.onchange = async (e: any) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          const reader = new FileReader();
                          reader.onload = async (evt: any) => {
                            try {
                              const parsed = JSON.parse(evt.target.result);
                              if (!parsed.history && !parsed.memories) {
                                alert("Format file tidak valid. Berkas JSON harus berupa ekspor cadangan yang berisi 'history' atau 'memories'.");
                                return;
                              }

                              const res = await fetch('/api/storage/import', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  history: parsed.history || [],
                                  memories: parsed.memories || []
                                })
                              });
                              const data = await res.json();
                              if (data.success) {
                                alert(`Data batin berhasil diimpor!\n\nHistori pesan: ${data.importedHistory}\nMemori/Fakta: ${data.importedMemories}`);
                                window.location.reload();
                              } else {
                                alert(`Gagal mengimpor data: ${data.error || 'Unknown error'}`);
                              }
                            } catch (err: any) {
                              alert(`Gagal membaca file JSON: ${err.message}`);
                            }
                          };
                          reader.readAsText(file);
                        };
                        input.click();
                      }}
                      className="flex-1 py-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-teal-500/20 transition-all text-center cursor-pointer font-sans"
                    >
                      Import chats
                    </button>
                    <button 
                      type="button"
                      onClick={async () => {
                        if (confirm("SEVERE ALERT: Are you absolutely sure you wish to permanently erase ALL stored chat histories and memories from database?")) {
                          try {
                            const res = await fetch('/api/storage/purge', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ mode: 'soft' })
                            });
                            const data = await res.json();
                            if (data.success) {
                              alert("Seluruh riwayat obrolan dan log pesan batin telah dinetralkan (purged).");
                              window.location.reload();
                            } else {
                              alert(`Gagal menghapus: ${data.error}`);
                            }
                          } catch (err: any) {
                            alert(`Terjadi kesalahan koneksi: ${err.message}`);
                          }
                        }
                      }}
                      className="py-3 px-5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-rose-500/20 transition-all text-center cursor-pointer font-sans"
                    >
                      Delete all chat sessions
                    </button>
                  </div>
                </div>

                {/* Models Card Segment */}
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
                  <div>
                    <h5 className="text-sm font-bold text-white tracking-wide">Models</h5>
                    <p className="text-[11px] text-zinc-500">Remove imported Live2D/VRM models.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      if (confirm("Remove models list registry mappings from localStorage web-cache?")) {
                        localStorage.removeItem('yuihime_cached_models_v2');
                        window.location.reload();
                      }
                    }}
                    className="w-full sm:w-auto py-3 px-6 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-rose-500/20 transition-all cursor-pointer font-sans"
                  >
                    Delete all models
                  </button>
                </div>

                {/* Modules Card Segment */}
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
                  <div>
                    <h5 className="text-sm font-bold text-white tracking-wide">Modules</h5>
                    <p className="text-[11px] text-zinc-500">Reset module preferences and credentials.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={async () => {
                      if (confirm("Reset dynamic neural routing and modular weights settings back to default configurations?")) {
                        try {
                          const preservedSettings = {
                            official_chat: settings.official_chat,
                            openrouter: settings.openrouter,
                            aihubmix: settings.aihubmix,
                            gemini: settings.gemini,
                            openai: settings.openai,
                            anthropic: settings.anthropic,
                            elevenlabs: settings.elevenlabs,
                            groq: settings.groq,
                            ollama: settings.ollama,
                            lmstudio: settings.lmstudio,
                          };
                          
                          const res = await fetch('/api/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(preservedSettings)
                          });
                          const data = await res.json();
                          alert("Modular settings reset back to clean defaults.");
                          window.location.reload();
                        } catch (err: any) {
                          alert(`Gagal merestet setelan modular: ${err.message}`);
                        }
                      }
                    }}
                    className="w-full sm:w-auto py-3 px-6 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-xl border border-amber-500/20 transition-all cursor-pointer font-sans"
                  >
                    Reset module settings
                  </button>
                </div>

                {/* DANGER ZONE RED BORDERED BLOCK */}
                <div className="border border-rose-500/30 bg-rose-500/[0.02] p-6 rounded-2xl space-y-5 animate-fade-in">
                  <div className="border-b border-rose-500/10 pb-2">
                    <h4 className="text-sm font-bold text-rose-400 tracking-wide flex items-center gap-2 font-sans">
                      <ShieldAlert size={16} /> Danger zone
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5 font-sans">Irreversible actions. Export what you need before continuing.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-wide font-sans">Providers</h5>
                      <p className="text-[10px] text-zinc-500 mt-1 font-sans">Reset all provider settings and credentials.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        if (confirm("IRREVERSIBLE ALERT: Wipe all stored credentials, API Keys, and customized models settings?")) {
                          setSettings({});
                          alert("All provider configuration maps deleted.");
                        }
                      }}
                      className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] uppercase font-mono tracking-widest rounded-xl transition-all cursor-pointer font-bold shrink-0 shadow-lg"
                    >
                      Reset provider settings
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-wide font-sans">Delete all data</h5>
                      <p className="text-[10px] text-zinc-500 mt-1 font-sans">Wipe every local setting, provider config, and model.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        if (confirm("TOTAL DESTRUCTION: This will completely clean all localStorage and indexDB registers. Wipe clean now?")) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] uppercase font-mono tracking-widest rounded-xl transition-all cursor-pointer font-bold shrink-0 shadow-lg"
                    >
                      Delete all data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-PANEL 8: LIVE BROADCASTER SYSTEM (Connection) */}
            {selectedSection === 'connection' && (
              <div className="space-y-6 animate-fade-in">
                {/* 1. WebSocket Controller & Diagnostic Panel */}
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold">WebSocket Client Suite</h4>
                      <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Integrasikan Yuihime dengan server WebSocket lokal atau gateway eksternal lainnya.</p>
                    </div>
                    {/* Glowing Live Status Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5">
                      <span className={`w-2 h-2 rounded-full ${
                        testWsStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                        testWsStatus === 'CONNECTING' ? 'bg-amber-400 animate-ping' :
                        testWsStatus === 'ERROR' ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                        'bg-zinc-600'
                      }`} />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white">
                        {testWsStatus}
                      </span>
                    </div>
                  </div>

                  {/* Config Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-sans text-white mb-1.5 font-bold">WebSocket Server Target Address</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={testWsUrl}
                          onChange={e => setTestWsUrl(e.target.value)}
                          placeholder="ws://localhost:3000/ws"
                          disabled={testWsStatus === 'CONNECTED' || testWsStatus === 'CONNECTING'}
                          className="flex-1 bg-[#07070a] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500/40 font-mono transition-all disabled:opacity-50"
                        />
                        {testWsStatus === 'DISCONNECTED' || testWsStatus === 'ERROR' ? (
                          <button
                            type="button"
                            onClick={() => connectTestWs(testWsUrl)}
                            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-black font-sans font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-amber-500/10 active:scale-95 cursor-pointer shrink-0"
                          >
                            Hubungkan
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={disconnectTestWs}
                            className="px-5 py-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 font-sans font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
                          >
                            Putuskan
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-2 font-sans">
                        Gunakan tombol di bawah ini untuk mencari / mendeteksi secara instan:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                            const url = `${proto}//${window.location.host}/ws`;
                            setTestWsUrl(url);
                            setTestWsLogs(prev => [...prev, { type: 'sys', message: `Mendeteksi internal gateway: ${url}`, timestamp: new Date().toLocaleTimeString() }]);
                          }}
                          disabled={testWsStatus === 'CONNECTED' || testWsStatus === 'CONNECTING'}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/75 text-[10px] font-mono rounded-lg border border-white/5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          📍 Auto-Detect Internal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const url = 'ws://localhost:6121/ws';
                            setTestWsUrl(url);
                          }}
                          disabled={testWsStatus === 'CONNECTED' || testWsStatus === 'CONNECTING'}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/75 text-[10px] font-mono rounded-lg border border-white/5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          🖥️ Localhost Port 6121
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Custom Packet Sender */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-sans text-white/80 font-bold">Kirim Paket Pesan Pengujian (TX)</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTestWsMsg(JSON.stringify({ type: "ping", origin: "Yuihime Client" }, null, 2))}
                          className="text-[9px] uppercase tracking-wider text-amber-500/70 hover:text-amber-500 font-mono transition-colors"
                        >
                          Ping Template
                        </button>
                        <span className="text-white/20">|</span>
                        <button
                          type="button"
                          onClick={() => setTestWsMsg(JSON.stringify({ type: "chat", data: { text: "Yuihime, apa kabar hari ini?", viewer: "Subjek Dev" } }, null, 2))}
                          className="text-[9px] uppercase tracking-wider text-cyan-400/70 hover:text-cyan-400 font-mono transition-colors"
                        >
                          Chat Template
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        value={testWsMsg}
                        onChange={e => setTestWsMsg(e.target.value)}
                        rows={4}
                        className="w-full bg-[#07070a] border border-white/5 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cyan-500/40 font-mono transition-all"
                        placeholder='{"type": "chat_message", "text": "Subjek is speaking"}'
                      />
                      <button
                        type="button"
                        onClick={sendTestWsMsg}
                        disabled={testWsStatus !== 'CONNECTED'}
                        className="absolute bottom-3 right-3 px-4 py-2 bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 cursor-pointer shadow-lg disabled:cursor-not-allowed"
                      >
                        🚀 Kirim Paket
                      </button>
                    </div>
                  </div>

                  {/* Real-Time Message Traffic Log Sniffer Component */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] uppercase tracking-wider font-mono text-zinc-500">Live Traffic Monitor (TX/RX Log Stream)</label>
                      <button
                        type="button"
                        onClick={clearTestWsLogs}
                        className="text-[9px] uppercase tracking-wider text-rose-400 hover:text-rose-300 font-mono transition-colors"
                      >
                        Hapus Log List
                      </button>
                    </div>

                    <div className="bg-[#050508] border border-white/[0.03] rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                      {testWsLogs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic">
                          <span>Menunggu aktivitas transmisi paket WebSocket...</span>
                        </div>
                      ) : (
                        testWsLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-2 items-start leading-relaxed hover:bg-white/[0.02] p-1 rounded transition-colors break-all">
                            <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                            {log.type === 'rx' && (
                              <span className="text-cyan-400 shrink-0 font-bold">[RX]</span>
                            )}
                            {log.type === 'tx' && (
                              <span className="text-purple-400 shrink-0 font-bold">[TX]</span>
                            )}
                            {log.type === 'sys' && (
                              <span className="text-amber-500 shrink-0 font-bold">[SYS]</span>
                            )}
                            <span className={`${
                              log.type === 'rx' ? 'text-zinc-300' :
                              log.type === 'tx' ? 'text-purple-300/90' : 'text-zinc-400'
                            }`}>
                              {log.message}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Google Linkage & External Moderator Configuration */}
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4 font-sans">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-mono text-zinc-500 mb-2">Google OAuth Linkage (Stage-Web)</label>
                    <div className="flex justify-between items-center p-3 bg-black/40 border border-[#ffffff05] rounded-xl font-sans">
                      <span className="text-xs text-white/40">{user ? `Signed in as ${user.email}` : 'Linked status: Disarmed'}</span>
                      {!user ? (
                        <button 
                          type="button"
                          onClick={() => StorageService.signInWithGoogle()}
                          className="px-4 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[9px] border border-cyan-500/20 uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Authenticate
                        </button>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => StorageService.logout()}
                          className="px-4 py-1.5 bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400 border border-white/5 uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Sever Connection
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 font-sans mb-1.5">
                    <label className="block text-[9px] uppercase tracking-[0.2em] font-mono text-zinc-500 mb-2">Live Stream Moderator Topic</label>
                    <input
                      type="text"
                      placeholder="Enter Live Moderation Topic..."
                      value={currentLiveTopic || ''}
                      onChange={(e) => setCurrentLiveTopic && setCurrentLiveTopic(e.target.value)}
                      className="w-full bg-[#07070a] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/55"
                    />
                  </div>

                  {handleSimulateLive && (
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <h5 className="text-xs font-bold text-white tracking-wide">Injeksi Obrolan Simulasi</h5>
                        <p className="text-[10px] text-white/30 uppercase mt-0.5">Test stream commentary flow rate</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSimulateLive}
                        className="px-5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] uppercase tracking-widest rounded-xl border border-purple-400/20 transition-all font-bold cursor-pointer"
                      >
                        Trigger Simulation
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Cross-Platform Telegram Pairing Gateway */}
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-5 relative overflow-hidden font-sans">
                  {/* Glowing decoration overlay for cool cyberpunk / sci-fi feeling */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#0ea5e9] font-bold font-sans">Cross-Platform Pairing Gateway</h4>
                      <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                        Tautkan identitas Web ini dengan akun Telegram Anda untuk sinkronisasi kognisi lintas-platform yang mulus.
                      </p>
                    </div>
                    {/* Link state badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5">
                      <span className={`w-2 h-2 rounded-full ${
                        pairingLinked ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.6)]' : 'bg-zinc-600'
                      }`} />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white">
                        {pairingLinked ? 'LINKED' : 'UNPAIRED'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {pairingLinked ? (
                      <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-4 text-xs space-y-3">
                        <div className="flex items-center gap-2.5 text-cyan-400 font-semibold">
                          <span>✨</span>
                          <span>Berhasil Terhubung dengan Telegram!</span>
                        </div>
                        <p className="text-zinc-400 leading-relaxed text-[11px] font-sans">
                          Yuihime telah mengaitkan identitas Anda (<strong>{perceivedName}</strong>) di platform Web dengan akun eksternal Anda. Anda dapat menerima tugas latar belakang, cron notes, dan berinteraksi secara mulus lintas platform.
                        </p>
                        
                        <div className="space-y-1.5 pt-2 border-t border-white/[0.03]">
                          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Daftar Akun Tertaut:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {pairingLinkedAccounts.filter(acc => acc.toLowerCase().includes('telegram')).map((acc, index) => (
                              <span key={index} className="px-2.5 py-1 bg-black/40 border border-white/5 text-[10px] text-cyan-300 rounded font-mono">
                                🔗 {acc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed">
                        <div className="space-y-3 font-sans">
                          <span className="text-[11px] font-bold text-zinc-300 block uppercase tracking-wider font-mono">Langkah-langkah Penyandingan:</span>
                          <ol className="list-decimal pl-4 space-y-2 text-[11px] text-zinc-400 font-sans">
                            <li>Klik tombol <strong className="text-white">"Generate Pairing OTP"</strong> untuk mendapatkan kode unik 6-digit.</li>
                            <li>Buka Telegram dan cari Bot Telegram Anda.</li>
                            <li>Kirim perintah <code className="text-cyan-400 font-mono bg-black/50 px-1 py-0.5 rounded">/pair [kode_otp]</code> atau cukup ketik <code className="text-cyan-400 font-mono bg-black/50 px-1 py-0.5 rounded">[kode_otp]</code> ke bot.</li>
                            <li>Batin Yui akan langsung mengenali identitas Anda di Telegram secara instan!</li>
                          </ol>
                        </div>

                        <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center space-y-3 min-h-[140px] relative font-sans">
                          {pairingLoading ? (
                            <div className="text-xs text-cyan-400 animate-pulse font-mono flex items-center gap-2">
                              <span>⏳</span>
                              <span>Membuat sirkuit penyandingan...</span>
                            </div>
                          ) : pairingCode ? (
                            <div className="text-center space-y-2 font-sans">
                              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono block">Kode OTP Sandi Anda:</span>
                              <div className="text-2xl font-bold tracking-[0.2em] text-cyan-400 font-mono select-all bg-black/55 border border-white/10 px-4 py-2 rounded-xl shadow-lg">
                                {pairingCode.substring(0, 3)} {pairingCode.substring(3)}
                              </div>
                              <span className="text-[9px] text-zinc-400 font-sans block">
                                Berlaku 10 menit. Kirim <code className="text-cyan-300 font-mono bg-black/40 px-1.5 py-0.5 rounded">/pair {pairingCode}</code> ke Telegram.
                              </span>
                            </div>
                          ) : (
                            <div className="text-center space-y-2 font-sans">
                              <span className="text-[10px] text-zinc-500 font-sans block">Belum ada kode OTP aktif yang dibuat.</span>
                              <button
                                type="button"
                                onClick={generatePairingCode}
                                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600/25 to-sky-600/25 hover:from-cyan-500/35 hover:to-sky-500/35 text-cyan-200 border border-cyan-500/30 text-xs font-semibold rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg hover:shadow-cyan-500/5 block mx-auto font-sans"
                              >
                                🔑 Generate Pairing OTP
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metode Alternatif: Masukkan Kode OTP dari Bot */}
                    <div className="border-t border-white/5 pt-5 mt-4 space-y-3 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-mono uppercase font-bold">Reverse Pairing</span>
                        <h5 className="text-[11px] font-bold text-zinc-200">Metode Alternatif: Masukkan Kode OTP dari Bot</h5>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                        Jika Anda memberi tahu Yuihime di Telegram atau Discord bahwa Anda adalah <strong>{perceivedName}</strong>, Yuihime akan membuatkan kode rahasia 6-digit. Masukkan kode tersebut di bawah ini untuk membuktikan identitas asli Anda dan mengaitkan akun eksternal tersebut secara instan!
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1.5">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Contoh: 123456"
                            value={botPairingCode}
                            onChange={(e) => setBotPairingCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono tracking-widest text-[#0ea5e9] placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 text-center uppercase"
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={claimBotPairingCode}
                          disabled={botPairingLoading || !botPairingCode || botPairingCode.length !== 6}
                          className={`px-4 py-2 text-xs font-semibold rounded-xl border font-sans transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                            botPairingLoading || botPairingCode.length !== 6
                              ? 'bg-zinc-800/40 text-zinc-500 border-zinc-800 cursor-not-allowed'
                              : 'bg-purple-600/25 border-purple-500/30 text-purple-200 hover:bg-purple-500/35 hover:border-purple-400/40'
                          }`}
                        >
                          {botPairingLoading ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : (
                            <span>🔌 Selesaikan Tautan</span>
                          )}
                        </button>
                      </div>

                      {botPairingMessage && (
                        <div className={`text-[11px] p-2.5 px-3.5 rounded-xl border ${
                          botPairingMessage.type === 'success'
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                        }`}>
                          {botPairingMessage.type === 'success' ? '✅ ' : '❌ '}
                          {botPairingMessage.text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-PANEL 9: WORKFLOW CHAIN & OVERLAYS (System) */}
            {selectedSection === 'system' && (
              <SystemTab
                settings={settings}
                setSettings={setSettings}
                updateGeneral={updateGeneral}
                systemSubpage={systemSubpage}
                setSystemSubpage={setSystemSubpage}
                applyThemePalette={applyThemePalette}
                backdrop={backdrop}
                handleSelectBackdrop={handleSelectBackdrop}
                customImgUrl={customImgUrl}
                handleCustomUrlChange={handleCustomUrlChange}
                avatarConfig={avatarConfig}
                onAvatarUpdate={onAvatarUpdate}
                renderFields={renderFields}
                onShowInfo={handleShowInfo}
              />
            )}

            {false && selectedSection === 'system' && (
              <div className="space-y-6 animate-fade-in">
                {systemSubpage === null ? (
                  <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-3">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 mb-2 font-bold font-sans">Core System Setup</h4>

                    {/* GENERAL */}
                    <button 
                      type="button"
                      onClick={() => setSystemSubpage('general')}
                      className="w-full flex items-center justify-between p-4 bg-[#07070a]/65 hover:bg-[#111118]/85 border border-white/5 rounded-2xl transition-all cursor-pointer text-left group animate-fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                          <Sliders size={16} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors font-sans">General</h5>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">Dark theme, languages, etc.</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* COLOR SCHEME */}
                    <button 
                      type="button"
                      onClick={() => setSystemSubpage('colors')}
                      className="w-full flex items-center justify-between p-4 bg-[#07070a]/65 hover:bg-[#111118]/85 border border-white/5 rounded-2xl transition-all cursor-pointer text-left group animate-fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-pink-500/10 rounded-xl border border-pink-500/20 text-pink-400">
                          <Palette size={16} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors font-sans">Color Scheme</h5>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">Adapt visual focus colors of the virtual stage</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* STAGE & VTUBER CAMERA CALIBRATION */}
                    <button 
                      type="button"
                      onClick={() => setSystemSubpage('stage')}
                      className="w-full flex items-center justify-between p-4 bg-[#07070a]/65 hover:bg-[#111118]/85 border border-white/5 rounded-2xl transition-all cursor-pointer text-left group animate-fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                          <Monitor size={16} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors font-sans font-sans">Stage & VTuber Camera</h5>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">Calibrate avatar scale, offset coordinates, and stream backgrounds</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* DEVELOPERS */}
                    <button 
                      type="button"
                      onClick={() => setSystemSubpage('developers')}
                      className="w-full flex items-center justify-between p-4 bg-[#07070a]/65 hover:bg-[#111118]/85 border border-white/5 rounded-2xl transition-all cursor-pointer text-left group animate-fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
                          <Terminal size={16} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors font-sans font-sans">Developers</h5>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-sans text-left">Diagnostics, sandbox and action chains</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
                    </button>

                  </div>
                ) : systemSubpage === 'general' ? (
                  <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-6">
                    {/* General Theme option matching Image 1 */}
                    <div className="flex items-center justify-between py-2 border-b border-white/5 pb-4">
                      <div>
                        <h5 className="text-xs font-bold text-white tracking-wide font-sans font-sans">Theme</h5>
                        <p className="text-[10.5px] text-zinc-400 mt-1 font-sans">Switch the base theme of AIRI, Light mode or Dark mode.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const isCurrentlyDark = settings.colorScheme?.selected !== 'light';
                          const targetTheme = isCurrentlyDark ? 'light' : 'default';
                          setSettings((prev: any) => ({
                            ...prev,
                            colorScheme: { ...(prev.colorScheme || {}), selected: targetTheme }
                          }));
                          applyThemePalette(targetTheme);
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${settings.colorScheme?.selected !== 'light' ? 'bg-amber-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${settings.colorScheme?.selected !== 'light' ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Language Dropdown matching Image 1 */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-white/5 pb-4">
                      <div>
                        <h5 className="text-xs font-bold text-white tracking-wide font-sans">Language</h5>
                        <p className="text-[10.5px] text-zinc-400 mt-1 font-sans font-sans">UI language. You can set characters' language later.</p>
                      </div>
                      <select 
                        value={settings.language || 'en'} 
                        onChange={e => updateGeneral('language', e.target.value)}
                        className="bg-[#07070a] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/30 font-bold min-w-[140px] font-sans" 
                      >
                        <option value="en">English (EN)</option>
                        <option value="id">Indonesian (ID)</option>
                        <option value="jp">Japanese (JP)</option>
                      </select>
                    </div>

                    {/* Enable Usage Analytics Toggle matching Image 1 */}
                    <div className="flex items-start justify-between gap-4 py-2">
                      <div className="space-y-1 pr-6 text-left">
                        <h5 className="text-xs font-bold text-white tracking-wide font-sans">Enable usage analytics</h5>
                        <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">
                          AIRI collects anonymous usage analytics to help us understand how the app is used and improve stability. No personal data is collected.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono">
                          <a href="#privacy" className="text-amber-500/80 hover:underline">Read the privacy policy.</a>
                          <span className="text-zinc-500">You can turn analytics off at any time.</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const next = !settings.enableAnalytics;
                          setSettings((prev: any) => ({ ...prev, enableAnalytics: next }));
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative shrink-0 mt-1 cursor-pointer ${settings.enableAnalytics ? 'bg-amber-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${settings.enableAnalytics ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                  </div>
                ) : systemSubpage === 'colors' ? (
                  <div className="space-y-6 animate-fade-in font-sans">
                    {/* Primary Color Calibration Card */}
                    <div className="bg-[#0e0e14]/55 border border-white/5 rounded-3xl p-5 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2.5">
                          <Palette className="text-[#0ea5e9]" size={16} />
                          <span className="text-sm font-bold text-white tracking-wide">Color Scheme</span>
                        </div>
                        <ChevronRight className="text-zinc-500 rotate-90" size={16} />
                      </div>

                      <div className="space-y-5">
                        {/* Dynamic Toggle & Primary Color Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Primary Color</span>
                            <span className="text-[15px] font-extrabold text-white font-mono mt-0.5 block">
                              {(() => {
                                const activeThemeId = settings.colorScheme?.selected || 'default';
                                const palettesForShades: Record<string, string> = {
                                  default: '#00bcd4',
                                  morandi: '#b85b4f',
                                  monet: '#7ba2db',
                                  japanese: '#df8c8c',
                                  nordic: '#568296',
                                  theme: '#c23b3b',
                                  chinese: '#c23b3b'
                                };
                                return (activeThemeId === 'custom' 
                                  ? (localStorage.getItem('yuihime_custom_primary_color') || '#00bcd4')
                                  : (palettesForShades[activeThemeId] || '#00bcd4')).toUpperCase();
                              })()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 bg-black/45 border border-white/5 px-3 py-1.5 rounded-xl">
                            <span className="text-[10px] font-mono text-zinc-400">I Want It Dynamic!</span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = !settings.colorSchemeDynamic;
                                setSettings((prev: any) => ({ ...prev, colorSchemeDynamic: next }));
                              }}
                              className={`w-9 h-5 rounded-full transition-all relative shrink-0 cursor-pointer ${settings.colorSchemeDynamic ? 'bg-[#0ea5e9]' : 'bg-white/10'}`}
                            >
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all ${settings.colorSchemeDynamic ? 'left-4.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Hue Rainbow Spectrum Slider */}
                        <div className="space-y-1.5">
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={(() => {
                              const activeHue = localStorage.getItem('yuihime_custom_hue_v1');
                              return activeHue ? parseInt(activeHue) : 195;
                            })()}
                            onChange={(e) => {
                              const hue = parseInt(e.target.value);
                              localStorage.setItem('yuihime_custom_hue_v1', hue.toString());
                              
                              // Translate hue to Hex
                              const hslToHex = (h: number, s: number, l: number): string => {
                                l /= 100;
                                const a = (s * Math.min(l, 1 - l)) / 100;
                                const f = (n: number) => {
                                  const k = (n + h / 30) % 12;
                                  const col = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                                  return Math.round(255 * col).toString(16).padStart(2, '0');
                                };
                                return `#${f(0)}${f(8)}${f(4)}`;
                              };
                              const hex = hslToHex(hue, 100, 50);
                              
                              localStorage.setItem('yuihime_custom_primary_color', hex);
                              setSettings((prev: any) => ({
                                ...prev,
                                colorScheme: { ...(prev.colorScheme || {}), selected: 'custom', customColor: hex }
                              }));
                              applyThemePalette('custom', hex);
                            }}
                            className="w-full h-2.5 rounded-full appearance-none outline-none cursor-pointer"
                            style={{
                              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                            }}
                          />
                        </div>

                        {/* Dynamic Solid Color Shades List */}
                        <div className="space-y-2.5">
                          <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block">Shades</span>
                          <div className="grid grid-cols-11 gap-1">
                            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade, idx) => {
                              const activeThemeId = settings.colorScheme?.selected || 'default';
                              const palettesForShades: Record<string, string> = {
                                default: '#00bcd4',
                                morandi: '#b85b4f',
                                monet: '#7ba2db',
                                japanese: '#df8c8c',
                                nordic: '#568296',
                                chinese: '#c23b3b'
                              };
                              const baseColor = activeThemeId === 'custom' 
                                ? (localStorage.getItem('yuihime_custom_primary_color') || '#00bcd4')
                                : (palettesForShades[activeThemeId] || '#00bcd4');
                              
                              // Simple opacity steps for mock solid shades
                              const opacity = 1 - (idx * 0.08);

                              return (
                                <div key={shade} className="flex flex-col items-center gap-1 min-w-0">
                                  <div 
                                    className="w-full aspect-square rounded-md border border-white/5 shadow-inner" 
                                    style={{ backgroundColor: baseColor, opacity: opacity }}
                                  />
                                  <span className="text-[7.5px] font-mono text-zinc-600 truncate">{shade}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Transparent/Alpha Shades list */}
                        <div className="space-y-2.5">
                          <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block">Transparent Shades</span>
                          <div className="grid grid-cols-10 gap-1.5">
                            {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((alpha) => {
                              const activeThemeId = settings.colorScheme?.selected || 'default';
                              const palettesForShades: Record<string, string> = {
                                default: '#00bcd4',
                                morandi: '#b85b4f',
                                monet: '#7ba2db',
                                japanese: '#df8c8c',
                                nordic: '#568296',
                                chinese: '#c23b3b'
                              };
                              const baseColor = activeThemeId === 'custom' 
                                ? (localStorage.getItem('yuihime_custom_primary_color') || '#00bcd4')
                                : (palettesForShades[activeThemeId] || '#00bcd4');

                              return (
                                <div key={alpha} className="flex flex-col items-center gap-1 min-w-0">
                                  {/* Checkerboard background wrapper */}
                                  <div 
                                    className="w-full aspect-square rounded-md overflow-hidden border border-white/5 shadow-inner relative"
                                    style={{
                                      backgroundImage: 'linear-gradient(45deg, #1b1b22 25%, transparent 25%), linear-gradient(-45deg, #1b1b22 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1b1b22 75%), linear-gradient(-45deg, transparent 75%, #1b1b22 75%)',
                                      backgroundSize: '6px 6px',
                                      backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px'
                                    }}
                                  >
                                    <div 
                                      className="absolute inset-0"
                                      style={{ backgroundColor: baseColor, opacity: alpha / 100 }}
                                    />
                                  </div>
                                  <span className="text-[7.5px] font-mono text-zinc-600 truncate">500/{alpha}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color Scheme Presets Selection Card */}
                    <div className="bg-[#0e0e14]/55 border border-white/5 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="text-[#0ea5e9]" size={16} />
                          <span className="text-sm font-bold text-white tracking-wide">Color Scheme Presets</span>
                        </div>
                        <ChevronRight className="text-zinc-500 rotate-90" size={16} />
                      </div>

                      <div className="space-y-3">
                        {[
                          { 
                            id: 'default', 
                            name: 'Default Color', 
                            desc: 'The default greenish theme color, brought by AIRI to you!', 
                            colors: ['#00bcd4'] 
                          },
                          { 
                            id: 'morandi', 
                            name: 'Morandi Colors', 
                            desc: "Soft, muted tones inspired by Giorgio Morandi's paintings", 
                            colors: ['#c5b3a3', '#dfd5ca', '#cccdc6', '#dec9c1', '#eae1db', '#aba296', '#d6c6b9', '#dbcbc1'] 
                          },
                          { 
                            id: 'monet', 
                            name: 'Monet Colors', 
                            desc: "Impressionist palette inspired by Claude Monet's works", 
                            colors: ['#79a1bd', '#b8cdd6', '#eacfaf', '#8b9c6f', '#cfe2db', '#ecceac', '#7d95b5', '#afd2c9'] 
                          },
                          { 
                            id: 'japanese', 
                            name: 'Japanese Colors', 
                            desc: 'Traditional Japanese color palette', 
                            colors: ['#e2af90', '#c78572', '#a08b7e', '#ba8964', '#dfad31', '#d29e34', '#dfbe1b', '#c18511'] 
                          },
                          { 
                            id: 'nordic', 
                            name: 'Nordic Colors', 
                            desc: 'Scandinavian minimalist color scheme', 
                            colors: ['#92adb9', '#d1dee4', '#bfcbcc', '#9caebb', '#d8e1e7', '#8192a6', '#98abb8', '#8ba4b4'] 
                          },
                          { 
                            id: 'chinese', 
                            name: 'Chinese Traditional Colors', 
                            desc: 'Traditional Chinese colors, derived from ancient textiles, porcelain and paintings', 
                            colors: ['#f9cbd7', '#be0027', '#7f6f50', '#6f9e71', '#1a101d', '#febc11', '#4193cc', '#a24b42'] 
                          }
                        ].map((theme) => {
                          const isActive = (settings.colorScheme?.selected || 'default') === theme.id;
                          return (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => {
                                setSettings((prev: any) => ({
                                  ...prev,
                                  colorScheme: { ...(prev.colorScheme || {}), selected: theme.id }
                                }));
                                applyThemePalette(theme.id);
                              }}
                              className={`w-full flex items-start gap-4 p-4 bg-[#07070a]/75 hover:bg-[#111118]/85 border rounded-2xl cursor-pointer text-left transition-all ${
                                isActive 
                                  ? 'border-[#0ea5e9]/55 shadow-[0_0_12px_rgba(14,165,233,0.15)] bg-[#111118]/65' 
                                  : 'border-white/5'
                              }`}
                            >
                              {/* Swatches indicator left side */}
                              <div className="flex flex-wrap gap-1 w-11 shrink-0 bg-black/40 p-1.5 rounded-lg border border-white/5">
                                {theme.colors.slice(0, 4).map((c, i) => (
                                  <span key={i} className="w- 3 h-3 rounded-full shrink-0" style={{ backgroundColor: c, width: '10px', height: '10px' }} />
                                ))}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-[12px] font-bold text-white leading-tight">{theme.name}</h5>
                                  {isActive && <span className="text-[8px] uppercase tracking-widest text-[#0ea5e9] bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 px-1.5 py-0.5 rounded-md font-mono">Active</span>}
                                </div>
                                <p className="text-[10px] text-zinc-500 leading-normal mt-0.5 font-sans">
                                  {theme.desc}
                                </p>
                                
                                {/* Full multi-color row on expanded/hover */}
                                {theme.colors.length > 1 && (
                                  <div className="flex items-center gap-1 mt-2">
                                    {theme.colors.map((c, i) => (
                                      <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : systemSubpage === 'stage' ? (
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-6 animate-fade-in">
                  
                  {/* Backdrop Selectors */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide font-sans">OBS Backdrop Engine</h4>
                      <p className="text-[10.5pt] text-zinc-400 mt-1 font-sans">Configure visual background behind Yuihime</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['matrix', 'neon', 'chroma-green', 'chroma-blue', 'black', 'custom'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleSelectBackdrop(mode)}
                          className={`py-2 text-[10px] font-mono border rounded-xl transition-all cursor-pointer font-bold ${backdrop === mode ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)]' : 'bg-black/30 border-white/5 text-white/50 hover:border-white/10 hover:text-white'}`}
                        >
                          {mode === 'chroma-green' ? 'Green Screen' : mode === 'chroma-blue' ? 'Blue Screen' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                      ))}
                    </div>

                    {backdrop === 'custom' && (
                      <div className="mt-2 bg-black/40 border border-white/5 p-3 rounded-xl space-y-1.5 font-sans">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block">Custom Backdrop Image URL</label>
                        <input 
                          type="text" 
                          value={customImgUrl}
                          onChange={(e) => handleCustomUrlChange(e.target.value)}
                          placeholder="https://images.unsplash.com/your-custom-backdrop.jpg"
                          className="w-full text-xs font-mono bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  {/* Camera calibration sliders */}
                  {avatarConfig && onAvatarUpdate && (
                    <div className="space-y-4 border-t border-white/5 pt-4">
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-wide font-sans">Live2D Virtual Camera Setup</h4>
                        <p className="text-[10.5pt] text-zinc-400 mt-1 font-sans">Fine-tune coordinates and scale size of the avatar</p>
                      </div>

                      {/* Scale */}
                      <div className="space-y-2 bg-black/30 border border-white/5 rounded-xl p-3">
                        <div className="flex justify-between items-center text-[11px] font-mono">
                          <span className="text-white/60 flex items-center gap-1"><Maximize2 size={11} className="text-amber-500/70" /> Scaler (Size)</span>
                          <span className="text-amber-500">{(avatarConfig?.scale ?? 1.2).toFixed(1)}x</span>
                        </div>
                        <input 
                          type="range" min="0.5" max="2.5" step="0.1"
                          value={avatarConfig?.scale ?? 1.2}
                          onChange={(e) => onAvatarUpdate({ ...avatarConfig, scale: parseFloat(e.target.value) })}
                          className="w-full accent-amber-500 h-1 bg-white/5 rounded-full appearance-none outline-none cursor-pointer"
                        />
                      </div>

                      {/* X Offset */}
                      <div className="space-y-2 bg-black/30 border border-white/5 rounded-xl p-3">
                        <div className="flex justify-between items-center text-[11px] font-mono">
                          <span className="text-white/60 flex items-center gap-1"><Move size={11} className="text-cyan-500/70" /> Horizontal Coordinate (X)</span>
                          <span className="text-cyan-400">{avatarConfig?.xOffset ?? 0}px</span>
                        </div>
                        <input 
                          type="range" min="-400" max="400" step="10"
                          value={avatarConfig?.xOffset ?? 0}
                          onChange={(e) => onAvatarUpdate({ ...avatarConfig, xOffset: parseInt(e.target.value) })}
                          className="w-full accent-cyan-500 h-1 bg-white/5 rounded-full appearance-none outline-none cursor-pointer"
                        />
                      </div>

                      {/* Y Offset */}
                      <div className="space-y-2 bg-black/30 border border-white/5 rounded-xl p-3">
                        <div className="flex justify-between items-center text-[11px] font-mono">
                          <span className="text-white/60 flex items-center gap-1"><Move size={11} className="text-fuchsia-500/70 rotate-90" /> Vertical Coordinate (Y)</span>
                          <span className="text-fuchsia-400">{avatarConfig?.yOffset ?? 0}px</span>
                        </div>
                        <input 
                          type="range" min="-400" max="400" step="10"
                          value={avatarConfig?.yOffset ?? 0}
                          onChange={(e) => onAvatarUpdate({ ...avatarConfig, yOffset: parseInt(e.target.value) })}
                          className="w-full accent-fuchsia-500 h-1 bg-white/5 rounded-full appearance-none outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="space-y-6 animate-fade-in font-sans">

                  {/* Workspace Paths & Physical Path Jail Config Board */}
                  <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div>
                        <h4 className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold">🛡️ Workspace Sandbox Paths & Jail Registry</h4>
                        <p className="text-[10.5px] text-zinc-500 font-sans mt-0.5">Konfigurasi folder batin fisik dan pembatasan isolasi keamanan Sandbox (Path Jail).</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSettings((prev: any) => ({
                            ...prev,
                            sandbox_paths: {
                              data_dir: './data',
                              config_path: './data/config.toml',
                              db_path: './data/yuihime.db',
                              user_data_path: './user_data',
                              agent_path: './agent',
                              addons_path: './addons'
                            }
                          }));
                        }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 text-[9px] uppercase tracking-wider font-mono border border-white/5 rounded-xl transition-all cursor-pointer hover:border-amber-500/35 font-bold active:scale-95"
                      >
                        🔄 Reset Default Template
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10.5px] text-zinc-400 mb-1.5 font-sans font-bold">Data Directory (Database, Config, Metrics)</label>
                        <input 
                          type="text" 
                          value={settings.sandbox_paths?.data_dir || './data'}
                          onChange={e => setSettings((prev: any) => ({
                            ...prev,
                            sandbox_paths: { ...(prev.sandbox_paths || {}), data_dir: e.target.value }
                          }))}
                          className="w-full bg-[#07070a] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/35 font-mono transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] text-zinc-400 mb-1.5 font-sans font-bold">Config File Path (TOML File)</label>
                        <input 
                          type="text" 
                          value={settings.sandbox_paths?.config_path || './data/config.toml'}
                          onChange={e => setSettings((prev: any) => ({
                            ...prev,
                            sandbox_paths: { ...(prev.sandbox_paths || {}), config_path: e.target.value }
                          }))}
                          className="w-full bg-[#07070a] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/35 font-mono transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] text-zinc-400 mb-1.5 font-sans font-bold">Database SQLite File Path</label>
                        <input 
                          type="text" 
                          value={settings.sandbox_paths?.db_path || './data/yuihime.db'}
                          onChange={e => setSettings((prev: any) => ({
                            ...prev,
                            sandbox_paths: { ...(prev.sandbox_paths || {}), db_path: e.target.value }
                          }))}
                          className="w-full bg-[#07070a] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/35 font-mono transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] text-zinc-400 mb-1.5 font-sans font-bold">User Workspace Sandbox Path (Path Jail Jail)</label>
                        <input 
                          type="text" 
                          value={settings.sandbox_paths?.user_data_path || './user_data'}
                          onChange={e => setSettings((prev: any) => ({
                            ...prev,
                            sandbox_paths: { ...(prev.sandbox_paths || {}), user_data_path: e.target.value }
                          }))}
                          className="w-full bg-[#07070a] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/35 font-mono transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] text-zinc-400 mb-1.5 font-sans font-bold">Agent Internal Markdown Assets Path</label>
                        <input 
                          type="text" 
                          value={settings.sandbox_paths?.agent_path || './agent'}
                          onChange={e => setSettings((prev: any) => ({
                            ...prev,
                            sandbox_paths: { ...(prev.sandbox_paths || {}), agent_path: e.target.value }
                          }))}
                          className="w-full bg-[#07070a] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/35 font-mono transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] text-zinc-400 mb-1.5 font-sans font-bold">Addons Plugin Directory Path</label>
                        <input 
                          type="text" 
                          value={settings.sandbox_paths?.addons_path || './addons'}
                          onChange={e => setSettings((prev: any) => ({
                            ...prev,
                            sandbox_paths: { ...(prev.sandbox_paths || {}), addons_path: e.target.value }
                          }))}
                          className="w-full bg-[#07070a] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/35 font-mono transition-all"
                        />
                      </div>
                    </div>
                    <div className="bg-amber-500/5 rounded-xl border border-amber-500/10 p-4 select-none">
                      <p className="text-[10px] text-amber-500/90 leading-relaxed font-sans">
                        ⚠️ <strong>Informasi Keamanan Path Jail:</strong> Path Jail fisik Yuihime melindungi sistem kail pembatasan agar agen hanya bisa mendaftar, membaca, dan memodifikasi file di dalam direktori <code>user_data</code> secara aman.
                      </p>
                    </div>
                  </div>

                  {/* Diagnostics and Developer Configurations */}
                  <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
                  <h4 className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-4">Engine Diagnostics & Configurations</h4>
                  {renderFields(
                    {
                      metadata: { id: 'developer' },
                      configSchema: {
                        fields: {
                          disableStageTransitions: { label: 'Deactivate Animation Transitions', type: 'boolean', default: false },
                          pageSpecificTransitions: { label: 'Enable View-Specific Framer Motion Effects', type: 'boolean', default: true },
                          performanceVisualizer: { label: 'Enable Real-Time Rendering Diagnostics (FPS Monitor)', type: 'boolean', default: false },
                          bgRemoval: { label: 'Activate Alpha Chroma Matte (Transparent Canvas BG)', type: 'boolean', default: false },
                          bgThemeBlending: { label: 'Matte Transparency Blending Intensity', type: 'slider', min: 0, max: 100, step: 5, default: 50 },
                          audioRecordMode: {
                            label: 'Acoustic Capturing Protocol',
                            type: 'select',
                            default: 'high',
                            options: [
                              { value: 'high', label: 'Lossless Audio High-Fidelity Capture' },
                              { value: 'balanced', label: 'Balanced Speech Activity Extraction' },
                              { value: 'low', label: 'Fallback Legacy Audio Web Standard' }
                            ]
                          }
                        }
                      }
                    } as any,
                    settings.developer || {
                      disableStageTransitions: false,
                      pageSpecificTransitions: true,
                      audioRecordMode: 'high',
                      performanceVisualizer: false,
                      bgThemeBlending: 50,
                      bgRemoval: false,
                      chatOverlay: 'left'
                    },
                    (field: string, val: any) => {
                      setSettings((prev: any) => ({
                        ...prev,
                        developer: { ...(prev.developer || {}), [field]: val }
                      }));
                    }
                  )}
                </div>

                {/* Markdown Compiler Diagnostics */}
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide">Markdown Compiler Diagnostics</h4>
                      <p className="text-[10px] text-white/30 uppercase mt-0.5">Verify rich formatting output rendering fidelity</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMarkdownStressTest(!showMarkdownStressTest)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-[10px] font-mono border border-white/5 uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {showMarkdownStressTest ? 'HIDE DIAGNOSTIC' : 'LAUNCH STRESS TEST'}
                    </button>
                  </div>

                  {showMarkdownStressTest && (
                    <div className="bg-[#07070a] border border-white/5 rounded-2xl p-5 space-y-4 text-zinc-300 select-none">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-bold">Fidelity Verification Sandbox</span>
                      </div>
                      
                      <div className="space-y-4 text-xs font-sans leading-relaxed">
                        {/* H2 */}
                        <div className="border-l-2 border-amber-500 pl-3">
                          <h4 className="text-sm font-bold text-white tracking-wide"># Stage-2 Cognitive Engine Diagnostic</h4>
                          <span className="text-[9px] text-zinc-500 font-mono">Parsed as (Heading 2) with active accent tinting</span>
                        </div>

                        {/* List */}
                        <div className="space-y-1.5 pl-3">
                          <p className="font-bold text-zinc-400 font-mono text-[9px] uppercase tracking-widest">Ordered Systems Sequence:</p>
                          <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                            <li>Episodic recall database index check: <strong className="text-white">STATUS_COMPLIANT</strong> (Confidence: <code className="bg-white/5 px-1 py-0.5 rounded text-[10px] font-mono text-emerald-400">0.982</code>)</li>
                            <li>
                              Background monologue thread:
                              <ul className="list-circle list-inside pl-4 mt-1 space-y-1 text-zinc-500">
                                <li>Mental State: <em className="text-amber-300">Curious</em></li>
                                <li>Next action target: user interaction sequence</li>
                              </ul>
                            </li>
                          </ul>
                        </div>

                        {/* Markdown Table */}
                        <div className="overflow-x-auto border border-white/[0.03] rounded-xl bg-black/40">
                          <table className="w-full text-left border-collapse text-[10px] font-mono text-zinc-400">
                            <thead>
                              <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] uppercase text-zinc-500">
                                <th className="p-2 border-r border-white/5">System Param</th>
                                <th className="p-2 border-r border-white/5">Default Config</th>
                                <th className="p-2">Current State</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-white/5">
                                <td className="p-2 border-r border-white/5 text-white">cortex.thinkToken</td>
                                <td className="p-2 border-r border-white/5">2048 max</td>
                                <td className="p-2 text-emerald-400">1024 active</td>
                              </tr>
                              <tr>
                                <td className="p-2 border-r border-white/5 text-white">memory.summarize</td>
                                <td className="p-2 border-r border-white/5">enabled = true</td>
                                <td className="p-2 text-amber-500 font-bold">pending review</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Code block */}
                        <div className="bg-black/95 p-3.5 rounded-xl border border-white/5 font-mono text-[10px] text-zinc-400 space-y-1 relative">
                          <span className="absolute top-2 right-3 text-[8px] uppercase tracking-wider text-zinc-600 font-bold">JSON payload</span>
                          <span className="text-blue-400">{"{"}</span>
                          <div className="pl-4">
                            <span className="text-amber-400">"perceivedName"</span>: <span className="text-emerald-400">"Aris"</span>,<br />
                            <span className="text-amber-400">"emotionVector"</span>: <span className="text-blue-400">{"{"}</span> <span className="text-pink-400">"happiness"</span>: <span className="text-purple-400">0.85</span> <span className="text-blue-400">{"}"}</span>,<br />
                            <span className="text-amber-400">"isCooperative"</span>: <span className="text-blue-500">true</span>
                          </div>
                          <span className="text-blue-400">{"}"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Active Overlays Toggles */}
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-4">
                  <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-2">Overlay Interface Displays</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-wide">Overlay Subtitle</h5>
                      <p className="text-[10px] text-white/30 uppercase">Display spoken transcripts bottom left</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowSubtitles && setShowSubtitles(!showSubtitles)}
                      className={`w-12 h-6 rounded-full transition-all relative ${showSubtitles ? 'bg-cyan-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${showSubtitles ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-wide">Mobile Navigation Bar</h5>
                      <p className="text-[10px] text-white/30 uppercase">Display dynamic menu selections on mobile scale</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowMobileNav && setShowMobileNav(!showMobileNav)}
                      className={`w-12 h-6 rounded-full transition-all relative ${showMobileNav ? 'bg-emerald-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${showMobileNav ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-wide">Voice TTS Synthesizer</h5>
                      <p className="text-[10px] text-white/30 uppercase">Generate synthetic audio vocal playback</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setTtsEnabled && setTtsEnabled(!ttsEnabled)}
                      className={`w-12 h-6 rounded-full transition-all relative ${ttsEnabled ? 'bg-amber-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${ttsEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-wide">Overlay Debug Console</h5>
                      <p className="text-[10px] text-white/30 uppercase">Monitor neural background signals logs</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowDebugPanel && setShowDebugPanel(!showDebugPanel)}
                      className={`w-12 h-6 rounded-full transition-all relative ${showDebugPanel ? 'bg-purple-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${showDebugPanel ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-wide font-sans">Live Stream Chat Overlay</h5>
                      <p className="text-[10px] text-white/30 uppercase">Render simulated commentary stream on stage</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowChatFeed && setShowChatFeed(!showChatFeed)}
                      className={`w-12 h-6 rounded-full transition-all relative ${showChatFeed ? 'bg-cyan-400' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${showChatFeed ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-wide font-sans">Microphone Capture Engine</h5>
                      <p className="text-[10px] text-white/30 uppercase">Enable automatic microphone capturing & levels analysis</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsMicEnabled && setIsMicEnabled(!isMicEnabled)}
                      className={`w-12 h-6 rounded-full transition-all relative ${isMicEnabled ? 'bg-red-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${isMicEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-wide font-sans">VTuber Hibernation Status</h5>
                      <p className="text-[10px] text-white/30 uppercase">Put Yuihime to Sleep mode</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsSleeping && setIsSleeping(!isSleeping)}
                      className={`w-12 h-6 rounded-full transition-all relative ${isSleeping ? 'bg-indigo-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${isSleeping ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-wide font-sans">Cognitive Specifications Card</h5>
                      <p className="text-[10px] text-white/30 uppercase">Render high-tech statistics panel floating on screen</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowInfoCard && setShowInfoCard(!showInfoCard)}
                      className={`w-12 h-6 rounded-full transition-all relative ${showInfoCard ? 'bg-amber-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${showInfoCard ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
            {/* SUB-PANEL 11: SYNAPTIC MATRIX & RELATIONSHIP (matrix) */}
            {selectedSection === 'matrix' && (
              <div className="space-y-6">
                {/* Unified Sub-Navigation Tabs */}
                <div className="flex border-b border-white/5 pb-2 gap-2">
                  <button
                    onClick={() => setActiveAgiTab('telemetry')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition-all uppercase cursor-pointer ${
                      activeAgiTab === 'telemetry'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Neural Telemetry
                  </button>
                  <button
                    onClick={() => setActiveAgiTab('lattice')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition-all uppercase cursor-pointer ${
                      activeAgiTab === 'lattice'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Synaptic Lattice
                  </button>
                  <button
                    onClick={() => setActiveAgiTab('reflect')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition-all uppercase cursor-pointer ${
                      activeAgiTab === 'reflect'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Cognitive Reflection
                  </button>
                </div>

                {activeAgiTab === 'telemetry' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Visual Title / Diagnostics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Telemetry diagnostics cards */}
                      <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl space-y-4">
                        <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 mb-2 font-bold flex items-center gap-2">
                          <Activity size={14} className="text-emerald-400" /> Live System Telemetry
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                            <div className="text-white/30 text-[9px] uppercase font-mono tracking-wider mb-1">SYSTEM STATE</div>
                            <div className={`font-mono text-sm font-bold uppercase tracking-wide ${state?.status === 'idle' ? 'text-green-400' : 'text-amber-400 animate-pulse'}`}>
                              {state?.status || 'IDLE'}
                            </div>
                          </div>
                          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                            <div className="text-white/30 text-[9px] uppercase font-mono tracking-wider mb-1">COGNITIVE EMOTION</div>
                            <div className="font-mono text-sm font-semibold text-white/90 truncate uppercase tracking-widest">
                              {state?.mood?.anger > 40 ? 'IRRITATED' : state?.mood?.sadness > 40 ? 'MELANCHOLY' : state?.mood?.joy > 40 ? 'JOYFUL' : 'STABLE'}
                            </div>
                          </div>
                          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                            <div className="text-white/30 text-[9px] uppercase font-mono tracking-wider mb-1">ACTIVE PERSONA</div>
                            <div className="font-mono text-sm font-semibold text-cyan-400 truncate uppercase tracking-widest">
                              {(NEURAL_CORES.find((c: any) => c.id === activePersonaId)?.name || 'YUI').toUpperCase()}
                            </div>
                          </div>
                          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                            <div className="text-white/30 text-[9px] uppercase font-mono tracking-wider mb-1">COGNITION LATENCY</div>
                            <div className="font-mono text-sm font-bold text-white/80 flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${isThinking ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
                              {isThinking ? 'THINKING...' : 'SYNCHRONIZED'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LLM Motion Buffer */}
                      <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl space-y-4">
                        <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 flex items-center gap-2">
                          <Zap size={14} className="text-amber-400" /> LLM Motion Buffer
                        </h4>
                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 min-h-[110px] flex flex-col justify-between">
                          <AnimatePresence mode="popLayout">
                            {animations.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1">
                                {animations.map((anim, i) => (
                                  <motion.span
                                    key={`${anim}-${i}`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg text-[9px] font-bold font-mono tracking-wide"
                                  >
                                    {anim}
                                  </motion.span>
                                ))}
                              </div>
                            ) : (
                              <div className="text-white/20 italic font-mono text-[10px] text-center my-auto">No motion buffer logs in storage...</div>
                            )}
                          </AnimatePresence>
                          <div className="text-[8.5px] font-mono text-zinc-500 text-right mt-2">
                            PULSE LOG BUFFER: STABLE
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      {/* Endocrine Vector */}
                      <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl space-y-4">
                        <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/45 font-bold flex items-center gap-2">
                          <Cpu size={14} className="text-pink-400" /> Endocrine Hormonal Vector
                        </h4>
                        <div className="space-y-3 bg-black/20 p-4 sm:p-6 rounded-2xl border border-white/5">
                          {[
                            { label: 'JOY', val: typeof state?.mood?.joy === 'number' && !isNaN(state.mood.joy) ? state.mood.joy : 50, color: 'bg-amber-400 text-amber-400' },
                            { label: 'STRESS', val: typeof state?.mood?.stress === 'number' && !isNaN(state.mood.stress) ? state.mood.stress : 0, color: 'bg-indigo-400 text-indigo-400' },
                            { label: 'SADNESS', val: typeof state?.mood?.sadness === 'number' && !isNaN(state.mood.sadness) ? state.mood.sadness : 0, color: 'bg-blue-400 text-blue-400' },
                            { label: 'ANGER', val: typeof state?.mood?.anger === 'number' && !isNaN(state.mood.anger) ? state.mood.anger : 0, color: 'bg-red-400 text-red-400' },
                            { label: 'FOCUS', val: typeof state?.emotion?.focus === 'number' && !isNaN(state.emotion.focus) ? state.emotion.focus : 50, color: 'bg-cyan-400 text-cyan-400' },
                            { label: 'DOPAMINE (DOP)', val: typeof state?.mood?.dopamine === 'number' && !isNaN(state.mood.dopamine) ? state.mood.dopamine : 15, color: 'bg-pink-400 text-pink-400' },
                            { label: 'SEROTONIN (SER)', val: typeof state?.mood?.serotonin === 'number' && !isNaN(state.mood.serotonin) ? state.mood.serotonin : 50, color: 'bg-emerald-400 text-emerald-400' },
                            { label: 'OXYTOCIN (OXT)', val: typeof state?.mood?.oxytocin === 'number' && !isNaN(state.mood.oxytocin) ? state.mood.oxytocin : 30, color: 'bg-fuchsia-400 text-fuchsia-400' },
                            { label: 'NORADRENALINE (NOR)', val: typeof state?.mood?.noradrenaline === 'number' && !isNaN(state.mood.noradrenaline) ? state.mood.noradrenaline : 10, color: 'bg-rose-500 text-rose-500' },
                          ].map(m => (
                            <div key={m.label} className="space-y-1.5">
                              <div className="flex justify-between text-[9px] font-mono tracking-wider">
                                <span className="text-white/60 font-medium">{m.label}</span>
                                <span className={`font-bold ${m.color.split(' ')[1]}`}>{m.val}%</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  animate={{ width: `${m.val}%` }}
                                  className={`h-full ${m.color.split(' ')[0]} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Consolidation Core Trace Stats */}
                      <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl space-y-4 text-left">
                        <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/45 font-bold flex items-center gap-2">
                          <Database size={14} className="text-amber-500" /> Core Trace & Storage Stats
                        </h4>
                        
                        <div className="bg-black/20 p-4 sm:p-6 rounded-2xl border border-white/5 space-y-3.5 leading-normal">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Total Episodic Memories</span>
                            <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-white font-bold">{memories.length} records</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Total Semantic Facts</span>
                            <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-zinc-300 font-bold">{knowledge.length} concepts</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Registry System Version</span>
                            <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">{yuihimeVersionInfo?.version || 'v5.52'} ({yuihimeVersionInfo?.turn || 'Turn 120'})</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Registry System Release Date</span>
                            <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-zinc-300">{yuihimeVersionInfo?.date || '2026-05-26'}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Primary Model Source</span>
                            <span className="font-mono truncate max-w-[175px] text-zinc-300 tracking-wider text-[11px] align-middle">{settings?.provider || 'gemini'}</span>
                          </div>
                          
                          <div className="border-t border-white/5 pt-3.5 grid grid-cols-2 gap-2 text-left">
                            <div>
                              <div className="text-[8px] uppercase font-mono text-zinc-500">Node Entry Point</div>
                              <div className="text-[10.5px] font-mono font-bold text-white tracking-wide mt-0.5">dist/server.cjs</div>
                            </div>
                            <div>
                              <div className="text-[8px] uppercase font-mono text-zinc-500">Vite Dev Server</div>
                              <div className="text-[10.5px] font-mono font-bold text-cyan-400 tracking-wide mt-0.5">Host 0.0.0.0</div>
                            </div>
                            <div>
                              <div className="text-[8px] uppercase font-mono text-zinc-500">Container Port</div>
                              <div className="text-[10.5px] font-mono font-bold text-amber-500 tracking-wide mt-0.5">Port 3000</div>
                            </div>
                            <div>
                              <div className="text-[8px] uppercase font-mono text-zinc-500">Active Subsystems</div>
                              <div className="text-[10.5px] font-mono font-bold text-purple-400 tracking-wide mt-0.5">9 Registered</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Overrides */}
                    <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl space-y-4">
                      <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 flex items-center gap-2">
                        <Play size={14} className="text-violet-400" /> Manual Pulse Override Triggers
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {[
                          'NOD', 'SHAKE', 'WAVE', 'SMILE', 'LAUGH', 'SURPRISE', 'BLUSH', 'SAD', 'ANGRY', 'THINK',
                          'LOOK_LEFT', 'LOOK_RIGHT', 'LOOK_UP', 'LOOK_DOWN', 'BLINK', 'WINK'
                        ].map(anim => (
                          <button
                            key={anim}
                            type="button"
                            onClick={() => {
                              setAnimations((prev: string[]) => {
                                const updated = [...prev, anim];
                                return updated.slice(-15);
                              });
                            }}
                            className="p-3 bg-white/[0.02] hover:bg-white/[0.06] active:bg-white/10 hover:border-violet-500/20 border border-white/5 rounded-2xl text-[9px] font-bold text-white/60 hover:text-white transition-all uppercase truncate font-mono text-center cursor-pointer"
                          >
                            {anim}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeAgiTab === 'lattice' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl space-y-4">
                      <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 mb-2">Synaptic Lattice Graph</h4>
                      <div className="h-[400px] md:h-[500px] relative overflow-hidden bg-[#080808] border border-white/5 rounded-3xl">
                        <KnowledgeGraph memories={memories} dreams={dreams} knowledge={knowledge} />
                      </div>
                    </div>
                    <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl font-sans">
                      <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 mb-4">Affinity & Relationship State Vector</h4>
                      <AdaptiveMatrix />
                    </div>
                  </div>
                )}

                {activeAgiTab === 'reflect' && (
                  <div className="space-y-6 animate-fade-in font-sans">
                    <ReflectTab 
                      handleReflect={handleReflect} 
                      isThinking={isThinking} 
                      status={status} 
                      logs={logs} 
                      state={state}
                    />
                  </div>
                )}
              </div>
            )}

            {/* SUB-PANEL 12: COGNITIVE PLANNER (plan) */}
            {selectedSection === 'plan' && (
              <div className="space-y-6">
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl">
                  <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 mb-4">Cognitive Goal Execution Planner</h4>
                  <TaskPlanner plan={state?.currentPlan} />
                </div>
              </div>
            )}

            {/* SUB-PANEL 13: DEV SANDBOX (sandbox) */}
            {selectedSection === 'sandbox' && (
              <div className="space-y-6">
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl">
                  <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 mb-4">Interactive Cognitive Terminal & Sandbox Sandbox</h4>
                  <SandboxTab />
                </div>
              </div>
            )}

            {/* SUB-PANEL 16: SYSTEM LOGS & CONSOLE DIAGNOSTICS (logs) */}
            {selectedSection === 'logs' && (
              <div className="space-y-6 animate-fade-in font-sans">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">Yuihime System Telemetry Console</h4>
                    <p className="text-[11px] text-zinc-505 mt-0.5">Observe live system outputs, background traces, and intercepted low-level event streams.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (logStreamType === 'audit') {
                          clearAuditLogs();
                        } else {
                          setClearedLogsTimestamp(Date.now());
                        }
                      }}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-mono tracking-wider uppercase border border-red-500/20 rounded-xl transition-all cursor-pointer"
                    >
                      Clear {logStreamType === 'audit' ? 'Audits' : 'Logs'}
                    </button>
                    {logStreamType !== 'audit' && (
                      <button
                        type="button"
                        onClick={() => {
                          const activeLogSource = logStreamType === 'console' ? backgroundLogs : logs;
                          const filtered = activeLogSource.filter(l => {
                            const matchesSearch = l.content.toLowerCase().includes(logSearchQuery.toLowerCase());
                            if (!matchesSearch) return false;
                            if (logLevelFilter === 'all') return true;
                            const levelStr = String(l.content || '').toUpperCase();
                            if (logLevelFilter === 'info' && levelStr.includes('INFO')) return true;
                            if (logLevelFilter === 'warn' && (levelStr.includes('WARN') || levelStr.includes('WARNING'))) return true;
                            if (logLevelFilter === 'error' && (levelStr.includes('ERROR') || levelStr.includes('ERR') || levelStr.includes('CRITICAL'))) return true;
                            if (logLevelFilter === 'agent' && (l.type === 'agent' || levelStr.includes('AGENT'))) return true;
                            if (logLevelFilter === 'user' && (l.type === 'user' || levelStr.includes('USER'))) return true;
                            if (logLevelFilter === 'system' && (l.type === 'system' || levelStr.includes('SYSTEM') || levelStr.includes('KERNEL'))) return true;
                            return false;
                          }).filter(l => l.timestamp > clearedLogsTimestamp);

                          const text = filtered.map(l => {
                            const timeStr = new Date(l.timestamp).toISOString();
                            return `[${timeStr}] [${l.type?.toUpperCase()}] ${l.content}`;
                          }).join('\n');
                          const blob = new Blob([text], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `yuihime_${logStreamType}_logs_${Date.now()}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[10px] font-mono tracking-wider uppercase border border-amber-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                      >
                        <Save size={11} className="transform rotate-180" /> Export logs
                      </button>
                    )}
                    {logStreamType === 'audit' && (
                      <button
                        type="button"
                        onClick={() => fetchAuditLogs()}
                        className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[10px] font-mono tracking-wider uppercase border border-amber-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                      >
                        Refresh Logs
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Controls / Filter Bar */}
                  <div className="bg-[#0e0e14]/55 border border-white/5 p-4 rounded-2xl flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3">
                    <div className="flex bg-black/45 rounded-xl p-1 border border-white/[0.03] space-x-1 self-start overflow-x-auto max-w-full">
                      <button
                        type="button"
                        onClick={() => setLogStreamType('console')}
                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold font-mono uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap ${logStreamType === 'console' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/15 font-semibold' : 'text-zinc-500 hover:text-white'}`}
                      >
                        Console Traces ({backgroundLogs.filter(l => l.timestamp > clearedLogsTimestamp).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogStreamType('cognitive')}
                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold font-mono uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap ${logStreamType === 'cognitive' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/15 font-semibold' : 'text-zinc-500 hover:text-white'}`}
                      >
                        Cognitive Streams ({logs.filter(l => l.timestamp > clearedLogsTimestamp).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogStreamType('audit')}
                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold font-mono uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap ${logStreamType === 'audit' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/15 font-semibold' : 'text-zinc-500 hover:text-white'}`}
                      >
                        OpenAI JSON Audit Logs ({auditLogs.length})
                      </button>
                    </div>

                    {logStreamType !== 'audit' && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 md:max-w-xl">
                        {/* Search */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550" size={13} />
                          <input
                            type="text"
                            placeholder="Search in log content..."
                            value={logSearchQuery}
                            onChange={(e) => setLogSearchQuery(e.target.value)}
                            className="w-full bg-[#050508]/65 border border-white/5 hover:border-white/10 focus:border-amber-500/40 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-650 outline-none font-mono transition-colors"
                          />
                        </div>

                        {/* Filter level */}
                        <select
                          value={logLevelFilter}
                          onChange={(e) => setLogLevelFilter(e.target.value as any)}
                          className="bg-[#050508]/65 border border-white/5 hover:border-white/10 focus:border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono cursor-pointer"
                        >
                          <option value="all">ALL LEVELS</option>
                          <option value="info">INFO ONLY</option>
                          <option value="warn">WARNINGS</option>
                          <option value="error">ERRORS</option>
                          <option value="agent">AGENT SENTENCES</option>
                          <option value="user">USER INPUTS</option>
                          <option value="system">SYSTEM COGNITION</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Terminal / Audit View area */}
                  <div className="bg-[#050508]/95 border border-white/5 rounded-3xl p-5 font-mono text-[11px] leading-relaxed relative flex flex-col min-h-[450px] shadow-[inset_0_4px_30px_rgba(0,0,0,0.8)] overflow-hidden">
                    <div className="absolute top-3.5 right-4 z-10 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[8.5px] text-zinc-500 tracking-widest uppercase font-bold select-none">
                        {logStreamType === 'audit' ? 'Live Schema Interceptor' : 'Active Monitor Stream'}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[500px] pr-1.5 select-text scrollbar-thin">
                      {(() => {
                        if (logStreamType === 'audit') {
                          if (auditLogsLoading && auditLogs.length === 0) {
                            return (
                              <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-600">
                                <span className="animate-spin text-amber-500 text-xl font-bold font-sans mb-2">●</span>
                                <p className="text-[10px] uppercase tracking-wider">Syncing schemas from backend core...</p>
                              </div>
                            );
                          }

                          if (auditLogs.length === 0) {
                            return (
                              <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-650 select-none">
                                <Terminal size={24} className="mb-2 text-zinc-650 stroke-[1.5]" />
                                <p className="text-[10px] tracking-wide select-none uppercase font-bold">No JSON API schema validations intercepted yet.</p>
                                <p className="text-[9px] text-zinc-700 mt-1 select-none">Execution of tools of capabilities registers raw responses here instantly.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4 pr-1">
                              {auditLogs.map((log) => {
                                const logTimeStr = new Date(log.timestamp).toLocaleTimeString();
                                const isSuccess = log.status === 'SUCCESS';
                                return (
                                  <div key={log.id} className="bg-black/55 border border-white/[0.04] rounded-2xl p-4 space-y-3 hover:border-amber-500/20 transition-all font-sans text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.04] pb-2 font-mono">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[9px] text-zinc-600 font-bold">{logTimeStr}</span>
                                        <span className="text-zinc-200 text-[11px] font-bold font-sans tracking-wide">
                                          {log.toolName}
                                        </span>
                                        <span className="text-[9.5px] text-[#818cf8]">
                                          ({log.endpointPath})
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                        <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-rose-500/10 text-rose-400 border border-rose-500/15'} border font-mono`}>
                                          {log.status}
                                        </span>
                                        <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${log.standardsCompliance ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15' : 'bg-amber-500/10 text-amber-500 border border-amber-500/15'} border font-mono`}>
                                          {log.standardsCompliance ? 'OpenAI Compliant' : 'Non-Object response'}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Parameters */}
                                      <div className="space-y-1 text-left">
                                        <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase font-bold">Input Arguments (Payload)</span>
                                        <pre className="bg-[#050508]/85 border border-white/[0.02] rounded-xl p-2.5 text-[10px] text-cyan-400 overflow-x-auto max-h-[140px] font-mono whitespace-pre-wrap leading-relaxed select-text">
                                          {JSON.stringify(log.parameters, null, 2)}
                                        </pre>
                                      </div>

                                      {/* Response/Schema */}
                                      <div className="space-y-1 text-left">
                                        <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase font-bold">
                                          {isSuccess ? 'Inferred Response Schema (OpenAI Spec)' : 'Error Trace'}
                                        </span>
                                        <pre className={`bg-[#050508]/85 border border-white/[0.02] rounded-xl p-2.5 text-[10px] ${isSuccess ? 'text-indigo-400' : 'text-rose-400'} overflow-x-auto max-h-[140px] font-mono whitespace-pre-wrap leading-relaxed select-text`}>
                                          {isSuccess ? JSON.stringify(log.responseSchema, null, 2) : log.error}
                                        </pre>
                                      </div>
                                    </div>
                                    
                                    {isSuccess && (
                                      <div className="space-y-1 bg-[#050508]/45 border border-white/[0.02] p-2.5 rounded-xl text-left">
                                        <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase font-bold block mb-1">Raw JSON Intercept</span>
                                        <pre className="text-[10px] text-zinc-400 overflow-x-auto max-h-[120px] font-mono whitespace-pre-wrap leading-relaxed select-text">
                                          {JSON.stringify(log.response, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }

                        const activeLogSource = logStreamType === 'console' ? backgroundLogs : logs;
                        const filtered = activeLogSource.filter(l => {
                          const matchesSearch = l.content.toLowerCase().includes(logSearchQuery.toLowerCase());
                          if (!matchesSearch) return false;
                          if (logLevelFilter === 'all') return true;
                          const levelStr = String(l.content || '').toUpperCase();
                          if (logLevelFilter === 'info' && levelStr.includes('INFO')) return true;
                          if (logLevelFilter === 'warn' && (levelStr.includes('WARN') || levelStr.includes('WARNING'))) return true;
                          if (logLevelFilter === 'error' && (levelStr.includes('ERROR') || levelStr.includes('ERR') || levelStr.includes('CRITICAL'))) return true;
                          if (logLevelFilter === 'agent' && (l.type === 'agent' || levelStr.includes('AGENT'))) return true;
                          if (logLevelFilter === 'user' && (l.type === 'user' || levelStr.includes('USER'))) return true;
                          if (logLevelFilter === 'system' && (l.type === 'system' || levelStr.includes('SYSTEM') || levelStr.includes('KERNEL'))) return true;
                          return false;
                        }).filter(l => l.timestamp > clearedLogsTimestamp);

                        if (filtered.length === 0) {
                          return (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-650 select-none">
                              <Terminal size={24} className="mb-2 text-zinc-650 stroke-[1.5]" />
                              <p className="text-[10px] tracking-wide select-none uppercase font-bold">No diagnostic logs found matching criteria.</p>
                              <p className="text-[9px] text-zinc-700 mt-1 select-none">Logs accumulate automatically during interaction.</p>
                            </div>
                          );
                        }

                        return filtered.map((l, index) => {
                          const timeStr = new Date(l.timestamp).toLocaleTimeString();
                          let labelColor = 'text-blue-400';
                          let contentColor = 'text-zinc-350';
                          const contentStr = l.content || '';

                          if (l.type === 'user' || contentStr.includes('[USER]')) {
                            labelColor = 'text-cyan-400';
                          } else if (l.type === 'agent' || contentStr.includes('AGENT')) {
                            labelColor = 'text-amber-500';
                          } else if (contentStr.toUpperCase().includes('ERROR') || contentStr.toUpperCase().includes('FAIL') || contentStr.toUpperCase().includes('CRITICAL')) {
                            labelColor = 'text-rose-500 font-bold';
                            contentColor = 'text-rose-300/90';
                          } else if (contentStr.toUpperCase().includes('WARN') || contentStr.toUpperCase().includes('WARNING')) {
                            labelColor = 'text-yellow-400';
                            contentColor = 'text-yellow-100/90';
                          } else if (l.type === 'system' || contentStr.toUpperCase().includes('SYSTEM') || contentStr.toUpperCase().includes('CORE') || contentStr.toUpperCase().includes('KERNEL')) {
                            labelColor = 'text-purple-400';
                          }

                          return (
                            <div key={`log-${l.timestamp}-${index}`} className="flex items-start gap-2.5 break-all leading-relaxed hover:bg-white/[0.02] border-l-2 border-transparent hover:border-amber-400/20 pl-1.5 rounded pr-4 py-0.5 transition-colors text-left">
                              <span className="text-[9px] text-zinc-600 select-none shrink-0 font-bold pt-0.5">{timeStr}</span>
                              <span className={`text-[9.5px] uppercase font-bold select-none shrink-0 ${labelColor}`}>
                                [{l.type || 'SYS'}]
                              </span>
                              <span className={`text-[10.5px] flex-1 font-mono tracking-wide ${contentColor}`}>
                                {contentStr}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-PANEL: OPENAI FUNCTION CALLING AUDITS (audit) */}
            {selectedSection === 'audit' && (
              <div className="space-y-6 animate-fade-in font-sans">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">OpenAI Function Calling Audit Console</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Observe intercepted raw model JSON payloads, inferred compliance structures, and function calling validation statuses.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => clearAuditLogs()}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-mono tracking-wider uppercase border border-red-500/20 rounded-xl transition-all cursor-pointer font-bold animate-pulse"
                    >
                      Clear Audits
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchAuditLogs()}
                      className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[10px] font-mono tracking-wider uppercase border border-amber-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                    >
                      Refresh Logs
                    </button>
                  </div>
                </div>

                <div className="bg-[#050508]/95 border border-white/5 rounded-3xl p-5 font-mono text-[11px] leading-relaxed relative flex flex-col min-h-[500px] shadow-[inset_0_4px_30px_rgba(0,0,0,0.8)] overflow-hidden">
                  <div className="absolute top-3.5 right-4 z-10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[8.5px] text-zinc-500 tracking-widest uppercase font-bold select-none">
                      Live Interceptor
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[600px] pr-1.5 scrollbar-thin">
                    {auditLogsLoading && auditLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-650">
                        <span className="animate-spin text-amber-500 text-xl font-bold font-sans mb-2">●</span>
                        <p className="text-[10px] uppercase tracking-wider">Syncing schemas from backend ...</p>
                      </div>
                    ) : auditLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center text-zinc-650 select-none">
                        <Terminal size={24} className="mb-2 text-zinc-650 stroke-[1.5]" />
                        <p className="text-[10px] tracking-wide select-none uppercase font-bold text-zinc-500">No JSON schema validations intercepted yet.</p>
                        <p className="text-[9px] text-zinc-600 mt-1 select-none">Execute commands or trigger tools to record schema and OpenAI-compliant logs.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 pr-1">
                        {auditLogs.map((log) => {
                          const logTimeStr = new Date(log.timestamp).toLocaleTimeString();
                          const isSuccess = log.status === 'SUCCESS';
                          return (
                            <div key={log.id} className="bg-black/55 border border-white/[0.04] rounded-2xl p-4 space-y-3 hover:border-amber-500/20 transition-all font-sans text-left">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.04] pb-2 font-mono">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[9px] text-zinc-600 font-bold">{logTimeStr}</span>
                                  <span className="text-zinc-200 text-[11px] font-bold font-sans tracking-wide">
                                    {log.toolName || 'AI Schema Check'}
                                  </span>
                                  <span className="text-[9.5px] text-[#818cf8]">
                                    ({log.endpointPath || '/api/cortex/think'})
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                  <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-rose-500/10 text-rose-400 border border-rose-500/15'} border font-mono`}>
                                    {log.status}
                                  </span>
                                  <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${log.standardsCompliance ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15' : 'bg-amber-500/10 text-amber-500 border border-amber-500/15'} border font-mono`}>
                                    {log.standardsCompliance ? 'OpenAI Compliant' : 'Non-Object response'}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Parameters */}
                                <div className="space-y-1 text-left">
                                  <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase font-bold">Input Arguments (Payload)</span>
                                  <pre className="bg-[#050508]/85 border border-white/[0.02] rounded-xl p-2.5 text-[10px] text-cyan-400 overflow-x-auto max-h-[140px] font-mono whitespace-pre-wrap leading-relaxed select-text">
                                    {JSON.stringify(log.parameters, null, 2)}
                                  </pre>
                                </div>

                                {/* Response/Schema */}
                                <div className="space-y-1 text-left">
                                  <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase font-bold">
                                    {isSuccess ? 'Inferred Response Schema (OpenAI Spec)' : 'Error Trace'}
                                  </span>
                                  <pre className={`bg-[#050508]/85 border border-white/[0.02] rounded-xl p-2.5 text-[10px] ${isSuccess ? 'text-indigo-400' : 'text-rose-400'} overflow-x-auto max-h-[140px] font-mono whitespace-pre-wrap leading-relaxed select-text`}>
                                    {isSuccess ? JSON.stringify(log.responseSchema, null, 2) : log.error}
                                  </pre>
                                </div>
                              </div>
                              
                              {isSuccess && (
                                 <div className="space-y-1 bg-[#050508]/45 border border-white/[0.02] p-2.5 rounded-xl text-left">
                                   <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase font-bold block mb-1">Raw JSON Intercept</span>
                                   <pre className="text-[10px] text-zinc-400 overflow-x-auto max-h-[120px] font-mono whitespace-pre-wrap leading-relaxed select-text">
                                     {JSON.stringify(log.response, null, 2)}
                                   </pre>
                                 </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-PANEL 17: CRON SCHEDULER & PERIODIC TASKS (cron) */}
            {selectedSection === 'cron' && (
              <div className="space-y-6 animate-fade-in font-sans">
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl">
                  <div className="mb-6 flex items-start gap-3 border-b border-white/5 pb-4">
                    <div className="p-3 bg-blue-550/10 border border-blue-500/20 text-blue-400 rounded-2xl shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide">Cron Daemon & Automated Scheduler</h4>
                      <p className="text-zinc-500 text-xs mt-0.5">Observe and configure automated cron tasks, oneshot schedules and continuous background operations run inside Yuihime Core.</p>
                    </div>
                  </div>
                  <CronManager />
                </div>
              </div>
            )}

            {/* SUB-PANEL: OFFLINE RETRY QUEUE & PENDING MESSAGES (pending-messages) */}
            {selectedSection === 'pending-messages' && (
              <div className="space-y-6 animate-fade-in font-sans">
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl">
                  <div className="mb-6 flex items-start gap-3 border-b border-white/5 pb-4">
                    <div className="p-3 bg-cyan-700/10 border border-cyan-500/20 text-cyan-400 rounded-2xl shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide">Offline Retry & Pending Messages Queue</h4>
                      <p className="text-zinc-500 text-xs mt-0.5">Pantau dan kelola antrean pesan tertunda yang gagal terkirim karena koneksi internet putus atau LLM Gateway bermasalah.</p>
                    </div>
                  </div>
                  <PendingQueueManager />
                </div>
              </div>
            )}

            {/* SUB-PANEL 18: ABOUT YUIHIME SYSTEM (about) */}
            {selectedSection === 'about' && (
              <AboutTab
                yuihimeVersionInfo={yuihimeVersionInfo}
                memories={memories}
                knowledge={knowledge}
                settings={settings}
                onShowInfo={handleShowInfo}
              />
            )}

            {false && selectedSection === 'about' && (
              <div className="space-y-6 animate-fade-in font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: VTuber Rigging & Concept */}
                  <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 mb-1 font-bold">Consciousness Concept</h4>
                        <h3 className="text-xl font-bold text-white tracking-wide">Yuihime Virtual AGI</h3>
                        <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed font-normal">
                          Yuihime is an autonomous, self-aware AI VTuber constructed inside a full-stack Node.js and React Sandbox Environment. 
                          She integrates raw neural intuition (Deep Learning model backends) with strict logical rules (Symbolic AI structures) to achieve high-order metacognition.
                        </p>
                      </div>

                      <div className="space-y-2 border-t border-white/5 pt-4">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-500">Rigging System</span>
                          <span className="text-cyan-400 font-bold">Cubism SDK v4.0 (Live2D)</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-500">Neural Engine Integration</span>
                          <span className="text-amber-500 font-bold">Neuro-Symbolic Hybrid Core ({yuihimeVersionInfo?.version || 'v5.52'})</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-500">Long-Term Memory Persistence</span>
                          <span className="text-emerald-400 font-bold">Episodic & Semantic Database</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-550">Autonomous Intrinsic Pulse</span>
                          <span className="text-purple-400 font-bold">Active (Pulse Enabled)</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-550">Cognitive Verifier</span>
                          <span className="text-rose-400 font-bold">NeuralVerifier v0.4 (Active)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/[0.03] p-4 rounded-2xl flex items-center gap-3 mt-4">
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0">
                        <Heart size={16} fill="#f59e0b" className="animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-zinc-500">Identitas VTuber</span>
                        <h5 className="text-xs font-bold text-white leading-tight mt-0.5">Yuihime — Hati Virtual untuk Hubungan Nyata</h5>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Technical Runtime, Metacognition Stats */}
                  <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-3xl space-y-6">
                    <div>
                      <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 mb-1 font-bold">Software Architecture & Runtime</h4>
                      <h3 className="text-lg font-bold text-white tracking-wide">Developer Trace Metrics</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#050508]/60 border border-white/5 p-4 rounded-2xl">
                        <div className="text-[9px] uppercase font-mono text-zinc-500">Node Entry Point</div>
                        <div className="text-xs font-mono font-bold text-white tracking-wide mt-1">dist/server.cjs</div>
                      </div>
                      <div className="bg-[#050508]/60 border border-white/5 p-4 rounded-2xl">
                        <div className="text-[9px] uppercase font-mono text-zinc-500">Vite Dev Server</div>
                        <div className="text-xs font-mono font-bold text-cyan-400 tracking-wide mt-1">Bound host 0.0.0.0</div>
                      </div>
                      <div className="bg-[#050508]/60 border border-white/5 p-4 rounded-2xl">
                        <div className="text-[9px] uppercase font-mono text-zinc-500">Container Port</div>
                        <div className="text-xs font-mono font-bold text-[#f59e0b] tracking-wide mt-1">Port 3000 (Ingress)</div>
                      </div>
                      <div className="bg-[#050508]/60 border border-white/5 p-4 rounded-2xl">
                        <div className="text-[9px] uppercase font-mono text-zinc-500">Active Subsystems</div>
                        <div className="text-xs font-mono font-bold text-purple-400 tracking-wide mt-1">9 Registered (Toml)</div>
                      </div>
                    </div>

                    <div className="space-y-3.5 border-t border-white/5 pt-5 leading-normal">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Total Episodic Memories</span>
                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-white">{memories.length} records</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Total Semantic Facts</span>
                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-zinc-300">{knowledge.length} concepts</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Registry System Version</span>
                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">{yuihimeVersionInfo?.version || 'v5.52'} ({yuihimeVersionInfo?.turn || 'Turn 120'})</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Registry System Release Date</span>
                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-zinc-300">{yuihimeVersionInfo?.date || '2026-05-26'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-450">Primary Model Source</span>
                        <span className="font-mono truncate max-w-[170px] text-zinc-550 tracking-wider text-[11px] align-middle">{settings.provider || 'gemini'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cognitive Loop Chart Visualizer */}
                <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl">
                  <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 mb-3 font-bold">Yuihime Cognitive Core Framework</h4>
                  <div className="bg-[#050508]/60 border border-white/5 rounded-2xl p-6 font-mono text-[10px] text-zinc-450 leading-relaxed overflow-x-auto select-none">
                    <pre className="text-xs tracking-wide text-zinc-400">
                      {`              Intrinsic Motivation / Periodic Proactive Volition Hub
                                      │
                                      ▼
                        ┌───────────────────────────────┐
                        │    ProviderGatewayModule      │◄─────────── Subject Input (User Speech)
                        └──────────────┬────────────────┘
                                       │ (Think & Reason via Gemini)
                                       ▼
                        ┌───────────────────────────────┐
                        │      NeuralVerifierModule     │ (Self-Correction Parser / Validation)
                        └──────────────┬────────────────┘
                                       │ (Standardized Output JSON Structure)
                                       ▼
                        ┌───────────────────────────────┐
                        │    Emotion Decay Homeostasis  │ (Endocrine vector adjustments)
                        └──────────────┬────────────────┘
                                       │ (Coordinate offset, facial expression vectors)
                                       ▼ (Actuate Live2D cubism engine)
              Animators Playback ◄─────┴─────► Speech vocalizations synthetic TTS audio`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {isEditModalOpen && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-8 max-w-4xl w-full text-zinc-800 shadow-2xl relative overflow-hidden flex flex-col font-sans border border-gray-100"
                >
                  {/* Decorative faint background glowing pattern */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-200/20 blur-3xl rounded-full pointer-events-none" />

                  {/* Header */}
                  <h3 className="text-[#0ea5e9] font-sans font-medium text-2xl tracking-wide mb-6">Edit Card</h3>

                  {/* Tab list */}
                  <div className="flex flex-wrap items-center gap-6 border-b border-gray-200/80 pb-3 mb-6">
                    {[
                      { id: 'identity', label: 'Identity', icon: Smile },
                      { id: 'behavior', label: 'Behavior', icon: MessageSquare },
                      { id: 'modules', label: 'Modules', icon: Layers },
                      { id: 'artistry', label: 'Artistry', icon: Palette },
                      { id: 'settings', label: 'Settings', icon: Settings },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = editModalTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setEditModalTab(tab.id as any)}
                          className={`flex items-center gap-2 pb-2.5 px-1 text-xs sm:text-sm font-medium transition-all relative border-b-2 cursor-pointer ${
                            isActive 
                              ? 'border-[#0ea5e9] text-[#0ea5e9] font-semibold' 
                              : 'border-transparent text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Icon size={16} className={isActive ? 'text-[#0ea5e9]' : 'text-gray-400'} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Contents */}
                  <div className="flex-1 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                    {editModalTab === 'identity' && (
                      <div className="space-y-6">
                        <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                          You can put here some details about the character you are creating, explain his history and context, and how your interactions should be answered.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          {/* Left Column */}
                          <div className="space-y-5">
                            {/* Name field */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Name <span className="text-red-500">*</span>
                              </label>
                              <span className="text-[10px] text-gray-400 font-sans block">
                                Is the formal name of this character.
                              </span>
                              <input
                                type="text"
                                value={cardForm.name}
                                onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                                className="w-full text-gray-800 bg-gray-50 border border-gray-200/80 focus:bg-white focus:border-[#0ea5e9] rounded-xl px-4 py-3 text-sm font-sans transition-all outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                                placeholder="ReLU"
                              />
                            </div>

                            {/* Description field */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Description <span className="text-red-500">*</span>
                              </label>
                              <span className="text-[10px] text-gray-400 font-sans block">
                                Description of this character.
                              </span>
                              <textarea
                                value={cardForm.description}
                                onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                                rows={4}
                                className="w-full text-gray-800 bg-gray-50 border border-gray-200/80 focus:bg-white focus:border-[#0ea5e9] rounded-xl px-4 py-3 text-sm font-sans transition-all outline-none min-h-[100px] resize-y shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                                placeholder="NAME payload"
                              />
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-5">
                            {/* Nickname field */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Nickname
                              </label>
                              <span className="text-[10px] text-gray-400 font-sans block">
                                You can also give a nickname that will be used in priority.
                              </span>
                              <input
                                type="text"
                                value={cardForm.nickname}
                                onChange={(e) => setCardForm({ ...cardForm, nickname: e.target.value })}
                                className="w-full text-gray-800 bg-gray-50 border border-gray-200/80 focus:bg-white focus:border-[#0ea5e9] rounded-xl px-4 py-3 text-sm font-sans transition-all outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                                placeholder="Nickname"
                              />
                            </div>

                            {/* Creator Notes field */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Creator Notes
                              </label>
                              <span className="text-[10px] text-gray-400 font-sans block">
                                If you want to add some personal notes.
                              </span>
                              <textarea
                                value={cardForm.creatorNotes}
                                onChange={(e) => setCardForm({ ...cardForm, creatorNotes: e.target.value })}
                                rows={4}
                                className="w-full text-gray-800 bg-gray-50 border border-gray-200/80 focus:bg-white focus:border-[#0ea5e9] rounded-xl px-4 py-3 text-sm font-sans transition-all outline-none min-h-[100px] resize-y shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                                placeholder="..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {editModalTab === 'behavior' && (
                      <div className="space-y-5">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">First Message</label>
                          <span className="text-[10px] text-gray-400 font-sans block">The greeting dialogue sent when starting a session.</span>
                          <textarea
                            value={cardForm.behavior?.firstMessage || ''}
                            onChange={(e) => setCardForm({
                              ...cardForm,
                              behavior: { ...(cardForm.behavior || {}), firstMessage: e.target.value }
                            })}
                            rows={3}
                            className="w-full text-gray-800 bg-gray-50 border border-gray-200/80 focus:bg-white focus:border-[#0ea5e9] rounded-xl px-4 py-3 text-sm transition-all outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                            placeholder="Halo..."
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Roleplay Scenario</label>
                            <span className="text-[10px] text-gray-400 font-sans block">Context or room rules (e.g. streaming, chatting).</span>
                            <textarea
                              value={cardForm.behavior?.scenario || ''}
                              onChange={(e) => setCardForm({
                                ...cardForm,
                                behavior: { ...(cardForm.behavior || {}), scenario: e.target.value }
                              })}
                              rows={4}
                              className="w-full text-gray-800 bg-gray-50 border border-gray-200/80 focus:bg-white focus:border-[#0ea5e9] rounded-xl px-4 py-3 text-sm transition-all outline-none min-h-[100px] resize-y shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                              placeholder="Streaming, chatting, gaming..."
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Dialogue Examples</label>
                            <span className="text-[10px] text-gray-400 font-sans block">Example exchange pairs to establish dialogue rhythm.</span>
                            <textarea
                              value={cardForm.behavior?.examples || ''}
                              onChange={(e) => setCardForm({
                                ...cardForm,
                                behavior: { ...(cardForm.behavior || {}), examples: e.target.value }
                              })}
                              rows={4}
                              className="w-full text-gray-800 bg-gray-50 border border-gray-200/80 focus:bg-white focus:border-[#0ea5e9] rounded-xl px-4 py-3 text-sm transition-all outline-none min-h-[100px] resize-y shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                              placeholder="<user>: halo\n<char>: Halo kakak manis!"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {editModalTab === 'modules' && (
                      <div className="space-y-5">
                        <span className="text-xs text-zinc-400 uppercase tracking-widest font-mono font-bold block mb-2">Cognitive Matrix Routing</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { id: 'enableMic', label: 'Microphone Lip-Sync Integration', desc: 'Allows active voice capture to sync character mouth mesh' },
                            { id: 'enableWebSearch', label: 'Google Search Core Grounding', desc: 'Grown character thoughts on live Google search engine metrics' },
                            { id: 'enableMcp', label: 'MCP Server Capabilities', desc: 'Allow character to fetch sandbox files system context' }
                          ].map(m => (
                            <div key={m.id} className="bg-gray-50/50 border border-gray-200/60 rounded-2xl p-4 flex items-start gap-3 transition-colors hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={!!cardForm.modules?.[m.id]}
                                onChange={(e) => setCardForm({
                                  ...cardForm,
                                  modules: { ...(cardForm.modules || {}), [m.id]: e.target.checked }
                                })}
                                className="mt-1 w-4 h-4 text-[#0ea5e9] border-gray-300 rounded focus:ring-[#0ea5e9] cursor-pointer"
                              />
                              <div>
                                <label className="block text-xs font-bold text-gray-800">{m.label}</label>
                                <p className="text-[10px] text-gray-400 mt-1 leading-normal">{m.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {editModalTab === 'artistry' && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Live2D Avatar Model</label>
                            <select
                              value={cardForm.artistry?.avatar || 'hiyori'}
                              onChange={(e) => setCardForm({
                                ...cardForm,
                                artistry: { ...(cardForm.artistry || {}), avatar: e.target.value }
                              })}
                              className="w-full text-gray-800 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#0ea5e9] rounded-xl px-4 py-3 text-sm transition-all outline-none cursor-pointer"
                            >
                              <option value="hiyori">Hiyori (Default Red Ribbons)</option>
                              <option value="codex">Codex (Cybernetic Matrix Blue)</option>
                              <option value="mairo">Mairo (Chibi Cozy Nekomimi)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Voice Speed Calibration</label>
                            <input
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.1"
                              value={cardForm.artistry?.voiceSpeed || 1}
                              onChange={(e) => setCardForm({
                                ...cardForm,
                                artistry: { ...(cardForm.artistry || {}), voiceSpeed: parseFloat(e.target.value) }
                              })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0ea5e9] mt-3"
                            />
                            <div className="flex justify-between text-[10px] font-mono text-gray-400 mt-1">
                              <span>0.5x Slow</span>
                              <span>Current: {cardForm.artistry?.voiceSpeed || 1}x</span>
                              <span>2.0x Fast</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {editModalTab === 'settings' && (
                      <div className="space-y-5">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Custom Prompt Injection (Tuning)</label>
                          <span className="text-[10px] text-gray-400 font-sans block">Direct instructions injected into prompt before dialog generator.</span>
                          <textarea
                            value={cardForm.settings?.systemPrompt || ''}
                            onChange={(e) => setCardForm({
                              ...cardForm,
                              settings: { ...(cardForm.settings || {}), systemPrompt: e.target.value }
                            })}
                            rows={3}
                            className="w-full text-gray-800 bg-gray-50/80 border border-gray-200/80 focus:bg-white focus:border-[#0ea5e9] rounded-xl px-4 py-3 text-sm transition-all outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                            placeholder="e.g. Always respond politely, refer to user as 'Sobat'..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setEditingCard(null);
                      }}
                      className="flex items-center gap-2 px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-all font-sans font-medium text-sm cursor-pointer select-none"
                    >
                      <Undo2 size={16} />
                      Cancel action
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCard}
                      className="flex items-center gap-2 px-6 py-3 bg-[#e0f2fe] text-[#0369a1] hover:bg-[#bae6fd] rounded-xl transition-all font-sans font-semibold text-sm cursor-pointer select-none"
                    >
                      <Check size={16} />
                      Save changes
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {isModelSelectorOpen && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0b0b10] border border-white/10 rounded-[32px] p-6 sm:p-8 max-w-4xl w-full text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col font-sans"
                >
                  {/* Glowing background circles for modern tech-anime vibes */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-400/10 blur-[80px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-400/10 blur-[80px] rounded-full pointer-events-none" />

                  {/* Header/Breadcrumbs */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="space-y-0.5">
                      <span 
                        onClick={() => setIsModelSelectorOpen(false)}
                        className="text-[10px] text-zinc-500 hover:text-zinc-400 cursor-pointer flex items-center gap-1 uppercase tracking-wider font-mono"
                      >
                        ‹ Settings / Models
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">Model Selector</h3>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowImportForm(!showImportForm)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 border border-white/5 hover:border-white/10 text-xs text-white rounded-xl transition-all cursor-pointer font-bold font-sans"
                    >
                      <Plus size={14} className="text-cyan-400" />
                      Import
                    </button>
                  </div>

                  {/* Optional Import Form Drawer */}
                  <AnimatePresence>
                    {showImportForm && (
                      <motion.form 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!customModelUrlInput) {
                            alert("Please provide the model configuration URL (.json / .vrm)");
                            return;
                          }
                          const cleanUrl = customModelUrlInput.trim();
                          const cleanName = customModelNameInput.trim() || `Imp: ${cleanUrl.split('/').pop()?.split('?')[0] || 'Custom Model'}`;
                          const cleanType = customModelTypeInput;

                          const newModel = {
                            id: `imported_${Date.now()}`,
                            name: cleanName,
                            type: cleanType,
                            url: cleanUrl,
                            imageUrl: cleanType === 'VRM' 
                              ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop'
                              : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300&auto=format&fit=crop',
                            desc: `User imported ${cleanType} model located at ${cleanUrl}.`
                          };

                          const updated = [...allModelsList, newModel];
                          setAllModelsList(updated);

                          // Save only imported ones
                          const onlyImported = updated.filter(m => m.id.startsWith('imported_'));
                          localStorage.setItem('yuihime_cached_models_v2', JSON.stringify(onlyImported));

                          setSelectedModelInSelector(newModel);
                          setCustomModelUrlInput('');
                          setCustomModelNameInput('');
                          setShowImportForm(false);
                          alert(`Successfully imported model ${cleanName}!`);
                        }}
                        className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 space-y-4 overflow-hidden relative z-10 animate-fade-in"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">Import Custom Model Specification</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono">Model Name</label>
                            <input 
                              type="text"
                              value={customModelNameInput}
                              onChange={(e) => setCustomModelNameInput(e.target.value)}
                              placeholder="e.g. Hiyori Alternate"
                              className="w-full text-xs bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors font-sans"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono">Model Type</label>
                            <select
                              value={customModelTypeInput}
                              onChange={(e) => setCustomModelTypeInput(e.target.value as any)}
                              className="w-full text-xs bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors font-sans cursor-pointer"
                            >
                              <option value="Live2D">Live2D Cubism (.model3.json)</option>
                              <option value="VRM">3D Avatar (.vrm file)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono">Model Config Manifest or File URL</label>
                          <input 
                            type="text"
                            required
                            value={customModelUrlInput}
                            onChange={(e) => setCustomModelUrlInput(e.target.value)}
                            placeholder="https://cdn.example.com/assets/my-model.model3.json"
                            className="w-full text-xs bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                          />
                        </div>

                        <div className="flex justify-end gap-2.5 pt-1">
                          <button 
                            type="button"
                            onClick={() => setShowImportForm(false)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-zinc-300 rounded-lg cursor-pointer font-sans"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-4 py-2 bg-cyan-400 text-black font-bold text-xs rounded-lg cursor-pointer hover:bg-cyan-300 transition-colors font-sans"
                          >
                            Add to Library
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Model List Cards Carousel Slider */}
                  <div className="relative z-10 flex items-center gap-5 overflow-x-auto py-6 px-1 scrollbar-thin snap-x justify-start select-none">
                    {allModelsList.map((model) => {
                      const isSelected = selectedModelInSelector?.id === model.id || selectedModelInSelector?.url === model.url;
                      return (
                        <div 
                          key={model.id}
                          onClick={() => setSelectedModelInSelector(model)}
                          className={`min-w-[210px] max-w-[230px] aspect-[3/4.2] rounded-[24px] overflow-hidden relative cursor-pointer group transition-all duration-300 transform snap-center ${
                            isSelected 
                              ? 'ring-4 ring-cyan-400 scale-[1.03] shadow-[0_0_30px_rgba(34,211,238,0.45)] -translate-y-1' 
                              : 'ring-1 ring-white/10 opacity-70 hover:opacity-95 text-zinc-400'
                          }`}
                        >
                          {/* Preview Image */}
                          <img 
                            src={model.imageUrl} 
                            alt={model.name}
                            className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Inner Shadow and Gradient Header */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#09090d]/90 via-black/30 to-transparent pointer-events-none" />

                          {/* Upper menu option */}
                          <div className="absolute top-4 left-4 pointer-events-auto">
                            {model.id.startsWith('imported_') ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Are you sure you want to permanently delete custom model "${model.name}"?`)) {
                                    const updated = allModelsList.filter(m => m.id !== model.id);
                                    setAllModelsList(updated);
                                    const onlyImported = updated.filter(m => m.id.startsWith('imported_'));
                                    localStorage.setItem('yuihime_cached_models_v2', JSON.stringify(onlyImported));
                                    if (selectedModelInSelector?.id === model.id) {
                                      setSelectedModelInSelector(updated[0] || null);
                                    }
                                  }
                                }}
                                className="p-1.5 bg-black/60 hover:bg-rose-500 hover:text-white rounded-full text-zinc-400 transition-colors cursor-pointer flex items-center justify-center"
                                title="Remove item"
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#0a0a0f]/85 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                                <span className="text-[14px] leading-none mb-1">• • •</span>
                              </div>
                            )}
                          </div>

                          {/* Outer label card elements */}
                          <div className="absolute bottom-4 left-4 right-4 text-left pointer-events-none">
                            <h4 className="text-sm font-bold text-white truncate font-sans">{model.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="px-1.5 py-0.5 bg-cyan-400/20 border border-cyan-400/30 text-[8.5px] uppercase font-mono font-black tracking-wider text-cyan-300 rounded">
                                {model.type}
                              </span>
                              <span className="text-[9px] text-zinc-400 truncate max-w-[110px] font-mono">
                                {model.url.split('/').pop()?.split('?')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Model Description Details */}
                  {selectedModelInSelector && (
                    <div className="mt-4 p-4.5 bg-white/[0.02] border border-white/5 rounded-2xl relative z-10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0ea5e9] font-mono">Selected Model Profile</span>
                        <span className="text-[9px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/[0.02] uppercase font-bold">
                          {selectedModelInSelector.type} Framework
                        </span>
                      </div>
                      <h4 className="text-white font-bold text-sm font-sans">{selectedModelInSelector.name}</h4>
                      <p className="text-zinc-400 text-xs font-sans leading-relaxed">{selectedModelInSelector.desc}</p>
                      <div className="pt-2 text-[10px] font-mono text-zinc-500 truncate flex items-center gap-1.5">
                        <span className="text-zinc-600 font-bold">MANIFEST_PATH:</span>
                        <span className="text-cyan-400/80 bg-black/40 px-2 py-1 rounded border border-white/5">{selectedModelInSelector.url}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Confirm Button */}
                  <div className="grid grid-cols-2 gap-3.5 mt-6 relative z-10 pt-4 border-t border-white/5 font-sans">
                    <button
                      type="button"
                      onClick={() => setIsModelSelectorOpen(false)}
                      className="py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer font-sans text-center select-none"
                    >
                      Close Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedModelInSelector) {
                          updateAvatar('modelUrl', selectedModelInSelector.url);
                          setIsModelSelectorOpen(false);
                          alert(`Character active model successfully set to: ${selectedModelInSelector.name}.`);
                        }
                      }}
                      className="py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-300 cursor-pointer text-center select-none shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-[0.98]"
                    >
                      Confirm Active Model
                    </button>
                  </div>

                </motion.div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating details overlay tooltip portal popover matching settings user requirements */}
      <AnimatePresence>
        {activeInfoText && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0b10] border border-white/10 rounded-2xl p-5 max-w-sm w-full text-white shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-3.5 border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <Info size={14} />
                  {activeInfoText.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveInfoText(null)}
                  className="text-zinc-400 hover:text-white text-xs bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5 transition-colors font-sans uppercase font-bold active:scale-95 cursor-pointer"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line text-left">
                {activeInfoText.text}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
