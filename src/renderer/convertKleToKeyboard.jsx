import React, {useState} from "react"
import {useStateContext} from "../context.jsx"
import { Button, Label, TextInput, Select, Checkbox, HelperText } from 'flowbite-react'
import PinSelectorModal from "../components/PinSelectorModal.jsx"
import FileUpload from "../components/FileUpload.jsx"

const {api} = window

const ConvertKleToKeyboard = ({onShowLogModal, onOperationComplete}) => {
    const {state, setState, setPageLog} = useStateContext()
    
    const [kleObj, setKleObj] = useState({
        name : "",
        path : "",
    })
    const [pinCols, setPinCols] = React.useState([]);
    const [pinRows, setPinRows] = React.useState([]);
    const [showRowsModal, setShowRowsModal] = useState(false);
    const [showColsModal, setShowColsModal] = useState(false);

    const [keyboardError, setKeyboardError] = useState(false)
    const [usernameEmptyError, setUsernameEmptyError] = useState(false)
    const [vidEmptyError, setVidEmptyError] = useState(false)
    const [pidEmptyError, setPidEmptyError] = useState(false)
    const [colsEmptyError, setColsEmptyError] = useState(false)
    const [rowsEmptyError, setRowsEmptyError] = useState(false)

    const [keyboardStrError, setKeyboardStrError] = useState(false)
    const [usernameStrError, setUsernameStrError] = useState(false)
    const [vidStrError, setVidStrError] = useState(false)
    const [pidStrError, setPidStrError] = useState(false)

    const [pidSameError, setPidSameError] = useState(false)
    const [kleFileError, setKleFileError] = useState(false)
    const [kleFileErrorMessage, setKleFileErrorMessage] = useState("")

    const [KleOptions, setKleOptions] = useState({
        vial : false,
        via : false
    })
    const [disabledKleConvertButton, setDisabledKleConvertButton] = useState(true)
    const [disabledConvertText, setDisabledConvertText] = useState(false)

    // Guard against uninitialized state
    if (!state || !state.convert) {
        return <div>Loading...</div>
    }

    const validKleConvertButton = () => {
        const kle = state.convert.kle
        const reg1 = /^[A-Za-z0-9 _/-]+$/
        const reg2 = /^[A-Z0-9x]+$/
        const isViaObj = state.convert.kle.option === 2
        let validKeyboardStrError = false
        let validUsernameStrError = false
        let validVidStrError = false
        let validPidStrError = false
        let validPidSameError = false

        if(kle.kb.length > 0){
            validKeyboardStrError = (reg1).test(kle.kb)
            setKeyboardStrError(!validKeyboardStrError)
        }
        if(kle.user.length > 0){
            validUsernameStrError = (reg1).test(kle.user)
            setUsernameStrError(!validUsernameStrError)
        }
        if(kle.vid.length > 0){
            validVidStrError = (reg2).test(kle.vid)
            setVidStrError(!validVidStrError)
        }
        if(kle.pid.length > 0){
            validPidStrError = (reg2).test(kle.pid)
            setPidStrError(!validPidStrError)
            validPidSameError = kle.pid !== "0x0000"
            setPidSameError(!validPidSameError)
        }
        const uploadedKleFile = kleObj.name.length > 0

        const validDisableButton = (m2) => {
            const m1 = kle.kb && kle.user && kle.vid && kle.pid && validKeyboardStrError && validUsernameStrError && validVidStrError
                && validPidStrError && validPidSameError && uploadedKleFile
            return m1 && m2
        }

        setDisabledKleConvertButton(isViaObj ? !validDisableButton(true) : !validDisableButton(kle.rows && kle.cols))
    }

    const validKleEmpty = () => {
        setKeyboardError(!state.convert.kle.kb)
        setUsernameEmptyError(!state.convert.kle.user)
        setVidEmptyError(!state.convert.kle.vid)
        setPidEmptyError(!state.convert.kle.pid)
        setRowsEmptyError(state.convert.kle.option === 2 ? false : !state.convert.kle.rows)
        setColsEmptyError(state.convert.kle.option === 2 ? false : !state.convert.kle.cols)
    }

    const handleTextChange = (inputName) => (e) => {
        const v = e.target.value
        if(inputName === 'kb') state.convert.kle.kb = v
        if(inputName === 'user') state.convert.kle.user = v
        if(inputName === 'vid') state.convert.kle.vid = v
        if(inputName === 'pid') state.convert.kle.pid = v
        if(inputName === 'rows') {
            state.convert.kle.rows = v.length > 0 ? v.join(',') : undefined
            setPinRows(v)
        }
        if(inputName === 'cols') {
            state.convert.kle.cols = v.length > 0 ? v.join(',') : undefined
            setPinCols(v)
        }

        validKleEmpty()
        validKleConvertButton()
        setState(state)
    }

    const handleSelectMCU = (e) => {
        state.convert.kle.mcu = e.target.value
        state.convert.kle.rows = undefined
        state.convert.kle.cols = undefined
        setState(state)
        setPinRows([])
        setPinCols([])
        validKleConvertButton()
    }

    const convertMsg =  "Convert...."
    const handleKleFileSubmit =  () => async () => {
        // Show log modal when conversion starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        setDisabledKleConvertButton(true)
        setDisabledConvertText(true)
        setPageLog('convertKleToKeyboard', convertMsg)
        state.tabDisabled = true
        setState(state)
        const logs = await api.convertKleJson({params: state.convert.kle, file: kleObj})

        setDisabledKleConvertButton(false)
        setDisabledConvertText(false)
        setPageLog('convertKleToKeyboard', logs)
        state.tabDisabled = false
        setState(state)
        
        if (onOperationComplete) {
            onOperationComplete()
        }
    }

    const handleKleFileUpload = async (e) => {
        const file = e.target.files[0]
        setKleFileError(false)
        setKleFileErrorMessage("")
        
        if (!file) return
        
        try {
            // Validate file type
            if (!file.name.toLowerCase().endsWith('.json')) {
                setKleFileError(true)
                setKleFileErrorMessage("Please select a valid JSON file.")
                return
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setKleFileError(true)
                setKleFileErrorMessage("File size must be less than 10MB.")
                return
            }
            
            kleObj.name = file.name
            kleObj.path = window.webUtils.getPathForFile(file)
            setKleObj({...kleObj})

            try {
                const json = await api.readJson(kleObj.path)
                
                // Validate JSON structure
                if (!Array.isArray(json)) {
                    setKleFileError(true)
                    setKleFileErrorMessage("Invalid KLE JSON format. Expected an array.")
                    return
                }
                
                // Extract metadata from KLE JSON
                const obj = json.filter(v => !Array.isArray(v))[0]
                if (obj) {
                    if (obj.name) state.convert.kle.kb = obj.name
                    if (obj.author) state.convert.kle.user = obj.author
                }
                
                setState(state)
                validKleConvertButton()
            } catch (jsonError) {
                console.error("JSON parsing error:", jsonError)
                setKleFileError(true)
                setKleFileErrorMessage("Invalid JSON file. Please check the file format.")
                kleObj.name = ""
                kleObj.path = ""
                setKleObj({...kleObj})
            }
        } catch (error) {
            console.error("File upload error:", error)
            setKleFileError(true)
            setKleFileErrorMessage("Failed to read file. Please try again.")
            kleObj.name = ""
            kleObj.path = ""
            setKleObj({...kleObj})
        }
    }

    const handleKleOptionChange = (i) => async (e) => {
        if(i === 1){
            KleOptions.vial = e.target.checked
            if(e.target.checked) KleOptions.via = false
        }
        if(i === 2){
            KleOptions.via = e.target.checked
            if(e.target.checked) KleOptions.vial = false
        }
        setKleOptions(KleOptions)

        if(KleOptions.vial) {
            state.convert.kle.option = 1
        } else if(KleOptions.via) {
            state.convert.kle.option = 2
        } else {
            state.convert.kle.option = 0
        }
        setState(state)
        validKleEmpty()
        validKleConvertButton()
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* File Upload */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block" htmlFor="kle-file">KLE JSON File *</Label>
                            <FileUpload
                                id="kle-file"
                                label="Choose KLE JSON File"
                                accept=".json"
                                onChange={handleKleFileUpload}
                                filename={kleObj.name}
                                variant="outlined"
                            />
                        </div>
                        {kleFileError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    ✗ {kleFileErrorMessage}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Configuration - All settings in one frame */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label className="mb-1 block" htmlFor="convert-kle-mcu-select">MCU</Label>
                            <Select
                                id="convert-kle-mcu-select"
                                value={state.convert.kle.mcu}
                                onChange={handleSelectMCU}
                                required
                                sizing="sm"
                            >
                                <option value="RP2040">RP2040</option>
                                <option value="promicro">Pro Micro</option>
                            </Select>
                        </div>
                        
                        <div>
                            <Label
                                className={`mb-1 block ${keyboardError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="convert-kle-kb"
                            >
                                Keyboard Name *
                            </Label>
                            <TextInput
                                type="text"
                                id="convert-kle-kb"
                                required
                                color={keyboardError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("kb")}
                                value={state.convert.kle.kb}
                                sizing="sm"
                            />
                            {keyboardStrError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    A-Za-z0-9 _/- can be used
                                </HelperText>
                            )}
                        </div>
                        
                        <div>
                            <Label
                                className={`mb-1 block ${usernameEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="km"
                            >
                                Username *
                            </Label>
                            <TextInput
                                type="text"
                                id="km"
                                required
                                color={usernameEmptyError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("user")}
                                value={state.convert.kle.user}
                                sizing="sm"
                            />
                            {usernameStrError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    A-Za-z0-9 _/- can be used
                                </HelperText>
                            )}
                        </div>
                        
                        <div>
                            <Label
                                className={`mb-1 block ${vidEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="vid"
                            >
                                Vendor ID *
                            </Label>
                            <TextInput
                                type="text"
                                id="vid"
                                required
                                color={vidEmptyError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("vid")}
                                value={state.convert.kle.vid}
                                sizing="sm"
                            />
                            {vidStrError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    A-Z0-9x can be used
                                </HelperText>
                            )}
                        </div>
                        
                        <div>
                            <Label
                                className={`mb-1 block ${pidEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="pid"
                            >
                                Product ID *
                            </Label>
                            <TextInput
                                type="text"
                                id="pid"
                                required
                                color={pidEmptyError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("pid")}
                                value={state.convert.kle.pid}
                                sizing="sm"
                            />
                            {pidStrError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    A-Z0-9x can be used
                                </HelperText>
                            )}
                            {pidSameError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    Must be other than 0x0000
                                </HelperText>
                            )}
                        </div>

                        {/* Output Options - horizontal layout */}
                        <div>
                            <Label className="mb-3 block">Output Options</Label>
                            <div className="flex gap-6">
                                <div className="flex items-center">
                                    <Checkbox
                                        id="vial-settings"
                                        checked={state.convert.kle.option === 1}
                                        onChange={handleKleOptionChange(1)}
                                        className="mr-2"
                                    />
                                    <Label htmlFor="vial-settings" className="text-sm">
                                        Add Vial Settings
                                    </Label>
                                </div>
                                <div className="flex items-center">
                                    <Checkbox
                                        id="only-via"
                                        checked={state.convert.kle.option === 2}
                                        onChange={handleKleOptionChange(2)}
                                        className="mr-2"
                                    />
                                    <Label htmlFor="only-via" className="text-sm">
                                        Only via.json
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Matrix Configuration - only when not "Only via.json" */}
                        {state.convert.kle.option !== 2 && (
                            <>
                                {/* Rows Configuration */}
                                <div>
                                    <Label 
                                        className={`mb-2 block ${rowsEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                    >
                                        Matrix pins - rows *
                                    </Label>
                                    <Button
                                        color="light"
                                        onClick={disabledConvertText ? () => {} : () => setShowRowsModal(true)}
                                        disabled={false}
                                        className={disabledConvertText ? 'cursor-not-allowed w-full' : 'cursor-pointer w-full'}
                                        style={disabledConvertText ? { opacity: 0.5 } : {}}
                                    >
                                        <div className="text-left w-full">
                                            {pinRows.length > 0 ? (
                                                <span className="text-gray-900 dark:text-white">
                                                    Selected: {pinRows.join(', ')} ({pinRows.length} pins)
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Select row pins...
                                                </span>
                                            )}
                                        </div>
                                    </Button>
                                    {rowsEmptyError && (
                                        <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                            Please select row pins
                                        </HelperText>
                                    )}
                                </div>

                                {/* Cols Configuration */}
                                <div>
                                    <Label 
                                        className={`mb-2 block ${colsEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                    >
                                        Matrix pins - cols *
                                    </Label>
                                    <Button
                                        color="light"
                                        onClick={disabledConvertText ? () => {} : () => setShowColsModal(true)}
                                        disabled={false}
                                        className={disabledConvertText ? 'cursor-not-allowed w-full' : 'cursor-pointer w-full'}
                                        style={disabledConvertText ? { opacity: 0.5 } : {}}
                                    >
                                        <div className="text-left w-full">
                                            {pinCols.length > 0 ? (
                                                <span className="text-gray-900 dark:text-white">
                                                    Selected: {pinCols.join(', ')} ({pinCols.length} pins)
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Select column pins...
                                                </span>
                                            )}
                                        </div>
                                    </Button>
                                    {colsEmptyError && (
                                        <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                            Please select column pins
                                        </HelperText>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            
                {/* Convert Button */}
                <div className="pt-2">
                    <Button
                        color="blue"
                        className={`w-full ${disabledKleConvertButton ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        style={disabledKleConvertButton ? { opacity: 0.5 } : {}}
                        onClick={disabledKleConvertButton ? () => {} : handleKleFileSubmit()}
                        disabled={false}
                    >
                        Convert
                    </Button>
                </div>
            </div>

            {/* Pin Selector Modals */}
            <PinSelectorModal
                isOpen={showRowsModal}
                onClose={() => setShowRowsModal(false)}
                title="Matrix Pins - Rows Selection"
                availablePins={state.convert.kle.mcu === 'promicro' ? state.convert.pins.promicro : state.convert.pins.rp2040}
                selectedPins={pinRows}
                onConfirm={(pins) => {
                    setPinRows(pins)
                    state.convert.kle.rows = pins.length > 0 ? pins.join(',') : undefined
                    setState(state)
                    setRowsEmptyError(pins.length === 0)
                    validKleConvertButton()
                }}
            />

            <PinSelectorModal
                isOpen={showColsModal}
                onClose={() => setShowColsModal(false)}
                title="Matrix Pins - Columns Selection"
                availablePins={state.convert.kle.mcu === 'promicro' ? state.convert.pins.promicro : state.convert.pins.rp2040}
                selectedPins={pinCols}
                onConfirm={(pins) => {
                    setPinCols(pins)
                    state.convert.kle.cols = pins.length > 0 ? pins.join(',') : undefined
                    setState(state)
                    setColsEmptyError(pins.length === 0)
                    validKleConvertButton()
                }}
            />
        </div>
    )
}
export default ConvertKleToKeyboard