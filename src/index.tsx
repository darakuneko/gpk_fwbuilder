import React, { useEffect } from "react"
import { createRoot } from 'react-dom/client'
import {StateProvider} from "./context"
import Content from "./content"
import { useTheme } from "./hooks/useTheme"
import 'flowbite/dist/flowbite.min.css'
import "./globals.css"

const ThemeProvider = ({ children }) => {
    const { theme } = useTheme();
    
    useEffect(() => {
        // Flowbite theme handling - light/dark auto switch
        const root = document.documentElement;
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);
    
    return children;
}

const App = () => {
    return (
        <StateProvider>
            <ThemeProvider>
                <Content />
            </ThemeProvider>
        </StateProvider>
    )
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)