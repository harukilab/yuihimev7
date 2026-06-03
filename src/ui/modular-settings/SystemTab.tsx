import React from 'react';
import { 
  Sliders, Palette, Monitor, Terminal, ChevronRight, 
  Maximize2, Move, Sparkles, Info 
} from 'lucide-react';

interface SystemTabProps {
  settings: any;
  setSettings: React.Dispatch<React.SetStateAction<any>>;
  updateGeneral: (field: string, val: any) => void;
  systemSubpage: string | null;
  setSystemSubpage: (val: string | null) => void;
  applyThemePalette: (themeId: string, customColor?: string) => void;
  backdrop: string;
  handleSelectBackdrop: (mode: string) => void;
  customImgUrl: string;
  handleCustomUrlChange: (url: string) => void;
  avatarConfig: any;
  onAvatarUpdate: any;
  renderFields: (module: any, configValue: any, onChange: (field: string, val: any) => void) => React.ReactNode;
  onShowInfo?: (title: string, text: string) => void;
}

export const SystemTab: React.FC<SystemTabProps> = ({
  settings,
  setSettings,
  updateGeneral,
  systemSubpage,
  setSystemSubpage,
  applyThemePalette,
  backdrop,
  handleSelectBackdrop,
  customImgUrl,
  handleCustomUrlChange,
  avatarConfig,
  onAvatarUpdate,
  renderFields,
  onShowInfo
}) => {
  return (
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
                <h5 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors font-sans">Stage & VTuber Camera</h5>
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
              <h5 className="text-xs font-bold text-white tracking-wide font-sans">Theme</h5>
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
              <p className="text-[10.5px] text-zinc-400 mt-1 font-sans">UI language. You can set characters' language later.</p>
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
              <div className="flex items-center gap-1.5 leading-none">
                <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed">
                  Anonymous metrics for stability and feature usage.
                </p>
                {onShowInfo && (
                  <button
                    type="button"
                    onClick={() => onShowInfo(
                      "Usage Analytics & Privacy Policy",
                      "AIRI collects anonymous usage analytics to help us understand how the app is used and improve stability. No personal data is collected.\n\nRead the privacy policy for full details. You can turn analytics off at any time using this interface switch."
                    )}
                    className="text-amber-500 hover:text-amber-400 font-mono transition-all text-[11px] cursor-pointer inline-flex items-center justify-center font-bold"
                    title="See details"
                  >
                    [?]
                  </button>
                )}
              </div>
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
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 block font-bold">Shades</span>
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
                    
                    const opacity = 1 - (idx * 0.08);

                    return (
                      <div key={shade} className="flex flex-col items-center gap-1 min-w-0">
                        <div 
                          className="w-full aspect-square rounded-md border border-white/5 shadow-inner" 
                          style={{ backgroundColor: baseColor, opacity: opacity }}
                        />
                        <span className="text-[7.5px] font-mono text-zinc-650 truncate">{shade}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transparent/Alpha Shades list */}
              <div className="space-y-2.5">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 block font-bold">Transparent Shades</span>
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
                        <span className="text-[7.5px] font-mono text-zinc-650 truncate">500/{alpha}</span>
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
              <ChevronRight className="text-zinc-550 rotate-90" size={16} />
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
                    <div className="flex flex-wrap gap-1 w-11 shrink-0 bg-black/40 p-1.5 rounded-lg border border-white/5">
                      {theme.colors.slice(0, 4).map((c, i) => (
                        <span key={i} className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c, width: '10px', height: '10px' }} />
                      ))}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[12px] font-bold text-white leading-tight">{theme.name}</h5>
                        {isActive && <span className="text-[8px] uppercase tracking-widest text-[#0ea5e9] bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 px-1.5 py-0.5 rounded-md font-mono">Active</span>}
                      </div>
                      <p className="text-[10px] text-zinc-550 leading-normal mt-0.5 font-sans">
                        {theme.desc}
                      </p>
                      
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
        <div className="bg-[#0e0e14]/55 border border-white/5 p-6 rounded-2xl space-y-6 animate-fade-in font-sans">
          
          {/* Backdrop Selectors */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide font-sans">OBS Backdrop Engine</h4>
              <p className="text-[10.5px] text-zinc-400 mt-1 font-sans">Configure visual background behind Yuihime</p>
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
                <p className="text-[10.5px] text-zinc-400 mt-1 font-sans">Fine-tune coordinates and scale size of the avatar</p>
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
                <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d4d4d8]/40 font-bold">🛡️ Workspace Sandbox Paths & Jail Registry</h4>
                <div className="flex items-center gap-2 mt-0.5 leading-none">
                  <p className="text-[10.5px] text-zinc-450 font-sans">Physical sandbox data isolation directories and Path Jail rules.</p>
                  {onShowInfo && (
                    <button
                      type="button"
                      onClick={() => onShowInfo(
                        "Workspace Sandbox Isolation & Path Jail",
                        "Konfigurasi folder batin fisik dan pembatasan isolasi keamanan Sandbox (Path Jail).\n\nSistem mengarantina dan me-jail seluruh file-operasi kognitif hanya di bawah user_data untuk memproteksi direktori vital root host server dari manipulasi berbahaya."
                      )}
                      className="text-amber-500 hover:text-amber-400 font-mono transition-all text-[11px] cursor-pointer inline-flex items-center justify-center font-bold"
                      title="See details"
                    >
                      [?]
                    </button>
                  )}
                </div>
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
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-350 text-[9px] uppercase tracking-wider font-mono border border-white/5 rounded-xl transition-all cursor-pointer hover:border-amber-500/35 font-bold active:scale-95"
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
                <label className="block text-[10.5px] text-zinc-400 mb-1.5 font-sans font-bold">User Workspace Sandbox Path (Path Jail)</label>
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
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-zinc-550 mb-4">Engine Diagnostics & Configurations</h4>
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
        </div>
      )}
    </div>
  );
};
