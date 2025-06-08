import React, {useState} from "react"
import {useStateContext} from "../context.jsx"
import { Button, Label, TextInput, Select, Checkbox } from 'flowbite-react'
import PinSelectorModal from "../components/PinSelectorModal.jsx"
import FileUpload from "../components/FileUpload.jsx"

const {api} = window

const ConvertKleToKeyboard = ({onShowLogModal, onOperationComplete}) => {
    const {state, setState} = useStateContext()
    
    // Guard against uninitialized state
    if (!state || !state.convert) {
        return <div>Loading...</div>
    }
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

    const [KleOptions, setKleOptions] = useState({
        vial : false,
        via : false
    })
    const [disabledKleConvertButton, setDisabledKleConvertButton] = useState(true)
    const [disabledConvertText, setDisabledConvertText] = useState(false)

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
        state.convert.kle.rows = []
        state.convert.kle.cols = []
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
        state.logs = convertMsg
        state.tabDisabled = true
        setState(state)

        const logs = await api.convertKleJson({params: state.convert.kle, file: kleObj})

        setDisabledKleConvertButton(false)
        setDisabledConvertText(false)
        state.logs = logs
        state.tabDisabled = false
        setState(state)
        
        if (onOperationComplete) {
            onOperationComplete()
        }
    }

    const handleKleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (file){
            kleObj.name = file.name
            kleObj.path = window.webUtils.getPathForFile(file)
            setKleObj({...kleObj, kleObj })

            const json = await api.readJson(kleObj.path)
            const obj = json.filter(v => !Array.isArray(v))[0]
            if (obj.name) state.convert.kle.kb = obj.name
            if (obj.author) state.convert.kle.user = obj.author
            setState(state)
            validKleConvertButton()
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
            <div className="max-w-3xl mx-auto space-y-4">
                
                {/* File Upload */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-white">KLE File</h4>
                    <FileUpload
                        id="kle"
                        label="KLE Json file"
                        accept=".json"
                        onChange={handleKleFileUpload}
                        filename={kleObj.name}
                    />
                </div>

                {/* Configuration */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="convert-kle-mcu-select" value="MCU" className="mb-1" />
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
                            <Label value="Output Options" className="mb-1" />
                            <div className="space-y-1">
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
                    </div>
                </div>

                {/* Keyboard Information */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Keyboard Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label
                                htmlFor="convert-kle-kb"
                                value="Keyboard Name *"
                                color={keyboardError ? "failure" : "gray"}
                                className="mb-1"
                            />
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
                                <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    A-Za-z0-9 _/- can used
                                </p>
                            )}
                        </div>
                        <div>
                            <Label
                                htmlFor="km"
                                value="Username *"
                                color={usernameEmptyError ? "failure" : "gray"}
                                className="mb-1"
                            />
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
                                <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    A-Za-z0-9 _/- can used
                                </p>
                            )}
                        </div>
                        <div>
                            <Label
                                htmlFor="vid"
                                value="Vendor ID *"
                                color={vidEmptyError ? "failure" : "gray"}
                                className="mb-1"
                            />
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
                                <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    A-Z0-9x can used
                                </p>
                            )}
                        </div>
                        <div>
                            <Label
                                htmlFor="pid"
                                value="Product ID *"
                                color={pidEmptyError ? "failure" : "gray"}
                                className="mb-1"
                            />
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
                                <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    A-Z0-9x can used
                                </p>
                            )}
                            {pidSameError && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    other than 0x0000
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            
                {/* Matrix Configuration */}
                {state.convert.kle.option !== 2 && (
                    <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                        <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Matrix Pin Configuration</h4>
                        <div className="space-y-3">
                            {/* Rows Configuration */}
                            <div>
                                <Label 
                                    value="Matrix pins - rows *" 
                                    className={`mb-2 block ${rowsEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                />
                                <Button
                                    color="light"
                                    onClick={() => setShowRowsModal(true)}
                                    disabled={disabledConvertText}
                                    className="w-full"
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
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                                        Please select row pins
                                    </p>
                                )}
                            </div>

                            {/* Cols Configuration */}
                            <div>
                                <Label 
                                    value="Matrix pins - cols *" 
                                    className={`mb-2 block ${colsEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                />
                                <Button
                                    color="light"
                                    onClick={() => setShowColsModal(true)}
                                    disabled={disabledConvertText}
                                    className="w-full"
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
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                                        Please select column pins
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            
                {/* Convert Button */}
                <div className="flex justify-center pt-2">
                    <Button
                        color="blue"
                        onClick={handleKleFileSubmit()}
                        disabled={disabledKleConvertButton}
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
                    state.convert.kle.rows = pins
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
                    state.convert.kle.cols = pins
                    setState(state)
                    setColsEmptyError(pins.length === 0)
                    validKleConvertButton()
                }}
            />
        </div>
    )
}
export default ConvertKleToKeyboard