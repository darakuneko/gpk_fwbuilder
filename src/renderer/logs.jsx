import React, {useRef, useEffect, useState} from 'react'
import {useStateContext} from "../context.jsx"

const Logs = () => {
    const {state} = useStateContext()
    const textareaRef = useRef(null)

    // Clean up log text for plain text display
    const cleanLogText = (str) => {
        if (!str) return ''
        
        return str
            .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
            .replace(/@@@@init@@@@/g, '')    // Remove init markers
            .replace(/@@@@finish@@@@/g, '')  // Remove finish markers
            .replace(/<[^>]*>/g, '')         // Remove HTML tags
            .replace(/&lt;/g, '<')           // Decode HTML entities
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\n\n+/g, '\n')         // Replace multiple newlines with single
            .replace(/^\n+/g, '')            // Remove leading newlines
            .replace(/.*Compiling keymap with.*\n/g, '') // Remove compilation lines
            .trim()
    }

    // Auto-scroll to bottom when logs update
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight
        }
    }, [state.logs])

    // No need for custom context menu handler - Electron handles it


    return (
        <div className="w-full h-full flex flex-col">
            <textarea
                ref={textareaRef}
                value={cleanLogText(state.logs)}
                readOnly
                className="logs-textarea border-0 focus:outline-none focus:ring-0 
                flex-1 w-full font-mono text-sm bg-gray-900 text-green-400 resize-none"
                style={{ 
                    minHeight: 'calc(90dvh - 200px)' 
                }}
                placeholder="Logs will appear here..."
            />
        </div>
    )
}
export default Logs