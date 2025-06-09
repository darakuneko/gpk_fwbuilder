import React from "react"
import {useStateContext} from "../context.jsx"
import { Label, TextInput } from 'flowbite-react'

const {api} = window

const Setting = () => {
    const {state, setState} = useStateContext()

    const handleDockeUrlChange = async (e) => {
        state.setting.fwMakerUrl = e.target.value
        if(state.setting.fwMakerUrl.length === 0) {
            state.setting.fwDir = await api.getLocalFWdir()
        }
        setState(state)
    }

    const handleFwDirChange = (e) => {
        state.setting.fwDir =e.target.value
        setState(state)
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block" htmlFor="fwMakerUrl">GPK FWMaker's URL</Label>
                            <TextInput
                                type="text"
                                id="fwMakerUrl"
                                onChange={handleDockeUrlChange}
                                value={state.setting.fwMakerUrl ? state.setting.fwMakerUrl : ""}
                                placeholder="Leave empty to use local docker"
                            />
                        </div>
                        
                        <div>
                            <Label className="mb-2 block" htmlFor="fwDir">GPK FWMaker's GPKFW Path</Label>
                            <TextInput
                                type="text"
                                id="fwDir"
                                onChange={handleFwDirChange}
                                value={state.setting.fwDir ? state.setting.fwDir : ""}
                            />
                        </div>
                        
                        <div className="text-center space-y-2 pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Use local docker if URL is empty
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Settings are saved when you exit, so you will need to restart the application.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Setting