import React, { useState, useRef, useEffect } from 'react'
import { Label } from 'flowbite-react'

const FlowbiteMultiSelect = ({
    options = [],
    value = [],
    onChange,
    disabled = false,
    label = '',
    error = false,
    required = false,
    id = '',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen)
        }
    }

    const handleOptionClick = (option) => {
        const newValue = value.includes(option)
            ? value.filter(v => v !== option)
            : [...value, option]
        
        onChange && onChange(newValue)
    }

    const removeTag = (item) => {
        const newValue = value.filter(v => v !== item)
        onChange && onChange(newValue)
    }

    // Flowbite official select field classes
    const selectClasses = `bg-gray-50 border ${error ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} text-sm rounded-lg block w-full p-2.5 min-h-[42px] dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${error ? 'dark:text-red-500 dark:border-red-500' : 'dark:focus:ring-blue-500 dark:focus:border-blue-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            {label && (
                <div className="mb-2 block">
                    <Label 
                        htmlFor={id} 
                        value={`${label}${required ? ' *' : ''}`}
                        className={`text-sm font-medium ${error ? 'text-red-700 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                    />
                </div>
            )}
            <div
                className={selectClasses}
                onClick={handleToggle}
            >
                {value.length === 0 ? (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Select options...</span>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {value.map((item, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 me-2 text-xs font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300"
                            >
                                {item}
                                {!disabled && (
                                    <button
                                        type="button"
                                        className="inline-flex items-center p-1 ms-2 text-xs text-blue-400 bg-transparent rounded-sm hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removeTag(item)
                                        }}
                                    >
                                        <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                        </svg>
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto dark:bg-gray-700 dark:border-gray-600">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-gray-200 ${
                                value.includes(option) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                            }`}
                            onClick={() => handleOptionClick(option)}
                        >
                            <span className="flex items-center">
                                <span className={`mr-3 text-sm ${value.includes(option) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {value.includes(option) ? '✓' : '○'}
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

export default FlowbiteMultiSelect