import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'flowbite-react'

import { useI18n } from '../hooks/useI18n'
import { NotificationPayload } from '../../types/index.ts'

interface UpdatesNotificationModalProps {
    isOpen: boolean
    onClose: () => void
    notifications: NotificationPayload[]
}

const UpdatesNotificationModal: React.FC<UpdatesNotificationModalProps> = ({ 
    isOpen, 
    onClose, 
    notifications 
}): React.ReactElement => {
    const { t } = useI18n()

    const formatDate = (timestamp: { _seconds: number }): string => {
        const date = new Date(timestamp._seconds * 1000)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}/${month}/${day}`
    }


    return (
        <Modal show={isOpen} onClose={onClose} size="4xl">
            <ModalHeader>
                {t('updatesNotification.title')}
            </ModalHeader>
            <ModalBody>
                <div 
                    className="space-y-4"
                    style={{
                        height: 'calc(70vh - 160px)',
                        maxHeight: 'calc(70vh - 160px)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div className="flex-1 overflow-y-auto px-2">
                        {notifications.map((notification): React.ReactElement => (
                            <div 
                                key={notification.id} 
                                className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-4 bg-gray-50 dark:bg-gray-800"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {notification.title}
                                    </h3>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">
                                        {formatDate(notification.publishedAt)}
                                    </span>
                                </div>
                                <div 
                                    className="text-base text-gray-700 dark:text-gray-300 leading-relaxed copyable-text"
                                    style={{ 
                                        whiteSpace: 'pre-wrap',
                                        userSelect: 'text'
                                    }}
                                >
                                    {notification.body}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button 
                    color="blue" 
                    className="cursor-pointer" 
                    onClick={onClose}
                >
                    {t('common.ok')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default UpdatesNotificationModal