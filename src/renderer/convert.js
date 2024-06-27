import React, {useState} from "react"
import {useStateContext} from "../context"
import {formHelperTextFontSize, inputLabelMiddleFontSize, textFieldLongWidth} from "../style"
import Button from "@mui/material/Button"
import InputLabel from "@mui/material/InputLabel"
import Box from "@mui/material/Box"
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import Chip from "@mui/material/Chip";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";

const {api} = window

const Convert = () => {
    const {state, setState} = useStateContext()
    const [viaObj, setViaObj] = useState({
        info: {
            name : "",
            path : "",
        },
        kle: {
            name : "",
            path : "",
        },
    })
    const [kleObj, setKleObj] = useState({
        name : "",
        path : "",
    })
    const [pinCols, setPinCols] = React.useState([]);
    const [pinRows, setPinRows] = React.useState([]);

    const [disabledViaCovertButton, setDisabledViaCovertButton] = useState(true)

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
            kleObj.path = file.path
            setKleObj({...kleObj, kleObj })

            const json = await api.readJson(file.path)
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
    const ValidTextField = (str) => (<FormHelperText error sx={{ pl: 4, fontSize: formHelperTextFontSize}}>{str}</FormHelperText>)

    const ValidKBUSRTextField = ValidTextField('A-Za-z0-9 _/- can used')
    const ValidVidPidTextField = ValidTextField('A-Z0-9x can used')
    const ValidPidSameTextField = ValidTextField('other than 0x0000')

    const handleviaObjSubmit = async () => {
        state.logs = convertMsg
        state.tabDisabled = true
        setState(state)
        setDisabledViaCovertButton(true)
        const log = await api.convertViaJson(viaObj)
        state.logs = log
        state.tabDisabled = false
        setState(state)
        setDisabledViaCovertButton(false)
    }

    const handleViaFileUpload = async (e) => {
        const file = e.target.files[0]
        const id = e.target.id
        if (file){
            const obj = {
                name: file.name,
                path: file.path
            }
            id === "info" ? viaObj.info = obj : viaObj.kle = obj
            setViaObj({...viaObj, viaObj })
        }
        if (viaObj.info.name.length > 0 && viaObj.kle.name.length > 0) setDisabledViaCovertButton(false)
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Box sx={{ pt: 2, textAlign: "center"}}>QMK info.json + KLE Json = via.json</Box>
            <Box
                sx={{
                    pt: 2,
                    pl: 4,
                    pr: 6,
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'center'}} >
                <Box>
                    <Button
                        component="label"
                        variant="outlined"
                        sx={{ mr: 4, width: "25ch"}}
                    >
                        info json
                        <input id="info" type="file" accept=".json" hidden onChange={handleViaFileUpload} />
                    </Button>
                    <InputLabel sx={{ textAlign: "center", fontSize: inputLabelMiddleFontSize }} >{viaObj.info.name}</InputLabel>
                </Box>
                <Box>
                    <Button
                        component="label"
                        variant="outlined"
                        sx={{ mr: 4, width: "25ch"}}
                    >
                        kle Json
                        <input id="kle" type="file" accept=".json" hidden onChange={handleViaFileUpload} />
                    </Button>
                    <InputLabel sx={{ textAlign: "center", fontSize: inputLabelMiddleFontSize }} >{viaObj.kle.name}</InputLabel>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }} >
                    <Button variant="contained"
                            onClick={handleviaObjSubmit}
                            disabled={ disabledViaCovertButton }
                    >Convert</Button>
                </Box>
            </Box>
            <Box sx={{ pt: 4, textAlign: "center"}} >Convert from KLE Json to QMK/Vial files</Box>
            <Box sx={{ pt: 2, textAlign: "center"}} >
                <Button
                    component="label"
                    variant="outlined"
                    sx={{ width: "25ch"}}
                >
                    kle Json
                    <input id="kle" type="file" accept=".json" hidden onChange={handleKleFileUpload} />
                </Button>
                <InputLabel sx={{ textAlign: "center", fontSize: inputLabelMiddleFontSize }} >{kleObj.name}</InputLabel>
            </Box>
            <Box sx={{
                display: 'flex',
                alignContent: 'center',
                justifyContent: 'space-around'
            }}>
                <Box
                    sx={{
                        pr: 4,
                        pt: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }} >
                    <Box>
                        <InputLabel sx={{ fontSize: inputLabelMiddleFontSize }} >MCU</InputLabel>
                        <Select
                            id="convert-kle-mcu-select"
                            label="MCU"
                            value={state.convert.kle.mcu}
                            onChange={handleSelectMCU}
                            required>
                            <MenuItem key="convert-kle-mcu-rp2040" value="RP2040">RP2040</MenuItem>
                            <MenuItem key="convert-kle-mcu-promicro" value="promicro">Pro Micro</MenuItem>
                        </Select>
                    </Box>
                    <Box sx={{ pt: 2}}>
                        <InputLabel sx={{ fontSize: inputLabelMiddleFontSize }} >Option</InputLabel>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={state.convert.kle.option === 1} onChange={handleKleOptionChange(1)} />} label="Add Vial Settings" />
                            <FormControlLabel control={<Checkbox checked={state.convert.kle.option === 2} onChange={handleKleOptionChange(2)} />} label="Only via.json" />
                        </FormGroup>
                    </Box>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Box>
                        <TextField
                            id="convert-kle-kb"
                            label="keyboard"
                            required
                            error={keyboardError}
                            disabled={disabledConvertText}
                            onChange={handleTextChange("kb")}
                            variant="standard"
                            style = {{width: textFieldLongWidth}}
                            value={state.convert.kle.kb}
                        />
                        {keyboardStrError && ValidKBUSRTextField}
                    </Box>
                    <Box>
                        <TextField
                            id="km"
                            label="username"
                            required
                            error={usernameEmptyError}
                            disabled={disabledConvertText}
                            onChange={handleTextChange("user")}
                            variant="standard"
                            style = {{width: textFieldLongWidth}}
                            value={state.convert.kle.user}
                        />
                        {usernameStrError && ValidKBUSRTextField}
                    </Box>
                    <Box>
                        <TextField
                            id="vid"
                            label="Vendor ID"
                            required
                            error={vidEmptyError}
                            disabled={disabledConvertText}
                            onChange={handleTextChange("vid")}
                            variant="standard"
                            style = {{width: textFieldLongWidth}}
                            value={state.convert.kle.vid}
                        />
                        {vidStrError && ValidVidPidTextField}
                    </Box>
                    <Box>
                        <TextField
                            id="pid"
                            label="Product ID"
                            required
                            error={pidEmptyError}
                            disabled={disabledConvertText}
                            onChange={handleTextChange("pid")}
                            variant="standard"
                            style = {{width: textFieldLongWidth}}
                            value={state.convert.kle.pid}
                        />
                        {pidStrError && ValidVidPidTextField}
                        {pidSameError && ValidPidSameTextField}
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    pt: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: "center",
                    alignItems: "center"
                }} >
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 800 }}>
                        <InputLabel id="convert-kle-rows-label">matrix pins - rows</InputLabel>
                        <Select
                            labelId="convert-kle-rows-label"
                            id="convert-kle-rows"
                            label="matrix pins - rows"
                            onChange={handleTextChange("rows")}
                            error={rowsEmptyError}
                            disabled={state.convert.kle.option === 2 ? true : disabledConvertText }
                            required
                            multiple
                            autoWidth
                            value={pinRows}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {pinRows.map((v) => ( <Chip key={v} label={v} />))}
                                </Box>
                            )}
                        >
                            {   state.convert.kle.mcu === 'promicro' ?
                                state.convert.pins.promicro.map((v) => ( <MenuItem key={v} value={v}>{v}</MenuItem> )) :
                                state.convert.pins.rp2040.map((v) => ( <MenuItem key={v} value={v}>{v}</MenuItem> ))
                            }
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 800 }}>
                        <InputLabel id="convert-kle-cols-label">matrix pins - cols</InputLabel>
                        <Select
                            labelId="convert-kle-cols-label"
                            id="convert-kle-cols"
                            label="matrix pins - cols"
                            onChange={handleTextChange("cols")}
                            error={rowsEmptyError}
                            disabled={state.convert.kle.option === 2 ? true : disabledConvertText }
                            required
                            multiple
                            autoWidth
                            value={pinCols}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {pinCols.map((v) => ( <Chip key={v} label={v} />))}
                                </Box>
                            )}
                        >
                            {   state.convert.kle.mcu === 'promicro' ?
                                state.convert.pins.promicro.map((v) => ( <MenuItem key={v} value={v}>{v}</MenuItem> )) :
                                state.convert.pins.rp2040.map((v) => ( <MenuItem key={v} value={v}>{v}</MenuItem> ))
                            }
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            <Box
                sx={{
                    pt: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }} >
                <Button variant="contained"
                        onClick={handleKleFileSubmit()}
                        disabled={ disabledKleConvertButton }
                >Convert</Button>
            </Box>
        </Box>
    )
}
export default Convert