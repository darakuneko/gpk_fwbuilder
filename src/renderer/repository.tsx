import React from "react"
import {useStateContext} from "../context"
import { Button, TextInput, Select, Label } from 'flowbite-react'

const {api} = window

const Repository = ({onShowLogModal, onOperationComplete}) => {
    const {state, setState, setPageLog} = useStateContext()
    
    // Guard against uninitialized state
    if (!state || !state.repository) {
        return <div>Loading...</div>
    }

    const isStaticFirmware = (firmware) => firmware === "QMK" || firmware === "Vial"
    const handleSelectFW = (e) => {
        if (!state.repository) return
        state.repository.firmware = e.target.value
        setState(state)
    }

    const handleTextChange = (e) => {
        if (!state.repository?.firmwares) return
        state.repository.firmwares = state.repository.firmwares
            .map(v => v.id === state.repository.firmware ? { ...v, url: e.target.value } : v);
        setState(state)
    }

    const handleUpdate = (msg1, msg2) => async () => {
        // Show log modal when update starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        setPageLog('repository', msg1)
        state.tabDisabled = true
        setState(state)
        if(isStaticFirmware(state.repository?.firmware)) {
            await api.updateRepository(state.repository.firmware)
        } else {
            const obj = state.repository?.firmwares?.find(v => v.id === state.repository?.firmware)
            if (obj) await api.updateRepositoryCustom(obj)
        }

        let id
        const checkFn = async () => {
            const buildCompleted = await api.buildCompleted()
            const exist = await api.existSever()
            if (buildCompleted && exist) {
                state.build.tags = await api.tags()
                state.build.tag = state.build.tags[0]
                setPageLog('repository', msg2)
                state.tabDisabled = false
                setState(state)
                clearInterval(id)
                
                // Operation complete
                if (onOperationComplete) {
                    onOperationComplete()
                }
            }
        }
        id = setInterval(checkFn, 1000)
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block" htmlFor="repository-fw-select">
                                Firmware
                            </Label>
                            <Select
                                id="repository-fw-select"
                                value={state.repository?.firmware || ''}
                                onChange={handleSelectFW}
                                required
                            >
                                {(state.repository?.firmwares || []).map((fw) =>
                                    (<option
                                        key={`repository-fw-select${fw.id}`}
                                        value={fw.id}
                                    >{fw.id}</option>)
                                )}
                            </Select>
                        </div>
                        
                        <div>
                            <Label className="mb-2 block" htmlFor="repository-custom-url">
                                Repository URL
                            </Label>
                            <TextInput
                                type="text"
                                id="repository-custom-url"
                                placeholder="git clone url"
                                onChange={handleTextChange}
                                value={state.repository?.firmwares?.find(v => v.id === state.repository?.firmware)?.url || ''}
                                disabled={isStaticFirmware(state.repository?.firmware)}
                                required
                            />
                        </div>
                        
                        <div className="text-center pt-4">
                            <Button
                                color="blue"
                                className={`w-full ${state.tabDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                style={state.tabDisabled ? { opacity: 0.5 } : {}}
                                onClick={
                                    state.tabDisabled 
                                        ? () => {} 
                                        : handleUpdate("Updating.....\n\nIt will take a few minutes.\n\n", "Updated!!")
                                }
                                disabled={false}
                            >
                                Update Repository
                            </Button>
                            <div className="text-center space-y-2 pt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    If it stops due to a network error or other problem, please press the button again.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Repository