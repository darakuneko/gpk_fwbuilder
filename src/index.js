import React from "react"
import { createRoot } from 'react-dom/client'
import {ThemeProvider} from "@mui/material"
import {CssBaseline} from "@mui/material";
import {StateProvider} from "./context.js"
import {responsiveFontSizes} from "@mui/material"
import {theme} from "./style.js"
import Content from "./content.js"

const App = () => {
    return (
        <ThemeProvider theme={responsiveFontSizes(theme)}>
            <CssBaseline/>
            <StateProvider>
                <Content />
            </StateProvider>
        </ThemeProvider>
    )
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)