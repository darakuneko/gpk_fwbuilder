import React from 'react'
import { Button } from 'flowbite-react'

import {useStateContext} from "../context"
import {useI18n} from "../hooks/useI18n"

const {api} = window

interface ImageProps {
    onShowLogModal?: () => void;
    onOperationComplete?: () => void;
}

const Image: React.FC<ImageProps> = ({onShowLogModal, onOperationComplete}): React.ReactElement => {
    const {state, setState, setPageLog} = useStateContext()
    const {t} = useI18n()
    
    // Guard against uninitialized state
    if (!state) {
        return <div>Loading...</div>
    }

    const handleUpdate = (msg1: string, msg2: string, fn: () => Promise<unknown>): (() => Promise<void>) => async (): Promise<void> => {
        // Show log modal when rebuild starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        if (!state) return
        setPageLog('image', msg1)
        state.tabDisabled = true
        void setState(state)
        await fn()
        let id: ReturnType<typeof setInterval>
        const checkFn = async (): Promise<void> => {
            const buildCompleted = await api.buildCompleted()
            const exist = await api.existSever()
            if (buildCompleted && exist) {
                state.build.tags = await api.tags()
                state.build.tag = state.build.tags[0] || ''
                setPageLog('image', msg2)
                state.tabDisabled = false
                void setState(state)
                clearInterval(id)
                
                // Operation complete
                if (onOperationComplete) {
                    onOperationComplete()
                }
            }
        }
        id = setInterval(checkFn, 1000)
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="text-center">
                        <Button 
                            color="red"
                            className={`w-full ${state?.tabDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            style={state?.tabDisabled ? { opacity: 0.5 } : {}}
                            disabled={false}
                            onClick={state?.tabDisabled ? (): void => {} : handleUpdate("Building.....\n\n", "Rebuild!!", async (): Promise<unknown> => await api.rebuildImage())}
                        >
{t('settings.rebuildDockerImage')}
                        </Button>
                        <div className="text-center space-y-2 pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {t('common.networkErrorRetry')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Image