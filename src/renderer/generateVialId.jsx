import React from "react"
import {useStateContext} from "../context.jsx"
import { Button } from 'flowbite-react'

const {api} = window

const GenerateVialId = ({onClose}) => {
    const {state, setState} = useStateContext()

    const generateMsg =  "Generating...."
    const handleVailIdSubmit =  () => async () => {
        state.logs = generateMsg
        state.tabDisabled = true
        setState(state)
        const logs = await api.generateVialId()
        state.logs = logs
        state.tabDisabled = false
        setState(state)
        
        if (onClose) {
            onClose()
        }
    }

    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto">
                
                <div className="flex justify-center">
                    <Button
                        color="blue"
                        onClick={handleVailIdSubmit("VialId")}
                        size="lg"
                    >
                        Generate Unique ID
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default GenerateVialId