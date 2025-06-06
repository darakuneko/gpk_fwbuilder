import React, {useState} from "react"
import {useStateContext} from "../context.jsx"
import { Button, TextInput, Select } from 'flowbite-react'

const {api} = window

const Repository = ({onClose}) => {
    const {state, setState} = useStateContext()
    const [disabledBuildButton, setDisabledBuildButton] = useState(false)

    const isStaticFirmware = (firmware) => firmware === "QMK" || firmware === "Vial"
    const handleSelectFW = (e) => {
        state.repository.firmware = e.target.value
        setState(state)
    }

    const handleTextChange = (e) => {
        state.repository.firmwares = state.repository.firmwares
            .map(v => v.id === state.repository.firmware ? { ...v, url: e.target.value } : v);
        setState(state)
    }

    const handleUpdate = (msg1, msg2) => async () => {
        // Close modal immediately when update starts
        if (onClose) {
            onClose()
        }
        
        state.logs = msg1
        state.tabDisabled = true
        setState(state)
        if(isStaticFirmware(state.repository.firmware)) {
            await api.updateRepository(state.repository.firmware)
        } else {
            const obj = state.repository.firmwares.find(v => v.id === state.repository.firmware)
            await api.updateRepositoryCustom(obj)
        }

        let id
        const checkFn = async () => {
            const buildCompleted = await api.buildCompleted()
            const exist = await api.existSever()
            if (buildCompleted && exist) {
                state.build.tags = await api.tags()
                state.build.tag = state.build.tags[0]
                state.logs = msg2
                state.tabDisabled = false
                setState(state)
                clearInterval(id)
            }
        }
        id = setInterval(await checkFn, 1000)
    }

    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto">
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label htmlFor="repository-fw-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Firmware
                        </label>
                        <Select
                            id="repository-fw-select"
                            value={state.repository.firmware}
                            onChange={handleSelectFW}
                            required
                        >
                            {state.repository.firmwares.map((fw, i) =>
                                (<option
                                    key={`repository-fw-select${fw.id}`}
                                    value={fw.id}
                                >{fw.id}</option>)
                            )}
                        </Select>
                    </div>
                    
                    <div>
                        <label htmlFor="repository-custom-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Repository URL
                        </label>
                        <TextInput
                            type="text"
                            id="repository-custom-url"
                            placeholder="git clone url"
                            onChange={handleTextChange}
                            value={state.repository.firmwares.find(v => v.id === state.repository.firmware).url}
                            disabled={isStaticFirmware(state.repository.firmware)}
                            required
                        />
                    </div>
                </div>
                
                <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        If it stops due to a network error or other problem, please press the button again.
                    </p>
                </div>
                
                <div className="flex justify-center">
                    <Button
                        color="blue"
                        onClick={
                            handleUpdate("Updating.....\n\nIt will take a few minutes.\n\n",
                                "Updated!!")
                        }
                        disabled={state.tabDisabled}
                        size="lg"
                    >
                        Update Repository
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default Repository