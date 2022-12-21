import {createTheme} from "@mui/material/styles";
import {styled} from "@mui/material/styles";
import {Box, Typography, Switch, IconButton, TextField, TableCell} from "@mui/material";

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

export const inputLabelFontSize = "16px"
export const formHelperTextFontSize = "16px"

export const neon = "neon_blink 1s infinite alternate;"

export const neonKeyFrame = `@keyframes neon_blink {
                    0% {
        text-shadow: 0 0 10px #2293C1FF, 0 0 5px #fff, 0 0 13px #85C7FBFF;
    }
    100% {
        text-shadow: 0 0 30px #2293C1FF, 0 0 15px #fff, 0 0 40px #85C7FBFF;
    }
}`
