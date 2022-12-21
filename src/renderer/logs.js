import Box from "@mui/material/Box"

import React from "react";
import {useStateContext} from "../context"
import Convert from "ansi-to-html";

const convert = new Convert({ newline: true });
import parse from 'html-react-parser';

const Logs = () => {
    const {state} = useStateContext();

    const preQmkParse = (str) => str.replace(/\n\n/g, "\n")
        .replace(/^\n/g, "")
        .replace(/.*Compiling keymap with.*\n/, "")

    const isQmkError = (str) => preQmkParse(str).length > 0

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
            {state.logs.stdout.length === 0 ? (
                <Box>
                    {state.logs.stderr.length > 0 && <Box color="primary.error">Building Error</Box>}
                    {parseHtml(state.logs.stderr, false)}
                </Box>
                ) :  (
                <Box>
                    {parseHtml(state.logs.stdout, true)}
                    {
                        isQmkError(state.logs.stderr, false) && (
                            <span>
                                <Box color="primary.main" sx={{ pt: 4 }}>--- Error ---</Box>
                                {parseHtml(state.logs.stderr, false)}
                            </span>
                        )
                    }
                </Box>)}
        </Box>
    )
}
export default Logs