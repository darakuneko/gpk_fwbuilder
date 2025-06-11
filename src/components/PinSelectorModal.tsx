import React, { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'flowbite-react'
import { HiArrowUp, HiArrowDown, HiX } from 'react-icons/hi'

interface PinSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    availablePins: string[];
    selectedPins: string[];
    onConfirm: (pins: string[]) => void;
}

const PinSelectorModal: React.FC<PinSelectorModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    availablePins, 
    selectedPins, 
    onConfirm 
}): React.ReactElement => {
    const [tempSelectedPins, setTempSelectedPins] = useState([...selectedPins])
    const [animatingIndex, setAnimatingIndex] = useState<number | null>(null)

    const handlePinToggle = (pin: string): void => {
        if (tempSelectedPins.includes(pin)) {
            setTempSelectedPins(tempSelectedPins.filter((p): boolean => p !== pin))
        } else {
            setTempSelectedPins([...tempSelectedPins, pin])
        }
    }

    const handleMoveUp = (index: number): void => {
        if (index > 0) {
            setAnimatingIndex(index)
            setTimeout((): void => {
                const newPins = [...tempSelectedPins]
                const current = newPins[index]
                const previous = newPins[index - 1]
                if (current !== undefined && previous !== undefined) {
                    newPins[index - 1] = current
                    newPins[index] = previous
                    setTempSelectedPins(newPins)
                }
                // Keep highlighting the moved item (now at index-1)
                setAnimatingIndex(index - 1)
                setTimeout((): void => setAnimatingIndex(null), 200)
            }, 300)
        }
    }

    const handleMoveDown = (index: number): void => {
        if (index < tempSelectedPins.length - 1) {
            setAnimatingIndex(index)
            setTimeout((): void => {
                const newPins = [...tempSelectedPins]
                const current = newPins[index]
                const next = newPins[index + 1]
                if (current !== undefined && next !== undefined) {
                    newPins[index] = next
                    newPins[index + 1] = current
                    setTempSelectedPins(newPins)
                }
                // Keep highlighting the moved item (now at index+1)
                setAnimatingIndex(index + 1)
                setTimeout((): void => setAnimatingIndex(null), 200)
            }, 300)
        }
    }

    const handleRemove = (pin: string): void => {
        setTempSelectedPins(tempSelectedPins.filter((p): boolean => p !== pin))
    }

    const handleConfirm = (): void => {
        onConfirm(tempSelectedPins)
        onClose()
    }

    const handleCancel = (): void => {
        setTempSelectedPins([...selectedPins])
        onClose()
    }

    // Reset when modal opens
    React.useEffect((): void => {
        if (isOpen) {
            setTempSelectedPins([...selectedPins])
            setAnimatingIndex(null)
        }
    }, [isOpen, selectedPins])

    return (
        <Modal show={isOpen} onClose={handleCancel} size="3xl">
            <ModalHeader>
                {title}
            </ModalHeader>
            <ModalBody>
                <div 
                    className="space-y-6"
                    style={{
                        height: 'calc(90dvh - 160px)',
                        maxHeight: 'calc(90dvh - 160px)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Available Pins Section */}
                    <div className="flex-shrink-0">
                        {/* Pin Grid */}
                        <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded-lg">
                            {availablePins.map((pin): React.ReactElement => (
                                <button
                                    key={pin}
                                    onClick={(): void => handlePinToggle(pin)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
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
                    <div className="flex-1 min-h-0 flex flex-col">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex-shrink-0">
                            Selected Pins ({tempSelectedPins.length})
                        </h3>
                        
                        {tempSelectedPins.length > 0 ? (
                            <div className="flex-1 min-h-0 flex flex-col">
                                <div 
                                    className="flex-1 overflow-y-auto space-y-1 px-1 py-2"
                                    style={{
                                        maxHeight: '300px',
                                        minHeight: '120px'
                                    }}
                                >
                                    {tempSelectedPins.map((pin, index): React.ReactElement => (
                                        <div 
                                            key={`${pin}-${index}`}
                                            className={`flex items-center justify-between p-3 mx-1 my-1 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-300 ${
                                                animatingIndex === index 
                                                    ? 'transform scale-105 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 border-blue-400 dark:border-blue-500 shadow-xl ring-2 ring-blue-300 dark:ring-blue-600 ring-opacity-50' 
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                                            }`}
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
                                                    onClick={(): void => handleMoveUp(index)}
                                                    disabled={index === 0 || animatingIndex !== null}
                                                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                                    style={{ cursor: index === 0 || animatingIndex !== null ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <HiArrowUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(): void => handleMoveDown(index)}
                                                    disabled={index === tempSelectedPins.length - 1 || animatingIndex !== null}
                                                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                                    style={{ cursor: index === tempSelectedPins.length - 1 || animatingIndex !== null ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <HiArrowDown className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(): void => handleRemove(pin)}
                                                    disabled={animatingIndex !== null}
                                                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                                    style={{ cursor: animatingIndex !== null ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <HiX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Array Output */}
                                <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                                    <div className="p-3 pb-2">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Array Output:
                                        </p>
                                    </div>
                                    <div 
                                        className="px-3 pb-3"
                                        style={{
                                            maxHeight: '100px',
                                            overflow: 'auto',
                                            border: '1px solid transparent'
                                        }}
                                    >
                                        <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words m-0 p-0">
                                            ["{tempSelectedPins.join('", "')}"]
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                No pins selected
                            </div>
                        )}
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="blue" className="cursor-pointer" onClick={handleConfirm}>
                    OK
                </Button>
                <Button color="light" className="cursor-pointer" onClick={handleCancel}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default PinSelectorModal