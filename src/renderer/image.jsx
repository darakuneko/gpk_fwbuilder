import React from "react"
import {useStateContext} from "../context.jsx"
import { Button } from 'flowbite-react'

const {api} = window

const Image = ({onClose}) => {
    const {state, setState} = useStateContext()

    const handleUpdate = (msg1, msg2, fn) => async () => {
        // Close modal immediately when rebuild starts
        if (onClose) {
            onClose()
        }
        
        state.logs = msg1
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
                state.logs = msg2
                state.tabDisabled = false
                setState(state)
                clearInterval(id)
            }
        }
        id = setInterval(await checkFn, 1000)
    }

    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto">
                
                <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        If it stops due to a network error or other problem, please press the button again.
                    </p>
                </div>
                
                <div className="flex justify-center">
                    <Button 
                        color="red"
                        disabled={state.tabDisabled}
                        onClick={handleUpdate("Building.....\n\n", "Rebuild!!", async () => await api.rebuildImage())}
                        size="lg"
                    >
                        Rebuild Docker Image
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default Image