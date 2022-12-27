import Box from "@mui/material/Box"

import React, {useRef, useCallback, useEffect, useState} from 'react'

import {useStateContext} from "../context"
import Convert from "ansi-to-html"

const convert = new Convert({ newline: true })
import parse from 'html-react-parser'
const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms))

const Logs = () => {
    const {state} = useStateContext()
    const [enableScroll, setEnableScroll] = useState(false)
    const [countState, setCountState] = useState(0)

    const scrollEndRef = useRef(null)

    const scrollToBottom = () => scrollEndRef.current?.scrollIntoView({ behavior: "smooth" })

    useEffect(() => {
        const fn = async () => {
            if(countState === 5 || state.logs.match(/finish!!/m)){
                scrollToBottom()
                setCountState(0)
            } else {
                setCountState(countState + 1)
            }
        }
        fn()
        return () => {}
    }, [state.logs])

    const preQmkParse = (str) => str.replace(/\n\n/g, "\n")
        .replace(/^\n/g, "")
        .replace(/.*Compiling keymap with.*\n/, "")

    const parseHtml = (str, isStdOut) => {
        const html = convert.toHtml(
            preQmkParse(str)
            .replace(/\n\n/g, "\n")
            .replace(/^\n/g, "")
            .replace(/.*Compiling keymap with.*\n/, "")
            .replace(/ /g, "&nbsp;")
            .replace(/\n/g, "<br />"))

        const h = isStdOut ? html.replace(/\<span style=\"color:/g, "<div style=\"float: right; color:") : html

        return parse(h
            .replace(/\<p|\<span/g, "<div")
            .replace(/\<\/p|<\/span/g, "</div"))
    }
    return (
        <Box sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box>
                {state.logs && state.logs.length > 0 && parseHtml(state.logs, true)}
                <div ref={scrollEndRef} />
            </Box>
        </Box>
    )
}
export default Logs