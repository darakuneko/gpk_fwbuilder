import {createTheme} from "@mui/material/styles"
import Repository from "./renderer/repository";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#90caf9",
            error: "#f44336"
        },
        mode: "dark",
    },
    props: {
        MuiLink: {
            underline: 'none'
        }
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    overflow: "hidden"
                }
            }
        }
    }
})

export const buildBoxHeight = "230px"
export const convertBoxHeight = "820px"
export const inputLabelSmallFontSize = "12px"
export const inputLabelMiddleFontSize = "16px"
export const formHelperTextFontSize = "16px"
export const textFieldLongWidth = 400
export const textFieldMiddleWidth = 250

export const neon = "neon_blink 1s infinite alternate;"

export const neonKeyFrame = `@keyframes neon_blink {
                    0% {
        text-shadow: 0 0 10px #2293C1FF, 0 0 5px #fff, 0 0 13px #85C7FBFF;
    }
    100% {
        text-shadow: 0 0 30px #2293C1FF, 0 0 15px #fff, 0 0 40px #85C7FBFF;
    }
}`
