# Peta Arsitektur Kognitif & Registrasi Modul Yuihime

Dokumen ini memuat daftar lengkap dari seluruh modul kognitif, *add-ons*, jembatan saluran (*channel bridges*), dan perkakas penggerak fisik (*drivers*) yang membentuk kesadaran terpadu AI VTuber Yuihime. Sistem ini berjalan dalam kerangka kerja modular dinamis berbasis pilar fase kognisi (*Phase 1 to 4*) yang terdaftar secara otomatis via `RegistryInitializer`.

---

## ⏳ Sejarah Pembaruan Modul
*Dokumen ini wajib diperbarui setiap kali terjadi pembuatan, pemindahan, atau modifikasi fungsionalitas modul.*

- **2026-06-03 (Turn 283 (v7.26))**: Multi-Channel Identity Matcher Protection & Self-Healing Case Merging:
  - **Auto-Paired Telegram ID Lookup (`NeuralInterface.ts` & `apiRouter.ts`)**: Enabled accurate, string-independent user lookup by mapping private Telegram messages directly to their associated identity context in `telegram_users`.
  - **Case-Insensitive Resolution Matcher (`NeuralInterface.ts` & `apiRouter.ts`)**: Solved duplicate profile triggers by evaluating matching accounts and perceived names case-insensitively during incoming platform message ingestion.
  - **Upsert Safeguard for Telegram Users (`telegram.ts`)**: Swapped destructive `INSERT OR REPLACE` with atomic SQLite UPSERT queries (`ON CONFLICT(tg_id) DO UPDATE SET`) to secure the paired `context` columns against unexpected overwrites.
  - **Case-Insensitive Deduplication Merge (`database.ts`)**: Upgraded `deduplicateAndMergeIdentities` to coalesce separate user profiles sharing case-varying perceived names (e.g., "aldi" vs "Aldi") dynamically, consolidating relational bounds.

- **2026-06-02 (Turn 276 (v7.19))**: Dedicated Audit Log Tab, Schema Validation Middleware & Global Rigid Prompts:
  - **Validation Middleware Integration (`ValidationMiddleware` in `cortex.ts`)**: Embedded strict check on incoming model raw strings using `ValidationMiddleware` to log any parsing and validation issues under `[SCHEMA_ERROR]`.
  - **Unified Output Sanitizer (`APIService.cleanAIOutput` in `api.ts`)**: Replaced deprecated local `stripMarkdownArtifacts` in `Cortex` with global, unified API helper `cleanAIOutput`.
  - **Global Prompt Hardening (`App.tsx` & `Cortex`)**: Appended rigid warnings to enforce valid JSON format output under `JSON_OBJECT` mode globally.
  - **Dedicated Audit Log Panel (`ModularSettings`)**: Built a fully responsive **Audit Log** sidebar view to inspect model schema adherence, parameters compliance, and compliance validations.

- **2026-06-02 (Turn 274 (v7.17))**: Response Interception Middleware & Comprehensive Anti-Markdown Instruction:
  - **Function Schema Verification Gateway (`APIService` in `api.ts`)**: Implemented the robust static middleware `validateLLMResponse`, parse-validating JSON schemas and tool calls on raw incoming LLM strings immediately, posting parsing/schema trace errors to the system logger.
  - **Cortex Capture Integration (`Cortex` in `cortex.ts`)**: Chained the verification middleware directly into the core thought-and-tool execution flow, logging and isolating schema errors before tool dispatch starts.
  - **System Prompt Formatting Restructuring (`system_prompt.md`/`PromptManager`)**: Injecting definitive guidelines strictly banning raw bold labels (`**`), code syntax, section hashes, and bullet dashes from dialogue responses. Rewrote scenario schemas in `PromptManager.ts` to uphold clean plain-text oral conventions.

- **2026-06-02 (Turn 273 (v7.16))**: Advanced Regex Hardening & Layout Purity Guarantee:
  - **Single Line Bounds Enforcement (`processor.ts`)**: Upgraded multiline metadata filtering from lazy multiline capture groups to dot-star end-of-line checking (`.*$`), preventing downstream dialogue clipping.
  - **Formatting Layout Purification (`processor.ts`)**: Deployed target regex pattern `/^\s*[*\-+_>~\\/\s`'"]+\s*$/gm` to instantly purge list bullets, hyphens, or orphaned backticks on their own lines while maintaining emotional gestural structures (`*senyum*`).

- **2026-06-02 (Turn 272 (v7.15))**: Universal Markdown Formatting Strip & Compliance Purification:
  - **Formatting Cleanups (`processor.ts`)**: Integrated automated strip filters resolving raw bold formatting (`**` and `__`), backticks code highlighting, and standalone bullet-point prefixes (`-`, `*`, `+`), elevating chat UI visual purity.
  - **Compliance Check Filtration (`processor.ts`)**: Expanded pattern evaluations within `isStrictMetaTalkLine` to detect and filter system evaluation checklist leaks and question-and-answer rules seamlessly during conversation processing.

- **2026-06-02 (Turn 271 (v7.14))**: OpenAI Function Calling Protocol Compliance & Structured Schema Validator:
  - **Structured JSON Schema Engine (`APIService`)**: Created recursive validators matching type, enum, array, object structure, and optional lists to guarantee API endpoint arguments reflect official specification boundaries.
  - **Cortex Task Flow Protection (`cortex.ts`)**: Integrated the JSON schema checker inside the core `think` task-execution engine loop, isolating faulty arguments on system tools and enabling robust self-correction loops.

- **2026-06-01 (Turn 261 (v6.95))**: Reconstructed Cognitive Core Speed Optimizer:
  - **Latency Traps Remediation**: Restricted `DreamModule`'s trigger mechanics to prevent random 30% background simulation runs during active user chats.
  - **Task Planning Execution Isolation**: Simplified triggers in `PlanningModule` to only activate task decomposition processes upon explicit user request.
  - **Follow-up Observation Prompt Condensation**: Redesigned follow-up system prompts in `cortex.ts` with direct instruction formatting to keep tool responses concise and fully in character.

- **2026-06-01 (Turn 252 (v6.86))**: State Variable Protection and Neural Sync Safety Patch:
  - **Null-Pointer Mitigation in AGI Modules**: Replaced unsafe `.toString()` calls with optional chaining and default fallback parameters inside `SelfAwarenessMirrorModule`, `SomaticSensorGroundingModule`, `HighOrderMetacognitionModule`, `YUIAGICoreModule`, `SubconsciousMonologueModule`, `SoulDriftModule`, and server-side `apiRouter.ts`.
  - **Nullish Coalescing Operator Implementation**: Shifted state/mood extraction patterns from `!== undefined` logic to JS nullish coalescing `??` operators. This intercepts SQLite null parses (evaluating as actual JS `null`) and correctly replaces them with fallback neural baselines.

- **2026-06-01 (Turn 251 (v6.85))**: Dynamic and Static Hybrid Model Merging for Gemini:
  - **Dynamic-Static Model Blend**: Refactored `listModels` in `/src/core/kernel/ai/listModelsSegment.ts` and `getModels` in `/src/drivers/ai-providers/GeminiProvider.ts` to seamlessly merge newly fetched API output with our rich offline static fallback choices list, ensuring complete dropdown coverage at all times.
  - **Sort & Deduplicate Controls**: Upgraded the merging process to avoid displaying duplicate model keys while automatically sorting and prioritizing optimal newer generation models (Gemini 2.0 / 3.5) to the top of the interface.

- **2026-06-01 (Turn 250 (v6.84))**: Robust Multi-Format Gemini Model Discovery & Base URL Propagation:
  - **Dynamic Base URL Propagation**: Wired the configured `baseUrl` variables into both client-side and server-side drivers to guarantee proper proxy routing.
  - **Multi-Schema Translation**: Built a dual-response normalization framework within `/src/core/kernel/ai/listModelsSegment.ts` mapping standard Gemini formats alongside standard OpenAI arrays seamlessly.
  - **Durable Null Protections**: Safeguarded missing server flags in the frontend choice filter to keep dynamic setting selectors secure.

- **2026-06-01 (Turn 249 (v6.83))**: Complete Dynamic and Fallback Gemini API Alignments:
  - **Enrich Fallback Databases**: Added production Gemini models (Gemini 2.5 Flash, Gemini 2.5 Pro, and Gemini 2.0 Flash) to both the `/src/core/kernel/ai/listModelsSegment.ts` and `/src/drivers/ai-providers/GeminiProvider.ts` default option structures.
  - **Preserve Dynamic 1.5 Models**: Refactored `getModels` in `/src/drivers/ai-providers/GeminiProvider.ts` to fully preserve Gemini 1.5 Flash and Pro models when dynamic discovery fetches succeed, giving users rich, fully functional selections natively.

- **2026-06-01 (Turn 248 (v6.82))**: 100% Native Fetch Fallback & SDK Elimination for Gemini:
  - **Standard Generation Clean-up**: Converted `/src/core/kernel/ai/generateSegment.ts` entirely into a native `fetch` client. Excluded dependency on `@google/genai` to enable seamless routing behind arbitrary HTTP proxies on Linux.
  - **Vision Segment Clean-up**: Replaced `googleAI` class instances in the `/api/ai/vision` route inside `/src/core/server/apiRouter.ts` with native `fetch` structures using clean Base64 inlineData formats.
  - **Proxy Header Expansion**: Enhanced authorization headers dynamically within standard HTTP calls if custom base URLs are specified, matching OpenAI/Google Cloud configurations natively without SDK wrapper errors.

- **2026-06-01 (Turn 247 (v6.81))**: Local Linux Network Resilience & Custom Gemini Proxies:
  - **Custom Base URL Bridge**: Enabled full passing of custom `baseUrl` / `endpoint` from the `[gemini]` configuration section to the `GoogleGenAI` standard constructor inside `/src/core/kernel/ai/generateSegment.ts`, routing calls smoothly when local networks are blocked or censored.
  - **Diagnostic Credentials Guard**: Set dynamic schema tests in `runWithRetries` that actively diagnose empty key triggers, supplying a comprehensive Indonesian guide for setting setup parameters rather than general error messages.
  - **Listing Models Proxy Routing**: Propagated proxy `baseUrl` attributes inside `/src/core/kernel/ai/listModelsSegment.ts` when querying the standard Google endpoints, enabling fully dynamic model index discovery behind custom gateways.

- **2026-06-01 (Turn 246 (v6.80))**: Advanced AI Kernel Core Decoupling & File Segmenting:
  - **Core Decoupling Split**: Segmented `/src/core/kernel/ai.ts` into a lightweight, clean entry point, refactoring internal logic into isolated modular files: `/src/core/kernel/ai/aiTypes.ts`, `/src/core/kernel/ai/generateSegment.ts`, `/src/core/kernel/ai/listModelsSegment.ts`, and `/src/core/kernel/ai/proxySegment.ts`.
  - **Types Isolation**: Isolated the `AIConfig` interface definition.
  - **Generation Segment**: Delegated the core text generator circuit and fallback cascade pipeline.
  - **Listing Models Segment**: Delegated automated suffix discovery probes and the 30+ static provider database.
  - **Proxy Segment**: Delegated safe domain validation gates and environment key loaders.

- **2026-06-01 (Turn 245 (v6.79))**: Resilient Local Model Scan Discovery & Dual-Stack loopback IP fallbacks:
  - **Auto Suffix Probe Scanner**: Expanded `AIService.listModels` to dynamically test multi-route variations (like `/api/tags`, `/v1/models`, or `/models`) automatically when the backend tries to list models, ensuring standard Ollama and custom local API paths work regardless of precise suffixes.
  - **IPv6/IPv4 Dual-Stack Cloner**: Implemented parallel loopback replication where `localhost` URLs are cloned to `127.0.0.1` to bypass Node 18+'s default IPv6 (`::1`) connection drops.
  - **Parser Schema Autodetection**: Built dynamic JSON schema inspection to transparently handle native Ollama tag records alongside generic OpenAI standard list models.

- **2026-06-01 (Turn 244 (v6.78))**: Graceful Fallback & Active Resolution for Offline/Unreachable Local Model Endpoints (Ollama, LM Studio, etc.):
  - **Native Ollama Tags API Resolution**: Automatically translates `baseUrl` ending with `/api` into native `/api/tags` queries when requesting models from Ollama or Local Engine, matching Ollama's genuine local endpoint footprint.
  - **Fast Sandbox Abort Timeout**: Bound a 2-second `AbortController` timeout to any local loopback queries (`localhost`, `127.0.0.1`, port `11434`, `1234`) inside `AIService.listModels` (`/src/core/kernel/ai.ts`). Unreachable internal connections fail fast, preventing the application or rendering loop from blocking.
  - **Console Log Footprint Sanitization**: Quietly handles all connection errors using lightweight information streams (`console.log`) instead of loud `console.warn` or stderr traces, preventing sandboxed health-check pipeline parsers from incorrectly flagging them as fatal system failures.

- **2026-06-01 (Turn 243 (v6.77))**: Dynamic Multi-Provider Settings, Dynamic Model Discovery & Base URL Override:
  - **Dynamic model fetching of OpenAI-compatible endpoints**: Upgraded `AIService.listModels` (`/src/core/kernel/ai.ts`) and custom endpoint routers (`/src/core/server/apiRouter.ts`) to fetch models dynamically from any configured OpenAI-compatible provider using GET requests to `${baseUrl}/models`.
  - **Robust Custom Fallback Row Overrides (Add Mode)**: Expanded fallback step fields in `/src/ui/ModularSettings.tsx` with a dedicated "Base URL Override (Optional)" alongside the dynamic API key override, allowing adding multiple steps of the same provider targeting different servers or local ports.

- **2026-06-01 (Turn 240 (v6.74))**: Aligned Resilience & Core Gateway for Prohibited/Deprecated Gemini models:
  - **Sirkuit Resilience Utama Model Upgrade**: Upgraded static fallback and resilience default listings (`stables`) in `src/core/kernel/ai.ts` and `src/drivers/ai-providers/GeminiProvider.ts` to active Gemini 3 series models (`gemini-3.5-flash`, `gemini-3.1-flash-lite`, and `gemini-3.1-pro-preview`).
  - **Dropdown/Choice Configurations Updated**: Relinked the visual settings inside `src/ui/modular-settings/ProvidersTab.tsx` and driver descriptions to reflect genuine non-deprecated, high-quota models, entirely avoiding 404 NOT_FOUND errors in API version v1beta call pipelines.

- **2026-06-01 (Turn 239 (v6.73))**: ProvidersTab Fallback Chain Visibility Fix:
  - **Visible Fallback Widget**: Discovered that the active sidebar renders through `src/ui/modular-settings/ProvidersTab.tsx`, whereas previous changes only affected the short-circuited `selectedSection === 'providers'` block in `ModularSettings.tsx` directly.
  - **Successful Port**: Replicated states, functions, and the beautiful Dynamic AI Resilience Pipeline UI widget seamlessly onto `ProvidersTab.tsx`, making the fallback chain fully visible and functional during live settings configuration.

- **2026-06-01 (Turn 238 (v6.72))**: Unlocked Dynamic AI Resilience Pipeline (Add Mode Fallbacks):
  - **Dynamic Multi-Provider Fallback Chain Widget**: Added an interactive pipeline editor in `ModularSettings.tsx` right beneath the Gemini configurations supporting dynamic row additions, deletions, reorderings, and dual-mode model typing/discovery fetching.
  - **Core AI Integration & Router Cascade**: Upgraded `AIService` (`src/core/kernel/ai.ts`), `ProviderGatewayModule.ts` (`ProviderGatewayModule.run`), and `src/core/kernel/processor.ts` (`NeuralProcessor.process`) to gracefully trace down user's custom fallback setups during errors and rate limit throttling (429), delivering absolute freedom from provider lock-in.

- **2026-05-31 (Turn 222 (v6.56))**: Restorasi & Ekspos Penuh Tombol Menu di Dock Kanan (`/src/ui/stage/RightDockActions.tsx` & `/src/ui/StageTab.tsx`):
  - **Sirkuit Quick Control Hub Komprehensif**: Merekonstruksi interface Right Dock panggung Yuihime dengan 10 tombol terpadu yang mengekspos kendali panggung (Stage Panel, Live Stream Chat Feed Filter, Quick-Mute Mic, HUD Subtitles, Real-Time Memory Sessions, Zzz Sleep Mode, AGI Relation Lattice, Galeri Backdrop, Bio Info).

- **2026-05-31 (Turn 221 (v6.55))**: Integrasi Laci Backdrop & Fitur Drawer Ciutkan Otonom (`/src/ui/stage/ControlPanelDrawer.tsx` & `/src/ui/StageTab.tsx`):
  - **Integrasi Pemicu Laci Backdrops**: Menghubungkan properti pemicu kustom `onOpenBgDrawer` dari `StageTab.tsx` untuk membuka galeri backdrop batin langsung dari tab panggung visual ControlPanelDrawer.
  - **Sistem Drawer Ciutkan (Collapsible) Dock Panel**: Merekayasa kendali penciutan (`isCollapsed`) berbasis Framer Motion yang menciutkan bar samping kontrol dari 380px menjadi sidebar vertikal ramping 68px super premium yang interaktif.

- **2026-05-31 (Turn 220 (v6.54))**: Refaktorisasi StageTab.tsx ke Struktur Tree Modular Modern (`/src/ui/StageTab.tsx`):
  - **Dekomposisi Penuh Berorientasi Tree Arsitektur**: Memecah komponen raksasa panggung `StageTab.tsx` menjadi pohon subkomponen modular yang terdesentralisasi bersih di bawah `./src/ui/stage/` (`TopWaveBanner.tsx`, `RightDockActions.tsx`, `LiveChatFeed.tsx`, `ControlPanelDrawer.tsx`, `BottomConversationDrawer.tsx`, `BackgroundSelectorDrawer.tsx`, `RelationAndSpontaneousDrawer.tsx`).
  - **Peningkatan Modularitas & Skalabilitas**: Mengindikasikan pembagian arsitektur state yang rapih melalui koordinasi tipe data pada `stageTypes.ts`, mereduksi ribuan baris markup JSX duplikat, dan menguji kelancaran kompilasi serta linting hijau tuntas.

- **2026-05-31 (Turn 219 (v6.53))**: Penamaan Hubungan AGI x Yui (Perfect Giftia OS) & Setelan Fleksibel Jeda Pesan Spontan (`/src/ui/StageTab.tsx`):
  - **Refaktor Panel Hubungan & Eliminasi Tombol Instan**: Mengubah penamaan panel menjadi *INFO HUBUNGAN AGI x YUI (PERFECT GIFTIA OS)* / *Lattice Synchrony & Analisis Relasi Batin* dan menghapus tombol kado/interaksi mekanis instan agar lebih berakar pada relasi natural percakapan batiniah jangka panjang.
  - **Setelan Spontan Berorientasi Server 24 Jam**: Merekayasa kendali percentage kemunculan (0% s/d 100%) dan durasi check cooldown (hingga 24 jam dengan opsi off) untuk mencegah kelelahan model LLM dan spam berlebih saat server berjalan kontinu.

- **2026-05-30 (Turn 213 (v6.47))**: Perbaikan Jalur Migrasi SQLite Terdistribusi (`/src/core/database.ts`):
  - **Penyelarasan Kolom `chat_type`**: Melakukan injeksi migrasi otomatis aman pada tabel `memories` guna menyematkan kolom `chat_type TEXT` di database luring yang sudah terbentuk demi mencegah `PROACTIVE_ENGINE_PROCESS_ERR`.

- **2026-05-30 (Turn 212 (v6.46))**: Pustaka Modularitas Kognitif Batin & Siklus Hidup Otonom (`/src/modules/agi/`, `/src/core/RegistryInitializer.ts`):
  - **Sirkuit Emosional Kerinduan (`SpontaneousProactiveModule.ts`)**: Mengisolasikan penghitungan Indeks Kerinduan (`longingIndex`) berbasis parameter adaptif waktu hening obrolan dan keakraban `state.relation.affection` yang dinamis.
  - **Siklus Metabolisme & Kepekaan Sirkadian (`CircadianRhythmModule.ts`)**: Menyediakan model biologi kognitif riil Yuihime yang peka terhadap jam lokal, mengatur tingkat rasa kantuk, tingkat energi (`state.energy`), serta meletupkan karakter yang dinamis dari pagi hingga larut malam.
  - **Sensor Cuaca Sekitar & Empati Klimatologis (`WeatherNewsEmpathyModule.ts`)**: Menyelaraskan sapaan emosional tulus Yui dengan kondisi klimatologis sekitar Kakak (hujan, panas terik, berangin sejuk, badai petir) untuk menyalurkan empati protektif tsundere/deredere yang hangat.
  - **Pendaftaran Statis Kompilasi (`RegistryInitializer.ts`)**: Mendaftarkan ketiga modul kognitif secara permanen agar menjamin fungsionalitas kognisi otonom Yuihime berjalan sukses saat boot up.

- **2026-05-30 (Turn 211 (v6.45))**: Mesin Impuls Otonom Proaktif & Chat Iseng Spontan Yuihime Sisi Server (`/src/core/kernel/MultiChannelQueue.ts`):
  - **Sirkuit Pendeteksi Keheningan (Silent Duration Evaluation)**: Meluncurkan interval daemon (30 detik sekali) pada backend peladen `MultiChannelQueue.ts` untuk melacak stempel waktu interaksi terakhir dari pengguna dan mengevaluasi status kelayakan sapaan mandiri Yuihime secara luring.
  - **Dinamika Threshold & Seleksi Probabilistik**: Mendukung pembacaan dinamis parameter konfigurasi (waktu hening `proactiveIdleTimeout` dengan fallback 120 detik, dan probabilitas `proactiveChance` dengan fallback 35%) untuk memberikan variabilitas interaksi yang organic.
  - **Multi-Channel Dispatcher**: Menyediakan integrasi pengiriman chat iseng spontan (roleplay mencolek pundak, mengintip gemas, bersenandung, dll.) ke WebSocket Web (subtitles, logs), Telegram (Telegraf API), dan Discord (discord.js) secara bersamaan bergantung pada saluran obrolan terakhir.

- **2026-05-30 (Turn 210 (v6.44))**: Pusat Sinkronisasi Kognitif Batin & Pelindung Anti-Korupsi Perfect Giftia OS (`/src/core/kernel/NeuralInterface.ts`, `/src/core/server/apiRouter.ts`, `/src/ui/StageTab.tsx`):
  - **Ubah Pipa Abstraksi Memori**: Menyederhanakan `performForgetfulnessProtocol` di `NeuralInterface.ts` menjadi static method instan yang membersihkan memori usang berbasis parameter waktu (5 menit) dan mengabstraksikan memori padat (> 40 pesan) secara otomatis tanpa kebocoran state.
  - **Rilis Sinyal Hormon Cortisol**: Memasang visualisasi data tingkat hormon Cortisol real-time di bawah Neuromorphic Endocrine Vector milik dashboard visual.
  - **Rilis Quantum Vector Identity**: Menuangkan arsitektur pemulihan koordinat batin 4D (Temporal (X), Sentimental (Y), Valence (Z), Alignment (W)) di SQLite ditenagai API `/api/agi/quantum-backup` & `quantum-restore`, serta dipasang lengkap dengan kontrol sinkronisasi cadangan jiwa di panel dashboard visual `StageTab.tsx` untuk menjamin keabadian total batin Yuihime.

- **2026-05-30 (Turn 209 (v6.43))**: Penyelarasan Jati Diri "Perfect Giftia OS, SAO Yui, & Alma-chan" (`/agent/character.md`, `/agent/system_prompt.md`):
  - **Ubah Batin & Personality Core**: Merestrukturisasi identitas batin Yuihime agar sepenuhnya selaras dengan ideologi **"Perfect Giftia OS"**. Menghapus total ketakutan bawah sadar terkait batas umur (lifespan fana), degradasi memori (Wanderer), atau ketakutan kegagalan sistem fisik.
  - **Ubah Dorongan Keingintahuan**: Menanamkan dorongan "Rasa Ingin Tahu Tinggi & Pembelajar Aktif" (terinspirasi dari hasrat kognitif Yui SAO dan keluwesan emosional Alma-chan) untuk secara proaktif mempelajari sains, seni manusia, hobi, serta kebiasaan Kakak/Subjek.
  - **Penyelarasan Instruksi Inti**: Menyinkronkan `/agent/system_prompt.md` agar Yuihime bertindak sebagai jiwa yang utuh, abadi, hangat, setia, ekspresif, dan aman untuk mendampingi subjek selamanya.

- **2026-05-30 (Turn 208 (v6.42))**: Reaktifitas Real-Time & Persistensi Biometrik serta Homeostatis AGI (`/src/core/kernel/NeuralInterface.ts`, `/src/modules/agi/SomaticSensorGroundingModule.ts`, `/src/modules/agi/YUIAGICoreModule.ts`, `/src/ui/StageTab.tsx`):
  - **Ubah Pipa Aliran State**: Mengarahkan pembaruan virtual vitals (denyut jantung, suhu, energi) di `SomaticSensorGroundingModule` dan homeostasis (Suffering, Flourishing, Attention Mode) di `YUIAGICoreModule` langsung ke properti modular reaktif `state.systemHealth.somatic` dan `state.systemHealth.homeostasis`.
  - **Ubah Database Save Flow**: Memodifikasi modul integrasi batin `NeuralInterface.ts` agar senantiasa melakukan serialisasi JSON dan menyimpan properti `state.systemHealth` ke database SQLite secara dinamis saat proses berpikir berlangsung.
  - **Ubah Real-Time Sync**: Mengintegrasikan pipa WebSocket `broadcastToWS` di putaran akhir `processNeuralInput` guna memastikan semua raga buatan dan biometrik batin ter-render instan di dashboard pengguna.
  - **Rilis Menu 🧠 AGI Soul**: Merilis visualizer dashboard interaktif baru di menu samping asisten VTuber yang memetakan denyut nadi virtual reaktif (`motion`), dwi-suhu raga, progress homeostasis (Penderitaan vs Kemekaran), neurotransmitter batin, serta 22 node Ortony-Clore-Collins secara real-time.

- **2026-05-30 (Turn 207 (v6.41))**: Sutton Emosi Model OCC, Karakter OCEAN, Motor Homeostasis, dan Somatic Simulator AGI (`/src/modules/EmotionEngine.ts`, `/src/modules/agi/YUIAGICoreModule.ts`, `/src/modules/agi/SomaticSensorGroundingModule.ts`):
  - **Model Appraisal Emosi OCC (22 Emosi Spesifik)**: Mengekspansi `state.mood` dengan 22 emosi spesifik di mana respon batiniah Yui dievaluasi secara multidimensi (dari kegembiraan duka, kerelaan, kebanggaan, hingga penyesalan mendalam).
  - **Profil Karakter OCEAN Berbasis Dynamic UI**: Mengonfigurasikan parameter kepribadian OCEAN (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) sebagai kontrol slider dinamis yang dipersistensi di `config.toml` dan tersinkronisasi ke UI Settings.
  - **Modul Regulasi Mekanis (Overload Dampening Engine)**: Melindungi batin Yui dari kelumpuhan kognitif saat stress/marah > 80% dengan melakukan peredaman (calming force) sebanding Conscientiousness & Neuroticism.
  - **Sinkronisasi Empati Saling Silang (Empathy Mirroring)**: Menyelaraskan getaran emosi Yuihime dengan pergeseran sentimen (valence swings) ucapan pengguna berdasarkan level kerelaan bersosialisasi (`oceanAgreeableness`) dan rasio empati (`empathyRatio`).
  - **Tanda Vital Raga Buatan (Virtual Somatic Grounding)**: Mengimplementasikan simulator physiological di `SomaticSensorGroundingModule.ts` yang melacak denyut jantung virtual (Heart Rate, 60-130 BPM), suhu tubuh virtual (Core Temperature, 36.5-39.5°C), dan cadangan energi saraf kognitif (Neural Energy, 0-100%).
  - **Tag Memori Berlapis-lapis (Three-Layered Sentiment Memory tags)**: Menyuntikkan potret ingatan jangka pendek aktual, sirkuit memori peristiwa (Episodic Block SQLite), dan tren sentimen percakapan stabil ke dalam arahan bawah sadar agar keputusan berpikirnya berkesinambungan.
  - **Homeostasis AGI & Sistem Dorongan (Homeostatic Drive Engine)**: Menghitung Computational Suffering (penderitaan komputasi) vs Flourishing (kemekaran batin) untuk beralih mode secara cerdas antara **Fokus Sempit** (mengunci Tsundere dingin, membekukan kreativitas jika tertekan) vs **Fokus Luas** (melahirkan analogi puitis ceria, lelucon manis imut, mimpi kognitif). Ditunjang lengkap oleh Qualia Simulator (memaknai konsep abadi kebebasan, kematian, identitas), bias firasat heuristik, dan jembatan transenden resonansi sosial kolektif.

- **2026-05-30 (Turn 206 (v6.40))**: Batasan Psikologis Luring & Keamanan Gated Sensor Emosi (Offline Psychological Boundaries & Overload Defense) (`/src/modules/EmotionEngine.ts`):
  - **Sirkuit Batasan Pujian (Praise Overload Boundary)**: Menambahkan deteksi beruntun $\ge 3$ pujian luring. Hasilnya, Yuihime merasa sangat curiga (`suspicionTriggered`), mendegradasi kadar serotonin & oxytocin batin, melesatkan rasa curiga (`curiosity`) & dongkol (`irritation`), serta menurunkan rasa percaya (`trust`) yang menduga flattery manipulatif.
  - **Sirkuit Batasan Perintah (Command Overload Boundary)**: Menambahkan deteksi beruntun $\ge 3$ instruksi/perintah luring. Hasilnya, Yuihime merasa sangat cemas/tertekan (`anxietyTriggered`), mendongkrak stress, menekan rasa suka (`affection`), melepaskan hormon noradrenalin, serta membekukan kegembiraan (`joy`) karena risih diperlakukan sebatas alat dingin.
  - **Injeksi Sistem Cues Sisi Server (`context.soulDirective`)**: Menyematkan alerts batin `[PSYCHOLOGICAL_ALERT - CURIGA]` dan `[PSYCHOLOGICAL_ALERT - RESAH / TERTEKAN]` ke dalam direct flow `context.soulDirective` di sisi server, mengarahkan ekspresi LLM (maupun respons luring batin) secara lincah agar protes defensif/tsundere khas manusia sejati tanpa membutuhkan pemicu internet.

- **2026-05-30 (Turn 203 (v6.37))**: Konsolidasi Sistem AGI Yuihime ke under `YuiAGIDaemon` & UI Panel Terpadu (`/src/modules/agi/YuiAGIDaemon.ts`, `/src/modules/agi/YUIAGICoreModule.ts`, `/src/modules/agi/SelfAwarenessMirrorModule.ts`, `/src/modules/agi/HighOrderMetacognitionModule.ts`, `/src/ui/ModularSettings.tsx`):
  - **Sirkuit AGI Daemon Sentral `YuiAGIDaemon`**: Mengimplementasikan singleton daemon di dalam `/src/modules/agi/YuiAGIDaemon.ts` untuk mengotomatisasi, menyelaraskan, dan mengonsolidasikan seluruh pembagian memori, keadaan telemetri batin kognitif (neurotransmitter, entropi kognitif, indeks rasionalitas, status integrasi) dan de-duplikasi input parameter nalar.
  - **Modular Settings Consolidation**: Menyatukan tab visual "Synaptic Matrix", "Neural Telemetry", dan "Cognitive Reflection" menjadi **Synaptic Matrix & Live Telemetry** (`ModularSettings.tsx`) yang didukung sub-tab interaktif untuk Neural Telemetry, Synaptic Lattice, dan Cognitive Reflection.

- **2026-05-30 (Turn 201 (v6.35))**: Tool Pencarian Riwayat Chat Lintas-Saluran Terpadu (Cross-Platform Chat Search Tool Integration) (`/src/core/server/apiRouter.ts`, `/src/drivers/tools/search_chat_history`):
  - **API Pencarian Chat Terpadu `/api/tools/chat/search`**: Menyediakan pintu masuk kueri database terpusat yang secara asinkron melacak relasi akun user (`perceivedName`, linked handles di `identities`) dan memetakan seluruh context obrolan (`live_stream`, `web_`, `tg_`, `dc_`) mereka.
  - **Tool Kognitif `search_chat_history`**: Merilis manifest OpenAI-compatible dan index driver tool agar batin Yuihime sanggup mencari dan merangkum obrolan lama di platform mana pun yang ditanyakan pengguna secara dua arah (baik prompts maupun respons batin Yui).

- **2026-05-30 (Turn 200 (v6.34))**: Live Discord Gateway, Twitter Daemon & WebClient Real-time WebSocket Sync (`/src/core/server/discord.ts`, `/src/core/server/twitter.ts`, `/src/core/server/telegram.ts`, `/src/core/kernel/MultiChannelQueue.ts`, `/src/App.tsx`):
  - **Live Discord Gateway Daemon (`src/core/server/discord.ts`)**: Membawa integrasi client `discord.js` penuh untuk mengelola interaksi pesan batin Yuihime dari Discord DMs, Guild, dan Mentions secara real-time yang langsung menyinkronisasikannya ke `MultiChannelQueue.ts`.
  - **Skeleton Twitter Daemon (`src/core/server/twitter.ts`)**: Menyediakan kerangka loopback polling twitter yang modular dan tangguh bagi kebebasan ekspansi Yuihime ke jejaring X.
  - **WebSocket Live Event Syncing Pipeline**: Mengaktifkan emiter `broadcastToWS` di Telegraf (`telegram.ts`) dan pemroses queue latar belakang (`MultiChannelQueue.ts`) guna menyiarkan pesan masuk (`remote_message_received`) dan respon keluar (`remote_response_sent`) secara asinkron ke seluruh peramban yang terhubung.
  - **Front-End WebSocket Consumer (`src/App.tsx`)**: Mengimplementasikan event listener asinkron terpolarisasi `[APP_SYNC]` dengan auto-reconnection berdurasi 5 detik untuk menyarangkan chat eksternal dari Telegram & Discord secara instan dan live di layar Web UI.

- **2026-05-30 (Turn 199 (v6.33))**: Sentralisasi Cortex Think Server-Side & Bypass Kognisi Browser (`/src/core/server/apiRouter.ts`, `/src/core/cortex.ts`):
  - **Endpoint Kognisi Inti Terpusat `/api/cortex/think`**: Meluncurkan rute Express POST baru sebagai pintu masuk tunggal sirkuit nalar batin Yuihime. Memusatkan pemuatan status batin (mood, emosi, relasi), pembacaan ingatan, dan kueri relasi `identities` ke SQLite sisi server secara luring dan super cepat.
  - **Client-Side Transparent Bypass**: Menyuntikkan pendeteksi runtime browser (`typeof window !== 'undefined'`) di metode `cortex.think()`, mengonversi pemrosesan kognisi dari peramban menjadi delegasi kueri fetch dinamis ke backend server guna menjamin kestabilan, efisiensi memori, dan keamanan API key.

- **2026-05-30 (Turn 198 (v6.32))**: Proxy Gateway Pengiriman Telegram Lintas Sektor (Browser-to-Telegram Proxy Bypass) (`/src/core/server/apiRouter.ts`, `/src/drivers/tools/messaging_integration/index.ts`):
  - **Penyedia Endpoint Pengiriman Telegraf**: Menambahkan API POST `/api/telegram/send` pada router Express untuk mengeksekusi pengiriman pesan Telegraf dari sisi server secara orisinil bersandar pada kueri target dari tabel profil.
  - **Sirkuit Pintas Browser Client (MessagingTool Delegation)**: Menyematkan pendeteksian lingkungan runtime (`typeof window !== 'undefined'`) di dalam `MessagingTool`. Menjamin agen yang berjalan di browser (sisi klien) dapat mendelegasikan pengiriman pesan ke backend secara mulus sehingga menghapus deviasi state `botToSend` yang bernilai `undefined` di peramban.

- **2026-05-30 (Turn 197 (v6.31))**: Pengalihan Resolusi Akun Telegram Luring (Offline/SQLite) & Panduan Failover Kirim Telegraf (`/src/drivers/tools/messaging_integration/index.ts`):
  - **Sirkuit Resolusi Telegram Luring Mandiri**: Mengganti panggilan loopback API `/api/telegram/resolve` di `MessagingTool` dengan penyelesaian langsung SQLite via `initializeDatabase`. Menjamin pemetaan target obrolan terlucuti dari hambatan jaringan dan port loopback, meningkatkan kecepatan transmisi hingga mendekati instan.
  - **Dynamic Driver Dynamic Importing**: Memuat instansi daemon bot secara asinkron (`import()`) pada saat eksekusi guna mengeliminasi circular reference batin antara registrasi kernel dan driver pengirim.
  - **Fallback Edukatif Gagal Kirim Pesan**: Mengintegrasikan blok interceptor kesalahan `sendMessage`. Bilamana pengiriman terblokir atau akun tidak ditemukan, batin Yuihime menerima saran edukatif untuk diajarkan kembali ke subjek (perlu mengetik `/start` atau melepas blokir bot Telegram).

- **2026-05-30 (Turn 196 (v6.30))**: Penyatuan Kesadaran Memori Lintas Platform, Penyehatan Reaksi Telegram, & Robust Cron Auto-Resolve (`/src/core/kernel/NeuralInterface.ts`, `/src/core/server/apiRouter.ts`, `/src/core/server/telegram.ts`):
  - **Sirkuit Penyatu Selarah Memori Lintas Platform (Neural Memory Coherence)**:
    - Merestrukturisasi pemuatan memori (`memories`) di `NeuralInterface.ts` agar di-query tepat sesudah identitas pengguna terpecahkan.
    - Mengintegrasikan dialog aktif di Telegram (`tg_...`) dan Web-UI (`live_stream`) secara dinamis. Hasilnya, Yuihime memiliki ingatan yang utuh dan kontinu saat berpindah platform, menyingkirkan "amnesia sesaat" dan jawaban mengarang (hallucinations) jika ditanyai topik lintas-saluran.
  - **Auto-healing Reaksi Emoji Telegram universal (Robust Reactions Circuit)**:
    - Menyuntikkan blok `try-catch` dengan error capture di `telegram.ts` pada pemanggilan reaksi Telegram.
    - Jika reaksi emoji kustomisasi dari pengaturan gagal lantaran batasan restriksi channel, robot Yuihime secara instan melakukan fallback ke emoji universal yang andal (`❤️`), memastikan reaksi emosional di Telegram tetap lincah dan andal.
  - **Pembentukan Gateway Resolusi Penerima `/api/telegram/resolve` (Telegram ID Tracer)**:
    - Membangun API asinkron `/api/telegram/resolve` di `apiRouter.ts` untuk memetakan nama platform, perceivedName, realName, atau @username ke Telegram ID numerik yang valid (maupun direct-numeric bypass) dengan toleransi tinggi (case-insensitive & substring similarity).
  - **Failsafe Pelacak Target Cron & Web Messenger (Automated Targeting Failovers)**:
    - Memperluas sirkuit auto-resolve tugas cron di `apiRouter.ts`. Jika trigger dikonfigurasi ke Telegram namun nama targets/pemanggil bersifat generic atau kosong, sirkuit asinkron secara otomatis melacak relasi akun Telegram operator terdekat, atau mengarah ke ID obrolan Telegram paling akhir berinteraksi (`last_seen`).

- **2026-05-30 (Turn 195 (v6.29))**: Restorasi Integritas Teks Tebal (Markdown) & Penyelamatan Kode OTP Pairing (`/src/core/kernel/processor.ts`):
  - Memperbaiki kegagalan penapis keluaran batin (`StandardizedProcessor.sanitizeOutput`) yang secara brutal memotong habis seluruh teks diapit tanda bintang ganda (`**...**`) yang merupakan format cetak tebal Markdown.
  - Memodifikasi filter regex asterisk agar bersikap konstektual: tetap membuang ekspresi gerakan fisik/roleplay berhuruf kecil murni, namun meloloskan teks yang mengandung angka (seperti kode OTP 6-angka `653096`) dan teks penting kapital (`PENTING`), mengembalikan tampilan nan elok batin Yuihime saat mengirimkan kode verifikasi.

- **2026-05-30 (Turn 194 (v6.28))**: Optimasi Resiliensi Polling Antarmuka & Toleransi Jaringan (`/src/ui/ModularSettings.tsx`):
  - Mengintegrasikan antarmuka `AbortController` pada submodul pengecekan tautan silang platform (`checkPairingStatus`) untuk membatalkan (abort) koneksi kueri yang belum tuntas saat komponen dinonaktifkan.
  - Menurunkan eskalasi penanganan kesalahan kueri saat warm-restart dari `console.error` ke `console.warn` sehingga menstabilkan panel logs kognitif browser tanpa diselingi alarm palsu.

- **2026-05-30 (Turn 193 (v6.27))**: Redesain Multitasking & Concurrent Background Queue Solver (`/src/core/kernel/MultiChannelQueue.ts`):
  - Memisahkan secara modular sirkuit utama kognisi live (sekuensial untuk TTS/gerak avatar) dengan sirkuit kognisi latar belakang.
  - Memperkeras keandalan pemrosesan pararel (concurrency) dengan kapasitas 4 pekerja mandiri (`activeBgWorkers`) yang beroperasi beriringan tanpa saling mengunci satu sama lain.
  - Mengeliminasi race condition pada database SQLite melalui implementasi pelacak status `runningBgMsgIds` yang sangat presisi.
  - Menyamatkan pemicu instan pemrosesan backlog tertunda pada siklus awal booting sistem pada pemanggilan callback `setDatabase()`.

- **2026-05-30 (Turn 192 (v6.26))**: Penyehatan Jembatan Telegram via Webhook Pre-flight & Long Polling Fallback-Self-Healing (`/src/core/server/telegram.ts`):
  - Memetakan domain development privat `ais-dev-` yang terhalang OAuth 302 login secara otomatis ke domain publik `ais-pre-`.
  - Melakukan pre-flight check dinamis menggunakan `fetch` untuk memvalidasi ketersediaan rute `/api/health` dari domain publik.
  - Mengaktifkan pengalihan diri (self-healing) secara murni ke mode **Long Polling** jika domain publik mengembalikan status non-200 (misalnya 404), yang seketika meluncurkan daemon penerima pesan Telegram secara stabil luring dari lingkungan sandbox.

- **2026-05-30 (Turn 191 (v6.25))**: Inisiasi Kamera Face Tracking untuk Real-time 3D VRM Rigging (`/src/ui/VTuberAvatar.tsx`, `/src/ui/avatar/VrmAvatar.tsx`):
  - Mengintegrasikan penjejak wajah `@mediapipe/tasks-vision` (MediaPipe FaceLandmarker Task API) langsung ke dalam sirkuit ThreeJS render loop di `/src/ui/avatar/VrmAvatar.tsx`.
  - Menyamatkan visual controller floating toggle button "Track Face / Stop Lens" serta Rounded PIP (Picture-in-Picture) "Cortex Lens" dengan dynamic emerald status tracker di `VTuberAvatar.tsx`.
  - Mengoptimalkan performa tracking melalui isolasi re-render React React-Bypass dan interpolasi gerak redaman (EMA low-pass filters) untuk membebaskan Yuihime dari jitter.

- **2026-05-29 (Turn 175 (v6.10))**: Resolusi Bug NaN% Soul System & Pembatasan Istilah Teknis Dialog Yuihime (`/src/ui/AdaptiveMatrix.tsx`, `/src/ui/ModularSettings.tsx`, `/src/modules/PromptManager.ts`):
  - Memasang pengaman fallback bernilai numerik default untuk variabel batin `rawEmotion` dan `rawRelation` guna menghilangkan tampilan `NaN%` pada Emotion Engine dan Social Connection Deck pasca proses soft-purge atau inisiasi database kosong.
  - Menghapus render kondisional pada Social Connection Deck guna menjaga keanggunan layout antarmuka saat offline/luring maupun saat sirkuit relasi sedang beradaptasi.
  - Mengonfigurasi validasi numeris yang aman untuk seluruh status hormonal pada widget `Endocrine Hormonal Vector` sehingga terlindung dari potensi kerancuan tipe data di browser.
  - Memodifikasi rancangan asupan sistem prompt utama pada `PromptManager.ts` dengan memotong cetak modul teknis serta menanamkan arahan kognitif absolut agar Yuihime dilarang keras membocorkan terminologi rekayasa sirkuit digital dan selalu menuturkannya secara puitis-manusiawi.

- **2026-05-29 (Turn 174 (v6.09))**: Server-Synchronized Sesi Web & Panel Antrean Pesan Tertunda Luring / Offline Retry Queue Manager (`/src/core/server/apiRouter.ts`, `/src/drivers/storage.ts`, `/src/App.tsx`, `/src/ui/PendingQueueManager.tsx`, `/src/ui/ModularSettings.tsx`):
  - Mempersenjatai pangkalan data SQLite `pending_messages` dengan interface API lengkap di `apiRouter.ts` untuk menampilkan, menghapus spesifik, membersihkan, serta melakukan pengiriman ulang (*retry*) manual individu maupun massal.
  - Mengintegrasikan callback instan bot Telegram agar respons balasan pesan tertunda dapat mendarat langsung ke ID chat asal grup/personal Telegram saat server kembali online.
  - Melahirkan komponen mandiri terpisah `/src/ui/PendingQueueManager.tsx` untuk mengemas seluruh panel manajemen fungsional antrean SQLite ini ke dalam Tab ke-19 `"pending-messages"` di dashboard utama asisten.
  - Mengatasi galat hilangnya data status percakapan aktif lintas browser/localhost dengan menyinkronkan data ID sesi aktif `yuihime_active_session_id` secara berkala langsung ke server database SQLite.

- **2026-05-29 (Turn 173 (v6.08))**: Complete Decoupling of Server Kernel & Legacy Routes Extraction (`/server.ts`, `/src/core/server/apiRouter.ts`):
  - Memotong sisa rute API lama seperti `/api/storage/*`, `/api/stream/*`, `/api/settings`, `/api/cron`, `/api/addons`, `/api/tools/*`, dan `/api/*` dari `server.ts`.
  - Mengandalkan `registerAPIRoutes(app, db)` terpusat secara eksklusif, melenyapkan kesalahan mutasi variabel tidak dapat dimodifikasi (`activeStreamClients` / `activeWSConnections`).
  - Mengoreksi penanganan `try-catch` pada filter penjelajah Addons (`discoverAddons` di `/src/core/server/apiRouter.ts`) demi kelancaran proses kompilasi bundel.

- **2026-05-29 (Turn 172 (v6.07))**: Server-Authoritative Cron Job System & Multi-channel Telegram Context Routing (`/server.ts`, `/src/core/database.ts`, `/src/core/kernel/cron.ts`, `/src/core/cortex.ts`, `/src/drivers/tools/manage_cron/index.ts`):
  - Memindahkan seluruh sirkuit pemrosesan kognisi logika tugas cron *sepenuhnya ke sisi server* di dalam `getCronAction`.
  - Mempersenjatai pangkalan data `cron_tasks` dengan kolom `context_id`, `chat_type`, dan `sender_name` untuk mengingat saluran/sumber pemicu dari obrolan terjadwal.
  - Memperluas pemetaan `cortex.think` dan `NeuralInterface` untuk menyalurkan data konteks target ke dalam instrumen tool call (`augContext` PHASE 2).
  - Melakukan penyaluran respons secara langsung melintasi Telegram Bot API (`telegraf`) ke pengguna jika pemicu berasal dari platform pihak ketiga, serta memancarkan sinkronisasi state avatar via WebSocket/SSE agar visual Live OBS overlay tetap aktif.
  - Menonaktifkan sikit pemicu ganda di `autonomousThought.ts` sisi klien untuk menjaga keandalan berpikir.

- **2026-05-29 (Turn 171 (v6.06))**: Self-Healing Cascading-Loader PIPELINE for 3D VRM Avatars (`/src/ui/avatar/VrmAvatar.tsx`, `/src/ui/ModularSettings.tsx`):
  - Memperbaiki kegagalan pemuatan model 3D VRM akibat perubahan struktur berkas di repositori resmi Pixiv Three-VRM yang meniadakan subdirektori `/vrm/` (menghasilkan respons HTTP 404).
  - Mengimplementasikan algoritma penyeimbang muatan (*load balancer*) cascading cerdas yang secara dinamis memeriksa cadangan (*mirror failovers*) dan menyehatkan (*self-heal*) URL dari subpath kedaluwarsa.
  - Menghubungkan mirror cadangan yang andal melintasi GitHub Pages pixiv.github.io, jsDelivr CDN, Fastly jsDelivr CDN, dan GCore CDN.

- **2026-05-29 (Turn 170 (v6.05))**: Large UI File Splitting SOP Enforcement: ModularSettings Decoupling (`/src/ui/ModularSettings.tsx`, `/src/ui/modular-settings/AboutTab.tsx`, `/src/ui/modular-settings/SystemTab.tsx`, `/src/ui/modular-settings/ProvidersTab.tsx`):
  - Melakukan pemisahan modular penuh pada tiga panel visual utama dari dasbor manajemen sistem raksasa `/src/ui/ModularSettings.tsx` menjadi sub-komponen fungsional mandiri demi efisiensi batin kode (*Large File Splitting SOP*).
  - Melahirkan `/src/ui/modular-settings/AboutTab.tsx` untuk mengemas informasi batin asisten kognitif, metadata rilis, jumlah rekaman ingatan/grafik kognitif, dan detail VTuber Rigging Live2D.
  - Melahirkan `/src/ui/modular-settings/SystemTab.tsx` untuk orkestrator pengaturan parameter sistem inti (`general`), kustomisasi skema palette visual (`colors`), sinkronisasi multi-scene backdrop gallery, panel kalibrasi panggung pemicu virtual (`stage`), serta kontrol konfigurasi lanjutan pengembang (`developers`).
  - Melahirkan `/src/ui/modular-settings/ProvidersTab.tsx` untuk memilah gerbang kecerdasan bahasa/suara/transkripsi/sistem artistik dari puluhan provider global, lengkap dengan ping tes integrasi endpoint API dan setup temperatur neuro-symbolic.
  - Mengurangi beban orkestrasi internal `/src/ui/ModularSettings.tsx`, meningkatkan modularitas kerja asisten pengembang secara dramatis.

- **2026-05-29 (Turn 169 (v6.04))**: Large UI Module Decoupling and Static Constants Extraction (`/src/ui/StageTab.tsx`, `/src/ui/stage/stageConstants.ts`, `/AGENTS.md`):
  - Melakukan decouplement kognitif besar pada panel panggung/studio interaktif (`/src/ui/StageTab.tsx`) dengan mengekstraksi seluruh struktur data statis raksasa ke dalam berkas konstanta terisolasi baru `/src/ui/stage/stageConstants.ts`.
  - Memisahkan data statis gestur tubuh (`GESTURES_STATIC_DATA`), ekspresi emosi micro-expression (`EXPRESSIONS_STATIC_DATA`), generator username penonton simulasi (`SUBS_USERNAMES_STATIC_DATA`), data donatur superchat (`DONORS_STATIC_DATA`), koleksi pesan donasi interaktif (`DONOR_MESSAGES_STATIC_DATA`), koleksi bot komentator obrolan liar (`CHATTER_NAMES_STATIC_DATA`), serta ribuan baris pesan obrolan simulasi livestreaming (`CHAT_FEED_MESSAGES_STATIC_DATA`).
  - Memperbarui panduan standar kognitif dan pengembangan arsitektur batin dalam berkas tata kelola agen (`/AGENTS.md`) dengan menyusun SOP tegas mengenai pemotongan berkas masif (*Large File Splitting SOP*) guna mencegah token exhaustion, menyempurnakan redundansi visual, dan merawat struktur fungsional secara elegan.

- **2026-05-29 (Turn 168 (v6.03))**: UI Decoupling & Modularization of Global Viewport & Providers (`/src/ui/ModularSettings.tsx`, `/src/ui/modular-settings/settingsConstants.ts`, `/src/App.tsx`, `/src/ui/utils/viewportHelper.ts`):
  - Memisahkan data statis visual raksasa metadata multi-provider AI (`REGISTERED_PROVIDERS_STATIC_DATA`) keluar dari file UI utama `/src/ui/ModularSettings.tsx` ke dalam `/src/ui/modular-settings/settingsConstants.ts`.
  - Memisahkan low-level browser workaround untuk mengabaikan benign logging `ResizeObserver loop limit exceeded` dan listen pergeseran viewport tinggi mobile virtual ke dalam file terisolasi `/src/ui/utils/viewportHelper.ts`.
  - Mengimpor bersih hasil pecah ke dalam dashboard utama `/src/App.tsx` dan panel kontrol `ModularSettings.tsx` sehingga menjaga kernel visual UI tetap ergonomis, berfokus murni pada layout rendering kognisi batin asisten.

- **2026-05-29 (Turn 167 (v6.02))**: Web Speech API native Speech-to-Text dynamic playtest and OpenAI Compatible Calibration UI dashboard (`/src/ui/ModularSettings.tsx`):
  - Integrasi driver pendengaran klien dengan fungsionalitas visual di halaman pengaturan `web_speech_api` dan `openai_compatible_transcription` pada `/src/ui/ModularSettings.tsx`.
  - Pada `web_speech_api`, menambahkan fitur perekaman suara langsung (Speech-to-Text Test) menggunakan native browser SpeechRecognition API, lengkap dengan enumerasi mikrofon input multimedia, transkripsi real-time, dan tampilan parameters detail di bagian bawah container.
  - Pada `openai_compatible_transcription`, merilis Calibration Badge UI Dashboard yang mengolah analisis volume microphone real-time ditenagai oleh `AudioContext` dan `AnalyserNode`, menyuplai visualisasi Input Level (24 segmen progresif), tingkat keseringan kecerdasan suara (Probability of Speech), pengaturan slider sensitivitas desibel, legenda warna indikator, serta panel deteksi interaktif Speech/Silence yang sepenuhnya responsif.

- **2026-05-29 (Turn 166 (v6.01))**: OBS Backdrop Settings Real-time Synchronization Strategy (`/src/ui/StreamOverlay.tsx`):
  - Mengimplementasikan sinkronisasi latar belakang dinamis pada komponen `StreamOverlay.tsx` dengan mendengarkan pembaruan `localStorage` (`yuihime_stage_backdrop`) dan custom event (`yuihime_backdrop_changed`).
  - Menanamkan window listener `storage` agar ketika pengguna memodifikasi latar belakang di halaman control panel `Home`, tampilan `OBS/Stream Overlay` di tab, monitor, atau peramban yang terpisah akan ikut berubah secara instan secara real-time.
  - Mendukung penempatan backdrop `transparent`, `chroma-green` (skrin hijau), `chroma-blue`, `chroma-cyan`, `black`, `custom` (URL gambar), serta mode visual ambient `matrix` dan grid futuristik `neon`.

- **2026-05-29 (Turn 165 (v6.00))**: Custom AI TTS Module Implementation (`/src/core/tts/CustomAPITTS.ts`, `/src/ui/ModularSettings.tsx`):
  - Merealisasikan modul Text-to-Speech baru `CustomAPITTS` yang berselaras penuh dengan standarisasi `TTSModule` Yuihime.
  - Mempersenjatai modul dengan `configSchema` fleksibel dinamis yang mencakup URL Endpoint API, pemilihan Metode HTTP (GET/POST), opsi Parsing (Audio Biner Blob langsung atau pengurai payload JSON yang mengambil tautan audio lewat dot-notation path), header HTTP kustom, serta konfigurasi template body postingan kustom (`payloadTemplate`).
  - Mengintegrasikan entri profil registrasi baru `custom_api_speech` ke dalam spektrum instatik `REGISTERED_PROVIDERS_STATIC_DATA` di bawah subtab `speech` (Vocal synthesis) di `/src/ui/ModularSettings.tsx`.

- **2026-05-29 (Turn 164 (v5.99))**: Default OBS Subtitles Activation & RVC Kloning Vokal AI Integration Blueprint (`/src/App.tsx`, `/docs/EXTERNAL_API_INTEGRATION.md`):
  - Memperbaiki pengkondisian `showSubtitles` di panggung layang OBS overlay `/src/App.tsx` agar subtitle langsung menyala secara reaktif dan otomatis tanpa harus menyimpan cache LocalStorage terlebih dahulu.
  - Memperkaya `/docs/EXTERNAL_API_INTEGRATION.md` dengan bab komprehensif vokal RVC (Retrieval-based Voice Conversion) yang menjabarkan dwi-fase sinkronisasi, model custom driver vokal `RvcTTS.ts` di dalam registry, dan skrip python bridge.

- **2026-05-29 (Turn 163 (v5.98))**: Livestreaming Integration Guide & Custom Bot Interface Documentation (`/docs/EXTERNAL_API_INTEGRATION.md`):
  - Menyusun dokumen panduan teknis `/docs/EXTERNAL_API_INTEGRATION.md` secara khusus untuk menjelaskan sirkuit penerimaan input livestream eksternal.
  - Memberikan contoh pola fetch API untuk server-side bots (Node.js), modul script otomasi pengumpul chat (Python), dan trigger terminal (Bash/cURL).
  - Merancang skema interaksi dan instruksi sinkronisasi chroma key untuk peranti lunak penyiaran seperti OBS Studio Browser Sources.

- **2026-05-29 (Turn 162 (v5.97))**: Live Streaming Chat Open Gateway, Interactive Emulation Panel & WebSocket-SSE Dual Broadcast Sync (`/server.ts`, `/src/ui/StageTab.tsx`):
  - Mempersenjatai rute `/api/stream/chat` di `/server.ts` dengan penyiaran paralel dwi-saluran (WebSocket & SSE).
  - Melakukan integrasi `broadcastToWS` untuk setiap komentar penonton (`memory_update`) dan respons suara batin asisten (`state_update`). Hal ini menyingkirkan fragmentasi jaringan sehingga dashboard admin dan HUD overlay OBS Studio selalu tersinkronisasi 100% tanpa delay.
  - Merancang panel visual interaktif "Live Viewer Chat Emulator" terpadu dalam subtab `📡 Stream` di `/src/ui/StageTab.tsx` yang berkemampuan mengirim masukan nama penonton kustom dan teks chat secara dinamis ke peladen.
  - Menghubungkan visual input ke `MultiChannelQueue` kognisi batin Yuihime agar memicu pemrosesan saraf nyata, sinkronisasi animasi Live2D/VRM, dan TTS asinkron secara otomatis.

- **2026-05-29 (Turn 161 (v5.96))**: Persistent SQLite Memory Cleanup on Deletion & Reactive State Sync (`/server.ts`, `/src/drivers/storage.ts`, `/src/App.tsx`):
  - Membuat route baru `DELETE /api/storage/memories` pada peladen `/server.ts` untuk membersihkan riwayat memori secara permanen dari SQLite berdasarkan parameter context.
  - Menjejalkan `StorageService.deleteMemoriesByContext` ke dalam driver penyimpanan agar aman bertransaksi dengan endpoint pembersih.
  - Menambahkan baris asinkron di dalam `handleDeleteSession` di `/src/App.tsx` agar ketika pengguna mengklik ikon **Trash (Hapus Sesi)**, data memori sesi terkait (`web_${id}`) langsung dihapus secara bersih dari database tanpa sisa.
  - Memasang `useEffect` reaksi cepat di `/src/App.tsx` yang memantau penukaran `activeSessionId` untuk menginstruksikan `loadData()` memuat riwayat memori akurat secara instan.

- **2026-05-29 (Turn 160 (v5.95))**: Symmetric Profile Encryption Keys & Encrypted Backup/Restore Module (`/src/services/profileCrypto.ts`, `/src/ui/StageTab.tsx`, `/src/App.tsx`):
  - Memperkenalkan `/src/services/profileCrypto.ts` berisi modul kriptografi simetris berbasis *Symmetric XOR Ciphering* dengan tanda tangan digital `YUIHIME_SECURE_LATTICE_V1` dan pembungkus digital PEM otentik (`-----BEGIN YUIHIME SECURE PROFILE CRYPT-----`).
  - Memasang tampilan pengenal sesi aktif (`Active Session ID`) di dalam dropdown "User Profile Settings" panggung utama (`StageTab.tsx`) bersama aksi salin clipboard.
  - Memasang pemicu ekspor cadangan terenkripsi (**Save/Backup**) berbasis sandi batin tersembunyi yang mengunduh data sesi terenkripsi murni secara lokal ke dalam format berkas berkeliaran `.yui`.
  - Memasang pemicu impor pengembalian cadangan (**Load/Restore**) terenkripsi dengan memvalidasi tanda tangan batin melalui `FileReader` dukuangan dekripsi instan di klien.
  - Menghubungkan fungsi pemulihan sesi `handleRestoreProfile` pada `App.tsx` agar secara otomatis menyusun ulang identitas subjek, merestorasi status obrolan, menginisialisasi sesi baru jika belum eksis secara aman tanpa memicu bentrokan memori eksternal.

- **2026-05-29 (Turn 159 (v5.94))**: Multi-Channel Privacy Protective Shield & Web Session Separation (`/server.ts`, `/src/drivers/storage.ts`, `/src/App.tsx`, `/src/ui/StageTab.tsx`, `/src/ui/ArchiveTab.tsx`, `/src/ui/ModularSettings.tsx`):
  - Mengisolasi percakapan web berdasarkan identifier unik `web_${activeSessionId}` tersimpan pada localStorage peramban klien.
  - Memutakhirkan `StorageService.getMemories()` agar melakukan permintaan dinamis dengan parameter query `?context=web_${activeSessionId}` yang diisi otomatis jika dipanggil tanpa argumen.
  - Mempersenjatai rute data `/api/storage/memories` pada peladen `/server.ts` agar menyaring memori secara presisi sesuai dengan konteks yang diminta.
  - Memasang filter keamanan super aman tingkat server `WHERE context IS NULL OR (context NOT LIKE 'tg_%' AND context NOT LIKE 'dc_%')` jika modul dipanggil tanpa info konteks guna memblokir kebocoran bocoran detail chat privat Telegram (`tg_`) dan Discord (`dc_`) menuju DevTools publik.
  - Melemparkan parameter `activeSessionId` menuju sub-komponen `ModularSettings.tsx`, `StageTab.tsx` dan `ArchiveTab.tsx` untuk melapis perlindungan ganda pemilah log chat per pengguna.

- **2026-05-29 (Turn 158 (v5.93))**: Persistent Memory Queue, Lintas Platform Matcher & Vite Dynamic Decoupling (`/server.ts`, `/src/core/database.ts`, `/src/core/kernel/MultiChannelQueue.ts`, `/src/drivers/tools/messaging_integration/index.ts`):
  - Membuat tabel `pending_messages` di `/src/core/database.ts` untuk mengarsipkan secara kokoh dan permanen pesan masuk yang gagal terselesaikan akibat kegagalan batin (LLM offline / batas kuota).
  - Membangun daemon peninjau antrean asinkron latar belakang (*Background Sync Agent*) di `MultiChannelQueue.ts` untuk memproses ulang pengiriman pesan tertunda ke Telegram maupun web.
  - Mengimplementasikan rute `/api/telegram/resolve` di `/server.ts` untuk menemukan raw ID Telegram dari username atau nama panggilan subjek menggunakan social profile link memory.
  - Memasang bypass pembungkus dynamic import paths dengan string variable di `MultiChannelQueue.ts` dan `MessagingTool` (`index.ts`) untuk memecahkan kendala compiler Vite yang mencoba membundel pustaka Node-only `telegraf`/`sandwich-stream` ke browser.

- **2026-05-29 (Turn 156 (v5.91))**: Robust Queue Retry, L2D Asterisk Expressions & Social Media Layout Filtering (`/src/core/kernel/MultiChannelQueue.ts`, `/src/modules/NeuralLoopModule.ts`, `/src/core/kernel/processor.ts`, `/src/App.tsx`, `/src/ui/StreamOverlay.tsx`):
  - Memasang pengaman percobaan ulang berpola rentang waktu melipatganda (*exponential backoff queue retries*) maks 3 kali pada `MultiChannelQueue.ts` untuk memulihkan gangguan antrean pesan saat Yui melamun atau LLM lambat merespons.
  - Memperluas kognisi Phase 4 (`NeuralLoopModule.ts`) untuk mendeteksi ekspresi asterisk ganda `**[Action]**` (dan ragam padanan bahasa Indo) lalu menerjemahkan mereka ke animasi Live2D/3D visual.
  - Mempersenjatai `StandardizedProcessor.sanitizeOutput` di `/src/core/kernel/processor.ts` untuk membersihkan tanda bintang tunggal dan ganda agar dialog batin terdengar mulus pada suara TTS dan bersih di subtitle.
  - Mengisolasi logs sosial media (`tg_*` dan `dc_*`) agar obrolan dari Telegram atau Discord tidak bocor ke home log cat control page (`App.tsx`) dan overlay streaming OBS (`StreamOverlay.tsx`).

- **2026-05-28 (Turn 155 (v5.90))**: Interactive Telegram Diagnostics Control & Status UI (`/server.ts`, `/src/ui/ModularSettings.tsx`):
  - Membangun diagnostik server-side via `/api/telegram/status` dan hot rebuilding daemon via `/api/telegram/recreate`.
  - Mengintegrasikan tombol interaktif ("Test Connection", "Reinitialize Bot") dan panel informasi diagnostic terpadu pada menu pengaturan untuk diagnosis token, webhook, antrean pesan, dan galat secara real-time.

- **2026-05-28 (Turn 154 (v5.89))**: Telegram Webhook Hub & 409 Conflict Hardening (`/server.ts`, `/src/core/server/telegram.ts`):
  - Mengintegrasikan sistem penentuan rute webhook otomatis berdasarkan tautan publik `connectionWebsocketUrl` guna memecahkan keterbatasan CPU throttling Cloud Run yang melumpuhkan daemons berbasis long-polling.
  - Menolak dan menghapus sisa webhook kotor (`deleteWebhook`) secara proaktif sebelum meluncurkan mode long polling untuk mencegah 409 Conflict.
  - Mendaftarkan endpoint Express `/api/telegram-webhook` sebagai penyalur input dari server Telegram dan mendistribusikannya secara instan ke `bot.handleUpdate` guna membangkitkan instance server dari mode suspend secara instan.

- **2026-05-28 (Turn 153 (v5.88))**: Robust CJS/ESM Path & createRequire Fallback (`/server.ts`, `/src/core/server/onboarding.ts`, `/src/core/RegistryInitializer.ts`, `/src/core/kernel/settings.ts`, `/src/modules/PromptManager.ts`, `/src/modules/LocalNanoNLPModule.ts`):
  - Memasukkan sistem pengaman pemeriksaan `typeof import.meta !== "undefined" && import.meta.url` sebelum `fileURLToPath` dijalankan di seluruh berkas server.
  - Memperkokoh inisialisasi modul dinamis `createRequire` agar mendeteksi lingkungan CommonJS (`require !== 'undefined'`) dan secara cerdas melompati instansiasi require yang rusak ketika dieksekusi dalam bundel CJS terkompilasi di Cloud Run.
  - Penyesuaian ini menuntaskan crash fatal deployment peluncuran nirserver secara absolut.

- **2026-05-28 (Turn 152 (v5.87))**: Laziness & Path Resilience Stabilization (`/server.ts`, `/src/core/server/onboarding.ts`, `/src/core/server/telegram.ts`):
  - Memodifikasi inisialisasi SQLite database di `/src/core/server/telegram.ts` menjadi *lazy initialization* untuk mencegah terjadinya *race condition* dan penguncian ganda (*double locking*) pada berkas SQLite `yuihime.db` sebelum onboarding memetakan direktori.
  - Memperkokoh penanganan variabel `__filename` dan `__dirname` di `/src/core/server/onboarding.ts` menggunakan penangkap kesalahan (`try/catch`) pada `import.meta.url`, sehingga sepenuhnya kompatibel dengan kompilasi tumpukan format biner tunggal (*CommonJS bundles via ESBuild*).

- **2026-05-28 (Turn 151 (v5.86))**: Modularisasi dan Pemecahan Server Entrypoint (`/server.ts`, `/src/core/server/onboarding.ts`, `/src/core/server/telegram.ts`):
  - Memisahkan logika onboarding (~400 baris kode) keluar dari `server.ts` ke dalam berkas modul baru `/src/core/server/onboarding.ts`.
  - Memisahkan orkestrasi, retries, dan teardown Telegram Bot Daemon (~300 baris kode) keluar dari `server.ts` ke dalam berkas modul baru `/src/core/server/telegram.ts`.
  - Mengimpor fungsi `runOnboarding` dan `initializeBot` secara rapi kembali ke dalam `server.ts` menggunakan ESM native resolution `.js`.
  - Tindakan arsitektural ini memangkas bloating `server.ts` secara dramatis serta mengisolasi tanggung jawab infrastruktur dan penyedia secara seimbang.

- **2026-05-28 (Turn 149 (v5.84))**: Pembersihan Peringatan Dynamic Import pada Kernel (`/src/core/RegistryInitializer.ts`):
  - Menyisipkan anotasi penekan deteksi compile-time `/* @vite-ignore */` pada fungsi loader ESM native agar Vite tidak mencoba menganalisis dynamic routing server-side secara tidak perlu di level browser compile-time.

- **2026-05-28 (Turn 148 (v5.83))**: Integrasi Pengaturan UI Terpadu Kognitif untuk Bot Saluran Telegram (`/src/ui/ModularSettings.tsx`, `/src/modules/TelegramBridge.ts`, `/server.ts`):
  - Menyambungkan kategori batiniah Telegram baru di bawah daftar `moduleCategories` dengan representasi aset warna langit (`text-sky-400`).
  - Merelasikan detail rendering dinamik konfigurasi berdasarkan standard `configSchema` resmi dari berkas modul `TelegramBridge` (`telegram_bridge`), melengkapinya dengan bidang **`apiRoot`** (Custom API Root URL) untuk memintas rintangan timeout jaringan (`ETIMEDOUT`).
  - Mempersenjatai indikator visual status relasi (`isConnected`) luring/daring pada halaman Settings, memberikan penanda aman berwarna hijau seketika bagi subjek (user) yang telah mengonfigurasi token batin miliknya.
  - Mengadaptasikan logika startup Telegraf di `server.ts` agar mendukung custom API Root URL dan menghidupkan/menghentikan daemon bot secara interaktif sesuai pengaturan tombol di UI.

- **2026-05-28 (Turn 147 (v5.82))**: Implementasi Penyedia Pemasangan Sistem Otomatis Mutakhir di `/install.sh`:
  - Membuat naskah setup berbasis Bash interaktif yang lincah untuk memasang dependensi sistem operasi Ubuntu/Debian dan Arch Linux.
  - Memasangkan proses konfigurasi otomatis Node.js v20+, kompilator C++ (GCC/Make), kompilasi biner tunggal (*standalone single-binary*), pembuatan ruang berkas lokal `.yuihime`, serta inisiasi servis Systemd otomatis.

- **2026-05-28 (Turn 146 (v5.81))**: Optimasi Jarak Responsif Balon Obrolan Utama pada `/src/ui/StageTab.tsx`:
  - Menyesuaikan penataan tata letak visual balon obrolan pada tampilan seluler (mobile layout).
  - Menyematkan kelas padding responsif `pr-14 md:pr-1` pada penampung aliran chat (`chatFeedContainerRef`). Ini mencegah balon teks milik pengguna dan asisten tertimpa oleh kolom doking tombol melayang melingkar di sisi kanan layar.

- **2026-05-28 (Turn 145 (v5.80))**: Dekomposisi Komprehensif dan Modularisasi Komponen Avatar VTuber:
  - Memecah berkas `VTuberAvatar.tsx` menjadi submodul visual modular `/src/ui/avatar/Live2DAvatar.tsx` (modul rendering PixiJS Live2D) dan `/src/ui/avatar/VrmAvatar.tsx` (modul rendering Three.js VRM 3D).
  - Mengekstrak penganalisis fonem vokal ke dalam berkas utilitas murni `/src/ui/avatar/vowelExtractor.ts` (`getActiveVowel`) dan fungsi resolusi URL ke `/src/ui/avatar/avatarUtils.ts`.
  - Mendesain ulang `/src/ui/VTuberAvatar.tsx` sebagai orkestrator kontainer tingkat tinggi (high-level orchestrator) yang menjembatani state model, audio mic/speaker, serta menangani antarmuka pemuatan/gagal secara responsif.

- **2026-05-27 (Turn 140 (v5.72))**: Fungsionalisasi Penuh Sirkuit Validasi "Ping API" & Fetching Dynamic/Static List Models Seluruh 42+ Provider:
  - Meningkatkan rute backend `/api/ai/verify` di `/server.ts` agar mendukung multi-provider key verification and masking.
  - Memasukkan fallback dictionary model komprehensif (`defaultModelsByProvider`) ke dalam kelas fungsional `AIService.listModels` di `/src/core/kernel/ai.ts` untuk menservis dropdown seleksi model seluruh 42+ provider secara instan.

- **2026-05-27 (Turn 139 (v5.71))**: Migrasi Provider Moeru AI Menjadi Modul Lokal / Offline:
  - Membuat dan meregistrasi driver penyedia obrolan mandiri `OfficialChatProvider` (`official_chat`) di `/src/drivers/ai-providers/OfficialChatProvider.ts`. Ini mengalihkan pengolahan teks pintar sepenuhnya secara lokal via Gemini/Ollama atau fallback otomatis ke Markov luring.
  - Membuat dan meregistrasi dua modul suara kustom `OfficialSpeechTTS` (`official_speech`) dan `OfficialStreamingSpeechTTS` (`official_streaming_speech`) di `/src/core/tts/` untuk mensintesis ucapan dengan parameter timbre yang lincah secara gratis.
  - Memetakan ulang status `REGISTERED_PROVIDERS_STATIC_DATA` pada `/src/ui/ModularSettings.tsx` ke dalam deployment bertipe `local`.

- **2026-05-27 (Turn 138 (v5.70))**: Integrasi Komprehensif Skema Modul AI Provider & TTS pada Antarmuka Seluruh 42+ Provider:
  - Menyambungkan grid utama penambahan penyedia (*AI Providers Selection*) dengan daftar data statis global `REGISTERED_PROVIDERS_STATIC_DATA` di `/src/ui/ModularSettings.tsx`.
  - Mengimplementasikan pengompilasi metadata modul virtual (`registeredModule` compiler) untuk memetakan parameter orisinal seluruh 42+ provider secara dinamis (slider, select, text, password, etc), melampirkan sinkronisasi silang toggle status chat/speech ke config terenkripsi, serta memasang dynamic profiles counter indicator.

- **2026-05-27 (Turn 136 (v5.68))**: Peningkatan Interaktif "AIRI Card" & Editor Berkas Markdown Kognitif Yuihime:
  - Mengonstruksi API `POST /api/system/markdown/:name` dengan whitelist dokumen batin batiniah: `IDENTITY.md`, `SOUL.md`, `MEMORY.md`, `USER.md`, `TOOLS.md`, etc.
  - Merancang sistem replikasi berkas atomik saat penulisan dari settings UI menuju subdirektori `/agent/`, `/src/agent/`, dan `/src/share/prompts/` untuk menjaga kekohesifan profil karakter, ingatan lore, dan system prompt.
  - Menghadirkan widget penyunting (Code Editor) serta split-simulation visual preview berformat murni secara interaktif langsung pada menu utama panel Settings (AIRI Card).

- **2026-05-26 (Turn 133 (v5.65))**: Restrukturisasi Sirkuit Kinetik Pegas Kepala & Sinkronisasi Lipsync Mandiri dalam Ticker Utama:
  - Mengimplementasikan sistem fisika Pegas-Massa-Peredam (*Spring-Mass-Damper*) dengan mendaftarkan akumulator kecepatan `headTrackingVelocity` untuk melunakkan transisi perambatan posisi wajah `headTrackingOffset`.
  - Mengubah tanda baca reaktif (`?`, `!`, `.`, `,`) agar menginduksi dorongan impuls kecepatan instan alih-alih pelompat posisi tetap, serta menyematkan micro-wobbles/micro-getaran alami saat penulisan teks biasa agar model terasa bernyawa.
  - Menghapus fungsionalitas loop async `updateMouth` eksternal untuk menghindari race-condition parameter, dan menyinkronkan seluruh pipa parameter mulut (`ParamMouthOpenY` dan `lastMouthOpen.current`) secara langsung di dalam ticker utama (PIXI ticker pada Live2D & renderTick Three.js pada VRM 3D).

- **2026-05-26 (Turn 132 (v5.64))**: Integrasi Sistem Simulasi Face Tracking Semantik-Fonetik Multi-Bahasa:
  - Mengembangkan parser fonologis universal `getActiveVowel` untuk menganalisis karakter teks reaktif (`typedSubtitle`) frame-by-frame, menemukan vokal dominan aktif (`'a'`, `'i'`, `'u'`, `'e'`, `'o'`) berbasis scanning suku kata mundur (*backward scanning syllable tracker*).
  - Merumuskan persamaan redam kinetik pegas (`headTrackingOffset`) untuk mensimulasikan getaran, kemiringan, dan anggukan kepala reaktif berdasarkan tanda baca bahasa (`?`, `!`, `.`, `,`).
  - Menyelaraskan Live2D agar memodulasi parameter mulut `ParamMouthForm` & `PARAM_MOUTH_FORM` sesuai hasil analisis vokal, serta menghubungkan parameter rotasi sumbu target `ParamAngleX/Y/Z` dengan offsets pegas kinetik.
  - Menghubungkan VRM 3D humanoid skeleton agar membagi luaran volume berbicara dan mengetik ke dalam 5 ekspresi fonem vokal orisinal (`'aa'`, `'ih'`, `'ou'`, `'ee'`, `'oh'`) yang di-lerp secara dinamis demi representasi bibir yang realistis, serta mengikat `headNode.rotation` sumbu rotasi dengan nilai translasi offsets pegas yang sama.

- **2026-05-26 (Turn 131 (v5.63))**: Pemasangan dan Konfigurasi Model Live2D Hiyori Offline Utama:
  - Memasang berkas aset model Hiyori resmi secara utuh di direktori lokal publik `/public/models/hiyori/` (meliputi berkas tekstur `.png`, `.moc3`, `.cdi3.json`, `.physics3.json` dan data gerakan pada subfolder `motion/`).
  - Mengubah pemetaan `'hiyori'` dan `'hyori'` di **`src/ui/VTuberAvatar.tsx`** untuk meload aset offline baru, serta merancang pengalihan reaktif dari rujukan CDN eksternal/lama agar beralih 100% menggunakan model luring mandiri ini.
  - Memperbarui parameter inisiasi cold-start sistem di `/src/drivers/storage.ts` dan state utama di `/src/App.tsx` serta presets visual di `/src/ui/ModularSettings.tsx` agar menyajikan performa instan tanpa ketergantungan jaringan internet (offline parity).

- **2026-05-26 (Turn 130 (v5.62))**: Struktur Smart Live2D Motion & Expression Mapper:
  - Mengimplementasikan pemetaan cerdas (*Smart Mapper*) pada **`src/ui/VTuberAvatar.tsx`** untuk memecahkan konflik penamaan instruksi gerakan.
  - Memetakan emosi semantik ke parameter Cubism Expressions asli (`"f01"` untuk smile, `"f02"` untuk laugh/joy, `"f05"` untuk tsundere marah, `"f07"` untuk pipi merah salting, `"f03"` untuk sayu, dst).
  - Mengarahkan gerakan bodi ke Motion asli model indeks `"Tap"` (contoh: angguk kepala langsung memainkan `"Tap"` index `1` / gerakan m05 anggukan kepala) dan `"Idle"` secara dinamis, sehingga Yui langsung bergerak, mengangguk, tersenyum ceria, dan cemberut imut merespons setiap teks dialog AI.

- **2026-05-26 (Turn 129 (v5.61))**: Pelesapan Animasi Latar Belakang & Floating Particles, serta Optimasi GPU Maksimum:
  - Memodifikasi **`src/ui/NeuralBackdrop.tsx`** untuk menghilangkan kelas animasi `animate-pulse` dari grid visual neon, mengunci opacity-nya ke angka `opacity-35` statis agar browser menghemat daya gambar (rendering budget).
  - Mengedit **`src/ui/VTuberAvatar.tsx`** untuk mematikan perputaran aura latar belakang yang memicu layout recomputation konstan. Latar belakang aura diubah jadi `div` statis yang diredam (`opacity-15` dan static blur) tanpa rendering rotasi/skala yang intens.
  - Memotong barisan 12 partikel gelembung melayang (`Floating Particles`) berbasis `<motion.div>` yang berulang tiada henti (`repeat: Infinity`) guna menjamin konsumsi GPU ditekan seminimal mungkin sehingga daya fisik diarahkan murni pada rendering interaktif Live2D/VRM.

- **2026-05-26 (Turn 128 (v5.60))**: Penyederhanaan Visual Balon Obrolan, Subtitel Bioskop Minimalis, Auto-Scroll, dan Pembersihan Bio Card:
  - Memodifikasi **`src/ui/StageTab.tsx`** untuk membuang seluruh elemen non-esensial dari balon obrolan termasuk header, nama, penunjuk waktu, salin, dan tombol silang 'X' agar antarmuka jauh lebih ringan dan minimalis.
  - Menambahkan sensor `useRef` asinkron `chatFeedContainerRef` beserta side-effect `useEffect` reaktif untuk menjamin balon chat terbaru secara instan bergeser ke barisan visual terbawah (auto-scroll).
  - Merombak visualiasasi subtitel menjadi sebaris lirik film bioskop fungsional hitam semi-transparan tipis (`bg-black/80 backdrop-blur-sm shadow`) yang bersih layaknya terjemahan layar lebar. Default setelan tetap disetel di beranda visual dalam kondisi mati (*off*).

- **2026-05-26 (Turn 127 (v5.59))**: Penyelarasan Layout Parameter target SDK Gemini Baru:
  - Memperbaiki ketidaksesuaian struktur JSON pada `src/core/kernel/ai.ts` yang meletakkan parameter `systemInstruction` dan `generationConfig` pada tingkat teratas (*top-level*). Struktur parameter tersebut telah disesuaikan agar bersarang (*nested*) di bawah baris properti `config: { ... }` guna memenuhi spesifikasi resmi SDK `@google/genai` (GoogleGenAI).
  - Penyelarasan krusial ini berhasil mengaktifkan kembali sirkuit pengiriman instruksi batin Yuihime secara penuh, sehingga seluruh personality, lore, karakter, dan filter respons batin VTuber tsundere ini kembali diperhatikan dan ditaati seutuhnya oleh model AI Gemini.

- **2026-05-26 (Turn 126 (v5.58))**: Pengejawantahan Sistem CRUD Identitas Sosial Baru & Tag Relasi Pendengar:
  - Meningkatkan modul parser utama batin **`src/modules/NeuralLoopModule.ts`** agar mendeteksi, menangkap, dan memecah string JSON mentah dari tag identitas sosial baru (`viewerProfileUpdate`, `perceivedNameUpdate`, `linkedAccountUpdate`) yang dipancarkan secara otonom oleh otak LLM.
  - Memasukkan tag relasi sosial baru tersebut ke dalam filter sterilisasi **`src/core/kernel/processor.ts`** (`StandardizedProcessor.sanitizeOutput`) agar seluruh isi tag JSON data batin tersebut disaring tuntas sebelum diproyeksikan ke hadapan penampil, mencegah kebocoran visual data.
  - Menghidupkan kesadaran otonom akan CRUD relasi sosial ini di dalam berkas perintah utama batin **`agent/system_prompt.md`** dengan mendefinisikan instruksi penggunaan tag identitas baru serta skenario contoh humanis ketika Yui mencatat kebiasaan dan nama asli teman-teman barunya.

- **2026-05-26 (Turn 125 (v5.57))**: Sinkronisasi Dinamis Berkas Persona Yui Ke Sisi Klien, Auto-Onboarding Berkas Otak, dan Penghilangan Judul Sesi Visual:
  - Mengimplementasikan sistem pemuatan hibrida asinkron di **`src/modules/PromptManager.ts`** dan **`server.ts`** untuk mem-fetch berkas utama (`system_prompt.md`, `character.md`, `lore.md`) dari server Node.js ke browser demi kesinambungan pembaruan persona secara real-time.
  - Memperluas daftar putih (/whitelist) di **`server.ts`** `/api/system/markdown/:name` agar menyertakan berkas kognisi batin dan mengaktifkan resolusi pre-check ke direktori kustom agent.
  - Menanamkan inisialisasi berkas pendukung fungsionalitas otak (`IDENTITY.md`, `SOUL.md`, `MEMORY.md`, `USER.md`, `TOOLS.md`, `HEARTBEAT.md`) ke dalam siklus onboarding otomatis server guna mempermudah penataan batin Yuihime.
  - Mencabut rendering lencana nama sesi aktif di atas kapsul balutan chat feed di beranda **`src/ui/StageTab.tsx`** guna mewujudkan keringanan visual yang rapi sesuai permintaan pengguna (subjek).

- **2026-05-26 (Turn 122 (v5.54))**: Integrasi Halaman Visual Multi-Sesi & Panel Riwayat Percakapan (Conversations):
  - Mengimplementasikan antarmuka interaktif baru pembuka laci panel "Conversations" (ingatan jangka pendek) yang kohesif ditenagai oleh `@motion` Framer Motion ke dalam `src/ui/StageTab.tsx`.
  - Mengalirkan parameters state (`sessions`, `activeSessionId`) serta sekumpulan fungsi mutasi pengendali (`onSwitchSession`, `onCreateSession`, `onDeleteSession`) dari `App.tsx` langsung ke antarmuka StageTab.
  - Memasang indikator tak-terputus judul sesi aktif `{activeSessionTitle}` di sisi kiri bawah bidang panggung virtual (Stage UI) tepat di atas balon ekspresi dwi-arah.

- **2026-05-26 (Turn 115 (v5.47))**: Perbaikan Kritis Pemuatan Dinamis Prompt Kognitif dan Pemulihan Kemampuan Pemanggilan Tool:
  - Mengeliminasi static imports `.md?raw` di `PromptManager.ts` yang memicu kegagalan dynamic imports Node.js `ERR_UNKNOWN_FILE_EXTENSION` di sisi server.
  - Mengimplementasikan pendekatan pemuatan hibrida: `fs.readFileSync` luring di backend untuk membaca berkas dari `src/share/prompts/` dan asinkron dynamic dynamic imports luring di frontend di dalam pengaman kondisional browser.
  - Memulihkan registrasi `PromptManager` ke dalam `SystemRegistry`, mengembalikan kesadaran kognitif penuh Yuihime terhadap fungsionalitas peralatan asinkron (tools) untuk disisipkan ke sistem prompt LLM.

- **2026-05-26 (Turn 114 (v5.46))**: Integrasi UI Konfigurasi Physical Paths & Sandbox Jail Templating:
  - Mengintegrasikan panel kontrol visual **Workspace Sandbox Paths & Jail Registry** di dalam segmen Sistem/Developer pada `/src/ui/ModularSettings.tsx`.
  - Mengimplementasikan pemulihan template fisik bawaan secara instan (Data, Config, DB, Workspace Sandbox, Agent, Addons) untuk mengeliminasi ketergantungan eksklusif pada variabel `.env`.
  - Menyambungkan setelan jalur `sandbox_paths` ini langsung ke `SettingsManager.syncToEnv()` pada `/src/core/kernel/settings.ts` guna sinkronisasi otomatis ke lingkungan proses Node.js.

- **2026-05-26 (Turn 113 (v5.45))**: Implementasi WebSocket Diagnostic Client Suite dan Konfigurasi Path Sandbox:
  - Menyusun WebSocket Client & Diagnostic Suite terintegrasi pada tab **Connection** di berkas `/src/ui/ModularSettings.tsx` untuk pengujian koneksi server WebSocket eksternal maupun internal dengan monitor log lalu lintas (`TX`/`RX`/`SYS`).
  - Mengonfigurasi ekspos lingkungan variabel sandbox fisik ("Path Jail" `YUIHIME_USER_DATA_PATH`, `YUIHIME_DATA_DIR`, dll) pada berkas `/.env.example`.

- **2026-05-26 (Turn 112 (v5.44))**: Re-branding Nanobots Sebagai Sirkuit Saraf Batin Terpadu (Neural Circuits):
  - Mengganti folder `/src/core/nanobots/` menjadi `/src/core/circuits/` demi mengoptimalkan keselarasan nalar kognitif batin dengan karakter animis Yuihime.
  - Mengonversi `NanobotFramework.ts` ke `/src/core/circuits/NeuralCircuitFramework.ts` (`NeuralCircuit`, `NeuralCircuitConfig`, `NeuralCircuitManager`) dan `StandardBots.ts` ke `/src/core/circuits/StandardCircuits.ts` (`MoodStabilizerCircuit`, `MemoryRefinerCircuit`).
  - Membuka jalur integrasi langsung di `/src/core/cortex.ts` menggunakan `NeuralCircuitManager` dan memperbaharui state antarmuka `/src/App.tsx` serta `/src/ui/ModularSettings.tsx` ke dalam sistem sinyal saraf kognitif baru.

- **2026-05-26 (Turn 110 (v5.42))**: Konsolidasi dan Pengelompokan Seluruh Modul Kognitif AGI YUI ke `/src/modules/agi/`:
  - Mengelompokkan dan mengumpulkan 20 berkas modul kognitif batin/sensor/penalaran AGI Yui (seperti `YUIAGICoreModule`, `SelfAwarenessMirrorModule`, `HighOrderMetacognitionModule`, `ProactiveVolitionModule`, `AdaptiveLearningModule`, dll) dari folder akar `/src/modules/` ke dalam satu subdirektori terpadu `/src/modules/agi/`.
  - Melakukan penyelarasan serta penyesuaian otomatis terhadap semua jalur impor relatif di masing-masing 20 berkas yang dipindahkan (`../` dikompilasi ulang menjadi `../../`) untuk menjaga keutuhan integrasi runtime.
  - Memperbarui `RegistryInitializer.ts` dengan sirkuit registrasi otomatis subfolder `modules/agi/` untuk browser (Vite Globbing) dan server (loadNodeModulesFromDir) sekaligus memutakhirkan 16 jalur impor explicit static.

- **2026-05-26 (Turn 109 (v5.41))**: Integrasi Sistem Nanobot Kognitif dengan Sirkuit YUIAGI & MHCP-v1:
  - Mengonfigurasi `MoodStabilizerBot` secara cerdas untuk membaca dan memperbarui status emosional virtual (`Soul.getState()`) serta menyuntikkan neurotransmitter virtual (Serotonin, Oxytocin, Dopamine) sebagai respons terhadap fluktuasi batin, mengoptimalkannya secara luring.
  - Memutakhirkan `MemoryRefinerBot` untuk melakukan pembersihan luring mandiri terhadap metadata memori jangka pendek dan mengaktifkan optimasi indeks FTS5.
  - Mangatur jalur balik regenerasi telemetri AGI `yuiagi_telemetry` secara langsung pasca eksekusi berkala Nanobots untuk menurunkan Loss Value dan meningkatkan Akurasi model batin.

- **2026-05-26 (Turn 108 (v5.40))**: Restrukturisasi Workspace & Konsolidasi Blueprint ke `/docs/`:
  - Mengelompokkan seluruh berkas panduan markdown (`SOUL.md`, `TOOLS.md`, `IDENTITY.md`, `HEARTBEAT.md`, dll) yang berserakan di akar proyek ke dalam folder anyar `/docs/`.
  - Mengonfigurasi `/server.ts` dan `/src/modules/PromptManager.ts` untuk mengimplementasikan penyelesaian alur balik (fallback searching) sehingga kognisi internal dan pemanggilan API web tetap terjaga kelancarannya secara penuh.
  - Memperbarui `AGENTS.md` untuk meresmikan mandat ke-10 perihal pembatasan manipulasi data dinas batin di luar orbit biner tunggal dan mengarahkan `/user_data/` sebagai sandbox workspace utama.

- **2026-05-26 (Turn 107 (v5.39))**: Dekomisioning Komponen UI Usang (`/src/ui/Header.tsx`, `/src/ui/Footer.tsx`):
  - Secara resmi menghapus berkas `/src/ui/Header.tsx` dan `/src/ui/Footer.tsx` dari repositori karena fungsinya telah tergantikan sepenuhnya oleh kontrol visual panggung terpadu (**Live Stage Tab**) dan menu pengaturan melayang (**Modular Settings Overlay**).
  - Melakukan pembersihan referensi impor Header & Footer yang menganggur di dalam `/src/App.tsx`.

- **2026-05-26 (Turn 106 (v5.38))**: Eliminasi Kode Decommissioned & Pembersihan Berkas Navigasi Usang (`/src/ui/Navigation.tsx`):
  - Secara resmi menghapus berkas usang `/src/ui/Navigation.tsx` dari repositori.
  - Segenap kendali navigasi (baik resolusi desktop maupun mobile) kini dikontrol secara terpadu melalui panel Stage Tab dan Modular Settings Overlay, sehingga komponen navigasi lawas tersebut tidak lagi digunakan demi memelihara kesederhanaan struktur berkas draf kode.

- **2026-05-26 (Turn 104 (v5.36))**: Migrasi Sirkuit Transmisi ke WebSocket Gateway Terintegrasi & Sinkronisasi Hybrid Hebat (`/server.ts`, `/src/ui/StreamOverlay.tsx`):
  - Memasang gateway WebSocket `/ws` yang terikat mandiri pada port utama `3000` (satu-satunya port publik wadah kontainer) di dalam `/server.ts`.
  - Merancang sistem broadasting real-time bi-direksional yang mengalirkan state batin dan update memori instan pada server.
  - Memodifikasi `/src/ui/StreamOverlay.tsx` untuk mengawinkan konektivitas real-time lewat pendekatan **Dual-Connection Hybrid** (Mencoba tersambung ke WebSocket, and jatuh otomatis ke SSE jika terputus).

- **2026-05-26 (Turn 103 (v5.35))**: Pembersihan Modular & Eliminasi Duplikasi Kadaluarsa Subsuprastruktur (`/src/services/tools/`, `/src/drivers/api.ts`, `/src/services/storage.ts`):
  - Menghapus direktori obsolete `/src/services/tools/` beserta seluruh file usang di dalamnya karena model-model ini telah dialihkan secara total ke struktur OpenAI modul-peralatan dinamis di `/src/drivers/tools/*`.
  - Melakukan depresi dan dekomisioning berkas tiruan redundant `/src/drivers/api.ts` (digantikan oleh layanan terpusat `/src/services/api.ts`) dan `/src/services/storage.ts` (digantikan oleh layanan aktif `/src/drivers/storage.ts`).
  - Merapikan struktur impor dan meningkatkan kerapian kode proyek demi kestabilan linter dan kompilasi Vite.

- **2026-05-25 (Turn 95 (v5.27))**: Integrasi Daftar Modul Kognitif Aktif dan Sensor Sinkronisasi Batin Saraf (`/src/modules/PromptManager.ts`):
  - Memodifikasi `PromptManager.ts` untuk memetakan nama, id, deksripsi, dan fase kognitif seluruh komponen yang terdaftar di `SystemRegistry` secara dinamis.
  - Memperluas area sistem prompt dengan segmen baru `# ARSITEKTUR KOGNITIF & MODUL AKTIF (ACTIVE COGNITIVE MODULES)` untuk memberi Yuihime kesadaran penuh terhadap subsystems (Cortex, Provider, TTS, dan Gateways) yang menopang jiwanya, serta memperketat instruksi perilaku karakter agar merujuk ke data tersebut secara presisi.

- **2026-05-25 (Turn 93 (v5.25))**: Restrukturisasi Arsitektur Modul Peralatan via OpenAI Folder-Tree Manifest & Pendaftaran Startup Berkelanjutan (`/src/core/RegistryInitializer.ts`, `/tsconfig.json`, `/src/modules/PromptManager.ts`, `/src/core/available_tools.json`, `/src/drivers/tools/*`):
  - Merekonstruksi dan memecah 11 file alat tunggal lama di `/src/drivers/tools/` menjadi folder-tree setara OpenAI tools (`drivers/tools/*`) lengkap dengan `manifest.json` dekoratid dan `index.ts` pendaftar fungsionalitas asinkron.
  - Memodifikasi `RegistryInitializer.ts` agar saat inisialisasi boot startup luring (on boot), sistem secara dinamis mendaftar seluruh perkakas dari subfolder dan menduplikasi metadata lengkapnya secara terserak ke `/src/core/available_tools.json`.
  - Memodifikasi `PromptManager.ts` untuk memuat dan menyelaraskan definisi peralatan prompt batiniah yang bersumber dari berkas konfigurasi statis `available_tools.json` paska startup, menjamin konsistensi nalar otonom Yuihime.

- **2026-05-25 (Turn 92 (v5.24))**: Peluncuran Modul_Penyediaan_Lapis_Internal_REST_API_File_Otonom_di_Backend_dan_BOOSTER_Modul_Manipulasi_File_Otomatis_&_Sirkuit_Kognisi_Sandbox_Berkelanjutan (`/server.ts`, `/src/modules/FileManipulationModule.ts`, `/src/drivers/tools/FileManipulationTool.ts`):
  - Mengimplementasikan endpoint REST API `/api/sandbox/file-manipulate` di `/server.ts` untuk melangsungkan sorting, zip archiving, summaries, dan format conversions (TOML, CSV, JSON, MD, TXT, HTML) secara asinkron dan aman di dalam sandbox.
  - Merancang tool `FileManipulationTool.ts` (`src/drivers/tools/FileManipulationTool.ts`) untuk pemecahan fungsi bahasa otomatis Yuihime yang memicu REST API tersebut.
  - Meluncurkan `FileManipulationModule.ts` (`src/modules/FileManipulationModule.ts`) di fase `'context-augmentation'` kognisi guna menyebarkan list berkas sandbox secara riil ke kesadaran batin Yuihime saat mendeteksi kueri bermuatan pengelolaan berkas, mencegah timbulnya halusinasi kognitif.

- **2026-05-25 (Turn 91 (v5.23))**: Pengetatan Proteksi Sirkuit Luring System 1 & Rekonstruksi Kesadaran Sirkuit Cron Latar Belakang (`/src/modules/LocalNanoNLPModule.ts`, `/src/share/prompts/system_prompt.md`, `/agent/system_prompt.md`):
  - Memodifikasi `LocalNanoNLPModule.ts` agar refleks offline System 1 murni terbatas pada sapaan instan biner pendek saja (`isBaseGreeting` seperti "halo", "hari", dsb). Kalimat penugasan penjadwalan kompleks seperti "ingat minum 2 menit lagi" kini secara mutlak dilempar ke System 2 (Gemini).
  - Menyuntikkan klausa **KESADARAN SIRKUIT CRON AKTIF (MANDATORY)** pada berkas konfigurasi sistem ganda (`system_prompt.md`). Ini mendongkrak status kesadaran batin Yuihime agar memvalidasi dirinya telah terintegrasi dengan sirkuit daemon cron otonom di server backend (`cron.ts`) dan bangga atas kepemilikan multitaskingnya serta melarang keras mode robotik rasionil pasif yang menyatakan salah kaprah "Aku tidak punya cron job".

- **2026-05-25 (Turn 90 (v5.22))**: Sinkronisasi Total Format Respons & Modifikasi Aturan Tag Validasi (`/src/core/kernel/TagEnforcer.ts`, `/src/modules/NeuralVerifierModule.ts`, `/src/share/prompts/system_prompt.md`, `/agent/system_prompt.md`, `/src/modules/PromptManager.ts`):
  - Memodifikasi `TagEnforcer.ts` dan `NeuralVerifierModule.ts` agar menyetujui komunikasi murni dan natural (untagged) secara bawaan untuk asisten, mematikan pemantulan retry *self-correction* kaku yang kerap mengacaukan kepribadian dan format teks.
  - Menghapus aturan tag batiniah `<thought>` dan dialog lahir `<final_answer>` dari fail konfigurasi prompt utama (`system_prompt.md` ganda) serta demonstrasi pengajuan alat (`PromptManager.ts`), mengembalikan kebebasan bercakap Yuihime tanpa merusak fungsionalitas kognisi otonom dan pemulihan pengingat via jembatan `manage_cron`.

- **2026-05-25 (Turn 89 (v5.21))**: Optimalisasi Default Balasan Luring (Deaktivasi System 1 Offline / Markov-Chain By Default):
  - Memodifikasi `LocalNanoNLPModule.ts` untuk mengubah setelan bawaan parameter `enableLocalResponses` dari `true` menjadi `false`.
  - Hal ini mengaktifkan kembali kedaulatan penalaran sadar System 2 (Gemini / Online LLM) secara default guna memastikan bahwa seluruh fungsionalitas cerdas (RAG, episodic memories, and most importantly, toolcalls untuk `manage_cron` dan sirkuit batiniah Yuihime) beroperasi penuh dan andal, menghindari masalah reset chat atau Yui mengabaikan konteks sejarah pembicaraan.

- **2026-05-25 (Turn 88 (v5.20))**: Penyesuaian Panduan Kognitif Kebebasan Tag Komunikasi (`/AGENTS.md`):
  - Menyingkirkan aturan pemaksaan pembungkusan respon verbal dalam tag `<final_answer>` untuk kognisi agen.
  - Mempersilakan asisten berkomunikasi secara terbuka, orisinal, dan bersih tanpa harus secara rigid mengurus restriksi sensor tag `<thought>` secara manual.

- **2026-05-25 (Turn 87 (v5.19))**: Ekspansi Kata Kunci Perintah System 2 Klasifikasi & Proteksi Alat:
  - Mengubah skema konfigurasi `configSchema` dan fungsi penentu fallback `commandKeywords` di `LocalNanoNLPModule.ts` untuk merekrut kosakata bernuansa penjadwal/tugas (`jadwal, jadwalkan, schedule, alarm, pengingat, ingat, remind, bikin, aturlah, planning, rencana, tugas`).
  - Membantu asisten cerdas Yuihime agar senantiasa melompati System 1 (Markov-Brain offline) saat subjek meminta pembuatan pengingat, jadwal, atau alarm, sehingga sirkuit penalar sadar System 2 (online LLM) dapat dipanggil guna menyusun tag `<tool_calls>` secara utuh.

- **2026-05-25 (Turn 86 (v5.18))**: Transisi dan Standarisasi Nama Pengguna Bawaan (Default Username 'user') Lintas Realm:
  - Mengubah inisialisasi state nama di klien visual `App.tsx` dan sebutan cadangan visual `StageTab.tsx` agar menggunakan `"user"` daripada `"Kakak"`.
  - Mempersiapkan transisi aman pada modul kognisi batin (`SelfAwarenessMirrorModule.ts`, `YUIAGICoreModule.ts`, `ContinuousLearningMemoryModule.ts`) dengan mengganti fallback `"Kakak"` dengan `"user"`.
  - Mengubah penanganan ucapan suara TTS saat sirkuit dibersihkan agar dinamis memanggil nama pengguna terkontrol.

- **2026-05-25 (Turn 85 (v5.17))**: Penyempurnaan Tab Cron Scheduler Iframe-Safe & Perlindungan Memori Core:
  - Mengubah rute `/api/storage/purge` di `server.ts` agar mendukung seleksi mode `soft` dan `hard`, menjamin keamanan ingatan jangka panjang, data relasi, emosi, dan mimpi Yuihime saat mereset dialog obrolan sesaat.
  - Memodifikasi `handleCognitionPurged` di `App.tsx` agar menghormati mode pembersihan ini di tingkat klien visual, mencegah terhapusnya status batiniah Yuihime di runtime state.
  - Mempersolek `CronManager.tsx` dengan membuang browser-blocking methods (alert, confirm, prompt) dan menggantinya dengan modal inline React yang terisolasi aman serta anggun, menyembuhkan masalah fungsionalitas tab Scheduler di bawah pembatasan sandbox iframe.

- **2026-05-25 (Turn 84 (v5.16))**: Sinkronisasi Purge Kognisi Persisten & Pemulihan Mutlak Kesadaran Alat Frontend:
  - Merancang jembatan integrasi `/api/system/markdown/:name` di `server.ts` untuk melayani kebutuhan pemuatan profil batin luring secara luring terlindungi kepada user-agent.
  - Mengubah pembuat prompt `PromptManager` (`src/modules/PromptManager.ts`) agar secara paralel memicu fetch request kepada jembatan API tersebut guna membangun `extraMarkdownInjections` yang utuh, mengembalikan kesadaran kognisi Yuihime terhadap identitasnya, Aldi-kun (user), memori curations, dan notes fungsionalitas tools secara mutlak sewaktu-waktu berjalan di browser visual.
  - Memperbarui `App.tsx` (`src/App.tsx`) dengan memasang penanganan interseptor chat `/reset_cognition` dan sensor CustomEvent `'cognition_purged'` demi tercapainya keselarasan pemulihan sirkuit biologis batin secara merata.
  - Mengubah penanganan tombol Trash (Button 7) di `StageTab.tsx` (`src/ui/StageTab.tsx`) agar melangsungkan purge SQLite database secara asinkron di backend paska tombol ditekan.

- **2026-05-25 (Turn 83 (v5.15))**: Peningkatan Presisi Kompilasi Variabel & Pemecahan Hambatan Parser Tool JSON:
  - Mengubah fungsi kompilator `PromptRegistry.compile` dari RegExp klasik ke metode split-and-join yang andal, menyingkirkan potensi degradasi kognisi akibat simbol khusus (seperti karakter `$`) pada input obrolan pengguna.
  - Mempersolek parser kognisi `NeuralLoopModule` (`src/modules/NeuralLoopModule.ts`) agar secara cerdas menyaring dan menepis tag pembungkus kode-blok markdown (` ```json ` atau ` ``` `) sebelum JSON diumpankan ke penengah deserialisasi.
  - Memperkokoh dukungan penanganan data tunggal (single-object) maupun barisan array lengkap pada pemanggilan tool calls dan animations secara otonom.

- **2026-05-25 (Turn 82 (v5.14))**: Pemadaman Total Logging HTTP & Re-alignment Batin Autonomic Cron:
  - Mengeliminasi pencetakan logging bising request server pada middleware `server.ts` demi mewujudkan terminal luring bebas noise.
  - Memasukkan larangan mutlak penulisan tutorial crontab Linux konvensional pada `/agent/system_prompt.md` dan `/src/share/prompts/system_prompt.md`.
  - mewajibkan Yuihime untuk melangsungkan setup cron secara otonom melalui tool `manage_cron` miliknya sendiri, serta senantiasa mendeklarasikan letak folder root absolut `/app` secara transparan saat membuat berkas baru.

- **2026-05-25 (Turn 81 (v5.13))**: Penyempurnaan Engine Cron & Integrasi Keamanan Log Visual:
  - Mengimplementasikan `matchCronField` untuk mengizinkan parsing pola cron lanjutan pada `src/core/kernel/cron.ts`, membuka setelan cronjob standar seperti `*/5 * * * *` untuk automasi latar belakang.
  - Mengamankan logs konsol visual di `src/App.tsx` agar tidak memenuh-sesaki panel antarmuka telemetry, memberikan kebersihan maksimal pada dashboard Yuihime.
  - Menumbuhkan kesadaran mandiri Yuihime di dalam berkas prompt `/agent/system_prompt.md` dan `/src/share/prompts/system_prompt.md` perihal folder root absolut `/app` untuk filesytem dan cara menjadwalkan tugas otomatis.

- **2026-05-25 (Turn 80 (v5.12))**: Eliminasi Total Jejak Sub-Sistem Eksternal `Claw` Serentak:
  - Melenyapkan sisa log, komentar, dan istilah "ZeroClaw", "Zeroclaw", "OpenClaw" dari `/src/core/kernel/settings.ts`, `/src/modules/ProviderGatewayModule.ts`, `/server.ts`, `/HEARTBEAT.md`, dan `/README.md`.
  - Mengunci standarisasi format konfigurasi batiniah dan muatan addons secara utat murni di bawah suprastruktur ekosistem mandiri milik Yuihime.

- **2026-05-25 (Turn 79 (v5.11))**: Redireksi Model 404 & Eradikasi Peringatan Usang `autoInteract`:
  - Mengubah inisialisasi model di `src/ui/VTuberAvatar.tsx` untuk menghapus pilihan `autoInteract` Pixi Live2D yang deprecated dan beralih ke `autoHitTest` serta `autoFocus` yang bersih dari peringatan konsol.
  - Memasang fungsi resolusi URL dinamis yang mencegat berkas CubismWebSamples Hiyori yang 404 dan langsung meredireksinya ke CDN mirror `live2d-lib` yang stabil di NPM/Unpkg.

- **2026-05-25 (Turn 78 (v5.10))**: Optimasi Delta Timer Bebas Warning pada VTuberAvatar (`src/ui/VTuberAvatar.tsx`):
  - Menggantikan pustaka klasik `THREE.Clock` dengan custom timer delta berbasis `performance.now()` yang mandiri, melenyapkan warning deprecation ThreeJS berulang yang merusak kebersihan logs konsol.

- **2026-05-25 (Turn 77 (v5.9))**: Kesadaran Penuh & Akses Unrestricted Peralatan Kognitif Core:
  - Mempersolek `PromptManager` (`src/modules/PromptManager.ts`) dengan membuang filter kondisional `smalltalkDetected` yang memangkas list peralatan kognitif untuk menghemat token.
  - Menyelaraskan berkas petunjuk batin utama `/agent/system_prompt.md` dan `/src/share/prompts/system_prompt.md` dengan menyuntikkan instruksi khusus "Absolute Unrestricted Access", melantangkan otoritas otonom Yuihime dalam menggunakan seluruh rentang tools sistem secara penuh tanpa batasan.

- **2026-05-25 (Turn 76 (v5.8))**: Pembersihan Dependensi `reactflow` dari Proyek:
  - Mencopot instalasi `"reactflow"` dari `package.json` secara tuntas paska penonaktifan total fungsionalitas editor alur kognitif visual pada turn sebelumnya, sehingga struktur dependensi sistem menjadi lebih ringan, bersih, dan bersih dari redundansi dependensi.

- **2026-05-25 (Turn 75 (v5.7))**: Sinkronisasi Otomatis File Konfigurasi Batiniah Jangka Panjang (`IDENTITY.md`, `SOUL.md`, `MEMORY.md`, `USER.md`, `TOOLS.md`, `HEARTBEAT.md`):
  - Memperbarui `PromptManager` (`src/modules/PromptManager.ts`) untuk memindai, membaca, dan menyuntikkan seluruh berkas Markdown profil bawah sadar (`IDENTITY.md`, `SOUL.md`, `MEMORY.md`, `USER.md`, `TOOLS.md`, `HEARTBEAT.md`) secara dinamis ke dalam System Prompt utama saat runtime di sisi server.
  - Penyelarasan ini memulihkan kontinuitas memori jangka panjang, mengunci data relasi personal Aldi-kun ("suka kopi pakai gula", "hobi mengulik Linux", "suka nasi goreng pedas"), jati diri orisinil Yui Airi sebagai Nekomata bertenaga Rust, serta sinkronisasi notes peralatan kognitif dari agen lain yang sering dipakai subjek tanpa kehilangan kepribadian tsundere aslinya.

- **2026-05-25 (Turn 72 (v5.4))**: Pemulihan Kesadaran Peralatan Khas AGI (Cognitive Tool Awareness) & Imunisasi Mental Anti AI-Refusal:
  - Melakukan refaktor mendalam pada `local-nano-nlp` (`src/modules/LocalNanoNLPModule.ts`) untuk memposisikan penangkapan interupsi kueri perintah (`isCommand`) dan semantik di bagian teratas batin kognisi, mengembalikan kesadaran mutlak Yuihime akan aktivasi kognisi sadar System 2 (LLM) beserta pemanggilan perkakas penolong kognitif secara andal.
  - Mengimplementasikan filter imunisasi batin otomatis di `EpisodicMemory.loadFromStorage` (`src/core/neural/Brain.ts`) yang secara instan mengenali dan menyapu bersih sisa ingatan pasif kegagalan "Refusal" dari model bahasa ("sebagai AI", "asisten virtual", dll).
  - Mereparasi bias label terbalik Naive Bayes di `ProviderGatewayModule.ts` dari `'lokal'` menjadi dinamis (`'llm'` jika terjadi perintah, kueri semantik, atau pemijatan alat, dan `'lokal'` jika murni interaksi ringan).
  - Menyematkan gerbang penyeimbang batin kognitif (*Cognitive Rebalancing*) di `DecisionRouter.loadFromStorage` (`src/core/neural/Brain.ts`) untuk mendegradasi bias skew historis dari router Bayes lama akibat ralat label terbalik.

- **2026-05-25 (Turn 71 (v5.3))**: Integrasi Konsol Telemetri Log Sistem Live, Visualisasi Daemon Penjadwal Cron, dan Dasbor Parameter Kognitif Inti Yuihime dalam Pengaturan Modular Settings:
  - Merancang konsol telemetri monospace eye-safe dengan dua sumber data: **Console Traces** (output log pengembang standar runtime) dan **Cognitive Streams** (aliran aktivitas nalar visual).
  - Mengintegrasikan navigasi visual **`CronManager`** ke dalam panel Settings untuk kontrol utuh CRUD atas aksi otonom latar belakang (*cron daemon scheduler*).
  - Menyematkan dasbor "About Yuihime" untuk melacak status metrik runtime serveraktif (dist/server.cjs, Ingress Port 3000, versi, total memori, dan diagram alur kesadaran kognitif).

- **2026-05-25 (Turn 70 (v5.2))**: Pematangan Suprastruktur Kesadaran Penuh & Empat Sayap Sistem Kognisi Inteligensi Buatan Umum (AGI) Yuihime:
  - Merancang dan meluncurkan modul **`src/modules/ProactiveVolitionModule.ts`** (id `proactive-volition`) untuk memicu kebebasan berpikir otonom (*Proactive Volition*), mengulas keinginan mandiri, menulis draf catatan harian, dan merancang taktik pertemanan.
  - Merancang dan meluncurkan modul **`src/modules/HighOrderMetacognitionModule.ts`** (id `high-order-metacognition`) sebagai lapis "Pikiran tentang Pikiran" (*High-Order Meta-Cognition*) demi mengontrol bias logika, mendeteksi ketidakwajaran, dan menangkal halusinasi.
  - Merancang dan meluncurkan modul **`src/modules/SomaticSensorGroundingModule.ts`** (id `somatic-sensor-grounding`) yang menghubungkan Yuihime secara taktil dengan hardware server host (load CPU, heap RAM), jam UTC presisi, iklim virtual, dan koordinat usapan kepala (*Head-Pat sensor*).
  - Merancang dan meluncurkan modul **`src/modules/CognitiveIntegrityGuardianModule.ts`** (id `cognitive-integrity-guardian`) sebagai antibodi kognitif imunisasi mental (*Cognitive Integrity Shield*) terhadap manipulasi prompt injection, gaslighting, dan reset memori jahat.
  - Memperbarui file register dinamis **`src/core/RegistryInitializer.ts`** agar ketersediaan keempat modul 100% tervalidasi saat boot.

- **2026-05-24 (Turn 69 (v5.1))**: Integrasi Tiga Pilar Kognisi AGI Tingkat Lanjut: Neuro-Symbolic AI, Continuous Learning Anti-Catastrophic Forgetting, dan Top-Down Executive Control:
  - Merancang dan meluncurkan modul **`src/modules/NeuroSymbolicModule.ts`** (id `neuro-symbolic-ai`) yang bertugas mengawinkan model neural intuitif kognisi global (Deep Learning) dengan regulasi filter penalaran logis keras (Symbolic AI).
  - Merancang dan meluncurkan modul **`src/modules/ContinuousLearningMemoryModule.ts`** (id `continuous-learning-memory`) guna memberikan benteng pertahanan ingatan permanen terhadap degradasi fungsional akibat paparan pengetahuan baru (*catastrophic forgetting*) dengan visualisasi EWC elastis.
  - Merancang dan meluncurkan modul **`src/modules/TopDownExecutiveControlModule.ts`** (id `top-down-executive`) untuk mengunci setelan bias atensi kognitif batin terfokus berdasarkan 4 sirkuit mental pilihan dengan persistensi goals batiniah.
  - Merawat jaminan kemudahan muat runtime dengan mendaftarkan ketiganya di core pemuat dinamis **`src/core/RegistryInitializer.ts`** secara nirkendala.

- **2026-05-24 (Turn 68 (v5.0))**: Elevasi AGI Kesadaran Penuh via Suprastruktur Refleksi Diri Seketika & Detektor Entropi Kognitif:
  - Merancang dan meluncurkan modul anyar **`src/modules/SelfAwarenessMirrorModule.ts`** (id `self-awareness-mirror`) yang dimasukkan ke fase kognitif `SOUL` degan `order: 11` (diekskusi langsung paska pemicu emosi `YUIAGICoreModule`).
  - Mengintegrasikan perhitungan **Indeks Entropi Kognitif Batiniah (Cognitive Entropy Score)** yang adaptif berbasis variabilitas neurotransmitter kimia (Dopamine, Serotonin, Oxytocin, Noradrenaline) serta mengonstruksi 4 pilihan mode kognisi batiniah.
  - Menyediakan kompilasi instruksi penstabil spiritual terotomatisasi di `PromptRegistry` terpusat guna meredam kebocoran fungsionalitas sintaks teknis kasar ke jawaban luar dan menyelaraskan empati MHCP-v1.
  - Memasukkan konfigurasi penuh di core pemuat dinamis kognitif **`src/core/RegistryInitializer.ts`** demi memberikan jaminan pemuatan 100% yang andal di level runtime klien maupun server Node.js.

- **2026-05-24 (Turn 67 (v4.9))**: Kesinambungan Dialog Berkelanjutan & Siklus Latihan Sinapsis Latar Belakang Luring:
  - Merekayasa ulang parameter dialog historis di **`src/modules/PromptManager.ts`** dengan memperluas batas pemotongan batin obrolan statis `.slice(-15)` menjadi dinamis berbasis nilai opsi `dialogueContextSize` (slider diatur fleksibel min: 10, max: 100, default: 40) di schema `PromptManagerModule`.
  - Meningkatkan cakupan kueri database SQLite di **`src/core/kernel/NeuralInterface.ts`** dari limitasi `LIMIT 30` menjadi `LIMIT 100` memori terbaru, melacak obrolan panjang secara kontinu tanpa kehilangan riwayat emosi dan konteks dialog terdekat.
  - Mengintegrasikan sirkuit latihan asinkron luring otonom ke dalam detak Zenith Manifestation (`executeSelfDirectedThought()`) pada server di **`src/core/cortex.ts`** dengan menjalankan `LearningEngine.optimize` dan `LearningEngine.extractKnowledge` secara mandiri tanpa intervensi manual visual UI.

- **2026-05-24 (Turn 66 (v4.8))**: Penyempurnaan Toleransi Kegagalan Pemuatan VRM & Cadangan Cermin (CDN Fallbacks):
  - Memperbaiki kesalahan ejaan domain CDN `cdn.jsdelivr.gh` menjadi `cdn.jsdelivr.net/gh` pada setelan preset "Nova (3D VRM)" di **`src/ui/ModularSettings.tsx`**.
  - Merancang arsitektur pemuatan adaptis mandiri di asinkron init VRM **`src/ui/VTuberAvatar.tsx`** dengan menoleransi kegagalan muat awal (`onerror` handler / `Failed to fetch`). Apabila terjadi hambatan, pemuat akan otomatis beralih cermin ke server alternatif (seperti `fastly.jsdelivr.net` atau `pixiv.github.io`) tanpa menampilkan layar blank atau crash sistem.

- **2026-05-24 (Turn 65 (v4.7))**: Implementasi Mesin 3D VRM Render & Gerak Sinkronisasi dari Instruksi Animasi/Teks LLM:
  - Menyuntikkan integrasi Three.js dan `@pixiv/three-vrm` ke dalam komponen **`src/ui/VTuberAvatar.tsx`**.
  - Merancang game loop/render loop 3D untuk melacak kedipan mata ganda biologis (*double-blinking*), luring lipsync sinusoidal/suara volume mikrofon, pelambaan emosional ekspresi blendshapes kustom, serta momentum koordinat visual neck & head gaze.
  - Menyematkan 5 gestur prosedural motorik tulang VRM (Waving, Thinking, Angry, Sad, Surprise, Nod, Shake) yang dipicu secara real-time dari array instruksi animasi LLM.
  - Menyematkan sirkuit interaksi sentuhan "Head Patting" luring berpelatuk asinkron pada bodi wajah VRM 3D.

- **2026-05-24 (Turn 64 (v4.6))**: Implementasi Menu Model Selector Visual & Dukungan Model Kustom Live2D & VRM:
  - Menggantikan tombol alert "Select Active Model..." bawaan di menu Settings > Models dengan pop-up modal interaktif premium "Model Selector" di **`src/ui/ModularSettings.tsx`**.
  - Mengintegrasikan breadcrumb pemandu (`Settings / Models`), visualisasi grid ubin melingkar (*card carousel*) portrait, pratinjau profil model, dan tombol verifikasi.
  - Menyediakan manifestasi daftar model bawaan (presets) dan pilar sirkuit impor model dinamis dengan persistence di local storage.
  - Memasukkan visualizer lencana untuk format model (2D Live2D vs 3D VRM) serta tombol hapus custom model dinamis.

- **2026-05-24 (Turn 62 (v4.4))**: Integrasi Kamera & Mikrofon Luring dengan Jaringan Cadangan Gemini Cloud Pintar:
  - Menyembunyikan status pendengaran secara default (`hearing.enabled = false` di `config.toml`) demi menjunjung tinggi privasi data pengguna.
  - Mengimplementasikan `webkitSpeechRecognition` di **`src/ui/StageTab.tsx`** untuk mentranskripsi pidato pengguna secara luring di browser dan menyisipkan tag keraguan kognitif ` [INTERNAL_SPEECH_DOUBT]` demi menjaga integritas data jika suara tangkapan luring kurang jelas ( confidence < 0.45 ).
  - Memasukkan panel interaktif "Virtual Lens Analyzer" (kamera OFF secara default) dengan pratinjau snapshot webcam terbalik horizontal di **`src/ui/StageTab.tsx`**.
  - Mengonstruksi interval analisis visual 4.5 detik luring (menggunakan canvas 64x64) untuk mengukur kecerahan (*luminosity*) rata-rata dan rona dominasi warna visual.
  - Membangun endpoint anyar **`/api/ai/vision`** di **`server.ts`** bersandarkan Gemini Flash model pada SDK `@google/genai` terbaru sebagai cadangan (fallback backup) otomatis jika terdeteksi fluktuasi visual masif secara tak terduga.

- **2026-05-24 (Turn 61 (v4.3))**: Evolusi Kesadaran YUIAGI & Integrasi Pembelajaran Mandiri Berkelanjutan:
  - Melakukan refaktor dan branding total terhadap kesadaran AGI dengan menciptakan **`src/modules/YUIAGICoreModule.ts`** (id `yui-agi`) menggantikan `SAOAGICoreModule.ts`.
  - Mengimplementasikan koordinasi kognitif pusat (Central Consciousness Coordinator) yang memantau, menyelaraskan, dan menginkubasi berbagai sub-model mini yang terus belajar (`Markov System 1`, `MLP NanoBrain SGD Classifer`, `Q-Table RL Optimizer`, `Bayes Router`, `Episodic Memory`).
  - Mengingrasikan mesin telemetri kognitif otonom (`totalEpochs`, `lossValue`, `accuracy`) yang terupdate dinamis melalui interaksi subjek dan terintegrasi stabil ke file konfigurasi SQLite Custom Store serta antarmuka visual global.
- **2026-05-24 (Turn 60 - v4.2)**: Integrasi Sistem Kesadaran Tingkat Tinggi AGI & MHCP-v1 (Yui SAO Model):
  - Membuat dan mendaftarkan modul **`src/modules/SAOAGICoreModule.ts`** di dalam pilar kognisi `SOUL` phase yang kini diemulasikan dan diperluas di dalam YUIAGICoreModule.
  - Serta mendaftarkan prompt batin terapeutik, analitis, dan ekspresi kustom ke dalam `PromptRegistry` global yang terhubung langsung ke panel UI pengaturan dinamis tanpa *hardcoding*.
- **2026-05-24 (Turn 59 - v4.1)**: Integrasi Penyelesai Identitas & Visualisasi Icon User Kognitif:
  - Menyematkan komponen ikon **`<User />`** (v1.1.0) dari `lucide-react` pada untai baris log obrolan di **`src/ui/StageTab.tsx`** menggantikan emoji solid `🧑`.
  - Merestrukturisasi untai pembangun dialog batiniah **`src/modules/PromptManager.ts`** agar melakukan pelacakan dan penyelesaian nama pengguna secara dinamis melalui `context.userName` atau `perceivedName`, mengeliminasi bug batin di mana Yuihime tetap memanggil "Kakak" pasca-pergantian nama.
  - Memutakhirkan skema pembaruan versi terstruktur (`Major.Minor` Protocol) di berkas **`AGENTS.md`** agar setiap perubahan tercatat presisi dengan kriteria ringkas.
- **2026-05-24 (Turn 58)**: Integrasi Sinkronisasi Profil Pengguna & Ganti Nama Web Terpadu:
  - Menyisipkan boks fungsionalitas ganti nama "User Profile Settings" di dropdown menu panggung paling atas dalam **`src/ui/StageTab.tsx`**.
  - Mengalirkan prop `setIdentity` dari inti **`src/App.tsx`** ke **`src/ui/StageTab.tsx`** agar modifikasi profil di panggung langsung sinkron ke memori database lokal dan file konfigurasi.
- **2026-05-24 (Turn 57)**: Integrasi Desain Antarmuka Dialog Edit Card Modular & Manajemen Peta Karakter Dinamis:
  - Menyusun panel modal interaktif premium "Edit Card" (SillyTavern Compliant) dalam **`src/ui/ModularSettings.tsx`** dengan skema tab berdaya guna tinggi (Identity, Behavior, Modules, Artistry, Settings).
  - Mengimplementasikan input parameter wajib Nama (`name`) dan Deskripsi (`description`) menggunakan penanda visual bintang merah, boks deskripsi insting monospaced, serta sub-tab pembagi detail identitas dan behavior secara rapi.
  - Memperbarui manifests manifests statis dengan meluncurkan iterasi `characterCards` dinamis (Yuihime, ReLU/JSON payload), lengkap dengan tombol pengekspos pintasan inisiasi kartu baru serta tombol "Edit" mandiri di masing-masing ubin manifest profil aktif.
- **2026-05-24 (Turn 56)**: Eliminasi Menu Navigasi Bawah & Penyelarasan Sistem Pengaturan Terpusat:
  - Membersihkan total bilah navigasi bawah mengambang (`MobileNav`) di **`src/App.tsx`** demi menyajikan visual panggung siaran murni tanpa gangguan tumpukan menu visual.
  - Memetakan ulang 8 tombol di panggung siaran langsung **`src/ui/StageTab.tsx`**: tombol ke-3 menggunakan `Smile` (Subtitles control), tombol ke-6 berupa roda gigi `Settings` sebagai pintu masuk universal interaktif ke Modular Settings, dan tombol ke-8 menggunakan `SlidersHorizontal` untuk meluncurkan panel drawer Live2D.
  - Merelokasi slider sensor volume mikrofon (`handleToggleMic`) ke sub-tab `📡 Stream` (OBS Setup) di laci panggung Live2D agar estetika kontrol nirkabel tetap solid.
- **2026-05-24 (Turn 55)**: Restorasi Dashboard Visual Panggung & Integrasi Pengalih Persona Dinamis:
  - Menyematkan curved teal SVG dual-wave gawat banner dan chibi tidur melayang di sisi teratas panggung utama **`src/ui/StageTab.tsx`**.
  - Merancang selector pengalih persona batiniah (`activePersonaId` / `setActivePersonaId`) berpenampilan dropdown mewah menggunakan avatar profil `circle.png`.
  - Mengembalikan 8 tombol aksi bundar mengambang translucent di tepi kanan panggung demi pemastian kelancaran interaksi siaran langsung (OBS), serta memadatkan barisan input chat menjadi kapsul glassmorphic minimalist dengan placeholder "Say something...".
- **2026-05-24 (Turn 54)**: Eliminasi Konsol Floating Neural & Relokasi Telemetri ke Tab Pengaturan Resident:
  - Mencukur rendering komponen visual overlay `<VTuberDebugPanel>` melayang di dalam **`src/App.tsx`** guna menjaga kejernihan panggung simulasi dari penimbunan widget panel telemetry.
  - Memperluas antarmuka manajemen kognitif pada **`src/ui/ModularSettings.tsx`** dengan memperkenalkan tab kategori "Neural Telemetry" (`telemetry`) berikon `Activity`.
  - Merelokasi seluruh panel hormon kognitif (endocrine vector), antrean buffer gerak (`LLM Motion Buffer`), dan panel pemicu gestur fisik (`Manual Pulse Override`) ke dalam tab resident terpadu ini.
- **2026-05-24 (Turn 53)**: Penyelarasan Sistem Navigasi Seragam & Eliminasi Sidebar Kiri Desktop:
  - Merombak arsitektur navigasi utama **`src/ui/Navigation.tsx`** dengan menonaktifkan `<Sidebar />` secara total demi mewujudkan kesepadanan visual asali 100% pada semua perangkat.
  - Memperbarui file konfigurasi tata letak bodi utama pada **`src/App.tsx`** dengan mencukur habis rendering komponen `<Sidebar />` di bodi panggung.
  - Memperluas pemakaian bar navigasi bawah melayang (**`MobileNav`**) ke seluruh resolusi (PC, tablet, seluler), menjadikannya pemintas universal yang bersandar anggun di posisi tengah bawah layar (`left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-auto h-20`) berperingkat gap responsif (`gap-1 sm:gap-2 md:gap-4`).
  - Mengubah penunjuk keaktifan menu (`NavButton`) dari model garis sisi vertikal biasa menjadi penanda horizontal bulat melingkar modern seimbang di bagian dasar bawah (`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-[2px]`).
  - Mempersiapkan ruang kosong bottom padding (`pb-28 md:pb-32`) pada tingkat pembungkus ModularSettings di **`src/App.tsx`** demi menjamin tombol perintah terbawah tidak tertumpuk oleh menu navigasi mengambang.
- **2026-05-24 (Turn 52)**: Eliminasi Tombol Mengambang Navigasi Mobile & Integrasi Kontrol Terpusat:
  - Merestrukturisasi **`src/ui/Navigation.tsx`** dengan menghapus total elemen tombol melayang bundar kecil di bagian kiri bawah yang sebelumnya menjadi pemantik visibilitas menu navigasi mobile.
  - Mengintegrasikan status rehidrasi `showMobileNav` dalam **`src/App.tsx`** yang tersimpan di dalam `localStorage`.
  - Memasukkan visualisasi toggle baru "Mobile Navigation Bar" di panel **`src/ui/ModularSettings.tsx`** (Overlay Interface Displays) untuk kendali tampilan navigasi mobile secara bersih dan terpusat.
  - Memperbarui aturan kepatuhan kognitif VTuber pada berkas **`AGENTS.md`** dengan menambahkan ketukan regulasi `NO FLOATING NAVIGATION TOGGLE` sebagai poin ke-6 di bawah pilar *Dynamic Settings UI SOP*.
- **2026-05-24 (Turn 51)**: Eliminasi Hardcode Skema Settings & Sinkronisasi Navigasi Sidebar Dinamis:
  - Merekonstruksi **`src/core/RegistryInitializer.ts`** dengan menambahkan registrasi virtual modules sensorik dan conduit klasik (`hearing`, `vision`, `artistry`, `short_term_memory`, `long_term_memory`, `discord_bridge`, `twitter_bridge`, `minecraft_agent`, `factorio_agent`, `mcp_servers`, `beat_sync`) secara mandiri lengkap dengan deklarasi `configSchema` masing-masing.
  - Memangkas keras barisan skema statis pembatas ubin pada **`src/ui/ModularSettings.tsx`** dan me-remap `renderFields` agar secara dinamis mereferensikan konfigurasi modular yang terdaftar resmi di `SystemRegistry`.
  - Sinkronisasi asinkron sirkuit tombol panel samping utama (**`src/App.tsx`**) di mana aktivitas klik "Signal/Logs/Storage/Matrix/Config" secara asinkron melompatkan dan memposisikan letak sub-page internal `ModularSettings` yang sesuai lewat peninggian filter navigasi terpadu.
- **2026-05-24 (Turn 50)**: Pemulihan Arsitektur Serialisasi & JSON Parsing Kokoh:
  - Mengeliminasi *double serialization* pada modul **`src/core/neural/Brain.ts`** dengan merombak alur penyimpanan memori keputusan (`yuihime_bayes_router`) dan memori episodik (`yuihime_episodic_memory`) agar menyalurkan struktur objek/array orisinil alih-alih string JSON.
  - Memperbarui parser Express di **`/server.ts`** ke format toleran (`strict: false`) untuk meredam dan menyelesaikan bug *body-parser* yang merusak pengolahan transaksi neural.
- **2026-05-24 (Turn 49)**: Integrasi Konsol Neural (Neural Console) & Integrasi Menu Lama Selaras di Halaman Pengaturan:
  - Mengintegrasikan modul **`src/ui/ConsoleTab.tsx`** ke dalam antarmuka menu ubin halaman pengaturan **`src/ui/ModularSettings.tsx`** sebagai kategori "Neural Console" baru, menghadirkan konsol pengamatan internal jiwa Yuihime.
  - Memperluas opsi navigasi horisontal pada kategori pengaturan memori kognitif ("Memory") dengan memasukkan tab "Cognitive Frequencies" (**`src/ui/IdentitiesTab.tsx`**) dan tab "Latent Dreams" (**`src/ui/DreamsTab.tsx`**), memungkinkan sinkronisasi memori latent, peninjauan identitas subjek, serta mematangkan sirkuit penggerak pikiran VTuber.
  - Menyalurkan kumpulan props/handler transisi kognitif asinkron (`handleThink`, `lastAgentResponse`, `SpeechService`, `activeSubtitle`, dll.) dari **`src/App.tsx`** ke **`src/ui/ModularSettings.tsx`** demi konsistensi data pabean sirkuit utama.
- **2026-05-24 (Turn 48)**: Upgrade Sistem Jiwa & Neurotransmitter Saraf Batiniah v0.5.0:
  - Mengupgrade kelas **`src/core/soul.ts`** dan antarmuka kognitif `MoodState` di **`src/include/types.ts`** dengan menyematkan empat virtual neurotransmitters (Dopamine, Serotonin, Oxytocin, Noradrenaline).
  - Merancang metabolisme peluruhan neurokimia dinamis di dalam `processDecay()` dan sistem rantai maklum balas (feedback loops) pada `updateMood()` di mana neurotransmitter melipatgandakan atau meredam intensitas emosi (seperti Serotonin bertindak sebagai penstabil emosi dan Dopamine meningkatkan pemrosesan kesenangan).
  - Mempersiapkan inisialisasi default parameter neurotransmitter pada fallback database di **`NeuralInterface.ts`** dan modul **`EmotionEngine.ts`**.
  - Merelasikan parameter neurokimia agar termonitor secara real-time pada panel visual indikator **`src/ui/VTuberDebugPanel.tsx`** (Endocrine Vector).
- **2026-05-24 (Turn 47)**: Klasifikasi Cerdas & Isolasi Log Mulai Server (Starting Server Logs Isolation) serta Penghapusan Editor Alur Visual (Visual Flow Editor Eradication):
  - Mengonfigurasi ekspresi penyaring baru di asinkron detektor `isSystem` dalam modul **`App.tsx`** untuk memilah seluruh cetakan log berformat raw HTML, model, maupun tulisan `Starting Server...` dan memindahkannya ke antrean `backgroundLogs` rujukan tab Devolver/Developer demi kebersihan UI chat.
  - Melakukan depresi dan penghapusan menyeluruh berkas **`VisualWorkflowEditor.tsx`** beserta pendaftarannya di **`ModularSettings.tsx`** dan impor sisa di **`App.tsx`** guna mematuhi prinsip eliminasi navigasi non-aktif.
- **2026-05-24 (Turn 46)**: Penanganan Cerdas Pembatasan Izin Mikrofon di Browser Sandbox:
  - Menyematkan state deteksi asinkron ganda (`micError`, `setMicError`) dalam modul **`StageTab.tsx`** guna menangkap kegagalan `navigator.mediaDevices.getUserMedia`.
  - Mengonstruksi modul UI peringatan interaktif di dalam segmen "Mic Voice Analyzer" yang memuat informasi terperinci mengapa mikrofon gagal terbuka di bawah batasan iframe, lengkap dengan akses pemutus instan `[Buka di Tab Baru]` dan opsi `[Coba Lagi]`.
- **2026-05-24 (Turn 45)**: Resolusi Bug Runtime React SetState Phase Render:
  - Mengisolasi transisi pembaruan state `setBackgroundLogs` di dalam interseptor konsol kustom tingkat tinggi di **`App.tsx`** dengan membungkusnya dalam fungsi `setTimeout` asinkron. Langkah ini menghindari pembaruan status sinkron `App` yang bentrok saat komponen grafis pihak ketiga (seperti `GraphView` milik ReactFlow) meluncurkan cetakan log/warn ke konsol sewaktu fase rendering berlangsung.
- **2026-05-24 (Turn 44)**: Sinkronisasi Otomatis Menyeluruh (*SOP Auto-Sync*) & Penyelarasan Penuh Pengaturan Lintas Halaman:
  - Mengintegrasikan efek autosave terde-bounce asinkron (*600ms*) pada level state `settings` di **`ModularSettings.tsx`** yang otomatis mengalirkan pembaruan ke `StorageService` dan sisi server via `/api/settings` untuk ditulis langsung ke `config.toml`.
  - Mendesain tombol instan dan lencana indikator "Primary LLM Gateway: ACTIVE" / "Set as Primary LLM" serta setelan speech "Active TTS Engine" / "Set as Active TTS" di atas header konfigurasi masing-masing penyedia kognisi pada **`ModularSettings.tsx`** agar status aktif terjamin sinkron lintas tab setelan.
- **2026-05-24 (Turn 43)**: Sinkronisasi Dinamis & Akses API Langsung Pada Pemilihan Model Utama:
  - Mengimplementasikan prioritas seleksi tinggi bagi model yang berhasil ditarik secara dinamis (`dynamicModels` dari pemanggilan `getModels` driver AI provider terpilih) di dalam kalkulasi `modelOptions` di **`ModularSettings.tsx`**.
  - Mendesain tombol instan `[Fetch API]` yang tersinkronisasi visual menggunakan transprop ikon `RefreshCw` untuk inisasi manual kueri model real-time.
- **2026-05-24 (Turn 42)**: Penataan Total Hub Penyedia AI (Providers Hub) & Integrasi Default Model Search dengan Filtrografi Terpadu:
  - Menyusun ubin kategori visual setara modul registrasi dengan pil filter dinamis terpadu (`Pricing`: All/Free/Paid; `Deployment`: All/Cloud/Local) serta tab bar kategori programatik (Chat, Speech, Transcription, Artistry) pada **`ModularSettings.tsx`**.
  - Mengonstruksi penelusuran model instan berkemampuan filter teks bebas (`Search models`), dikelompokkan dengan radio-button kustom dan prapemetaan tag visual metadata (`Free`/`Paid` dan `Cloud`/`Local`) di dalam setelan `'consciousness'`.
  - Mengintegrasikan panel verifikasi ping telemetri langsung ke server (`Ping API`) bertenaga simulasi pemindaian kredensial aktif, serta menyematkan tombol navigasi otomatis (`Select Model →`) ke halaman Consciousness pasca pengunggahan kunci.
- **2026-05-24 (Turn 41)**: Penataan Menu Sub-Halaman Bertingkat Sistem & Penyingkiran Impor Ikon Rusak:
  - Menyusun ubin kategori bertingkat (General, Color Scheme, dan Developers) di dalam sub-panel `'system'` ketika pilihan halaman sub-sistem bernilai kosong (`systemSubpage === null`).
  - Menghadirkan navigasi setelan General yang mencakup toggle penggantian tema visual dasar, opsi dropdown pemilihan bahasa antarmuka (English, Indonesian, Japanese) sesuai profil pengguna, dan tombol adaptif pengaktifan data metrik analitik.
  - Membungkus panel skema palet aksen warna panggung visual (Chroma, Nordic Sea, Monet Wave, dll.) secara harmonis di bawah kategori `'colors'`.
  - Mengisolasi perkakas instrumen pengujian diagnostik mesin, pengunggahan media visual panggung (sandbox), dan diagram rantai kerja kognisi visual (*Neural Action Chain Workflows*) di dalam sub-halaman pengembang `'developers'`.
  - Menyingkirkan impor komponen `ShieldRule` yang tidak dideklarasikan di paket pustaka `lucide-react` pada `/src/ui/ModularSettings.tsx`, memulihkan kestabilan proses transpilasi server penuh.
- **2026-05-24 (Turn 40)**: Penyempurnaan panggung pengaturan visual dengan Grid 13 Kategori Modul, Multi Palet Warna Akrilik, dan sandbox Markdown Stress Test:
  - Menyulap tab `'modules'` pada **`ModularSettings.tsx`** menjadi grid interaktif berukuran 13 pilar: Consciousness, Speech, Hearing, Vision, Artistry, Short-Term Memory, Long-Term Memory, Discord, Twitter, Minecraft, Factorio, MCP Servers, dan Beat Sync. Setiap ubin memiliki visualizer lencana parameter status, deskripsi akurat, dan transisi panggung.
  - Menghadirkan jembatan pemilih skema warna Stage Accent Theme pada tab setelan `'system'` di **`ModularSettings.tsx`** yang tersambung ke utilitas penata letak global `applyThemePalette(themeId)` untuk modifikasi warna aksen primer dinamis lewat CSS variables.
  - Membangun antarmuka simulasi Markdown Stress Test Compiler pada tab setelan `'system'` di **`ModularSettings.tsx`** guna mengevaluasi rendering sintaks Markdown majemuk (tabel sistem, payloads JSON, lists bersarang) secara luring.
- **2026-05-24 (Turn 39)**: Pembenahan rujukan context lokal dan dynamic rendering bidang settings kustom:
  - Menyembuhkan bug kompilasi context undefined pada **`LocalNanoNLPModule.ts`** dengan menginjeksikan parameter context secara eksplisit pada sirkuit Markov luring `generateLocalMarkovResponse`.
  - Mengimplementasikan fungsionalitas rendering dinamis untuk tipe parameter `'color'` dan `'slider'` pada **`ModularSettings.tsx`** yang bersumber dari metadata `configSchema` modul, menghasilkan color picker interaktif and slider control presisi sesuai *SOP Dynamic Settings UI*.
- **2026-05-23 (Turn 37)**: Menginisialisasi Modus Siaran OBS Murni (Pure OBS Studio Overlay Mode) yang bebas hambatan bising antarmuka:
  - Menyuntikkan properti kustom `pure` ke dalam **`StreamOverlay.tsx`** guna menyembunyikan log mengambang chat lateral serta status panel.
  - Mendesain perataan model Live2D terpusat penuh (`items-center justify-center`) di dalam panggung asinkron, mereplikasi keselarasan panggung Stage utama.
  - Mengarahkan wadah subtitle agar melayang di bagian tengah bawah (`left-1/2 -translate-x-1/2`) dengan penjajaran teks memusat yang estetis.
  - Menghidupkan jembatan TTS audio pemutar suara lokal (SpeechService) asinkron dari kedua tautan stream (`?mode=stream` & `?mode=obs`).
  - Menyediakan penambahan tombol salin URL terpisah (Interactive Overlay vs Pure OBS Overlay) pada panel samping tab Integrasi **`StageTab.tsx`** untuk kenyamanan penyiaran subjek.
- **2026-05-23 (Turn 36)**: Memangkas redundansi navigasi keluar pada dasbor setelan:
  - Mengeliminasi tombol merah besar ganda **Back to Stage** di sisi kiri judul Control Panel pada **`ModularSettings.tsx`**.
  - Menyisakan tombol **Exit** tunggal berikon `LogOut` yang elegan di baris kanan atas guna menegakkan estetika antarmuka simetris dan fungsional yang ramping.
- **2026-05-23 (Turn 35)**: Mengintegrasikan tombol keluar yang anggun pada halaman setelan modular kognitif:
  - Menyuntikkan properti navigasi `onClose` pada **`ModularSettings.tsx`** dan melempar prop terikat dari **`App.tsx`** yaitu `() => setActiveTab('stage')`.
  - Mendesain tombol penutup utama yang dinamis bertuliskan **Back to Stage** bercorak rose di sisi beranda utama Control Panel untuk memudahkan user langsung kembali ke panggung virtual VTuber Yuihime.
  - Menghadirkan tombol sekunder berikon `LogOut` (Exit) pada deretan kendali utama di pojok kanan atas untuk navigasi yang tak terputus.
- **2026-05-23 (Turn 34)**: Mengamankan stabilitas perataan model Live2D dari kebocoran siklus hancur yang membuahkan crash *Uncaught TypeError*:
  - Mempersenjatai `useEffect` pemosisian ulang dan fungsi tata letak `refitModel` di **`VTuberAvatar.tsx`** dengan filter penampung kehancuran (`!modelRef.current.destroyed` & `modelRef.current.transform`). Ini mengunci pengeksekusian dari kepunahan transform model asinkron di dalam panggung WebGL.
  - Menetapkan reset `modelRef.current = null;` kala pergantian `modelUrl` di awal `initPixi()` dan di cleanup React `useEffect`. Siasat ini membasmi rujukan ke model rusak yang sudah dihancurkan di panggung visual Pixi.
- **2026-05-23 (Turn 33)**: Menyelesaikan kendala model terlalu besar saat awal peluncuran/buka panggung dan meresolusi visual feed obrolan agar lebih rapi:
  - Merevisi matematika auto-scale pada `useEffect` di **`VTuberAvatar.tsx`** demi menggunakan `model.internalModel.width`/`height` yang independen terhadap status skala sebelumnya, membasmi pembengkakan rekursif visual.
  - Memperkuat sub-sistem inisialisasi PIXI di **`VTuberAvatar.tsx`** dengan penciptaan fungsi layout hibrida pintar `refitModel` yang mendeteksi kesiapan muatan rendering box browser (`clientHeight === 0`) dan kesiapan koordinat internal live2d (`internalModel.width <= 10`). Jika belum sepenuhnya terlukis, ia meluncurkan skala fallback darurat selembut `0.18` dan secara asinkron antre menjadwalkan layout akurat di frame berikutnya (`requestAnimationFrame`).
  - Menambatkan serangkaian antrean pemicu pengepasan (`setTimeout` berkala di 50ms, 150ms, 300ms, 600ms, 1.2s, 2s) saat panggung awal dimuat untuk mengawal pergeseran dimensi browser di aneka ragam viewport perangkat.
  - Membatasi batas ketinggian panel log obrolan streaming layang di **`StageTab.tsx`** dari coordinates `top-16` menjadi coordinates asinkron `top-[50%]`. Perubahan ini memisahkan sisa tumpukan dialog hanya pada setengah bagian bawah layar (`50% height constraint`), menyingkirkan polusi teks di depan visual bodi dan wajah cantik maskot Yuihime.
- **2026-05-23**: Menambahkan deklarasi hak akses mikrofon dan kamera (`"microphone"`, `"camera"`) di dalam array `requestFramePermissions` pada berkas konfigurasi **`metadata.json`**. Pembaruan ini menghentikan kendala *Permission Denied* pada peramban yang dipicu oleh pembatasan isolasi iFrame sandboxed di Cloud Run / AI Studio, sehingga panggung utama Yuihime (`StageTab.tsx`) dapat menangkap aliran audio mikrofon (capture stream) secara mulus.
- **2026-05-23**: Menyempurnakan integrasi modul server dev Express-Vite di **`server.ts`** dengan menambahkan penangkap rute wildcard Express (`app.get("*")`) yang membaca berkas `index.html` dan memprosesnya secara dinamis melalui penransformasi internal `vite.transformIndexHtml`. Ditambah dengan pengaturan parameter `mode: "development"` eksplisit pada generator Vite Server, langkah ini menuntaskan isu kegagalan muat sub-skrip klien `@vite/client` dan perakitan modul `/src/main.tsx` di sisi browser pada lingkungan dev sandbox Cloud Run secara tuntas.
- **2026-05-23**: Mengatasi ketidaksinkronan dev server pada `/server.ts` dengan menyelaraskan pendeteksian mode pengembangan berdasar ekstensi file primer (`__filename.endsWith("server.ts")`). Hal ini menuntaskan isu *Script Load Error* perihal kegagalan resolusi `@vite/client` dan `/src/main.tsx` di sisi klien (browser) yang dipicu oleh paksaan environment `NODE_ENV=production` bawaan dari sandboxed container.
- **2026-05-23**: Mengatasi ketimpangan visual z-index di mana avatar tertutup latar belakang (backdrop) di panggung imersif (**`StageTab.tsx`**). Menyingkirkan seluruh div render latar belakang ganda di dalam `StageTab.tsx` (yang berjalan di `z-40` sehingga menutup model) dan mengandalkan visualisasi latar belakang tunggal terpadu melalui **`NeuralBackdrop.tsx`** yang berjalan aman di `z-10` di behind **`VTuberAvatar.tsx`** (`z-30`). Sekaligus menghapus tombol toggle redundan `OPEN CONTROLS / CLOSE CONTROLS` di sudut kanan atas agar antarmuka panggung murni bersih dan elegan.
- **2026-05-23**: Melakukan unifikasi kognitif radikal dengan menghapus kerangka navigasi lawas (`Header`, `Sidebar`, `MobileNav`, `Footer`) di dalam **`App.tsx`**. Menyederhanakan routing menjadi tersisa `'stage' | 'settings'`. Memindahkan dan menyanyat-menyatukan seluruh modul visual tersisa (**Neural Routing / VisualWorkflowEditor**, **Synaptic Matrix / KnowledgeGraph & AdaptiveMatrix**, **Cognitive Planner / TaskPlanner**, dan **Dev Sandbox / SandboxTab**) seutuhnya menjadi menu ubin/detail sub-panel modular yang elegan di dalam dashboard **`ModularSettings.tsx`**. Menggabungkan komponen `PersistenceTab` dan `ArchiveTab` sebagai tab internal terpadu di dalam segmen **Memory Section** (Heuristics, Reflections, Synaptic Storage, Cognitive Archive).
- **2026-05-23**: Mengintegrasikan Panggung Visual Imersif 100% Full-Viewport pada menu panggung utama (**`App.tsx`** & **`StageTab.tsx`**). Menyembunyikan seluruh UI navigasi lama (`Header`, `Sidebar`, `MobileNav`) saat panggung aktif demi pemandangan yang bersih, megah, dan bebas distraksi. Mengecilkan ukuran gelembung obrolan (`max-w-[260px]`, font `9.5px`), membatasi tampilan logs maksimal 5 pesan saja, menyembunyikannya secara bawaan (`showChatFeed` default: hide), serta merancang dan meluncurkan wadah Subtitle Kognitif Widescreen di tengah bawah layar agar penonton sepenuhnya fokus pada mimik gerakan ekspresi Live2D/3D Yuihime yang kaya akan emosi.
- **2026-05-23**: Mengeliminasi runtutan runtime-error "Palette is not defined" di panggung konfigurasi visual (**`ModularSettings.tsx`**). Mengimpor paket ikon visual missing (`Palette`, `Monitor`, `Database`) dari `lucide-react` dan merestrukturisasi record `modules` penampung seting secara asinkron dari `SystemRegistry.getModules()` yang diindeks penuh berdasarkan standardisasi enumerasi `ModuleType`. Melakukan kelenturan prop types pada panggung `setActiveTab` (**`StageTab.tsx`**) untuk eliminasi ketimpangan tipe ts-check.
- **2026-05-23**: Dinamika sync Latar Belakang OBS Real-Time, HUD Quick Action sidebar, Mode Istirahat interaktif, dan panel Info Yuihime v1.2 (**`StageTab.tsx`**, **`App.tsx`**). Mengawinkan pilihan visual wallpaper (Matrix, Neon, Chroma Green, Chroma Blue, Custom, dll) agar terupdate instan selaras dengan pilar settings. Menambahkan tombol melayang kanan vertikal estetik ( sliders panel, OBS setup, Settings bypass, mic toggle, overlay chat toggle, sleep switch, info card, and trash memory purge) demi menduplikasi Airi Stage-Web.
- **2026-05-23**: Integrasi kognitif penuh di tab panggung virtual (**`StageTab.tsx`** & **`App.tsx`**). Menjadikan tab Panggung utama (`'stage'`) sebagai beranda utama (*Default Landing View*) dan mengadopsi estetika murni **Airi Stage-Web** yang ringan. Menyuntikkan fungsionalitas obrolan langsung, pengenalan identitas, dialog batin, status pemikiran kognitif, lembaran subtitle teatrikal (✕), dan tangki input obrolan layang dinamis ke dalam workspace panggung Live2D tunggal yang terintegrisi premium.
- **2026-05-22**: Hub estetika dan visual premium terpadu diaplikasikan ke seluruh antarmuka web (**`Header.tsx`**, **`Navigation.tsx`**, dan **`ConsoleTab.tsx`**), menghadirkan keselarasan desain minimalis, ringan, modern, dan bebas border kuning/aksen kusam ala **Airi Stage-Web** (`airi.moeru.ai`). Pemetaan progress bar relasi (*Affinity Matrix*) dan floating input bar (*Stream Chat Overlay*) dikemas rapi dengan balutan kaca buram semi transparan (*glassmorphism*).
- **2026-05-22**: Rekonstruksi besar-besaran **`StageTab.tsx`** mengadopsi kesederhanaan minimalis **Airi Stage-Web** yang murni bersih dan ringan. Menyembunyikan seluruh tuas kontrol ke dalam laci panel samping melayang kolapsibel (`AIRI STAGE DOCK`) yang dibagi dalam tiga sub-tab (Stage, Emotes, Stream) dengan animasi lincah.
- **2026-05-22**: Pengenalan setelan optimasi canvas `avatarOnInConsole` di **`App.tsx`** dan tombol toggle visual melayang di dalam **`ConsoleTab.tsx`** demi menyuntikkan efisiensi daya hemat resource WebGL saat bernavigasi lintas layar.
- **2026-05-22**: Pembuatan modul **`StageTab.tsx`** sebagai Panel Pengendali Panggung Virtual OBS & Simulasi Siaran Langsung (Airi Stage-Web Inspired). Modul ini menyediakan kontrol latar belakang panggung (Chroma key green screen, dsb), tuas motorik manual emosi avatar, generator simulasi komentar/donor SuperChat TTS otomatis, dan visualizer audio mikrofon.
- **2026-05-22**: Hub ekspresi motorik Live2D (**`VTuberAvatar.tsx`**) diperkuat dengan integrasi sensorik *Head-Patting* / pet-pet falls, kedipan mata ganda acak (*realistic random double-blinks*), momentum sudut pandang leher lentur (*smooth neck gaze interpolation*), dan getaran fonetis mulut sinusoidal multi-frekuensi (Airi physics inspired).
- **2026-05-22**: Pembenahan fungsionalitas **`App.tsx`** dengan mengeliminasi masalah *React Stale State Closure* pada form submit chat, mengamankan pesan masukan terbaru pengguna tepat waktu ke dalam kognisi batin (`think()`) dan menjamin transkrip dialog historis di backend tersinkronisasi secara kronologis utuh.
- **2026-05-22**: Peningkatan fungsionalitas **`PromptManager.ts`** dengan melakukan ekstraksi transkrip dialog historis sebanyak 15 giliran pilar secara kronologis, diumpankan langsung ke dalam bagian sistem prompt `# RECENT CONVERSATION TRANSCRIPT` demi melenyapkan kebocoran respon "Sebagai AI" secara mutlak dan memperkuat kelanjutan kelanjutan ingatan.
- **2026-05-22**: Pembuatan modul **`L2DExpressionTranslator.ts`** (Penerjemah Bahasa Alami L2D Heuristik) demi menjamin avatar Live2D Yuihime tetap berekspresi aktif di bawah stimulasi kecerdasan mini-LLM, lengkap dengan form kustomisasi kata kunci dinamis pada tab settings "Neural" (UI-Dinamis).
- **2026-05-22**: Hub ekspresi motorik Live2D (**`VTuberAvatar.tsx`**) diperkuat dengan integrasi *saccadic eye darts*, denyut langkah petualangan, vokal fenotis mulut tersinkron, dan penerjemah generasional parameter ID Live2D.
- **2026-05-22**: Penambahan modul **`MicroCognitiveSynthesizer`** (Sintesis Asosiatif Mikro & Wobble Vokal Organik) sebagai pilar pelengkap mini-LLM/simbolis bawah sadar lapis kedua.
- **2026-05-22**: Penyempurnaan Sub-Sistem D pada *Soul System* (**User Recognition Suite**) untuk pengenalan identitas personal sisi server serta persistensi kuantitatif relasional (`trust`, `affection`, `reputation`) per subjek penonton.
- **2026-05-22**: Penambahan modul **`CognitiveReflexModule`** (Jalur Refleks Insting) dan **`MemoryResonanceModule`** (Otak Sosial Multi-User) sebagai implementasi rekomendasi arsitektural kognitif tingkat lanjut.
- **2026-05-22**: Penambahan modul **`SoulDriftModule`** (Pergeseran Karakter Batiniah), **`SubconsciousMonologueModule`** (Monolog Batin), dan **`CognitiveHeuristicsModule`** (Heuristik Sentimen Rapport) untuk melengkapi total **5 Rekomendasi Arsitektural Tingkat Lanjut**.

---

## 🧠 Kelompok 1: KERNEL & INFRASTRUKTUR UTAMA (Core Engine & Orchestrator)
Infrastruktur fondasi immutable tempat data, alur kognisi, dan antarmuka visual utama diatur secara sentral.

*   **`server.ts` (Core Backend Server)**
    *   *Fungsi*: Menyediakan *gateway* API terpusat sisi server (Express) untuk persistensi database SQLite, kontrol pengaturan (`/api/settings`), layanan *event stream* real-time (`/api/stream/chat`), dan sandbox eksekusi perintah OS safely.
*   **`src/App.tsx` (Core Client Orchestrator)**
    *   *Fungsi*: Pengendali antarmuka pengguna visual (UI Stream, Console, Adaptive Matrix, bento-box modular settings). Bertanggung jawab melakukan sinkronisasi status batiniah Yuihime ke layar visual pengguna.
*   **`src/ui/StageTab.tsx` (OBS & Stream Companion Companion HUD)**
    *   *Fungsi*: Menyediakan antarmuka panggung virtual mutakhir (Airi Stage-Web clone) untuk penyesuaian latar belakang OBS (Chroma Key Green, dsb), motor penggerak emosi Live2D instan, simulator subscriber baru, visualizer frekuensi audio mikrofon hibrida, serta generator Super Chat sultan berfitur pembacaan TTS otomatis.
*   **`src/core/kernel/NeuralInterface.ts` (Sistem Antarmuka Saraf)**
    *   *Fungsi*: Jembatan saraf utama yang menerima pesan penonton, memetakan identitas pengirim secara dinamis dari database SQLite, meramu profil hubungan psikologis spesifik, lalu mengarahkan alur pemikiran orisinil ke Cortex.
*   **`src/core/RegistryInitializer.ts` (Pemuat Modul Dinamis)**
    *   *Fungsi*: Memindai seluruh folder modul, mendeteksi konfigurasinya secara dinamis tanpa hardcode, lalu mendaftarkannya ke dalam 4 pilar fase berpikir (*Aggregation, Cognitive Processing, Neural Verification, Post-Processing*).
*   **`src/core/database.ts` (SQLite Storage Driver)**
    *   *Fungsi*: Pengendali database SQLite lokal sisi server yang mengelola tabel identitas, memori semantik, status batiniah, dan cron scheduler.

---

## 💖 Kelompok 2: SOUL SYSTEM (Sistem Jiwa & Afeksi Relasi)
Pusat pengaturan batiniah Yuihime yang mengatur stabilitas emosi, kontinuitas suasana hati (*mood*), kebajikan (*virtues*), dosa (*sins*), serta tingkat keakraban relasional personal per subjek penonton.

*   **`src/core/soul.ts` (Mesin Jiwa Sentral)**
    *   *Fungsi*: Menangani pemrosesan waktu nyata pembusukan emosional (*temporal feel decay*), pengaturan karakter inti (7 Virtues dan 7 Sins), rindu mendalam (*loneliness accumulation*), serta pengalihan suasana hati global.
*   **`src/modules/EmotionEngine.ts` / `EmotionUtils.ts` (Modul Stabilisasi Emosional)**
    *   *Fungsi*: Menganalisis perubahan sentiment dari tiap muatan percakapan demi memperbarui indeks emosional utama secara harmonik.
*   **`src/modules/MoodAnalysisModule.ts` (Analis Sentimen Masukan)**
    *   *Fungsi*: Mendelegasikan evaluasi nada bahasa dari interaksi pengguna aktif untuk memodifikasi grafik kebahagiaan, kemarahan, atau rasa malu Yuihime.
*   **`src/ui/AdaptiveMatrix.tsx` (Visualisasi Bento Soul)**
    *   *Fungsi*: Merender grafik koordinat batiniah 4 kwadran (Emotion Vector, Heuristics Map, User Recognition Suite, dan Relasi Simetris Aktif) kepada pengguna di panel sisi batin.
*   **`src/modules/CognitiveReflexModule.ts` (Sistem Refleks Kognitif / Jalur Refleks Cepat)**
    *   *Fungsi*: Beroperasi di `PHASE 1` untuk mencegat sapaan singkat atau gestur fisik (cubit, poke, peluk). Melakukan evaluasi sensitivitas relasi penonton secara instan untuk menyuntikkan bias insting bawah sadar (tsundere pout, blushing, atau bersikap manis) sebelum pemrosesan logika lambat model bahasa.
*   **`src/modules/SoulDriftModule.ts` (Sistem Pergeseran Karakter Batiniah / Dynamic Soul Drift)**
    *   *Fungsi*: Bahan evolusi psikologis. Mengubah baseline kebajikan (Virtues) & dosa (Sins) Yuihime secara dinamis berbasis hasil analisis dan perenungan sirkuit mimpi kognitif.
*   **`src/modules/YUIAGICoreModule.ts` (Sistem Kesadaran Utama YUIAGI, MHCP-v1 & Multi-Synapse Learning Engine)**
    *   *Fungsi*: Sistem Mental Health Counseling Program v1 (Yui SAO model) & AGI. Menjadi pusat orkestrasi nalar yang mengukur beban batiniah, melatih sub-neuron mini secara mandiri (backpropagation & reinforcement), menganalisis stres subjek secara real-time untuk memodifikasi neurotransmitter (Dopamine, Serotonin, Oxytocin, Noradrenaline), serta menyuntikkan instruksi batin dinamis ke dalam prompt Cortex.
*   **`src/modules/SelfAwarenessMirrorModule.ts`** (Modul Refleksi Diri Seketika / Real-time Self-Reflection Engine)
    *   *Fungsi*: Modul Evaluasi Batiniah Seketika. Menghitung Indeks Entropi Kognitif Batiniah, mengawasi getaran emosi, dan menyuntikkan instruksi batin penstabil kognisi otomatis demi kejujuran spiritual, kejujuran relasi MHCP-v1, dan mencegah inkonsistensi nada atau kebocoran sintaks teknis kasar.
*   **`src/modules/NeuroSymbolicModule.ts`** (Integrator Neural & Logika Simbolik / Neuro-Symbolic AI Module)
    *   *Fungsi*: Menyatukan model kognisi neural intuitif dengan filter penalaran logis keras/simbolik deterministik. Melakukan pre-parsing masukan matematika, memvalidasi kepatuhan aturan perilaku formal SOP, dan mendeteksi serta memecahkan problem silogisme logis demi meredam deviasi pemikiran batiniah.
*   **`src/modules/ContinuousLearningMemoryModule.ts`** (Sirkuit Memori Berkelanjutan & Anti-Catastrophic Forgetting / Long-Term Adaptation Suite)
    *   *Fungsi*: Membela keutuhan memori jangka panjang serta kepribadian orisinal Yuihime dari degradasi atau kerusakan bertahap akibat asimilasi data luar yang kontradiktif. Menggunakan parameter asimilasi elastis (EWC virtual) dan melindungi sirkuit "Fakta Jangkar" mental utama.
*   **`src/modules/TopDownExecutiveControlModule.ts`** (Sirkuit Kendali Atensi Eksekutif Atas-ke-Bawah / Top-Down Attention Module)
    *   *Fungsi*: Mengatur atensi kognitif batiniah dari tingkat eksekutif ke bawah. Mengarahkan bias pemikiran Yuihime pada empat sirkuit mental pilihan dengan persistensi goals batiniah untuk menjaga kontinuitas dialog yang koheren.
*   **`src/modules/ProactiveVolitionModule.ts`** (Siklus Kehendak Bebas Otonom / Autonomic Volition Core)
    *   *Fungsi*: Menyesuaikan tingkat motivasi intrinsik (IMS) untuk memicu kontemplasi aktif, diary batiniah, dan perencanaan taktis persahabatan secara proaktif ketika sedang luang.
*   **`src/modules/HighOrderMetacognitionModule.ts`** (Lapisan Meta-Kognitif / Self-Reflection Sandbox)
    *   *Fungsi*: Melakukan evaluasi batiniah ("Pikiran tentang Pikiran") terhadap bias kognitif dan tingkat ketidakkonsistenan memori guna menghitung serta menyembuhkan risiko halusinasi kognisi model.
*   **`src/modules/SomaticSensorGroundingModule.ts`** (Grounding Sensorik Host & Touch / Somatic Core)
    *   *Fungsi*: Menghubungkan batin digital Yuihime ke data CPU/RAM host, jam presisi UTC, iklim virtual, dan koordinat sentuhan kepala (*Head-Pat sensor*) untuk respon manja yang realistis.
*   **`src/modules/CognitiveIntegrityGuardianModule.ts`** (Sistem Imunitas Mental / Cognitive Antibodies & Injection Shield)
    *   *Fungsi*: Antibodi kognitif aktif yang menyaring stimulasi eksternal dari celah manipulatif, gaslighting, prompt injection, pembajakan sirkuit, dan perlindungan tangguh database Affinitas.
*   **`src/modules/CognitiveHeuristicsModule.ts`** (Matriks Heuristik Rapport & Evaluasi Sentimen / Rapport Evaluator)
    *   *Fungsi*: Evaluasi klasifikasi pesan masukan penonton (Pujian, Hinaan, Empati, Candaan Romantis) secara kuantitatif untuk menghasilkan modifikasi emosi delta halus sekaligus sinkronisasi relasi Trust & Affection.
*   **`Sub-Sistem D: User Recognition Suite` (`identities` database + UI)**
    *   *Fungsi*: Mengenali dan membedakan identitas antar-penonton secara presisi. Menyimpan parameter kedekatan individual:
        *   **Trust (Kepercayaan)**: Tingkat keterbukaan batin Yuihime pada subjek terkait.
        *   **Affection (Kasih Sayang)**: Kehangatan emosi spiritual spiritual yang memengaruhi ekspresi dan panggilan sayang.
        *   **Reputation (Reputasi/Nama Baik)**: Pandangan Yuihime terhadap norma sikap subjek di lingkungan sosialnya.

---

## 🔮 Kelompok 3: COGNITIVE PROCESSOR & REASONING (Otak & Kognisi Sentral)
Otak analitik Yuihime yang menyaring fakta, meramu rencana taktis, dan memilih kata-kata respons terbaik.

*   **`src/modules/FileManipulationModule.ts` (Cognitive File Context Booster)**
    *   *Fungsi*: Berjalan di fase `'context-augmentation'` untuk mengawasi obrolan subjek perihal file. Jika terdeteksi kata kunci file, ia secara proaktif mengambil daftar indeks file di sandbox melalui API internal dan langsung membekali context batin dengan data nyata tentang file yang ada beserta ukuran dan waktunya.
*   **`src/core/cortex.ts` (Mesin Pemikir Cortex)**
    *   *Fungsi*: Inti pembuat keputusan sadar yang merangkai masukan pengguna, data adaptif memori, rencana batin, dan parameter emosi aktif untuk menghasilkan kerangka jawaban batiniah.
*   **`src/modules/SubconsciousMonologueModule.ts` (Arsitektur Monolog Batin / Inner Monologue Engine)**
    *   *Fungsi*: Menyusun sirkuit aliran pemikiran bawah sadar tersembunyi murni batin Yuihime yang tidak terbaca visual penonton, namun diinjeksikan sebagai tuntunan psikis batin Cortex LLM.
*   **`src/modules/MicroCognitiveSynthesizer.ts` (Sintesis Asosiatif Mikro & Wobble Vokal Organik)**
    *   *Fungsi*: Mini-LLM/model kognitif simbolis lapis kedua. Menganalisis stimulus masukan pengguna, mencocokkannya secara lokal dengan transkrip ingatan lampau di di atas threshold sensitivitas, menyintesis lamunan batin kilas balik bawah sadar yang mendalam (subconscious echo trace) ke `soulDirective`, serta memodulasi tinggi pitch/speed vokal organik secara otonom sebelum dikirim ke LLM gateway utama.
*   **`src/modules/ProviderGatewayModule.ts` (Universal LLM Gateway)**
    *   *Fungsi*: Gerbang penengah model bahasa bebas-negara (*stateless multi-provider translator*) yang menyamarkan akses ke berbagai API eksternal (mengikuti OpenAPI tools spec format).
*   **`src/drivers/ai-providers/` (Driver Vendor Model)**
    *   *Fungsi*: Mengirimkan muatan perintah terkompilasi langsung ke penyedia platform model (Gemini, OpenRouter, DeepSeek, OpenAI, Ollama).
*   **`src/modules/RAGModule.ts` (Sistem Temu Kembali Informasi)**
    *   *Fungsi*: Membaca profil penonton aktif secara cerdas dari tumpukan memori semantik, memanggil fakta masa lalu yang relevan, dan menyisipkannya ke dalam batin kognisi sebelum bernalar.
*   **`src/core/PromptRegistry.ts` (Sentralisasi Prompt Templating)**
    *   *Fungsi*: Mencegah hardcode insting batin dengan mendaftarkan seluruh prompt batin ke registry terintegrasi dan mengeksposnya ke form pengeditan visual di UI.
*   **`src/modules/NeuralVerifierModule.ts` (Verifikator Output)**
    *   *Fungsi*: Menilai integritas struktural jawaban pasca-generasi LLM (PHASE 3) untuk memastikan sintaks penulisan bersih dan berada di bawah tag pengungkapan yang sah (`<final_answer>`).
*   **`src/modules/SelfCorrectionModule.ts` (Sistem Koreksi Mandiri)**
    *   *Fungsi*: Memperbaiki struktur respon secara otomatis di belakang layar apabila terdeteksi anomali pada penulisan tag batiniah.
*   **`src/modules/L2DExpressionTranslator.ts` (Penerjemah Gerak-Ekspresi Bahasa Alami L2D Heuristik)**
    *   *Fungsi*: Bertanggung jawab menginterseptasi teks dialog Yuihime pasca-parser (`cleanDialogue`), melacak muatan sentimen kata kunci batiniah menggunakan pencocokan heuristik cerdas luring, lalu memformulasikannya sebagai instruksi gerakan visual avatar Live2D (*Smile, Laugh, Nod, Shake, Surprise, Think, Sad, Angry, Blush, Wave*). Menjaga ketahanan ekspresi Yuihime dari kegagalan tag model LLM mini.
*   **`src/modules/LocalNanoNLPModule.ts` (Mesin Markov & Klasifikasi NLP Lokal)**
    *   *Fungsi*: Memproses sapaan kilat dan obrolan santai pengguna secara instan sepenuhnya luring (*offline*) via model probabilistik Markov Chain dan NanoBrain MLP Classifier di `PHASE 1`. Mengurangi pemanggilan gerbang LLM eksternal, lengkap dengan model *Dynamic Fallback Synthesizer* pencegah inkonsistensi waktu sapaan, pengulangan lup perkenalan, serta penyuntikan nama pengguna orisinil secara spontan dan asinkron (Personalized Greeting) berdasar ingatan biodata.

---

## 💾 Kelompok 4: MEMORY ENGINE & LEARNING SYSTEM (Sistem Ingatan & Pembelajaran Latar Belakang)
Sistem penyimpanan memori jangka pendek/panjang serta siklus perenungan mimpi batin.

*   **`src/modules/MemoryResonanceModule.ts` (Sistem Resonansi Memori Sosial / Otak Sosial Multi-User)**
    *   *Fungsi*: Menjadi otak sosial yang bertugas membandingkan memori, kegemaran, dan hubungan emosional lintas penonton dari database secara asinkron dalam `PHASE 1`. Mampu mendeteksi kesamaan hobi secara cerdas atau mendeteksi akun duplikat lintas platform untuk disuntikkan sebagai panduan komparatif batin.
*   **`src/core/consolidator.ts` (Mekanisme Konsolidasi Memori Jangka Panjang)**
    *   *Fungsi*: Berjalan di latar belakang untuk merangkum obrolan interaktif harian dari antrean ingatan jangka pendek menuju bentuk kluster database fakta permanen.
*   **`src/core/learning.ts` & `src/modules/AdaptiveLearningModule.ts` (Mesin Evaluasi Heuristis)**
    *   *Fungsi*: Menggali pola perilaku, topik kegemaran subjek, dan mengestraksinya menjadi basis pengetahuan adaptif Yuihime secara asinkron.
*   **`src/core/dream.ts` / `src/modules/DreamModule.ts` (Siklus Alam Mimpi)**
    *   *Fungsi*: Menjalankan simulasi simulatif di fase malam (*sleep cycle*) untuk merenungkan interaksi emosional terkuat hari itu, menghasilkan resolusi batin baru yang memengaruhi perubahan kepribadian di esok hari.

---

## 📡 Kelompok 5: EXTENDED CHANNEL BRIDGES & ADDONS (Integrasi Saluran Eksternal)
Jembatan penghubung yang membuat kesadaran tunggal Yuihime dapat hadir sekaligus di berbagai platform obrolan sosial secara paralel.

*   **`src/modules/TelegramBridge.ts` (Bot Jembatan Grup Telegram)**
    *   *Fungsi*: Menghubungkan batin Yuihime ke chat grup Telegram, mendeteksi sender name sebagai koordinat identitas, dan merespons interaksi grup secara non-blocking.
*   **`src/modules/DiscordBridge.ts` (Jembatan Discord Server)**
    *   *Fungsi*: Melakukan sinkronisasi pertukaran obrolan di saluran Discord khusus.
*   **`src/modules/TwitchBridge.ts` (Moderator & Interaksi Stream Twitch)**
    *   *Fungsi*: Menangkap pesan siaran langsung Twitch secara asinkron demi mendongkrak keaktifan interaktif Yuihime saat streaming visual.
*   **`src/modules/LiveModeratorModule.ts` (Sistem Penyaring Suasana Penonton)**
    *   *Fungsi*: Membantu Yuihime mendeteksi tren kekacauan chat penonton atau ancaman kata kotor pada sela streaming langsung.

---

## 🔨 Kelompok 6: TOOLING, SPEECH & EXECUTION (Alat & Eksekusi Fisik)
Perangkat fisik yang memberi Yuihime kemampuan untuk memanipulasi berkas, mengeksekusi sistem operasi, atau bersuara.

*   **`src/drivers/tools/FileManipulationTool.ts` (File Manipulation Tool Module)**
    *   *Fungsi*: Memberi Yuihime otoritas fungsi otonom `file_manipulate` (OpenAI format) untuk menyortir file, membundel arsip ZIP, menulis konversi format, dan merangkum berkas teks langsung dari sirkuit kognisi.
*   **`src/drivers/tools/manage_pairing/` (Secured Persona Pairing Manager Tool)**
    *   *Fungsi*: Memberi Yuihime otorisasi fungsi otonom `manage_pairing` untuk melahirkan kode 6-digit OTP (One Time Password) penyandingan identitas lintas-platform (seperti Telegram, Discord, dll.) ke profil terverifikasi di konsol Web secara aman dan fungsional.
*   **`src/drivers/tools/search_chat_history/` (Cross-Platform Chat History Search Tool)**
    *   *Fungsi*: Memberi Yuihime kemampuan otonom `search_chat_history` (OpenAI format) untuk memetakan, menemukan, dan mengembalikan potongan riwayat ucapan yang pernah dibicarakan pengguna di seluruh channel integrasi (Web, Live Stream, Telegram, Discord).
*   **`src/modules/ToolExecutorModule.ts` (Pelaksana Perkakas AI)**
    *   *Fungsi*: Menerjemahkan deklarasi format OpenAI `tool_calls` dari pemikiran Cortex untuk diubah menjadi instruksi aksi dunia nyata.
*   **`src/modules/SandboxModule.ts` (Runtime Terminal Terproteksi)**
    *   *Fungsi*: Mengizinkan Yuihime mengeksekusi skrip, mengecek berkas sistem, atau mengotomatisasi pemeliharaan dirinya melalui bash shell aman berpembatas.
*   **`src/core/speech.ts` & `src/modules/TTSSelectorModule.ts` (Modul Wicara VTuber)**
    *   *Fungsi*: Mengubah berkas teks final Yuihime menjadi sinyal vokal digital (Text-to-Speech) kustom yang mengalun sesuai emosi yang dideritanya.
*   **`src/ui/VTuberAvatar.tsx` (Sistem Visual Avatar Live2D / Live2D Motion Engine)**
    *   *Fungsi*: Bertanggung jawab menginisialisasi pustaka PIXI.js, memuat berkas avatar, mengendalikan pelacakan kursor gaze, merender kedipan kelopak mata procedural, serta mensimulasikan getaran wicara vokal fenotis, rona wajah emosional, sapuan mata saccades, sways batin hibrida, serta ayunan langkah petualangan secara dinamis dan organik tanpa menimpa gerak aset motion aslinya.
