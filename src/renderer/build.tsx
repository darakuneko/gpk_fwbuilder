import React, {useState, useEffect} from "react"
import {useStateContext} from "../context"
import { Button, Label, TextInput, Select, Checkbox, HelperText } from 'flowbite-react'

const {api} = window

interface BuildProps {
    onShowLogModal?: () => void;
    onOperationComplete?: () => void;
}

const Build: React.FC<BuildProps> = ({onShowLogModal, onOperationComplete}) => {
    const {state, setState, setPageLog} = useStateContext()
    
    // Guard against uninitialized state
    if (!state || !state.build || !state.repository) {
        return <div>Loading...</div>
    }
    const [keyboardEmptyError, setKeyboardEmptyError] = useState(false)
    const [keymapEmptyError, setKeymapEmptyError] = useState(false)
    const [keymapStrError, setKeymapStrError] = useState(false)
    const [disabledBuildButton, setDisabledBuildButton] = useState(true)
    const [disabledBuildText, setDisabledBuildText] = useState(false)
    const [disabledUseRepoButtonButton, setDisabledUseRepoButtonButton] = useState(false)
    const [init, setInit] = useState(true)
    const [keyboardList, setKeyboardList] = useState<string[]>([])

    const findFirmware = (state: any) => state.repository.firmwares.find((r: any) => r.id === state.build.fw)
    const getCommit = (state: any) => findFirmware(state)?.commit
    const setCommit = (state: any, commit: string) => {
        state.build.commit = commit
        findFirmware(state).commit = commit
    }
    const handleSelectFW = (e: React.ChangeEvent<HTMLSelectElement>) => {
        state.build.fw = e.target.value
        setCommit(state, getCommit(state))
        setState(state)
    }

    const validBuildButton = () => {
        const validKeymapStr = (/:|flash/).test(state.build.km)
        setKeymapStrError(validKeymapStr)
        const validDisableButton = state.build.kb && state.build.km && !validKeymapStr
        setDisabledBuildButton(!validDisableButton)
        setDisabledUseRepoButtonButton(validKeymapStr)
    }

    const initDisabledBuildButton = () => {
        validBuildButton()
        setInit(false)
        return disabledBuildButton
    }

    // Initialize component with stored values
    useEffect(() => {
        const initializeStoredValues = async () => {
            // Load keyboard list if keyboard is already selected
            if (state.build.kb) {
                const c = state.build.useRepo ? await api.listRemoteKeyboards(state.build.fw) : await api.listLocalKeyboards()
                state.keyboardList.kb = c?.length > 0 ? c.map(v => {
                    return {label: v.kb}
                }) : []
                setKeyboardList(c)
                
                // Load keymap list for selected keyboard
                if (c?.length > 0) {
                    const obj = c.find(v => v.kb === state.build.kb)
                    state.keyboardList.km = obj ? obj.km.map(v => {
                        return {label: v}
                    }) : []
                }
                
                setState(state)
            }
        }
        
        initializeStoredValues()
    }, []) // Empty dependency array ensures this runs only once on mount

    const handleTextChange = (inputName) => (e) => {
        if (inputName === 'commit') setCommit(state, e.target.value)
        setState(state)
    }

    const handleKbSelectChange = async (e) => {
        const selectedKb = e.target.value
        state.build.kb = selectedKb
        
        // Reset keymap when keyboard changes
        state.build.km = ''
        
        // Update keymap list based on selected keyboard
        if (selectedKb) {
            const obj = keyboardList.find(v => v.kb === selectedKb)
            state.keyboardList.km = obj ? obj.km.map(v => {
                return {label: v}
            }) : []
        } else {
            state.keyboardList.km = []
        }
        
        setKeyboardEmptyError(!state.build.kb)
        setKeymapEmptyError(!state.build.km)
        validBuildButton()
        setState(state)
    }

    const handleKmSelectChange = (e) => {
        state.build.km = e.target.value
        
        setKeymapEmptyError(!state.build.km)
        validBuildButton()
        setState(state)
    }

    const handleKbFocus = async () => {
        const c = state.build.useRepo ? await api.listRemoteKeyboards(state.build.fw) : await api.listLocalKeyboards()
        state.keyboardList.kb = c?.length > 0 ? c.map(v => {
            return {label: v.kb}
        }) : []
        setKeyboardList(c)
        
        // Update keymap list if keyboard is already selected
        if (state.build.kb && c?.length > 0) {
            const obj = c.find(v => v.kb === state.build.kb)
            state.keyboardList.km = obj ? obj.km.map(v => {
                return {label: v}
            }) : []
        }
        
        setState(state)
    }


    const handleSelectTags = (e) => {
        state.build.tag = e.target.value
        setState(state)
    }

    const handleUseRepoChange = (e) => {
        state.build.useRepo = e.target.checked
        setState(state)
    }

    const waiting = async (start, end, log, onCompleteCallback) => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        setPageLog('build', log)
        state.tabDisabled = true
        setState(state)
        await start()
        let id
        const checkFn = async () => {
            const buildCompleted = await end()
            if (buildCompleted) {
                setDisabledBuildButton(false)
                setDisabledBuildText(false)
                state.tabDisabled = false
                setState(state)
                clearInterval(id)
                if (onCompleteCallback) {
                    onCompleteCallback()
                }
            }
        }
        id = setInterval(checkFn, 1000)
    }

    const handleCheckout = async () => {
        // Show log modal when checkout starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        const start = async () => await api.checkout({
            fw: state.build.fw.toLowerCase(),
            tag: state.build.tag,
            commit: getCommit(state)
        })
        const end = async () => await api.buildCompleted()
        await waiting(start, end, "Checkout....")
        
        if (onOperationComplete) {
            onOperationComplete()
        }
    }

    const handleCopyKeyboardFile = async () => {
        await api.copyKeyboardFile({
            fw: state.build.fw.toLowerCase(),
            kb: state.build.kb
        })
    }

    const handleBuild = async () => {
        // Show log modal when build starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        const start = async () => await api.build(state.build)
        const end = async () => await api.buildCompleted()
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
                            {state.repository.firmwares.map((fw) =>
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
                                {(state.build.tags || []).map((tag, i) => (
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
                                value={getCommit(state)}
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
                            {(state.keyboardList.kb || []).map((kb) => (
                                <option key={kb.label} value={kb.label}>
                                    {kb.label}
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
                            {(state.keyboardList.km || []).map((km) => (
                                <option key={km.label} value={km.label}>
                                    {km.label}
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
                                onClick={disabledUseRepoButtonButton ? () => {} : handleCheckout}
                                disabled={false}
                            >
                                Refresh Keyboard List
                            </Button>
                            <Button
                                color="light"
                                className={disabledUseRepoButtonButton ? 'cursor-not-allowed' : 'cursor-pointer'}
                                style={disabledUseRepoButtonButton ? { opacity: 0.5 } : {}}
                                onClick={disabledUseRepoButtonButton ? () => {} : handleCopyKeyboardFile}
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
                        onClick={(init ? initDisabledBuildButton() : disabledBuildButton) ? () => {} : handleBuild}
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