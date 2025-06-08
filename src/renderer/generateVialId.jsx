import React from "react"
import {useStateContext} from "../context.jsx"
import { Button } from 'flowbite-react'

const {api} = window

const GenerateVialId = ({onShowLogModal, onOperationComplete}) => {
    const {state, setState} = useStateContext()
    
    // Guard against uninitialized state
    if (!state) {
        return <div>Loading...</div>
    }

    const generateMsg =  "Generating...."
    const handleVailIdSubmit =  () => async () => {
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        state.logs = generateMsg
        state.tabDisabled = true
        setState(state)
        const logs = await api.generateVialId()
        state.logs = logs
        state.tabDisabled = false
        setState(state)
        
        if (onOperationComplete) {
            onOperationComplete()
        }
    }

    return (
        <div className="p-4">
            <div className="max-w-2xl mx-auto">
                
                <div className="flex justify-center">
                    <Button
                        color="blue"
                        onClick={handleVailIdSubmit("VialId")}
                    >
                        Generate Unique ID
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default GenerateVialId