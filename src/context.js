import React from 'react'
import {createContext, useState, useContext} from 'react'
const stateContext = createContext({})

export function useStateContext() {
    return useContext(stateContext)
}

let _state

export function StateProvider({children}) {

    const [state, _setState] = useState({
        version: '',
        build : {
            fw: 'qmk',
            tag: '',
            tags: [],
            kb: '',
            km: '',
            commit: '',
        },
        buildCache : {
            kb: [],
            km: [],
        },
        generate : {
            qmkFile: {
                kb: '',
                user: '',
                layout: 'fullsize_ansi',
                mcu: 'RP2040',
            }
        },
        convert : {
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
                rp2040: ["GP0","GP1","GP2","GP3","GP4","GP5","GP6","GP7","GP8","GP9","GP10","GP11","GP12","GP13","GP14","GP15","GP16","GP17","GP18","GP19","GP20","GP21","GP22","GP23","GP24","GP25","GP26","GP27","GP28","GP29"],
                promicro: ["D3", "D2", "D1", "D0", "D4", "C6", "D7", "E6", "B4", "B5", "B6", "B2", "B3", "B1", "F7", "F6", "F5", "F4", "B0", "D5"]
            }
        },
        setting : {
            fwMakerUrl: "",
            fwDir: ""
        },
        logs: "",
        tabDisabled: false
    })

    const setState = async (obj) => {
        _state = obj
        _setState({
            build : {
                fw: obj.build.fw,
                tag: obj.build.tag,
                tags: obj.build.tags,
                kb: obj.build.kb,
                km: obj.build.km,
                commit: obj.build.commit
            },
            buildCache : {
                kb: obj.buildCache.kb,
                km: obj.buildCache.km,
            },
            generate : {
                qmkFile: {
                    kb: obj.generate.qmkFile.kb,
                    user: obj.generate.qmkFile.user,
                    layout: obj.generate.qmkFile.layout,
                    mcu: obj.generate.qmkFile.mcu,
                }
            },
            convert : {
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
            setting : {
                fwMakerUrl: obj.setting.fwMakerUrl,
                fwDir: obj.setting.fwDir
            },
            version: obj.version,
            logs: obj.logs,
            tabDisabled: obj.tabDisabled,
        })
    }

    const value = {
        state,
        setState
    }

    return (
        <stateContext.Provider value={value}>{children}</stateContext.Provider>
    )
}

export const getState = () => _state
