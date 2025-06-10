import React, {useState} from 'react'
import { Button, Label } from 'flowbite-react'

import {useStateContext} from "../context"
import FileUpload from "../components/FileUpload"
import { cleanLogText } from '../utils/logParser'

const {api} = window

interface ConvertVialToKeymapProps {
    onOperationComplete?: () => void;
}

const ConvertVialToKeymap: React.FC<ConvertVialToKeymapProps> = ({onOperationComplete}): React.ReactElement => {
    const {state, setState, setPageLog, getPageLog} = useStateContext()
    const [vilObj, setVilObj] = useState({
        name : "",
        path : "",
    })
    const [disabledVilCovertButton, setDisabledVilCovertButton] = useState(true)
    
    // Guard against uninitialized state
    if (!state) {
        return <div>Loading...</div>
    }

    const convertMsg =  "Convert...."

    const handleVilFileSubmit = async (): Promise<void> => {
        if (!state) return
        setPageLog('convertVialToKeymap', convertMsg)
        state.tabDisabled = true
        void setState(state)
        setDisabledVilCovertButton(true)
        
        const log = await api.convertVilJson(vilObj)
        setPageLog('convertVialToKeymap', log as string)
        state.tabDisabled = false
        void setState(state)
        setDisabledVilCovertButton(false)
        
        if (onOperationComplete) {
            onOperationComplete()
        }
    }

    const handleVilFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0]
        if (file){
            vilObj.name = file.name
            vilObj.path = (window as unknown as {webUtils: {getPathForFile: (file: File) => string}}).webUtils.getPathForFile(file)
            setVilObj({...vilObj})
        }
        if (vilObj.name.length > 0) setDisabledVilCovertButton(false)
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* File Upload Section */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">    
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block" htmlFor="vil">Vial file (.vil)</Label>
                            <div className="w-full">
                                <FileUpload
                                    id="vil"
                                    label="Choose File"
                                    accept=".vil"
                                    onChange={handleVilFileUpload}
                                    filename={vilObj.name}
                                    className="w-full"
                                    variant="outlined"
                                />
                            </div>
                        </div>
                        <Button
                            color="blue"
                            className={`w-full ${disabledVilCovertButton ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            style={disabledVilCovertButton ? { opacity: 0.5 } : {}}
                            onClick={disabledVilCovertButton ? (): void => {} : handleVilFileSubmit}
                            disabled={false}
                        >
                            Convert
                        </Button>
                    </div>
                </div>
                
                {/* Inline Log Display */}
                {getPageLog('convertVialToKeymap') && (
                    <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                        <div className="mb-3">
                            <Label className="block text-sm font-medium text-gray-900 dark:text-white">
                                Conversion Log
                            </Label>
                        </div>
                        <textarea
                            value={cleanLogText(getPageLog('convertVialToKeymap')) || ''}
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
                    </div>
                )}
            </div>
        </div>
    )
}
export default ConvertVialToKeymap