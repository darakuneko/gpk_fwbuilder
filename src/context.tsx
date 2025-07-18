import React, {createContext, useContext, useState, ReactNode} from 'react'

export interface Firmware {
    id: string;
    url: string;
    commit: string;
}

export interface BuildData {
    tag: string;
    tags: string[];
    kb: string;
    km: string;
    commit: string;
    useRepo: boolean;
}

export interface AppState {
    version: string;
    storePath: string;
    build: {
        fw: string;
        tag: string;
        tags: string[];
        kb: string;
        km: string;
        commit: string;
        useRepo: boolean;
    };
    buildDataPerFirmware: {
        [firmwareId: string]: BuildData;
    };
    keyboardList: {
        kb: string[];
        km: string[];
    };
    generate: {
        qmkFile: {
            kb: string;
            user: string;
            layout: string;
            mcu: string;
        };
    };
    convert: {
        kle: {
            kb: string;
            user: string;
            vid: string;
            pid: string;
            mcu: string;
            cols: string;
            rows: string;
            option: number;
        };
        pins: {
            rp2040: string[];
            promicro: string[];
        };
    };
    repository: {
        firmware: string;
        firmwares: Firmware[];
    };
    setting: {
        fwMakerUrl: string;
        fwDir: string;
    };
    logs: string;
    tabDisabled: boolean;
    pageLogs: {
        build: string;
        generateKeyboardFile: string;
        generateVialId: string;
        convertVialToKeymap: string;
        convertKleToKeyboard: string;
        repository: string;
        image: string;
    };
}

interface StateContextType {
    state: AppState | null;
    setState: (state: AppState) => Promise<void>;
    setPageLog: (page: string, log: string) => void;
    getPageLog: (page: string) => string;
}

const stateContext = createContext<StateContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useStateContext(): StateContextType {
    const context = useContext(stateContext);
    if (!context) {
        throw new Error('useStateContext must be used within StateProvider');
    }
    return context;
}

let _state: AppState | null = null

interface StateProviderProps {
    children: ReactNode;
}

export function StateProvider({children}: StateProviderProps): React.ReactElement {

    const [state, _setState] = useState<AppState>({
        version: '',
        storePath: '',
        build: {
            fw: 'QMK',
            tag: '',
            tags: [],
            kb: '',
            km: '',
            commit: '',
            useRepo: false,
        },
        buildDataPerFirmware: {},
        keyboardList: {
            kb: [],
            km: [],
        },
        generate: {
            qmkFile: {
                kb: '',
                user: '',
                layout: 'fullsize_ansi',
                mcu: 'RP2040',
            }
        },
        convert: {
            kle: {
                kb: '',
                user: '',
                vid: '0xFEED',
                pid: '0x0000',
                mcu: 'RP2040',
                cols: '',
                rows: '',
                option: 0,
            },
            pins: {
                rp2040: ["GP0", "GP1", "GP2", "GP3", "GP4", "GP5", "GP6", "GP7", "GP8", "GP9", "GP10", "GP11", "GP12", "GP13", "GP14", "GP15", "GP16", "GP17", "GP18", "GP19", "GP20", "GP21", "GP22", "GP23", "GP24", "GP25", "GP26", "GP27", "GP28", "GP29"],
                promicro: ["D3", "D2", "D1", "D0", "D4", "C6", "D7", "E6", "B4", "B5", "B6", "B2", "B3", "B1", "F7", "F6", "F5", "F4", "B0", "D5"]
            }
        },
        repository: {
            firmware: "QMK",
            firmwares: [{
                id: "QMK",
                url: "",
                commit: ""
            }, {
                id: "Vial",
                url: "",
                commit: ""
            }, {
                id: "Custom1",
                url: "",
                commit: ""
            }, {
                id: "Custom2",
                url: "",
                commit: ""
            }, {
                id: "Custom3",
                url: "",
                commit: ""
            }, {
                id: "Custom4",
                url: "",
                commit: ""
            }, {
                id: "Custom5",
                url: "",
                commit: ""
            }],
        },
        setting: {
            fwMakerUrl: "",
            fwDir: ""
        },
        logs: "",
        tabDisabled: false,
        pageLogs: {
            build: "",
            generateKeyboardFile: "",
            generateVialId: "",
            convertVialToKeymap: "",
            convertKleToKeyboard: "",
            repository: "",
            image: ""
        }
    })

    const setState = async (obj: AppState): Promise<void> => {
        _state = obj
        _setState({
            build: {
                fw: obj.build.fw,
                tag: obj.build.tag,
                tags: obj.build.tags,
                kb: obj.build.kb,
                km: obj.build.km,
                commit: obj.build.commit,
                useRepo: obj.build.useRepo,
            },
            buildDataPerFirmware: obj.buildDataPerFirmware || {},
            keyboardList: {
                kb: obj.keyboardList.kb,
                km: obj.keyboardList.km,
            },
            generate: {
                qmkFile: {
                    kb: obj.generate.qmkFile.kb,
                    user: obj.generate.qmkFile.user,
                    layout: obj.generate.qmkFile.layout,
                    mcu: obj.generate.qmkFile.mcu,
                }
            },
            convert: {
                kle: {
                    kb: obj.convert.kle.kb,
                    user: obj.convert.kle.user,
                    pid: obj.convert.kle.pid,
                    vid: obj.convert.kle.vid,
                    mcu: obj.convert.kle.mcu,
                    cols: obj.convert.kle.cols,
                    rows: obj.convert.kle.rows,
                    option: obj.convert.kle.option,
                },
                pins: {
                    rp2040: obj.convert.pins.rp2040,
                    promicro: obj.convert.pins.promicro,
                }
            },
            repository: {
                firmware: obj.repository.firmware,
                firmwares: obj.repository.firmwares
            },
            setting: {
                fwMakerUrl: obj.setting.fwMakerUrl,
                fwDir: obj.setting.fwDir
            },
            version: obj.version,
            storePath:  obj.storePath,
            logs: obj.logs,
            tabDisabled: obj.tabDisabled,
            pageLogs: obj.pageLogs || {
                build: "",
                generateKeyboardFile: "",
                generateVialId: "",
                convertVialToKeymap: "",
                convertKleToKeyboard: "",
                repository: "",
                image: ""
            }
        })
    }

    const setPageLog = (pageName: string, logContent: string): void => {
        if (!_state?.pageLogs) {
            if (_state) {
                _state.pageLogs = {
                    build: "",
                    generateKeyboardFile: "",
                    generateVialId: "",
                    convertVialToKeymap: "",
                    convertKleToKeyboard: "",
                    repository: "",
                    image: ""
                }
            }
        }
        if (_state?.pageLogs) {
            (_state.pageLogs as Record<string, string>)[pageName] = logContent
        }
        _setState((prevState): AppState => ({
            ...prevState,
            pageLogs: {
                ...prevState.pageLogs,
                [pageName]: logContent
            }
        }))
    }

    const getPageLog = (pageName: string): string => {
        return (_state?.pageLogs as Record<string, string> | undefined)?.[pageName] || ""
    }

    const value = {
        state,
        setState,
        setPageLog,
        getPageLog
    }

    return (
        <stateContext.Provider value={value}>{children}</stateContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const getState = (): AppState | null => _state
