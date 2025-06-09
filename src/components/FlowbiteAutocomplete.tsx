import React, { useState, useRef, useEffect, CSSProperties } from 'react'
import { Label } from 'flowbite-react'

interface FlowbiteAutocompleteOption {
    label: string;
    value: string;
}

interface FlowbiteAutocompleteProps {
    options?: FlowbiteAutocompleteOption[];
    value: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }, option: FlowbiteAutocompleteOption | null) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    placeholder?: string;
    label?: string;
    error?: boolean;
    required?: boolean;
    id?: string;
    className?: string;
    inputClassName?: string;
    style?: CSSProperties;
}

const FlowbiteAutocomplete: React.FC<FlowbiteAutocompleteProps> = ({ 
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
    inputClassName = '',
    style = {}
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value || '')
    const [filteredOptions, setFilteredOptions] = useState<FlowbiteAutocompleteOption[]>(options)
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
        
        onChange && onChange(e, value ? { label: value, value: value } : null)
        setIsOpen(true)
    }

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsOpen(true)
        onFocus && onFocus(e)
    }

    const handleInputBlur = () => {
        setTimeout(() => {
            setIsOpen(false)
        }, 200)
    }

    const handleOptionClick = (option: FlowbiteAutocompleteOption) => {
        setInputValue(option.label)
        onChange && onChange({ target: { value: option.label } }, option)
        setIsOpen(false)
    }

    // Flowbite official input field classes
    const inputClasses = `bg-gray-50 border ${error ? 'border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${error ? 'dark:text-red-500 dark:placeholder-red-500 dark:border-red-500' : 'dark:focus:ring-blue-500 dark:focus:border-blue-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${inputClassName}`

    return (
        <div ref={wrapperRef} className={`relative ${className}`} style={style}>
            {label && (
                <Label 
                    className={`mb-2 block text-sm font-medium ${error ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                    htmlFor={id}
                >
                    {`${label}${required ? ' *' : ''}`}
                </Label>
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
                className={inputClasses}
            />
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto dark:bg-gray-700 dark:border-gray-600">
                    {filteredOptions.map((option, index) => (
                        <div
                            key={index}
                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-gray-200"
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

export default FlowbiteAutocomplete