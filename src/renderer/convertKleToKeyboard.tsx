import React, {useState} from 'react'
import { Button, Label, TextInput, Select, Checkbox, HelperText } from 'flowbite-react'

import {useStateContext} from "../context"
import PinSelectorModal from "../components/PinSelectorModal"
import FileUpload from "../components/FileUpload"
import { useI18n } from '../hooks/useI18n'

const {api} = window

interface ConvertKleToKeyboardProps {
    onShowLogModal?: () => void;
    onOperationComplete?: () => void;
}

const ConvertKleToKeyboard: React.FC<ConvertKleToKeyboardProps> = ({onShowLogModal, onOperationComplete}): React.ReactElement => {
    const {state, setState, setPageLog} = useStateContext()
    const { t } = useI18n()
    
    const [kleObj, setKleObj] = useState({
        name : "",
        path : "",
    })
    const [pinCols, setPinCols] = React.useState<string[]>([]);
    const [pinRows, setPinRows] = React.useState<string[]>([]);
    const [showRowsModal, setShowRowsModal] = useState(false);
    const [showColsModal, setShowColsModal] = useState(false);

    const [keyboardError, setKeyboardError] = useState(false)
    const [usernameEmptyError, setUsernameEmptyError] = useState(false)
    const [vidEmptyError, setVidEmptyError] = useState(false)
    const [pidEmptyError, setPidEmptyError] = useState(false)
    const [colsEmptyError, setColsEmptyError] = useState(false)
    const [rowsEmptyError, setRowsEmptyError] = useState(false)

    const [keyboardStrError, setKeyboardStrError] = useState(false)
    const [usernameStrError, setUsernameStrError] = useState(false)
    const [vidStrError, setVidStrError] = useState(false)
    const [pidStrError, setPidStrError] = useState(false)

    const [pidSameError, setPidSameError] = useState(false)
    const [kleFileError, setKleFileError] = useState(false)
    const [kleFileErrorMessage, setKleFileErrorMessage] = useState("")

    const [KleOptions, setKleOptions] = useState({
        vial : false,
        via : false
    })
    const [disabledKleConvertButton, setDisabledKleConvertButton] = useState(true)
    const [disabledConvertText, setDisabledConvertText] = useState(false)

    // Guard against uninitialized state
    if (!state || !state.convert) {
        return <div>Loading...</div>
    }

    const validKleConvertButton = (): void => {
        const kle = state.convert.kle
        const reg1 = /^[A-Za-z0-9 _/-]+$/
        const reg2 = /^[A-Z0-9x]+$/
        const isViaObj = state.convert.kle.option === 2
        let validKeyboardStrError = false
        let validUsernameStrError = false
        let validVidStrError = false
        let validPidStrError = false
        let validPidSameError = false

        if(kle.kb.length > 0){
            validKeyboardStrError = (reg1).test(kle.kb)
            setKeyboardStrError(!validKeyboardStrError)
        }
        if(kle.user.length > 0){
            validUsernameStrError = (reg1).test(kle.user)
            setUsernameStrError(!validUsernameStrError)
        }
        if(kle.vid.length > 0){
            validVidStrError = (reg2).test(kle.vid)
            setVidStrError(!validVidStrError)
        }
        if(kle.pid.length > 0){
            validPidStrError = (reg2).test(kle.pid)
            setPidStrError(!validPidStrError)
            validPidSameError = kle.pid !== "0x0000"
            setPidSameError(!validPidSameError)
        }
        const uploadedKleFile = kleObj.name.length > 0

        const validDisableButton = (m2: boolean): boolean => {
            const m1 = Boolean(kle.kb && kle.user && kle.vid && kle.pid && validKeyboardStrError && validUsernameStrError && validVidStrError
                && validPidStrError && validPidSameError && uploadedKleFile)
            return m1 && m2
        }

        setDisabledKleConvertButton(isViaObj ? !validDisableButton(true) : !validDisableButton(Boolean(kle.rows && kle.cols)))
    }

    const validKleEmpty = (): void => {
        setKeyboardError(!state.convert.kle.kb)
        setUsernameEmptyError(!state.convert.kle.user)
        setVidEmptyError(!state.convert.kle.vid)
        setPidEmptyError(!state.convert.kle.pid)
        setRowsEmptyError(state.convert.kle.option === 2 ? false : !state.convert.kle.rows)
        setColsEmptyError(state.convert.kle.option === 2 ? false : !state.convert.kle.cols)
    }

    const handleTextChange = (inputName: string): ((e: React.ChangeEvent<HTMLInputElement> | string[]) => void) => (e: React.ChangeEvent<HTMLInputElement> | string[]): void => {
        let v: string | string[]
        if (Array.isArray(e)) {
            v = e
        } else {
            v = e.target.value
        }
        const newKle = { ...state.convert.kle }
        if(inputName === 'kb') newKle.kb = v as string
        if(inputName === 'user') newKle.user = v as string
        if(inputName === 'vid') newKle.vid = v as string
        if(inputName === 'pid') newKle.pid = v as string
        if(inputName === 'rows') {
            newKle.rows = Array.isArray(v) && v.length > 0 ? v.join(',') : ''
            setPinRows(Array.isArray(v) ? v : [])
        }
        if(inputName === 'cols') {
            newKle.cols = Array.isArray(v) && v.length > 0 ? v.join(',') : ''
            setPinCols(Array.isArray(v) ? v : [])
        }

        validKleEmpty()
        validKleConvertButton()
        void setState({
            ...state,
            convert: {
                ...state.convert,
                kle: newKle
            }
        })
    }

    const handleSelectMCU = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        void setState({
            ...state,
            convert: {
                ...state.convert,
                kle: {
                    ...state.convert.kle,
                    mcu: e.target.value,
                    rows: '',
                    cols: ''
                }
            }
        })
        setPinRows([])
        setPinCols([])
        validKleConvertButton()
    }

    const convertMsg =  "Convert...."
    const handleKleFileSubmit = (): (() => Promise<void>) => async (): Promise<void> => {
        // Show log modal when conversion starts
        if (onShowLogModal) {
            onShowLogModal()
        }
        
        setDisabledKleConvertButton(true)
        setDisabledConvertText(true)
        if (!state) return
        setPageLog('convertKleToKeyboard', convertMsg)
        void setState({
            ...state,
            tabDisabled: true
        })
        const logs = await api.convertKleJson({params: state.convert.kle, file: kleObj})

        setDisabledKleConvertButton(false)
        setDisabledConvertText(false)
        setPageLog('convertKleToKeyboard', logs as string)
        void setState({
            ...state,
            tabDisabled: false
        })
        
        if (onOperationComplete) {
            onOperationComplete()
        }
    }

    const handleKleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0]
        setKleFileError(false)
        setKleFileErrorMessage("")
        
        if (!file) return
        
        try {
            // Validate file type
            if (!file.name.toLowerCase().endsWith('on')) {
                setKleFileError(true)
                setKleFileErrorMessage(t('validation.selectValidJsonFile'))
                return
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setKleFileError(true)
                setKleFileErrorMessage(t('validation.fileSizeLimit', { size: '10MB' }))
                return
            }
            
            const newKleObj = {
                name: file.name,
                path: (window as unknown as {webUtils: {getPathForFile: (file: File) => string}}).webUtils.getPathForFile(file)
            }
            setKleObj(newKleObj)

            try {
                const json = await api.readJson(newKleObj.path)

                // Validate JSON structure
                if (!Array.isArray(json)) {
                    setKleFileError(true)
                    setKleFileErrorMessage(t('validation.invalidKleFormat'))
                    return
                }

                // Extract metadata from KLE JSON
                const obj = json.filter((v): v is Record<string, unknown> => !Array.isArray(v))[0]
                const newKle = { ...state.convert.kle }
                if (obj) {
                    if (obj.name && typeof obj.name === 'string') newKle.kb = obj.name
                    if (obj.author && typeof obj.author === 'string') newKle.user = obj.author
                }

                void setState({
                    ...state,
                    convert: {
                        ...state.convert,
                        kle: newKle
                    }
                })
                validKleConvertButton()
            } catch (jsonError) {
                console.error("JSON parsing error:", jsonError)
                setKleFileError(true)
                setKleFileErrorMessage(t('validation.invalidJsonFormat'))
                setKleObj({ name: "", path: "" })
            }
        } catch (error) {
            console.error("File upload error:", error)
            setKleFileError(true)
            setKleFileErrorMessage(t('validation.fileReadError'))
            setKleObj({ name: "", path: "" })
        }
    }

    const handleKleOptionChange = (i: number): ((e: React.ChangeEvent<HTMLInputElement>) => Promise<void>) => async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        let newVial = KleOptions.vial
        let newVia = KleOptions.via
        if(i === 1){
            newVial = e.target.checked
            if(e.target.checked) newVia = false
        }
        if(i === 2){
            newVia = e.target.checked
            if(e.target.checked) newVial = false
        }
        setKleOptions({ vial: newVial, via: newVia })

        let newOption = 0
        if(newVial) {
            newOption = 1
        } else if(newVia) {
            newOption = 2
        }
        void setState({
            ...state,
            convert: {
                ...state.convert,
                kle: {
                    ...state.convert.kle,
                    option: newOption
                }
            }
        })
        validKleEmpty()
        validKleConvertButton()
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* File Upload */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block" htmlFor="kle-file">{t('convert.kleJsonFile')} *</Label>
                            <FileUpload
                                id="kle-file"
                                label={t('convert.chooseFile')}
                                accept="on"
                                onChange={handleKleFileUpload}
                                filename={kleObj.name}
                                variant="outlined"
                            />
                        </div>
                        {kleFileError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    ✗ {kleFileErrorMessage}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Configuration - All settings in one frame */}
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label className="mb-1 block" htmlFor="convert-kle-mcu-select">{t('common.mcu')}</Label>
                            <Select
                                id="convert-kle-mcu-select"
                                value={state?.convert.kle.mcu || 'RP2040'}
                                onChange={handleSelectMCU}
                                required
                                sizing="sm"
                            >
                                <option value="RP2040">RP2040</option>
                                <option value="promicro">Pro Micro</option>
                            </Select>
                        </div>
                        
                        <div>
                            <Label
                                className={`mb-1 block ${keyboardError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="convert-kle-kb"
                            >
{t('common.keyboardName')} *
                            </Label>
                            <TextInput
                                type="text"
                                id="convert-kle-kb"
                                required
                                color={keyboardError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("kb")}
                                value={state?.convert.kle.kb || ''}
                                sizing="sm"
                            />
                            {keyboardStrError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    {t('validation.alphanumericOnly')}
                                </HelperText>
                            )}
                        </div>
                        
                        <div>
                            <Label
                                className={`mb-1 block ${usernameEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="km"
                            >
{t('common.username')} *
                            </Label>
                            <TextInput
                                type="text"
                                id="km"
                                required
                                color={usernameEmptyError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("user")}
                                value={state?.convert.kle.user || ''}
                                sizing="sm"
                            />
                            {usernameStrError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    {t('validation.alphanumericOnly')}
                                </HelperText>
                            )}
                        </div>
                        
                        <div>
                            <Label
                                className={`mb-1 block ${vidEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="vid"
                            >
{t('common.vendorId')} *
                            </Label>
                            <TextInput
                                type="text"
                                id="vid"
                                required
                                color={vidEmptyError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("vid")}
                                value={state?.convert.kle.vid || ''}
                                sizing="sm"
                            />
                            {vidStrError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    {t('validation.hexOnly')}
                                </HelperText>
                            )}
                        </div>
                        
                        <div>
                            <Label
                                className={`mb-1 block ${pidEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                htmlFor="pid"
                            >
{t('common.productId')} *
                            </Label>
                            <TextInput
                                type="text"
                                id="pid"
                                required
                                color={pidEmptyError ? "failure" : "gray"}
                                disabled={disabledConvertText}
                                onChange={handleTextChange("pid")}
                                value={state?.convert.kle.pid || ''}
                                sizing="sm"
                            />
                            {pidStrError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    {t('validation.hexOnly')}
                                </HelperText>
                            )}
                            {pidSameError && (
                                <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
{t('validation.notZero')}
                                </HelperText>
                            )}
                        </div>

                        {/* {t('convert.outputOptions')} - horizontal layout */}
                        <div>
                            <Label className="mb-3 block">{t('convert.outputOptions')}</Label>
                            <div className="flex gap-6">
                                <div className="flex items-center">
                                    <Checkbox
                                        id="vial-settings"
                                        checked={state?.convert.kle.option === 1}
                                        onChange={handleKleOptionChange(1)}
                                        className="mr-2"
                                    />
                                    <Label htmlFor="vial-settings" className="text-sm">
                                        {t('convert.addVialSettings')}
                                    </Label>
                                </div>
                                <div className="flex items-center">
                                    <Checkbox
                                        id="only-via"
                                        checked={state?.convert.kle.option === 2}
                                        onChange={handleKleOptionChange(2)}
                                        className="mr-2"
                                    />
                                    <Label htmlFor="only-via" className="text-sm">
                                        {t('convert.onlyVia')}
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Matrix Configuration - only when not "{t('convert.onlyVia')}" */}
                        {state.convert.kle.option !== 2 && (
                            <>
                                {/* Rows Configuration */}
                                <div>
                                    <Label 
                                        className={`mb-2 block ${rowsEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                    >
                                        {t('convert.matrixPinsRows')} *
                                    </Label>
                                    <Button
                                        color="light"
                                        onClick={disabledConvertText ? (): void => {} : (): void => setShowRowsModal(true)}
                                        disabled={false}
                                        className={disabledConvertText ? 'cursor-not-allowed w-full' : 'cursor-pointer w-full'}
                                        style={disabledConvertText ? { opacity: 0.5 } : {}}
                                    >
                                        <div className="text-left w-full">
                                            {pinRows.length > 0 ? (
                                                <span className="text-gray-900 dark:text-white">
{t('common.selected', { items: pinRows.join(', '), count: pinRows.length.toString() })}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">
{t('convert.selectRowPins')}
                                                </span>
                                            )}
                                        </div>
                                    </Button>
                                    {rowsEmptyError && (
                                        <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
{t('validation.selectRowPins')}
                                        </HelperText>
                                    )}
                                </div>

                                {/* Cols Configuration */}
                                <div>
                                    <Label 
                                        className={`mb-2 block ${colsEmptyError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
                                    >
                                        {t('convert.matrixPinsCols')} *
                                    </Label>
                                    <Button
                                        color="light"
                                        onClick={disabledConvertText ? (): void => {} : (): void => setShowColsModal(true)}
                                        disabled={false}
                                        className={disabledConvertText ? 'cursor-not-allowed w-full' : 'cursor-pointer w-full'}
                                        style={disabledConvertText ? { opacity: 0.5 } : {}}
                                    >
                                        <div className="text-left w-full">
                                            {pinCols.length > 0 ? (
                                                <span className="text-gray-900 dark:text-white">
{t('common.selected', { items: pinCols.join(', '), count: pinCols.length.toString() })}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">
{t('convert.selectColumnPins')}
                                                </span>
                                            )}
                                        </div>
                                    </Button>
                                    {colsEmptyError && (
                                        <HelperText className="mt-1 text-xs text-red-600 dark:text-red-500">
{t('validation.selectColumnPins')}
                                        </HelperText>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            
                {/* Convert Button */}
                <div className="pt-2">
                    <Button
                        color="blue"
                        className={`w-full ${disabledKleConvertButton ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        style={disabledKleConvertButton ? { opacity: 0.5 } : {}}
                        onClick={disabledKleConvertButton ? (): void => {} : handleKleFileSubmit()}
                        disabled={false}
                    >
                        {t('convert.convertButton')}
                    </Button>
                </div>
            </div>

            {/* Pin Selector Modals */}
            <PinSelectorModal
                isOpen={showRowsModal}
                onClose={(): void => setShowRowsModal(false)}
                title="Matrix Pins - Rows Selection"
                availablePins={state?.convert.kle.mcu === 'promicro' ? state?.convert.pins.promicro || [] : state?.convert.pins.rp2040 || []}
                selectedPins={pinRows}
                onConfirm={(pins): void => {
                    setPinRows(pins)
                    if (state) {
                        void setState({
                            ...state,
                            convert: {
                                ...state.convert,
                                kle: {
                                    ...state.convert.kle,
                                    rows: pins.length > 0 ? pins.join(',') : ''
                                }
                            }
                        })
                    }
                    setRowsEmptyError(pins.length === 0)
                    validKleConvertButton()
                }}
            />

            <PinSelectorModal
                isOpen={showColsModal}
                onClose={(): void => setShowColsModal(false)}
                title="Matrix Pins - Columns Selection"
                availablePins={state?.convert.kle.mcu === 'promicro' ? state?.convert.pins.promicro || [] : state?.convert.pins.rp2040 || []}
                selectedPins={pinCols}
                onConfirm={(pins): void => {
                    setPinCols(pins)
                    if (state) {
                        void setState({
                            ...state,
                            convert: {
                                ...state.convert,
                                kle: {
                                    ...state.convert.kle,
                                    cols: pins.length > 0 ? pins.join(',') : ''
                                }
                            }
                        })
                    }
                    setColsEmptyError(pins.length === 0)
                    validKleConvertButton()
                }}
            />
        </div>
    )
}
export default ConvertKleToKeyboard