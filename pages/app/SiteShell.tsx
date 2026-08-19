"use client";

import type {
  ChangeEvent,
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type TabId = "home" | "features" | "docs" | "settings" | "changelog" | "status";
type TabGroup = {
  id: string;
  name: string;
  color: string;
  collapsed: boolean;
  tabs: TabId[];
  appearance: TabGroupAppearance;
};
type TabGroupAppearance = {
  icon: string;
  textColor: string;
  backgroundColor: string;
};
type GroupSearchState = {
  query: string;
  regex: boolean;
  flags: { i: boolean; m: boolean };
  sample: string;
  builderOpen: boolean;
};
type BulkCloseMode = "contains" | "not-contains";
type TabGroupsState = { schemaVersion: 2; groups: TabGroup[] };
type LanguageMode = "en" | "yue" | "both";
type VocabularyCache = {
  schemaVersion: 1;
  replacements: Record<string, string>;
};
type LogoPreset = "forge" | "tile" | "mono";
type SiteSettingValues = {
  language: LanguageMode;
  funnyEnglish: number;
  funnyCantonese: number;
  theme: "system" | "light" | "dark";
  dock: "left" | "right" | "top" | "bottom";
  density: "comfortable" | "compact";
  accent: string;
  showEmojis: boolean;
};
type SiteSettingKey = keyof SiteSettingValues;
type SiteProject = {
  id: string;
  name: string;
  overrides: Partial<SiteSettingValues>;
};
type SiteSettingsOwnership = {
  schemaVersion: 1;
  global: SiteSettingValues;
  projects: SiteProject[];
  activeProjectId: string | null;
};
type NotificationKind = "info" | "success" | "warning" | "error";
type NotificationRecord = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  timestamp: string;
};
type NotificationHistory = {
  schemaVersion: 1;
  records: NotificationRecord[];
  readThrough: string | null;
};
type SettingsHistoryAction =
  | "global-setting-changed"
  | "project-setting-changed"
  | "project-created"
  | "project-switched"
  | "project-reset"
  | "global-reset"
  | "logo-changed"
  | "restored";
type SettingsLogoState = { logoPreset: LogoPreset; customLogo: string | null };
type SettingsHistoryRecord = {
  id: string;
  action: SettingsHistoryAction;
  timestamp: string;
  label: string;
  effective: SiteSettingValues;
  ownership: SiteSettingsOwnership;
  logo: SettingsLogoState;
};
type SettingsHistory = { schemaVersion: 2; records: SettingsHistoryRecord[] };
type Preferences = SiteSettingValues & {
  schemaVersion: 1;
  pinnedTabs: TabId[];
  tabOrder: TabId[];
  tabGroups: TabGroupsState;
  personalVocabulary: VocabularyCache | null;
  logoPreset: LogoPreset;
  customLogo: string | null;
  settingsOwnership: SiteSettingsOwnership;
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
const NOTIFICATION_KEY = "winforge-material-preview-notifications-v1";
const SETTINGS_HISTORY_KEY = "winforge-material-preview-settings-history-v1";
const PREFERENCES_MAX_BYTES = 512 * 1024;
const NOTIFICATION_MAX_BYTES = 128 * 1024;
const SETTINGS_HISTORY_MAX_BYTES = 512 * 1024;
const DEFAULT_SITE_SETTINGS: SiteSettingValues = {
  language: "en",
  funnyEnglish: 2,
  funnyCantonese: 3,
  theme: "system",
  dock: "left",
  density: "comfortable",
  accent: "#2f7d45",
  showEmojis: true,
};
const DEFAULT_GROUP_APPEARANCE: TabGroupAppearance = {
  icon: "▦",
  textColor: "#1b1b1f",
  backgroundColor: "#f3f3f7",
};
const DEFAULTS: Preferences = {
  schemaVersion: 1,
  ...DEFAULT_SITE_SETTINGS,
  pinnedTabs: [],
  tabOrder: ["home", "features", "docs", "settings", "changelog", "status"],
  tabGroups: { schemaVersion: 2, groups: [] },
  personalVocabulary: null,
  logoPreset: "forge",
  customLogo: null,
  settingsOwnership: {
    schemaVersion: 1,
    global: DEFAULT_SITE_SETTINGS,
    projects: [],
    activeProjectId: null,
  },
};
const SITE_SETTING_KEYS: SiteSettingKey[] = [
  "language",
  "funnyEnglish",
  "funnyCantonese",
  "theme",
  "dock",
  "density",
  "accent",
  "showEmojis",
];
const PREFERENCE_KEYS = new Set<string>([
  "schemaVersion",
  ...SITE_SETTING_KEYS,
  "pinnedTabs",
  "tabOrder",
  "tabGroups",
  "personalVocabulary",
  "logoPreset",
  "customLogo",
  "settingsOwnership",
]);
const TABS: Array<{ id: TabId; icon: string; en: string; yue: string }> = [
  { id: "home", icon: "⌂", en: "Home", yue: "首頁" },
  { id: "features", icon: "◇", en: "Feature map", yue: "功能地圖" },
  { id: "docs", icon: "▤", en: "Documentation", yue: "使用文件" },
  { id: "settings", icon: "⚙", en: "Settings", yue: "設定" },
  { id: "changelog", icon: "↻", en: "Changelog", yue: "更新記錄" },
  { id: "status", icon: "●", en: "Status", yue: "狀態" },
];
const CATALOG: CatalogItem[] = [
  [
    "desktop-preview",
    "feature",
    "Preview",
    "Material 3 desktop preview",
    "Material 3 桌面預覽",
    "A design-led preview of the proposed WinForge desktop experience.",
    "展示 WinForge 桌面體驗設計方向嘅預覽。",
    "features",
  ],
  [
    "language-modes",
    "feature",
    "Preferences",
    "Three language modes",
    "三種語言模式",
    "English, playful Hong Kong-style Cantonese, and a compact bilingual view.",
    "英文、玩味港式廣東話，同精簡雙語顯示。",
    "settings",
  ],
  [
    "funny-levels",
    "feature",
    "Preferences",
    "Independent tone controls",
    "獨立語氣控制",
    "Separate five-level tone sliders for English and Cantonese site copy.",
    "英文同廣東話文案各自有五級語氣滑桿。",
    "settings",
  ],
  [
    "tabbed-navigation",
    "feature",
    "Navigation",
    "Dockable tab navigation",
    "可停靠分頁導覽",
    "A persistent tab strip that can dock left or move to the top.",
    "持續顯示嘅分頁列，可放左邊或者頂部。",
    "features",
  ],
  [
    "search-builder",
    "feature",
    "Discovery",
    "Search with anchored regex builder",
    "搜尋連貼邊正規表示式工具",
    "Plain-text-first search with guided regex construction, flags, samples, and live matches.",
    "預設純文字搜尋，另有正規表示式組裝、旗標、範例同即時配對。",
    "features",
  ],
  [
    "command-palette",
    "feature",
    "Discovery",
    "Command palette",
    "指令選單",
    "Ctrl+Shift+F opens a searchable route to every site destination.",
    "撳 Ctrl+Shift+F 就可以搜尋並直達網站各處。",
    "features",
  ],
  [
    "release-manifest",
    "feature",
    "Downloads",
    "Verified release manifest",
    "已驗證發佈清單",
    "The installer stays disabled until a manifest identifies a real published asset.",
    "要有清單指向真正發佈檔案，安裝按鈕先會開。",
    "status",
  ],
  [
    "preview-boundary",
    "article",
    "Application",
    "Preview boundary",
    "預覽界線",
    "What this design preview demonstrates, and what it does not claim to operate.",
    "講清楚呢個設計預覽展示啲咩，同埋唔會扮識做啲咩。",
    "docs",
  ],
  [
    "site-preferences",
    "article",
    "Site",
    "Local site preferences",
    "本機網站偏好",
    "How language, tone, theme, density, accent, and tab position stay on this device.",
    "語言、語氣、主題、密度、重點色同分頁位置點樣留喺呢部機。",
    "docs",
  ],
  [
    "search-and-regex",
    "article",
    "Site",
    "Search and regex builder",
    "搜尋同正規表示式工具",
    "The JavaScript regex dialect, flags, bounds, and invalid-pattern recovery.",
    "JavaScript 正規表示式語法、旗標、限制同錯誤處理。",
    "docs",
  ],
  [
    "release-downloads",
    "article",
    "Release",
    "Release downloads",
    "發佈下載",
    "How the site distinguishes an unavailable candidate from a published installer.",
    "網站點樣分清未發佈候選版本同真正可下載安裝程式。",
    "docs",
  ],
  [
    "changelog-viewer",
    "feature",
    "Release",
    "Factual changelog viewer",
    "真實更新記錄",
    "Published versions, dates, commit links, bounded search, date filters, copy, and Markdown export.",
    "已發佈版本、日期、commit 連結、有限搜尋、日期篩選、複製同 Markdown 匯出。",
    "changelog",
  ],
].map(([id, type, category, title, titleYue, summary, summaryYue, tab]) => ({
  id,
  type,
  category,
  title,
  titleYue,
  summary,
  summaryYue,
  tab,
})) as CatalogItem[];

const ARTICLES = [
  {
    id: "preview-boundary",
    title: "Preview boundary",
    titleYue: "預覽界線",
    sections: [
      [
        "Behavior",
        "行為",
        "This site presents an interactive design preview and documentation for a proposed WinForge desktop interface. Controls on this page affect only this page.",
        "呢個網站係 WinForge 桌面介面嘅互動設計預覽同文件。頁面控制只會改呢個頁面。",
      ],
      [
        "Configuration",
        "設定",
        "No system configuration is read or changed. A verified installed application is a separate artifact.",
        "網站唔會讀取或者更改系統設定。真正已安裝應用程式係另一個已驗證檔案。",
      ],
      [
        "Failure modes",
        "失敗處理",
        "Reload the page or reset local preferences if a preview interaction fails. No operating-system action is pending.",
        "預覽互動失靈可以重新載入或者重設本機偏好；唔會有系統操作卡住。",
      ],
      [
        "Security and privacy",
        "安全同私隱",
        "Preferences use local browser storage. The site requests no credentials, system access, analytics, or tracking consent.",
        "偏好只用瀏覽器本機儲存；網站唔會索取密碼、系統權限、分析或者追蹤同意。",
      ],
      [
        "Verification",
        "驗證",
        "A download is not advertised until the published manifest supplies its immutable URL and integrity data.",
        "發佈清單未提供固定下載網址同完整性資料之前，網站唔會話有得下載。",
      ],
    ],
    related: ["Local site preferences", "Release downloads"],
  },
  {
    id: "site-preferences",
    title: "Local site preferences",
    titleYue: "本機網站偏好",
    sections: [
      [
        "Behavior",
        "行為",
        "Language, separate tone levels, theme, density, accent, and tab docking update this site immediately.",
        "語言、兩個語氣級別、主題、密度、重點色同分頁位置會即時更新網站。",
      ],
      [
        "Configuration",
        "設定",
        "Preferences use one versioned browser-storage record. Reset restores the documented defaults.",
        "偏好用一個有版本嘅瀏覽器儲存記錄；重設會回復文件列明嘅預設。",
      ],
      [
        "Failure modes",
        "失敗處理",
        "Unavailable or corrupt browser storage safely falls back to shipped defaults.",
        "瀏覽器儲存用唔到或者損壞時，網站會安全咁退回原裝預設。",
      ],
      [
        "Security and privacy",
        "安全同私隱",
        "Stored values are presentation choices, not credentials or operating-system settings.",
        "保存嘅只係顯示選擇，唔包含密碼或者作業系統設定。",
      ],
      [
        "Verification",
        "驗證",
        "The Settings tab identifies active values and the reset path. This bootstrap does not claim interaction testing.",
        "設定分頁會顯示現有值同重設方法；今次初始版本唔會聲稱做過互動測試。",
      ],
    ],
    related: ["Search and regex builder", "Preview boundary"],
  },
  {
    id: "search-and-regex",
    title: "Search and regex builder",
    titleYue: "搜尋同正規表示式工具",
    sections: [
      [
        "Behavior",
        "行為",
        "Search starts as plain text. The adjacent builder deliberately switches the same field to JavaScript regular expressions.",
        "搜尋預設係純文字；旁邊工具要明確開啟先將同一欄轉成 JavaScript 正規表示式。",
      ],
      [
        "Configuration",
        "設定",
        "The builder includes literals, classes, anchors, groups, alternation, quantifiers, flags, sample text, match counts, and capture groups.",
        "工具有文字、字元組、錨點、群組、或、量詞、旗標、範例、配對數量同擷取群組。",
      ],
      [
        "Failure modes",
        "失敗處理",
        "Invalid patterns show an inline explanation and no results. Plain-text mode remains one action away.",
        "錯誤模式會即場解釋並顯示零結果，一撳就可以轉返純文字。",
      ],
      [
        "Security and privacy",
        "安全同私隱",
        "Patterns and samples run locally against the small built-in catalog and are not transmitted or persisted.",
        "模式同範例只喺本機細小內置目錄處理，唔會傳送或者保存。",
      ],
      [
        "Verification",
        "驗證",
        "The displayed engine is the browser JavaScript RegExp engine. No different dialect is claimed.",
        "畫面列明用瀏覽器 JavaScript RegExp 引擎，唔會扮成其他語法。",
      ],
    ],
    related: ["Local site preferences", "Release downloads"],
  },
  {
    id: "release-downloads",
    title: "Release downloads",
    titleYue: "發佈下載",
    sections: [
      [
        "Behavior",
        "行為",
        "Home and Status read a versioned manifest. Only published status with a URL enables the installer action.",
        "首頁同狀態會讀版本化清單；只得 published 狀態兼有網址先會開安裝按鈕。",
      ],
      [
        "Configuration",
        "設定",
        "The schema records version, tag, commit, platform, asset, URL, SHA-256, size, and publication time.",
        "清單包括版本、標籤、提交、平台、檔名、網址、SHA-256、大小同發佈時間。",
      ],
      [
        "Failure modes",
        "失敗處理",
        "Missing, malformed, candidate, or unavailable data keeps the action disabled instead of guessing a latest URL.",
        "資料遺失、格式錯、仲係候選或者未發佈，都會停用按鈕，唔會亂估最新網址。",
      ],
      [
        "Security and privacy",
        "安全同私隱",
        "Published Windows packages are expected to be unsigned, and the interface states that plainly.",
        "Windows 發佈包預期係未簽署，畫面會清楚講明。",
      ],
      [
        "Verification",
        "驗證",
        "Publication must replace the unavailable record with independently obtained release metadata before advertising the asset.",
        "發佈流程要先用獨立取得嘅資料取代 unavailable 記錄，網站先可以宣傳個檔案。",
      ],
    ],
    related: ["Preview boundary", "Search and regex builder"],
  },
];
const CHANGELOG_ENTRIES = [
  {
    version: "v1.0.35",
    date: "2026-08-19",
    category: "Release",
    summary: "Add local personal vocabulary to the site",
    sha: "0221bcf0d1ef46378a080c2ca98b3f5b2f5740b6",
  },
  {
    version: "v1.0.34",
    date: "2026-08-19",
    category: "Release",
    summary: "Align project settings completeness inventory",
    sha: "af2fb6d24fb265a49125c4a398b8d3719e5b4492",
  },
  {
    version: "v1.0.33",
    date: "2026-08-19",
    category: "Release",
    summary: "Add bounded personal vocabulary loading",
    sha: "5eb2c2f110ca3ab33b6d95b6f227cbc9ca818ead",
  },
  {
    version: "v1.0.32",
    date: "2026-08-19",
    category: "Release",
    summary: "Formalize the app-wide settings allowlist",
    sha: "f2f7305c4f24a4f0373a7489ee2af4cd3534c505",
  },
  {
    version: "v1.0.31",
    date: "2026-08-19",
    category: "Release",
    summary: "Record corrected Settings route evidence",
    sha: "5c363222fe118c357eab35ff4884b8240965cb4c",
  },
] as const;

function dual(en: string, yue: string, mode: LanguageMode) {
  return mode === "yue" ? yue : mode === "both" ? `${en} · ${yue}` : en;
}
function serializedBytes(value: string): number { return new TextEncoder().encode(value).length; }
function readLocalRecord(key: string, maxBytes: number): { raw: string | null; available: boolean; oversized: boolean } {
  try { const raw = localStorage.getItem(key); return { raw: raw && serializedBytes(raw) <= maxBytes ? raw : null, available: true, oversized: Boolean(raw && serializedBytes(raw) > maxBytes) }; }
  catch { return { raw: null, available: false, oversized: false }; }
}
function removeLocalRecord(key: string): boolean { try { localStorage.removeItem(key); return true; } catch { return false; } }
function writeLocalRecord(key: string, value: unknown, maxBytes: number): boolean {
  try { const serialized = JSON.stringify(value); if (serializedBytes(serialized) > maxBytes) return false; localStorage.setItem(key, serialized); return true; } catch { return false; }
}
function boundSettingsHistory(history: SettingsHistory): SettingsHistory {
  const records: SettingsHistoryRecord[] = [];
  for (const record of history.records.slice(0, 100)) { const next = { schemaVersion: 2 as const, records: [...records, record] }; if (serializedBytes(JSON.stringify(next)) > SETTINGS_HISTORY_MAX_BYTES) break; records.push(record); }
  return { schemaVersion: 2, records };
}
function normalizeVocabularyCache(value: unknown): VocabularyCache | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const root = value as Record<string, unknown>;
  if (
    Object.keys(root).length !== 2 ||
    root.schemaVersion !== 1 ||
    !root.replacements ||
    typeof root.replacements !== "object" ||
    Array.isArray(root.replacements)
  )
    return null;
  const entries = Object.entries(root.replacements as Record<string, unknown>);
  if (entries.length > 256) return null;
  const replacements: Record<string, string> = Object.create(null);
  for (const [key, replacement] of entries) {
    if (
      !key ||
      key.length > 128 ||
      typeof replacement !== "string" ||
      !replacement ||
      replacement.length > 256 ||
      ["__proto__", "prototype", "constructor"].includes(key) ||
      /[\u0000-\u001f\u007f]/.test(key + replacement)
    )
      return null;
    replacements[key] = replacement;
  }
  const normalized = {
    schemaVersion: 1 as const,
    replacements: { ...replacements },
  };
  return new TextEncoder().encode(JSON.stringify(normalized)).length <=
    64 * 1024
    ? normalized
    : null;
}
function parseVocabularyJson(source: string): VocabularyCache {
  if (new TextEncoder().encode(source).length > 64 * 1024)
    throw new Error("File must be 64 KiB or smaller.");
  let at = 0;
  const skip = () => {
    while (/\s/.test(source[at] || "")) at += 1;
  };
  const readString = () => {
    const start = at++;
    while (at < source.length) {
      if (source[at] === "\\") {
        at += 2;
        continue;
      }
      if (source[at] === '"') {
        at += 1;
        return JSON.parse(source.slice(start, at)) as string;
      }
      if (source.charCodeAt(at) < 0x20)
        throw new Error("JSON contains an invalid control character.");
      at += 1;
    }
    throw new Error("JSON string is not terminated.");
  };
  const readValue = (depth: number): unknown => {
    if (depth > 4) throw new Error("JSON nesting is too deep.");
    skip();
    if (source[at] === '"') return readString();
    if (source[at] === "{") {
      at += 1;
      skip();
      const out: Record<string, unknown> = Object.create(null);
      const keys = new Set<string>();
      if (source[at] === "}") {
        at += 1;
        return out;
      }
      while (at < source.length) {
        skip();
        if (source[at] !== '"') throw new Error("Object keys must be strings.");
        const key = readString();
        if (keys.has(key)) throw new Error("JSON contains a duplicate key.");
        keys.add(key);
        skip();
        if (source[at++] !== ":")
          throw new Error("JSON object is missing a colon.");
        out[key] = readValue(depth + 1);
        skip();
        const separator = source[at++];
        if (separator === "}") return out;
        if (separator !== ",") throw new Error("JSON object is malformed.");
      }
      throw new Error("JSON object is not terminated.");
    }
    if (source[at] === "[") {
      at += 1;
      skip();
      const out: unknown[] = [];
      if (source[at] === "]") {
        at += 1;
        return out;
      }
      while (at < source.length) {
        out.push(readValue(depth + 1));
        skip();
        const separator = source[at++];
        if (separator === "]") return out;
        if (separator !== ",") throw new Error("JSON array is malformed.");
      }
      throw new Error("JSON array is not terminated.");
    }
    const token =
      /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(
        source.slice(at),
      )?.[0];
    if (!token) throw new Error("JSON value is malformed.");
    at += token.length;
    return JSON.parse(token);
  };
  const parsed = readValue(1);
  skip();
  if (at !== source.length) throw new Error("JSON has trailing content.");
  const normalized = normalizeVocabularyCache(parsed);
  if (!normalized)
    throw new Error(
      "Expected version 1 with at most 256 bounded string replacements and no extra fields.",
    );
  return normalized;
}
function validSiteSetting(key: SiteSettingKey, value: unknown): boolean {
  if (key === "language") return ["en", "yue", "both"].includes(String(value));
  if (key === "theme")
    return ["system", "light", "dark"].includes(String(value));
  if (key === "dock")
    return ["left", "right", "top", "bottom"].includes(String(value));
  if (key === "density")
    return ["comfortable", "compact"].includes(String(value));
  if (key === "accent")
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
  if (key === "showEmojis") return typeof value === "boolean";
  return Number.isFinite(value) && Number(value) >= 1 && Number(value) <= 5;
}
function validGroupName(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    value.trim() !== value ||
    value.length < 1 ||
    value.length > 48 ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    return null;
  return value;
}
function normalizeTabGroupAppearance(value: unknown): TabGroupAppearance | null {
  if (value === undefined) return { ...DEFAULT_GROUP_APPEARANCE };
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const root = value as Record<string, unknown>;
  if (
    Object.keys(root).length !== 3 ||
    typeof root.icon !== "string" ||
    root.icon.length < 1 ||
    root.icon.length > 2 ||
    /[\u0000-\u001f\u007f]/.test(root.icon) ||
    typeof root.textColor !== "string" ||
    !/^#[0-9a-f]{6}$/i.test(root.textColor) ||
    typeof root.backgroundColor !== "string" ||
    !/^#[0-9a-f]{6}$/i.test(root.backgroundColor)
  )
    return null;
  return {
    icon: root.icon,
    textColor: root.textColor.toLowerCase(),
    backgroundColor: root.backgroundColor.toLowerCase(),
  };
}
function normalizeTabGroups(value: unknown): TabGroupsState | null {
  if (value === undefined) return { schemaVersion: 2, groups: [] };
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const root = value as Record<string, unknown>;
  if (
    Object.keys(root).length !== 2 ||
    ![1, 2].includes(Number(root.schemaVersion)) ||
    !Array.isArray(root.groups) ||
    root.groups.length > 8
  )
    return null;
  const groupIds = new Set<string>();
  const assignedTabs = new Set<TabId>();
  const knownTabs = new Set(TABS.map((tab) => tab.id));
  const groups: TabGroup[] = [];
  for (const candidate of root.groups) {
    if (
      !candidate ||
      typeof candidate !== "object" ||
      Array.isArray(candidate) ||
      ![5, 6].includes(Object.keys(candidate).length)
    )
      return null;
    const group = candidate as Partial<TabGroup> & { appearance?: unknown };
    if (
      typeof group.id !== "string" ||
      !/^group-[a-z0-9]{8,24}$/.test(group.id) ||
      groupIds.has(group.id) ||
      validGroupName(group.name) === null ||
      typeof group.color !== "string" ||
      !/^#[0-9a-f]{6}$/i.test(group.color) ||
      typeof group.collapsed !== "boolean" ||
      !Array.isArray(group.tabs) ||
      group.tabs.length > TABS.length ||
      (Number(root.schemaVersion) === 2 && normalizeTabGroupAppearance(group.appearance) === null)
    )
      return null;
    const tabs = group.tabs as TabId[];
    if (
      new Set(tabs).size !== tabs.length ||
      tabs.some((tab) => !knownTabs.has(tab) || assignedTabs.has(tab))
    )
      return null;
    groupIds.add(group.id);
    tabs.forEach((tab) => assignedTabs.add(tab));
    const appearance = normalizeTabGroupAppearance(group.appearance);
    if (!appearance) return null;
    groups.push({
      id: group.id,
      name: group.name,
      color: group.color.toLowerCase(),
      collapsed: group.collapsed,
      tabs: [...tabs],
      appearance,
    });
  }
  return { schemaVersion: 2, groups };
}
function normalizeLogoState(value: unknown): SettingsLogoState | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== 2
  )
    return null;
  const logo = value as Partial<SettingsLogoState>;
  const customLogo =
    logo.customLogo === null ||
    (typeof logo.customLogo === "string" &&
      logo.customLogo.length <= 360000 &&
      /^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(
        logo.customLogo,
      ))
      ? logo.customLogo
      : undefined;
  if (
    !["forge", "tile", "mono"].includes(logo.logoPreset ?? "") ||
    customLogo === undefined
  )
    return null;
  return { logoPreset: logo.logoPreset as LogoPreset, customLogo };
}
function normalizeOwnership(
  value: unknown,
  legacy: SiteSettingValues,
): SiteSettingsOwnership {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {
      schemaVersion: 1,
      global: { ...legacy },
      projects: [],
      activeProjectId: null,
    };
  const root = value as Partial<SiteSettingsOwnership>;
  if (
    root.schemaVersion !== 1 ||
    !root.global ||
    typeof root.global !== "object" ||
    Array.isArray(root.global) ||
    !Array.isArray(root.projects) ||
    root.projects.length > 50 ||
    Object.keys(root.global).length !== SITE_SETTING_KEYS.length ||
    !SITE_SETTING_KEYS.every((key) => validSiteSetting(key, root.global?.[key]))
  )
    return {
      schemaVersion: 1,
      global: { ...legacy },
      projects: [],
      activeProjectId: null,
    };
  const seen = new Set<string>();
  const projects: SiteProject[] = [];
  for (const candidate of root.projects) {
    if (
      !candidate ||
      typeof candidate !== "object" ||
      !/^project-[a-z0-9-]{6,48}$/.test(candidate.id) ||
      seen.has(candidate.id) ||
      typeof candidate.name !== "string" ||
      !candidate.name.trim() ||
      candidate.name.trim().length > 64 ||
      /[\u0000-\u001f\u007f]/.test(candidate.name) ||
      !candidate.overrides ||
      typeof candidate.overrides !== "object" ||
      Array.isArray(candidate.overrides)
    )
      continue;
    const keys = Object.keys(candidate.overrides) as SiteSettingKey[];
    if (
      keys.length > SITE_SETTING_KEYS.length ||
      !keys.every(
        (key) =>
          SITE_SETTING_KEYS.includes(key) &&
          validSiteSetting(key, candidate.overrides[key]),
      )
    )
      continue;
    seen.add(candidate.id);
    projects.push({
      id: candidate.id,
      name: candidate.name.trim(),
      overrides: { ...candidate.overrides },
    });
  }
  const activeProjectId =
    typeof root.activeProjectId === "string" && seen.has(root.activeProjectId)
      ? root.activeProjectId
      : null;
  return {
    schemaVersion: 1,
    global: { ...root.global } as SiteSettingValues,
    projects,
    activeProjectId,
  };
}
function normalizePreferences(value: unknown): Preferences | null {
  if (!value || typeof value !== "object") return null;
  const v = Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([key]) =>
      PREFERENCE_KEYS.has(key),
    ),
  ) as Partial<Preferences>;
  // Unknown root fields are deliberately discarded by this allowlisted reconstruction.
  // This keeps legacy browser records bounded without copying arbitrary data back to storage.
  const validCustomLogo =
    v.customLogo === undefined ||
    normalizeLogoState({
      logoPreset: v.logoPreset ?? "forge",
      customLogo: v.customLogo ?? null,
    }) !== null;
  const pinnedTabs =
    v.pinnedTabs === undefined
      ? []
      : Array.isArray(v.pinnedTabs) &&
          v.pinnedTabs.length <= TABS.length &&
          new Set(v.pinnedTabs).size === v.pinnedTabs.length &&
          v.pinnedTabs.every((id) => TABS.some((tab) => tab.id === id))
        ? (v.pinnedTabs as TabId[])
        : null;
  const defaultTabOrder = TABS.map((tab) => tab.id);
  const tabOrder =
    v.tabOrder === undefined
      ? defaultTabOrder
      : Array.isArray(v.tabOrder) &&
          v.tabOrder.length === TABS.length &&
          new Set(v.tabOrder).size === TABS.length &&
          v.tabOrder.every((id) => defaultTabOrder.includes(id))
        ? (v.tabOrder as TabId[])
        : null;
  const tabGroups = normalizeTabGroups(v.tabGroups);
  const valid =
    ["en", "yue", "both"].includes(v.language ?? "") &&
    ["system", "light", "dark"].includes(v.theme ?? "") &&
    ["left", "right", "top", "bottom"].includes(v.dock ?? "") &&
    ["comfortable", "compact"].includes(v.density ?? "") &&
    validSiteSetting("funnyEnglish", v.funnyEnglish) &&
    validSiteSetting("funnyCantonese", v.funnyCantonese) &&
    typeof v.accent === "string" &&
    /^#[0-9a-f]{6}$/i.test(v.accent) &&
    (v.schemaVersion === undefined || v.schemaVersion === 1) &&
    (v.showEmojis === undefined || typeof v.showEmojis === "boolean") &&
    (v.logoPreset === undefined ||
      ["forge", "tile", "mono"].includes(v.logoPreset)) &&
    validCustomLogo &&
    pinnedTabs !== null &&
    tabOrder !== null &&
    tabGroups !== null;
  const personalVocabulary =
    v.personalVocabulary === undefined || v.personalVocabulary === null
      ? null
      : normalizeVocabularyCache(v.personalVocabulary);
  if (
    !valid ||
    !(
      v.personalVocabulary === undefined ||
      v.personalVocabulary === null ||
      personalVocabulary
    )
  )
    return null;
  const legacy = Object.fromEntries(
    SITE_SETTING_KEYS.map((key) => [key, v[key] ?? DEFAULT_SITE_SETTINGS[key]]),
  ) as SiteSettingValues;
  const settingsOwnership = normalizeOwnership(v.settingsOwnership, legacy);
  const active = settingsOwnership.projects.find(
    (project) => project.id === settingsOwnership.activeProjectId,
  );
  const effective = {
    ...settingsOwnership.global,
    ...(active?.overrides ?? {}),
  };
  return {
    schemaVersion: 1,
    language: effective.language,
    funnyEnglish: effective.funnyEnglish,
    funnyCantonese: effective.funnyCantonese,
    theme: effective.theme,
    dock: effective.dock,
    density: effective.density,
    accent: effective.accent,
    showEmojis: effective.showEmojis,
    pinnedTabs,
    tabOrder,
    tabGroups: {
      schemaVersion: 2,
      groups: tabGroups.groups.map((group) => ({
        ...group,
        tabs: group.tabs.filter((tab) => !pinnedTabs.includes(tab)),
      })),
    },
    personalVocabulary,
    logoPreset: v.logoPreset ?? "forge",
    customLogo: v.customLogo ?? null,
    settingsOwnership,
  };
}
function normalizeNotificationHistory(
  value: unknown,
): NotificationHistory | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const root = value as Partial<NotificationHistory>;
  if (
    Object.keys(root).length !== 3 ||
    root.schemaVersion !== 1 ||
    !Array.isArray(root.records) ||
    root.records.length > 100 ||
    !(
      root.readThrough === null ||
      (typeof root.readThrough === "string" &&
        new Date(root.readThrough).toISOString() === root.readThrough)
    )
  )
    return null;
  const seen = new Set<string>();
  const records: NotificationRecord[] = [];
  for (const record of root.records) {
    if (
      !record ||
      typeof record !== "object" ||
      Object.keys(record).length !== 5 ||
      !/^notification-[a-z0-9-]{8,64}$/.test(record.id) ||
      seen.has(record.id) ||
      !["info", "success", "warning", "error"].includes(record.kind) ||
      typeof record.title !== "string" ||
      !record.title ||
      record.title.length > 80 ||
      typeof record.body !== "string" ||
      !record.body ||
      record.body.length > 512 ||
      typeof record.timestamp !== "string" ||
      new Date(record.timestamp).toISOString() !== record.timestamp ||
      /[\u0000-\u001f\u007f]/.test(record.title + record.body)
    )
      return null;
    seen.add(record.id);
    records.push({ ...record });
  }
  return { schemaVersion: 1, records, readThrough: root.readThrough ?? null };
}
function normalizeSettingsHistory(value: unknown): SettingsHistory | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const root = value as Partial<SettingsHistory>;
  if (
    Object.keys(root).length !== 2 ||
    ![1, 2].includes(Number(root.schemaVersion)) ||
    !Array.isArray(root.records) ||
    root.records.length > 100
  )
    return null;
  const actions: SettingsHistoryAction[] = [
    "global-setting-changed",
    "project-setting-changed",
    "project-created",
    "project-switched",
    "project-reset",
    "global-reset",
    "logo-changed",
    "restored",
  ];
  const seen = new Set<string>();
  const records: SettingsHistoryRecord[] = [];
  for (const candidate of root.records) {
    const legacy = root.schemaVersion === 1;
    if (
      !candidate ||
      typeof candidate !== "object" ||
      Object.keys(candidate).length !== (legacy ? 6 : 7) ||
      !/^settings-[a-z0-9-]{8,64}$/.test(candidate.id) ||
      seen.has(candidate.id) ||
      !actions.includes(candidate.action) ||
      (legacy && candidate.action === "logo-changed") ||
      typeof candidate.timestamp !== "string" ||
      !Number.isFinite(Date.parse(candidate.timestamp)) ||
      new Date(candidate.timestamp).toISOString() !== candidate.timestamp ||
      typeof candidate.label !== "string" ||
      !candidate.label.trim() ||
      candidate.label.length > 96 ||
      /[\u0000-\u001f\u007f]/.test(candidate.label) ||
      !candidate.effective ||
      typeof candidate.effective !== "object" ||
      Object.keys(candidate.effective).length !== SITE_SETTING_KEYS.length ||
      !SITE_SETTING_KEYS.every((key) =>
        validSiteSetting(key, candidate.effective[key]),
      )
    )
      return null;
    const ownership = normalizeOwnership(
      candidate.ownership,
      candidate.effective as SiteSettingValues,
    );
    if (JSON.stringify(ownership) !== JSON.stringify(candidate.ownership))
      return null;
    const active = ownership.projects.find(
      (project) => project.id === ownership.activeProjectId,
    );
    const effective = { ...ownership.global, ...(active?.overrides ?? {}) };
    if (
      !SITE_SETTING_KEYS.every(
        (key) => effective[key] === candidate.effective[key],
      )
    )
      return null;
    const normalizedLogo = legacy
      ? { logoPreset: "forge" as LogoPreset, customLogo: null }
      : normalizeLogoState(candidate.logo);
    if (!normalizedLogo) return null;
    const logo = { logoPreset: normalizedLogo.logoPreset, customLogo: null };
    seen.add(candidate.id);
    records.push({
      ...candidate,
      label: candidate.label.trim(),
      effective: { ...candidate.effective },
      ownership,
      logo,
    });
  }
  return { schemaVersion: 2, records };
}
function validManifest(value: unknown): value is Manifest {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<Manifest>;
  return (
    v.schemaVersion === 1 &&
    ["unavailable", "published"].includes(v.status ?? "") &&
    typeof v.platform === "string"
  );
}
function formatBytes(value: number | null) {
  if (!value) return "Not published";
  const units = ["B", "KB", "MB", "GB"];
  let amount = value;
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) {
    amount /= 1024;
    unit += 1;
  }
  return `${amount.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

export default function SiteShell({
  assetBase,
  initialManifest,
}: {
  assetBase: string;
  initialManifest?: unknown;
}) {
  const bootManifest = validManifest(initialManifest) ? initialManifest : null;
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [narrowTabs, setNarrowTabs] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [tabOverflow, setTabOverflow] = useState(false);
  const [tabOverflowOpen, setTabOverflowOpen] = useState(false);
  const [tabOverflowQuery, setTabOverflowQuery] = useState("");
  const [tabOverflowRegex, setTabOverflowRegex] = useState(false);
  const [tabOverflowBuilderOpen, setTabOverflowBuilderOpen] = useState(false);
  const [tabOverflowFlags, setTabOverflowFlags] = useState({
    i: true,
    m: false,
  });
  const [tabOverflowSample, setTabOverflowSample] = useState(
    "Home\nFeature map\nDocumentation\nSettings\nChangelog\nStatus",
  );
  const [bulkCloseQuery, setBulkCloseQuery] = useState("");
  const [bulkCloseRegex, setBulkCloseRegex] = useState(false);
  const [bulkCloseBuilderOpen, setBulkCloseBuilderOpen] = useState(false);
  const [bulkCloseFlags, setBulkCloseFlags] = useState({ i: true, m: false });
  const [bulkCloseSample, setBulkCloseSample] = useState(
    "Home\nFeature map\nDocumentation\nSettings\nChangelog\nStatus",
  );
  const [bulkCloseIncludePinned, setBulkCloseIncludePinned] = useState(false);
  const [bulkCloseMode, setBulkCloseMode] = useState<BulkCloseMode | null>(
    null,
  );
  const [bulkCloseConfirmOpen, setBulkCloseConfirmOpen] = useState(false);
  const [bulkCloseKeyTabs, setBulkCloseKeyTabs] = useState(false);
  const [bulkCloseKeyPinned, setBulkCloseKeyPinned] = useState(false);
  const [bulkCloseSlider, setBulkCloseSlider] = useState(0);
  const [bulkCloseComplete, setBulkCloseComplete] = useState(false);
  const [bulkCloseCompletedCount, setBulkCloseCompletedCount] = useState(0);
  const bulkCloseOrigin = useRef<HTMLElement | null>(null);
  const bulkCloseCommitted = useRef(false);
  const tabItemsRef = useRef<HTMLDivElement | null>(null);
  const [movePickerTab, setMovePickerTab] = useState<TabId | null>(null);
  const [moveGroupQuery, setMoveGroupQuery] = useState("");
  const [moveGroupRegex, setMoveGroupRegex] = useState(false);
  const [moveGroupBuilderOpen, setMoveGroupBuilderOpen] = useState(false);
  const [moveGroupFlags, setMoveGroupFlags] = useState({ i: true, m: false });
  const [moveGroupSample, setMoveGroupSample] = useState(
    "Work\nReference\nLater",
  );
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#2f7d45");
  const [groupSearches, setGroupSearches] = useState<
    Record<string, GroupSearchState>
  >({});
  const [groupAppearanceHeaderId, setGroupAppearanceHeaderId] = useState<string | null>(null);
  const [groupAppearanceSettingsId, setGroupAppearanceSettingsId] = useState<string | null>(null);
  const movePickerOrigin = useRef<HTMLElement | null>(null);
  const movePickerDialog = useRef<HTMLElement | null>(null);
  const [persistenceAvailable, setPersistenceAvailable] = useState(true);
  const [query, setQuery] = useState("");
  const [regexMode, setRegexMode] = useState(false);
  const [flags, setFlags] = useState({ i: true, m: false });
  const [builderOpen, setBuilderOpen] = useState(false);
  const [sample, setSample] = useState(
    "WinForge preview\nMaterial 3 release status\nVerified installer",
  );
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteRegex, setPaletteRegex] = useState(false);
  const [paletteBuilderOpen, setPaletteBuilderOpen] = useState(false);
  const [paletteFlags, setPaletteFlags] = useState({ i: true, m: false });
  const [paletteSample, setPaletteSample] = useState(
    "Settings history\nNotification center\nReset site preferences",
  );
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetKeySettings, setResetKeySettings] = useState(false);
  const [resetKeyProjects, setResetKeyProjects] = useState(false);
  const [resetSlider, setResetSlider] = useState(0);
  const [resetComplete, setResetComplete] = useState(false);
  const resetOrigin = useRef<HTMLElement | null>(null);
  const resetCommitted = useRef(false);
  const paletteOpener = useRef<HTMLElement | null>(null);
  const paletteDialog = useRef<HTMLElement | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(bootManifest);
  const [manifestState, setManifestState] = useState<
    "loading" | "ready" | "failed"
  >(bootManifest ? "ready" : "loading");
  const [toast, setToast] = useState<string | null>(null);
  const [articleId, setArticleId] = useState(ARTICLES[0].id);
  const [settingsGridTarget, setSettingsGridTarget] = useState<Element | null>(
    null,
  );
  const [settingsQuery, setSettingsQuery] = useState("");
  const [settingsRegex, setSettingsRegex] = useState(false);
  const [settingsBuilderOpen, setSettingsBuilderOpen] = useState(false);
  const [settingsFlags, setSettingsFlags] = useState({ i: true, m: false });
  const [settingsSample, setSettingsSample] = useState(
    "Theme\nTab position\nPersonal vocabulary\nApp logo",
  );
  const [groupSettingsQuery, setGroupSettingsQuery] = useState("");
  const [groupSettingsRegex, setGroupSettingsRegex] = useState(false);
  const [groupSettingsBuilderOpen, setGroupSettingsBuilderOpen] =
    useState(false);
  const [groupSettingsFlags, setGroupSettingsFlags] = useState({
    i: true,
    m: false,
  });
  const [groupSettingsSample, setGroupSettingsSample] = useState(
    "Work\nReference\nLater",
  );
  const [masterTabQuery, setMasterTabQuery] = useState("");
  const [masterTabRegex, setMasterTabRegex] = useState(false);
  const [masterTabBuilderOpen, setMasterTabBuilderOpen] = useState(false);
  const [masterTabFlags, setMasterTabFlags] = useState({ i: true, m: false });
  const [masterTabSample, setMasterTabSample] = useState(
    "Home\nFeature map\nDocumentation\nSettings\nChangelog\nStatus",
  );
  const [changelogQuery, setChangelogQuery] = useState("");
  const [changelogRegex, setChangelogRegex] = useState(false);
  const [changelogFrom, setChangelogFrom] = useState("");
  const [changelogTo, setChangelogTo] = useState("");
  const [vocabStatus, setVocabStatus] = useState<
    "no-file" | "loaded" | "invalid"
  >("no-file");
  const [vocabMessage, setVocabMessage] = useState("");
  const [logoStatus, setLogoStatus] = useState<
    "no-custom" | "loaded" | "invalid"
  >("no-custom");
  const [logoMessage, setLogoMessage] = useState("");
  const [projectQuery, setProjectQuery] = useState("");
  const [projectRegex, setProjectRegex] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectBuilderOpen, setProjectBuilderOpen] = useState(false);
  const [projectFlags, setProjectFlags] = useState({ i: true, m: false });
  const [projectSample, setProjectSample] = useState(
    "Global defaults\nExample local project",
  );
  const [projectBuilderTarget, setProjectBuilderTarget] =
    useState<Element | null>(null);
  const [notificationHistory, setNotificationHistory] =
    useState<NotificationHistory>({
      schemaVersion: 1,
      records: [],
      readThrough: null,
    });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationQuery, setNotificationQuery] = useState("");
  const [notificationRegex, setNotificationRegex] = useState(false);
  const [notificationBuilderOpen, setNotificationBuilderOpen] = useState(false);
  const [notificationFlags, setNotificationFlags] = useState({
    i: true,
    m: false,
  });
  const [notificationSample, setNotificationSample] = useState(
    "Site preferences reset.\nInstaller unavailable",
  );
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [settingsHistory, setSettingsHistory] = useState<SettingsHistory>({
    schemaVersion: 2,
    records: [],
  });
  const [settingsHistoryOpen, setSettingsHistoryOpen] = useState(false);
  const [settingsHistoryQuery, setSettingsHistoryQuery] = useState("");
  const [settingsHistoryRegex, setSettingsHistoryRegex] = useState(false);
  const [settingsHistoryBuilderOpen, setSettingsHistoryBuilderOpen] =
    useState(false);
  const [settingsHistoryFlags, setSettingsHistoryFlags] = useState({
    i: true,
    m: false,
  });
  const [settingsHistorySample, setSettingsHistorySample] = useState(
    "Theme changed\nProject reset",
  );
  const [settingsHistoryFrom, setSettingsHistoryFrom] = useState("");
  const [settingsHistoryTo, setSettingsHistoryTo] = useState("");
  const [settingsHistoryAction, setSettingsHistoryAction] = useState<
    SettingsHistoryAction | "all"
  >("all");
  const [settingsRestoreId, setSettingsRestoreId] = useState<string | null>(
    null,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const language = prefs.language;
  const announce = useCallback(
    (
      message: string,
      kind: NotificationKind = "info",
      title = "Site notification",
      recordBody = message,
    ) => {
      setToast(message);
      const timestamp = new Date().toISOString();
      const id = `notification-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const safeTitle =
        title
          .slice(0, 80)
          .replace(/[\u0000-\u001f\u007f]/g, " ")
          .trim() || "Site notification";
      const safeBody =
        recordBody
          .slice(0, 512)
          .replace(/[\u0000-\u001f\u007f]/g, " ")
          .trim() || "Site event recorded.";
      setNotificationHistory((history) => ({
        ...history,
        records: [
          { id, kind, title: safeTitle, body: safeBody, timestamp },
          ...history.records,
        ].slice(0, 100),
      }));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 4200);
    },
    [],
  );
  const openPalette = useCallback((opener?: HTMLElement | null) => {
    paletteOpener.current =
      opener ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    setPaletteOpen(true);
  }, []);
  const closePalette = useCallback((restoreFocus = true) => {
    setPaletteOpen(false);
    setPaletteBuilderOpen(false);
    if (restoreFocus) setTimeout(() => paletteOpener.current?.focus(), 0);
  }, []);
  const closeMovePicker = useCallback(() => {
    setMovePickerTab(null);
    setMoveGroupBuilderOpen(false);
    setMoveGroupQuery("");
    setTimeout(() => movePickerOrigin.current?.focus(), 0);
  }, []);
  const defaultGroupSearch = (group: TabGroup): GroupSearchState => ({
    query: "",
    regex: false,
    flags: { i: true, m: false },
    sample: group.tabs
      .map((tabId) => TABS.find((tab) => tab.id === tabId)?.en ?? "")
      .join("\n"),
    builderOpen: false,
  });
  const updateGroupSearch = (
    group: TabGroup,
    patch: Partial<GroupSearchState>,
  ) =>
    setGroupSearches((current) => ({
      ...current,
      [group.id]: {
        ...(current[group.id] ?? defaultGroupSearch(group)),
        ...patch,
      },
    }));

  useEffect(() => {
    const preferenceRecord = readLocalRecord(STORAGE_KEY, PREFERENCES_MAX_BYTES);
    if (!preferenceRecord.available) setPersistenceAvailable(false);
    if (preferenceRecord.oversized) removeLocalRecord(STORAGE_KEY);
    if (preferenceRecord.raw)
      try {
        const parsed = normalizePreferences(JSON.parse(preferenceRecord.raw));
        if (parsed) {
          setPrefs(parsed);
          setVocabStatus(parsed.personalVocabulary ? "loaded" : "no-file");
          setLogoStatus(parsed.customLogo ? "loaded" : "no-custom");
        } else removeLocalRecord(STORAGE_KEY);
      } catch {
        removeLocalRecord(STORAGE_KEY);
      }
    const hash = location.hash.slice(1) as TabId;
    if (TABS.some((tab) => tab.id === hash)) setActiveTab(hash);
    const notificationRecord = readLocalRecord(NOTIFICATION_KEY, NOTIFICATION_MAX_BYTES);
    if (!notificationRecord.available) setPersistenceAvailable(false);
    if (notificationRecord.oversized) removeLocalRecord(NOTIFICATION_KEY);
    if (notificationRecord.raw)
      try {
        const parsed = normalizeNotificationHistory(
          JSON.parse(notificationRecord.raw),
        );
        if (parsed) setNotificationHistory(parsed);
        else removeLocalRecord(NOTIFICATION_KEY);
      } catch {
        removeLocalRecord(NOTIFICATION_KEY);
      }
    const settingsRecord = readLocalRecord(SETTINGS_HISTORY_KEY, SETTINGS_HISTORY_MAX_BYTES);
    if (!settingsRecord.available) setPersistenceAvailable(false);
    if (settingsRecord.oversized) removeLocalRecord(SETTINGS_HISTORY_KEY);
    if (settingsRecord.raw)
      try {
        const parsed = normalizeSettingsHistory(JSON.parse(settingsRecord.raw));
        if (parsed) setSettingsHistory(parsed);
        else removeLocalRecord(SETTINGS_HISTORY_KEY);
      } catch {
        removeLocalRecord(SETTINGS_HISTORY_KEY);
      }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated && !writeLocalRecord(STORAGE_KEY, prefs, PREFERENCES_MAX_BYTES)) setPersistenceAvailable(false);
  }, [hydrated, prefs]);
  useEffect(() => {
    const media = matchMedia("(max-width: 760px)");
    const sync = () => setNarrowTabs(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const element = tabItemsRef.current;
    if (!element) return;
    const measure = () => {
      const vertical = !narrowTabs && ["left", "right"].includes(prefs.dock);
      setTabOverflow(
        vertical
          ? element.scrollHeight > element.clientHeight + 1
          : element.scrollWidth > element.clientWidth + 1,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [
    language,
    narrowTabs,
    prefs.dock,
    prefs.pinnedTabs,
    prefs.tabOrder,
    prefs.tabGroups.groups,
  ]);
  useEffect(() => {
    if (!tabOverflow) {
      setTabOverflowOpen(false);
      setTabOverflowBuilderOpen(false);
    }
  }, [tabOverflow]);
  useEffect(() => {
    if (hydrated && !writeLocalRecord(NOTIFICATION_KEY, notificationHistory, NOTIFICATION_MAX_BYTES)) setPersistenceAvailable(false);
  }, [hydrated, notificationHistory]);
  useEffect(() => {
    if (hydrated) { const bounded = boundSettingsHistory(settingsHistory); if (bounded.records.length !== settingsHistory.records.length) setSettingsHistory(bounded); if (!writeLocalRecord(SETTINGS_HISTORY_KEY, bounded, SETTINGS_HISTORY_MAX_BYTES)) setPersistenceAvailable(false); }
  }, [hydrated, settingsHistory]);
  useEffect(() => {
    if (activeTab !== "settings") {
      setSettingsGridTarget(null);
      return;
    }
    const timer = setTimeout(() => {
      const grid = document.querySelector("#panel-settings .settings-grid");
      [
        "setting-language",
        "setting-funny-en",
        "setting-funny-yue",
        "setting-theme",
        "tab-docking-setting",
        "setting-density",
        "setting-accent",
      ].forEach((id, index) => {
        const card = grid?.children.item(index);
        if (card instanceof HTMLElement) {
          card.id = id;
          card.tabIndex = -1;
        }
      });
      const reset = document.querySelector<HTMLElement>(
        "#panel-settings .reset-card",
      );
      if (reset) {
        reset.id = "setting-reset";
        reset.tabIndex = -1;
      }
      setSettingsGridTarget(grid);
      setProjectBuilderTarget(
        document.querySelector("#site-project-settings .project-search"),
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab]);
  useEffect(() => {
    if (!settingsGridTarget) {
      setProjectBuilderTarget(null);
      return;
    }
    const timer = setTimeout(
      () =>
        setProjectBuilderTarget(
          document.querySelector("#site-project-settings .project-search"),
        ),
      0,
    );
    return () => clearTimeout(timer);
  }, [settingsGridTarget]);
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.style.colorScheme =
      prefs.theme === "system" ? "light dark" : prefs.theme;
    document.documentElement.lang =
      prefs.language === "yue" ? "zh-Hant-HK" : "en";
  }, [prefs.language, prefs.theme]);
  useEffect(() => {
    fetch(`${assetBase}/release-manifest.json`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<unknown>;
      })
      .then((value) => {
        if (!validManifest(value)) throw new Error();
        setManifest(value);
        setManifestState("ready");
      })
      .catch(() => setManifestState("failed"));
  }, [assetBase]);
  useEffect(() => {
    const shell = document.querySelector(".site-shell");
    if (!shell) return;
    for (const child of Array.from(shell.children))
      if (
        child instanceof HTMLElement &&
        !child.classList.contains("dialog-scrim")
      )
        child.inert =
          paletteOpen ||
          resetConfirmOpen ||
          movePickerTab !== null ||
          bulkCloseConfirmOpen;
    return () => {
      for (const child of Array.from(shell.children))
        if (child instanceof HTMLElement) child.inert = false;
    };
  }, [bulkCloseConfirmOpen, paletteOpen, resetConfirmOpen, movePickerTab]);
  useEffect(() => {
    if (!paletteOpen) return;
    const dialog = paletteDialog.current;
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(
        (element) => !element.hidden && element.getClientRects().length > 0,
      );
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    dialog?.addEventListener("keydown", trap);
    return () => dialog?.removeEventListener("keydown", trap);
  }, [paletteOpen, paletteBuilderOpen]);
  useEffect(() => {
    if (!movePickerTab) return;
    const dialog = movePickerDialog.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []).filter((element) => !element.hidden && element.getClientRects().length > 0);
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable(); if (!items.length) { event.preventDefault(); dialog?.focus(); return; }
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [closeMovePicker, moveGroupBuilderOpen, movePickerTab]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        openPalette();
      }
      if (event.key === "Escape") {
        if (movePickerTab) closeMovePicker();
        if (paletteOpen) closePalette();
        setBuilderOpen(false);
        setSettingsBuilderOpen(false);
        setNotificationOpen(false);
        setNotificationBuilderOpen(false);
        setSettingsHistoryOpen(false);
        setSettingsHistoryBuilderOpen(false);
        setSettingsRestoreId(null);
        if (resetConfirmOpen) {
          setResetConfirmOpen(false);
          resetCommitted.current = false;
          setResetKeySettings(false);
          setResetKeyProjects(false);
          setResetSlider(0);
          setResetComplete(false);
          setTimeout(() => resetOrigin.current?.focus(), 0);
        }
      }
    };
    addEventListener("keydown", handler);
    return () => removeEventListener("keydown", handler);
  }, [closeMovePicker, closePalette, movePickerTab, openPalette, paletteOpen, resetConfirmOpen]);

  const selectTab = useCallback((tab: TabId, focus?: string) => {
    setPrefs((current) => ({
      ...current,
      tabGroups: {
        ...current.tabGroups,
        groups: current.tabGroups.groups.map((group) =>
          group.tabs.includes(tab) ? { ...group, collapsed: false } : group,
        ),
      },
    }));
    setActiveTab(tab);
    history.replaceState(null, "", `#${tab}`);
    if (focus) setTimeout(() => document.getElementById(focus)?.focus(), 40);
  }, []);
  const togglePinnedTab = (tabId: TabId, returnFocus = true) => {
    const pinned = prefs.pinnedTabs.includes(tabId);
    const pinnedTabs = pinned
      ? prefs.pinnedTabs.filter((id) => id !== tabId)
      : [...prefs.pinnedTabs, tabId];
    setPrefs({
      ...prefs,
      pinnedTabs,
      tabGroups: pinned
        ? prefs.tabGroups
        : {
            schemaVersion: 2,
            groups: prefs.tabGroups.groups.map((group) => ({
              ...group,
              tabs: group.tabs.filter((tab) => tab !== tabId),
            })),
          },
    });
    announce(
      dual(
        pinned
          ? "Tab unpinned locally."
          : "Tab pinned locally and protected from future bulk close.",
        pinned
          ? "分頁已喺本機取消釘選。"
          : "分頁已喺本機釘選，亦會受保護免受日後批量關閉。",
        language,
      ),
      "success",
      "Tab pinning",
    );
    if (returnFocus)
      setTimeout(() => document.getElementById(`tab-${tabId}`)?.focus(), 0);
  };
  const createTabGroup = (assignTab?: TabId) => {
    const name = validGroupName(newGroupName);
    if (
      !name ||
      prefs.tabGroups.groups.length >= 8 ||
      !/^#[0-9a-f]{6}$/i.test(newGroupColor)
    )
      return;
    if (assignTab && prefs.pinnedTabs.includes(assignTab)) {
      announce(
        dual(
          "Pinned tabs stay in the pinned region and cannot join a group.",
          "已釘選分頁會留喺釘選區域，唔可以加入群組。",
          language,
        ),
        "warning",
        "Tab groups",
      );
      closeMovePicker();
      return;
    }
    const candidates = Array.from({ length: 8 }, () => `group-${crypto.getRandomValues(new Uint32Array(4)).reduce((value, part) => value + part.toString(36).padStart(7, "0"), "").slice(0, 20)}`);
    if (!candidates.some((candidate) => !prefs.tabGroups.groups.some((group) => group.id === candidate))) { announce(dual("A unique group identifier could not be created. Nothing changed.", "建立唔到唯一群組識別碼；冇任何變更。", language), "error", "Tab groups"); return; }
    setPrefs((current) => {
      if (current.tabGroups.groups.length >= 8 || (assignTab && current.pinnedTabs.includes(assignTab))) return current;
      const generatedId = candidates.find((candidate) => !current.tabGroups.groups.some((item) => item.id === candidate));
      if (!generatedId) return current;
      const group: TabGroup = { id: generatedId, name, color: newGroupColor.toLowerCase(), collapsed: false, tabs: assignTab ? [assignTab] : [], appearance: { ...DEFAULT_GROUP_APPEARANCE } };
      const withoutTab = assignTab
        ? current.tabGroups.groups.map((item) => ({
            ...item,
            tabs: item.tabs.filter((tab) => tab !== assignTab),
          }))
        : current.tabGroups.groups;
      return {
        ...current,
        tabGroups: { schemaVersion: 2, groups: [...withoutTab, group] },
      };
    });
    setNewGroupName("");
    announce(
      dual(
        `Group “${name}” created locally.`,
        `群組「${name}」已喺本機建立。`,
        language,
      ),
      "success",
      "Tab groups",
    );
    if (assignTab) closeMovePicker();
  };
  const updateTabGroup = (
    groupId: string,
    patch: Partial<Pick<TabGroup, "name" | "color" | "collapsed">>,
  ): boolean => {
    if (!prefs.tabGroups.groups.some((group) => group.id === groupId))
      return false;
    const nextName =
      patch.name === undefined ? undefined : validGroupName(patch.name);
    if (patch.name !== undefined && !nextName) return false;
    if (patch.color !== undefined && !/^#[0-9a-f]{6}$/i.test(patch.color))
      return false;
    const normalizedPatch = {
      ...patch,
      ...(nextName ? { name: nextName } : {}),
      ...(patch.color ? { color: patch.color.toLowerCase() } : {}),
    };
    setPrefs({
      ...prefs,
      tabGroups: {
        schemaVersion: 2,
        groups: prefs.tabGroups.groups.map((group) =>
          group.id === groupId
            ? { ...group, ...normalizedPatch }
            : group,
        ),
      },
    });
    return true;
  };
  const updateTabGroupAppearance = (
    groupId: string,
    patch: Partial<TabGroupAppearance>,
  ): boolean => {
    const group = prefs.tabGroups.groups.find((item) => item.id === groupId);
    if (!group) return false;
    const next = { ...group.appearance, ...patch };
    if (
      typeof next.icon !== "string" ||
      next.icon.length < 1 ||
      next.icon.length > 2 ||
      /[\u0000-\u001f\u007f]/.test(next.icon) ||
      !/^#[0-9a-f]{6}$/i.test(next.textColor) ||
      !/^#[0-9a-f]{6}$/i.test(next.backgroundColor)
    )
      return false;
    setPrefs({
      ...prefs,
      tabGroups: {
        schemaVersion: 2,
        groups: prefs.tabGroups.groups.map((item) =>
          item.id === groupId
            ? {
                ...item,
                appearance: {
                  icon: next.icon,
                  textColor: next.textColor.toLowerCase(),
                  backgroundColor: next.backgroundColor.toLowerCase(),
                },
              }
            : item,
        ),
      },
    });
    return true;
  };
  const removeTabGroup = (groupId: string) => {
    const group = prefs.tabGroups.groups.find((item) => item.id === groupId);
    if (!group) return;
    setPrefs({
      ...prefs,
      tabGroups: {
        schemaVersion: 2,
        groups: prefs.tabGroups.groups.filter((item) => item.id !== groupId),
      },
    });
    announce(
      dual(
        `Group “${group.name}” removed; its tabs are ungrouped.`,
        `群組「${group.name}」已移除；入面分頁變返未分組。`,
        language,
      ),
      "info",
      "Tab groups",
    );
  };
  const moveTabGroup = (groupId: string, direction: -1 | 1) => {
    const index = prefs.tabGroups.groups.findIndex((group) => group.id === groupId);
    const nextIndex = index + direction;
    if (
      index < 0 ||
      nextIndex < 0 ||
      nextIndex >= prefs.tabGroups.groups.length
    )
      return;
    const groups = [...prefs.tabGroups.groups];
    [groups[index], groups[nextIndex]] = [groups[nextIndex], groups[index]];
    setPrefs({
      ...prefs,
      tabGroups: { schemaVersion: 2, groups },
    });
    announce(
      dual(
        `Group order moved ${direction < 0 ? "up" : "down"}.`,
        `群組次序已向${direction < 0 ? "上" : "下"}移。`,
        language,
      ),
      "success",
      "Tab groups",
    );
  };
  const moveTabIntoGroup = (tabId: TabId, groupId: string | null) => {
    if (
      groupId &&
      !prefs.tabGroups.groups.some((group) => group.id === groupId)
    ) {
      announce(
        dual(
          "That group no longer exists. Nothing changed.",
          "嗰個群組已經唔存在；冇任何變更。",
          language,
        ),
        "warning",
        "Tab groups",
      );
      closeMovePicker();
      return;
    }
    if (groupId && prefs.pinnedTabs.includes(tabId)) {
      announce(
        dual(
          "Pinned tabs stay in the pinned region and cannot join a group.",
          "已釘選分頁會留喺釘選區域，唔可以加入群組。",
          language,
        ),
        "warning",
        "Tab groups",
      );
      closeMovePicker();
      return;
    }
    setPrefs({
      ...prefs,
      tabGroups: {
        schemaVersion: 2,
        groups: prefs.tabGroups.groups.map((group) => ({
          ...group,
          tabs:
            group.id === groupId
              ? [...group.tabs.filter((tab) => tab !== tabId), tabId]
              : group.tabs.filter((tab) => tab !== tabId),
        })),
      },
    });
    announce(
      groupId
        ? dual(
            "Tab moved into the selected group.",
            "分頁已移入所選群組。",
            language,
          )
        : dual(
            "Tab returned to ungrouped tabs.",
            "分頁已變返未分組。",
            language,
          ),
      "success",
      "Tab groups",
    );
    closeMovePicker();
  };
  const openMovePicker = (tabId: TabId, opener: HTMLElement) => {
    movePickerOrigin.current = opener;
    setMovePickerTab(tabId);
    setMoveGroupQuery("");
    setMovePickerTab(tabId);
  };
  const moveTab = (
    tabId: TabId,
    direction: -1 | 1,
    focusTargetId = `tab-${tabId}`,
  ) => {
    const pinned = prefs.pinnedTabs.includes(tabId);
    const region = prefs.tabOrder.filter(
      (id) => prefs.pinnedTabs.includes(id) === pinned,
    );
    const currentIndex = region.indexOf(tabId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= region.length) return;
    const reorderedRegion = [...region];
    [reorderedRegion[currentIndex], reorderedRegion[nextIndex]] = [
      reorderedRegion[nextIndex],
      reorderedRegion[currentIndex],
    ];
    let regionIndex = 0;
    const tabOrder = prefs.tabOrder.map((id) =>
      prefs.pinnedTabs.includes(id) === pinned
        ? reorderedRegion[regionIndex++]
        : id,
    );
    setPrefs({ ...prefs, tabOrder });
    const tab = TABS.find((item) => item.id === tabId)!;
    const directionEn =
      tabOrientation === "vertical"
        ? direction < 0
          ? "up"
          : "down"
        : direction < 0
          ? "left"
          : "right";
    const directionYue =
      tabOrientation === "vertical"
        ? direction < 0
          ? "上"
          : "下"
        : direction < 0
          ? "左"
          : "右";
    announce(
      dual(
        `${tab.en} moved ${directionEn} to position ${nextIndex + 1} of ${region.length}.`,
        `${tab.yue}已向${directionYue}移到第 ${nextIndex + 1} 位，共 ${region.length} 個。`,
        language,
      ),
      "success",
      dual("Tab order updated", "分頁次序已更新", language),
    );
    setTimeout(() => document.getElementById(focusTargetId)?.focus(), 0);
  };
  const appendSettingsHistory = (
    action: SettingsHistoryAction,
    label: string,
    next: Preferences,
  ) => {
    const ownership = next.settingsOwnership;
    const active = ownership.projects.find(
      (project) => project.id === ownership.activeProjectId,
    );
    const effective = { ...ownership.global, ...(active?.overrides ?? {}) };
    const record: SettingsHistoryRecord = {
      id: `settings-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      action,
      timestamp: new Date().toISOString(),
      label:
        label
          .slice(0, 96)
          .replace(/[\u0000-\u001f\u007f]/g, " ")
          .trim() || "Settings changed",
      effective,
      ownership: {
        ...ownership,
        global: { ...ownership.global },
        projects: ownership.projects.map((project) => ({
          ...project,
          overrides: { ...project.overrides },
        })),
      },
      logo: { logoPreset: next.logoPreset, customLogo: null },
    };
    setSettingsHistory((history) => boundSettingsHistory({ schemaVersion: 2, records: [record, ...history.records] }));
  };
  const resetAllSettings = () => {
    const next: Preferences = {
      ...DEFAULTS,
      personalVocabulary: prefs.personalVocabulary,
      logoPreset: prefs.logoPreset,
      customLogo: prefs.customLogo,
      settingsOwnership: {
        schemaVersion: 1,
        global: { ...DEFAULT_SITE_SETTINGS },
        projects: [],
        activeProjectId: null,
      },
    };
    setPrefs(next);
    appendSettingsHistory(
      "global-reset",
      "Reset all site settings to shipped defaults",
      next,
    );
    announce(
      "Site preferences and project ownership reset. Personal vocabulary and app logo were preserved.",
      "success",
      "Settings reset",
    );
  };
  const openResetConfirmation = (origin?: unknown) => {
    const active =
      origin instanceof HTMLElement
        ? origin
        : document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    resetOrigin.current = active;
    resetCommitted.current = false;
    setResetKeySettings(false);
    setResetKeyProjects(false);
    setResetSlider(0);
    setResetComplete(false);
    setResetConfirmOpen(true);
  };
  const openResetFromPalette = () => {
    const origin = paletteOpener.current;
    closePalette(false);
    openResetConfirmation(origin);
  };
  const closeResetConfirmation = () => {
    setResetConfirmOpen(false);
    resetCommitted.current = false;
    setResetKeySettings(false);
    setResetKeyProjects(false);
    setResetSlider(0);
    setResetComplete(false);
    setTimeout(() => resetOrigin.current?.focus(), 0);
  };
  const advanceResetSlider = (value: number) => {
    if (!resetKeySettings || !resetKeyProjects || resetCommitted.current)
      return;
    setResetSlider(value);
    if (value === 100) {
      resetCommitted.current = true;
      resetAllSettings();
      setResetComplete(true);
      setTimeout(
        () =>
          document
            .querySelector<HTMLElement>(".reset-confirmation header button")
            ?.focus(),
        0,
      );
    }
  };
  const update = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
    note: string,
  ) => {
    if (!SITE_SETTING_KEYS.includes(key as SiteSettingKey)) {
      setPrefs({ ...prefs, [key]: value });
      announce(note);
      return;
    }
    const settingKey = key as SiteSettingKey;
    const ownership = {
      ...prefs.settingsOwnership,
      global: { ...prefs.settingsOwnership.global },
      projects: prefs.settingsOwnership.projects.map((project) => ({
        ...project,
        overrides: { ...project.overrides },
      })),
    };
    const active = ownership.projects.find(
      (project) => project.id === ownership.activeProjectId,
    );
    if (active) {
      if (value === ownership.global[settingKey])
        delete active.overrides[settingKey];
      else
        (active.overrides as Record<SiteSettingKey, unknown>)[settingKey] =
          value;
    } else
      (ownership.global as Record<SiteSettingKey, unknown>)[settingKey] = value;
    const effective = { ...ownership.global, ...(active?.overrides ?? {}) };
    const next = { ...prefs, ...effective, settingsOwnership: ownership };
    setPrefs(next);
    appendSettingsHistory(
      active ? "project-setting-changed" : "global-setting-changed",
      note,
      next,
    );
    announce(note);
  };
  const personalText = (original: string) =>
    prefs.personalVocabulary?.replacements[original] ?? original;
  const clearVocabulary = () => {
    setPrefs((p) => ({ ...p, personalVocabulary: null }));
    setVocabStatus("no-file");
    setVocabMessage("");
    announce("Vocabulary cleared locally.");
  };
  const loadVocabularyFile = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 64 * 1024) {
      setVocabStatus("invalid");
      setVocabMessage(
        "Invalid vocabulary file: file must be 64 KiB or smaller. The last valid cache is unchanged.",
      );
      input.value = "";
      return;
    }
    file
      .text()
      .then((source) => {
        const cache = parseVocabularyJson(source);
        setPrefs((p) => ({ ...p, personalVocabulary: cache }));
        setVocabStatus("loaded");
        setVocabMessage("");
        announce(
          cache.replacements["Vocabulary loaded locally."] ??
            "Vocabulary loaded locally.",
          "success",
          "Personal vocabulary",
          "Vocabulary loaded locally.",
        );
      })
      .catch((error) => {
        setVocabStatus("invalid");
        setVocabMessage(
          `Invalid vocabulary file: ${error instanceof Error ? error.message : "validation failed"} The last valid cache is unchanged.`,
        );
      })
      .finally(() => {
        input.value = "";
      });
  };
  const applyLogo = (logo: SettingsLogoState, note: string) => {
    const next = { ...prefs, ...logo };
    setPrefs(next);
    appendSettingsHistory("logo-changed", note, next);
    setLogoStatus(logo.customLogo ? "loaded" : "no-custom");
    setLogoMessage("");
    announce(note, "success", dual("App logo", "應用程式標誌", language));
  };
  const selectLogoPreset = (preset: LogoPreset) =>
    applyLogo(
      { logoPreset: preset, customLogo: null },
      dual(
        "Shipped logo preset applied locally.",
        "已喺本機套用內置標誌預設。",
        language,
      ),
    );
  const clearCustomLogo = () =>
    applyLogo(
      { logoPreset: "forge", customLogo: null },
      dual(
        "Custom logo cleared; the shipped mark is active.",
        "自訂標誌已清除，現時使用原裝標誌。",
        language,
      ),
    );
  const loadLogoFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (file.size === 0 || file.size > 256 * 1024)
        throw new Error("File must be between 1 byte and 256 KiB.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const png =
        bytes.length >= 8 &&
        [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
          (value, index) => bytes[index] === value,
        );
      const jpeg =
        bytes.length >= 3 &&
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff;
      if (!png && !jpeg)
        throw new Error("Only byte-verified PNG or JPEG images are accepted.");
      const actualType = png ? "image/png" : "image/jpeg";
      if (file.type && file.type !== actualType)
        throw new Error("The declared image type does not match its bytes.");
      const blob = new Blob([bytes], { type: actualType });
      const bitmap = await createImageBitmap(blob);
      const width = bitmap.width;
      const height = bitmap.height;
      bitmap.close();
      if (
        width < 16 ||
        height < 16 ||
        width > 2048 ||
        height > 2048 ||
        width * height > 4_000_000
      )
        throw new Error(
          "Dimensions must be 16–2048 pixels per side and at most 4 million pixels.",
        );
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error("The image could not be encoded."));
        reader.onerror = () =>
          reject(new Error("The image could not be read."));
        reader.readAsDataURL(blob);
      });
      applyLogo(
        { logoPreset: "forge", customLogo: dataUrl },
        dual("Custom logo loaded locally.", "自訂標誌已喺本機載入。", language),
      );
      setLogoMessage(`${width}×${height} · ${actualType}`);
    } catch (error) {
      setLogoStatus("invalid");
      setLogoMessage(
        error instanceof Error ? error.message : "Image validation failed.",
      );
    } finally {
      input.value = "";
    }
  };
  const regexResult = useMemo(() => {
    if (!regexMode || !query)
      return { expression: null as RegExp | null, error: "" };
    try {
      return {
        expression: new RegExp(
          query,
          `${flags.i ? "i" : ""}${flags.m ? "m" : ""}`,
        ),
        error: "",
      };
    } catch (error) {
      return {
        expression: null,
        error:
          error instanceof Error ? error.message : "Invalid regular expression",
      };
    }
  }, [flags, query, regexMode]);
  const results = useMemo(() => {
    if (!query) return CATALOG;
    const text = (item: CatalogItem) =>
      `${item.title} ${item.titleYue} ${item.summary} ${item.summaryYue} ${item.category}`;
    if (regexMode)
      return regexResult.expression
        ? CATALOG.filter((item) => regexResult.expression?.test(text(item)))
        : [];
    const needle = query.toLocaleLowerCase();
    return CATALOG.filter((item) =>
      text(item).toLocaleLowerCase().includes(needle),
    );
  }, [query, regexMode, regexResult.expression]);
  const sampleMatches = useMemo(() => {
    if (!regexMode || !query || !regexResult.expression)
      return [] as RegExpMatchArray[];
    try {
      return Array.from(
        sample.matchAll(
          new RegExp(query, `${flags.i ? "i" : ""}${flags.m ? "m" : ""}g`),
        ),
      ).slice(0, 50);
    } catch {
      return [];
    }
  }, [flags, query, regexMode, regexResult.expression, sample]);
  const published =
    manifestState === "ready" &&
    manifest?.status === "published" &&
    typeof manifest.url === "string";
  const iconPath = `${assetBase}/app-icon.svg`;
  const logoSrc = prefs.customLogo ?? iconPath;
  const heroEn = [
    "Explore the Material 3 direction and use only a release link backed by published metadata.",
    "A practical tour of Material 3, with downloads kept on an evidence-only leash.",
    "Meet the interface, tune the site, and let the release manifest do the serious paperwork.",
    "Tour the polished controls; the installer wakes only when a real release brings receipts.",
    "Admire the shiny controls and leave the installer asleep until a real build clocks in.",
  ];
  const heroYue = [
    "探索 Material 3 介面方向，並只使用有已發佈資料支持嘅下載連結。",
    "睇清 Material 3 設計方向，下載連結就交俾真實發佈資料把關。",
    "試吓介面同網站設定，嚴肅文件就交俾發佈清單處理。",
    "介面任睇任試；真發佈帶齊證據返嚟，安裝按鈕先起身返工。",
    "先睇靚仔介面兼調教分頁；真安裝包未返工，下載掣就乖乖瞓覺。",
  ];
  const heroCopy = dual(
    heroEn[Math.max(1, Math.min(5, prefs.funnyEnglish)) - 1],
    heroYue[Math.max(1, Math.min(5, prefs.funnyCantonese)) - 1],
    language,
  );
  const ownership = prefs.settingsOwnership;
  const activeSettingsProject = ownership.projects.find(
    (project) => project.id === ownership.activeProjectId,
  );
  let settingsPattern: RegExp | null = null;
  let settingsPatternError = "";
  if (settingsRegex && settingsQuery)
    try {
      settingsPattern = new RegExp(
        settingsQuery,
        `${settingsFlags.i ? "i" : ""}${settingsFlags.m ? "m" : ""}`,
      );
    } catch (error) {
      settingsPatternError =
        error instanceof Error ? error.message : "Invalid regular expression";
    }
  let settingsMatches: RegExpMatchArray[] = [];
  if (settingsRegex && settingsQuery && settingsPattern)
    try {
      settingsMatches = Array.from(
        settingsSample.matchAll(
          new RegExp(
            settingsQuery,
            `${settingsFlags.i ? "i" : ""}${settingsFlags.m ? "m" : ""}g`,
          ),
        ),
      ).slice(0, 50);
    } catch {
      settingsMatches = [];
    }
  let groupSettingsPattern: RegExp | null = null;
  let groupSettingsPatternError = "";
  if (groupSettingsRegex && groupSettingsQuery)
    try {
      groupSettingsPattern = new RegExp(
        groupSettingsQuery,
        `${groupSettingsFlags.i ? "i" : ""}${groupSettingsFlags.m ? "m" : ""}`,
      );
    } catch (error) {
      groupSettingsPatternError =
        error instanceof Error ? error.message : "Invalid regular expression";
    }
  let groupSettingsMatches: RegExpMatchArray[] = [];
  if (groupSettingsRegex && groupSettingsQuery && groupSettingsPattern)
    try {
      groupSettingsMatches = Array.from(
        groupSettingsSample.matchAll(
          new RegExp(
            groupSettingsQuery,
            `${groupSettingsFlags.i ? "i" : ""}${groupSettingsFlags.m ? "m" : ""}g`,
          ),
        ),
      ).slice(0, 50);
    } catch {
      groupSettingsMatches = [];
    }
  const visibleGroupSettings = prefs.tabGroups.groups.filter((group) => {
    const text = `${group.name} ${group.id} ${group.tabs.length} members`;
    return (
      !groupSettingsQuery ||
      (groupSettingsRegex
        ? !!groupSettingsPattern?.test(text)
        : text.toLocaleLowerCase().includes(groupSettingsQuery.toLocaleLowerCase()))
    );
  });
  const settingsSearchRows = [
    [
      "ownership",
      `Global defaults project overrides active inherited reset ${activeSettingsProject?.name ?? "global"}`,
    ],
    ["language", `Language mode English Cantonese bilingual ${prefs.language}`],
    ["funny-en", `English funny level tone ${prefs.funnyEnglish}`],
    ["funny-yue", `Cantonese funny level tone ${prefs.funnyCantonese}`],
    ["theme", `Theme system light dark ${prefs.theme}`],
    ["dock", `Tab position docking left right top bottom ${prefs.dock}`],
    [
      "groups",
      `Tab groups create rename remove collapse expand move ${prefs.tabGroups.groups.map((group) => group.name).join(" ")}`,
    ],
    [
      "master-tabs",
      `Master tab search all open tabs windows groups pinned ${prefs.tabOrder.join(" ")}`,
    ],
    ["density", `Density comfortable compact ${prefs.density}`],
    ["accent", `Accent color ${prefs.accent}`],
    [
      "emoji",
      `Show emojis dialogs message boxes ${prefs.showEmojis ? "on" : "off"}`,
    ],
    [
      "vocabulary",
      `Personal vocabulary upload replace clear ${prefs.personalVocabulary ? "loaded" : "no file"}`,
    ],
    [
      "logo",
      `App logo preset custom upload replace reset ${prefs.customLogo ? "custom loaded" : prefs.logoPreset}`,
    ],
    [
      "reset",
      "Reset local preferences shipped defaults destructive confirmation",
    ],
  ] as const;
  const settingsVisible = (id: string) => {
    const text = settingsSearchRows.find(([key]) => key === id)?.[1] ?? "";
    return (
      !settingsQuery ||
      (settingsRegex
        ? !!settingsPattern?.test(text)
        : text.toLocaleLowerCase().includes(settingsQuery.toLocaleLowerCase()))
    );
  };
  const visibleSettingsCount = settingsSearchRows.filter(([id]) =>
    settingsVisible(id),
  ).length;
  let projectPattern: RegExp | null = null;
  let projectPatternError = "";
  if (projectRegex && projectQuery)
    try {
      projectPattern = new RegExp(
        projectQuery,
        `${projectFlags.i ? "i" : ""}${projectFlags.m ? "m" : ""}`,
      );
    } catch (error) {
      projectPatternError =
        error instanceof Error ? error.message : "Invalid regular expression";
    }
  let projectMatches: RegExpMatchArray[] = [];
  if (projectRegex && projectQuery && projectPattern)
    try {
      projectMatches = Array.from(
        projectSample.matchAll(
          new RegExp(
            projectQuery,
            `${projectFlags.i ? "i" : ""}${projectFlags.m ? "m" : ""}g`,
          ),
        ),
      ).slice(0, 50);
    } catch {
      projectMatches = [];
    }
  const projectChoices = [
    { id: null, name: dual("Global defaults", "全域預設", language) },
    ...ownership.projects,
  ].filter((project) => {
    const text = `${project.name} ${project.id ?? "global-defaults"}`;
    return (
      !projectQuery ||
      (projectRegex
        ? !!projectPattern?.test(text)
        : text.toLocaleLowerCase().includes(projectQuery.toLocaleLowerCase()))
    );
  });
  const selectSettingsProject = (id: string | null) => {
    const ownership = { ...prefs.settingsOwnership, activeProjectId: id };
    const active = ownership.projects.find((project) => project.id === id);
    const next = {
      ...prefs,
      ...ownership.global,
      ...(active?.overrides ?? {}),
      settingsOwnership: ownership,
    };
    setPrefs(next);
    appendSettingsHistory(
      "project-switched",
      active ? `Switched to ${active.name}` : "Switched to Global defaults",
      next,
    );
  };
  const createSettingsProject = () => {
    const name = projectName.trim();
    if (!name || name.length > 64 || ownership.projects.length >= 50) {
      announce(
        dual(
          "Project name must be 1–64 characters and the limit is 50.",
          "Project 名稱要 1–64 個字元，上限係 50 個。",
          language,
        ),
      );
      return;
    }
    let id = "";
    do {
      id = `project-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    } while (ownership.projects.some((project) => project.id === id));
    if (!/^project-[a-z0-9-]{6,48}$/.test(id)) return;
    const next = {
      ...prefs,
      ...prefs.settingsOwnership.global,
      settingsOwnership: {
        ...prefs.settingsOwnership,
        projects: [
          ...prefs.settingsOwnership.projects,
          { id, name, overrides: {} },
        ],
        activeProjectId: id,
      },
    };
    setPrefs(next);
    appendSettingsHistory("project-created", `Created project ${name}`, next);
    setProjectName("");
    announce(
      dual(
        "Local project created with all eight values inherited.",
        "本機 project 已建立，八個值全部繼承。",
        language,
      ),
    );
  };
  const resetProjectOverrides = () => {
    if (!activeSettingsProject) return;
    const projects = prefs.settingsOwnership.projects.map((project) =>
      project.id === activeSettingsProject.id
        ? { ...project, overrides: {} }
        : project,
    );
    const next = {
      ...prefs,
      ...prefs.settingsOwnership.global,
      settingsOwnership: { ...prefs.settingsOwnership, projects },
    };
    setPrefs(next);
    appendSettingsHistory(
      "project-reset",
      `Reset ${activeSettingsProject.name} to Global defaults`,
      next,
    );
    announce(
      dual(
        "Project reset to Global defaults.",
        "Project 已重設做全域預設。",
        language,
      ),
    );
  };
  const overrideCount = activeSettingsProject
    ? Object.keys(activeSettingsProject.overrides).length
    : 0;
  let notificationPattern: RegExp | null = null;
  let notificationPatternError = "";
  if (notificationRegex && notificationQuery)
    try {
      notificationPattern = new RegExp(
        notificationQuery,
        `${notificationFlags.i ? "i" : ""}${notificationFlags.m ? "m" : ""}`,
      );
    } catch (error) {
      notificationPatternError =
        error instanceof Error ? error.message : "Invalid regular expression";
    }
  let notificationMatches: RegExpMatchArray[] = [];
  if (notificationRegex && notificationQuery && notificationPattern)
    try {
      notificationMatches = Array.from(
        notificationSample.matchAll(
          new RegExp(
            notificationQuery,
            `${notificationFlags.i ? "i" : ""}${notificationFlags.m ? "m" : ""}g`,
          ),
        ),
      ).slice(0, 50);
    } catch {
      notificationMatches = [];
    }
  const filteredNotifications = notificationHistory.records.filter((record) => {
    const text = `${record.kind} ${record.title} ${record.body} ${record.timestamp}`;
    return (
      !notificationQuery ||
      (notificationRegex
        ? !!notificationPattern?.test(text)
        : text
            .toLocaleLowerCase()
            .includes(notificationQuery.toLocaleLowerCase()))
    );
  });
  const filteredNotificationIds = new Set(
    filteredNotifications.map((record) => record.id),
  );
  const selectedFilteredNotifications = selectedNotifications.filter((id) =>
    filteredNotificationIds.has(id),
  );
  const unreadCount = notificationHistory.records.filter(
    (record) =>
      !notificationHistory.readThrough ||
      record.timestamp > notificationHistory.readThrough,
  ).length;
  const openNotifications = () => {
    setNotificationOpen(true);
    setNotificationHistory((history) => ({
      ...history,
      readThrough: history.records[0]?.timestamp ?? history.readThrough,
    }));
  };
  const selectFilteredNotifications = () =>
    setSelectedNotifications(filteredNotifications.map((record) => record.id));
  const invertFilteredNotifications = () =>
    setSelectedNotifications((selected) => {
      const current = new Set(
        selected.filter((id) => filteredNotificationIds.has(id)),
      );
      return filteredNotifications
        .filter((record) => !current.has(record.id))
        .map((record) => record.id);
    });
  const dismissSelectedNotifications = () => {
    const selected = new Set(selectedFilteredNotifications);
    setNotificationHistory((history) => ({
      ...history,
      records: history.records.filter((record) => !selected.has(record.id)),
    }));
    setSelectedNotifications([]);
    setToast("Selected notifications dismissed.");
  };
  const exportNotifications = () => {
    const markdown = filteredNotifications
      .map(
        (record) =>
          `## ${record.title}\n\n- Kind: ${record.kind}\n- Time: ${record.timestamp}\n\n${record.body}`,
      )
      .join("\n\n");
    const url = URL.createObjectURL(
      new Blob([`${markdown}\n`], { type: "text/markdown;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "winforge-notifications.md";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setToast("Filtered notification history exported locally.");
  };
  let settingsHistoryPattern: RegExp | null = null;
  let settingsHistoryPatternError = "";
  if (settingsHistoryRegex && settingsHistoryQuery)
    try {
      settingsHistoryPattern = new RegExp(
        settingsHistoryQuery,
        `${settingsHistoryFlags.i ? "i" : ""}${settingsHistoryFlags.m ? "m" : ""}`,
      );
    } catch (error) {
      settingsHistoryPatternError =
        error instanceof Error ? error.message : "Invalid regular expression";
    }
  let settingsHistoryMatches: RegExpMatchArray[] = [];
  if (settingsHistoryRegex && settingsHistoryQuery && settingsHistoryPattern)
    try {
      settingsHistoryMatches = Array.from(
        settingsHistorySample.matchAll(
          new RegExp(
            settingsHistoryQuery,
            `${settingsHistoryFlags.i ? "i" : ""}${settingsHistoryFlags.m ? "m" : ""}g`,
          ),
        ),
      ).slice(0, 50);
    } catch {
      settingsHistoryMatches = [];
    }
  const settingsHistoryActions = Array.from(
    new Set(settingsHistory.records.map((record) => record.action)),
  );
  const settingsHistoryActionCounts = Object.fromEntries(
    settingsHistoryActions.map((action) => [
      action,
      settingsHistory.records.filter((record) => record.action === action)
        .length,
    ]),
  ) as Record<SettingsHistoryAction, number>;
  const filteredSettingsHistory = settingsHistory.records.filter((record) => {
    const day = record.timestamp.slice(0, 10);
    if (settingsHistoryFrom && day < settingsHistoryFrom) return false;
    if (settingsHistoryTo && day > settingsHistoryTo) return false;
    if (
      settingsHistoryAction !== "all" &&
      record.action !== settingsHistoryAction
    )
      return false;
    const text = `${record.action} ${record.label} ${record.timestamp}`;
    return (
      !settingsHistoryQuery ||
      (settingsHistoryRegex
        ? !!settingsHistoryPattern?.test(text)
        : text
            .toLocaleLowerCase()
            .includes(settingsHistoryQuery.toLocaleLowerCase()))
    );
  });
  const exportSettingsHistory = () => {
    const markdown = filteredSettingsHistory
      .map(
        (record) =>
          `## ${record.label}\n\n- Action: ${record.action}\n- Time: ${record.timestamp}\n- Language: ${record.effective.language}\n- Theme: ${record.effective.theme}\n- Dock: ${record.effective.dock}\n- Density: ${record.effective.density}\n- Accent: ${record.effective.accent}\n- English tone: ${record.effective.funnyEnglish}\n- Cantonese tone: ${record.effective.funnyCantonese}\n- Message emoji: ${record.effective.showEmojis ? "on" : "off"}\n- Logo preset: ${record.logo.logoPreset}\n- Custom logo: omitted from history and export`,
      )
      .join("\n\n");
    const url = URL.createObjectURL(
      new Blob([`${markdown}\n`], { type: "text/markdown;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "winforge-settings-history.md";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setToast("Filtered settings history exported locally.");
  };
  const restoreSettingsRecord = () => {
    const record = settingsHistory.records.find(
      (item) => item.id === settingsRestoreId,
    );
    if (!record) {
      setSettingsRestoreId(null);
      return;
    }
    const next = {
      ...prefs,
      ...record.effective,
      logoPreset: record.logo.logoPreset,
      settingsOwnership: record.ownership,
    };
    setPrefs(next);
    appendSettingsHistory("restored", `Restored ${record.label}`, next);
    setLogoStatus(prefs.customLogo ? "loaded" : "no-custom");
    setLogoMessage("");
    setSettingsRestoreId(null);
    setToast("Settings history record restored.");
  };
  const baseOrderedTabs = prefs.tabOrder.map(
    (id) => TABS.find((tab) => tab.id === id)!,
  );
  const pinnedTabs = baseOrderedTabs.filter((tab) =>
    prefs.pinnedTabs.includes(tab.id),
  );
  const ordinaryTabs = baseOrderedTabs.filter(
    (tab) => !prefs.pinnedTabs.includes(tab.id),
  );
  const groupedTabIds = new Set(
    prefs.tabGroups.groups.flatMap((group) => group.tabs),
  );
  const ungroupedTabs = ordinaryTabs.filter(
    (tab) => !groupedTabIds.has(tab.id),
  );
  const renderedGroups = prefs.tabGroups.groups.map((group) => ({
    ...group,
    members: ordinaryTabs.filter((tab) => group.tabs.includes(tab.id)),
  }));
  const groupLimitReached = prefs.tabGroups.groups.length >= 8;
  const groupNameReady = validGroupName(newGroupName) !== null;
  const createGroupHint = groupLimitReached
    ? dual(
        "Eight groups already exist. Remove one before creating another.",
        "已經有八個群組；要先移除一個先可以再建立。",
        language,
      )
    : groupNameReady
      ? dual(
          "Ready to create this local group.",
          "可以建立呢個本機群組。",
          language,
        )
      : dual(
          "Enter a trimmed name from 1 to 48 characters without control characters or leading/trailing whitespace.",
          "輸入 1 至 48 個字元、前後冇空白嘅名稱，亦唔可以有控制字元。",
          language,
        );
  const orderedTabs = [...pinnedTabs, ...ordinaryTabs];
  let masterTabPattern: RegExp | null = null;
  let masterTabPatternError = "";
  if (masterTabRegex && masterTabQuery)
    try {
      masterTabPattern = new RegExp(
        masterTabQuery,
        `${masterTabFlags.i ? "i" : ""}${masterTabFlags.m ? "m" : ""}`,
      );
    } catch (error) {
      masterTabPatternError =
        error instanceof Error ? error.message : "Invalid regular expression";
    }
  const masterTabResults = orderedTabs.filter((tab) => {
    const groupName =
      prefs.tabGroups.groups.find((group) => group.tabs.includes(tab.id))?.name ??
      "Ungrouped";
    const text = `${tab.en} ${tab.yue} ${groupName} ${prefs.pinnedTabs.includes(tab.id) ? "Pinned" : "Ordinary"}`;
    return (
      !masterTabQuery ||
      (masterTabRegex
        ? !!masterTabPattern?.test(text)
        : text.toLocaleLowerCase().includes(masterTabQuery.toLocaleLowerCase()))
    );
  });
  const masterTabMatches =
    masterTabRegex && masterTabQuery && !masterTabPatternError
      ? Array.from(
          masterTabSample.matchAll(
            new RegExp(
              masterTabQuery,
              `${masterTabFlags.i ? "i" : ""}${masterTabFlags.m ? "m" : ""}g`,
            ),
          ),
        ).slice(0, 50)
      : [];
  type PaletteCommand = {
    id: string;
    label: string;
    detail: string;
    action: () => void;
    control?: ReactNode;
  };
  const openSetting = (target: string) => {
    setSettingsQuery("");
    selectTab("settings", target);
  };
  const commands: PaletteCommand[] = [
    ...orderedTabs.map((tab) => ({
      id: tab.id,
      label: dual(tab.en, tab.yue, language),
      detail: dual("Open site destination", "開啟網站目的地", language),
      action: () => selectTab(tab.id, `panel-${tab.id}`),
    })),
    {
      id: "search",
      label: dual("Focus site search", "跳去網站搜尋", language),
      detail: dual("Search features and articles", "搜尋功能同文章", language),
      action: () => selectTab("features", "site-search"),
    },
    {
      id: "vocabulary-upload",
      label: dual("Upload personal vocabulary", "上載個人詞彙", language),
      detail: dual(
        "Choose or replace the local JSON file",
        "揀選或取代本機 JSON 檔案",
        language,
      ),
      action: () => {
        setSettingsQuery("");
        selectTab("settings", "site-vocabulary-file");
        setTimeout(
          () => document.getElementById("site-vocabulary-file")?.click(),
          60,
        );
      },
    },
    {
      id: "vocabulary-status",
      label: dual("Personal vocabulary status", "個人詞彙狀態", language),
      detail: dual(
        "Open the loaded, invalid, or no-file state",
        "開啟已載入、無效或未有檔案狀態",
        language,
      ),
      action: () => {
        setSettingsQuery("");
        selectTab("settings", "site-vocabulary-status");
      },
    },
    {
      id: "vocabulary-clear",
      label: dual("Clear personal vocabulary", "清除個人詞彙", language),
      detail: dual(
        "Purge the local cache and restore shipped wording",
        "清除本機快取並回復原裝文字",
        language,
      ),
      action: () => {
        setSettingsQuery("");
        selectTab("settings", "site-vocabulary-status");
        clearVocabulary();
      },
    },
  ];
  commands.push({
    id: "setting-language",
    label: dual("Language mode", "語言模式", language),
    detail: dual(
      "Change here or open the owning Settings card",
      "喺呢度更改，或者開啟所屬設定卡",
      language,
    ),
    action: () => openSetting("setting-language"),
    control: (
      <select
        value={prefs.language}
        onChange={(event) =>
          update(
            "language",
            event.target.value as LanguageMode,
            dual("Language mode updated.", "語言模式已更新。", language),
          )
        }
        aria-label={dual(
          "Command palette language mode",
          "指令選單語言模式",
          language,
        )}
      >
        <option value="en">English</option>
        <option value="yue">廣東話</option>
        <option value="both">English · 廣東話</option>
      </select>
    ),
  });
  commands.push({
    id: "setting-funny-en",
    label: dual("English funny level", "英文玩味程度", language),
    detail: `${prefs.funnyEnglish} / 5`,
    action: () => openSetting("setting-funny-en"),
    control: (
      <label className="palette-range">
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={prefs.funnyEnglish}
          onChange={(event) =>
            update(
              "funnyEnglish",
              Number(event.target.value),
              `English funny level set to ${event.target.value}.`,
            )
          }
          aria-label={dual(
            "Command palette English funny level",
            "指令選單英文玩味程度",
            language,
          )}
        />
        <output>{prefs.funnyEnglish}</output>
      </label>
    ),
  });
  commands.push({
    id: "setting-funny-yue",
    label: dual("Cantonese funny level", "廣東話玩味程度", language),
    detail: `${prefs.funnyCantonese} / 5`,
    action: () => openSetting("setting-funny-yue"),
    control: (
      <label className="palette-range">
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={prefs.funnyCantonese}
          onChange={(event) =>
            update(
              "funnyCantonese",
              Number(event.target.value),
              `Cantonese funny level set to ${event.target.value}.`,
            )
          }
          aria-label={dual(
            "Command palette Cantonese funny level",
            "指令選單廣東話玩味程度",
            language,
          )}
        />
        <output>{prefs.funnyCantonese}</output>
      </label>
    ),
  });
  commands.push({
    id: "setting-theme",
    label: dual("Theme", "主題", language),
    detail: dual("System, light, or dark", "跟系統、光亮或者深色", language),
    action: () => openSetting("setting-theme"),
    control: (
      <select
        value={prefs.theme}
        onChange={(event) =>
          update(
            "theme",
            event.target.value as Preferences["theme"],
            dual("Theme updated.", "主題已更新。", language),
          )
        }
        aria-label={dual("Command palette theme", "指令選單主題", language)}
      >
        <option value="system">{dual("System", "跟系統", language)}</option>
        <option value="light">{dual("Light", "光亮", language)}</option>
        <option value="dark">{dual("Dark", "深色", language)}</option>
      </select>
    ),
  });
  commands.push({
    id: "setting-dock",
    label: dual("Tab position", "分頁位置", language),
    detail: dual("Dock to any edge", "停靠任何一邊", language),
    action: () => openSetting("tab-docking-setting"),
    control: (
      <select
        value={prefs.dock}
        onChange={(event) =>
          update(
            "dock",
            event.target.value as Preferences["dock"],
            dual("Tab position updated.", "分頁位置已更新。", language),
          )
        }
        aria-label={dual(
          "Command palette tab position",
          "指令選單分頁位置",
          language,
        )}
      >
        <option value="left">{dual("Left", "左邊", language)}</option>
        <option value="right">{dual("Right", "右邊", language)}</option>
        <option value="top">{dual("Top", "頂部", language)}</option>
        <option value="bottom">{dual("Bottom", "底部", language)}</option>
      </select>
    ),
  });
  commands.push({
    id: "setting-density",
    label: dual("Density", "密度", language),
    detail: dual("Comfortable or compact", "舒適或者緊密", language),
    action: () => openSetting("setting-density"),
    control: (
      <select
        value={prefs.density}
        onChange={(event) =>
          update(
            "density",
            event.target.value as Preferences["density"],
            dual("Density updated.", "密度已更新。", language),
          )
        }
        aria-label={dual("Command palette density", "指令選單密度", language)}
      >
        <option value="comfortable">
          {dual("Comfortable", "舒適", language)}
        </option>
        <option value="compact">{dual("Compact", "緊密", language)}</option>
      </select>
    ),
  });
  commands.push({
    id: "setting-accent",
    label: dual("Accent color", "重點色", language),
    detail: prefs.accent,
    action: () => openSetting("setting-accent"),
    control: (
      <label className="palette-color">
        <input
          type="color"
          value={prefs.accent}
          onChange={(event) =>
            update(
              "accent",
              event.target.value,
              dual("Accent color updated.", "重點色已更新。", language),
            )
          }
          aria-label={dual(
            "Command palette accent color",
            "指令選單重點色",
            language,
          )}
        />
        <code>{prefs.accent}</code>
      </label>
    ),
  });
  commands.push({
    id: "emoji-preference",
    label: dual(
      "Show emojis in dialogs and message boxes",
      "喺對話框同訊息框顯示 emoji",
      language,
    ),
    detail: dual(
      "Persisted decorative preference",
      "已保存嘅裝飾偏好",
      language,
    ),
    action: () => openSetting("emoji-preference"),
    control: (
      <label className="palette-switch">
        <input
          type="checkbox"
          checked={prefs.showEmojis}
          onChange={(event) =>
            update(
              "showEmojis",
              event.target.checked,
              dual(
                "Emoji decoration preference updated.",
                "Emoji 裝飾偏好已更新。",
                language,
              ),
            )
          }
          aria-label={dual(
            "Command palette show emojis in dialogs and message boxes",
            "指令選單喺對話框同訊息框顯示 emoji",
            language,
          )}
        />
        <span aria-hidden="true" />
      </label>
    ),
  });
  commands.push({
    id: "app-logo",
    label: dual("App logo preset", "應用程式標誌預設", language),
    detail: dual("Forge, tile, or mono", "Forge、Tile 或 Mono", language),
    action: () => openSetting("site-logo-settings"),
    control: (
      <select
        value={prefs.customLogo ? "custom" : prefs.logoPreset}
        onChange={(event) => {
          if (event.target.value !== "custom")
            selectLogoPreset(event.target.value as LogoPreset);
        }}
        aria-label={dual(
          "Command palette app logo preset",
          "指令選單應用程式標誌預設",
          language,
        )}
      >
        <option value="forge">Forge</option>
        <option value="tile">Tile</option>
        <option value="mono">Mono</option>
        {prefs.customLogo && (
          <option value="custom" disabled>
            {dual("Custom image", "自訂圖片", language)}
          </option>
        )}
      </select>
    ),
  });
  commands.push({
    id: "reset",
    label: dual("Reset site preferences", "重設網站偏好", language),
    detail: dual(
      "Review the shared destructive confirmation",
      "檢視共用破壞性確認",
      language,
    ),
    action: () => openSetting("setting-reset"),
    control: (
      <button
        type="button"
        className="palette-reset"
        onClick={openResetFromPalette}
      >
        {dual("Reset settings", "重設設定", language)}
      </button>
    ),
  });
  commands.push({
    id: "notifications",
    label: dual("Notification center", "通知中心", language),
    detail: dual(
      "Open persistent local notification history",
      "開啟持久本機通知記錄",
      language,
    ),
    action: openNotifications,
  });
  commands.push({
    id: "settings-history",
    label: dual("Settings history", "設定記錄", language),
    detail: dual(
      "Browse and restore local settings revisions",
      "瀏覽同還原本機設定版本",
      language,
    ),
    action: () => setSettingsHistoryOpen(true),
  });
  commands.push({
    id: "app-logo-upload",
    label: dual("Upload custom app logo", "上載自訂應用程式標誌", language),
    detail: dual(
      "Choose or replace a bounded local PNG or JPEG",
      "揀選或取代有限度本機 PNG 或 JPEG",
      language,
    ),
    action: () => {
      setSettingsQuery("");
      selectTab("settings", "site-logo-file");
      setTimeout(() => document.getElementById("site-logo-file")?.click(), 60);
    },
  });
  commands.push({
    id: "app-logo-reset",
    label: dual("Reset app logo", "重設應用程式標誌", language),
    detail: dual(
      "Restore the shipped Forge mark",
      "回復原裝 Forge 標誌",
      language,
    ),
    action: clearCustomLogo,
  });
  commands.push({
    id: "tab-pin-current",
    label: dual(
      prefs.pinnedTabs.includes(activeTab)
        ? "Unpin current tab"
        : "Pin current tab",
      prefs.pinnedTabs.includes(activeTab)
        ? "取消釘選目前分頁"
        : "釘選目前分頁",
      language,
    ),
    detail: dual(
      "Pinned tabs stay in the stable region and are protected from future bulk close",
      "釘選分頁會留喺固定區域，亦會受保護免受日後批量關閉",
      language,
    ),
    action: () => togglePinnedTab(activeTab),
  });
  commands.push({
    id: "settings-search",
    label: dual("Search site settings", "搜尋網站設定", language),
    detail: dual(
      "Focus the top-level Settings search and regex builder",
      "聚焦頂層設定搜尋同正規表示式工具",
      language,
    ),
    action: () => selectTab("settings", "settings-search"),
  });
  commands.push({
    id: "tab-groups",
    label: dual("Manage tab groups", "管理分頁群組", language),
    detail: dual(
      "Create, rename, color, collapse, expand, and remove local groups",
      "建立、改名、改色、收合、展開同移除本機群組",
      language,
    ),
    action: () => openSetting("tab-group-settings"),
  });
  commands.push({
    id: "tab-move-group",
    label: dual("Move current tab into group", "移動目前分頁去群組", language),
    detail: dual(
      "Open the searchable anchored group picker",
      "開啟可搜尋貼邊群組選擇器",
      language,
    ),
    action: () => {
      const opener = document
        .querySelector<HTMLElement>(`#tab-${activeTab}`)
        ?.closest(".tab-entry")
        ?.querySelector<HTMLElement>(".tab-move-toggle");
      if (opener) openMovePicker(activeTab, opener);
    },
  });
  prefs.tabGroups.groups.forEach((group) => {
    commands.push({
      id: `tab-group-appearance-${group.id}`,
      label: dual(
        `Edit ${group.name} group appearance`,
        `編輯${group.name}群組外觀`,
        language,
      ),
      detail: dual(
        "Open the bounded icon and color editor in Settings",
        "喺設定開啟有限圖示同顏色編輯器",
        language,
      ),
      action: () => {
        setGroupAppearanceSettingsId(group.id);
        openSetting("tab-group-settings");
      },
    });
  });
  commands.push({
    id: "master-tab-search",
    label: dual("Search all open tabs", "搜尋所有開啟中分頁", language),
    detail: dual(
      "Find tabs across this site surface with group and pinned context",
      "喺呢個網站介面按群組同釘選狀態搜尋分頁",
      language,
    ),
    action: () => openSetting("master-tab-search"),
  });
  let palettePattern: RegExp | null = null;
  let palettePatternError = "";
  if (paletteRegex && paletteQuery)
    try {
      palettePattern = new RegExp(
        paletteQuery,
        `${paletteFlags.i ? "i" : ""}${paletteFlags.m ? "m" : ""}`,
      );
    } catch (error) {
      palettePatternError =
        error instanceof Error ? error.message : "Invalid regular expression";
    }
  let paletteMatches: RegExpMatchArray[] = [];
  if (paletteRegex && paletteQuery && palettePattern)
    try {
      paletteMatches = Array.from(
        paletteSample.matchAll(
          new RegExp(
            paletteQuery,
            `${paletteFlags.i ? "i" : ""}${paletteFlags.m ? "m" : ""}g`,
          ),
        ),
      ).slice(0, 50);
    } catch {
      paletteMatches = [];
    }
  const filteredCommands = commands.filter((command) => {
    const text = `${command.label} ${command.detail}`;
    return (
      !paletteQuery ||
      (paletteRegex
        ? !!palettePattern?.test(text)
        : text.toLocaleLowerCase().includes(paletteQuery.toLocaleLowerCase()))
    );
  });
  let changelogPattern: RegExp | null = null;
  let changelogPatternError = "";
  if (changelogRegex && changelogQuery)
    try {
      changelogPattern = new RegExp(changelogQuery, "i");
    } catch (error) {
      changelogPatternError =
        error instanceof Error ? error.message : "Invalid regular expression";
    }
  const filteredChangelog = CHANGELOG_ENTRIES.filter((entry) => {
    if (changelogFrom && entry.date < changelogFrom) return false;
    if (changelogTo && entry.date > changelogTo) return false;
    const text = `${entry.version} ${entry.category} ${entry.summary} ${entry.sha}`;
    return (
      !changelogQuery ||
      (changelogRegex
        ? !!changelogPattern?.test(text)
        : text.toLocaleLowerCase().includes(changelogQuery.toLocaleLowerCase()))
    );
  });
  const changelogMarkdown = () =>
    filteredChangelog
      .map(
        (entry) =>
          `## ${entry.version} — ${entry.date}\n\n**${entry.category}**\n\n${entry.summary}\n\nCommit: https://github.com/Ding-Ding-Projects/material-winforge/commit/${entry.sha}`,
      )
      .join("\n\n");
  const copyChangelog = () =>
    navigator.clipboard
      .writeText(changelogMarkdown())
      .then(() => announce("Filtered changelog copied locally."))
      .catch(() => announce("Clipboard copy failed."));
  const exportChangelog = () => {
    const url = URL.createObjectURL(
      new Blob([`${changelogMarkdown()}\n`], {
        type: "text/markdown;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "winforge-changelog.md";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    announce("Filtered changelog exported locally.");
  };
  const tabOrientation =
    !narrowTabs && ["left", "right"].includes(prefs.dock)
      ? "vertical"
      : "horizontal";
  let tabOverflowPattern: RegExp | null = null;
  let tabOverflowPatternError = "";
  if (tabOverflowRegex && tabOverflowQuery)
    try {
      tabOverflowPattern = new RegExp(
        tabOverflowQuery,
        `${tabOverflowFlags.i ? "i" : ""}${tabOverflowFlags.m ? "m" : ""}`,
      );
    } catch (error) {
      tabOverflowPatternError =
        error instanceof Error ? error.message : "Invalid regular expression";
    }
  const filteredOverflowTabs = orderedTabs.filter((tab) => {
    const text = `${tab.en} ${tab.yue}`;
    return (
      !tabOverflowQuery ||
      (tabOverflowRegex
        ? !!tabOverflowPattern?.test(text)
        : text
            .toLocaleLowerCase()
            .includes(tabOverflowQuery.toLocaleLowerCase()))
    );
  });
  const tabOverflowMatches =
    tabOverflowRegex && !tabOverflowPatternError && tabOverflowQuery
      ? Array.from(
          tabOverflowSample.matchAll(
            new RegExp(
              tabOverflowQuery,
              `${tabOverflowFlags.i ? "i" : ""}${tabOverflowFlags.m ? "m" : ""}g`,
            ),
          ),
        ).slice(0, 50)
      : [];
  let moveGroupPattern: RegExp | null = null;
  let moveGroupPatternError = "";
  if (moveGroupRegex && moveGroupQuery)
    try {
      moveGroupPattern = new RegExp(
        moveGroupQuery,
        `${moveGroupFlags.i ? "i" : ""}${moveGroupFlags.m ? "m" : ""}`,
      );
    } catch (error) {
      moveGroupPatternError =
        error instanceof Error ? error.message : "Invalid regular expression";
    }
  const filteredMoveGroups = prefs.tabGroups.groups.filter(
    (group) =>
      !moveGroupQuery ||
      (moveGroupRegex
        ? !!moveGroupPattern?.test(group.name)
        : group.name
            .toLocaleLowerCase()
            .includes(moveGroupQuery.toLocaleLowerCase())),
  );
  const moveGroupMatches =
    moveGroupRegex && !moveGroupPatternError && moveGroupQuery
      ? Array.from(
          moveGroupSample.matchAll(
            new RegExp(
              moveGroupQuery,
              `${moveGroupFlags.i ? "i" : ""}${moveGroupFlags.m ? "m" : ""}g`,
            ),
          ),
        ).slice(0, 50)
      : [];
  let bulkClosePattern: RegExp | null = null;
  let bulkClosePatternError = "";
  if (bulkCloseRegex && bulkCloseQuery)
    try {
      bulkClosePattern = new RegExp(
        bulkCloseQuery,
        `${bulkCloseFlags.i ? "i" : ""}${bulkCloseFlags.m ? "m" : ""}`,
      );
    } catch (error) {
      bulkClosePatternError =
        error instanceof Error ? error.message : "Invalid regular expression";
    }
  const bulkCloseMatches =
    bulkCloseRegex && bulkCloseQuery && !bulkClosePatternError
      ? Array.from(
          bulkCloseSample.matchAll(
            new RegExp(
              bulkCloseQuery,
              `${bulkCloseFlags.i ? "i" : ""}${bulkCloseFlags.m ? "m" : ""}g`,
            ),
          ),
        ).slice(0, 50)
      : [];
  const bulkCloseCandidates = orderedTabs.filter(
    (tab) =>
      tab.id !== activeTab &&
      (bulkCloseIncludePinned || !prefs.pinnedTabs.includes(tab.id)),
  );
  const getBulkCloseAffected = (mode: BulkCloseMode) => {
    if (!bulkCloseQuery || bulkClosePatternError) return [] as TabId[];
    return bulkCloseCandidates
      .filter((tab) => {
        const text = `${tab.en} ${tab.yue}`;
        const matches = bulkCloseRegex
          ? !!bulkClosePattern?.test(text)
          : text
              .toLocaleLowerCase()
              .includes(bulkCloseQuery.toLocaleLowerCase());
        return mode === "contains" ? matches : !matches;
      })
      .map((tab) => tab.id);
  };
  const bulkCloseAffected = bulkCloseMode
    ? getBulkCloseAffected(bulkCloseMode)
    : [];
  const openBulkCloseConfirmation = (
    mode: BulkCloseMode,
    origin?: HTMLElement,
  ) => {
    if (!bulkCloseQuery || bulkClosePatternError) {
      announce(
        dual(
          "Enter a non-empty search before previewing bulk close.",
          "預覽批量關閉之前，要先輸入搜尋字。",
          language,
        ),
        "warning",
        "Bulk close",
      );
      return;
    }
    const affected = getBulkCloseAffected(mode);
    if (!affected.length) {
      announce(
        dual(
          "No eligible tabs match this action; nothing will close.",
          "冇符合又合資格嘅分頁；唔會關閉任何嘢。",
          language,
        ),
        "info",
        "Bulk close",
      );
      return;
    }
    bulkCloseOrigin.current = origin ?? (document.activeElement as HTMLElement);
    bulkCloseCommitted.current = false;
    setBulkCloseMode(mode);
    setBulkCloseKeyTabs(false);
    setBulkCloseKeyPinned(false);
    setBulkCloseSlider(0);
    setBulkCloseComplete(false);
    setBulkCloseCompletedCount(0);
    setBulkCloseConfirmOpen(true);
  };
  const closeBulkCloseConfirmation = () => {
    setBulkCloseConfirmOpen(false);
    bulkCloseCommitted.current = false;
    setBulkCloseKeyTabs(false);
    setBulkCloseKeyPinned(false);
    setBulkCloseSlider(0);
    setBulkCloseComplete(false);
    setBulkCloseCompletedCount(0);
    setTimeout(() => bulkCloseOrigin.current?.focus(), 0);
  };
  const commitBulkClose = () => {
    if (bulkCloseCommitted.current || !bulkCloseMode) return;
    const targetIds = getBulkCloseAffected(bulkCloseMode);
    if (!targetIds.length) {
      closeBulkCloseConfirmation();
      return;
    }
    const targetSet = new Set(targetIds);
    setPrefs((current) => ({
      ...current,
      tabOrder: current.tabOrder.filter((id) => !targetSet.has(id)),
      pinnedTabs: current.pinnedTabs.filter((id) => !targetSet.has(id)),
      tabGroups: {
        schemaVersion: 2,
        groups: current.tabGroups.groups.map((group) => ({
          ...group,
          tabs: group.tabs.filter((id) => !targetSet.has(id)),
        })),
      },
    }));
    bulkCloseCommitted.current = true;
    setBulkCloseCompletedCount(targetIds.length);
    setBulkCloseSlider(100);
    setBulkCloseComplete(true);
    announce(
      dual(
        `${targetIds.length} tabs closed; the current tab stayed open.`,
        `已關閉 ${targetIds.length} 個分頁；目前分頁保留。`,
        language,
      ),
      "success",
      "Bulk close",
    );
  };
  const advanceBulkCloseSlider = (value: number) => {
    if (!bulkCloseKeyTabs || !bulkCloseKeyPinned || bulkCloseCommitted.current)
      return;
    setBulkCloseSlider(value);
    if (value === 100) commitBulkClose();
  };
  useEffect(() => {
    if (!bulkCloseConfirmOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeBulkCloseConfirmation();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [bulkCloseConfirmOpen, closeBulkCloseConfirmation]);
  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.getAttribute("role") !== "tab") return;
    const focusedId = target.id.startsWith("tab-")
      ? (target.id.slice(4) as TabId)
      : activeTab;
    const backward = tabOrientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const forward = tabOrientation === "vertical" ? "ArrowDown" : "ArrowRight";
    if (![backward, forward, "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const current = orderedTabs.findIndex((tab) => tab.id === focusedId);
    const origin =
      current >= 0
        ? current
        : orderedTabs.findIndex((tab) => tab.id === activeTab);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? orderedTabs.length - 1
          : event.key === backward
            ? (origin - 1 + orderedTabs.length) % orderedTabs.length
            : (origin + 1) % orderedTabs.length;
    const next = orderedTabs[nextIndex];
    selectTab(next.id);
    setTimeout(() => document.getElementById(`tab-${next.id}`)?.focus(), 0);
  };
  const renderStripTab = (tab: (typeof TABS)[number], pinned: boolean) => {
    const region = pinned ? pinnedTabs : ordinaryTabs;
    const index = region.findIndex((item) => item.id === tab.id);
    const backwardLabel = tabOrientation === "vertical" ? "up" : "left";
    const forwardLabel = tabOrientation === "vertical" ? "down" : "right";
    return (
      <div
        className={`tab-entry ${pinned ? "pinned" : "ordinary"}`}
        key={tab.id}
        data-bulk-close-protected={pinned ? "true" : "false"}
      >
        <button
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-label={dual(tab.en, tab.yue, language)}
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          className={activeTab === tab.id ? "active" : ""}
          onClick={() => selectTab(tab.id)}
        >
          <span className="tab-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="tab-label">{dual(tab.en, tab.yue, language)}</span>
          {pinned && (
            <span className="tab-state-label">
              {dual("Pinned", "已釘選", language)}
            </span>
          )}
        </button>
        <span
          className="tab-reorder-controls"
          role="group"
          aria-label={dual(`Reorder ${tab.en}`, `重新排列${tab.yue}`, language)}
        >
          <button
            type="button"
            disabled={index === 0}
            onClick={() => moveTab(tab.id, -1)}
            aria-label={dual(
              `Move ${tab.en} ${backwardLabel}`,
              `${tab.yue}向${backwardLabel === "up" ? "上" : "左"}移`,
              language,
            )}
            title={dual(
              `Move ${backwardLabel}`,
              `向${backwardLabel === "up" ? "上" : "左"}移`,
              language,
            )}
          >
            {tabOrientation === "vertical" ? "↑" : "‹"}
          </button>
          <button
            type="button"
            disabled={index === region.length - 1}
            onClick={() => moveTab(tab.id, 1)}
            aria-label={dual(
              `Move ${tab.en} ${forwardLabel}`,
              `${tab.yue}向${forwardLabel === "down" ? "下" : "右"}移`,
              language,
            )}
            title={dual(
              `Move ${forwardLabel}`,
              `向${forwardLabel === "down" ? "下" : "右"}移`,
              language,
            )}
          >
            {tabOrientation === "vertical" ? "↓" : "›"}
          </button>
        </span>
        <button
          className="tab-move-toggle"
          type="button"
          onClick={(event) => openMovePicker(tab.id, event.currentTarget)}
          aria-haspopup="dialog"
          aria-expanded={movePickerTab === tab.id}
          aria-controls="move-group-picker"
          aria-controls="move-group-picker"
          aria-label={dual(
            `Move ${tab.en} into group`,
            `移動${tab.yue}去群組`,
            language,
          )}
        >
          …
        </button>
        <button
          className="tab-pin-toggle"
          type="button"
          onClick={() => togglePinnedTab(tab.id)}
          aria-label={dual(
            `${pinned ? "Unpin" : "Pin"} ${tab.en}`,
            `${pinned ? "取消釘選" : "釘選"}${tab.yue}`,
            language,
          )}
          title={dual(
            pinned ? "Unpin tab" : "Pin tab",
            pinned ? "取消釘選分頁" : "釘選分頁",
            language,
          )}
        >
          <span aria-hidden="true">{pinned ? "−" : "+"}</span>
        </button>
      </div>
    );
  };

  return (
    <main
      className={`site-shell dock-${prefs.dock} density-${prefs.density} emoji-${prefs.showEmojis ? "on" : "off"}`}
      style={{ "--accent": prefs.accent } as CSSProperties}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {!persistenceAvailable && <div className="persistence-warning" role="status">{dual("Local persistence is unavailable. The site remains usable, but changes may not survive reload.", "本機保存暫時用唔到；網站仍然可用，但重新載入後變更可能唔會保留。", language)}</div>}
      <header className="top-app-bar">
        <button
          className="brand"
          type="button"
          onClick={() => selectTab("home")}
          aria-label="WinForge home"
        >
          <img
            src={logoSrc}
            className={`app-logo preset-${prefs.logoPreset}`}
            width="42"
            height="42"
            alt=""
          />
          <span>
            <strong>WinForge</strong>
            <small>Material 3 Preview</small>
          </span>
        </button>
        <div className="top-actions">
          <button
            className="shortcut-button"
            type="button"
            onClick={(event) => openPalette(event.currentTarget)}
            aria-keyshortcuts="Control+Shift+F"
          >
            <span aria-hidden="true">⌘</span>
            <span>{dual("Commands", "指令", language)}</span>
            <kbd>Ctrl+Shift+F</kbd>
          </button>
          <span className={`release-chip ${published ? "ready" : "waiting"}`}>
            <span aria-hidden="true">{published ? "●" : "○"}</span>
            {published
              ? dual(
                  `Release ${manifest?.version}`,
                  `發佈 ${manifest?.version}`,
                  language,
                )
              : dual("Installer unavailable", "安裝程式未有", language)}
          </span>
        </div>
      </header>
      <nav
        className="tab-strip"
        aria-label={dual("Primary navigation", "主要導覽", language)}
      >
        <div
          className="tab-collection"
          aria-label={dual("Site destinations", "網站目的地", language)}
        >
          {pinnedTabs.length > 0 && (
            <div
              className="pinned-tab-items"
              role="tablist"
              aria-orientation={tabOrientation}
              onKeyDown={handleTabKeyDown}
              aria-label={dual("Pinned tabs", "已釘選分頁", language)}
            >
              {pinnedTabs.map((tab) => renderStripTab(tab, true))}
            </div>
          )}
          <div ref={tabItemsRef} className="tab-items">
            <div className="ungrouped-tab-items" role="tablist" aria-orientation={tabOrientation} aria-label={dual("Ungrouped tabs", "未分組分頁", language)} onKeyDown={handleTabKeyDown}>{ungroupedTabs.map((tab) => renderStripTab(tab, false))}</div>
            {renderedGroups.map((group) => {
              const search =
                groupSearches[group.id] ?? defaultGroupSearch(group);
              let groupPattern: RegExp | null = null;
              let groupPatternError = "";
              if (search.regex && search.query)
                try {
                  groupPattern = new RegExp(
                    search.query,
                    `${search.flags.i ? "i" : ""}${search.flags.m ? "m" : ""}`,
                  );
                } catch (error) {
                  groupPatternError =
                    error instanceof Error
                      ? error.message
                      : "Invalid regular expression";
                }
              const visibleGroupMembers = group.members.filter((tab) => {
                const text = `${tab.en} ${tab.yue}`;
                return (
                  !search.query ||
                  (search.regex
                    ? !!groupPattern?.test(text)
                    : text
                        .toLocaleLowerCase()
                        .includes(search.query.toLocaleLowerCase()))
                );
              });
              const groupMatches =
                search.regex && !groupPatternError && search.query
                  ? Array.from(
                      search.sample.matchAll(
                        new RegExp(
                          search.query,
                          `${search.flags.i ? "i" : ""}${search.flags.m ? "m" : ""}g`,
                        ),
                      ),
                    ).slice(0, 50)
                  : [];
              return (
              <section
                className="tab-group"
                role="group"
                key={group.id}
                style={{
                  "--group-color": group.color,
                  "--group-text-color": group.appearance.textColor,
                  "--group-background": group.appearance.backgroundColor,
                } as CSSProperties}
                aria-label={dual(
                  `${group.name} tab group`,
                  `${group.name} 分頁群組`,
                  language,
                )}
              >
                <div className="tab-group-header">
                  <span className="tab-group-icon" aria-hidden="true">
                    {group.appearance.icon}
                  </span>
                  <span className="tab-group-color" aria-hidden="true" />
                  <input
                    defaultValue={group.name}
                    maxLength={48}
                    onBlur={(event) => {
                      if (
                        !updateTabGroup(group.id, {
                          name: event.currentTarget.value,
                        })
                      ) {
                        event.currentTarget.value = group.name;
                        announce(
                          dual(
                            "Group names must contain 1 to 48 characters and no control characters.",
                            "群組名稱要有 1 至 48 個字元，而且唔可以有控制字元。",
                            language,
                          ),
                          "warning",
                          "Tab groups",
                        );
                      }
                    }}
                    aria-label={dual(
                      `Rename ${group.name} group`,
                      `重新命名 ${group.name} 群組`,
                      language,
                    )}
                  />
                  <input
                    type="color"
                    value={group.color}
                    onChange={(event) =>
                      updateTabGroup(group.id, { color: event.target.value })
                    }
                    aria-label={dual(
                      `Color for ${group.name}`,
                      `${group.name} 顏色`,
                      language,
                    )}
                  />
                  <button
                    type="button"
                    disabled={prefs.tabGroups.groups.findIndex((item) => item.id === group.id) === 0}
                    onClick={() => moveTabGroup(group.id, -1)}
                    aria-label={dual(
                      `Move ${group.name} group up`,
                      `${group.name}群組向上移`,
                      language,
                    )}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={prefs.tabGroups.groups.findIndex((item) => item.id === group.id) === prefs.tabGroups.groups.length - 1}
                    onClick={() => moveTabGroup(group.id, 1)}
                    aria-label={dual(
                      `Move ${group.name} group down`,
                      `${group.name}群組向下移`,
                      language,
                    )}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupAppearanceHeaderId((current) => current === group.id ? null : group.id)}
                    aria-expanded={groupAppearanceHeaderId === group.id}
                    aria-controls={`group-appearance-${group.id}`}
                    aria-label={dual(
                      `Edit ${group.name} group appearance`,
                      `編輯${group.name}群組外觀`,
                      language,
                    )}
                  >
                    {dual("Appearance", "外觀", language)}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateTabGroup(group.id, { collapsed: !group.collapsed })
                    }
                    aria-expanded={!group.collapsed}
                    aria-controls={`group-tabs-${group.id}`}
                  >
                    {group.collapsed
                      ? dual("Expand", "展開", language)
                      : dual("Collapse", "收合", language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTabGroup(group.id)}
                  >
                    {dual("Remove", "移除", language)}
                  </button>
                </div>
                {groupAppearanceHeaderId === group.id && (
                  <GroupAppearanceEditor
                    id={`group-appearance-${group.id}`}
                    language={language}
                    group={group}
                    update={updateTabGroupAppearance}
                    close={() => setGroupAppearanceHeaderId(null)}
                  />
                )}
                <div className="tab-group-search">
                  <label>
                    <span aria-hidden="true">⌕</span>
                    <input
                      maxLength={128}
                      value={search.query}
                      onChange={(event) =>
                        updateGroupSearch(group, { query: event.target.value })
                      }
                      placeholder={dual(
                        `Search ${group.name} tabs`,
                        `搜尋${group.name}分頁`,
                        language,
                      )}
                      aria-label={dual(
                        `Search ${group.name} tabs`,
                        `搜尋${group.name}分頁`,
                        language,
                      )}
                      aria-invalid={Boolean(groupPatternError)}
                    />
                  </label>
                  <div className="builder-anchor">
                    <button
                      type="button"
                      className={search.regex ? "active" : ""}
                      onClick={() =>
                        updateGroupSearch(group, {
                          builderOpen: !search.builderOpen,
                        })
                      }
                      aria-expanded={search.builderOpen}
                      aria-controls={`group-regex-${group.id}`}
                    >
                      {dual("Regex builder", "正規表示式工具", language)}
                    </button>
                    {search.builderOpen && (
                      <RegexBuilder
                        builderId={`group-regex-${group.id}`}
                        language={language}
                        query={search.query}
                        setQuery={(value) =>
                          updateGroupSearch(group, {
                            query: value.slice(0, 128),
                            regex: true,
                          })
                        }
                        regexMode={search.regex}
                        setRegexMode={(value) =>
                          updateGroupSearch(group, { regex: value })
                        }
                        flags={search.flags}
                        setFlags={(value) =>
                          updateGroupSearch(group, { flags: value })
                        }
                        error={groupPatternError}
                        sample={search.sample}
                        setSample={(value) =>
                          updateGroupSearch(group, { sample: value })
                        }
                        matches={groupMatches}
                        announce={announce}
                        close={() =>
                          updateGroupSearch(group, { builderOpen: false })
                        }
                      />
                    )}
                  </div>
                </div>
                <p className="tab-group-search-meta" aria-live="polite">
                  {groupPatternError ||
                    `${visibleGroupMembers.length} ${dual("matching tabs", "個符合分頁", language)}`}
                </p>
                <div
                  id={`group-tabs-${group.id}`}
                  className="tab-group-members"
                  role="tablist"
                  aria-orientation={tabOrientation}
                  aria-label={dual(`${group.name} tabs`, `${group.name} 分頁`, language)}
                  onKeyDown={handleTabKeyDown}
                  hidden={group.collapsed}
                >
                  {visibleGroupMembers.map((tab) => renderStripTab(tab, false))}
                </div>
              </section>
              );
            })}
          </div>
        </div>
        {tabOverflow && (
          <div className="tab-overflow-anchor">
            <button
              className="tab-overflow-trigger"
              type="button"
              onClick={() => setTabOverflowOpen((value) => !value)}
              aria-expanded={tabOverflowOpen}
              aria-controls="tab-overflow-surface"
            >
              <span aria-hidden="true">•••</span>
              <span>{dual("All tabs", "所有分頁", language)}</span>
            </button>
            {tabOverflowOpen && (
              <section
                id="tab-overflow-surface"
                className="tab-overflow-surface"
                aria-label={dual("Tab overflow", "分頁溢出", language)}
              >
                <header>
                  <div>
                    <span className="eyebrow">
                      {dual(
                        "Six local destinations",
                        "六個本機目的地",
                        language,
                      )}
                    </span>
                    <h2>{dual("Find a tab", "搵分頁", language)}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTabOverflowOpen(false);
                      setTabOverflowBuilderOpen(false);
                    }}
                    aria-label={dual(
                      "Close tab overflow",
                      "關閉分頁溢出",
                      language,
                    )}
                  >
                    ×
                  </button>
                </header>
                <div className="tab-overflow-search">
                  <label>
                    <span aria-hidden="true">⌕</span>
                    <input
                      autoFocus
                      maxLength={128}
                      value={tabOverflowQuery}
                      onChange={(event) =>
                        setTabOverflowQuery(event.target.value)
                      }
                      placeholder={dual(
                        "Search all six tabs",
                        "搜尋全部六個分頁",
                        language,
                      )}
                      aria-invalid={Boolean(tabOverflowPatternError)}
                    />
                  </label>
                  <div className="builder-anchor">
                    <button
                      type="button"
                      className={tabOverflowRegex ? "active" : ""}
                      onClick={() =>
                        setTabOverflowBuilderOpen((value) => !value)
                      }
                      aria-expanded={tabOverflowBuilderOpen}
                      aria-controls="regex-builder"
                    >
                      {dual("Regex builder", "正規表示式工具", language)}
                    </button>
                    {tabOverflowBuilderOpen && (
                      <RegexBuilder
                        language={language}
                        query={tabOverflowQuery}
                        setQuery={setTabOverflowQuery}
                        regexMode={tabOverflowRegex}
                        setRegexMode={setTabOverflowRegex}
                        flags={tabOverflowFlags}
                        setFlags={setTabOverflowFlags}
                        error={tabOverflowPatternError}
                        sample={tabOverflowSample}
                        setSample={setTabOverflowSample}
                        matches={tabOverflowMatches}
                        announce={announce}
                        close={() => setTabOverflowBuilderOpen(false)}
                      />
                    )}
                  </div>
                </div>
                <p className="tab-overflow-meta" aria-live="polite">
                  <span>
                    {tabOverflowRegex
                      ? `JavaScript RegExp /${tabOverflowQuery}/${tabOverflowFlags.i ? "i" : ""}${tabOverflowFlags.m ? "m" : ""}`
                      : dual("Plain-text search", "純文字搜尋", language)}
                  </span>
                  <strong>
                    {tabOverflowPatternError ||
                      `${filteredOverflowTabs.length} ${dual("tabs", "個分頁", language)}`}
                  </strong>
                </p>
                <section className="bulk-close-tools" aria-labelledby="bulk-close-title">
                  <h3 id="bulk-close-title">
                    {dual("Bulk close tabs", "批量關閉分頁", language)}
                  </h3>
                  <div className="bulk-close-search">
                    <label>
                      <span aria-hidden="true">⌕</span>
                      <input
                        maxLength={128}
                        value={bulkCloseQuery}
                        onChange={(event) => setBulkCloseQuery(event.target.value)}
                        placeholder={dual(
                          "Search visible tab labels",
                          "搜尋分頁顯示名稱",
                          language,
                        )}
                        aria-label={dual(
                          "Search tabs for bulk close",
                          "搜尋要批量關閉嘅分頁",
                          language,
                        )}
                        aria-invalid={Boolean(bulkClosePatternError)}
                      />
                    </label>
                    <div className="builder-anchor">
                      <button
                        type="button"
                        className={bulkCloseRegex ? "active" : ""}
                        onClick={() =>
                          setBulkCloseBuilderOpen((value) => !value)
                        }
                        aria-expanded={bulkCloseBuilderOpen}
                        aria-controls="bulk-close-regex"
                      >
                        {dual("Regex builder", "正規表示式工具", language)}
                      </button>
                      {bulkCloseBuilderOpen && (
                        <RegexBuilder
                          builderId="bulk-close-regex"
                          language={language}
                          query={bulkCloseQuery}
                          setQuery={(value) => {
                            setBulkCloseQuery(value.slice(0, 128));
                            setBulkCloseRegex(true);
                          }}
                          regexMode={bulkCloseRegex}
                          setRegexMode={setBulkCloseRegex}
                          flags={bulkCloseFlags}
                          setFlags={setBulkCloseFlags}
                          error={bulkClosePatternError}
                          sample={bulkCloseSample}
                          setSample={setBulkCloseSample}
                          matches={bulkCloseMatches}
                          announce={announce}
                          close={() => setBulkCloseBuilderOpen(false)}
                        />
                      )}
                    </div>
                  </div>
                  <p className="bulk-close-meta" aria-live="polite">
                    {bulkClosePatternError ||
                      dual(
                        `${bulkCloseAffected.length} eligible tabs will be affected; the current tab is protected.`,
                        `有 ${bulkCloseAffected.length} 個合資格分頁會受影響；目前分頁受保護。`,
                        language,
                      )}
                  </p>
                  <label className="bulk-close-pinned">
                    <input
                      type="checkbox"
                      checked={bulkCloseIncludePinned}
                      onChange={(event) =>
                        setBulkCloseIncludePinned(event.target.checked)
                      }
                    />
                    <span>
                      {dual(
                        "Include pinned tabs (protected by default)",
                        "包括釘選分頁（預設受保護）",
                        language,
                      )}
                    </span>
                  </label>
                  <div className="bulk-close-actions">
                    <button
                      type="button"
                      disabled={!bulkCloseQuery || Boolean(bulkClosePatternError)}
                      onClick={(event) =>
                        openBulkCloseConfirmation("contains", event.currentTarget)
                      }
                    >
                      {dual("Close tabs containing text", "關閉包含文字嘅分頁", language)}
                    </button>
                    <button
                      type="button"
                      disabled={!bulkCloseQuery || Boolean(bulkClosePatternError)}
                      onClick={(event) =>
                        openBulkCloseConfirmation("not-contains", event.currentTarget)
                      }
                    >
                      {dual("Close tabs not containing text", "關閉唔包含文字嘅分頁", language)}
                    </button>
                  </div>
                </section>
                <button type="button" className="overflow-manage-groups" onClick={() => { setTabOverflowOpen(false); setTabOverflowBuilderOpen(false); openSetting("tab-group-settings"); }}>{dual("Manage tab groups", "管理分頁群組", language)}</button>
                <div className="tab-overflow-list">
                  {filteredOverflowTabs.map((tab) => {
                    const pinned = prefs.pinnedTabs.includes(tab.id);
                    const region = pinned ? pinnedTabs : ordinaryTabs;
                    const index = region.findIndex(
                      (item) => item.id === tab.id,
                    );
                    const backwardLabel =
                      tabOrientation === "vertical" ? "up" : "left";
                    const forwardLabel =
                      tabOrientation === "vertical" ? "down" : "right";
                    return (
                      <article
                        key={tab.id}
                        data-bulk-close-protected={pinned ? "true" : "false"}
                      >
                        <button
                          type="button"
                          aria-current={
                            activeTab === tab.id ? "page" : undefined
                          }
                          onClick={() => {
                            selectTab(tab.id);
                            setTabOverflowOpen(false);
                            setTabOverflowBuilderOpen(false);
                          }}
                        >
                          <span className="tab-icon" aria-hidden="true">
                            {tab.icon}
                          </span>
                          <span>
                            <strong>{dual(tab.en, tab.yue, language)}</strong>
                            <small>
                              {dual(
                                `${activeTab === tab.id ? "Current tab" : "Open tab"} · ${pinned ? "Pinned and protected from bulk close" : "Not pinned"}`,
                                `${activeTab === tab.id ? "目前分頁" : "開啟分頁"} · ${pinned ? "已釘選並受保護免受批量關閉" : "未釘選"}`,
                                language,
                              )}
                            </small>
                          </span>
                        </button>
                        <span
                          className="overflow-reorder-controls"
                          role="group"
                          aria-label={dual(
                            `Reorder ${tab.en}`,
                            `重新排列${tab.yue}`,
                            language,
                          )}
                        >
                          <button
                            id={`overflow-move-${tab.id}-backward`}
                            type="button"
                            disabled={index === 0}
                            onClick={() =>
                              moveTab(
                                tab.id,
                                -1,
                                `overflow-move-${tab.id}-backward`,
                              )
                            }
                            aria-label={dual(
                              `Move ${tab.en} ${backwardLabel}`,
                              `${tab.yue}向${backwardLabel === "up" ? "上" : "左"}移`,
                              language,
                            )}
                          >
                            {tabOrientation === "vertical" ? "↑" : "‹"}
                          </button>
                          <button
                            id={`overflow-move-${tab.id}-forward`}
                            type="button"
                            disabled={index === region.length - 1}
                            onClick={() =>
                              moveTab(
                                tab.id,
                                1,
                                `overflow-move-${tab.id}-forward`,
                              )
                            }
                            aria-label={dual(
                              `Move ${tab.en} ${forwardLabel}`,
                              `${tab.yue}向${forwardLabel === "down" ? "下" : "右"}移`,
                              language,
                            )}
                          >
                            {tabOrientation === "vertical" ? "↓" : "›"}
                          </button>
                        </span>
                        <button
                          className="overflow-move-group"
                          type="button"
                          onClick={(event) =>
                            openMovePicker(tab.id, event.currentTarget)
                          }
                          aria-label={dual(
                            `Move ${tab.en} into a group`,
                            `移動${tab.yue}去群組`,
                            language,
                          )}
                          aria-haspopup="dialog"
                          aria-expanded={movePickerTab === tab.id}
                          aria-controls="move-group-picker"
                        >
                          {dual("Move… into group…", "移動…去群組…", language)}
                        </button>
                        <button
                          className="overflow-pin-toggle"
                          type="button"
                          onClick={() => togglePinnedTab(tab.id, false)}
                        >
                          {dual(
                            pinned ? "Unpin" : "Pin",
                            pinned ? "取消釘選" : "釘選",
                            language,
                          )}
                        </button>
                      </article>
                    );
                  })}
                  {!filteredOverflowTabs.length && (
                    <p className="tab-overflow-empty" role="status">
                      {dual(
                        "No tabs match this search.",
                        "冇分頁符合呢個搜尋。",
                        language,
                      )}
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
        {movePickerTab && createPortal(
          <div className="dialog-scrim move-group-scrim" role="presentation">
          <section
            id="move-group-picker"
            ref={movePickerDialog}
            className="move-group-picker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="move-group-title"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                closeMovePicker();
                return;
              }
              if (!["ArrowDown", "ArrowUp"].includes(event.key) || !(event.target instanceof HTMLElement) || !event.target.matches("[data-group-choice]")) return;
              const choices = Array.from(
                event.currentTarget.querySelectorAll<HTMLButtonElement>(
                  "[data-group-choice]:not([disabled])",
                ),
              );
              if (!choices.length) return;
              event.preventDefault();
              const at = choices.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              const next =
                event.key === "ArrowDown"
                  ? (at + 1) % choices.length
                  : (at - 1 + choices.length) % choices.length;
              choices[next].focus();
            }}
          >
            <header>
              <div>
                <span className="eyebrow">
                  {dual("Local tab organization", "本機分頁整理", language)}
                </span>
                <h2 id="move-group-title">
                  {dual("Move… into group…", "移動…去群組…", language)}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeMovePicker}
                aria-label={dual("Cancel moving tab", "取消移動分頁", language)}
              >
                ×
              </button>
            </header>
            <div className="move-group-search">
              <label>
                <span aria-hidden="true">⌕</span>
                <input
                  autoFocus
                  maxLength={128}
                  value={moveGroupQuery}
                  onChange={(event) => setMoveGroupQuery(event.target.value)}
                  placeholder={dual("Search groups", "搜尋群組", language)}
                  aria-label={dual("Search tab groups", "搜尋分頁群組", language)}
                  aria-invalid={Boolean(moveGroupPatternError)}
                />
              </label>
              <div className="builder-anchor">
                <button
                  type="button"
                  className={moveGroupRegex ? "active" : ""}
                  onClick={() => setMoveGroupBuilderOpen((value) => !value)}
                  aria-expanded={moveGroupBuilderOpen}
                  aria-controls="move-group-regex-builder"
                >
                  {dual("Regex builder", "正規表示式工具", language)}
                </button>
                {moveGroupBuilderOpen && (
                  <RegexBuilder
                    builderId="move-group-regex-builder"
                    language={language}
                    query={moveGroupQuery}
                    setQuery={setMoveGroupQuery}
                    regexMode={moveGroupRegex}
                    setRegexMode={setMoveGroupRegex}
                    flags={moveGroupFlags}
                    setFlags={setMoveGroupFlags}
                    error={moveGroupPatternError}
                    sample={moveGroupSample}
                    setSample={setMoveGroupSample}
                    matches={moveGroupMatches}
                    announce={announce}
                    close={() => setMoveGroupBuilderOpen(false)}
                  />
                )}
              </div>
            </div>
            <p className="move-group-meta" aria-live="polite">
              {moveGroupPatternError ||
                dual(
                  `${filteredMoveGroups.length} matching groups`,
                  `${filteredMoveGroups.length} 個符合群組`,
                  language,
                )}
            </p>
            <div className="move-group-list">
              <button
                data-group-choice
                type="button"
                onClick={() => moveTabIntoGroup(movePickerTab, null)}
              >
                <span className="group-swatch ungrouped" aria-hidden="true" />
                <span>
                  <strong>{dual("Ungrouped", "未分組", language)}</strong>
                  <small>
                    {dual(
                      "Return this tab to the ordinary region",
                      "將分頁放返普通區域",
                      language,
                    )}
                  </small>
                </span>
              </button>
              {filteredMoveGroups.map((group) => (
                <button
                  data-group-choice
                  type="button"
                  key={group.id}
                  onClick={() => moveTabIntoGroup(movePickerTab, group.id)}
                >
                  <span
                    className="group-swatch"
                    style={{ background: group.color }}
                    aria-hidden="true"
                  />
                  <span>
                    <strong>{group.name}</strong>
                    <small>
                      {dual(
                        `${group.tabs.length} members`,
                        `${group.tabs.length} 個成員`,
                        language,
                      )}
                    </small>
                  </span>
                </button>
              ))}
            </div>
            {!prefs.tabGroups.groups.length && (
              <p className="empty-state">
                {dual(
                  "No groups exist yet. Create the first one below.",
                  "未有群組；可以喺下面建立第一個。",
                  language,
                )}
              </p>
            )}
            {!!prefs.tabGroups.groups.length &&
              !filteredMoveGroups.length &&
              !moveGroupPatternError && (
                <p className="empty-state">
                  {dual(
                    "No group matches this search.",
                    "冇群組符合呢個搜尋。",
                    language,
                  )}
                </p>
              )}
            <div className="move-group-create">
              <input
                value={newGroupName}
                maxLength={48}
                onChange={(event) => setNewGroupName(event.target.value)}
                placeholder={dual("New group name", "新群組名稱", language)}
                aria-label={dual("New group name", "新群組名稱", language)}
              />
              <input
                type="color"
                value={newGroupColor}
                onChange={(event) => setNewGroupColor(event.target.value)}
                aria-label={dual("New group color", "新群組顏色", language)}
              />
              <button
                type="button"
                disabled={!groupNameReady || groupLimitReached}
                aria-describedby="move-group-create-hint"
                onClick={() => createTabGroup(movePickerTab)}
              >
                {dual("Create and move", "建立並移動", language)}
              </button>
            </div>
            <p
              id="move-group-create-hint"
              className="supporting-copy"
              aria-live="polite"
            >
              {createGroupHint}
            </p>
            <footer>
              <span>
                {dual(
                  "Maximum 8 groups · saved only in this browser",
                  "最多 8 個群組 · 只存喺呢個瀏覽器",
                  language,
                )}
              </span>
              <button type="button" onClick={closeMovePicker}>
                {dual("Cancel", "取消", language)}
              </button>
            </footer>
          </section>
          </div>,
          document.body,
        )}
      </nav>
      <div id="main-content" className="content-stage">
        {activeTab === "home" && (
          <Panel id="home">
            <div className="hero-card">
              <div className="hero-copy">
                <span className="eyebrow">
                  {dual("Desktop design preview", "桌面設計預覽", language)}
                </span>
                <h1>
                  {dual(
                    "Forge a calmer Windows workspace.",
                    "打造一個順眼啲嘅 Windows 工作空間。",
                    language,
                  )}
                </h1>
                <p className="hero-lede">{heroCopy}</p>
                <div className="hero-actions">
                  <button
                    className="filled-button"
                    type="button"
                    onClick={() => selectTab("features", "site-search")}
                  >
                    {dual("Explore the preview", "探索預覽", language)}
                  </button>
                  {published ? (
                    <a
                      className="tonal-button"
                      href={manifest?.url ?? undefined}
                    >
                      {dual(
                        `Download ${manifest?.version}`,
                        `下載 ${manifest?.version}`,
                        language,
                      )}
                    </a>
                  ) : (
                    <button
                      className="tonal-button"
                      type="button"
                      disabled
                      aria-describedby="installer-reason"
                    >
                      {dual(
                        "Installer not published",
                        "安裝程式未發佈",
                        language,
                      )}
                    </button>
                  )}
                </div>
                <p id="installer-reason" className="supporting-copy">
                  {published
                    ? dual(
                        "The link comes from the versioned release manifest.",
                        "連結來自有版本嘅發佈清單。",
                        language,
                      )
                    : dual(
                        "The button stays disabled until a published manifest identifies a real installer.",
                        "有發佈清單指向真正安裝程式之前，按鈕會保持停用。",
                        language,
                      )}
                </p>
              </div>
              <div
                className="preview-frame"
                aria-label="Static preview of the WinForge desktop layout"
              >
                <div className="preview-titlebar">
                  <span>
                    <img
                      src={logoSrc}
                      className={`app-logo preset-${prefs.logoPreset}`}
                      width="28"
                      height="28"
                      alt=""
                    />{" "}
                    WinForge
                  </span>
                  <span aria-hidden="true">— □ ×</span>
                </div>
                <div className="preview-body">
                  <div className="preview-rail" aria-hidden="true">
                    <span className="selected">⌂</span>
                    <span>▦</span>
                    <span>◫</span>
                    <span>⚙</span>
                  </div>
                  <div className="preview-content">
                    <small>WORKSPACE</small>
                    <h2>Good afternoon</h2>
                    <div className="preview-grid">
                      <div>
                        <span>Appearance</span>
                        <strong>Material 3</strong>
                      </div>
                      <div>
                        <span>Profiles</span>
                        <strong>Local only</strong>
                      </div>
                      <div>
                        <span>Release</span>
                        <strong>
                          {published ? manifest?.version : "Not published"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="static-preview-badge">
                  Static product preview
                </span>
              </div>
            </div>
            <aside className="boundary-banner">
              <span aria-hidden="true">i</span>
              <div>
                <strong>
                  {dual(
                    "This website is not the desktop application.",
                    "呢個網站唔係桌面應用程式。",
                    language,
                  )}
                </strong>
                <p>
                  {dual(
                    "It is a landing page, documentation surface, and interface preview. It does not read or change Windows settings, run operating-system actions, or embed the installed product.",
                    "呢度只係落地頁、文件同介面預覽；唔會讀取或者更改 Windows 設定、執行系統操作，亦唔會扮成已安裝產品。",
                    language,
                  )}
                </p>
              </div>
            </aside>
            <PageHeading
              eyebrow={dual("Built for honest discovery", "老實探索", language)}
              title={dual(
                "A preview that labels every boundary.",
                "每條界線都講清楚嘅預覽。",
                language,
              )}
              body={dual(
                "Explore design, discovery, and release behavior without mistaking the page for the installed product.",
                "探索設計、搜尋同發佈行為，又唔會誤會網站係已安裝產品。",
                language,
              )}
            />
            <div className="three-up">
              <FeatureCard
                icon="◫"
                title={dual("Design direction", "設計方向", language)}
                body={dual(
                  "Material 3 surfaces, spacing, type, elevation, and responsive navigation.",
                  "Material 3 表面、間距、字體、層次同響應式導覽。",
                  language,
                )}
              />
              <FeatureCard
                icon="⌕"
                title={dual("Find anything", "搵乜都得", language)}
                body={dual(
                  "Search the full catalog or deliberately switch to regex.",
                  "搜尋完整目錄，或者明確轉去正規表示式。",
                  language,
                )}
              />
              <FeatureCard
                icon="✓"
                title={dual("Evidence-led downloads", "有證據先下載", language)}
                body={dual(
                  "No guessed latest link; the action needs published metadata.",
                  "唔估最新連結；按鈕要有已發佈資料先開。",
                  language,
                )}
              />
            </div>
          </Panel>
        )}
        {activeTab === "features" && (
          <Panel id="features">
            <PageHeading
              eyebrow={dual("Complete site catalog", "完整網站目錄", language)}
              title={dual(
                "Preview features and articles",
                "預覽功能同文章",
                language,
              )}
              body={dual(
                "Search what this landing page actually provides. Desktop operating-system controls are not claimed here.",
                "搜尋呢個落地頁真正提供嘅功能；網站唔會聲稱有桌面系統控制。",
                language,
              )}
            />
            <div className="search-region">
              <div className="search-row">
                <label className="search-field" htmlFor="site-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    id="site-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={dual(
                      "Search features and documentation",
                      "搜尋功能同文件",
                      language,
                    )}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </label>
                <div className="builder-anchor">
                  <button
                    className={`builder-button ${builderOpen ? "active" : ""}`}
                    type="button"
                    onClick={() => setBuilderOpen((v) => !v)}
                    aria-expanded={builderOpen}
                    aria-controls="regex-builder"
                  >
                    <span aria-hidden="true">.*</span>
                    {dual("Regex builder", "正規表示式工具", language)}
                  </button>
                  {builderOpen && (
                    <RegexBuilder
                      query={query}
                      setQuery={setQuery}
                      regexMode={regexMode}
                      setRegexMode={setRegexMode}
                      flags={flags}
                      setFlags={setFlags}
                      error={regexResult.error}
                      sample={sample}
                      setSample={setSample}
                      matches={sampleMatches}
                      announce={announce}
                      close={() => setBuilderOpen(false)}
                    />
                  )}
                </div>
              </div>
              <div className="search-meta" aria-live="polite">
                <span>
                  {regexMode
                    ? `JavaScript RegExp /${query}/${flags.i ? "i" : ""}${flags.m ? "m" : ""}`
                    : dual("Plain-text search", "純文字搜尋", language)}
                </span>
                <strong>
                  {regexResult.error ||
                    `${results.length} ${dual("results", "項結果", language)}`}
                </strong>
              </div>
            </div>
            {results.length ? (
              <div className="catalog-grid">
                {results.map((item) => (
                  <article key={item.id} className="catalog-card">
                    <div className="catalog-meta">
                      <span>{item.category}</span>
                      <span>
                        {item.type === "feature"
                          ? dual("Feature", "功能", language)
                          : dual("Article", "文章", language)}
                      </span>
                    </div>
                    <h2>{dual(item.title, item.titleYue, language)}</h2>
                    <p>{dual(item.summary, item.summaryYue, language)}</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.type === "article") setArticleId(item.id);
                        selectTab(
                          item.tab,
                          item.type === "article"
                            ? `article-${item.id}`
                            : undefined,
                        );
                      }}
                    >
                      {item.type === "article"
                        ? dual("Read article", "睇文章", language)
                        : dual("Open destination", "開啟目的地", language)}
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span aria-hidden="true">⌕</span>
                <h2>{dual("No matches", "搵唔到", language)}</h2>
                <p>
                  {dual(
                    "Change the query or return to plain text.",
                    "改吓搜尋字或者轉返純文字。",
                    language,
                  )}
                </p>
              </div>
            )}
          </Panel>
        )}
        {activeTab === "docs" && (
          <Panel id="docs">
            <PageHeading
              eyebrow={dual("Offline-friendly guide", "離線友善指南", language)}
              title={dual("Documentation", "使用文件", language)}
              body={dual(
                "Every article covers behavior, configuration, failure modes, security, verification, and useful next reading.",
                "每篇文章都有行為、設定、失敗處理、安全、驗證同下一篇建議。",
                language,
              )}
            />
            <div className="docs-layout">
              <nav className="article-list" aria-label="Documentation articles">
                {ARTICLES.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    className={articleId === article.id ? "active" : ""}
                    onClick={() => setArticleId(article.id)}
                  >
                    <span>
                      {dual(article.title, article.titleYue, language)}
                    </span>
                    <small>{dual("Article", "文章", language)}</small>
                  </button>
                ))}
              </nav>
              {ARTICLES.filter((a) => a.id === articleId).map((article) => (
                <article
                  key={article.id}
                  id={`article-${article.id}`}
                  className="article-content"
                  tabIndex={-1}
                >
                  <span className="eyebrow">
                    {dual("Feature article", "功能文章", language)}
                  </span>
                  <h2>{dual(article.title, article.titleYue, language)}</h2>
                  {article.sections.map(
                    ([enTitle, yueTitle, enBody, yueBody]) => (
                      <DocSection
                        key={enTitle}
                        title={dual(enTitle, yueTitle, language)}
                      >
                        {dual(enBody, yueBody, language)}
                      </DocSection>
                    ),
                  )}
                  <div className="suggested-articles">
                    <strong>
                      {dual("Suggested articles", "建議文章", language)}
                    </strong>
                    <ul>
                      {article.related.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        )}
        {activeTab === "settings" && (
          <Panel id="settings">
            <PageHeading
              eyebrow={dual(
                "Stored on this device",
                "只留喺呢部裝置",
                language,
              )}
              title={dual("Site settings", "網站設定", language)}
              body={dual(
                "These controls customize this landing page only. They never change the installed app or Windows.",
                "呢啲控制只改呢個落地頁，唔會更改已安裝應用程式或者 Windows。",
                language,
              )}
            />
            {!persistenceAvailable && (
              <p className="supporting-copy" role="status">
                {dual(
                  "Browser storage is unavailable or full; this page remains usable, but changes may last only until reload.",
                  "瀏覽器儲存用唔到或者已滿；頁面仍然用得，但改動可能只維持到重新載入。",
                  language,
                )}
              </p>
            )}
            <div className="settings-search-region">
              <div className="settings-search-row">
                <label className="search-field" htmlFor="settings-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    id="settings-search"
                    maxLength={128}
                    value={settingsQuery}
                    onChange={(event) => setSettingsQuery(event.target.value)}
                    placeholder={dual(
                      "Search every site setting",
                      "搜尋所有網站設定",
                      language,
                    )}
                    aria-invalid={Boolean(settingsPatternError)}
                  />
                </label>
                <div className="builder-anchor">
                  <button
                    type="button"
                    className={settingsRegex ? "active" : ""}
                    onClick={() => setSettingsBuilderOpen((value) => !value)}
                    aria-expanded={settingsBuilderOpen}
                    aria-controls="regex-builder"
                  >
                    {dual("Regex builder", "正規表示式工具", language)}
                  </button>
                  {settingsBuilderOpen && (
                    <RegexBuilder
                      query={settingsQuery}
                      setQuery={setSettingsQuery}
                      regexMode={settingsRegex}
                      setRegexMode={setSettingsRegex}
                      flags={settingsFlags}
                      setFlags={setSettingsFlags}
                      error={settingsPatternError}
                      sample={settingsSample}
                      setSample={setSettingsSample}
                      matches={settingsMatches}
                      announce={announce}
                      close={() => setSettingsBuilderOpen(false)}
                    />
                  )}
                </div>
              </div>
              <div className="settings-search-meta" aria-live="polite">
                <span>
                  {settingsRegex
                    ? `JavaScript RegExp /${settingsQuery}/${settingsFlags.i ? "i" : ""}${settingsFlags.m ? "m" : ""}`
                    : dual("Plain-text search", "純文字搜尋", language)}
                </span>
                <strong>
                  {settingsPatternError ||
                    `${visibleSettingsCount} ${dual("settings sections", "個設定區段", language)}`}
                </strong>
              </div>
            </div>
            {visibleSettingsCount === 0 && (
              <div className="empty-state settings-no-match" role="status">
                <h2>{dual("No settings match", "冇設定符合", language)}</h2>
                <p>
                  {dual(
                    "Change the query or return to plain text. Active settings and project selection are unchanged.",
                    "改吓搜尋字或者轉返純文字；目前設定同 project 選擇冇改。",
                    language,
                  )}
                </p>
              </div>
            )}
            <div className="settings-grid">
              <SettingCard
                hidden={!settingsVisible("language")}
                title={dual("Language mode", "語言模式", language)}
                description={dual(
                  "Choose the language used by this site.",
                  "揀呢個網站用咩語言。",
                  language,
                )}
                provenance={dual(
                  "Stored locally after your first change.",
                  "第一次改動之後留喺本機。",
                  language,
                )}
              >
                <Segments
                  label="Language mode"
                  value={prefs.language}
                  options={[
                    ["en", "English"],
                    ["yue", "廣東話"],
                    ["both", "English · 廣東話"],
                  ]}
                  onChange={(v) =>
                    update(
                      "language",
                      v as LanguageMode,
                      "Language mode updated.",
                    )
                  }
                />
              </SettingCard>
              <SettingCard
                hidden={!settingsVisible("funny-en")}
                title={dual("English funny level", "英文玩味程度", language)}
                description={dual(
                  "Styles English copy from serious to playful without changing facts.",
                  "英文文案由認真到玩味，但唔會改事實。",
                  language,
                )}
                provenance={`Current value: ${prefs.funnyEnglish} / 5`}
              >
                <Range
                  label="English funny level"
                  value={prefs.funnyEnglish}
                  onChange={(v) =>
                    update(
                      "funnyEnglish",
                      v,
                      `English funny level set to ${v}.`,
                    )
                  }
                />
              </SettingCard>
              <SettingCard
                hidden={!settingsVisible("funny-yue")}
                title={dual(
                  "Cantonese funny level",
                  "廣東話玩味程度",
                  language,
                )}
                description={dual(
                  "Styles Cantonese copy independently from English.",
                  "廣東話文案可以同英文分開調校。",
                  language,
                )}
                provenance={`Current value: ${prefs.funnyCantonese} / 5`}
              >
                <Range
                  label="Cantonese funny level"
                  value={prefs.funnyCantonese}
                  onChange={(v) =>
                    update(
                      "funnyCantonese",
                      v,
                      `Cantonese funny level set to ${v}.`,
                    )
                  }
                />
              </SettingCard>
              <SettingCard
                hidden={!settingsVisible("theme")}
                title={dual("Theme", "主題", language)}
                description={dual(
                  "Follow the device or choose light or dark.",
                  "跟裝置或者揀光亮／深色。",
                  language,
                )}
                provenance={`Current value: ${prefs.theme}`}
              >
                <Segments
                  label="Theme"
                  value={prefs.theme}
                  options={[
                    ["system", dual("System", "跟系統", language)],
                    ["light", dual("Light", "光亮", language)],
                    ["dark", dual("Dark", "深色", language)],
                  ]}
                  onChange={(v) =>
                    update("theme", v as Preferences["theme"], "Theme updated.")
                  }
                />
              </SettingCard>
              <SettingCard
                id="tab-docking-setting"
                hidden={!settingsVisible("dock")}
                title={dual("Tab position", "分頁位置", language)}
                description={dual(
                  "Dock tabs to the left, right, top, or bottom edge.",
                  "分頁列可以放左、右、頂或者底邊。",
                  language,
                )}
                provenance={`Current value: ${prefs.dock}`}
              >
                <Segments
                  label="Tab position"
                  value={prefs.dock}
                  options={[
                    ["left", dual("Left", "左邊", language)],
                    ["right", dual("Right", "右邊", language)],
                    ["top", dual("Top", "頂部", language)],
                    ["bottom", dual("Bottom", "底部", language)],
                  ]}
                  onChange={(v) =>
                    update(
                      "dock",
                      v as Preferences["dock"],
                      "Tab position updated.",
                    )
                  }
                />
              </SettingCard>
              <SettingCard
                id="tab-group-settings"
                hidden={!settingsVisible("groups")}
                title={dual("Tab groups", "分頁群組", language)}
                description={dual(
                  "Create up to eight local groups, rename or color them, collapse their members, and return removed members to the ordinary tab region.",
                  "建立最多八個本機群組，可以改名、改色、收合成員；移除群組時，成員會返去普通分頁區域。",
                  language,
                )}
                provenance={dual(
                  `${prefs.tabGroups.groups.length} of 8 groups stored locally`,
                  `本機已存 ${prefs.tabGroups.groups.length} / 8 個群組`,
                  language,
                )}
              >
                <div className="tab-group-settings-search">
                  <label className="search-field" htmlFor="tab-group-settings-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                      id="tab-group-settings-search"
                      maxLength={128}
                      value={groupSettingsQuery}
                      onChange={(event) =>
                        setGroupSettingsQuery(event.target.value)
                      }
                      placeholder={dual(
                        "Search groups by name or membership",
                        "搜尋群組名稱或者成員",
                        language,
                      )}
                      aria-invalid={Boolean(groupSettingsPatternError)}
                    />
                  </label>
                  <div className="builder-anchor">
                    <button
                      type="button"
                      className={groupSettingsRegex ? "active" : ""}
                      onClick={() =>
                        setGroupSettingsBuilderOpen((value) => !value)
                      }
                      aria-expanded={groupSettingsBuilderOpen}
                      aria-controls="tab-group-settings-regex"
                    >
                      {dual("Regex builder", "正規表示式工具", language)}
                    </button>
                    {groupSettingsBuilderOpen && (
                      <RegexBuilder
                        builderId="tab-group-settings-regex"
                        language={language}
                        query={groupSettingsQuery}
                        setQuery={(value) => {
                          setGroupSettingsQuery(value.slice(0, 128));
                          setGroupSettingsRegex(true);
                        }}
                        regexMode={groupSettingsRegex}
                        setRegexMode={setGroupSettingsRegex}
                        flags={groupSettingsFlags}
                        setFlags={setGroupSettingsFlags}
                        error={groupSettingsPatternError}
                        sample={groupSettingsSample}
                        setSample={setGroupSettingsSample}
                        matches={groupSettingsMatches}
                        announce={announce}
                        close={() => setGroupSettingsBuilderOpen(false)}
                      />
                    )}
                  </div>
                  <p className="tab-group-search-meta" aria-live="polite">
                    {groupSettingsPatternError ||
                      `${visibleGroupSettings.length} ${dual("matching groups", "個符合群組", language)}`}
                  </p>
                </div>
                <div className="tab-group-settings-list">
                  {visibleGroupSettings.map((group) => {
                    const groupIndex = prefs.tabGroups.groups.findIndex(
                      (item) => item.id === group.id,
                    );
                    return (
                    <div key={group.id}>
                      <span
                        className="group-swatch"
                        style={{ background: group.color }}
                        aria-hidden="true"
                      />
                      <strong>{group.name}</strong>
                      <span>
                        {dual(
                          `${group.tabs.length} members`,
                          `${group.tabs.length} 個成員`,
                          language,
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGroupAppearanceSettingsId((current) => current === group.id ? null : group.id)}
                        aria-expanded={groupAppearanceSettingsId === group.id}
                        aria-controls={`settings-group-appearance-${group.id}`}
                        aria-label={dual(
                          `Edit ${group.name} group appearance`,
                          `編輯${group.name}群組外觀`,
                          language,
                        )}
                      >
                        {dual("Appearance", "外觀", language)}
                      </button>
                      <button
                        type="button"
                        disabled={groupIndex === 0}
                        onClick={() => moveTabGroup(group.id, -1)}
                        aria-label={dual(
                          `Move ${group.name} group up`,
                          `${group.name}群組向上移`,
                          language,
                        )}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={groupIndex === prefs.tabGroups.groups.length - 1}
                        onClick={() => moveTabGroup(group.id, 1)}
                        aria-label={dual(
                          `Move ${group.name} group down`,
                          `${group.name}群組向下移`,
                          language,
                        )}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateTabGroup(group.id, {
                            collapsed: !group.collapsed,
                          })
                        }
                        aria-label={dual(
                          `${group.collapsed ? "Expand" : "Collapse"} ${group.name} group`,
                          `${group.collapsed ? "展開" : "收合"}${group.name}群組`,
                          language,
                        )}
                        aria-expanded={!group.collapsed}
                        aria-controls={`group-tabs-${group.id}`}
                      >
                        {group.collapsed
                          ? dual("Expand", "展開", language)
                          : dual("Collapse", "收合", language)}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTabGroup(group.id)}
                        aria-label={dual(
                          `Remove ${group.name} group`,
                          `移除${group.name}群組`,
                          language,
                        )}
                      >
                        {dual("Remove", "移除", language)}
                      </button>
                      {groupAppearanceSettingsId === group.id && (
                        <GroupAppearanceEditor
                          id={`settings-group-appearance-${group.id}`}
                          language={language}
                          group={group}
                          update={updateTabGroupAppearance}
                          close={() => setGroupAppearanceSettingsId(null)}
                        />
                      )}
                    </div>
                    );
                  })}
                  {prefs.tabGroups.groups.length > 0 &&
                    !visibleGroupSettings.length &&
                    !groupSettingsPatternError && (
                      <p className="empty-state" role="status">
                        {dual(
                          "No groups match this search; the stored groups and active project are unchanged.",
                          "冇群組符合呢個搜尋；已保存群組同目前 project 都冇改。",
                          language,
                        )}
                      </p>
                    )}
                  {!prefs.tabGroups.groups.length && (
                    <p className="empty-state">
                      {dual(
                        "No groups exist yet. The six tabs remain in their pinned or ordinary regions.",
                        "未有群組；六個分頁保持喺釘選或者普通區域。",
                        language,
                      )}
                    </p>
                  )}
                </div>
                <div className="tab-group-create">
                  <input
                    value={newGroupName}
                    maxLength={48}
                    onChange={(event) => setNewGroupName(event.target.value)}
                    placeholder={dual("New group name", "新群組名稱", language)}
                    aria-label={dual("New group name", "新群組名稱", language)}
                  />
                  <input
                    type="color"
                    value={newGroupColor}
                    onChange={(event) => setNewGroupColor(event.target.value)}
                    aria-label={dual("New group color", "新群組顏色", language)}
                  />
                  <button
                    type="button"
                    disabled={!groupNameReady || groupLimitReached}
                    aria-describedby="settings-group-create-hint"
                    onClick={() => createTabGroup()}
                  >
                    {dual("Create group", "建立群組", language)}
                  </button>
                </div>
                <p
                  id="settings-group-create-hint"
                  className="supporting-copy"
                  aria-live="polite"
                >
                  {createGroupHint}
                </p>
                <p className="supporting-copy">
                  {dual(
                    "Per-group appearance editing and group bulk-close are not implemented in this bounded slice.",
                    "今次有限範圍未實作每群組外觀編輯同群組批量關閉。",
                    language,
                  )}
                </p>
              </SettingCard>
              <SettingCard
                id="master-tab-search"
                hidden={!settingsVisible("master-tabs")}
                title={dual("Master tab search", "總分頁搜尋", language)}
                description={dual(
                  "Search every open tab owned by this site surface, including group and pinned context.",
                  "搜尋呢個網站介面擁有嘅所有開啟中分頁，包括群組同釘選資料。",
                  language,
                )}
                provenance={dual(
                  "Search state stays transient and does not change tab state.",
                  "搜尋狀態只係暫時，唔會改分頁狀態。",
                  language,
                )}
              >
                <div className="master-tab-search-controls">
                  <label className="search-field" htmlFor="master-tab-search-input">
                    <span aria-hidden="true">⌕</span>
                    <input
                      id="master-tab-search-input"
                      maxLength={128}
                      value={masterTabQuery}
                      onChange={(event) => setMasterTabQuery(event.target.value)}
                      placeholder={dual("Search all open tabs", "搜尋所有開啟中分頁", language)}
                      aria-label={dual("Search all open tabs", "搜尋所有開啟中分頁", language)}
                      aria-invalid={Boolean(masterTabPatternError)}
                    />
                  </label>
                  <div className="builder-anchor">
                    <button
                      type="button"
                      className={masterTabRegex ? "active" : ""}
                      onClick={() => setMasterTabBuilderOpen((value) => !value)}
                      aria-expanded={masterTabBuilderOpen}
                      aria-controls="master-tab-regex"
                    >
                      {dual("Regex builder", "正規表示式工具", language)}
                    </button>
                    {masterTabBuilderOpen && (
                      <RegexBuilder
                        builderId="master-tab-regex"
                        language={language}
                        query={masterTabQuery}
                        setQuery={(value) => {
                          setMasterTabQuery(value.slice(0, 128));
                          setMasterTabRegex(true);
                        }}
                        regexMode={masterTabRegex}
                        setRegexMode={setMasterTabRegex}
                        flags={masterTabFlags}
                        setFlags={setMasterTabFlags}
                        error={masterTabPatternError}
                        sample={masterTabSample}
                        setSample={setMasterTabSample}
                        matches={masterTabMatches}
                        announce={announce}
                        close={() => setMasterTabBuilderOpen(false)}
                      />
                    )}
                  </div>
                </div>
                <p className="master-tab-search-meta" aria-live="polite">
                  {masterTabPatternError ||
                    `${masterTabResults.length} ${dual("matching tabs", "個符合分頁", language)}`}
                </p>
                <div className="master-tab-results">
                  {masterTabResults.map((tab) => {
                    const groupName =
                      prefs.tabGroups.groups.find((group) => group.tabs.includes(tab.id))?.name ??
                      dual("Ungrouped", "未分組", language);
                    const pinned = prefs.pinnedTabs.includes(tab.id);
                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => selectTab(tab.id, `tab-${tab.id}`)}
                        aria-label={dual(
                          `${tab.en}; ${groupName}; ${pinned ? "Pinned" : "Ordinary"}`,
                          `${tab.yue}；${groupName}；${pinned ? "已釘選" : "普通"}`,
                          language,
                        )}
                      >
                        <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
                        <span>
                          <strong>{dual(tab.en, tab.yue, language)}</strong>
                          <small>{dual(`${groupName} · ${pinned ? "Pinned" : "Ordinary"}`, `${groupName} · ${pinned ? "已釘選" : "普通"}`, language)}</small>
                        </span>
                      </button>
                    );
                  })}
                  {!masterTabResults.length && (
                    <p className="empty-state" role="status">
                      {dual("No open tabs match this search.", "冇開啟中分頁符合呢個搜尋。", language)}
                    </p>
                  )}
                </div>
              </SettingCard>
              <SettingCard
                hidden={!settingsVisible("density")}
                title={dual("Density", "密度", language)}
                description={dual(
                  "Adjust spacing without hiding information.",
                  "調整間距，但唔會刪走資料。",
                  language,
                )}
                provenance={`Current value: ${prefs.density}`}
              >
                <Segments
                  label="Density"
                  value={prefs.density}
                  options={[
                    ["comfortable", dual("Comfortable", "舒適", language)],
                    ["compact", dual("Compact", "緊密", language)],
                  ]}
                  onChange={(v) =>
                    update(
                      "density",
                      v as Preferences["density"],
                      "Density updated.",
                    )
                  }
                />
              </SettingCard>
              <SettingCard
                hidden={!settingsVisible("accent")}
                title={dual("Accent color", "重點色", language)}
                description={dual(
                  "Choose the emphasis color for controls and focus.",
                  "揀控制同焦點提示嘅重點色。",
                  language,
                )}
                provenance={`Current value: ${prefs.accent}`}
              >
                <label className="color-control">
                  <input
                    type="color"
                    value={prefs.accent}
                    onChange={(e) =>
                      update("accent", e.target.value, "Accent color updated.")
                    }
                    aria-label="Accent color"
                  />
                  <code>{prefs.accent}</code>
                </label>
              </SettingCard>
            </div>
            <div className="reset-card" hidden={!settingsVisible("reset")}>
              <div>
                <h2>
                  {dual("Reset local preferences", "重設本機偏好", language)}
                </h2>
                <p>
                  {dual(
                    "Restore every documented default in one action.",
                    "一撳回復所有文件列明嘅預設值。",
                    language,
                  )}
                </p>
              </div>
              <button
                className="outlined-button"
                type="button"
                onClick={openResetConfirmation}
              >
                {dual("Reset settings", "重設設定", language)}
              </button>
            </div>
          </Panel>
        )}
        {activeTab === "status" && (
          <Panel id="status">
            <PageHeading
              eyebrow={dual(
                "Evidence, not predictions",
                "證據唔係預測",
                language,
              )}
              title={dual("Publication status", "發佈狀態", language)}
              body={dual(
                "This surface reports only what the versioned manifest can support.",
                "呢個畫面只會報版本化清單支持到嘅資料。",
                language,
              )}
            />
            <div className="status-grid">
              <StatusCard
                state="info"
                label={dual("Site role", "網站角色", language)}
                value={dual(
                  "Landing page and documentation preview",
                  "落地頁同文件預覽",
                  language,
                )}
                detail={dual(
                  "No operating-system control runs here.",
                  "呢度冇執行系統控制。",
                  language,
                )}
              />
              <StatusCard
                state={
                  published
                    ? "success"
                    : manifestState === "failed"
                      ? "error"
                      : "waiting"
                }
                label={dual("Installer", "安裝程式", language)}
                value={
                  published
                    ? `${manifest?.version} · ${manifest?.platform}`
                    : manifestState === "loading"
                      ? dual("Reading manifest", "讀緊清單", language)
                      : dual("Not published", "未發佈", language)
                }
                detail={
                  published
                    ? `${manifest?.assetName} · ${formatBytes(manifest?.size ?? null)}`
                    : dual(
                        "The download action remains disabled.",
                        "下載操作保持停用。",
                        language,
                      )
                }
              />
              <StatusCard
                state="waiting"
                label={dual("Runtime proof", "執行證據", language)}
                value={dual(
                  "Not claimed by this site",
                  "網站冇聲稱有",
                  language,
                )}
                detail={dual(
                  "A source preview is not installation evidence.",
                  "原始碼預覽唔等於安裝證據。",
                  language,
                )}
              />
            </div>
            <div className="manifest-card">
              <div className="manifest-heading">
                <div>
                  <span className="eyebrow">release-manifest.json</span>
                  <h2>{dual("Release record", "發佈記錄", language)}</h2>
                </div>
                <span
                  className={`manifest-state ${published ? "success" : "waiting"}`}
                >
                  {published ? "published" : manifestState}
                </span>
              </div>
              <dl>
                <Row
                  label="Schema"
                  value={manifest?.schemaVersion?.toString() ?? "1"}
                />
                <Row
                  label="Version"
                  value={manifest?.version ?? "Unavailable"}
                />
                <Row label="Tag" value={manifest?.tag ?? "Unavailable"} />
                <Row label="Commit" value={manifest?.commit ?? "Unavailable"} />
                <Row
                  label="Platform"
                  value={manifest?.platform ?? "Windows x64"}
                />
                <Row
                  label="Asset"
                  value={manifest?.assetName ?? "Unavailable"}
                />
                <Row
                  label="SHA-256"
                  value={manifest?.sha256 ?? "Unavailable"}
                  mono
                />
                <Row label="Size" value={formatBytes(manifest?.size ?? null)} />
                <Row
                  label="Published"
                  value={manifest?.publishedAt ?? "Unavailable"}
                />
              </dl>
              <div className="unsigned-note">
                <span aria-hidden="true">!</span>
                <p>
                  {dual(
                    "Windows release artifacts are unsigned and may show an unknown-publisher or SmartScreen warning. This site does not claim signature verification.",
                    "Windows 發佈檔案未經簽署，可能會顯示未知發佈者或者 SmartScreen 警告；網站唔會聲稱驗證過簽署。",
                    language,
                  )}
                </p>
              </div>
            </div>
          </Panel>
        )}
        {activeTab === "changelog" && (
          <Panel id="changelog">
            <PageHeading
              eyebrow={dual("Published facts", "已發佈事實", language)}
              title={dual("Changelog", "更新記錄", language)}
              body={dual(
                "Five real WinForge releases with exact dates and commit links, bundled for offline use.",
                "五個真實 WinForge 發佈版本，連精確日期同 commit 連結，已內置供離線使用。",
                language,
              )}
            />
            <div className="search-region">
              <div className="search-row">
                <label className="search-field" htmlFor="changelog-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    id="changelog-search"
                    value={changelogQuery}
                    onChange={(e) =>
                      setChangelogQuery(e.target.value.slice(0, 128))
                    }
                    placeholder={dual(
                      "Search changelog",
                      "搜尋更新記錄",
                      language,
                    )}
                  />
                </label>
                <button
                  className={`builder-button ${changelogRegex ? "active" : ""}`}
                  type="button"
                  onClick={() => setChangelogRegex((value) => !value)}
                  aria-pressed={changelogRegex}
                >
                  {dual("Regex builder", "正規表示式工具", language)}
                </button>
              </div>
              {changelogRegex && (
                <div
                  className="regex-builder"
                  role="region"
                  aria-label="Changelog regex builder"
                >
                  <strong>JavaScript RegExp · i</strong>
                  <p>
                    {changelogPatternError ||
                      dual(
                        "The changelog search field is the regex pattern. Disable this builder to return to plain text.",
                        "更新記錄搜尋欄就係 regex pattern；關閉工具就返純文字。",
                        language,
                      )}
                  </p>
                </div>
              )}
            </div>
            <div className="changelog-filters">
              <label>
                {dual("From date", "開始日期", language)}
                <input
                  type="date"
                  value={changelogFrom}
                  onChange={(e) => setChangelogFrom(e.target.value)}
                />
              </label>
              <label>
                {dual("To date", "結束日期", language)}
                <input
                  type="date"
                  value={changelogTo}
                  onChange={(e) => setChangelogTo(e.target.value)}
                />
              </label>
              <button
                className="outlined-button"
                type="button"
                disabled={!filteredChangelog.length}
                onClick={copyChangelog}
              >
                {dual("Copy filtered view", "複製篩選結果", language)}
              </button>
              <button
                className="filled-button"
                type="button"
                disabled={!filteredChangelog.length}
                onClick={exportChangelog}
              >
                {dual("Export Markdown", "匯出 Markdown", language)}
              </button>
            </div>
            {!filteredChangelog.length ? (
              <div className="empty-state" role="status">
                {dual(
                  "No published release matches the current text and ISO date range.",
                  "冇已發佈版本符合目前文字同 ISO 日期範圍。",
                  language,
                )}
              </div>
            ) : (
              <div className="changelog-list">
                {filteredChangelog.map((entry) => (
                  <article className="setting-card" key={entry.version}>
                    <div>
                      <small>
                        {entry.date} · {entry.category}
                      </small>
                      <h2>{entry.version}</h2>
                      <p>{entry.summary}</p>
                      <a
                        href={`https://github.com/Ding-Ding-Projects/material-winforge/commit/${entry.sha}`}
                      >
                        {entry.sha.slice(0, 12)}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        )}
        {settingsGridTarget &&
          createPortal(
            <div
              id="site-project-settings"
              hidden={!settingsVisible("ownership")}
              tabIndex={-1}
            >
              <SettingCard
                title={dual(
                  "Global defaults and project overrides",
                  "全域預設同 project 覆寫",
                  language,
                )}
                description={dual(
                  "Every site presentation preference resolves from Global defaults plus sparse overrides for the active local project.",
                  "所有網站顯示偏好都由全域預設加 active 本機 project 嘅稀疏覆寫計出。",
                  language,
                )}
                provenance={
                  activeSettingsProject
                    ? `${overrideCount} overrides · ${SITE_SETTING_KEYS.length - overrideCount} inherited`
                    : dual("Editing Global defaults", "編輯全域預設", language)
                }
              >
                <div className="project-settings-controls">
                  <div className="project-search">
                    <input
                      value={projectQuery}
                      maxLength={128}
                      onChange={(event) => setProjectQuery(event.target.value)}
                      aria-label="Search local projects"
                      placeholder={dual(
                        "Search projects",
                        "搜尋 projects",
                        language,
                      )}
                    />
                    <button
                      type="button"
                      className={projectRegex ? "active" : ""}
                      onClick={() => setProjectRegex((value) => !value)}
                      aria-pressed={projectRegex}
                    >
                      {dual("Regex builder", "正規表示式工具", language)}
                    </button>
                  </div>
                  {projectRegex && (
                    <small>
                      {projectPatternError || "JavaScript RegExp · i"}
                    </small>
                  )}
                  <div
                    className="project-choice-list"
                    role="listbox"
                    aria-label="Active local project"
                  >
                    {projectChoices.map((project) => (
                      <button
                        type="button"
                        key={project.id ?? "global"}
                        aria-selected={ownership.activeProjectId === project.id}
                        onClick={() => selectSettingsProject(project.id)}
                      >
                        {project.name}
                      </button>
                    ))}
                  </div>
                  {!ownership.projects.length && (
                    <p>
                      {dual(
                        "No local projects exist. No sample project is seeded.",
                        "未有本機 project，亦冇預設假資料。",
                        language,
                      )}
                    </p>
                  )}
                  {ownership.projects.length > 0 &&
                    projectChoices.length === 0 && (
                      <p>
                        {dual(
                          "No project matches this filter. The active project is unchanged.",
                          "冇 project 符合篩選；active project 冇改。",
                          language,
                        )}
                      </p>
                    )}
                  <div className="project-create">
                    <input
                      value={projectName}
                      maxLength={64}
                      onChange={(event) => setProjectName(event.target.value)}
                      aria-label="New local project name"
                      placeholder={dual(
                        "New local project name",
                        "新本機 project 名稱",
                        language,
                      )}
                    />
                    <button type="button" onClick={createSettingsProject}>
                      {dual("Create project", "建立 project", language)}
                    </button>
                  </div>
                  {activeSettingsProject && (
                    <button
                      className="outlined-button"
                      type="button"
                      onClick={resetProjectOverrides}
                    >
                      {dual(
                        "Reset project to Global",
                        "重設 project 到全域",
                        language,
                      )}
                    </button>
                  )}
                  <p>
                    {dual(
                      "The private vocabulary cache is local visitor data and is never copied into project overrides.",
                      "私人詞彙快取只係本機訪客資料，永遠唔會複製入 project 覆寫。",
                      language,
                    )}
                  </p>
                </div>
              </SettingCard>
            </div>,
            settingsGridTarget,
          )}
        {settingsGridTarget &&
          createPortal(
            <>
              <div
                id="emoji-preference"
                hidden={!settingsVisible("emoji")}
                tabIndex={-1}
              >
                <SettingCard
                  title={dual(
                    "Show emojis in dialogs and message boxes",
                    "喺對話框同訊息框顯示 emoji",
                    language,
                  )}
                  description={dual(
                    "Adds non-semantic decoration to site notifications and status cards. Facts and control labels stay unchanged.",
                    "只會喺網站通知同狀態卡加非語意裝飾；事實同控制標籤保持不變。",
                    language,
                  )}
                  provenance={dual(
                    `Current value: ${prefs.showEmojis ? "On" : "Off"}`,
                    `目前值：${prefs.showEmojis ? "開" : "關"}`,
                    language,
                  )}
                >
                  <Segments
                    label="Show emojis in dialogs and message boxes"
                    value={prefs.showEmojis ? "on" : "off"}
                    options={[
                      ["on", dual("On", "開", language)],
                      ["off", dual("Off", "關", language)],
                    ]}
                    onChange={(v) =>
                      update(
                        "showEmojis",
                        v === "on",
                        dual(
                          "Emoji decoration preference updated.",
                          "Emoji 裝飾偏好已更新。",
                          language,
                        ),
                      )
                    }
                  />
                </SettingCard>
              </div>
              <div
                id="site-vocabulary-status"
                hidden={!settingsVisible("vocabulary")}
                tabIndex={-1}
              >
                <SettingCard
                  title={personalText("Personal vocabulary")}
                  description={dual(
                    "Load a bounded local JSON file. Only the documented Settings and toast labels are eligible for exact replacement.",
                    "載入有限度本機 JSON 檔案；只會精確取代文件列明嘅設定同 toast 標籤。",
                    language,
                  )}
                  provenance={
                    vocabStatus === "invalid"
                      ? vocabMessage
                      : prefs.personalVocabulary
                        ? `Loaded locally · ${Object.keys(prefs.personalVocabulary.replacements).length} replacements`
                        : dual(
                            "No local vocabulary file is loaded.",
                            "未載入本機詞彙檔案。",
                            language,
                          )
                  }
                >
                  <div className="vocabulary-controls">
                    <label className="tonal-button">
                      {personalText(
                        prefs.personalVocabulary
                          ? "Replace dictionary"
                          : "Upload dictionary",
                      )}
                      <input
                        id="site-vocabulary-file"
                        type="file"
                        accept="application/json,.json"
                        onChange={loadVocabularyFile}
                        aria-label="Choose a local personal vocabulary JSON file"
                      />
                    </label>
                    <button
                      className="outlined-button"
                      type="button"
                      onClick={clearVocabulary}
                      disabled={!prefs.personalVocabulary}
                      aria-label="Clear personal vocabulary"
                    >
                      {personalText("Clear dictionary")}
                    </button>
                  </div>
                </SettingCard>
              </div>
            </>,
            settingsGridTarget,
          )}
        {settingsGridTarget &&
          createPortal(
            <div
              id="site-logo-settings"
              hidden={!settingsVisible("logo")}
              tabIndex={-1}
            >
              <SettingCard
                title={dual("App logo", "應用程式標誌", language)}
                description={dual(
                  "Choose a shipped treatment of the local brand asset or load one bounded private image. This changes presentation only, never product identity.",
                  "揀本機品牌資產嘅內置樣式，或者載入一張有限度私人圖片。只會改顯示，唔會改產品身份。",
                  language,
                )}
                provenance={
                  logoStatus === "invalid"
                    ? logoMessage
                    : prefs.customLogo
                      ? dual(
                          `Custom image loaded locally · ${logoMessage || "validated"}`,
                          `自訂圖片已喺本機載入 · ${logoMessage || "已驗證"}`,
                          language,
                        )
                      : dual(
                          `Shipped preset: ${prefs.logoPreset}`,
                          `內置預設：${prefs.logoPreset}`,
                          language,
                        )
                }
              >
                <div className="logo-settings-controls">
                  <div
                    className="logo-presets"
                    role="radiogroup"
                    aria-label={dual(
                      "Shipped app logo presets",
                      "內置應用程式標誌預設",
                      language,
                    )}
                  >
                    {(["forge", "tile", "mono"] as LogoPreset[]).map(
                      (preset) => (
                        <button
                          key={preset}
                          type="button"
                          role="radio"
                          aria-checked={
                            !prefs.customLogo && prefs.logoPreset === preset
                          }
                          onClick={() => selectLogoPreset(preset)}
                        >
                          <img
                            src={iconPath}
                            className={`app-logo preset-${preset}`}
                            alt=""
                          />
                          <span>{preset}</span>
                        </button>
                      ),
                    )}
                  </div>
                  <div className="logo-file-actions">
                    <label className="tonal-button">
                      {dual(
                        prefs.customLogo
                          ? "Replace custom logo"
                          : "Choose custom logo",
                        prefs.customLogo ? "取代自訂標誌" : "揀自訂標誌",
                        language,
                      )}
                      <input
                        id="site-logo-file"
                        type="file"
                        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                        onChange={loadLogoFile}
                        aria-label={dual(
                          "Choose a local PNG or JPEG app logo",
                          "揀本機 PNG 或 JPEG 應用程式標誌",
                          language,
                        )}
                      />
                    </label>
                    <button
                      type="button"
                      className="outlined-button"
                      onClick={clearCustomLogo}
                      disabled={
                        !prefs.customLogo && prefs.logoPreset === "forge"
                      }
                    >
                      {dual("Reset shipped mark", "重設原裝標誌", language)}
                    </button>
                  </div>
                  <p
                    className={`logo-status ${logoStatus}`}
                    role={logoStatus === "invalid" ? "alert" : "status"}
                  >
                    {logoStatus === "invalid"
                      ? logoMessage
                      : prefs.customLogo
                        ? dual(
                            "Validated custom logo is active on site brand surfaces.",
                            "已驗證自訂標誌正用於網站品牌位置。",
                            language,
                          )
                        : dual(
                            "No custom logo is loaded.",
                            "未載入自訂標誌。",
                            language,
                          )}
                  </p>
                </div>
              </SettingCard>
            </div>,
            settingsGridTarget,
          )}
        {projectBuilderTarget &&
          createPortal(
            <div className="builder-anchor">
              <button
                type="button"
                className={projectBuilderOpen ? "active" : ""}
                onClick={() => setProjectBuilderOpen((value) => !value)}
                aria-expanded={projectBuilderOpen}
                aria-controls="regex-builder"
              >
                {dual("Regex builder", "正規表示式工具", language)}
              </button>
              {projectBuilderOpen && (
                <RegexBuilder
                  query={projectQuery}
                  setQuery={setProjectQuery}
                  regexMode={projectRegex}
                  setRegexMode={setProjectRegex}
                  flags={projectFlags}
                  setFlags={setProjectFlags}
                  error={projectPatternError}
                  sample={projectSample}
                  setSample={setProjectSample}
                  matches={projectMatches}
                  announce={announce}
                  close={() => setProjectBuilderOpen(false)}
                />
              )}
            </div>,
            projectBuilderTarget,
          )}
      </div>
      <footer>
        <span>WinForge · Material 3 Preview</span>
        <span>
          {dual(
            "Site preferences stay in this browser.",
            "網站偏好留喺呢個瀏覽器。",
            language,
          )}
        </span>
        <a href="https://github.com/Ding-Ding-Projects/material-winforge">
          GitHub
        </a>
      </footer>
      <button
        className="notification-center-button"
        type="button"
        onClick={openNotifications}
        aria-label={dual(
          `Open notification center, ${unreadCount} unread`,
          `開啟通知中心，${unreadCount} 個未讀`,
          language,
        )}
      >
        <span aria-hidden="true">●</span>
        <span>{dual("Notifications", "通知", language)}</span>
        {unreadCount > 0 && <strong>{unreadCount}</strong>}
      </button>
      {activeTab === "settings" && (
        <button
          className="settings-history-button"
          type="button"
          onClick={() => setSettingsHistoryOpen(true)}
        >
          {dual("Settings history", "設定記錄", language)}{" "}
          <strong>{settingsHistory.records.length}</strong>
        </button>
      )}
      {settingsHistoryOpen && (
        <SettingsHistoryCenter
          language={language}
          records={filteredSettingsHistory}
          total={settingsHistory.records.length}
          actions={settingsHistoryActions}
          actionCounts={settingsHistoryActionCounts}
          action={settingsHistoryAction}
          setAction={setSettingsHistoryAction}
          query={settingsHistoryQuery}
          setQuery={setSettingsHistoryQuery}
          regexMode={settingsHistoryRegex}
          setRegexMode={setSettingsHistoryRegex}
          builderOpen={settingsHistoryBuilderOpen}
          setBuilderOpen={setSettingsHistoryBuilderOpen}
          flags={settingsHistoryFlags}
          setFlags={setSettingsHistoryFlags}
          error={settingsHistoryPatternError}
          sample={settingsHistorySample}
          setSample={setSettingsHistorySample}
          matches={settingsHistoryMatches}
          from={settingsHistoryFrom}
          setFrom={setSettingsHistoryFrom}
          to={settingsHistoryTo}
          setTo={setSettingsHistoryTo}
          restoreId={settingsRestoreId}
          setRestoreId={setSettingsRestoreId}
          restore={restoreSettingsRecord}
          exportMarkdown={exportSettingsHistory}
          close={() => setSettingsHistoryOpen(false)}
          announce={announce}
        />
      )}
      {resetConfirmOpen && (
        <ResetSettingsConfirmation
          language={language}
          keySettings={resetKeySettings}
          setKeySettings={setResetKeySettings}
          keyProjects={resetKeyProjects}
          setKeyProjects={setResetKeyProjects}
          slider={resetSlider}
          setSlider={advanceResetSlider}
          complete={resetComplete}
          cancel={closeResetConfirmation}
        />
      )}
      {bulkCloseConfirmOpen && (
        <BulkCloseConfirmation
          language={language}
          mode={bulkCloseMode ?? "contains"}
          query={bulkCloseQuery}
          includePinned={bulkCloseIncludePinned}
          tabs={bulkCloseAffected
            .map((id) => TABS.find((tab) => tab.id === id))
            .filter((tab): tab is (typeof TABS)[number] => Boolean(tab))}
          keyTabs={bulkCloseKeyTabs}
          setKeyTabs={(value) => {
            setBulkCloseKeyTabs(value);
            setBulkCloseSlider(0);
          }}
          keyPinned={bulkCloseKeyPinned}
          setKeyPinned={(value) => {
            setBulkCloseKeyPinned(value);
            setBulkCloseSlider(0);
          }}
          slider={bulkCloseSlider}
          setSlider={advanceBulkCloseSlider}
          complete={bulkCloseComplete}
          completedCount={bulkCloseCompletedCount}
          cancel={closeBulkCloseConfirmation}
        />
      )}
      {notificationOpen && (
        <NotificationCenter
          language={language}
          showEmojis={prefs.showEmojis}
          records={filteredNotifications}
          total={notificationHistory.records.length}
          query={notificationQuery}
          setQuery={setNotificationQuery}
          regexMode={notificationRegex}
          setRegexMode={setNotificationRegex}
          builderOpen={notificationBuilderOpen}
          setBuilderOpen={setNotificationBuilderOpen}
          flags={notificationFlags}
          setFlags={setNotificationFlags}
          error={notificationPatternError}
          sample={notificationSample}
          setSample={setNotificationSample}
          matches={notificationMatches}
          selected={selectedFilteredNotifications}
          setSelected={setSelectedNotifications}
          selectAll={selectFilteredNotifications}
          invert={invertFilteredNotifications}
          dismiss={dismissSelectedNotifications}
          exportMarkdown={exportNotifications}
          close={() => setNotificationOpen(false)}
          announce={announce}
        />
      )}
      {paletteOpen && (
        <div
          className="dialog-scrim"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closePalette();
          }}
        >
          <section
            ref={paletteDialog}
            className="command-palette"
            role="dialog"
            aria-modal="true"
            aria-labelledby="palette-title"
            tabIndex={-1}
          >
            <header>
              <div>
                <span className="eyebrow">Ctrl+Shift+F</span>
                <h2 id="palette-title">
                  {dual("Command palette", "指令選單", language)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => closePalette()}
                aria-label={dual(
                  "Close command palette",
                  "關閉指令選單",
                  language,
                )}
              >
                ×
              </button>
            </header>
            <div className="palette-search-row">
              <label className="palette-search">
                <span aria-hidden="true">⌕</span>
                <input
                  autoFocus
                  maxLength={128}
                  value={paletteQuery}
                  onChange={(event) => setPaletteQuery(event.target.value)}
                  placeholder={dual(
                    "Search destinations and settings",
                    "搜尋目的地同設定",
                    language,
                  )}
                  aria-invalid={Boolean(palettePatternError)}
                />
              </label>
              <div className="builder-anchor">
                <button
                  type="button"
                  className={paletteRegex ? "active" : ""}
                  onClick={() => setPaletteBuilderOpen((value) => !value)}
                  aria-expanded={paletteBuilderOpen}
                  aria-controls="regex-builder"
                >
                  {dual("Regex builder", "正規表示式工具", language)}
                </button>
                {paletteBuilderOpen && (
                  <RegexBuilder
                    query={paletteQuery}
                    setQuery={setPaletteQuery}
                    regexMode={paletteRegex}
                    setRegexMode={setPaletteRegex}
                    flags={paletteFlags}
                    setFlags={setPaletteFlags}
                    error={palettePatternError}
                    sample={paletteSample}
                    setSample={setPaletteSample}
                    matches={paletteMatches}
                    announce={announce}
                    close={() => setPaletteBuilderOpen(false)}
                  />
                )}
              </div>
            </div>
            <div className="palette-search-meta" aria-live="polite">
              <span>
                {paletteRegex
                  ? `JavaScript RegExp /${paletteQuery}/${paletteFlags.i ? "i" : ""}${paletteFlags.m ? "m" : ""}`
                  : dual("Plain-text search", "純文字搜尋", language)}
              </span>
              <strong>
                {palettePatternError ||
                  `${filteredCommands.length} ${dual("commands", "個指令", language)}`}
              </strong>
            </div>
            <div className="command-list">
              {filteredCommands.map((command) => (
                <div
                  className={`command-row ${command.control ? "has-control" : ""}`}
                  key={command.id}
                >
                  <button
                    className="command-destination"
                    type="button"
                    onClick={() => {
                      closePalette();
                      command.action();
                    }}
                  >
                    <span>
                      <strong>{command.label}</strong>
                      <small>{command.detail}</small>
                    </span>
                    <span aria-hidden="true">↵</span>
                  </button>
                  {command.control && (
                    <div className="command-inline-control">
                      {command.control}
                    </div>
                  )}
                </div>
              ))}
              {!filteredCommands.length && (
                <p className="palette-empty">
                  {dual("No commands match.", "冇相符指令。", language)}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
      <div
        className={`snackbar ${toast ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {prefs.showEmojis && <span aria-hidden="true">✅</span>}
        <span>{toast}</span>
        {toast && (
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        )}
      </div>
    </main>
  );
}

function Panel({ id, children }: { id: TabId; children: ReactNode }) {
  return (
    <section
      id={`panel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      tabIndex={-1}
      className="page-panel"
    >
      {children}
    </section>
  );
}
function PageHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  );
}
function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <article className="feature-card">
      <span className="feature-icon" aria-hidden="true">
        {icon}
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
function DocSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="doc-section">
      <h3>{title}</h3>
      <p>{children}</p>
    </section>
  );
}
function SettingCard({
  id,
  hidden = false,
  title,
  description,
  provenance,
  children,
}: {
  id?: string;
  hidden?: boolean;
  title: string;
  description: string;
  provenance: string;
  children: ReactNode;
}) {
  return (
    <article
      id={id}
      className="setting-card"
      hidden={hidden}
      tabIndex={id ? -1 : undefined}
    >
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
        <small>{provenance}</small>
      </div>
      {children}
    </article>
  );
}
function Segments({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[][];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="segmented-control" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          className={value === v ? "selected" : ""}
          onClick={() => onChange(v)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
function Range({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="range-control">
      <span>1 · Serious</span>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <span>5 · Playful</span>
      <output>{value}</output>
    </label>
  );
}
function ResetSettingsConfirmation({
  language,
  keySettings,
  setKeySettings,
  keyProjects,
  setKeyProjects,
  slider,
  setSlider,
  complete,
  completedCount,
  cancel,
}: {
  language: LanguageMode;
  keySettings: boolean;
  setKeySettings: (value: boolean) => void;
  keyProjects: boolean;
  setKeyProjects: (value: boolean) => void;
  slider: number;
  setSlider: (value: number) => void;
  complete: boolean;
  completedCount: number;
  cancel: () => void;
}) {
  const armed = keySettings && keyProjects;
  return (
    <div
      className="dialog-scrim reset-confirm-scrim"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) cancel();
      }}
    >
      <section
        className={`reset-confirmation ${complete ? "complete" : ""}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-confirm-title"
        aria-describedby="reset-confirm-impact"
      >
        <header>
          <div>
            <span className="eyebrow">
              {dual("Destructive local action", "破壞性本機操作", language)}
            </span>
            <h2 id="reset-confirm-title">
              {complete
                ? dual("Reset complete", "重設完成", language)
                : dual("Reset site settings?", "重設網站設定？", language)}
            </h2>
          </div>
          <button
            type="button"
            autoFocus
            onClick={cancel}
            aria-label={dual("Emergency exit", "緊急離開", language)}
          >
            ×
          </button>
        </header>
        {complete ? (
          <div className="reset-completion" role="status" aria-live="polite">
            <span aria-hidden="true">✓</span>
            <p>
              {dual(
                "All eight presentation settings and Global/project ownership returned to shipped defaults. Personal vocabulary and the app logo were preserved. A settings-history event recorded the reset.",
                "八個顯示設定同全域／project 擁有權已回復原裝預設。個人詞彙同應用程式標誌獲保留，設定記錄亦已記低今次重設。",
                language,
              )}
            </p>
            <button type="button" className="filled-button" onClick={cancel}>
              {dual("Close", "關閉", language)}
            </button>
          </div>
        ) : (
          <>
            <p id="reset-confirm-impact">
              {dual(
                "This replaces all eight site presentation settings with shipped defaults and permanently removes every local project plus its sparse overrides. Personal vocabulary and the app logo are preserved. Notification and settings history remain.",
                "呢個操作會將八個網站顯示設定換返原裝預設，並永久移除所有本機 project 同稀疏覆寫。個人詞彙同應用程式標誌會保留；通知同設定記錄亦會保留。",
                language,
              )}
            </p>
            <div className="reset-keys">
              <label>
                <input
                  type="checkbox"
                  checked={keySettings}
                  onChange={(event) => {
                    setKeySettings(event.target.checked);
                    setSlider(0);
                  }}
                />
                <span>
                  <strong>
                    {dual("Key 1 · Settings", "鎖匙 1 · 設定", language)}
                  </strong>
                  <small>
                    {dual(
                      "I understand all eight effective presentation values will reset.",
                      "我明白八個有效顯示值會重設。",
                      language,
                    )}
                  </small>
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={keyProjects}
                  onChange={(event) => {
                    setKeyProjects(event.target.checked);
                    setSlider(0);
                  }}
                />
                <span>
                  <strong>
                    {dual("Key 2 · Projects", "鎖匙 2 · Projects", language)}
                  </strong>
                  <small>
                    {dual(
                      "I understand every local project and override will be removed.",
                      "我明白所有本機 project 同覆寫會被移除。",
                      language,
                    )}
                  </small>
                </span>
              </label>
            </div>
            <label className={`reset-slider ${armed ? "armed" : ""}`}>
              <span>
                {armed
                  ? dual(
                      "Slide fully to authorize reset",
                      "推到最盡先授權重設",
                      language,
                    )
                  : dual(
                      "Complete both keys to unlock the slider",
                      "完成兩條鎖匙先可以解鎖滑桿",
                      language,
                    )}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={slider}
                disabled={!armed}
                onChange={(event) => setSlider(Number(event.target.value))}
                aria-label={dual(
                  "Reset authorization slider",
                  "重設授權滑桿",
                  language,
                )}
                aria-valuetext={`${slider}%`}
              />
              <output>{slider}%</output>
              <span className="reset-progress" aria-hidden="true">
                <i style={{ width: `${slider}%` }} />
              </span>
            </label>
            <button type="button" className="emergency-button" onClick={cancel}>
              {dual("Emergency exit · Cancel", "緊急離開 · 取消", language)}
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function BulkCloseConfirmation({
  language,
  mode,
  query,
  includePinned,
  tabs,
  keyTabs,
  setKeyTabs,
  keyPinned,
  setKeyPinned,
  slider,
  setSlider,
  complete,
  cancel,
}: {
  language: LanguageMode;
  mode: BulkCloseMode;
  query: string;
  includePinned: boolean;
  tabs: Array<(typeof TABS)[number]>;
  keyTabs: boolean;
  setKeyTabs: (value: boolean) => void;
  keyPinned: boolean;
  setKeyPinned: (value: boolean) => void;
  slider: number;
  setSlider: (value: number) => void;
  complete: boolean;
  cancel: () => void;
}) {
  const armed = keyTabs && keyPinned;
  const actionEn =
    mode === "contains" ? "Close tabs containing text" : "Close tabs not containing text";
  const actionYue =
    mode === "contains" ? "關閉包含文字嘅分頁" : "關閉唔包含文字嘅分頁";
  return (
    <div
      className="dialog-scrim bulk-close-scrim"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) cancel();
      }}
    >
      <section
        className={`reset-confirmation bulk-close-confirmation ${complete ? "complete" : ""}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bulk-close-confirm-title"
        aria-describedby="bulk-close-confirm-impact"
      >
        <header>
          <div>
            <span className="eyebrow">
              {dual("Destructive tab action", "破壞性分頁操作", language)}
            </span>
            <h2 id="bulk-close-confirm-title">
              {complete
                ? dual("Tabs closed", "分頁已關閉", language)
                : dual("Close matching tabs?", "關閉符合條件嘅分頁？", language)}
            </h2>
          </div>
          <button
            type="button"
            autoFocus
            onClick={cancel}
            aria-label={dual("Emergency exit", "緊急離開", language)}
          >
            ×
          </button>
        </header>
        {complete ? (
          <div className="reset-completion" role="status" aria-live="polite">
            <span aria-hidden="true">✓</span>
            <p>
              {dual(
                `${completedCount} tabs were closed. The current tab stayed open, and pinned tabs were ${includePinned ? "included by your explicit choice" : "protected by default"}.`,
                `已關閉 ${completedCount} 個分頁。目前分頁保留，釘選分頁${includePinned ? "按你明確選擇而包括" : "按預設獲保護"}。`,
                language,
              )}
            </p>
            <button type="button" className="filled-button" onClick={cancel}>
              {dual("Close", "關閉", language)}
            </button>
          </div>
        ) : (
          <>
            <p id="bulk-close-confirm-impact">
              {dual(
                `${actionEn} for “${query}” will close exactly ${tabs.length} eligible tabs. The current tab stays open. Any future unsaved-work prompt still applies per tab.`,
                `${actionYue}「${query}」會關閉確實 ${tabs.length} 個合資格分頁。目前分頁保留；日後每個分頁嘅未保存工作提示照樣適用。`,
                language,
              )}
            </p>
            <ul className="bulk-close-preview" aria-label={dual("Tabs to close", "將會關閉嘅分頁", language)}>
              {tabs.slice(0, 8).map((tab) => (
                <li key={tab.id}>{dual(tab.en, tab.yue, language)}</li>
              ))}
              {tabs.length > 8 && (
                <li>
                  {dual(
                    `and ${tabs.length - 8} more`,
                    `仲有 ${tabs.length - 8} 個`,
                    language,
                  )}
                </li>
              )}
            </ul>
            <div className="reset-keys">
              <label>
                <input
                  type="checkbox"
                  checked={keyTabs}
                  onChange={(event) => setKeyTabs(event.target.checked)}
                />
                <span>
                  <strong>{dual("Key 1 · Tabs", "鎖匙 1 · 分頁", language)}</strong>
                  <small>
                    {dual(
                      `I understand ${tabs.length} named tabs will close.`,
                      `我明白會關閉 ${tabs.length} 個列明嘅分頁。`,
                      language,
                    )}
                  </small>
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={keyPinned}
                  onChange={(event) => setKeyPinned(event.target.checked)}
                />
                <span>
                  <strong>{dual("Key 2 · Protection", "鎖匙 2 · 保護", language)}</strong>
                  <small>
                    {dual(
                      includePinned
                        ? "I understand my explicit choice includes pinned tabs."
                        : "I understand pinned tabs remain protected by default.",
                      includePinned
                        ? "我明白自己明確選擇包括釘選分頁。"
                        : "我明白釘選分頁按預設會受保護。",
                      language,
                    )}
                  </small>
                </span>
              </label>
            </div>
            <label className={`reset-slider ${armed ? "armed" : ""}`}>
              <span>
                {armed
                  ? dual("Slide fully to authorize closing", "推到最盡先授權關閉", language)
                  : dual("Complete both keys to unlock the slider", "完成兩條鎖匙先可以解鎖滑桿", language)}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={slider}
                disabled={!armed}
                onChange={(event) => setSlider(Number(event.target.value))}
                aria-label={dual("Bulk close authorization slider", "批量關閉授權滑桿", language)}
                aria-valuetext={`${slider}%`}
              />
              <output>{slider}%</output>
              <span className="reset-progress" aria-hidden="true">
                <i style={{ width: `${slider}%` }} />
              </span>
            </label>
            <button type="button" className="emergency-button" onClick={cancel}>
              {dual("Emergency exit · Cancel", "緊急離開 · 取消", language)}
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function GroupAppearanceEditor({
  id,
  language,
  group,
  update,
  close,
}: {
  id: string;
  language: LanguageMode;
  group: TabGroup;
  update: (groupId: string, patch: Partial<TabGroupAppearance>) => boolean;
  close: () => void;
}) {
  return (
    <section
      id={id}
      className="group-appearance-editor"
      role="region"
      aria-labelledby={`${id}-title`}
    >
      <header>
        <div>
          <span className="eyebrow">
            {dual("Bounded group appearance", "有限群組外觀", language)}
          </span>
          <h3 id={`${id}-title`}>
            {dual(`${group.name} appearance`, `${group.name} 外觀`, language)}
          </h3>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={dual("Close group appearance", "關閉群組外觀", language)}
        >
          ×
        </button>
      </header>
      <label>
        <span>{dual("Group icon", "群組圖示", language)}</span>
        <input
          value={group.appearance.icon}
          maxLength={2}
          onChange={(event) => update(group.id, { icon: event.target.value.slice(0, 2) })}
          aria-label={dual("Group icon", "群組圖示", language)}
        />
      </label>
      <label>
        <span>{dual("Text color", "文字顏色", language)}</span>
        <input
          type="color"
          value={group.appearance.textColor}
          onChange={(event) => update(group.id, { textColor: event.target.value })}
          aria-label={dual("Group text color", "群組文字顏色", language)}
        />
      </label>
      <label>
        <span>{dual("Background color", "背景顏色", language)}</span>
        <input
          type="color"
          value={group.appearance.backgroundColor}
          onChange={(event) => update(group.id, { backgroundColor: event.target.value })}
          aria-label={dual("Group background color", "群組背景顏色", language)}
        />
      </label>
      <div
        className="group-appearance-preview"
        style={{
          color: group.appearance.textColor,
          background: group.appearance.backgroundColor,
        }}
        aria-label={dual("Group appearance preview", "群組外觀預覽", language)}
      >
        <span aria-hidden="true">{group.appearance.icon}</span>
        <strong>{group.name}</strong>
      </div>
      <p className="supporting-copy">
        {dual(
          "This bounded editor changes the icon and two colors locally; full typography and color translation remain separate work.",
          "呢個有限編輯器只改本機圖示同兩種顏色；完整字體同顏色轉換另有工作。",
          language,
        )}
      </p>
      <button
        type="button"
        onClick={() => update(group.id, { ...DEFAULT_GROUP_APPEARANCE })}
      >
        {dual("Reset group appearance", "重設群組外觀", language)}
      </button>
    </section>
  );
}

function SettingsHistoryCenter({
  language,
  records,
  total,
  actions,
  actionCounts,
  action,
  setAction,
  query,
  setQuery,
  regexMode,
  setRegexMode,
  builderOpen,
  setBuilderOpen,
  flags,
  setFlags,
  error,
  sample,
  setSample,
  matches,
  from,
  setFrom,
  to,
  setTo,
  restoreId,
  setRestoreId,
  restore,
  exportMarkdown,
  close,
  announce,
}: {
  language: LanguageMode;
  records: SettingsHistoryRecord[];
  total: number;
  actions: SettingsHistoryAction[];
  actionCounts: Record<SettingsHistoryAction, number>;
  action: SettingsHistoryAction | "all";
  setAction: (value: SettingsHistoryAction | "all") => void;
  query: string;
  setQuery: (value: string) => void;
  regexMode: boolean;
  setRegexMode: (value: boolean) => void;
  builderOpen: boolean;
  setBuilderOpen: (value: boolean) => void;
  flags: { i: boolean; m: boolean };
  setFlags: (value: { i: boolean; m: boolean }) => void;
  error: string;
  sample: string;
  setSample: (value: string) => void;
  matches: RegExpMatchArray[];
  from: string;
  setFrom: (value: string) => void;
  to: string;
  setTo: (value: string) => void;
  restoreId: string | null;
  setRestoreId: (value: string | null) => void;
  restore: () => void;
  exportMarkdown: () => void;
  close: () => void;
  announce: (value: string) => void;
}) {
  const selected = records.find((record) => record.id === restoreId);
  return (
    <div className="dialog-scrim settings-history-scrim" role="presentation">
      <section
        className="settings-history-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-history-title"
      >
        <header>
          <div>
            <span className="eyebrow">
              {dual("Private browser revisions", "私人瀏覽器版本", language)}
            </span>
            <h2 id="settings-history-title">
              {dual("Settings history", "設定記錄", language)}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={dual(
              "Close settings history",
              "關閉設定記錄",
              language,
            )}
          >
            ×
          </button>
        </header>
        <div className="settings-history-search">
          <label>
            <span>{dual("Search history", "搜尋記錄", language)}</span>
            <input
              autoFocus
              maxLength={128}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="builder-anchor">
            <button
              type="button"
              className={regexMode ? "active" : ""}
              onClick={() => setBuilderOpen(!builderOpen)}
              aria-expanded={builderOpen}
              aria-controls="regex-builder"
            >
              {dual("Regex builder", "正規表示式工具", language)}
            </button>
            {builderOpen && (
              <RegexBuilder
                query={query}
                setQuery={setQuery}
                regexMode={regexMode}
                setRegexMode={setRegexMode}
                flags={flags}
                setFlags={setFlags}
                error={error}
                sample={sample}
                setSample={setSample}
                matches={matches}
                announce={announce}
                close={() => setBuilderOpen(false)}
              />
            )}
          </div>
        </div>
        <div className="settings-history-filters">
          <label>
            {dual("From ISO date", "由 ISO 日期", language)}
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <label>
            {dual("To ISO date", "至 ISO 日期", language)}
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
          <label>
            {dual("Action", "操作", language)}
            <select
              value={action}
              onChange={(event) =>
                setAction(event.target.value as SettingsHistoryAction | "all")
              }
            >
              <option value="all">
                {dual("All stored actions", "所有已存操作", language)}
              </option>
              {actions.map((value) => (
                <option key={value} value={value}>
                  {value} ({actionCounts[value]})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="outlined-button"
            onClick={exportMarkdown}
            disabled={!records.length}
          >
            {dual("Export filtered Markdown", "匯出已篩選 Markdown", language)}
          </button>
        </div>
        <p aria-live="polite">
          {dual(
            `${records.length} shown · ${total} stored locally`,
            `顯示 ${records.length} 個 · 本機儲存 ${total} 個`,
            language,
          )}
        </p>
        <div className="settings-history-list">
          {total === 0 ? (
            <div className="empty-state" role="status">
              {dual(
                "No settings changes have been recorded yet.",
                "暫時未有設定變更記錄。",
                language,
              )}
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state" role="status">
              {dual(
                "No settings revision matches these filters.",
                "冇設定版本符合呢啲篩選。",
                language,
              )}
            </div>
          ) : (
            records.map((record) => (
              <article key={record.id}>
                <div>
                  <strong>{record.label}</strong>
                  <small>
                    {record.timestamp} · {record.action}
                  </small>
                  <span>
                    {record.effective.language} · {record.effective.theme} ·{" "}
                    {record.effective.density} · {record.effective.dock}
                  </span>
                </div>
                <button type="button" onClick={() => setRestoreId(record.id)}>
                  {dual("Restore", "還原", language)}
                </button>
              </article>
            ))
          )}
        </div>
        <footer>
          <span>
            {dual(
              "Personal vocabulary and source paths are never recorded; validated logo state stays local.",
              "個人詞彙同來源路徑永遠唔會記錄；已驗證標誌狀態只留本機。",
              language,
            )}
          </span>
          <button type="button" className="outlined-button" onClick={close}>
            {dual("Close", "關閉", language)}
          </button>
        </footer>
        {selected && (
          <div
            className="restore-confirmation"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="restore-settings-title"
          >
            <h3 id="restore-settings-title">
              {dual(
                "Restore this settings revision?",
                "還原呢個設定版本？",
                language,
              )}
            </h3>
            <p>
              {dual(
                `Current site presentation, app logo, and project ownership will be replaced by “${selected.label}”. A new restore event will preserve this action in history.`,
                `目前網站顯示、應用程式標誌同 project 擁有權會由「${selected.label}」取代；還原操作會另存一個新記錄。`,
                language,
              )}
            </p>
            <div>
              <button
                type="button"
                className="outlined-button"
                onClick={() => setRestoreId(null)}
              >
                {dual("Cancel", "取消", language)}
              </button>
              <button type="button" className="filled-button" onClick={restore}>
                {dual("Confirm restore", "確認還原", language)}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function NotificationCenter({
  language,
  showEmojis,
  records,
  total,
  query,
  setQuery,
  regexMode,
  setRegexMode,
  builderOpen,
  setBuilderOpen,
  flags,
  setFlags,
  error,
  sample,
  setSample,
  matches,
  selected,
  setSelected,
  selectAll,
  invert,
  dismiss,
  exportMarkdown,
  close,
  announce,
}: {
  language: LanguageMode;
  showEmojis: boolean;
  records: NotificationRecord[];
  total: number;
  query: string;
  setQuery: (value: string) => void;
  regexMode: boolean;
  setRegexMode: (value: boolean) => void;
  builderOpen: boolean;
  setBuilderOpen: (value: boolean) => void;
  flags: { i: boolean; m: boolean };
  setFlags: (value: { i: boolean; m: boolean }) => void;
  error: string;
  sample: string;
  setSample: (value: string) => void;
  matches: RegExpMatchArray[];
  selected: string[];
  setSelected: (value: string[]) => void;
  selectAll: () => void;
  invert: () => void;
  dismiss: () => void;
  exportMarkdown: () => void;
  close: () => void;
  announce: (value: string) => void;
}) {
  const selectedSet = new Set(selected);
  const emoji = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  } as const;
  return (
    <div
      className="dialog-scrim notification-scrim"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) close();
      }}
    >
      <section
        className="notification-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-center-title"
      >
        <header>
          <div>
            <span className="eyebrow">
              {dual("Local browser history", "本機瀏覽器記錄", language)}
            </span>
            <h2 id="notification-center-title">
              {dual("Notification center", "通知中心", language)}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={dual(
              "Close notification center",
              "關閉通知中心",
              language,
            )}
          >
            ×
          </button>
        </header>
        <div className="notification-search">
          <label htmlFor="notification-search">
            <span aria-hidden="true">⌕</span>
            <input
              id="notification-search"
              autoFocus
              maxLength={128}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={dual(
                "Search notification history",
                "搜尋通知記錄",
                language,
              )}
            />
          </label>
          <div className="builder-anchor">
            <button
              type="button"
              className={regexMode ? "active" : ""}
              onClick={() => setBuilderOpen(!builderOpen)}
              aria-expanded={builderOpen}
              aria-controls="regex-builder"
            >
              {dual("Regex builder", "正規表示式工具", language)}
            </button>
            {builderOpen && (
              <RegexBuilder
                query={query}
                setQuery={setQuery}
                regexMode={regexMode}
                setRegexMode={setRegexMode}
                flags={flags}
                setFlags={setFlags}
                error={error}
                sample={sample}
                setSample={setSample}
                matches={matches}
                announce={announce}
                close={() => setBuilderOpen(false)}
              />
            )}
          </div>
        </div>
        <div
          className="notification-bulk"
          aria-label={dual(
            "Notification bulk actions",
            "通知批量操作",
            language,
          )}
        >
          <button type="button" onClick={selectAll} disabled={!records.length}>
            {dual("Select all this page", "揀晒呢頁", language)}
          </button>
          <button type="button" onClick={invert} disabled={!records.length}>
            {dual("Inverse selection", "反轉選擇", language)}
          </button>
          <button type="button" onClick={dismiss} disabled={!selected.length}>
            {dual(
              `Dismiss selected (${selected.length})`,
              `移除已選 (${selected.length})`,
              language,
            )}
          </button>
          <button
            type="button"
            onClick={exportMarkdown}
            disabled={!records.length}
          >
            {dual("Export filtered Markdown", "匯出已篩選 Markdown", language)}
          </button>
        </div>
        <p className="notification-count" aria-live="polite">
          {dual(
            `${records.length} shown · ${total} stored locally`,
            `顯示 ${records.length} 個 · 本機儲存 ${total} 個`,
            language,
          )}
        </p>
        <div className="notification-list">
          {total === 0 ? (
            <div className="empty-state" role="status">
              {dual(
                "No notifications have been recorded yet.",
                "暫時未有通知記錄。",
                language,
              )}
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state" role="status">
              {dual(
                "No notification matches this search.",
                "冇通知符合呢個搜尋。",
                language,
              )}
            </div>
          ) : (
            records.map((record) => (
              <label
                className={`notification-row ${record.kind}`}
                key={record.id}
              >
                <input
                  type="checkbox"
                  checked={selectedSet.has(record.id)}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? [...selected, record.id]
                        : selected.filter((id) => id !== record.id),
                    )
                  }
                  aria-label={dual(
                    `Select ${record.title}`,
                    `選擇 ${record.title}`,
                    language,
                  )}
                />
                {showEmojis && (
                  <span className="notification-emoji" aria-hidden="true">
                    {emoji[record.kind]}
                  </span>
                )}
                <span>
                  <strong>{record.title}</strong>
                  <small>{new Date(record.timestamp).toLocaleString()}</small>
                  <span>{record.body}</span>
                </span>
              </label>
            ))
          )}
        </div>
        <footer>
          <span>
            {dual(
              "History is capped at 100 local records.",
              "記錄最多保留 100 個本機項目。",
              language,
            )}
          </span>
          <button type="button" className="outlined-button" onClick={close}>
            {dual("Close", "關閉", language)}
          </button>
        </footer>
      </section>
    </div>
  );
}

function StatusCard({
  state,
  label,
  value,
  detail,
}: {
  state: "success" | "waiting" | "error" | "info";
  label: string;
  value: string;
  detail: string;
}) {
  const symbol = { success: "✓", waiting: "○", error: "!", info: "i" }[state];
  const emoji = { success: "✅", waiting: "⏳", error: "❌", info: "ℹ️" }[
    state
  ];
  return (
    <article className={`status-card ${state}`}>
      <span className="status-symbol" aria-hidden="true">
        {symbol}
      </span>
      <span className="emoji-decoration" aria-hidden="true">
        {emoji}
      </span>
      <div>
        <small>{label}</small>
        <h2>{value}</h2>
        <p>{detail}</p>
      </div>
    </article>
  );
}
function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={mono ? "mono" : ""}>{value}</dd>
    </div>
  );
}

function RegexBuilder({
  builderId = "regex-builder",
  language = "en",
  query,
  setQuery,
  regexMode,
  setRegexMode,
  flags,
  setFlags,
  error,
  sample,
  setSample,
  matches,
  announce,
  close,
}: {
  builderId?: string;
  language?: LanguageMode;
  query: string;
  setQuery: (v: string) => void;
  regexMode: boolean;
  setRegexMode: (v: boolean) => void;
  flags: { i: boolean; m: boolean };
  setFlags: (v: { i: boolean; m: boolean }) => void;
  error: string;
  sample: string;
  setSample: (v: string) => void;
  matches: RegExpMatchArray[];
  announce: (v: string) => void;
  close: () => void;
}) {
  const insert = (token: string) => {
    setQuery(`${query}${token}`);
    setRegexMode(true);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `/${query}/${flags.i ? "i" : ""}${flags.m ? "m" : ""}`,
      );
      announce(
        dual("Regular expression copied.", "正規表示式已複製。", language),
      );
    } catch {
      announce(
        dual(
          "Clipboard access was unavailable.",
          "剪貼簿暫時用唔到。",
          language,
        ),
      );
    }
  };
  const tokens = [
    [dual("Literal", "文字", language), "text"],
    [dual("Class", "字元組", language), "[a-z]"],
    [dual("Start", "開頭", language), "^"],
    [dual("End", "結尾", language), "$"],
    [dual("Group", "群組", language), "(text)"],
    [dual("Either", "或者", language), "a|b"],
    [dual("One+", "一個以上", language), "+"],
    [dual("Optional", "可選", language), "?"],
  ];
  return (
    <section
      id={builderId}
      className="regex-builder"
      aria-label={dual(
        "Regular expression builder",
        "正規表示式工具",
        language,
      )}
    >
      <header>
        <div>
          <span className="eyebrow">JavaScript RegExp</span>
          <h2>{dual("Regex builder", "正規表示式工具", language)}</h2>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={dual(
            "Close regex builder",
            "關閉正規表示式工具",
            language,
          )}
        >
          ×
        </button>
      </header>
      <div className="mode-switch">
        <button
          type="button"
          className={!regexMode ? "selected" : ""}
          onClick={() => setRegexMode(false)}
        >
          {dual("Plain text", "純文字", language)}
        </button>
        <button
          type="button"
          className={regexMode ? "selected" : ""}
          onClick={() => setRegexMode(true)}
        >
          {dual("Regular expression", "正規表示式", language)}
        </button>
      </div>
      <label className="builder-field">
        <span>{dual("Pattern", "模式", language)}</span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setRegexMode(true);
          }}
          spellCheck={false}
          aria-invalid={Boolean(error)}
        />
      </label>
      {error && (
        <p className="regex-error" role="alert">
          {dual(`Invalid pattern: ${error}`, `模式無效：${error}`, language)}
        </p>
      )}
      <div className="token-grid">
        {tokens.map(([label, token]) => (
          <button key={label} type="button" onClick={() => insert(token)}>
            <span>{label}</span>
            <code>{token}</code>
          </button>
        ))}
      </div>
      <fieldset>
        <legend>{dual("Flags", "旗標", language)}</legend>
        <label>
          <input
            type="checkbox"
            checked={flags.i}
            onChange={(e) => setFlags({ ...flags, i: e.target.checked })}
          />{" "}
          {dual("i · ignore case", "i · 忽略大小寫", language)}
        </label>
        <label>
          <input
            type="checkbox"
            checked={flags.m}
            onChange={(e) => setFlags({ ...flags, m: e.target.checked })}
          />{" "}
          {dual("m · multiline", "m · 多行", language)}
        </label>
      </fieldset>
      <label className="builder-field">
        <span>{dual("Sample text", "範例文字", language)}</span>
        <textarea
          value={sample}
          onChange={(e) => setSample(e.target.value)}
          rows={4}
        />
      </label>
      <div className="match-summary" aria-live="polite">
        <strong>
          {dual(
            `${matches.length} live matches`,
            `${matches.length} 個即時配對`,
            language,
          )}
        </strong>
        <span>
          {matches.length
            ? dual(
                `Captures: ${
                  matches
                    .flatMap((m) => m.slice(1))
                    .filter(Boolean)
                    .join(", ") || "none"
                }`,
                `擷取：${
                  matches
                    .flatMap((m) => m.slice(1))
                    .filter(Boolean)
                    .join(", ") || "冇"
                }`,
                language,
              )
            : dual("No captures", "冇擷取", language)}
        </span>
      </div>
      <footer>
        <button
          className="outlined-button"
          type="button"
          onClick={() => {
            setQuery("");
            setRegexMode(false);
          }}
        >
          {dual("Reset", "重設", language)}
        </button>
        <button
          className="filled-button"
          type="button"
          onClick={copy}
          disabled={!query || Boolean(error)}
        >
          {dual("Copy pattern", "複製模式", language)}
        </button>
      </footer>
    </section>
  );
}
