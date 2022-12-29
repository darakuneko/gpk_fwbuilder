import React, {useState} from "react"
import {useStateContext} from "../context"
import {inputLabelMiddleFontSize} from "../style"
import Button from "@mui/material/Button"
import InputLabel from "@mui/material/InputLabel"
import Box from "@mui/material/Box"

const {api} = window

const Convert = () => {
    const {state, setState} = useStateContext()
    const [json, setJson] = useState({
        info: {
            name : "",
            path : "",
        },
        kle: {
            name : "",
            path : "",
        },
    })
    const [disabledCovertButton, setDisabledCovertButton] = useState(true)

    const handleSubmit = async () => {
        state.logs = "Convert...."
        state.tabDisabled = true
        setState(state)
        setDisabledCovertButton(true)
        const log = await api.convertViaJson(json)
        state.logs = log
        state.tabDisabled = false
        setState(state)
        setDisabledCovertButton(false)
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        const id = e.target.id
        if (file){
            const obj = {
                name: file.name,
                path: file.path
            }
            id === "info" ? json.info = obj : json.kle = obj
            setJson({...json, json })
        }
        if (json.info.name.length > 0 && json.kle.name.length > 0) setDisabledCovertButton(false)
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Box sx={{ pt: 2, textAlign: "center"}}>Convert via.json using QMK info.json and KLE Json</Box>
            <Box
                sx={{ p: 2,
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
                        <input id="info" type="file" accept=".json" hidden onChange={handleFileUpload} />
                    </Button>
                    <InputLabel sx={{ textAlign: "center", fontSize: inputLabelMiddleFontSize }} >{json.info.name}</InputLabel>
                </Box>
                <Box>
                    <Button
                        component="label"
                        variant="outlined"
                        sx={{ width: "25ch"}}
                    >
                        kle Json
                        <input id="kle" type="file" accept=".json" hidden onChange={handleFileUpload} />
                    </Button>
                    <InputLabel sx={{ textAlign: "center", fontSize: inputLabelMiddleFontSize }} >{json.kle.name}</InputLabel>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }} >
                <Button variant="contained"
                        onClick={handleSubmit}
                        disabled={ disabledCovertButton }
                >Convert</Button>
            </Box>
        </Box>
    )
}
export default Convert