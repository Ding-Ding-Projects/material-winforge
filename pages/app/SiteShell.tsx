"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TabId = "home" | "features" | "docs" | "settings" | "status";
type LanguageMode = "en" | "yue" | "both";
type Preferences = {
  language: LanguageMode;
  funnyEnglish: number;
  funnyCantonese: number;
  theme: "system" | "light" | "dark";
  dock: "left" | "top";
  density: "comfortable" | "compact";
  accent: string;
};
type Manifest = {
  schemaVersion: number;
  status: "unavailable" | "published";
  version: string | null;
  tag: string | null;
  commit: string | null;
  platform: string;
  assetName: string | null;
  url: string | null;
  sha256: string | null;
  size: number | null;
  publishedAt: string | null;
};
type CatalogItem = {
  id: string;
  type: "feature" | "article";
  category: string;
  title: string;
  titleYue: string;
  summary: string;
  summaryYue: string;
  tab: TabId;
};

const STORAGE_KEY = "winforge-material-preview-preferences-v1";
const DEFAULTS: Preferences = {
  language: "en",
  funnyEnglish: 2,
  funnyCantonese: 3,
  theme: "system",
  dock: "left",
  density: "comfortable",
  accent: "#2f7d45",
};
const TABS: Array<{ id: TabId; icon: string; en: string; yue: string }> = [
  { id: "home", icon: "⌂", en: "Home", yue: "首頁" },
  { id: "features", icon: "◇", en: "Feature map", yue: "功能地圖" },
  { id: "docs", icon: "▤", en: "Documentation", yue: "使用文件" },
  { id: "settings", icon: "⚙", en: "Settings", yue: "設定" },
  { id: "status", icon: "●", en: "Status", yue: "狀態" },
];
const CATALOG: CatalogItem[] = [
  ["desktop-preview", "feature", "Preview", "Material 3 desktop preview", "Material 3 桌面預覽", "A design-led preview of the proposed WinForge desktop experience.", "展示 WinForge 桌面體驗設計方向嘅預覽。", "features"],
  ["language-modes", "feature", "Preferences", "Three language modes", "三種語言模式", "English, playful Hong Kong-style Cantonese, and a compact bilingual view.", "英文、玩味港式廣東話，同精簡雙語顯示。", "settings"],
  ["funny-levels", "feature", "Preferences", "Independent tone controls", "獨立語氣控制", "Separate five-level tone sliders for English and Cantonese site copy.", "英文同廣東話文案各自有五級語氣滑桿。", "settings"],
  ["tabbed-navigation", "feature", "Navigation", "Dockable tab navigation", "可停靠分頁導覽", "A persistent tab strip that can dock left or move to the top.", "持續顯示嘅分頁列，可放左邊或者頂部。", "features"],
  ["search-builder", "feature", "Discovery", "Search with anchored regex builder", "搜尋連貼邊正規表示式工具", "Plain-text-first search with guided regex construction, flags, samples, and live matches.", "預設純文字搜尋，另有正規表示式組裝、旗標、範例同即時配對。", "features"],
  ["command-palette", "feature", "Discovery", "Command palette", "指令選單", "Ctrl+Shift+F opens a searchable route to every site destination.", "撳 Ctrl+Shift+F 就可以搜尋並直達網站各處。", "features"],
  ["release-manifest", "feature", "Downloads", "Verified release manifest", "已驗證發佈清單", "The installer stays disabled until a manifest identifies a real published asset.", "要有清單指向真正發佈檔案，安裝按鈕先會開。", "status"],
  ["preview-boundary", "article", "Application", "Preview boundary", "預覽界線", "What this design preview demonstrates, and what it does not claim to operate.", "講清楚呢個設計預覽展示啲咩，同埋唔會扮識做啲咩。", "docs"],
  ["site-preferences", "article", "Site", "Local site preferences", "本機網站偏好", "How language, tone, theme, density, accent, and tab position stay on this device.", "語言、語氣、主題、密度、重點色同分頁位置點樣留喺呢部機。", "docs"],
  ["search-and-regex", "article", "Site", "Search and regex builder", "搜尋同正規表示式工具", "The JavaScript regex dialect, flags, bounds, and invalid-pattern recovery.", "JavaScript 正規表示式語法、旗標、限制同錯誤處理。", "docs"],
  ["release-downloads", "article", "Release", "Release downloads", "發佈下載", "How the site distinguishes an unavailable candidate from a published installer.", "網站點樣分清未發佈候選版本同真正可下載安裝程式。", "docs"],
].map(([id, type, category, title, titleYue, summary, summaryYue, tab]) => ({ id, type, category, title, titleYue, summary, summaryYue, tab })) as CatalogItem[];

const ARTICLES = [
  {
    id: "preview-boundary", title: "Preview boundary", titleYue: "預覽界線",
    sections: [
      ["Behavior", "行為", "This site presents an interactive design preview and documentation for a proposed WinForge desktop interface. Controls on this page affect only this page.", "呢個網站係 WinForge 桌面介面嘅互動設計預覽同文件。頁面控制只會改呢個頁面。"],
      ["Configuration", "設定", "No system configuration is read or changed. A verified installed application is a separate artifact.", "網站唔會讀取或者更改系統設定。真正已安裝應用程式係另一個已驗證檔案。"],
      ["Failure modes", "失敗處理", "Reload the page or reset local preferences if a preview interaction fails. No operating-system action is pending.", "預覽互動失靈可以重新載入或者重設本機偏好；唔會有系統操作卡住。"],
      ["Security and privacy", "安全同私隱", "Preferences use local browser storage. The site requests no credentials, system access, analytics, or tracking consent.", "偏好只用瀏覽器本機儲存；網站唔會索取密碼、系統權限、分析或者追蹤同意。"],
      ["Verification", "驗證", "A download is not advertised until the published manifest supplies its immutable URL and integrity data.", "發佈清單未提供固定下載網址同完整性資料之前，網站唔會話有得下載。"],
    ], related: ["Local site preferences", "Release downloads"],
  },
  {
    id: "site-preferences", title: "Local site preferences", titleYue: "本機網站偏好",
    sections: [
      ["Behavior", "行為", "Language, separate tone levels, theme, density, accent, and tab docking update this site immediately.", "語言、兩個語氣級別、主題、密度、重點色同分頁位置會即時更新網站。"],
      ["Configuration", "設定", "Preferences use one versioned browser-storage record. Reset restores the documented defaults.", "偏好用一個有版本嘅瀏覽器儲存記錄；重設會回復文件列明嘅預設。"],
      ["Failure modes", "失敗處理", "Unavailable or corrupt browser storage safely falls back to shipped defaults.", "瀏覽器儲存用唔到或者損壞時，網站會安全咁退回原裝預設。"],
      ["Security and privacy", "安全同私隱", "Stored values are presentation choices, not credentials or operating-system settings.", "保存嘅只係顯示選擇，唔包含密碼或者作業系統設定。"],
      ["Verification", "驗證", "The Settings tab identifies active values and the reset path. This bootstrap does not claim interaction testing.", "設定分頁會顯示現有值同重設方法；今次初始版本唔會聲稱做過互動測試。"],
    ], related: ["Search and regex builder", "Preview boundary"],
  },
  {
    id: "search-and-regex", title: "Search and regex builder", titleYue: "搜尋同正規表示式工具",
    sections: [
      ["Behavior", "行為", "Search starts as plain text. The adjacent builder deliberately switches the same field to JavaScript regular expressions.", "搜尋預設係純文字；旁邊工具要明確開啟先將同一欄轉成 JavaScript 正規表示式。"],
      ["Configuration", "設定", "The builder includes literals, classes, anchors, groups, alternation, quantifiers, flags, sample text, match counts, and capture groups.", "工具有文字、字元組、錨點、群組、或、量詞、旗標、範例、配對數量同擷取群組。"],
      ["Failure modes", "失敗處理", "Invalid patterns show an inline explanation and no results. Plain-text mode remains one action away.", "錯誤模式會即場解釋並顯示零結果，一撳就可以轉返純文字。"],
      ["Security and privacy", "安全同私隱", "Patterns and samples run locally against the small built-in catalog and are not transmitted or persisted.", "模式同範例只喺本機細小內置目錄處理，唔會傳送或者保存。"],
      ["Verification", "驗證", "The displayed engine is the browser JavaScript RegExp engine. No different dialect is claimed.", "畫面列明用瀏覽器 JavaScript RegExp 引擎，唔會扮成其他語法。"],
    ], related: ["Local site preferences", "Release downloads"],
  },
  {
    id: "release-downloads", title: "Release downloads", titleYue: "發佈下載",
    sections: [
      ["Behavior", "行為", "Home and Status read a versioned manifest. Only published status with a URL enables the installer action.", "首頁同狀態會讀版本化清單；只得 published 狀態兼有網址先會開安裝按鈕。"],
      ["Configuration", "設定", "The schema records version, tag, commit, platform, asset, URL, SHA-256, size, and publication time.", "清單包括版本、標籤、提交、平台、檔名、網址、SHA-256、大小同發佈時間。"],
      ["Failure modes", "失敗處理", "Missing, malformed, candidate, or unavailable data keeps the action disabled instead of guessing a latest URL.", "資料遺失、格式錯、仲係候選或者未發佈，都會停用按鈕，唔會亂估最新網址。"],
      ["Security and privacy", "安全同私隱", "Published Windows packages are expected to be unsigned, and the interface states that plainly.", "Windows 發佈包預期係未簽署，畫面會清楚講明。"],
      ["Verification", "驗證", "Publication must replace the unavailable record with independently obtained release metadata before advertising the asset.", "發佈流程要先用獨立取得嘅資料取代 unavailable 記錄，網站先可以宣傳個檔案。"],
    ], related: ["Preview boundary", "Search and regex builder"],
  },
];

function dual(en: string, yue: string, mode: LanguageMode) {
  return mode === "yue" ? yue : mode === "both" ? `${en} · ${yue}` : en;
}
function validPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<Preferences>;
  return ["en", "yue", "both"].includes(v.language ?? "") && ["system", "light", "dark"].includes(v.theme ?? "") && ["left", "top"].includes(v.dock ?? "") && ["comfortable", "compact"].includes(v.density ?? "") && Number.isFinite(v.funnyEnglish) && Number.isFinite(v.funnyCantonese) && typeof v.accent === "string" && /^#[0-9a-f]{6}$/i.test(v.accent);
}
function validManifest(value: unknown): value is Manifest {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<Manifest>;
  return v.schemaVersion === 1 && ["unavailable", "published"].includes(v.status ?? "") && typeof v.platform === "string";
}
function formatBytes(value: number | null) {
  if (!value) return "Not published";
  const units = ["B", "KB", "MB", "GB"];
  let amount = value; let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit += 1; }
  return `${amount.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

export default function SiteShell({ assetBase }: { assetBase: string }) {
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [query, setQuery] = useState("");
  const [regexMode, setRegexMode] = useState(false);
  const [flags, setFlags] = useState({ i: true, m: false });
  const [builderOpen, setBuilderOpen] = useState(false);
  const [sample, setSample] = useState("WinForge preview\nMaterial 3 release status\nVerified installer");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [manifestState, setManifestState] = useState<"loading" | "ready" | "failed">("loading");
  const [toast, setToast] = useState<string | null>(null);
  const [articleId, setArticleId] = useState(ARTICLES[0].id);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const language = prefs.language;
  const announce = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) try { const parsed: unknown = JSON.parse(raw); if (validPreferences(parsed)) setPrefs(parsed); } catch { localStorage.removeItem(STORAGE_KEY); }
    const hash = location.hash.slice(1) as TabId;
    if (TABS.some((tab) => tab.id === hash)) setActiveTab(hash);
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); }, [hydrated, prefs]);
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.style.colorScheme = prefs.theme === "system" ? "light dark" : prefs.theme;
    document.documentElement.lang = prefs.language === "yue" ? "zh-Hant-HK" : "en";
  }, [prefs.language, prefs.theme]);
  useEffect(() => {
    fetch(`${assetBase}/release-manifest.json`, { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<unknown>; }).then((value) => { if (!validManifest(value)) throw new Error(); setManifest(value); setManifestState("ready"); }).catch(() => setManifestState("failed"));
  }, [assetBase]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "f") { event.preventDefault(); setPaletteOpen(true); }
      if (event.key === "Escape") { setPaletteOpen(false); setBuilderOpen(false); }
    };
    addEventListener("keydown", handler); return () => removeEventListener("keydown", handler);
  }, []);

  const selectTab = useCallback((tab: TabId, focus?: string) => {
    setActiveTab(tab); history.replaceState(null, "", `#${tab}`);
    if (focus) setTimeout(() => document.getElementById(focus)?.focus(), 40);
  }, []);
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K], note: string) => { setPrefs((p) => ({ ...p, [key]: value })); announce(note); };
  const regexResult = useMemo(() => {
    if (!regexMode || !query) return { expression: null as RegExp | null, error: "" };
    try { return { expression: new RegExp(query, `${flags.i ? "i" : ""}${flags.m ? "m" : ""}`), error: "" }; }
    catch (error) { return { expression: null, error: error instanceof Error ? error.message : "Invalid regular expression" }; }
  }, [flags, query, regexMode]);
  const results = useMemo(() => {
    if (!query) return CATALOG;
    const text = (item: CatalogItem) => `${item.title} ${item.titleYue} ${item.summary} ${item.summaryYue} ${item.category}`;
    if (regexMode) return regexResult.expression ? CATALOG.filter((item) => regexResult.expression?.test(text(item))) : [];
    const needle = query.toLocaleLowerCase(); return CATALOG.filter((item) => text(item).toLocaleLowerCase().includes(needle));
  }, [query, regexMode, regexResult.expression]);
  const sampleMatches = useMemo(() => {
    if (!regexMode || !query || !regexResult.expression) return [] as RegExpMatchArray[];
    try { return Array.from(sample.matchAll(new RegExp(query, `${flags.i ? "i" : ""}${flags.m ? "m" : ""}g`))).slice(0, 50); } catch { return []; }
  }, [flags, query, regexMode, regexResult.expression, sample]);
  const published = manifestState === "ready" && manifest?.status === "published" && typeof manifest.url === "string";
  const iconPath = `${assetBase}/app-icon.svg`;
  const heroEn = ["Explore the Material 3 direction and use only a release link backed by published metadata.", "A practical tour of Material 3, with downloads kept on an evidence-only leash.", "Meet the interface, tune the site, and let the release manifest do the serious paperwork.", "Tour the polished controls; the installer wakes only when a real release brings receipts.", "Admire the shiny controls and leave the installer asleep until a real build clocks in."];
  const heroYue = ["探索 Material 3 介面方向，並只使用有已發佈資料支持嘅下載連結。", "睇清 Material 3 設計方向，下載連結就交俾真實發佈資料把關。", "試吓介面同網站設定，嚴肅文件就交俾發佈清單處理。", "介面任睇任試；真發佈帶齊證據返嚟，安裝按鈕先起身返工。", "先睇靚仔介面兼調教分頁；真安裝包未返工，下載掣就乖乖瞓覺。"];
  const heroCopy = dual(heroEn[Math.max(1, Math.min(5, prefs.funnyEnglish)) - 1], heroYue[Math.max(1, Math.min(5, prefs.funnyCantonese)) - 1], language);
  const commands = [...TABS.map((tab) => ({ id: tab.id, label: dual(tab.en, tab.yue, language), detail: dual("Open site destination", "開啟網站目的地", language), action: () => selectTab(tab.id, `panel-${tab.id}`) })), { id: "search", label: dual("Focus site search", "跳去網站搜尋", language), detail: dual("Search features and articles", "搜尋功能同文章", language), action: () => selectTab("features", "site-search") }, { id: "reset", label: dual("Reset site preferences", "重設網站偏好", language), detail: dual("Restore documented defaults", "回復文件列明嘅預設值", language), action: () => { setPrefs(DEFAULTS); announce("Site preferences reset."); } }];
  const filteredCommands = commands.filter((c) => `${c.label} ${c.detail}`.toLocaleLowerCase().includes(paletteQuery.toLocaleLowerCase()));

  return (
    <main className={`site-shell dock-${prefs.dock} density-${prefs.density}`} style={{ "--accent": prefs.accent } as CSSProperties}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="top-app-bar">
        <button className="brand" type="button" onClick={() => selectTab("home")} aria-label="WinForge home"><img src={iconPath} width="42" height="42" alt="" /><span><strong>WinForge</strong><small>Material 3 Preview</small></span></button>
        <div className="top-actions"><button className="shortcut-button" type="button" onClick={() => setPaletteOpen(true)} aria-keyshortcuts="Control+Shift+F"><span aria-hidden="true">⌘</span><span>{dual("Commands", "指令", language)}</span><kbd>Ctrl+Shift+F</kbd></button><span className={`release-chip ${published ? "ready" : "waiting"}`}><span aria-hidden="true">{published ? "●" : "○"}</span>{published ? dual(`Release ${manifest?.version}`, `發佈 ${manifest?.version}`, language) : dual("Installer unavailable", "安裝程式未有", language)}</span></div>
      </header>
      <nav className="tab-strip" aria-label="Primary" role="tablist" aria-orientation={prefs.dock === "left" ? "vertical" : "horizontal"}>{TABS.map((tab) => <button key={tab.id} type="button" role="tab" id={`tab-${tab.id}`} aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`} tabIndex={activeTab === tab.id ? 0 : -1} className={activeTab === tab.id ? "active" : ""} onClick={() => selectTab(tab.id)}><span className="tab-icon" aria-hidden="true">{tab.icon}</span><span>{dual(tab.en, tab.yue, language)}</span></button>)}</nav>
      <div id="main-content" className="content-stage">
        {activeTab === "home" && <Panel id="home">
          <div className="hero-card"><div className="hero-copy"><span className="eyebrow">{dual("Desktop design preview", "桌面設計預覽", language)}</span><h1>{dual("Forge a calmer Windows workspace.", "打造一個順眼啲嘅 Windows 工作空間。", language)}</h1><p className="hero-lede">{heroCopy}</p><div className="hero-actions"><button className="filled-button" type="button" onClick={() => selectTab("features", "site-search")}>{dual("Explore the preview", "探索預覽", language)}</button>{published ? <a className="tonal-button" href={manifest?.url ?? undefined}>{dual(`Download ${manifest?.version}`, `下載 ${manifest?.version}`, language)}</a> : <button className="tonal-button" type="button" disabled aria-describedby="installer-reason">{dual("Installer not published", "安裝程式未發佈", language)}</button>}</div><p id="installer-reason" className="supporting-copy">{published ? dual("The link comes from the versioned release manifest.", "連結來自有版本嘅發佈清單。", language) : dual("The button stays disabled until a published manifest identifies a real installer.", "有發佈清單指向真正安裝程式之前，按鈕會保持停用。", language)}</p></div><div className="preview-frame" aria-label="Static preview of the WinForge desktop layout"><div className="preview-titlebar"><span><img src={iconPath} width="28" height="28" alt="" /> WinForge</span><span aria-hidden="true">— □ ×</span></div><div className="preview-body"><div className="preview-rail" aria-hidden="true"><span className="selected">⌂</span><span>▦</span><span>◫</span><span>⚙</span></div><div className="preview-content"><small>WORKSPACE</small><h2>Good afternoon</h2><div className="preview-grid"><div><span>Appearance</span><strong>Material 3</strong></div><div><span>Profiles</span><strong>Local only</strong></div><div><span>Release</span><strong>{published ? manifest?.version : "Not published"}</strong></div></div></div></div><span className="static-preview-badge">Static product preview</span></div></div>
          <aside className="boundary-banner"><span aria-hidden="true">i</span><div><strong>{dual("This website is not the desktop application.", "呢個網站唔係桌面應用程式。", language)}</strong><p>{dual("It is a landing page, documentation surface, and interface preview. It does not read or change Windows settings, run operating-system actions, or embed the installed product.", "呢度只係落地頁、文件同介面預覽；唔會讀取或者更改 Windows 設定、執行系統操作，亦唔會扮成已安裝產品。", language)}</p></div></aside>
          <PageHeading eyebrow={dual("Built for honest discovery", "老實探索", language)} title={dual("A preview that labels every boundary.", "每條界線都講清楚嘅預覽。", language)} body={dual("Explore design, discovery, and release behavior without mistaking the page for the installed product.", "探索設計、搜尋同發佈行為，又唔會誤會網站係已安裝產品。", language)} />
          <div className="three-up"><FeatureCard icon="◫" title={dual("Design direction", "設計方向", language)} body={dual("Material 3 surfaces, spacing, type, elevation, and responsive navigation.", "Material 3 表面、間距、字體、層次同響應式導覽。", language)} /><FeatureCard icon="⌕" title={dual("Find anything", "搵乜都得", language)} body={dual("Search the full catalog or deliberately switch to regex.", "搜尋完整目錄，或者明確轉去正規表示式。", language)} /><FeatureCard icon="✓" title={dual("Evidence-led downloads", "有證據先下載", language)} body={dual("No guessed latest link; the action needs published metadata.", "唔估最新連結；按鈕要有已發佈資料先開。", language)} /></div>
        </Panel>}
        {activeTab === "features" && <Panel id="features"><PageHeading eyebrow={dual("Complete site catalog", "完整網站目錄", language)} title={dual("Preview features and articles", "預覽功能同文章", language)} body={dual("Search what this landing page actually provides. Desktop operating-system controls are not claimed here.", "搜尋呢個落地頁真正提供嘅功能；網站唔會聲稱有桌面系統控制。", language)} /><div className="search-region"><div className="search-row"><label className="search-field" htmlFor="site-search"><span aria-hidden="true">⌕</span><input id="site-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={dual("Search features and documentation", "搜尋功能同文件", language)} />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</label><div className="builder-anchor"><button className={`builder-button ${builderOpen ? "active" : ""}`} type="button" onClick={() => setBuilderOpen((v) => !v)} aria-expanded={builderOpen} aria-controls="regex-builder"><span aria-hidden="true">.*</span>{dual("Regex builder", "正規表示式工具", language)}</button>{builderOpen && <RegexBuilder query={query} setQuery={setQuery} regexMode={regexMode} setRegexMode={setRegexMode} flags={flags} setFlags={setFlags} error={regexResult.error} sample={sample} setSample={setSample} matches={sampleMatches} announce={announce} close={() => setBuilderOpen(false)} />}</div></div><div className="search-meta" aria-live="polite"><span>{regexMode ? `JavaScript RegExp /${query}/${flags.i ? "i" : ""}${flags.m ? "m" : ""}` : dual("Plain-text search", "純文字搜尋", language)}</span><strong>{regexResult.error || `${results.length} ${dual("results", "項結果", language)}`}</strong></div></div>{results.length ? <div className="catalog-grid">{results.map((item) => <article key={item.id} className="catalog-card"><div className="catalog-meta"><span>{item.category}</span><span>{item.type === "feature" ? dual("Feature", "功能", language) : dual("Article", "文章", language)}</span></div><h2>{dual(item.title, item.titleYue, language)}</h2><p>{dual(item.summary, item.summaryYue, language)}</p><button type="button" onClick={() => { if (item.type === "article") setArticleId(item.id); selectTab(item.tab, item.type === "article" ? `article-${item.id}` : undefined); }}>{item.type === "article" ? dual("Read article", "睇文章", language) : dual("Open destination", "開啟目的地", language)}</button></article>)}</div> : <div className="empty-state"><span aria-hidden="true">⌕</span><h2>{dual("No matches", "搵唔到", language)}</h2><p>{dual("Change the query or return to plain text.", "改吓搜尋字或者轉返純文字。", language)}</p></div>}</Panel>}
        {activeTab === "docs" && <Panel id="docs"><PageHeading eyebrow={dual("Offline-friendly guide", "離線友善指南", language)} title={dual("Documentation", "使用文件", language)} body={dual("Every article covers behavior, configuration, failure modes, security, verification, and useful next reading.", "每篇文章都有行為、設定、失敗處理、安全、驗證同下一篇建議。", language)} /><div className="docs-layout"><nav className="article-list" aria-label="Documentation articles">{ARTICLES.map((article) => <button key={article.id} type="button" className={articleId === article.id ? "active" : ""} onClick={() => setArticleId(article.id)}><span>{dual(article.title, article.titleYue, language)}</span><small>{dual("Article", "文章", language)}</small></button>)}</nav>{ARTICLES.filter((a) => a.id === articleId).map((article) => <article key={article.id} id={`article-${article.id}`} className="article-content" tabIndex={-1}><span className="eyebrow">{dual("Feature article", "功能文章", language)}</span><h2>{dual(article.title, article.titleYue, language)}</h2>{article.sections.map(([enTitle, yueTitle, enBody, yueBody]) => <DocSection key={enTitle} title={dual(enTitle, yueTitle, language)}>{dual(enBody, yueBody, language)}</DocSection>)}<div className="suggested-articles"><strong>{dual("Suggested articles", "建議文章", language)}</strong><ul>{article.related.map((item) => <li key={item}>{item}</li>)}</ul></div></article>)}</div></Panel>}
        {activeTab === "settings" && <Panel id="settings"><PageHeading eyebrow={dual("Stored on this device", "只留喺呢部裝置", language)} title={dual("Site settings", "網站設定", language)} body={dual("These controls customize this landing page only. They never change the installed app or Windows.", "呢啲控制只改呢個落地頁，唔會更改已安裝應用程式或者 Windows。", language)} /><div className="settings-grid"><SettingCard title={dual("Language mode", "語言模式", language)} description={dual("Choose the language used by this site.", "揀呢個網站用咩語言。", language)} provenance={dual("Stored locally after your first change.", "第一次改動之後留喺本機。", language)}><Segments label="Language mode" value={prefs.language} options={[["en", "English"], ["yue", "廣東話"], ["both", "English · 廣東話"]]} onChange={(v) => update("language", v as LanguageMode, "Language mode updated.")} /></SettingCard><SettingCard title={dual("English funny level", "英文玩味程度", language)} description={dual("Styles English copy from serious to playful without changing facts.", "英文文案由認真到玩味，但唔會改事實。", language)} provenance={`Current value: ${prefs.funnyEnglish} / 5`}><Range label="English funny level" value={prefs.funnyEnglish} onChange={(v) => update("funnyEnglish", v, `English funny level set to ${v}.`)} /></SettingCard><SettingCard title={dual("Cantonese funny level", "廣東話玩味程度", language)} description={dual("Styles Cantonese copy independently from English.", "廣東話文案可以同英文分開調校。", language)} provenance={`Current value: ${prefs.funnyCantonese} / 5`}><Range label="Cantonese funny level" value={prefs.funnyCantonese} onChange={(v) => update("funnyCantonese", v, `Cantonese funny level set to ${v}.`)} /></SettingCard><SettingCard title={dual("Theme", "主題", language)} description={dual("Follow the device or choose light or dark.", "跟裝置或者揀光亮／深色。", language)} provenance={`Current value: ${prefs.theme}`}><Segments label="Theme" value={prefs.theme} options={[["system", dual("System", "跟系統", language)], ["light", dual("Light", "光亮", language)], ["dark", dual("Dark", "深色", language)]]} onChange={(v) => update("theme", v as Preferences["theme"], "Theme updated.")} /></SettingCard><SettingCard title={dual("Tab position", "分頁位置", language)} description={dual("Dock tabs left or move them to the top.", "分頁列可以放左邊或者頂部。", language)} provenance={`Current value: ${prefs.dock}`}><Segments label="Tab position" value={prefs.dock} options={[["left", dual("Left", "左邊", language)], ["top", dual("Top", "頂部", language)]]} onChange={(v) => update("dock", v as Preferences["dock"], "Tab position updated.")} /></SettingCard><SettingCard title={dual("Density", "密度", language)} description={dual("Adjust spacing without hiding information.", "調整間距，但唔會刪走資料。", language)} provenance={`Current value: ${prefs.density}`}><Segments label="Density" value={prefs.density} options={[["comfortable", dual("Comfortable", "舒適", language)], ["compact", dual("Compact", "緊密", language)]]} onChange={(v) => update("density", v as Preferences["density"], "Density updated.")} /></SettingCard><SettingCard title={dual("Accent color", "重點色", language)} description={dual("Choose the emphasis color for controls and focus.", "揀控制同焦點提示嘅重點色。", language)} provenance={`Current value: ${prefs.accent}`}><label className="color-control"><input type="color" value={prefs.accent} onChange={(e) => update("accent", e.target.value, "Accent color updated.")} aria-label="Accent color" /><code>{prefs.accent}</code></label></SettingCard></div><div className="reset-card"><div><h2>{dual("Reset local preferences", "重設本機偏好", language)}</h2><p>{dual("Restore every documented default in one action.", "一撳回復所有文件列明嘅預設值。", language)}</p></div><button className="outlined-button" type="button" onClick={() => { setPrefs(DEFAULTS); announce("Site preferences reset."); }}>{dual("Reset settings", "重設設定", language)}</button></div></Panel>}
        {activeTab === "status" && <Panel id="status"><PageHeading eyebrow={dual("Evidence, not predictions", "證據唔係預測", language)} title={dual("Publication status", "發佈狀態", language)} body={dual("This surface reports only what the versioned manifest can support.", "呢個畫面只會報版本化清單支持到嘅資料。", language)} /><div className="status-grid"><StatusCard state="info" label={dual("Site role", "網站角色", language)} value={dual("Landing page and documentation preview", "落地頁同文件預覽", language)} detail={dual("No operating-system control runs here.", "呢度冇執行系統控制。", language)} /><StatusCard state={published ? "success" : manifestState === "failed" ? "error" : "waiting"} label={dual("Installer", "安裝程式", language)} value={published ? `${manifest?.version} · ${manifest?.platform}` : manifestState === "loading" ? dual("Reading manifest", "讀緊清單", language) : dual("Not published", "未發佈", language)} detail={published ? `${manifest?.assetName} · ${formatBytes(manifest?.size ?? null)}` : dual("The download action remains disabled.", "下載操作保持停用。", language)} /><StatusCard state="waiting" label={dual("Runtime proof", "執行證據", language)} value={dual("Not claimed by this site", "網站冇聲稱有", language)} detail={dual("A source preview is not installation evidence.", "原始碼預覽唔等於安裝證據。", language)} /></div><div className="manifest-card"><div className="manifest-heading"><div><span className="eyebrow">release-manifest.json</span><h2>{dual("Release record", "發佈記錄", language)}</h2></div><span className={`manifest-state ${published ? "success" : "waiting"}`}>{published ? "published" : manifestState}</span></div><dl><Row label="Schema" value={manifest?.schemaVersion?.toString() ?? "1"} /><Row label="Version" value={manifest?.version ?? "Unavailable"} /><Row label="Tag" value={manifest?.tag ?? "Unavailable"} /><Row label="Commit" value={manifest?.commit ?? "Unavailable"} /><Row label="Platform" value={manifest?.platform ?? "Windows x64"} /><Row label="Asset" value={manifest?.assetName ?? "Unavailable"} /><Row label="SHA-256" value={manifest?.sha256 ?? "Unavailable"} mono /><Row label="Size" value={formatBytes(manifest?.size ?? null)} /><Row label="Published" value={manifest?.publishedAt ?? "Unavailable"} /></dl><div className="unsigned-note"><span aria-hidden="true">!</span><p>{dual("Windows release artifacts are unsigned and may show an unknown-publisher or SmartScreen warning. This site does not claim signature verification.", "Windows 發佈檔案未經簽署，可能會顯示未知發佈者或者 SmartScreen 警告；網站唔會聲稱驗證過簽署。", language)}</p></div></div></Panel>}
      </div>
      <footer><span>WinForge · Material 3 Preview</span><span>{dual("Site preferences stay in this browser.", "網站偏好留喺呢個瀏覽器。", language)}</span><a href="https://github.com/Ding-Ding-Projects/material-winforge">GitHub</a></footer>
      {paletteOpen && <div className="dialog-scrim" role="presentation" onMouseDown={(e) => { if (e.currentTarget === e.target) setPaletteOpen(false); }}><section className="command-palette" role="dialog" aria-modal="true" aria-labelledby="palette-title"><header><div><span className="eyebrow">Ctrl+Shift+F</span><h2 id="palette-title">{dual("Command palette", "指令選單", language)}</h2></div><button type="button" onClick={() => setPaletteOpen(false)} aria-label="Close command palette">×</button></header><label className="palette-search"><span aria-hidden="true">⌕</span><input autoFocus value={paletteQuery} onChange={(e) => setPaletteQuery(e.target.value)} placeholder={dual("Search destinations and settings", "搜尋目的地同設定", language)} /></label><div className="command-list">{filteredCommands.map((c) => <button key={c.id} type="button" onClick={() => { c.action(); setPaletteOpen(false); }}><span><strong>{c.label}</strong><small>{c.detail}</small></span><span aria-hidden="true">↵</span></button>)}{!filteredCommands.length && <p className="palette-empty">{dual("No commands match.", "冇相符指令。", language)}</p>}</div></section></div>}
      <div className={`snackbar ${toast ? "visible" : ""}`} role="status" aria-live="polite"><span aria-hidden="true">✓</span><span>{toast}</span>{toast && <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">×</button>}</div>
    </main>
  );
}

function Panel({ id, children }: { id: TabId; children: ReactNode }) { return <section id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} tabIndex={-1} className="page-panel">{children}</section>; }
function PageHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) { return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{body}</p></div>; }
function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) { return <article className="feature-card"><span className="feature-icon" aria-hidden="true">{icon}</span><h3>{title}</h3><p>{body}</p></article>; }
function DocSection({ title, children }: { title: string; children: ReactNode }) { return <section className="doc-section"><h3>{title}</h3><p>{children}</p></section>; }
function SettingCard({ title, description, provenance, children }: { title: string; description: string; provenance: string; children: ReactNode }) { return <article className="setting-card"><div><h2>{title}</h2><p>{description}</p><small>{provenance}</small></div>{children}</article>; }
function Segments({ label, options, value, onChange }: { label: string; options: string[][]; value: string; onChange: (v: string) => void }) { return <div className="segmented-control" role="radiogroup" aria-label={label}>{options.map(([v, text]) => <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? "selected" : ""} onClick={() => onChange(v)}>{text}</button>)}</div>; }
function Range({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) { return <label className="range-control"><span>1 · Serious</span><input type="range" min="1" max="5" step="1" value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} /><span>5 · Playful</span><output>{value}</output></label>; }
function StatusCard({ state, label, value, detail }: { state: "success" | "waiting" | "error" | "info"; label: string; value: string; detail: string }) { const symbol = { success: "✓", waiting: "○", error: "!", info: "i" }[state]; return <article className={`status-card ${state}`}><span className="status-symbol" aria-hidden="true">{symbol}</span><div><small>{label}</small><h2>{value}</h2><p>{detail}</p></div></article>; }
function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div><dt>{label}</dt><dd className={mono ? "mono" : ""}>{value}</dd></div>; }

function RegexBuilder({ query, setQuery, regexMode, setRegexMode, flags, setFlags, error, sample, setSample, matches, announce, close }: { query: string; setQuery: (v: string) => void; regexMode: boolean; setRegexMode: (v: boolean) => void; flags: { i: boolean; m: boolean }; setFlags: (v: { i: boolean; m: boolean }) => void; error: string; sample: string; setSample: (v: string) => void; matches: RegExpMatchArray[]; announce: (v: string) => void; close: () => void }) {
  const insert = (token: string) => { setQuery(`${query}${token}`); setRegexMode(true); };
  const copy = async () => { try { await navigator.clipboard.writeText(`/${query}/${flags.i ? "i" : ""}${flags.m ? "m" : ""}`); announce("Regular expression copied."); } catch { announce("Clipboard access was unavailable."); } };
  const tokens = [["Literal", "text"], ["Class", "[a-z]"], ["Start", "^"], ["End", "$"], ["Group", "(text)"], ["Either", "a|b"], ["One+", "+"], ["Optional", "?"]];
  return <section id="regex-builder" className="regex-builder" aria-label="Regular expression builder"><header><div><span className="eyebrow">JavaScript RegExp</span><h2>Regex builder</h2></div><button type="button" onClick={close} aria-label="Close regex builder">×</button></header><div className="mode-switch"><button type="button" className={!regexMode ? "selected" : ""} onClick={() => setRegexMode(false)}>Plain text</button><button type="button" className={regexMode ? "selected" : ""} onClick={() => setRegexMode(true)}>Regular expression</button></div><label className="builder-field"><span>Pattern</span><input value={query} onChange={(e) => { setQuery(e.target.value); setRegexMode(true); }} spellCheck={false} aria-invalid={Boolean(error)} /></label>{error && <p className="regex-error" role="alert">{error}</p>}<div className="token-grid">{tokens.map(([label, token]) => <button key={label} type="button" onClick={() => insert(token)}><span>{label}</span><code>{token}</code></button>)}</div><fieldset><legend>Flags</legend><label><input type="checkbox" checked={flags.i} onChange={(e) => setFlags({ ...flags, i: e.target.checked })} /> i · ignore case</label><label><input type="checkbox" checked={flags.m} onChange={(e) => setFlags({ ...flags, m: e.target.checked })} /> m · multiline</label></fieldset><label className="builder-field"><span>Sample text</span><textarea value={sample} onChange={(e) => setSample(e.target.value)} rows={4} /></label><div className="match-summary" aria-live="polite"><strong>{matches.length} live matches</strong><span>{matches.length ? `Captures: ${matches.flatMap((m) => m.slice(1)).filter(Boolean).join(", ") || "none"}` : "No captures"}</span></div><footer><button className="outlined-button" type="button" onClick={() => { setQuery(""); setRegexMode(false); }}>Reset</button><button className="filled-button" type="button" onClick={copy} disabled={!query || Boolean(error)}>Copy pattern</button></footer></section>;
}
