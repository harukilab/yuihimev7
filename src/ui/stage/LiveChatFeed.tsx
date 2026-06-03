import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Sparkle } from 'lucide-react';

interface LiveChatFeedProps {
  showChatFeed: boolean;
  setShowChatFeed: (val: boolean) => void;
  uniqueLogs: any[];
  hiddenLogIds: string[];
  isThinking: boolean;
  input: string;
  setInput: (val: string) => void;
  handleThink: (e: React.FormEvent) => void;
  showSubtitles: boolean;
  activeSubtitle: string | null;
  typedSubtitle: string;
  activeAlert: any; // Renders floating alerts
}

const cleanDisplayContent = (text: string) => {
  return text.trim()
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/<\/?final_answer>/gi, '')
    .trim();
};

export const LiveChatFeed: React.FC<LiveChatFeedProps> = ({
  showChatFeed,
  setShowChatFeed,
  uniqueLogs = [],
  hiddenLogIds = [],
  isThinking,
  input,
  setInput,
  handleThink,
  showSubtitles,
  activeSubtitle,
  typedSubtitle,
  activeAlert
}) => {
  const chatFeedContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to lowest message upon update
  useEffect(() => {
    if (chatFeedContainerRef.current) {
      chatFeedContainerRef.current.scrollTop = chatFeedContainerRef.current.scrollHeight;
    }
  }, [uniqueLogs, isThinking, showChatFeed]);

  return (
    <>
      {/* 1. Overlay Alerts (Superchats / Subscriptions) floating on top center of the screen */}
      <AnimatePresence>
        {activeAlert && (
          <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -20 }}
              transition={{ type: 'spring', damping: 25 }}
              className={`p-4 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white overflow-hidden bg-gradient-to-r relative ${activeAlert.color}`}
            >
              <div className="absolute top-2 right-2 animate-spin-slow text-white/20">
                <Sparkle size={16} />
              </div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col gap-1 text-center">
                <div className="text-[9px] uppercase tracking-[0.3em] text-white/60 font-mono font-black">
                  {activeAlert.title}
                </div>
                <div className="text-sm font-black tracking-wide truncate">
                  {activeAlert.type === 'superchat' ? `💸 ${(activeAlert as any).donor}` : `⭐ NEW FAMILY_SUBSCRIBER`}
                </div>
                <div className="text-[11px] font-sans text-white/95 leading-normal mt-1 px-1">
                  {activeAlert.subtitle}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Real-time Fluid Interactive Chat Feed */}
      <div className={`absolute bottom-[72px] left-1/2 -translate-x-1/2 z-30 w-full max-w-[560px] px-4 pointer-events-none flex flex-col justify-end overflow-hidden p-2 transition-all duration-300 ${showChatFeed ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-[20px]'}`}>
        <div ref={chatFeedContainerRef} className="flex flex-col gap-2.5 overflow-y-auto max-h-[42vh] scrollbar-hide pointer-events-auto pr-14 md:pr-1 py-1">
          {(() => {
            const visibleLogs = uniqueLogs
              .map((log, origIndex) => ({ log, id: `${log.timestamp}-${origIndex}` }))
              .filter(item => !hiddenLogIds.includes(item.id));
              
            // Display last 4 visible items to prevent overlay/clipping behind avatar body
            return visibleLogs.slice(-4).map((item) => {
              const { log, id } = item;
              const isUser = log.type === 'user';
              const cleanText = cleanDisplayContent(log.content);

              if (!cleanText) return null;

              return (
                <div
                  key={id}
                  className={`p-3 px-4 rounded-2xl border backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] flex flex-col relative transition-all duration-250 w-auto max-w-[94%] ${
                    isUser
                      ? 'bg-gradient-to-br from-[#0c1624]/95 to-[#122338]/95 border-cyan-500/20 text-[#e2e8f0] rounded-br-none self-end text-left'
                      : 'bg-gradient-to-br from-[#25101f]/95 to-[#1c1124]/95 border-pink-500/30 text-rose-50 rounded-bl-none self-start text-left shadow-[0_8px_32px_rgba(244,63,94,0.15)]'
                  }`}
                >
                  <p className="text-[12px] leading-relaxed font-sans font-medium tracking-normal break-words selection:bg-pink-500/30 selection:text-white text-left whitespace-pre-wrap">
                    {cleanText}
                  </p>
                </div>
              );
            });
          })()}
          
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="p-2.5 px-3.5 bg-gradient-to-r from-[#25101f]/95 to-[#1c1124]/95 border border-pink-500/20 rounded-2xl rounded-bl-none self-start flex items-center gap-2.5 backdrop-blur-md shadow-md shadow-pink-500/5 text-left"
            >
              <div className="flex space-x-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" />
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping [animation-delay:0.3s]" />
              </div>
              <span className="text-[8.5px] font-mono uppercase tracking-widest text-[#f472b6] font-extrabold flex items-center gap-1">
                🌸 YUIHIME SEDANG MERENUNG...
              </span>
              <button 
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('force_unlock_thinking'));
                }}
                className="ml-2 px-1.5 py-0.5 rounded bg-pink-500/20 hover:bg-pink-500/40 border border-pink-500/30 text-[8px] font-mono uppercase tracking-wider text-pink-300 hover:text-white transition-all cursor-pointer font-bold"
                title="Force unlock input if server/API is lagging or stuck"
              >
                Force Stop
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* 3. Center-Bottom Floating Glass-morphic Chat Input */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-[560px] px-4 pointer-events-auto flex items-center gap-2 select-none">
        <form onSubmit={handleThink} className="relative flex-1 flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isThinking ? "Yuihime sedang merenung..." : "Say something..."}
            className="w-full pl-6 pr-6 py-3 bg-[#0e0e14]/75 backdrop-blur-xl border border-white/5 rounded-full text-xs text-white/90 placeholder-white/30 focus:outline-none focus:border-pink-500/30 focus:shadow-[0_0_20px_rgba(236,72,153,0.15)] transition-all"
          />
        </form>
        
        {/* Toggle Chat Balloon Feed Global Button */}
        <button
          type="button"
          onClick={() => setShowChatFeed(!showChatFeed)}
          title={showChatFeed ? "Sembunyikan semua balon percakapan" : "Tampilkan balon percakapan"}
          className={`shrink-0 p-3 rounded-full border backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-[0_8px_25px_rgba(0,0,0,0.5)] flex items-center justify-center ${
            showChatFeed 
              ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/50' 
              : 'bg-[#181d29]/60 border-cyan-500/20 text-cyan-400 hover:text-white hover:bg-[#181d29]/80 shadow-[0_8px_16px_rgba(6,182,212,0.15)] animate-pulse'
          }`}
        >
          {showChatFeed ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      {/* 4. Subtitles Overlay */}
      {showSubtitles && activeSubtitle && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[110px] w-full max-w-sm md:max-w-xl z-30 pointer-events-none px-4 md:px-0 text-center select-none">
          <div className="inline-block px-4 py-2 rounded-lg bg-black/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/5">
            <p className="text-white text-[13.5px] md:text-[14px] font-sans font-semibold tracking-wide break-words text-center leading-relaxed [text-shadow:_0_1px_4px_rgba(0,0,0,0.95)]">
              {typedSubtitle}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
