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
            }
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
                }
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
