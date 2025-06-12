import React from 'react'
import { Button, TextInput, Select, Label } from 'flowbite-react'

import {useStateContext} from "../context"
import {useI18n} from "../hooks/useI18n"

const {api} = window

interface RepositoryProps {
    onShowLogModal?: () => void;
    onOperationComplete?: () => void;
}

const Repository: React.FC<RepositoryProps> = ({onShowLogModal, onOperationComplete}): React.ReactElement => {
    const {state, setState, setPageLog} = useStateContext()
    const {t} = useI18n()
    
    // Guard against uninitialized state
    if (!state || !state.repository) {
        return <div>Loading...</div>
    }

    const isStaticFirmware = (firmware: string): boolean => firmware === "QMK" || firmware === "Vial"
    const handleSelectFW = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        if (!state || !state.repository) return
        state.repository.firmware = e.target.value
        void setState(state)
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (!state || !state.repository?.firmwares) return
        state.repository.firmwares = state.repository.firmwares
            .map((v): typeof v => v.id === state.repository.firmware ? { ...v, url: e.target.value } : v);
        void setState(state)
    }

    const handleUpdate = (msg1: string, msg2: string): (() => Promise<void>) => async (): Promise<void> => {
        // Show log modal when update starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        if (!state) return
        setPageLog('repository', msg1)
        state.tabDisabled = true
        void setState(state)
        if(isStaticFirmware(state.repository?.firmware)) {
            await api.updateRepository(state.repository.firmware)
        } else {
            const obj = state.repository?.firmwares?.find((v): boolean => v.id === state.repository?.firmware)
            if (obj) await api.updateRepositoryCustom(obj)
        }

        let id: ReturnType<typeof setInterval>
        const checkFn = async (): Promise<void> => {
            const buildCompleted = await api.buildCompleted()
            const exist = await api.existSever()
            if (buildCompleted && exist) {
                state.build.tags = await api.tags()
                state.build.tag = state.build.tags[0] || ''
                setPageLog('repository', msg2)
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
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block" htmlFor="repository-fw-select">
{t('build.firmware')}
                            </Label>
                            <Select
                                id="repository-fw-select"
                                value={state.repository?.firmware || ''}
                                onChange={handleSelectFW}
                                required
                            >
                                {(state.repository?.firmwares || []).map((fw): React.ReactElement =>
                                    (<option
                                        key={`repository-fw-select${fw.id}`}
                                        value={fw.id}
                                    >{fw.id}</option>)
                                )}
                            </Select>
                        </div>
                        
                        <div>
                            <Label className="mb-2 block" htmlFor="repository-custom-url">
{t('settings.repositoryUrl')}
                            </Label>
                            <TextInput
                                type="text"
                                id="repository-custom-url"
                                placeholder={t('settings.gitCloneUrlPlaceholder')}
                                onChange={handleTextChange}
                                value={state.repository?.firmwares?.find((v): boolean => v.id === state.repository?.firmware)?.url || ''}
                                disabled={isStaticFirmware(state.repository?.firmware)}
                                required
                            />
                        </div>
                        
                        <div className="text-center pt-4">
                            <Button
                                color="blue"
                                className={`w-full ${state?.tabDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                style={state?.tabDisabled ? { opacity: 0.5 } : {}}
                                onClick={
                                    state?.tabDisabled 
                                        ? (): void => {} 
                                        : handleUpdate("Updating.....\n\nIt will take a few minutes.\n\n", "Updated!!")
                                }
                                disabled={false}
                            >
{t('settings.updateRepository')}
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
        </div>
    )
}
export default Repository