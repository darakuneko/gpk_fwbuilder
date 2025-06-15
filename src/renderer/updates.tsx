import React, { useState, useEffect } from 'react'

import { useI18n } from '../hooks/useI18n'
import { NotificationPayload } from '../../types/index'

const { api } = window

const Updates: React.FC = (): React.ReactElement => {
    const { t } = useI18n()
    const [notifications, setNotifications] = useState<NotificationPayload[]>([])

    const formatDate = (timestamp: { _seconds: number }): string => {
        const date = new Date(timestamp._seconds * 1000)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}/${month}/${day}`
    }

    const loadNotifications = async (): Promise<void> => {
        try {
            const result = await api.getCachedNotifications()
            setNotifications(result || [])
        } catch (error) {
            console.error('Failed to load notifications:', error)
            setNotifications([])
        }
    }


    useEffect((): void => {
        void loadNotifications()
    }, [])

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {t('updatesNotification.noNotification')}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notification): React.ReactElement => (
                                <div 
                                    key={notification.id} 
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {notification.title}
                                        </h4>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">
                                            {formatDate(notification.publishedAt)}
                                        </span>
                                    </div>
                                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {notification.body}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Updates