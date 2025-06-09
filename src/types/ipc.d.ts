// Electron IPC / ContextBridge の型定義
// メインプロセスとレンダラープロセス間の通信で使用される型

export interface IpcChannels {
  'docker:start': () => Promise<boolean>;
  'docker:stop': () => Promise<boolean>;
  'docker:status': () => Promise<boolean>;
  'build:firmware': (config: BuildConfig) => Promise<BuildResult>;
  'convert:kle': (data: any) => Promise<any>;
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
  buildFirmware: (config: BuildConfig) => Promise<BuildResult>;
  
  // コンバーター機能
  convertKle: (data: any) => Promise<any>;
  convertVial: (data: VialKeymap) => Promise<string>;
  
  // ファイル操作
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, data: string) => Promise<boolean>;
  fileExists: (path: string) => Promise<boolean>;
  createDirectory: (path: string) => Promise<boolean>;
  
  // リポジトリ操作
  cloneRepository: (repo: Repository) => Promise<boolean>;
  updateRepository: (repo: Repository) => Promise<boolean>;
  
  // ログ機能
  getLogs: (source?: string) => Promise<LogEntry[]>;
  clearLogs: () => Promise<void>;
  
  // 設定
  getSettings: () => Promise<Config>;
  setSettings: (config: Partial<Config>) => Promise<boolean>;
  
  // アプリケーション
  getAppVersion: () => Promise<string>;
  quitApp: () => void;
}

// Window オブジェクトの拡張
declare global {
  interface Window {
    api: IpcAPI;
  }
}

export {};