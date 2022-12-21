import React from 'react'
import {createContext, useState, useContext} from 'react'
const stateContext = createContext({})

export function useStateContext() {
    return useContext(stateContext)
}

export function StateProvider({children}) {
    const [state, _setState] = useState({
        fw: 'qmk',
        tags: [],
        kb: undefined,
        km: undefined,
        selectedTag: "",
        disabledButton: false,
        logs: {
            stderr: "",
            stdout: ""
        }
    })

    const setState = async (obj) => {
        _setState({
            fw: obj.fw,
            tags: obj.tags,
            kb: obj.kb,
            km: obj.km,
            selectedTag: obj.selectedTag,
            logs: obj.logs
        })
    }
    const value = {
        state,
        setState,
    }

    return (
        <stateContext.Provider value={value}>{children}</stateContext.Provider>
    )
}