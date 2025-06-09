import React from 'react'

interface FileUploadProps {
    label: string;
    accept?: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    filename?: string;
    id?: string;
    className?: string;
    variant?: "outlined" | "contained";
}

const FileUpload: React.FC<FileUploadProps> = ({ 
    label, 
    accept = "*/*", 
    onChange, 
    filename = "", 
    id = "",
    className = "",
    variant = "outlined"
}) => {
    const baseClasses = "px-4 py-2 rounded transition-colors duration-200 font-medium cursor-pointer text-center w-full"
    const variantClasses = variant === "contained" 
        ? "bg-blue-400 text-gray-900 hover:bg-blue-300"
        : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-700"

    return (
        <div className={className}>
            <label 
                htmlFor={id}
                className={`${baseClasses} ${variantClasses} block`}
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
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                    Selected: {filename}
                </div>
            )}
        </div>
    )
}

export default FileUpload