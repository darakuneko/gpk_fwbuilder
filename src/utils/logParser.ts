import Convert from "ansi-to-html"

const convert = new Convert({ newline: true })

export const cleanLogText = (str: string): string => {
    if (!str) return ''
    
    let cleaned = str
        // eslint-disable-next-line no-control-regex
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
        .replace(/\n\n+/g, '\n')         // Replace multiple newlines with single
        .replace(/^\n+/g, '')            // Remove leading newlines
        .trim()
    
    if (isBuildLog(str)) {
        cleaned = cleaned
            .replace(/,/g, '\n')             // Convert commas to newlines (from original parsing)
            .replace(/.*Compiling keymap with.*\n/g, '') // Remove compilation lines
            .replace(/\n\n+/g, '\n')         // Replace multiple newlines with single again
            .trim()
        
        return alignStatusIndicators(cleaned)
    } else {
        return cleaned
    }
}

export const isBuildLog = (str: string): boolean => {
    if (!str) return false
    
    const buildPatterns = [
        /Compiling keymap/,
        /Linking:/,
        /avr-gcc/,
        /make\[/,
        /\.elf/,
        /\.hex/,
        /Size after:/,
        /bytes used/,
        /Compiling .* for .* with .* keymap/,
        /arm-none-eabi-gcc/,
        /qmk compile/,
        /QMK/
    ]
    
    return buildPatterns.some(pattern => pattern.test(str))
}

export const parseLogColors = (str: string): { __html: string } => {        
    if (!str) return { __html: 'Logs will appear here...' }

    if (isBuildLog(str)) {
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
            
        return { __html: html }
    } else {
        const html = convert.toHtml(str)
            .replace(/\n/g, "<br />")
            
        return { __html: html }
    }
}

const preQmkParse = (str: string): string => str.replace(/\n\n/g, "\n")
    .replace(/^\n/g, "")
    .replace(/.*Compiling keymap with.*\n/, "")

const alignStatusIndicators = (text: string): string => {
    if (!text) return ''
    
    const lines = text.split('\n')
    
    let maxContentLength = 0
    lines.forEach(line => {
        const statusPattern = /^(.+?)(\s*)(\[[A-Z][A-Z0-9\s]*\])\s*$/
        const match = line.match(statusPattern)
        if (match) {
            const [, content] = match
            maxContentLength = Math.max(maxContentLength, content.length)
        }
    })
    
    const targetColumn = Math.min(Math.max(maxContentLength + 2, 85), 100)
    
    const alignedLines = lines.map(line => {
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

export const isOperationComplete = (log: string): boolean => {
    if (!log) return false
    return log.includes('finish!!') || 
           log.includes('Converted!!') ||
           log.includes('Generate!!') ||
           log.includes('Updated!!') ||
           log.includes('Rebuild!!')
}

export const getOperationType = (log: string): string => {
    if (!log) return 'unknown'
    
    if (log.includes('Building.....')) return 'build'
    if (log.includes('Updating.....')) return 'update'
    if (log.includes('Converting.....')) return 'convert'
    if (log.includes('Generating.....')) return 'generate'
    
    return 'operation'
}