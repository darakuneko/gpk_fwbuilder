import React, {useRef, useEffect, useState} from 'react'
import {useStateContext} from "../context.jsx"
import Convert from "ansi-to-html"
import parse from 'html-react-parser'

const convert = new Convert({ newline: true })

const Logs = () => {
    const {state} = useStateContext()
    const textareaRef = useRef(null)
    const divRef = useRef(null)
    const [isTextareaMode, setIsTextareaMode] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Clean up log text for plain text display (textarea mode)
    const cleanLogText = (str) => {
        if (!str) return ''
        
        // First clean the text step by step
        let cleaned = str
            .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
            .replace(/@@@@init@@@@/g, '')    // Remove init markers
            .replace(/@@@@finish@@@@/g, '')  // Remove finish markers
            .replace(/<span[^>]*>/g, '')     // Remove span tags
            .replace(/<\/span>/g, '')        // Remove closing span tags
            .replace(/<div[^>]*>/g, '')      // Remove div tags
            .replace(/<\/div>/g, '')         // Remove closing div tags
            .replace(/<br\s*\/?>/gi, '\n')   // Convert br tags to newlines
            .replace(/<[^>]*>/g, '')         // Remove any remaining HTML tags
            .replace(/&lt;/g, '<')           // Decode HTML entities
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')         // Convert non-breaking spaces to regular spaces
            .replace(/,/g, '\n')             // Convert commas to newlines (from original parsing)
            .replace(/\n\n+/g, '\n')         // Replace multiple newlines with single
            .replace(/^\n+/g, '')            // Remove leading newlines
            .replace(/.*Compiling keymap with.*\n/g, '') // Remove compilation lines
            .trim()
        
        // Align status indicators in columns
        return alignStatusIndicators(cleaned)
    }

    const preQmkParse = (str) => str.replace(/\n\n/g, "\n")
        .replace(/^\n/g, "")
        .replace(/.*Compiling keymap with.*\n/, "")

    // Parse ANSI color codes and convert to HTML for div display
    const parseLogColors = (str) => {        
        if (!str) return { __html: 'Logs will appear here...' }

        const html = convert.toHtml(
            preQmkParse(str)
            .replace(/,/g, "\n")
            .replace(/\n\n/g, "\n")
            .replace(/^\n/g, "")
            .replace(/.*Compiling keymap with.*\n/, "")
            .replace(/\n/g, "<br />"))
            .replace(/\<span style=\"color:/g, "<div style=\"float: right; color:") 
            .replace(/\<p|\<span/g, "<div")
            .replace(/\<\/p|<\/span/g, "</div")
            
        return { __html:  html }
    }

    
    // Align status indicators like [OK], [WARNINGS], [ERRORS] to consistent columns
    const alignStatusIndicators = (text) => {
        if (!text) return ''
        
        const lines = text.split('\n')
        
        // First pass: find the longest line before status indicator
        let maxContentLength = 0
        lines.forEach(line => {
            const statusPattern = /^(.+?)(\s*)(\[[A-Z][A-Z0-9\s]*\])\s*$/
            const match = line.match(statusPattern)
            if (match) {
                const [, content] = match
                maxContentLength = Math.max(maxContentLength, content.length)
            }
        })
        
        // Calculate target column based on longest content, with minimum and maximum limits
        // Ensure status indicators are readable but not too far to the right
        const targetColumn = Math.min(Math.max(maxContentLength + 2, 85), 100)
        
        const alignedLines = lines.map(line => {
            // Match lines with status indicators at the end
            // Support various formats: [OK], [WARNINGS], [ERRORS], [FAILED], etc.
            const statusPattern = /^(.+?)(\s*)(\[[A-Z][A-Z0-9\s]*\])\s*$/
            const match = line.match(statusPattern)
            
            if (match) {
                const [, content, , status] = match
                const contentLength = content.length
                const paddingNeeded = Math.max(1, targetColumn - contentLength - status.length)
                return content + ' '.repeat(paddingNeeded) + status
            }
            
            return line
        })
        
        return alignedLines.join('\n')
    }

    // Check if processing is complete
    useEffect(() => {
        if (state.logs) {
            const isFinished = state.logs.includes('finish!!') || 
                              state.logs.includes('Converted!!') ||
                              state.logs.includes('Generate!!')
            setIsProcessing(!isFinished && state.tabDisabled)
        }
    }, [state.logs, state.tabDisabled])

    // Auto-scroll to bottom when logs update
    useEffect(() => {
        if (isTextareaMode && textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight
        } else if (!isTextareaMode && divRef.current) {
            divRef.current.scrollTop = divRef.current.scrollHeight
        }
    }, [state.logs, isTextareaMode])

    // No need for custom context menu handler - Electron handles it
    const logContent = cleanLogText(state.logs)
    const coloredLogContent = parseLogColors(state.logs)

    return (
        <div className="w-full h-full flex flex-col">
            {!isTextareaMode ? (
                <div
                    ref={divRef}
                    onClick={() => !isProcessing && setIsTextareaMode(true)}
                    className={`logs-div border-0 
                    w-full font-mono text-sm bg-gray-900 text-white 
                    transition-colors ${
                        isProcessing 
                            ? 'cursor-not-allowed opacity-75' 
                            : 'cursor-pointer hover:bg-gray-800'
                    }`}
                    style={{ 
                        height: 'calc(90dvh - 200px)',
                        minHeight: 'calc(90dvh - 200px)',
                        maxHeight: 'calc(90dvh - 200px)',
                        overflow: 'auto',
                        padding: '16px',
                        whiteSpace: 'pre',
                        overflowWrap: 'normal',
                        wordBreak: 'normal'
                    }}
                    title={isProcessing ? "Processing... Text selection will be available when complete" : "Click to enable text selection"}
                >
                    {state.logs ? (
                        <div dangerouslySetInnerHTML={coloredLogContent} />
                    ) : (
                        <div className="text-gray-400">Logs will appear here...</div>
                    )}
                    {state.logs && !isProcessing && (
                        <div className="text-xs text-gray-500 mt-4 text-center">
                            Click anywhere to enable text selection
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center p-2 bg-gray-800 text-gray-300">
                        <span className="text-sm">Text selection mode</span>
                        <button
                            onClick={() => setIsTextareaMode(false)}
                            className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors cursor-pointer"
                        >
                            Back to view mode
                        </button>
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={logContent}
                        readOnly
                        className="logs-textarea border-0 focus:outline-none focus:ring-0 
                        w-full font-mono text-sm bg-gray-900 resize-none p-4"
                        style={{ 
                            height: 'calc(90dvh - 244px)',
                            minHeight: 'calc(90dvh - 244px)',
                            maxHeight: 'calc(90dvh - 244px)',
                            whiteSpace: 'pre',
                            overflowWrap: 'normal',
                            wordBreak: 'normal',
                            fontFamily: 'ui-monospace, monospace',
                            padding: '16px',
                            letterSpacing: '0'
                        }}
                        placeholder="Logs will appear here..."
                    />
                </div>
            )}
        </div>
    )
}
export default Logs