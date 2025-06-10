// Electron IPC / ContextBridge の型定義
// メインプロセスとレンダラープロセス間の通信で使用される型

interface BuildConfig {
  fw: string;
  tag?: string;
  kb: string;
  km: string;
  commit?: string;
  useRepo?: boolean;
}

interface BuildResult {
  success: boolean;
  output?: string;
  error?: string;
}

interface VialKeymap {
  layout: unknown;
  layers: unknown[][];
}

interface Repository {
  id: string;
  url: string;
  commit?: string;
}

interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

interface Config {
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface IpcChannels {
  'docker:start': () => Promise<boolean>;
  'docker:stop': () => Promise<boolean>;
  'docker:status': () => Promise<boolean>;
  'build:firmware': (config: BuildConfig) => Promise<BuildResult>;
  'convert:kle': (data: unknown) => Promise<unknown>;
  'convert:vial': (data: VialKeymap) => Promise<string>;
  'file:read': (path: string) => Promise<string>;
  'file:write': (path: string, data: string) => Promise<boolean>;
  'file:exists': (path: string) => Promise<boolean>;
  'directory:create': (path: string) => Promise<boolean>;
  'repository:clone': (repo: Repository) => Promise<boolean>;
  'repository:update': (repo: Repository) => Promise<boolean>;
  'logs:get': (source?: string) => Promise<LogEntry[]>;
  'logs:clear': () => Promise<void>;
  'settings:get': () => Promise<Config>;
  'settings:set': (config: Partial<Config>) => Promise<boolean>;
  'app:version': () => Promise<string>;
  'app:quit': () => void;
}

export interface IpcAPI {
  // Docker操作
  startDocker: () => Promise<boolean>;
  stopDocker: () => Promise<boolean>;
  getDockerStatus: () => Promise<boolean>;
  
  // ファームウェアビルド
  buildFirmware: (config: unknown) => Promise<unknown>;
  
  // コンバーター機能
  convertKle: (data: unknown) => Promise<unknown>;
  convertKleJson: (data: unknown) => Promise<unknown>;
  convertVial: (data: unknown) => Promise<string>;
  convertVilJson: (data: unknown) => Promise<string>;
  
  // ファイル操作
  readFile: (path: string) => Promise<string>;
  readJson: (path: string) => Promise<unknown>;
  writeFile: (path: string, data: string) => Promise<boolean>;
  fileExists: (path: string) => Promise<boolean>;
  createDirectory: (path: string) => Promise<boolean>;
  
  // リポジトリ操作
  cloneRepository: (repo: unknown) => Promise<boolean>;
  updateRepository: (repo: unknown) => Promise<boolean>;
  updateRepositoryCustom: (data: unknown) => Promise<unknown>;
  
  // ログ機能
  getLogs: (source?: string) => Promise<unknown[]>;
  clearLogs: () => Promise<void>;
  
  // 設定
  getSettings: () => Promise<unknown>;
  setSettings: (config: unknown) => Promise<boolean>;
  
  // アプリケーション情報
  getAppVersion: () => Promise<string>;
  appVersion: () => Promise<string>;
  getState: () => Promise<unknown>;
  getStorePath: () => Promise<string>;
  setState: (state: unknown) => Promise<void>;
  quitApp: () => void;
  
  // サーバー操作
  existSever: () => Promise<number>;
  setSkipCheckDocker: (skip: boolean) => Promise<void>;
  
  // タグ・リスト取得
  tags: () => Promise<string[]>;
  listLocalKeyboards: () => Promise<unknown>;
  listRemoteKeyboards: (repo: string) => Promise<unknown>;
  getLocalFWdir: () => Promise<string>;
  
  // ビルド関連
  buildCompleted: () => Promise<boolean>;
  rebuildImage: (params: unknown) => Promise<unknown>;
  checkout: (params: unknown) => Promise<unknown>;
  copyKeyboardFile: (params: unknown) => Promise<unknown>;
  build: (buildConfig: unknown) => Promise<unknown>;
  
  // 生成機能
  generateVialId: () => Promise<string>;
  generateQMKFile: (config: unknown) => Promise<string>;
  
  // イベントリスナー
  on(channel: 'close', callback: () => void): void;
  on(channel: 'streamLog', callback: (log: string, init: boolean) => void): void;
  on(channel: 'streamBuildLog', callback: (log: string) => void): void;
  on(channel: string, callback: (...args: unknown[]) => void): void;
}

// Window オブジェクトの拡張
declare global {
  interface Window {
    api: IpcAPI;
  }
}

export {};