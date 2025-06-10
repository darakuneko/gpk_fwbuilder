import React, { useState, useRef, useEffect } from 'react'

interface MultiSelectProps {
    options?: string[];
    value?: string[];
    onChange: (event: { target: { value: string[] } }) => void;
    disabled?: boolean;
    label?: string;
    error?: boolean;
    required?: boolean;
    id?: string;
    className?: string;
    placement?: 'top' | 'bottom';
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
    options = [], 
    value = [], 
    onChange, 
    disabled = false,
    label = '',
    error = false,
    required = false,
    id = '',
    className = '',
    placement = 'bottom'
}): React.ReactElement => {
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect((): (() => void) => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return (): void => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleToggle = (): void => {
        if (!disabled) {
            setIsOpen(!isOpen)
        }
    }

    const handleOptionClick = (option: string): void => {
        const newValue = value.includes(option) 
            ? value.filter((v): boolean => v !== option)
            : [...value, option]
        
        const event = { target: { value: newValue } }
        onChange(event)
    }

    const removeTag = (option: string): void => {
        const newValue = value.filter((v): boolean => v !== option)
        const event = { target: { value: newValue } }
        onChange(event)
    }

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {label && (
                <label 
                    htmlFor={id} 
                    className={`block text-sm font-medium mb-2 ${error ? 'text-red-600 dark:text-red-500' : 'text-gray-700 dark:text-gray-300'}`}
                >
                    {label} {required && '*'}
                </label>
            )}
            <div
                className={`min-h-[44px] w-full px-3 py-2.5 text-base border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${
                    error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleToggle}
            >
                {value.length === 0 ? (
                    <span className="text-gray-500 dark:text-gray-400">Select options...</span>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {value.map((item, index): React.ReactElement => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-sm bg-blue-600 text-white rounded"
                            >
                                {item}
                                {!disabled && (
                                    <button
                                        type="button"
                                        className="ml-1 text-white hover:text-gray-300 cursor-pointer"
                                        onClick={(e): void => {
                                            e.stopPropagation()
                                            removeTag(item)
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {isOpen && (
                <div className={`absolute z-50 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto ${
                    placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                }`}>
                    {options.map((option, index): React.ReactElement => (
                        <div
                            key={index}
                            className={`px-3 py-2.5 text-base cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 ${
                                value.includes(option) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
                            }`}
                            onClick={(): void => handleOptionClick(option)}
                        >
                            <span className="flex items-center">
                                <span className={`mr-2 ${value.includes(option) ? 'text-white' : 'text-gray-400'}`}>
                                    {value.includes(option) ? '✓' : ' '}
                                </span>
                                {option}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MultiSelect