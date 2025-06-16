import React, {useState, useEffect, useRef} from 'react'
import { Button, Label, TextInput, Select, HelperText } from 'flowbite-react'

import {useStateContext} from "../context"
import type { AppState, Firmware } from "../context"
import { useI18n } from '../hooks/useI18n'

const {api} = window

interface BuildProps {
    onShowLogModal?: () => void;
    onOperationComplete?: () => void;
}

const Build: React.FC<BuildProps> = ({onShowLogModal, onOperationComplete}): React.ReactElement => {
    const {state, setState, setPageLog} = useStateContext()
    const { t } = useI18n()
    const [keyboardEmptyError, setKeyboardEmptyError] = useState(false)
    const [keymapEmptyError, setKeymapEmptyError] = useState(false)
    const [keymapStrError, setKeymapStrError] = useState(false)
    const [disabledBuildButton, setDisabledBuildButton] = useState(true)
    const [disabledBuildText, setDisabledBuildText] = useState(false)
    const [init, setInit] = useState(true)
    const keyboardDataRef = useRef<{kb: string; km: string[]}[]>([])
    
    // Initialize component with stored values
    useEffect((): void => {
        const initializeStoredValues = async (): Promise<void> => {
            // Only initialize if we have state and keyboard is selected but keyboardList is empty
            if (state?.build?.kb && (!state.keyboardList.kb || state.keyboardList.kb.length === 0)) {
                const c = await api.listLocalKeyboards()
                const keyboards = c as {kb: string; km: string[]}[]
                keyboardDataRef.current = keyboards
                
                // Create a new state object to avoid mutation
                const newState = { ...state }
                newState.keyboardList = { ...state.keyboardList }
                newState.keyboardList.kb = keyboards?.length > 0 ? keyboards.map((v): string => v.kb) : []
                
                // Load keymap list for selected keyboard
                if (keyboards?.length > 0) {
                    const obj = keyboards.find((v): boolean => v.kb === state.build.kb)
                    newState.keyboardList.km = obj ? obj.km : []
                }
                
                void setState(newState)
            }
        }
        
        void initializeStoredValues()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Dependencies intentionally omitted to prevent infinite loop

    // Guard against uninitialized state
    if (!state || !state.build || !state.repository) {
        return <div>Loading...</div>
    }

    const findFirmware = (state: AppState): Firmware | undefined => state.repository.firmwares.find((r): boolean => r.id === state.build.fw)
    const getCommit = (state: AppState): string | undefined => {
        // First check if there's saved data for this firmware
        const savedData = state.buildDataPerFirmware[state.build.fw]
        if (savedData && savedData.commit) {
            return savedData.commit
        }
        // Fallback to current build commit or firmware default
        return state.build.commit || findFirmware(state)?.commit
    }
    const setCommit = (state: AppState, commit: string): void => {
        state.build.commit = commit
        // Also update the saved data for this firmware
        if (!state.buildDataPerFirmware) {
            state.buildDataPerFirmware = {}
        }
        if (!state.buildDataPerFirmware[state.build.fw]) {
            state.buildDataPerFirmware[state.build.fw] = {
                tag: state.build.tag,
                tags: state.build.tags,
                kb: state.build.kb,
                km: state.build.km,
                commit: commit,
                useRepo: state.build.useRepo
            }
        } else {
            state.buildDataPerFirmware[state.build.fw]!.commit = commit
        }
        // Keep firmware repository commit in sync for backward compatibility
        const firmware = findFirmware(state)
        if (firmware) {
            firmware.commit = commit
        }
    }
    const handleSelectFW = async (e: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
        const selectedFw = e.target.value
        
        // Create a new state object to avoid mutation
        const newState = { ...state }
        newState.build = { ...state.build }
        newState.buildDataPerFirmware = { ...state.buildDataPerFirmware }
        
        // Save current firmware data
        if (state.build.fw) {
            newState.buildDataPerFirmware[state.build.fw] = {
                tag: state.build.tag,
                tags: state.build.tags,
                kb: state.build.kb,
                km: state.build.km,
                commit: state.build.commit,
                useRepo: state.build.useRepo
            }
        }
        
        newState.build.fw = selectedFw
        
        // Load data for selected firmware
        const savedData = state.buildDataPerFirmware[selectedFw]
        if (savedData) {
            // Restore saved data
            newState.build = {
                ...newState.build,
                ...savedData
            }
            
            // Update keymap list if keyboard is selected
            if (savedData.kb && keyboardDataRef.current.length > 0) {
                const obj = keyboardDataRef.current.find((v): boolean => v.kb === savedData.kb)
                newState.keyboardList.km = obj ? obj.km : []
            }
        } else {
            // Initialize new firmware data
            if (selectedFw === "QMK") {
                // Load tags for QMK
                try {
                    const tags = await api.tags()
                    newState.build.tags = tags
                    newState.build.tag = tags.length > 0 ? tags[0]! : ''
                } catch {
                    // If tags fail to load, fallback to empty
                    newState.build.tags = []
                    newState.build.tag = ''
                }
            } else {
                // For non-QMK firmwares, clear tags and set default commit from firmware config
                newState.build.tags = []
                newState.build.tag = ''
                
                // Get the default commit for this specific firmware from repository
                const firmware = newState.repository.firmwares.find((f): boolean => f.id === selectedFw)
                const defaultCommit = firmware?.commit || ''
                newState.build.commit = defaultCommit
            }
            
            // Reset keyboard and keymap for new firmware
            newState.build.kb = ''
            newState.build.km = ''
            newState.keyboardList.km = []
        }
        
        void setState(newState)
        validBuildButton(newState.build)
    }

    const validBuildButton = (buildState?: typeof state.build): void => {
        const currentBuild = buildState || state.build
        const validKeymapStr = (/:|flash/).test(currentBuild.km || '')
        setKeymapStrError(validKeymapStr)
        const validDisableButton = currentBuild.kb && currentBuild.km && !validKeymapStr
        setDisabledBuildButton(!validDisableButton)
    }

    const initDisabledBuildButton = (): boolean => {
        validBuildButton()
        setInit(false)
        return disabledBuildButton
    }

    const handleTextChange = (inputName: string): ((e: React.ChangeEvent<HTMLInputElement>) => void) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newState = { ...state }
        if (inputName === 'commit') {
            setCommit(newState, e.target.value)
        }
        void setState(newState)
    }

    const handleKbSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const selectedKb = e.target.value
        
        // Create new state object to ensure React detects changes
        const newState = { ...state }
        newState.build = { ...state.build }
        newState.keyboardList = { ...state.keyboardList }
        
        newState.build.kb = selectedKb
        newState.build.km = '' // Reset keymap when keyboard changes
        
        // Update keymap list based on selected keyboard
        if (selectedKb && keyboardDataRef.current.length > 0) {
            const obj = keyboardDataRef.current.find((v): boolean => v.kb === selectedKb)
            newState.keyboardList.km = obj ? obj.km : []
        } else {
            newState.keyboardList.km = []
        }
        
        setKeyboardEmptyError(!selectedKb)
        setKeymapEmptyError(true) // Always true when keymap is reset
        
        void setState(newState)
        validBuildButton(newState.build)
    }

    const handleKmSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const selectedKm = e.target.value
        
        // Create new state object to ensure React detects changes
        const newState = { ...state }
        newState.build = { ...state.build }
        newState.build.km = selectedKm
        
        setKeymapEmptyError(!selectedKm)
        
        void setState(newState)
        validBuildButton(newState.build)
    }

    const handleKbFocus = async (): Promise<void> => {
        try {
            const c = await api.listLocalKeyboards()
            const keyboards = c as {kb: string; km: string[]}[]
            
            // Update ref for keyboard selection handler
            keyboardDataRef.current = keyboards
            
            // Create new state object to ensure React detects changes
            const newState = { ...state }
            newState.keyboardList = { ...state.keyboardList }
            newState.keyboardList.kb = keyboards?.length > 0 ? keyboards.map((v): string => v.kb) : []
            
            // Update keymap list if keyboard is already selected
            if (state.build.kb && keyboards?.length > 0) {
                const obj = keyboards.find((v): boolean => v.kb === state.build.kb)
                newState.keyboardList.km = obj ? obj.km : []
            }
            
            void setState(newState)
        } catch (error) {
            console.error('Failed to load keyboard list:', error)
        }
    }


    const handleSelectTags = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const selectedTag = e.target.value
        
        // Create a new state object to avoid mutation
        const newState = { ...state }
        newState.build = { ...state.build }
        newState.build.tag = selectedTag
        
        void setState(newState)
    }


    const waiting = async (start: () => Promise<unknown>, end: () => Promise<unknown>, log: string, onCompleteCallback?: () => void): Promise<void> => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        setPageLog('build', log)
        state.tabDisabled = true
        void setState(state)
        
        await start()
        
        let id: ReturnType<typeof setInterval>
        const checkFn = async (): Promise<void> => {
            const buildCompleted = await end()
            if (buildCompleted) {
                setDisabledBuildButton(false)
                setDisabledBuildText(false)
                state.tabDisabled = false
                void setState(state)
                clearInterval(id)
                if (onCompleteCallback) {
                    onCompleteCallback()
                }
            }
        }
        id = setInterval(checkFn, 1000)
    }



    const handleBuild = async (): Promise<void> => {
        // Show log modal when build starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        const start = async (): Promise<unknown> => await api.build(state.build)
        const end = async (): Promise<unknown> => await api.buildCompleted()
        await waiting(start, end,
            "Building....\n\nIt will take some time if the first build or tag has changed.\n\n")
        
        if (onOperationComplete) {
            onOperationComplete()
        }
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="grid grid-cols-1 gap-4">
                    <div>
                        <Label className="mb-2 block" htmlFor="build-fw-select">{t('build.firmware')}</Label>
                        <Select
                            id="build-fw-select"
                            value={state.build.fw}
                            onChange={handleSelectFW}
                            required
                        >
                            {state.repository.firmwares.map((fw): React.ReactElement =>
                                (<option
                                    key={`fw-${fw.id}`}
                                    value={fw.id}
                                >{fw.id}</option>)
                            )}
                        </Select>
                    </div>
                    {state.build.fw === "QMK" ? (
                        <div>
                            <Label className="mb-2 block" htmlFor="build-tags-select">{t('build.tag')}</Label>
                            <Select
                                id="build-tags-select"
                                value={state.build.tag || ''}
                                onChange={handleSelectTags}
                                required
                            >
                                {(state.build.tags || []).map((tag, i): React.ReactElement => (
                                    <option key={`tags-${i}`} value={tag}>{tag}</option>
                                ))}
                            </Select>
                        </div>
                    ) : (
                        <div>
                            <Label className="mb-2 block" htmlFor="build-commit">{t('build.commit')} (optional)</Label>
                            <TextInput
                                type="text"
                                id="build-commit"
                                disabled={disabledBuildText}
                                onChange={handleTextChange("commit")}
                                value={getCommit(state) || ''}
                            />
                        </div>
                    )}
                    <div>
                        <Label 
                            className={`mb-2 block ${keyboardEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`} 
                            htmlFor="build-kb-select"
                        >
{t('common.keyboardName')} *
                        </Label>
                        <Select
                            id="build-kb-select"
                            value={state.build.kb || ''}
                            onChange={handleKbSelectChange}
                            onFocus={handleKbFocus}
                            disabled={disabledBuildText}
                            className={keyboardEmptyError ? 'border-red-500' : ''}
                            required
                        >
                            <option value="">{t('common.selectKeyboard')}</option>
                            {(state.keyboardList.kb || []).map((kb): React.ReactElement => (
                                <option key={kb} value={kb}>
                                    {kb}
                                </option>
                            ))}
                        </Select>
                        {keyboardEmptyError && (
                            <HelperText className="mt-2 text-sm text-red-600 dark:text-red-500">{t('validation.keyboardRequired')}</HelperText>
                        )}
                    </div>
                    <div>
                        <Label 
                            className={`mb-2 block ${keymapEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`} 
                            htmlFor="build-km-select"
                        >
{t('common.keymap')} *
                        </Label>
                        <Select
                            id="build-km-select"
                            value={state.build.km || ''}
                            onChange={handleKmSelectChange}
                            disabled={disabledBuildText || !state.build.kb}
                            className={keymapEmptyError ? 'border-red-500' : ''}
                            required
                        >
                            <option value="">{t('common.selectKeymap')}</option>
                            {(state.keyboardList.km || []).map((km): React.ReactElement => (
                                <option key={km} value={km}>
                                    {km}
                                </option>
                            ))}
                        </Select>
                        {keymapEmptyError && (
                            <HelperText className="mt-2 text-sm text-red-600 dark:text-red-500">{t('validation.keymapRequired')}</HelperText>
                        )}
                        {keymapStrError && (
                            <HelperText className="mt-2 text-sm text-red-600 dark:text-red-500">{t('validation.invalidKeymapChars')}</HelperText>
                        )}
                    </div>
                                        
                    
                                        
                    <Button
                        color="blue"
                        className={`w-full ${(init ? initDisabledBuildButton() : disabledBuildButton) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        style={(init ? initDisabledBuildButton() : disabledBuildButton) ? { opacity: 0.5 } : {}}
                        onClick={(init ? initDisabledBuildButton() : disabledBuildButton) ? (): void => {} : (): void => { void handleBuild() }}
                        disabled={false}
                    >
{t('build.buildButton')}
                    </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Build