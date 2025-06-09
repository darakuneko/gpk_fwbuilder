import React, {useState} from "react"
import {useStateContext} from "../context.jsx"
import { Button } from 'flowbite-react'
import FileUpload from "../components/FileUpload.jsx"

const {api} = window

const ConvertVialToKeymap = ({onShowLogModal, onOperationComplete}) => {
    const {state, setState} = useStateContext()
    
    // Guard against uninitialized state
    if (!state) {
        return <div>Loading...</div>
    }
    const [vilObj, setVilObj] = useState({
        name : "",
        path : "",
    })
    const [disabledVilCovertButton, setDisabledVilCovertButton] = useState(true)

    const convertMsg =  "Convert...."

    const handleVilFileSubmit = async () => {
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        state.logs = convertMsg
        state.tabDisabled = true
        setState(state)
        setDisabledVilCovertButton(true)
        
        const log = await api.convertVilJson(vilObj)
        state.logs = log
        state.tabDisabled = false
        setState(state)
        setDisabledVilCovertButton(false)
        
        if (onOperationComplete) {
            onOperationComplete()
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
        <div className="p-4">
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
                        className={disabledVilCovertButton ? 'cursor-not-allowed' : 'cursor-pointer'}
                        style={disabledVilCovertButton ? { opacity: 0.5 } : {}}
                        onClick={disabledVilCovertButton ? () => {} : handleVilFileSubmit}
                        disabled={false}
                    >
                        Convert
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default ConvertVialToKeymap