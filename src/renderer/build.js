import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import FormHelperText from '@mui/material/FormHelperText'

import React, {useState} from "react"
import {useStateContext} from "../context"
import {formHelperTextFontSize, inputLabelMiddleFontSize} from "../style"
import Button from "@mui/material/Button"
import Autocomplete from "@mui/material/Autocomplete"

const {api} = window

const Build = () => {
    const {state, setState} = useStateContext()
    const [keyboardEmptyError, setKeyboardEmptyError] = useState(false)
    const [keymapEmptyError, setKeymapEmptyError] = useState(false)
    const [keymapStrError, setKeymapStrError] = useState(false)
    const [disabledBuildButton, setDisabledBuildButton] = useState(true)
    const [disabledBuildText, setDisabledBuildText] = useState(false)
    const [init, setInit] = useState(true)
    const [buildCache, setBuildCache] = useState([])
    const handleSelectFW = (e) => {
        state.build.fw = e.target.value
        setState(state)
    }

    const validBuildButton = () => {
        const validKeymapStr = (/:|flash/).test(state.build.km)
        setKeymapStrError(validKeymapStr)
        const validDisableButton = state.build.kb && state.build.km && !validKeymapStr
        setDisabledBuildButton(!validDisableButton)
    }

    const initDisabledBuildButton = () => {
        validBuildButton()
        setInit(false)
        return disabledBuildButton
    }

    const handleTextChange = (inputName) => (e, v) => {
        if(inputName === 'kb') state.build.kb = v ? v.label : ''
        if(inputName === 'km') state.build.km = v ? v.label : ''
        if(inputName === 'commit') state.build.commit = e.target.value

        setKeyboardEmptyError(!state.build.kb)
        setKeymapEmptyError(!state.build.km)
        validBuildButton()
        setState(state)
    }

    const handleKbFocus = async () => {
        const c = await api.buildCache()
        state.buildCache.kb = c.map(v => {
            return {label: v.kb}
        })
        setBuildCache(c)
        setState(state)
    }

    const handleKmFocus = async () => {
        const obj = buildCache.find(v => v.kb === state.build.kb)
        state.buildCache.km = obj ? obj.km.map(v => {
                return {label: v}
            }) : []
        setState(state)
    }

    const handleSelectTags = (e) => {
        state.build.tag = e.target.value
        setState(state)
    }

    const handleSubmit = async () => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        state.logs = "Building....\n\nIt will take some time if the first build or tag has changed.\n\n"
        state.tabDisabled = true
        setState(state)
        await api.build(state.build)
        let id
        const checkFn = async () => {
            const buildCompleted = await api.buildCompleted()
            if(buildCompleted){
                setDisabledBuildButton(false)
                setDisabledBuildText(false)
                state.tabDisabled = false
                setState(state)
                clearInterval(id)
            }
        }
        id = setInterval(checkFn, 1000)
    }

    return (
      <Box sx={{
          display: 'flex',
          flexDirection: 'column',
      }}>
          {state.build.tags.length > 0 ? (
              <Box
                  sx={{ p: 2,
                      display: 'flex',
                      alignContent: 'center',
                      justifyContent: 'center'}} >
                  <Box>
                      <InputLabel sx={{ fontSize: inputLabelMiddleFontSize }} >Firmware</InputLabel>
                      <Select
                          id="build-fw-select"
                          label="Firmware"
                          value={state.build.fw}
                          onChange={handleSelectFW}
                          required>
                          <MenuItem key="fw-qmk" value="qmk">QMK</MenuItem>
                          <MenuItem key="fw-vial" value="vial">Vial</MenuItem>
                      </Select>
                  </Box>
                  {state.build.fw === "qmk" ? (
                       <Box sx={{ pl: 4 }}>
                           <InputLabel sx={{ fontSize: inputLabelMiddleFontSize }} >Tag</InputLabel>
                           <Select
                               id="build-tags-select"
                               label="Tag"
                               value={state.build.tag}
                               onChange={handleSelectTags}
                               required>
                               {state.build.tags.map((tag, i) => (<MenuItem key={`tags-${i}`} value={tag}>{tag}</MenuItem>))}
                           </Select>
                       </Box>
                   ) : (
                       <Box sx={{ pt: 2 }}>
                           <TextField
                               id="build-commit"
                               label="commit(optional)"
                               disabled={disabledBuildText}
                               onChange={handleTextChange("commit")}
                               variant="standard"
                               value={state.build.commit}
                           />
                       </Box>
                   )}
                  <Box sx={{ pt: 2}}>
                      <Autocomplete
                          fullWidth
                          options={state.buildCache.kb}
                          renderInput={(params) =>
                              <TextField
                                  id="build-kb"
                                  label="keyboard"
                                  required
                                  error={keyboardEmptyError}
                                  onFocus={handleKbFocus}
                                  variant="standard"
                                  {...params}
                              />
                          }
                          value={state.build.kb}
                          disabled={disabledBuildText}
                          onChange={handleTextChange("kb")}
                      />

                  </Box>
                  <Box sx={{ pt: 2}}>
                      <Autocomplete
                          fullWidth
                          options={state.buildCache.km}
                          renderInput={(params) =>
                              <TextField
                                  id="build-km"
                                  label="keymap"
                                  required
                                  error={keymapEmptyError}
                                  onFocus={handleKmFocus}
                                  variant="standard"
                                  {...params}
                              />
                          }
                          value={state.build.km}
                          disabled={disabledBuildText}
                          onChange={handleTextChange("km")}
                      />
                      {
                          keymapStrError && <FormHelperText error sx={{ pl: 4, fontSize: formHelperTextFontSize}}>":" "flash" cannot be used</FormHelperText>
                      }
                  </Box>
              </Box>) : (<div/>)
              }
          <Box
              sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
              }} >
          <Button variant="contained"
                  onClick={handleSubmit}
                  disabled={init ? initDisabledBuildButton() : disabledBuildButton }
          >Build</Button>
          </Box>
      </Box>
  )
}
export default Build