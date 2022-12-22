import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import FormHelperText from '@mui/material/FormHelperText';

import React, {useState} from "react";
import {useStateContext} from "../context"
import {formHelperTextFontSize, inputLabelMiddleFontSize, inputLabelSmallFontSize} from "../style"
import Button from "@mui/material/Button";

const {api} = window

const Form = () => {
    const {state, setState} = useStateContext();
    const [keyboardError, setKeyboardError] = useState(false);
    const [keymapEmptyError, setKeymapEmptyError] = useState(false);
    const [keymapStrError, setKeymapStrError] = useState(false);
    const [disabledBuildButton, setDisabledBuildButton] = useState(true);
    const [disabledBuildText, setDisabledBuildText] = useState(false);
    const [disabledUpdateButton, setUpdateButton] = useState(false);
    const [init, setInit] = useState(true);

    const validBuildButton = () => {
        const validKeymapStr = (/:|flash/).test(state.km)
        setKeymapStrError(validKeymapStr)
        const validDisableButton = state.kb && state.km && !validKeymapStr
        setDisabledBuildButton(!validDisableButton)
    }

    const initDisabledBuildButton = () => {
        validBuildButton()
        setInit(false)
        return disabledBuildButton
    }

    const handleTextChange = (inputName) => (e) => {
        inputName === 'kb' ? state.kb = e.target.value : state.km = e.target.value
        setKeyboardError(!state.kb)
        setKeymapEmptyError(!state.km)
        validBuildButton()
        setState(state)
    }

    const handleSelectTags = (e) => {
        state.selectedTag = e.target.value
        setState(state)
    }

    const handleSubmit = async () => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        setUpdateButton(true)
        state.logs = {
            stderr: "",
            stdout: "Building....\n\nIt will take some time if the first build or tag has changed."
        }
        setState(state)
        const logs = await api.build(state)
        setDisabledBuildButton(false)
        setDisabledBuildText(false)
        setUpdateButton(false)
        state.logs = logs
        setState(state)
    }

    const handleUpdate = async () => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        setUpdateButton(true)
        state.logs = {
            stderr: "",
            stdout: "Updating.....\n\nIt will take a few minutes."
        }
        setState(state)
        await api.update(state.fw)
        state.tags = await api.tags()
        state.selectedTag = state.tags[0]
        setState(state)
        setDisabledBuildText(false)
        setUpdateButton(false)
        state.logs = {
            stderr: "",
            stdout: "Updated!!"
        }
        setState(state)
        validBuildButton()
    }

    return (
      <Box sx={{
          display: 'flex',
          flexDirection: 'column',
      }}>
          {state.fw === 'qmk' ? (
              <Box
                  sx={{ p: 2, display: 'flex', float: 'left'
              }} >
                  <Box sx={{ pr: 4}}>
                      <InputLabel sx={{ fontSize: inputLabelMiddleFontSize }} >Firmware</InputLabel>
                      <Select
                          id="fw-select"
                          label="Firmware"
                          value="qmk"
                          required>
                          <MenuItem key="fw-qmk" value="qmk">QMK</MenuItem>
                      </Select>
                      </Box>
                  <Box>
                      <InputLabel sx={{ fontSize: inputLabelMiddleFontSize }} >Tag</InputLabel>
                      <Select
                          id="tags-select"
                          label="Tag"
                          value={state.selectedTag}
                          onChange={handleSelectTags}
                          required>
                          {state.tags.map((tag, i) => (<MenuItem key={`tags-${i}`} value={tag}>{tag}</MenuItem>))}
                      </Select>
                  </Box>
                  <Box sx={{ pt: 2}}>
                    <TextField
                        id="kb"
                        label="keyboard"
                        required
                        error={keyboardError}
                        disabled={disabledBuildText}
                        onChange={handleTextChange("kb")}
                        variant="standard"
                        value={state.kb}
                    />
                  </Box>
                  <Box sx={{ pt: 2}}>
                    <TextField
                        id="km"
                        label="keymap"
                        required
                        error={keymapEmptyError}
                        disabled={disabledBuildText}
                        onChange={handleTextChange("km")}
                        variant="standard"
                        value={state.km}
                    />
                      {
                          keymapStrError && <FormHelperText error sx={{ pl: 4, fontSize: formHelperTextFontSize}}>":" "flash" cannot be used</FormHelperText>
                      }

                  </Box>
                  <Box sx={{
                      pt: 4,
                      pl: 6,
                      pr: 2,
                      textAlign: "center"
                  }}>
                      <InputLabel sx={{ fontSize: inputLabelSmallFontSize }} >{state.fw.toUpperCase()} Repository</InputLabel>
                      <Button variant="contained"
                              onClick={handleUpdate}
                              disabled={disabledUpdateButton}
                      >Update</Button>
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
export default Form