import React from "react"
import {useStateContext} from "../context.jsx"
import { Button } from 'flowbite-react'

const {api} = window

const Image = () => {
    const {state, setState} = useStateContext()

    const handleUpdate = (msg1, msg2, fn) => async () => {
        state.logs = msg1
        state.tabDisabled = true
        setState(state)
        await fn()
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
        <>
            <div className="flex justify-center items-center pt-4">
                <Button 
                    color="red"
                    disabled={state.tabDisabled}
                    onClick={handleUpdate("Building.....\n\n", "Rebuild!!", async () => await api.rebuildImage())}
                >
                    Image Rebuild
                </Button>
            </div>
            <div className="h-10 text-center">
                If it stops due to a network error or other problem, please press the button again.
            </div>
        </>

    )
}
export default Image