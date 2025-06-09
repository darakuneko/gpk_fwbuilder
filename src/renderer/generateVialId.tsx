import React from "react"
import {useStateContext} from "../context"
import { Button, Label } from 'flowbite-react'
import { cleanLogText, isOperationComplete } from '../utils/logParser'

const {api} = window

interface GenerateVialIdProps {
    onOperationComplete?: () => void;
}

const GenerateVialId: React.FC<GenerateVialIdProps> = ({onOperationComplete}) => {
    const {state, setState, setPageLog, getPageLog} = useStateContext()
    
    // Guard against uninitialized state
    if (!state) {
        return <div>Loading...</div>
    }

    const generateMsg: string = "Generating...."
    const handleVailIdSubmit = () => async () => {
        setPageLog('generateVialId', generateMsg)
        state.tabDisabled = true
        setState(state)
        const logs = await api.generateVialId()
        setPageLog('generateVialId', logs)
        state.tabDisabled = false
        setState(state)
        
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
                        className={`w-full ${state.tabDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        style={state.tabDisabled ? { opacity: 0.5 } : {}}
                        onClick={state.tabDisabled ? () => {} : handleVailIdSubmit("VialId")}
                        disabled={false}
                    >
                        Generate Unique ID
                    </Button>
                </div>
                
                {/* Inline Log Display */}
                {getPageLog('generateVialId') && (
                    <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                        <div className="mb-3">
                            <Label className="block text-sm font-medium text-gray-900 dark:text-white">
                                Generation Log
                            </Label>
                        </div>
                        <textarea
                            value={cleanLogText(getPageLog('generateVialId')) || ''}
                            readOnly
                            className="w-full font-mono text-sm bg-gray-900 text-white rounded p-4 resize-none border-0 focus:outline-none focus:ring-0"
                            style={{ 
                                minHeight: '200px',
                                maxHeight: '400px',
                                whiteSpace: 'pre',
                                overflowWrap: 'normal',
                                wordBreak: 'normal'
                            }}
                            placeholder="Logs will appear here..."
                        />
                        {getPageLog('generateVialId') && isOperationComplete(getPageLog('generateVialId')) && (
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    ✓ Generation completed successfully!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
export default GenerateVialId