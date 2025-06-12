import React, { useEffect, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import {StateProvider} from "./context"
import Content from "./content"
import { useTheme } from "./hooks/useTheme"
import { I18nProvider } from "./components/I18nProvider"

import 'flowbite/dist/flowbite.min.css'
import "./globals.css"

interface ThemeProviderProps {
    children: ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
const ThemeProvider = ({ children }: ThemeProviderProps): React.ReactElement => {
    const { theme } = useTheme();
    
    useEffect((): void => {
        // Flowbite theme handling - light/dark auto switch
        const root = document.documentElement;
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);
    
    return <>{children}</>;
}

// eslint-disable-next-line react-refresh/only-export-components
const App = (): React.ReactElement => {
    return (
        <StateProvider>
            <I18nProvider>
                <ThemeProvider>
                    <Content />
                </ThemeProvider>
            </I18nProvider>
        </StateProvider>
    )
}

const container = document.getElementById('root')
if (!container) {
    throw new Error('Root element not found')
}
const root = createRoot(container)
root.render(<App />)