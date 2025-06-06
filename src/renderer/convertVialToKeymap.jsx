import React, {useState} from "react"
import {useStateContext} from "../context.jsx"
import { Button } from 'flowbite-react'
import FileUpload from "../components/FileUpload.jsx"

const {api} = window

const ConvertVialToKeymap = ({onClose}) => {
    const {state, setState} = useStateContext()
    const [vilObj, setVilObj] = useState({
        name : "",
        path : "",
    })
    const [disabledVilCovertButton, setDisabledVilCovertButton] = useState(true)

    const convertMsg =  "Convert...."

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
        
        if (onClose) {
            onClose()
        }
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
        <div className="p-6">
            <div className="max-w-2xl mx-auto">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <FileUpload
                        id="vil"
                        label="Vial file (.vil)"
                        accept=".vil"
                        onChange={handleVilFileUpload}
                        filename={vilObj.name}
                    />
                    <Button
                        color="blue"
                        onClick={handleVilFileSubmit}
                        disabled={disabledVilCovertButton}
                    >
                        Convert
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default ConvertVialToKeymap