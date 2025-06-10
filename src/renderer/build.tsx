import React, {useState, useEffect} from 'react'
import { Button, Label, TextInput, Select, Checkbox, HelperText } from 'flowbite-react'

import {useStateContext} from "../context"
import type { AppState, Firmware } from "../context"

const {api} = window

interface BuildProps {
    onShowLogModal?: () => void;
    onOperationComplete?: () => void;
}

const Build: React.FC<BuildProps> = ({onShowLogModal, onOperationComplete}): React.ReactElement => {
    const {state, setState, setPageLog} = useStateContext()
    const [keyboardEmptyError, setKeyboardEmptyError] = useState(false)
    const [keymapEmptyError, setKeymapEmptyError] = useState(false)
    const [keymapStrError, setKeymapStrError] = useState(false)
    const [disabledBuildButton, setDisabledBuildButton] = useState(true)
    const [disabledBuildText, setDisabledBuildText] = useState(false)
    const [disabledUseRepoButtonButton, setDisabledUseRepoButtonButton] = useState(false)
    const [init, setInit] = useState(true)
    const [keyboardList, setKeyboardList] = useState<{kb: string; km: string[]}[]>([])
    
    // Initialize component with stored values
    useEffect((): void => {
        const initializeStoredValues = async (): Promise<void> => {
            // Load keyboard list if keyboard is already selected
            if (state?.build?.kb) {
                const c = state.build.useRepo ? await api.listRemoteKeyboards(state.build.fw) : await api.listLocalKeyboards()
                const keyboards = c as {kb: string; km: string[]}[]
                state.keyboardList.kb = keyboards?.length > 0 ? keyboards.map((v): string => v.kb) : []
                setKeyboardList(keyboards)
                
                // Load keymap list for selected keyboard
                if (keyboards?.length > 0) {
                    const obj = keyboards.find((v): boolean => v.kb === state.build.kb)
                    state.keyboardList.km = obj ? obj.km : []
                }
                
                if (state) {
                    void setState(state)
                }
            }
        }
        
        void initializeStoredValues()
    }, [setState, state]) // Add dependencies

    // Guard against uninitialized state
    if (!state || !state.build || !state.repository) {
        return <div>Loading...</div>
    }

    const findFirmware = (state: AppState): Firmware | undefined => state.repository.firmwares.find((r): boolean => r.id === state.build.fw)
    const getCommit = (state: AppState): string | undefined => findFirmware(state)?.commit
    const setCommit = (state: AppState, commit: string): void => {
        state.build.commit = commit
        const firmware = findFirmware(state)
        if (firmware) {
            firmware.commit = commit
        }
    }
    const handleSelectFW = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        state.build.fw = e.target.value
        const commit = getCommit(state)
        if (commit) {
            setCommit(state, commit)
        }
        void setState(state)
    }

    const validBuildButton = (): void => {
        const validKeymapStr = (/:|flash/).test(state.build.km || '')
        setKeymapStrError(validKeymapStr)
        const validDisableButton = state.build.kb && state.build.km && !validKeymapStr
        setDisabledBuildButton(!validDisableButton)
        setDisabledUseRepoButtonButton(validKeymapStr)
    }

    const initDisabledBuildButton = (): boolean => {
        validBuildButton()
        setInit(false)
        return disabledBuildButton
    }

    const handleTextChange = (inputName: string): ((e: React.ChangeEvent<HTMLInputElement>) => void) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (inputName === 'commit') setCommit(state, e.target.value)
        void setState(state)
    }

    const handleKbSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
        const selectedKb = e.target.value
        state.build.kb = selectedKb
        
        // Reset keymap when keyboard changes
        state.build.km = ''
        
        // Update keymap list based on selected keyboard
        if (selectedKb) {
            const obj = keyboardList.find((v): boolean => v.kb === selectedKb)
            state.keyboardList.km = obj ? obj.km : []
        } else {
            state.keyboardList.km = []
        }
        
        setKeyboardEmptyError(!state.build.kb)
        setKeymapEmptyError(!state.build.km)
        validBuildButton()
        void setState(state)
    }

    const handleKmSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        state.build.km = e.target.value
        
        setKeymapEmptyError(!state.build.km)
        validBuildButton()
        void setState(state)
    }

    const handleKbFocus = async (): Promise<void> => {
        const c = state.build.useRepo ? await api.listRemoteKeyboards(state.build.fw) : await api.listLocalKeyboards()
        const keyboards = c as {kb: string; km: string[]}[]
        state.keyboardList.kb = keyboards?.length > 0 ? keyboards.map((v): string => v.kb) : []
        setKeyboardList(keyboards)
        
        // Update keymap list if keyboard is already selected
        if (state.build.kb && keyboards?.length > 0) {
            const obj = keyboards.find((v): boolean => v.kb === state.build.kb)
            state.keyboardList.km = obj ? obj.km : []
        }
        
        void setState(state)
    }


    const handleSelectTags = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        state.build.tag = e.target.value
        void setState(state)
    }

    const handleUseRepoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        state.build.useRepo = e.target.checked
        void setState(state)
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

    const handleCheckout = async (): Promise<void> => {
        // Show log modal when checkout starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        const start = async (): Promise<unknown> => await api.checkout({
            fw: state.build.fw.toLowerCase(),
            tag: state.build.tag,
            commit: getCommit(state) || ''
        })
        const end = async (): Promise<unknown> => await api.buildCompleted()
        await waiting(start, end, "Checkout....")
        
        if (onOperationComplete) {
            onOperationComplete()
        }
    }

    const handleCopyKeyboardFile = async (): Promise<void> => {
        await api.copyKeyboardFile({
            fw: state.build.fw.toLowerCase(),
            kb: state.build.kb
        })
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
                        <Label className="mb-2 block" htmlFor="build-fw-select">Firmware</Label>
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
                            <Label className="mb-2 block" htmlFor="build-tags-select">Tag</Label>
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
                            <Label className="mb-2 block" htmlFor="build-commit">commit(optional)</Label>
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
                            Keyboard *
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
                            <option value="">Select keyboard...</option>
                            {(state.keyboardList.kb || []).map((kb): React.ReactElement => (
                                <option key={kb} value={kb}>
                                    {kb}
                                </option>
                            ))}
                        </Select>
                        {keyboardEmptyError && (
                            <HelperText className="mt-2 text-sm text-red-600 dark:text-red-500">Keyboard is required</HelperText>
                        )}
                    </div>
                    <div>
                        <Label 
                            className={`mb-2 block ${keymapEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`} 
                            htmlFor="build-km-select"
                        >
                            Keymap *
                        </Label>
                        <Select
                            id="build-km-select"
                            value={state.build.km || ''}
                            onChange={handleKmSelectChange}
                            disabled={disabledBuildText || !state.build.kb}
                            className={keymapEmptyError ? 'border-red-500' : ''}
                            required
                        >
                            <option value="">Select keymap...</option>
                            {(state.keyboardList.km || []).map((km): React.ReactElement => (
                                <option key={km} value={km}>
                                    {km}
                                </option>
                            ))}
                        </Select>
                        {keymapEmptyError && (
                            <HelperText className="mt-2 text-sm text-red-600 dark:text-red-500">Keymap is required</HelperText>
                        )}
                        {keymapStrError && (
                            <HelperText className="mt-2 text-sm text-red-600 dark:text-red-500">":" "flash" cannot be used</HelperText>
                        )}
                    </div>
                                        
                    <div className="flex items-center mb-4">
                        <Checkbox
                            id="use-repo"
                            checked={state.build.useRepo ? state.build.useRepo : false}
                            onChange={handleUseRepoChange}
                        />
                        <Label htmlFor="use-repo" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Use Repository Keyboards File
                        </Label>
                    </div>
                    
                    {/* Repository Actions */}
                    {state.build.useRepo && (
                        <div className="flex justify-center items-center gap-2">
                            <Button
                                color="light"
                                className={disabledUseRepoButtonButton ? 'cursor-not-allowed' : 'cursor-pointer'}
                                style={disabledUseRepoButtonButton ? { opacity: 0.5 } : {}}
                                onClick={disabledUseRepoButtonButton ? (): void => {} : handleCheckout}
                                disabled={false}
                            >
                                Refresh Keyboard List
                            </Button>
                            <Button
                                color="light"
                                className={disabledUseRepoButtonButton ? 'cursor-not-allowed' : 'cursor-pointer'}
                                style={disabledUseRepoButtonButton ? { opacity: 0.5 } : {}}
                                onClick={disabledUseRepoButtonButton ? (): void => {} : handleCopyKeyboardFile}
                                disabled={false}
                            >
                                Copy Keyboard File
                            </Button>
                        </div>
                    )}
                                        
                    <Button
                        color="blue"
                        className={`w-full ${(init ? initDisabledBuildButton() : disabledBuildButton) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        style={(init ? initDisabledBuildButton() : disabledBuildButton) ? { opacity: 0.5 } : {}}
                        onClick={(init ? initDisabledBuildButton() : disabledBuildButton) ? (): void => {} : handleBuild}
                        disabled={false}
                    >
                        Build
                    </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Build