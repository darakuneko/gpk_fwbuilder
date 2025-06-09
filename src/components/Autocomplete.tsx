import React, { useState, useRef, useEffect } from 'react'

interface AutocompleteOption {
    label: string;
    value: string;
}

interface AutocompleteProps {
    options?: AutocompleteOption[];
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement> | null, option: AutocompleteOption | null) => void;
    onFocus?: () => Promise<void> | void;
    disabled?: boolean;
    placeholder?: string;
    label?: string;
    error?: boolean;
    required?: boolean;
    id?: string;
    className?: string;
    inputClassName?: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ 
    options = [], 
    value, 
    onChange, 
    onFocus, 
    disabled = false,
    placeholder = '',
    label = '',
    error = false,
    required = false,
    id = '',
    className = '',
    inputClassName = ''
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value || '')
    const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>(options)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setInputValue(value || '')
    }, [value])

    useEffect(() => {
        setFilteredOptions(options)
    }, [options])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)
        
        const filtered = options.filter(option => 
            option.label.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredOptions(filtered)
        setIsOpen(true)
    }

    const handleInputFocus = async () => {
        if (onFocus) {
            await onFocus()
        }
        setIsOpen(true)
    }

    const handleOptionClick = (option: AutocompleteOption) => {
        setInputValue(option.label)
        onChange(null, option)
        setIsOpen(false)
    }

    const handleInputBlur = () => {
        // If input value doesn't match any option, clear it
        const matchingOption = options.find(opt => opt.label === inputValue)
        if (!matchingOption && inputValue) {
            setInputValue('')
            onChange(null, null)
        }
    }

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {label && (
                <label 
                    htmlFor={id} 
                    className={`block text-sm font-medium mb-2 ${error ? 'text-red-400' : 'text-gray-300'}`}
                >
                    {label} {required && '*'}
                </label>
            )}
            <input
                ref={inputRef}
                id={id}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full px-3 py-2.5 text-base border rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
                    error ? 'border-red-400' : 'border-gray-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${inputClassName}`}
            />
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.map((option, index) => (
                        <div
                            key={index}
                            className="px-3 py-2.5 text-base cursor-pointer hover:bg-gray-700 text-gray-100"
                            onMouseDown={() => handleOptionClick(option)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Autocomplete