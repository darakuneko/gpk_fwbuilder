import React, {useState, webUtils} from "react"
import {useStateContext} from "../context.jsx"
import { Button, Label, TextInput, Select, Checkbox, HelperText, FileInput } from 'flowbite-react'
import MultiSelect from "../components/MultiSelect.jsx"

const {api} = window

const Convert = () => {
    const {state, setState} = useStateContext()
    const [vilObj, setVilObj] = useState({
        name : "",
        path : "",
    })
    const [kleObj, setKleObj] = useState({
        name : "",
        path : "",
    })
    const [pinCols, setPinCols] = React.useState([]);
    const [pinRows, setPinRows] = React.useState([]);

    const [disabledVilCovertButton, setDisabledVilCovertButton] = useState(true)

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
        setState(state)
        setPinRows([])
        setPinCols([])
    }

    const convertMsg =  "Convert...."
    const handleKleFileSubmit =  () => async () => {
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


    const handleVilFileSubmit = async () => {
        state.logs = convertMsg
        state.tabDisabled = true
        setState(state)
        setDisabledVilCovertButton(true)
        const log = await api.convertVilJson(vilObj)
        state.logs = log
        state.tabDisabled = false
        setState(state)
        setDisabledVilCovertButton(false)
    }


    const handleVilFileUpload = async (e) => {
        const file = e.target.files[0]
        if (file){
            vilObj.name = file.name
            vilObj.path = window.webUtils.getPathForFile(file)
            setVilObj({...vilObj, vilObj })
        }
        if (vilObj.name.length > 0) setDisabledVilCovertButton(false)
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Vial to Keymap Section */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Convert Vial export files (.vil) to QMK keymap.c files for custom keyboard firmware.
                    </p>
                    
                    {/* File Input and Conversion */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                        <h5 className="font-medium mb-3 text-gray-800 dark:text-gray-200">File Input</h5>
                        <div className="space-y-4">
                            <div>
                                <Label className="mb-2 block" htmlFor="vil">Vial file (.vil)</Label>
                                <FileInput
                                    id="vil"
                                    accept=".vil"
                                    onChange={handleVilFileUpload}
                                />
                                {vilObj.name && (
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                                        Selected: {vilObj.name}
                                    </p>
                                )}
                            </div>
                            <Button
                                color="blue"
                                className={`w-full ${disabledVilCovertButton ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                style={disabledVilCovertButton ? { opacity: 0.5 } : {}}
                                onClick={disabledVilCovertButton ? () => {} : handleVilFileSubmit}
                                disabled={false}
                            >
                                Convert
                            </Button>
                        </div>
                    </div>
                </div>
                
                {/* KLE to QMK/Vial Section */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Convert Keyboard Layout Editor (KLE) JSON files to complete QMK/Vial keyboard firmware.
                    </p>
                    
                    {/* File Upload */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded p-4 mb-4">
                        <h5 className="font-medium mb-3 text-gray-800 dark:text-gray-200">KLE File Input</h5>
                        <div>
                            <Label className="mb-2 block" htmlFor="kle">KLE JSON file</Label>
                            <FileInput
                                id="kle"
                                accept=".json"
                                onChange={handleKleFileUpload}
                            />
                            {kleObj.name && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                                    Selected: {kleObj.name}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {/* Configuration Section */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded p-4 mb-4">
                        <h5 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Configuration</h5>
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
                                <Label className="mb-1 block">Output Options</Label>
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
                    
                    {/* Keyboard Information Section */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded p-4 mb-4">
                        <h5 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Keyboard Information</h5>
                        <div className="grid grid-cols-1 gap-4">
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
                        </div>
                    </div>
                    
                    {/* Matrix Pins Section */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded p-4 mb-4">
                        <h5 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Matrix Pin Configuration</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Configure the GPIO pins for your keyboard matrix. Not required for "Only via.json" option.
                        </p>
                        <div className="space-y-4">
                            <MultiSelect
                                id="convert-kle-rows"
                                label="Matrix Pins - Rows"
                                options={state.convert.kle.mcu === 'promicro' ? state.convert.pins.promicro : state.convert.pins.rp2040}
                                value={pinRows}
                                onChange={handleTextChange("rows")}
                                error={rowsEmptyError}
                                disabled={state.convert.kle.option === 2 ? true : disabledConvertText}
                                required
                                className="w-full max-w-4xl"
                            />
                            <MultiSelect
                                id="convert-kle-cols"
                                label="Matrix Pins - Columns"
                                options={state.convert.kle.mcu === 'promicro' ? state.convert.pins.promicro : state.convert.pins.rp2040}
                                value={pinCols}
                                onChange={handleTextChange("cols")}
                                error={colsEmptyError}
                                disabled={state.convert.kle.option === 2 ? true : disabledConvertText}
                                required
                                className="w-full max-w-4xl"
                            />
                        </div>
                    </div>
                    
                    {/* Convert Button */}
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
        </div>
    )
}
export default Convert