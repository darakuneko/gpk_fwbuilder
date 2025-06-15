export const en = {
  // Navigation
  nav: {
    build: 'Build',
    generate: 'Generate',
    convert: 'Convert',
    setting: 'Setting'
  },

  // Build page
  build: {
    title: 'Build Firmware',
    firmware: 'Firmware',
    tag: 'Tag',
    keyboard: 'Keyboard',
    keymap: 'Keymap',
    commit: 'Commit',
    useRepo: 'Use Repository',
    buildButton: 'Build',
    refresh: 'Refresh',
    refreshKeyboardList: 'Refresh Keyboard List',
    copyKeyboardFile: 'Copy Keyboard File',
    useRepositoryKeyboards: 'Use Repository Keyboards File'
  },

  // Generate submenu
  generate: {
    keyboardFile: 'Keyboard File',
    vialId: 'Vial Unique ID',
    keyboardFileTitle: 'QMK Keyboard File Generation',
    vialIdTitle: 'Vial Unique ID Generation',
    keyboardName: 'Keyboard Name',
    username: 'Username',
    layout: 'Layout',
    mcu: 'MCU',
    generateButton: 'Generate',
    generateUniqueId: 'Generate Unique ID',
    description: 'Generate template QMK keyboard configuration files for your custom keyboard project.',
    configurationParameters: 'Configuration Parameters',
    generateFiles: 'Generate Files',
    vialIdDescription: 'Generate a unique identifier for Vial keyboard configuration. Each keyboard needs a unique ID.',
    generateId: 'Generate ID'
  },

  // Convert submenu
  convert: {
    vialToKeymap: 'Vial to Keymap.c',
    kleToKeyboard: 'KLE to Keyboard File',
    vialToKeymapTitle: 'Convert Vial File to Keymap.c',
    kleToKeyboardTitle: 'Convert KLE Json to QMK/Vial Files',
    vialFile: 'Vial file (.vil)',
    kleFile: 'KLE JSON File',
    vendorId: 'Vendor ID',
    productId: 'Product ID',
    matrixPinsRows: 'Matrix pins - rows',
    matrixPinsCols: 'Matrix pins - cols',
    outputOptions: 'Output Options',
    addVialSettings: 'Add Vial Settings',
    onlyVia: 'Only via',
    convertButton: 'Convert',
    chooseFile: 'Choose File',
    selectRowPins: 'Select row pins...',
    selectColPins: 'Select column pins...',
    selectColumnPins: 'Select column pins...',
    vialDescription: 'Convert Vial export files (.vil) to QMK keymap.c files for custom keyboard firmware.',
    fileInput: 'File Input',
    kleDescription: 'Convert Keyboard Layout Editor (KLE) JSON files to complete QMK/Vial keyboard firmware.',
    kleFileInput: 'KLE File Input',
    kleJsonFile: 'KLE JSON file',
    keyboardInformation: 'Keyboard Information',
    matrixPinConfiguration: 'Matrix Pin Configuration',
    matrixPinDescription: 'Configure the GPIO pins for your keyboard matrix. Not required for "Only via" option.',
    rowsSelectionTitle: 'Matrix Pins - Rows Selection',
    columnsSelectionTitle: 'Matrix Pins - Columns Selection'
  },

  // Settings submenu
  settings: {
    repository: 'Repository',
    image: 'Image',
    externalServer: 'External Server',
    languageSettings: 'Language',
    repositoryTitle: 'Repository Management',
    imageTitle: 'Docker Image Management',
    externalServerTitle: 'External Server Settings - GPK FWMaker',
    languageSettingsTitle: 'Language Settings',
    language: 'Language',
    fwMakerUrl: 'URL',
    fwDir: 'Path',
    urlPlaceholder: 'Leave empty to use local docker',
    useLocalDocker: 'Use local docker if URL is empty',
    restartRequired: 'Settings are saved when you exit, so you will need to restart the application.',
    updateRepository: 'Update Repository',
    rebuildDockerImage: 'Rebuild Docker Image',
    repositoryUrl: 'Repository URL',
    gitCloneUrlPlaceholder: 'git clone url'
  },

  // Pin Selector Modal
  pinSelector: {
    title: 'Matrix Pins - {type} Selection',
    rows: 'Rows',
    columns: 'Columns',
    selectedPins: 'Selected Pins ({count})',
    arrayOutput: 'Array Output:',
    noPinsSelected: 'No pins selected',
    ok: 'OK',
    cancel: 'Cancel'
  },

  // Logs
  logs: {
    title: 'Logs',
    hideLogs: 'Hide Logs',
    showLogs: 'Show Logs',
    closeLogs: 'Close Logs',
    cannotCloseDuringOperation: 'Cannot close during operation',
    logsWillAppear: 'Logs will appear here...',
    clickToEnableSelection: 'Click anywhere to enable text selection',
    textSelectionMode: 'Text selection mode',
    backToViewMode: 'Back to view mode',
    search: 'Search',
    copyAll: 'Copy All',
    copied: 'Copied!',
    searchPlaceholder: 'Search logs... (supports regex)',
    recentSearches: 'Recent searches',
    clear: 'Clear',
    showingMatches: 'Showing lines matching "{query}" ({count} lines)',
    noMatches: 'No matches found',
    processingCannotSelect: 'Processing... Text selection will be available when complete'
  },

  // Common
  common: {
    pleaseRestartApplication: 'Please restart application',
    required: '*',
    loading: 'Loading...',
    selectMenuItem: 'Select a menu item to get started',
    initializing: 'Initializing.....',
    mayTakeTime: 'May take more than 10 minutes',
    skipDockerCheck: 'Skip Docker Check',
    terminating: 'Terminating.....',
    selected: 'Selected: {items} ({count} pins)',
    filesCreated: 'Files are created in GKPFW directory',
    networkErrorRetry: 'If it stops due to a network error or other problem, please press the button again.',
    selectedFile: 'Selected: {filename}',
    ok: 'OK',
    cancel: 'Cancel',
    selectKeyboard: 'Select keyboard...',
    selectKeymap: 'Select keymap...',
    connectionError: 'A network error occurred between the application and Docker. Please restart the application.',
    keyboardName: 'Keyboard Name',
    username: 'Username',
    mcu: 'MCU',
    vendorId: 'Vendor ID',
    productId: 'Product ID',
    keymap: 'Keymap',
    configuration: 'Configuration',
    selectOptions: 'Select options...'
  },

  // Validation messages
  validation: {
    pleaseSelect: 'Please select {field}',
    pleaseSelectFile: 'Please select a valid {fileType} file',
    invalidFormat: 'Invalid {format} format',
    fileSizeLimit: 'File size must be less than {size}',
    alphanumericOnly: 'A-Za-z0-9 _/- can be used',
    hexOnly: 'A-Z0-9x can be used',
    notZero: 'Must be other than 0x0000',
    pleaseSelectRowPins: 'Please select row pins',
    pleaseSelectColPins: 'Please select column pins',
    selectValidFile: 'Please select a valid .vil file first',
    keyboardRequired: 'Keyboard is required',
    keymapRequired: 'Keymap is required',
    invalidKeymapChars: '\':\' \'flash\' cannot be used',
    selectValidJsonFile: 'Please select a valid JSON file.',
    invalidKleFormat: 'Invalid KLE JSON format. Expected an array.',
    invalidJsonFormat: 'Invalid JSON file. Please check the file format.',
    fileReadError: 'Failed to read file. Please try again.',
    selectValidVilFile: 'Error: Please select a valid .vil file',
    selectVilFileFirst: 'Please select a .vil file first',
    selectRowPins: 'Please select row pins',
    selectColumnPins: 'Please select column pins'
  },

  // File types
  fileTypes: {
    vil: '.vil',
    json: 'JSON',
    kle: 'KLE JSON'
  },

  // Update notifications
  updatesNotification: {
    title: 'Update Information',
    noNotification: 'No update information available',
    viewUpdates: 'Updates'
  }
}