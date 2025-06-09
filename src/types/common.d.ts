// 共通型定義ファイル
// GPK FWBuilder アプリケーション全体で使用される型を定義

export interface User {
  id: number;
  name: string;
  isActive: boolean;
}

export interface Config {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dockerImage: string;
  outputPath: string;
}

export interface BuildConfig {
  keyboard: string;
  keymap: string;
  bootloader?: string;
  mcu?: string;
  features?: Record<string, boolean>;
}

export interface KeyboardInfo {
  name: string;
  manufacturer?: string;
  url?: string;
  maintainer?: string;
  layouts: Record<string, any>;
  matrix: {
    rows: number;
    cols: number;
  };
}

export interface BuildResult {
  success: boolean;
  message: string;
  files?: string[];
  logs?: string[];
  errors?: string[];
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

export interface Repository {
  name: string;
  url: string;
  branch: string;
  path: string;
  enabled: boolean;
}

export interface VialKeymap {
  version: number;
  uid: number;
  layout: {
    labels?: string[];
    keymap: any[][];
  };
  layers: any[][];
}

export interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  onChange: (files: FileList | null) => void;
  className?: string;
  disabled?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AutocompleteProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface PinConfig {
  pin: string;
  function: string;
  description?: string;
}

export interface PinSelectorModalProps {
  show: boolean;
  onClose: () => void;
  onSelect: (pins: PinConfig[]) => void;
  availablePins: string[];
  selectedPins: PinConfig[];
}