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
        if (!state) return
        
        // Validate vilObj before proceeding - check for valid path and name
        if (!vilObj || !vilObj.path || !vilObj.name || 
            typeof vilObj.path !== 'string' || vilObj.path.length === 0 ||
            typeof vilObj.name !== 'string' || vilObj.name.length === 0) {
            console.error('Invalid file object:', vilObj)
            if (onShowLogModal) {
                onShowLogModal()
            }
            setPageLog('convertVialToKeymap', 'Error: Please select a valid .vil file')
            return
        }
        
        // Show log modal when convert starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        setPageLog('convertVialToKeymap', convertMsg)
        state.tabDisabled = true
        void setState(state)
        setDisabledVilCovertButton(true)
        
        try {
            // Backend expects { vilObj: FileObject } structure according to ConvertVilData interface
            const convertVilData = {
                vilObj: {
                    name: vilObj.name,
                    path: vilObj.path
                }
            }
            
            const log = await api.convertVilJson(convertVilData)
            setPageLog('convertVialToKeymap', log as string)
        } catch (error) {
            console.error('Conversion failed:', error)
            setPageLog('convertVialToKeymap', `Error: ${error instanceof Error ? error.message : 'Conversion failed'}`)
        } finally {
            state.tabDisabled = false
            void setState(state)
            setDisabledVilCovertButton(false)
            
            if (onOperationComplete) {
                onOperationComplete()
            }
        }
    }

    const handleVilFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0]
        
        if (file){
            try {
                const filePath = (window as unknown as {webUtils: {getPathForFile: (file: File) => string}}).webUtils.getPathForFile(file)
                
                if (filePath && typeof filePath === 'string' && filePath.length > 0) {
                    vilObj.name = file.name
                    vilObj.path = filePath
                    setVilObj({...vilObj})
                    setDisabledVilCovertButton(false)
                } else {
                    vilObj.name = ""
                    vilObj.path = ""
                    setVilObj({...vilObj})
                    setDisabledVilCovertButton(true)
                }
            } catch (error) {
                console.error('Failed to get file path:', error)
                vilObj.name = ""
                vilObj.path = ""
                setVilObj({...vilObj})
                setDisabledVilCovertButton(true)
            }
        } else {
            vilObj.name = ""
            vilObj.path = ""
            setVilObj({...vilObj})
            setDisabledVilCovertButton(true)
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
                            className={`w-full ${(disabledVilCovertButton || !vilObj.path || !vilObj.name) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            style={(disabledVilCovertButton || !vilObj.path || !vilObj.name) ? { opacity: 0.5 } : {}}
                            onClick={(disabledVilCovertButton || !vilObj.path || !vilObj.name) ? (): void => {} : handleVilFileSubmit}
                            disabled={false}
                            title={(!vilObj.path || !vilObj.name) ? 'Please select a .vil file first' : 'Convert Vial file to keymap.c'}
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