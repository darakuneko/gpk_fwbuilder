import React from 'react'

const FileUpload = ({ 
    label, 
    accept = "*/*", 
    onChange, 
    filename = "", 
    id = "",
    className = "",
    variant = "outlined" // "outlined" | "contained"
}) => {
    const baseClasses = "px-4 py-2 rounded transition-colors duration-200 font-medium cursor-pointer inline-block text-center"
    const variantClasses = variant === "contained" 
        ? "bg-blue-400 text-gray-900 hover:bg-blue-300"
        : "border border-gray-600 text-gray-100 hover:bg-gray-700"

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <label 
                htmlFor={id}
                className={`${baseClasses} ${variantClasses}`}
            >
                {label}
                <input 
                    id={id}
                    type="file" 
                    accept={accept} 
                    onChange={onChange} 
                    className="hidden"
                />
            </label>
            {filename && (
                <div className="mt-2 text-sm text-gray-300 text-center max-w-[200px] truncate">
                    {filename}
                </div>
            )}
        </div>
    )
}

export default FileUpload