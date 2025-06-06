import React, { useState, useRef, useEffect } from 'react'

const MultiSelect = ({ 
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
        
        const event = { target: { value: newValue } }
        onChange(event)
    }

    const removeTag = (option) => {
        const newValue = value.filter(v => v !== option)
        const event = { target: { value: newValue } }
        onChange(event)
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
            <div
                className={`min-h-[44px] w-full px-3 py-2.5 text-base border rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer ${
                    error ? 'border-red-400' : 'border-gray-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleToggle}
            >
                {value.length === 0 ? (
                    <span className="text-gray-400">Select options...</span>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {value.map((item, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-sm bg-blue-600 text-white rounded"
                            >
                                {item}
                                {!disabled && (
                                    <button
                                        type="button"
                                        className="ml-1 text-white hover:text-gray-300"
                                        onClick={(e) => {
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
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg max-h-60 overflow-auto">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className={`px-3 py-2.5 text-base cursor-pointer hover:bg-gray-700 text-gray-100 ${
                                value.includes(option) ? 'bg-blue-600' : ''
                            }`}
                            onClick={() => handleOptionClick(option)}
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