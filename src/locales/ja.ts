export const ja = {
  // Navigation
  nav: {
    build: 'ビルド',
    generate: '生成',
    convert: '変換',
    setting: '設定'
  },

  // Build page
  build: {
    title: 'ファームウェアビルド',
    firmware: 'ファームウェア',
    tag: 'タグ',
    keyboard: 'キーボード',
    keymap: 'キーマップ',
    commit: 'コミット',
    useRepo: 'リポジトリを使用',
    buildButton: 'ビルド',
    refresh: '更新',
    refreshKeyboardList: 'キーボードリストを更新',
    copyKeyboardFile: 'キーボードファイルをコピー',
    useRepositoryKeyboards: 'リポジトリキーボードファイルを使用'
  },

  // Generate submenu
  generate: {
    keyboardFile: 'キーボードファイル',
    vialId: 'Vial ユニークID',
    keyboardFileTitle: 'QMK キーボードファイル生成',
    vialIdTitle: 'Vial ユニークID生成',
    keyboardName: 'キーボード名',
    username: 'ユーザー名',
    layout: 'レイアウト',
    mcu: 'MCU',
    generateButton: '生成',
    generateUniqueId: 'ユニークID生成',
    description: 'カスタムキーボードプロジェクト用のQMKキーボード設定ファイルテンプレートを生成します。',
    configurationParameters: '設定パラメータ',
    generateFiles: 'ファイル生成',
    vialIdDescription: 'Vialキーボード設定用のユニーク識別子を生成します。各キーボードには固有のIDが必要です。',
    generateId: 'ID生成'
  },

  // Convert submenu
  convert: {
    vialToKeymap: 'Vial → Keymap.c　　　　　',
    kleToKeyboard: 'KLE → キーボードファイル',
    vialToKeymapTitle: 'VialファイルをKeymap.cに変換',
    kleToKeyboardTitle: 'KLE JsonをQMK/Vialファイルに変換',
    vialFile: 'Vialファイル (.vil)',
    kleFile: 'KLE JSONファイル',
    vendorId: 'ベンダーID',
    productId: 'プロダクトID',
    matrixPinsRows: 'マトリックスピン - 行',
    matrixPinsCols: 'マトリックスピン - 列',
    outputOptions: '出力オプション',
    addVialSettings: 'Vial設定を追加',
    onlyVia: 'viaのみ',
    convertButton: '変換',
    chooseFile: 'ファイルを選択',
    selectRowPins: '行ピンを選択...',
    selectColPins: '列ピンを選択...',
    selectColumnPins: '列ピンを選択...',
    vialDescription: 'Vialエクスポートファイル(.vil)をカスタムキーボードファームウェア用のQMK keymap.cファイルに変換します。',
    fileInput: 'ファイル入力',
    kleDescription: 'Keyboard Layout Editor (KLE) JSONファイルを完全なQMK/Vialキーボードファームウェアに変換します。',
    kleFileInput: 'KLEファイル入力',
    kleJsonFile: 'KLE JSONファイル',
    keyboardInformation: 'キーボード情報',
    matrixPinConfiguration: 'マトリックスピン設定',
    matrixPinDescription: 'キーボードマトリックス用のGPIOピンを設定します。「viaのみ」オプションでは不要です。',
    rowsSelectionTitle: 'マトリックスピン - 行選択',
    columnsSelectionTitle: 'マトリックスピン - 列選択'
  },

  // Settings submenu
  settings: {
    repository: 'リポジトリ',
    image: 'イメージ',
    externalServer: '外部サーバー',
    languageSettings: '言語',
    repositoryTitle: 'リポジトリ管理',
    imageTitle: 'Dockerイメージ管理',
    externalServerTitle: '外部サーバー設定 - GPK FWMaker',
    languageSettingsTitle: '言語設定',
    language: '言語',
    fwMakerUrl: 'URL',
    fwDir: 'パス',
    urlPlaceholder: 'ローカルDockerを使用する場合は空にしてください',
    useLocalDocker: 'URLが空の場合はローカルDockerを使用します',
    restartRequired: '設定は終了時に保存されるため、アプリケーションの再起動が必要です。',
    updateRepository: 'リポジトリを更新',
    rebuildDockerImage: 'Dockerイメージを再構築',
    repositoryUrl: 'リポジトリURL',
    gitCloneUrlPlaceholder: 'git clone url'
  },

  // Pin Selector Modal
  pinSelector: {
    title: 'マトリックスピン - {type}選択',
    rows: '行',
    columns: '列',
    selectedPins: '選択されたピン ({count})',
    arrayOutput: '配列出力:',
    noPinsSelected: 'ピンが選択されていません',
    ok: 'OK',
    cancel: 'キャンセル'
  },

  // Logs
  logs: {
    title: 'ログ',
    hideLogs: 'ログを隠す',
    showLogs: 'ログを表示',
    closeLogs: 'ログを閉じる',
    cannotCloseDuringOperation: '操作中は閉じることができません',
    logsWillAppear: 'ログがここに表示されます...',
    clickToEnableSelection: 'クリックしてテキスト選択を有効にする',
    textSelectionMode: 'テキスト選択モード',
    backToViewMode: 'ビューモードに戻る',
    search: '検索',
    copyAll: 'すべてコピー',
    copied: 'コピーしました！',
    searchPlaceholder: 'ログを検索... (正規表現対応)',
    recentSearches: '最近の検索',
    clear: 'クリア',
    showingMatches: '"{query}"にマッチする行を表示中 ({count}行)',
    noMatches: 'マッチするものが見つかりません',
    processingCannotSelect: '処理中... 完了後にテキスト選択が可能になります'
  },

  // Common
  common: {
    pleaseRestartApplication: 'アプリケーションを再起動してください',
    required: '*',
    loading: '読み込み中...',
    selectMenuItem: 'メニュー項目を選択して開始してください',
    initializing: '初期化中.....',
    mayTakeTime: '10分以上かかる場合があります',
    skipDockerCheck: 'Dockerチェックをスキップ',
    terminating: '終了中.....',
    selected: '選択済み: {items} ({count}ピン)',
    filesCreated: 'ファイルはGKPFWディレクトリに作成されます',
    networkErrorRetry: 'ネットワークエラーやその他の問題で停止した場合は、再度ボタンを押してください。',
    selectedFile: '選択済み: {filename}',
    ok: 'OK',
    cancel: 'キャンセル',
    selectKeyboard: 'キーボードを選択...',
    selectKeymap: 'キーマップを選択...',
    connectionError: 'アプリケーションとDockerのネットワーク間でエラーが発生しました。\nアプリケーションを再起動してください。',
    keyboardName: 'キーボード名',
    username: 'ユーザー名',
    mcu: 'MCU',
    vendorId: 'ベンダーID',
    productId: 'プロダクトID',
    keymap: 'キーマップ',
    configuration: '設定',
    selectOptions: 'オプションを選択...'
  },

  // Validation messages
  validation: {
    pleaseSelect: '{field}を選択してください',
    pleaseSelectFile: '有効な{fileType}ファイルを選択してください',
    invalidFormat: '無効な{format}形式です',
    fileSizeLimit: 'ファイルサイズは{size}未満である必要があります',
    alphanumericOnly: 'A-Za-z0-9 _/- が使用できます',
    hexOnly: 'A-Z0-9x が使用できます',
    notZero: '0x0000以外にする',
    pleaseSelectRowPins: '行ピンを選択してください',
    pleaseSelectColPins: '列ピンを選択してください',
    selectValidFile: '最初に有効な.vilファイルを選択してください',
    keyboardRequired: 'キーボードを選択してください',
    keymapRequired: 'キーマップを選択してください',
    invalidKeymapChars: '\':\' \'flash\' は使用できません',
    selectValidJsonFile: '有効なJSONファイルを選択してください。',
    invalidKleFormat: '無効なKLE JSON形式です。配列である必要があります。',
    invalidJsonFormat: '無効なJSONファイルです。ファイル形式を確認してください。',
    fileReadError: 'ファイルの読み取りに失敗しました。再試行してください。',
    selectValidVilFile: 'エラー: 有効な.vilファイルを選択してください',
    selectVilFileFirst: '最初に.vilファイルを選択してください',
    selectRowPins: '行ピンを選択してください',
    selectColumnPins: '列ピンを選択してください'
  },

  // File types
  fileTypes: {
    vil: '.vil',
    json: 'JSON',
    kle: 'KLE JSON'
  },

  // Update notifications
  updatesNotification: {
    title: '更新情報',
    noNotification: '更新情報はありません',
    viewUpdates: '更新情報'
  }
}