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
        <div className="px-4 flex flex-col justify-center content-center">
            <div className="flex justify-center content-center">
                <div className="pt-2 mr-4">
                    <div className="mb-2 block">
                        <Label htmlFor="fwMakerUrl" value="GPK FWMaker's URL" />
                    </div>
                    <TextInput
                        type="text"
                        id="fwMakerUrl"
                        onChange={handleDockeUrlChange}
                        className="w-80"
                        value={state.setting.fwMakerUrl ? state.setting.fwMakerUrl : ""}
                    />
                </div>
                <div className="pt-2">
                    <div className="mb-2 block">
                        <Label htmlFor="fwDir" value="GPK FWMaker's GPKFW Path" />
                    </div>
                    <TextInput
                        type="text"
                        id="fwDir"
                        onChange={handleFwDirChange}
                        className="w-80"
                        value={state.setting.fwDir ? state.setting.fwDir : ""}
                    />
                </div>
            </div>
            <div className="pt-4 h-10 text-center">
                Use local docker if URL is empty<br />
                Settings are saved when you exit, so you will need to restart the application.<br />
                config: {state.storePath}
            </div>
        </div>
    )
}
export default Setting