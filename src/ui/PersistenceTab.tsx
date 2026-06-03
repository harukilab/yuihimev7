import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Search, X, Tag, Check, Edit2, Cloud, Database, Sparkles, History, Search as SearchIcon, Terminal } from 'lucide-react';
import { Memory, Dream, CoreKnowledge, Identity } from '../include/types';
import { KnowledgeTab } from './KnowledgeTab';

interface PersistenceTabProps {
  memories: Memory[];
  dreams: Dream[];
  knowledge: CoreKnowledge[];
  identities: Identity[];
  memorySearchQuery: string;
  setMemorySearchQuery: (val: string) => void;
  isThinking: boolean;
  handleExtractKnowledge: () => void;
  backgroundLogs: any[];
}

export const PersistenceTab: React.FC<PersistenceTabProps> = ({
  memories,
  dreams,
  knowledge,
  identities,
  memorySearchQuery,
  setMemorySearchQuery,
  isThinking,
  handleExtractKnowledge,
  backgroundLogs
}) => {
  const [view, setView] = useState<'memories' | 'dreams' | 'knowledge' | 'identities' | 'logs'>('memories');
  const [tagInput, setTagInput] = useState('');
  const [editingTagsMemoryId, setEditingTagsMemoryId] = useState<string | null>(null);

  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === 'logs' && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [view, backgroundLogs]);

  const handleSaveTags = (id: string) => {
    // This is handled in App.tsx usually, but we can emit or just close
    setEditingTagsMemoryId(null);
    setTagInput('');
  };

  return (
    <motion.div 
      key="persistence"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 p-4 md:p-12 overflow-y-auto flex flex-col z-10 scrollbar-hide"
    >
      <div className="max-w-6xl mx-auto w-full">
        <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2 font-mono italic">Neural Persistence Layer // yui-database</h2>
            <h1 className="text-4xl font-serif text-white italic tracking-wide">Persistence Hub</h1>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full">
            <button 
              onClick={() => setView('memories')}
              className={`px-4 py-2 rounded-lg text-[10px] uppercase font-mono tracking-widest transition-all shrink-0 ${view === 'memories' ? 'bg-amber-500 text-black font-bold' : 'text-white/40 hover:text-white'}`}
            >
              <Database size={14} className="inline mr-2" /> Context
            </button>
            <button 
              onClick={() => setView('dreams')}
              className={`px-4 py-2 rounded-lg text-[10px] uppercase font-mono tracking-widest transition-all shrink-0 ${view === 'dreams' ? 'bg-amber-500 text-black font-bold' : 'text-white/40 hover:text-white'}`}
            >
              <Cloud size={14} className="inline mr-2" /> Latent
            </button>
            <button 
              onClick={() => setView('knowledge')}
              className={`px-4 py-2 rounded-lg text-[10px] uppercase font-mono tracking-widest transition-all shrink-0 ${view === 'knowledge' ? 'bg-amber-500 text-black font-bold' : 'text-white/40 hover:text-white'}`}
            >
              <SearchIcon size={14} className="inline mr-2" /> Grounding
            </button>
            <button 
              onClick={() => setView('logs')}
              className={`px-4 py-2 rounded-lg text-[10px] uppercase font-mono tracking-widest transition-all shrink-0 ${view === 'logs' ? 'bg-amber-500 text-black font-bold' : 'text-white/40 hover:text-white'}`}
            >
              <Terminal size={14} className="inline mr-2" /> Logs
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'memories' && (
            <motion.div
              key="memories-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="max-w-xl relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search size={14} className="text-white/20 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input 
                  type="text"
                  value={memorySearchQuery}
                  onChange={(e) => setMemorySearchQuery(e.target.value)}
                  placeholder="Search context or #tags..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-sans"
                />
                {memorySearchQuery && (
                  <button 
                    onClick={() => setMemorySearchQuery('')}
                    className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white/60 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="grid gap-4">
                {(memories || [])
                  .filter(m => {
                    if (!memorySearchQuery) return true;
                    const query = memorySearchQuery.toLowerCase();
                    const contentMatch = m.content.toLowerCase().includes(query);
                    const tagMatch = (m.tags || []).some(t => t.toLowerCase().includes(query.replace('#', '')));
                    return contentMatch || tagMatch;
                  })
                  .slice(-100)
                  .reverse()
                  .map((m, i) => (
                  <div key={m.id || `mem-${i}`} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-all group flex gap-6">
                    <div className="flex flex-col items-center gap-2 pt-1 uppercase">
                      <div className={`w-1.5 h-1.5 rounded-full ${m.type === 'fact' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <div className="[writing-mode:vertical-lr] text-[8px] text-white/20 tracking-widest">{m.type}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-mono text-amber-200/20">ID:{(m.id || '').substring(0, 8)} // &lt;{m.speaker || 'Operator'}&gt;</span>
                        <span className="text-[10px] text-white/20 uppercase tracking-tighter">{new Date(m.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed font-sans">{m.content}</p>
                      
                      {editingTagsMemoryId === m.id ? (
                        <div className="mt-4 flex items-center gap-3">
                          <Tag size={12} className="text-amber-500" />
                          <input 
                            autoFocus
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTags(m.id)}
                            placeholder="scientific, neural, data..."
                            className="bg-transparent border-b border-amber-500/50 text-[10px] text-white/80 focus:outline-none py-1 flex-1 font-mono"
                          />
                          <button onClick={() => handleSaveTags(m.id)} className="p-1 hover:bg-emerald-500/20 text-emerald-500 rounded transition-colors">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingTagsMemoryId(null)} className="p-1 hover:bg-white/10 text-white/40 rounded transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 relative">
                          {(m.tags || []).map((t, ti) => (
                            <span key={`${t}-${ti}`} className="text-[9px] font-mono text-white/30 uppercase tracking-widest break-all">#{t}</span>
                          ))}
                          <button 
                            onClick={() => {
                              setEditingTagsMemoryId(m.id);
                              setTagInput(m.tags.join(', '));
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 text-white/30 hover:text-white rounded transition-all"
                          >
                            <Edit2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'dreams' && (
            <motion.div
              key="dreams-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {dreams.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center text-center">
                  <Cloud size={48} className="text-white/10 mb-4 animate-pulse" />
                  <p className="text-white/20 font-serif italic text-xl">Latent space is clearing. Awaiting synaptic synthesis.</p>
                  <p className="text-[10px] text-white/10 uppercase mt-2 font-mono tracking-widest">Dreams trigger autonomously after sufficient raw context ingestion</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(dreams || []).map((d, i) => (
                    <div key={d.id || `dream-${i}`} className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                      <h3 className="text-2xl font-serif text-white mb-6 italic tracking-wide">{d.concept}</h3>
                      <div className="space-y-4">
                        {(d.abstractions || []).map((a, i) => (
                          <div key={i} className="flex gap-4 items-start text-sm text-white/60 font-sans tracking-wide leading-relaxed group-hover:text-white/80 transition-colors">
                            <span className="text-amber-500 mt-1.5 w-1 h-1 rounded-full shrink-0" />
                            <p>{a}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 flex justify-between items-end border-t border-white/5 pt-4">
                        <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Synthesis Strength: {((d.strength ?? 0) * 100).toFixed(1)}%</div>
                        <Sparkles size={14} className="text-amber-500/40" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'knowledge' && (
            <motion.div
              key="knowledge-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <KnowledgeTab 
                knowledge={knowledge}
                isThinking={isThinking}
                handleExtractKnowledge={handleExtractKnowledge}
              />
            </motion.div>
          )}

          {view === 'logs' && (
            <motion.div
              key="logs-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-black/40 border border-white/5 rounded-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <Terminal size={18} className="text-amber-500" />
                  <span className="text-sm font-mono text-white/80 uppercase tracking-widest">Low-Level System Traces</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-500/60 font-bold uppercase tracking-widest">Live Flowing</span>
                </div>
              </div>
              <div 
                ref={logsContainerRef}
                className="h-[600px] overflow-y-auto p-6 font-mono text-[11px] space-y-2 selection:bg-amber-500/20 shadow-inner"
              >
                {backgroundLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/10 italic">
                    Initializing tracer... No active signals detected.
                  </div>
                ) : (
                  backgroundLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 border-l border-white/10 pl-4 hover:border-amber-500/40 transition-colors py-1 group">
                      <span className="text-white/10 shrink-0 group-hover:text-white/30 italic">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className={`break-all ${
                        log.content.includes('ERROR') ? 'text-rose-500' :
                        log.content.includes('PHASE') ? 'text-sky-400' :
                        log.content.includes('Action') ? 'text-emerald-400 font-bold' :
                        'text-white/40 group-hover:text-white/60 transition-colors'
                      }`}>
                        {log.content}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
