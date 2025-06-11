import React from 'react'
import { Button } from 'flowbite-react'

import {useStateContext} from "../context"

const {api} = window

interface GenerateVialIdProps {
    onShowLogModal?: () => void;
    onOperationComplete?: () => void;
}

const GenerateVialId: React.FC<GenerateVialIdProps> = ({onShowLogModal, onOperationComplete}): React.ReactElement => {
    const {state, setState, setPageLog} = useStateContext()
    
    // Guard against uninitialized state
    if (!state) {
        return <div>Loading...</div>
    }

    const generateMsg: string = "Generating...."
    const handleVailIdSubmit = (): (() => Promise<void>) => async (): Promise<void> => {
        if (!state) return
        
        // Show log modal when generate starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        setPageLog('generateVialId', generateMsg)
        state.tabDisabled = true
        void setState(state)
        const logs = await api.generateVialId()
        setPageLog('generateVialId', logs as string)
        state.tabDisabled = false
        void setState(state)
        
        if (onOperationComplete) {
            onOperationComplete()
        }
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <Button
                        color="blue"
                        className={`w-full ${state?.tabDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        style={state?.tabDisabled ? { opacity: 0.5 } : {}}
                        onClick={state?.tabDisabled ? (): void => {} : handleVailIdSubmit()}
                        disabled={false}
                    >
                        Generate Unique ID
                    </Button>
                </div>
                
            </div>
        </div>
    )
}
export default GenerateVialId