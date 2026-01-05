import React, {useState} from 'react'
import { Button, Label } from 'flowbite-react'

import {useStateContext} from "../context"
import FileUpload from "../components/FileUpload"
import { useI18n } from '../hooks/useI18n'

const {api} = window

interface ConvertVialToKeymapProps {
    onShowLogModal?: () => void;
    onOperationComplete?: () => void;
}

const ConvertVialToKeymap: React.FC<ConvertVialToKeymapProps> = ({onShowLogModal, onOperationComplete}): React.ReactElement => {
    const {state, setState, setPageLog} = useStateContext()
    const { t } = useI18n()
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
            setPageLog('convertVialToKeymap', t('validation.selectValidVilFile'))
            return
        }
        
        // Show log modal when convert starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        setPageLog('convertVialToKeymap', convertMsg)
        void setState({
            ...state,
            tabDisabled: true
        })
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
            void setState({
                ...state,
                tabDisabled: false
            })
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
                    setVilObj({
                        name: file.name,
                        path: filePath
                    })
                    setDisabledVilCovertButton(false)
                } else {
                    setVilObj({ name: "", path: "" })
                    setDisabledVilCovertButton(true)
                }
            } catch (error) {
                console.error('Failed to get file path:', error)
                setVilObj({ name: "", path: "" })
                setDisabledVilCovertButton(true)
            }
        } else {
            setVilObj({ name: "", path: "" })
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
                            <Label className="mb-2 block" htmlFor="vil">{t('convert.vialFile')}</Label>
                            <div className="w-full">
                                <FileUpload
                                    id="vil"
                                    label={t('convert.chooseFile')}
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
                            title={(!vilObj.path || !vilObj.name) ? t('validation.selectVilFileFirst') : 'Convert Vial file to keymap.c'}
                        >
                            {t('convert.convertButton')}
                        </Button>
                    </div>
                </div>
                
            </div>
        </div>
    )
}
export default ConvertVialToKeymap