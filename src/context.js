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
            commit: ''
        },
        generate : {
            qmkFile: {
                kb: '',
                user: '',
                layout: 'fullsize_ansi',
                mcu: 'RP2040',
            }
        },
        logs: {
            stderr: "",
            stdout: ""
        },
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
            generate : {
                qmkFile: {
                    kb: obj.generate.qmkFile.kb,
                    user: obj.generate.qmkFile.user,
                    layout: obj.generate.qmkFile.layout,
                    mcu: obj.generate.qmkFile.mcu,
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
