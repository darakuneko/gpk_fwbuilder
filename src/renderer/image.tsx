import React from "react"
import {useStateContext} from "../context"
import { Button } from 'flowbite-react'

const {api} = window

const Image = ({onShowLogModal, onOperationComplete}) => {
    const {state, setState, setPageLog} = useStateContext()
    
    // Guard against uninitialized state
    if (!state) {
        return <div>Loading...</div>
    }

    const handleUpdate = (msg1, msg2, fn) => async () => {
        // Show log modal when rebuild starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        setPageLog('image', msg1)
        state.tabDisabled = true
        setState(state)
        await fn()
        let id
        const checkFn = async () => {
            const buildCompleted = await api.buildCompleted()
            const exist = await api.existSever()
            if (buildCompleted && exist) {
                state.build.tags = await api.tags()
                state.build.tag = state.build.tags[0]
                setPageLog('image', msg2)
                state.tabDisabled = false
                setState(state)
                clearInterval(id)
                
                // Operation complete
                if (onOperationComplete) {
                    onOperationComplete()
                }
            }
        }
        id = setInterval(checkFn, 1000)
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="text-center">
                        <Button 
                            color="red"
                            className={`w-full ${state.tabDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            style={state.tabDisabled ? { opacity: 0.5 } : {}}
                            disabled={false}
                            onClick={state.tabDisabled ? () => {} : handleUpdate("Building.....\n\n", "Rebuild!!", async () => await api.rebuildImage())}
                        >
                            Rebuild Docker Image
                        </Button>
                        <div className="text-center space-y-2 pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                If it stops due to a network error or other problem, please press the button again.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Image