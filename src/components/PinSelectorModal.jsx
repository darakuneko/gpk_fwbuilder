import React, { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'flowbite-react'
import { HiArrowUp, HiArrowDown, HiX } from 'react-icons/hi'

const PinSelectorModal = ({ 
    isOpen, 
    onClose, 
    title, 
    availablePins, 
    selectedPins, 
    onConfirm 
}) => {
    const [tempSelectedPins, setTempSelectedPins] = useState([...selectedPins])

    const handlePinToggle = (pin) => {
        if (tempSelectedPins.includes(pin)) {
            setTempSelectedPins(tempSelectedPins.filter(p => p !== pin))
        } else {
            setTempSelectedPins([...tempSelectedPins, pin])
        }
    }

    const handleMoveUp = (index) => {
        if (index > 0) {
            const newPins = [...tempSelectedPins]
            ;[newPins[index - 1], newPins[index]] = [newPins[index], newPins[index - 1]]
            setTempSelectedPins(newPins)
        }
    }

    const handleMoveDown = (index) => {
        if (index < tempSelectedPins.length - 1) {
            const newPins = [...tempSelectedPins]
            ;[newPins[index], newPins[index + 1]] = [newPins[index + 1], newPins[index]]
            setTempSelectedPins(newPins)
        }
    }

    const handleRemove = (pin) => {
        setTempSelectedPins(tempSelectedPins.filter(p => p !== pin))
    }

    const handleConfirm = () => {
        onConfirm(tempSelectedPins)
        onClose()
    }

    const handleCancel = () => {
        setTempSelectedPins([...selectedPins])
        onClose()
    }

    // Reset when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setTempSelectedPins([...selectedPins])
        }
    }, [isOpen, selectedPins])

    return (
        <Modal show={isOpen} onClose={handleCancel} size="3xl">
            <ModalHeader>
                {title}
            </ModalHeader>
            <ModalBody>
                <div className="space-y-6">
                    {/* Available Pins Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                            Available Pins
                        </h3>
                        
                        {/* Pin Grid */}
                        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded-lg">
                            {availablePins.map((pin) => (
                                <button
                                    key={pin}
                                    onClick={() => handlePinToggle(pin)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                        tempSelectedPins.includes(pin)
                                            ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-800 dark:border-blue-600 dark:text-blue-100'
                                            : 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100 dark:hover:bg-gray-500'
                                    }`}
                                >
                                    {pin}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selected Pins Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                            Selected Pins ({tempSelectedPins.length})
                        </h3>
                        
                        {tempSelectedPins.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {tempSelectedPins.map((pin, index) => (
                                    <div 
                                        key={`${pin}-${index}`}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[20px]">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {pin}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleMoveUp(index)}
                                                disabled={index === 0}
                                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <HiArrowUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveDown(index)}
                                                disabled={index === tempSelectedPins.length - 1}
                                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <HiArrowDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRemove(pin)}
                                                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <HiX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No pins selected
                            </div>
                        )}

                        {/* Array Output */}
                        {tempSelectedPins.length > 0 && (
                            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Array Output:
                                </p>
                                <code className="text-sm text-gray-800 dark:text-gray-200">
                                    ["{tempSelectedPins.join('", "')}"]
                                </code>
                            </div>
                        )}
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="blue" onClick={handleConfirm}>
                    Confirm
                </Button>
                <Button color="light" onClick={handleCancel}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default PinSelectorModal