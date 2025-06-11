import React, {useState} from 'react'
import { Button, Label } from 'flowbite-react'

import {useStateContext} from "../context"
import FileUpload from "../components/FileUpload"

const {api} = window

interface ConvertVialToKeymapProps {
    onShowLogModal?: () => void;
    onOperationComplete?: () => void;
}

const ConvertVialToKeymap: React.FC<ConvertVialToKeymapProps> = ({onShowLogModal, onOperationComplete}): React.ReactElement => {
    const {state, setState, setPageLog} = useStateContext()
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
        if (!state || !vilObj.path || !vilObj.name) return
        
        // Show log modal when convert starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
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
            try {
                const newVilObj = {
                    name: file.name,
                    path: (window as unknown as {webUtils: {getPathForFile: (file: File) => string}}).webUtils.getPathForFile(file)
                }
                setVilObj(newVilObj)
                if (newVilObj.name.length > 0 && newVilObj.path && newVilObj.path.length > 0) {
                    setDisabledVilCovertButton(false)
                }
            } catch (error) {
                console.error('Failed to get file path:', error)
                setDisabledVilCovertButton(true)
            }
        }
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
                
            </div>
        </div>
    )
}
export default ConvertVialToKeymap