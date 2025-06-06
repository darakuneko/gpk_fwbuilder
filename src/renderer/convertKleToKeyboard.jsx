import React, {useState} from "react"
import {useStateContext} from "../context.jsx"
import { Button, Label, TextInput, Select, Checkbox } from 'flowbite-react'
import MultiSelect from "../components/MultiSelect.jsx"
import FileUpload from "../components/FileUpload.jsx"

const {api} = window

const ConvertKleToKeyboard = ({onClose}) => {
    const {state, setState} = useStateContext()
    const [kleObj, setKleObj] = useState({
        name : "",
        path : "",
    })
    const [pinCols, setPinCols] = React.useState([]);
    const [pinRows, setPinRows] = React.useState([]);

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
        
        if (onClose) {
            onClose()
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
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                
                <div className="mb-6">
                    <FileUpload
                        id="kle"
                        label="KLE Json file"
                        accept=".json"
                        onChange={handleKleFileUpload}
                        filename={kleObj.name}
                        className="max-w-sm mx-auto"
                    />
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="convert-kle-mcu-select" value="MCU" />
                            </div>
                            <Select
                                id="convert-kle-mcu-select"
                                value={state.convert.kle.mcu}
                                onChange={handleSelectMCU}
                                required
                            >
                                <option value="RP2040">RP2040</option>
                                <option value="promicro">Pro Micro</option>
                            </Select>
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label value="Options" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Checkbox
                                        id="vial-settings"
                                        checked={state.convert.kle.option === 1}
                                        onChange={handleKleOptionChange(1)}
                                    />
                                    <Label htmlFor="vial-settings" className="ml-2">
                                        Add Vial Settings
                                    </Label>
                                </div>
                                <div className="flex items-center">
                                    <Checkbox
                                        id="only-via"
                                        checked={state.convert.kle.option === 2}
                                        onChange={handleKleOptionChange(2)}
                                    />
                                    <Label htmlFor="only-via" className="ml-2">
                                        Only via.json
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>
                
                    <div className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="convert-kle-kb"
                                    value="Keyboard *"
                                    color={keyboardError ? "failure" : "gray"}
                                />
                            </div>
                            <TextInput
                                type="text"
                                id="convert-kle-kb"
                                required
                                color={keyboardError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("kb")}
                                value={state.convert.kle.kb}
                            />
                            {keyboardStrError && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                    A-Za-z0-9 _/- can used
                                </p>
                            )}
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="km"
                                    value="Username *"
                                    color={usernameEmptyError ? "failure" : "gray"}
                                />
                            </div>
                            <TextInput
                                type="text"
                                id="km"
                                required
                                color={usernameEmptyError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("user")}
                                value={state.convert.kle.user}
                            />
                            {usernameStrError && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                    A-Za-z0-9 _/- can used
                                </p>
                            )}
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="vid"
                                    value="Vendor ID *"
                                    color={vidEmptyError ? "failure" : "gray"}
                                />
                            </div>
                            <TextInput
                                type="text"
                                id="vid"
                                required
                                color={vidEmptyError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("vid")}
                                value={state.convert.kle.vid}
                            />
                            {vidStrError && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                    A-Z0-9x can used
                                </p>
                            )}
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="pid"
                                    value="Product ID *"
                                    color={pidEmptyError ? "failure" : "gray"}
                                />
                            </div>
                            <TextInput
                                type="text"
                                id="pid"
                                required
                                color={pidEmptyError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("pid")}
                                value={state.convert.kle.pid}
                            />
                            {pidStrError && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                    A-Z0-9x can used
                                </p>
                            )}
                            {pidSameError && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                    other than 0x0000
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            
                <div className="space-y-4 mb-6">
                    <MultiSelect
                        id="convert-kle-rows"
                        label="Matrix pins - rows *"
                        options={state.convert.kle.mcu === 'promicro' ? state.convert.pins.promicro : state.convert.pins.rp2040}
                        value={pinRows}
                        onChange={handleTextChange("rows")}
                        error={rowsEmptyError}
                        disabled={state.convert.kle.option === 2 ? true : disabledConvertText}
                        required
                    />
                    <MultiSelect
                        id="convert-kle-cols"
                        label="Matrix pins - cols *"
                        options={state.convert.kle.mcu === 'promicro' ? state.convert.pins.promicro : state.convert.pins.rp2040}
                        value={pinCols}
                        onChange={handleTextChange("cols")}
                        error={colsEmptyError}
                        disabled={state.convert.kle.option === 2 ? true : disabledConvertText}
                        required
                    />
                </div>
            
                <div className="flex justify-center">
                    <Button
                        color="blue"
                        onClick={handleKleFileSubmit()}
                        disabled={disabledKleConvertButton}
                        size="lg"
                    >
                        Convert
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default ConvertKleToKeyboard