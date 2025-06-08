import React, {useState} from "react"
import {useStateContext} from "../context.jsx"
import { Button, Label, TextInput, Select, Checkbox } from 'flowbite-react'
import FlowbiteAutocomplete from "../components/FlowbiteAutocomplete.jsx"

const {api} = window

const Build = ({onShowLogModal, onOperationComplete}) => {
    const {state, setState} = useStateContext()
    
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
    const [keyboardList, setKeyboardList] = useState([])

    const findFirmware = (state) => state.repository.firmwares.find(r => r.id === state.build.fw)
    const getCommit = (state) => findFirmware(state)?.commit
    const setCommit = (state, commit) => {
        state.build.commit = commit
        findFirmware(state).commit = commit
    }
    const handleSelectFW = (e) => {
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

    const handleTextChange = (inputName) => (e, v) => {
        if (inputName === 'kb') state.build.kb = v ? v.label : ''
        if (inputName === 'km') state.build.km = v ? v.label : ''
        if (inputName === 'commit') setCommit(state, e.target.value)
        
        setKeyboardEmptyError(!state.build.kb)
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
        setState(state)
    }

    const handleKmFocus = async () => {
        const obj = keyboardList.find(v => v.kb === state.build.kb)
        state.keyboardList.km = obj ? obj.km.map(v => {
            return {label: v}
        }) : []
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
        state.logs = log
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
            <div className="max-w-4xl mx-auto">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="build-fw-select" value="Firmware" />
                        </div>
                        <Select
                            id="build-fw-select"
                            value={state.build.fw}
                            onChange={handleSelectFW}
                            required
                        >
                            {state.repository.firmwares.map((fw, i) =>
                                (<option
                                    key={`fw-${fw.id}`}
                                    value={fw.id}
                                >{fw.id}</option>)
                            )}
                        </Select>
                    </div>
                    {state.build.fw === "QMK" ? (
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="build-tags-select" value="Tag" />
                            </div>
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
                            <div className="mb-2 block">
                                <Label htmlFor="build-commit" value="commit(optional)" />
                            </div>
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
                        <FlowbiteAutocomplete
                            id="build-kb"
                            label="keyboard"
                            required
                            error={keyboardEmptyError}
                            options={state.keyboardList.kb}
                            value={state.build.kb}
                            disabled={disabledBuildText}
                            onChange={handleTextChange("kb")}
                            onFocus={handleKbFocus}
                        />
                    </div>
                    <div>
                        <FlowbiteAutocomplete
                            id="build-km"
                            label="keymap"
                            required
                            error={keymapEmptyError}
                            options={state.keyboardList.km}
                            value={state.build.km}
                            disabled={disabledBuildText}
                            onChange={handleTextChange("km")}
                            onFocus={handleKmFocus}
                        />
                        {keymapStrError && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                ":" "flash" cannot be used
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="mb-6">
                    <div className="flex items-center justify-center">
                        <Checkbox
                            id="use-repo"
                            checked={state.build.useRepo ? state.build.useRepo : false}
                            onChange={handleUseRepoChange}
                        />
                        <Label htmlFor="use-repo" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Use Repository Keyboards File
                        </Label>
                    </div>
                </div>
                
                <div className="flex justify-center items-center gap-2">
                    {state.build.useRepo && (
                        <>
                            <Button
                                color="light"
                                onClick={handleCheckout}
                                disabled={disabledUseRepoButtonButton}
                            >
                                Refresh Keyboard List
                            </Button>
                            <Button
                                color="light"
                                onClick={handleCopyKeyboardFile}
                                disabled={disabledUseRepoButtonButton}
                            >
                                Copy Keyboard File
                            </Button>
                        </>
                    )}
                    <Button
                        color="blue"
                        onClick={handleBuild}
                        disabled={init ? initDisabledBuildButton() : disabledBuildButton}
                    >
                        Build
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default Build