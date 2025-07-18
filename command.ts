import util from 'util'
import { exec as execCallback, spawn, ChildProcess } from 'child_process'
import axios, { AxiosResponse } from 'axios'
import fs from 'fs'
import FormData from 'form-data'
import path from 'path'
import ElectronStore from 'electron-store'
import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'url'
import { 
    FileObject, 
    BuildData, 
    GenerateQMKData, 
    ConvertKleData, 
    ConvertViaData, 
    ConvertVilData, 
    UpdateRepositoryCustomData, 
    CheckoutData, 
    KeyboardInfo 
} from './types/index.ts'
import { getTranslation } from './i18n-main.ts'

const exec = util.promisify(execCallback)
const store = new ElectronStore()

const dockerVersion = /gpk_fwmaker_0007/
const cmdVersion = 8

if (process.platform === 'darwin') process.env.PATH = `/usr/local/bin:${process.env.PATH}`
const instance = axios.create()
instance.defaults.timeout = 2500

const state = store.get('state') as any
const localFWMakerUrl = "http://127.0.0.1:3123"
const localFWdir = `${app.getPath('home')}/GPKFW/`

const fwMakerUrl = state?.setting?.fwMakerUrl ? state.setting.fwMakerUrl : localFWMakerUrl
const fwDir = state?.setting?.fwDir ? state.setting.fwDir : localFWdir

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const appPath = __dirname.replace(/\/app\.asar/g, "").replace(/\\app\.asar/g, "")
// For development and production, look for gpk_fwmaker in the project root
const gpkFwmakerPath = path.join(appPath, '../gpk_fwmaker')
const fwMakerUrlMassage = "The docker command will not be issued unless the docker URL is 127.0.0.1."

const appExe = async (cmd: string): Promise<string> =>
    fwMakerUrl.includes("127.0.0.1") ? (await exec(`cd "${gpkFwmakerPath}" && ${cmd}`)).stdout : fwMakerUrlMassage

const appSpawn = (cmd: string): string =>
    fwMakerUrl.includes("127.0.0.1") ? `cd "${gpkFwmakerPath}" && ${cmd}` : fwMakerUrlMassage

const url = (path: string): string => new URL(`${fwMakerUrl}${path}`).href
let isDockerUp = false
let skipCheckDocker = !fwMakerUrl.includes("127.0.0.1") ? !fwMakerUrl.includes("127.0.0.1") : false


const fileAppend = (data: FormData, key: string, obj: FileObject): void => {
    const buffer = fs.readFileSync(obj.path)
    data.append(key, buffer, {
        filename: obj.name,
        contentType: 'application/json',
        knownLength: buffer.length
    })
}

const streamLog = (res: ChildProcess, mainWindow: BrowserWindow, init?: boolean): void => {
    isDockerUp = false
    buildCompleted = false
    res.stdout?.on('data', (data) => mainWindow.webContents.send("streamLog", data.toString(), init))
    res.stderr?.on('data', (data) => mainWindow.webContents.send("streamLog", data.toString(), init))
    res.on('close', () => {
        mainWindow.webContents.send("streamLog", 'finish!!', init)
        isDockerUp = true
        buildCompleted = true
    })
}

const createdMsg = "Files are created in GKPFW directory"
let buildCompleted = false

const responseStreamLog = async (res: AxiosResponse, mainWindow: BrowserWindow, channel: string): Promise<void> => {
    buildCompleted = false
    const stream = res.data
    stream.on('data', (data: Buffer) => mainWindow.webContents.send(channel, data.toString()))
    stream.on('end', () => {
        buildCompleted = true
        mainWindow.webContents.send(channel, "<span style='display: none'>@@@@finish@@@@</span>")
    })
}

const command = {
    upImage: async (mainWindow: BrowserWindow): Promise<void> => {
        if (!skipCheckDocker) {
            try {
                const cmd = async (result: { stdout: string }): Promise<string> => {
                    const isDockerVersion = dockerVersion.test(result.stdout)
                    const stateCmdVersion = store.get('cmdVersion')
                    if (isDockerVersion && stateCmdVersion === cmdVersion) return "docker compose start"
                    else if (isDockerVersion && stateCmdVersion !== cmdVersion) {
                        await store.set('cmdVersion', cmdVersion)
                        return "docker compose up -d --build"
                    }
                    else return "docker compose up -d --build --force-recreate"
                }

                const result = await appExe("docker images")
                if (result === fwMakerUrlMassage) {
                    return
                }
                const res = spawn(appSpawn(await cmd({ stdout: result })), { shell: true })
                streamLog(res, mainWindow, true)
            } catch (error) {
                console.error("Error starting Docker container:", error)
                if (mainWindow) {
                    mainWindow.webContents.send("streamLog", `Docker error: ${(error as Error).message}`)
                }
            }
        }
    },
    stopImage: async (): Promise<void> => {
        if (!skipCheckDocker) {
            try {
                await appExe("docker compose stop")
            } catch (error) {
                console.error("Error stopping Docker container:", error)
            }
        }
    },
    rebuildImage: async (mainWindow: BrowserWindow): Promise<void> => {
        const res = spawn(appSpawn("docker compose rm -f -s -v && docker compose build --no-cache && docker compose up -d"), { shell: true })
        streamLog(res, mainWindow)
    },
    setSkipCheckDocker: async (skip: boolean): Promise<void> => {
        skipCheckDocker = skip
    },
    existSever: async (): Promise<number> => {
        if (skipCheckDocker) return 503
        if (isDockerUp) {
            const res = await instance(url("")).catch(e => e)
            return res.status ? res.status : 404
        }
        return 403
    },
    tags: async (): Promise<string[]> => {
        const res = await instance(url('/tags/qmk')).catch(e => e)
        if (res.status === 200) {
            return res.data
        } else {
            return []
        }
    },
    checkout: async (obj: CheckoutData, mainWindow: BrowserWindow): Promise<void> => {
        const res = await axios({
            url: url("/checkout"),
            method: 'post',
            responseType: 'stream',
            data: obj
        }).catch(e => {
            console.error(e)
        })
        const channel = "streamBuildLog"
        mainWindow.webContents.send(channel, "@@@@init@@@@")
        const fail = (): void => {
            mainWindow.webContents.send("streamLog", `POST ${url("/checkout")} failed`)
            buildCompleted = true
        }
        return res?.status === 200 ? responseStreamLog(res, mainWindow, channel) : fail()
    },
    copyKeyboardFile: async (obj: any, mainWindow: BrowserWindow): Promise<void> => {
        const res = await axios({
            url: url("/copy/keyboard"),
            method: 'post',
            responseType: 'stream',
            data: obj
        }).catch(e => {
            console.error(e)
        })
        const channel = "streamBuildLog"
        mainWindow.webContents.send(channel, "@@@@init@@@@")
        const fail = (): void => {
            mainWindow.webContents.send("streamLog", `POST ${url("/copy/keyboard")} failed`)
            buildCompleted = true
        }
        return res?.status === 200 ? responseStreamLog(res, mainWindow, channel) : fail()
    },
    build: async (dat: BuildData, mainWindow: BrowserWindow): Promise<void> => {
        const u = dat.fw === "QMK" || dat.fw === "Vial" ? `/build/${dat.fw.toLowerCase()}` : `/build/custom`
        const data = dat.fw === "QMK" ? {
            kb: dat.kb,
            km: dat.km,
            tag: dat.tag,
            useRepo: dat.useRepo,
        } : {
            fw: dat.fw.toLowerCase(),
            kb: dat.kb,
            km: dat.km,
            commit: dat.commit,
            useRepo: dat.useRepo,
        }
        const res = await axios({
            url: url(u),
            method: 'post',
            responseType: 'stream',
            data: data
        }).catch(e => {
        })
        const channel = "streamBuildLog"
        mainWindow.webContents.send(channel, "@@@@init@@@@")
        return res?.status === 200 ? responseStreamLog(res, mainWindow, channel) :
            mainWindow.webContents.send("streamLog", `Cannot POST ${u}`)
    },
    buildCompleted: (): boolean => buildCompleted,
    listLocalKeyboards: (isWin: boolean): KeyboardInfo[] => {
        const d: string[] = []
        const searchFiles = (dirPath: string): void => {
            const allDirents = fs.readdirSync(dirPath, { withFileTypes: true })
            allDirents.map(v => {
                if (v.isDirectory()) {
                    const fp = path.join(dirPath, v.name)
                    searchFiles(fp)
                    if (isWin) {
                        if (fp.match(/\\keymaps\\/)) d.push(fp)
                    } else {
                        if (fp.match(/\/keymaps\//)) d.push(fp)
                    }
                }
            })
        }
        searchFiles(fwDir)
        const fd = fwDir.replace(/\//g, '\\')
        const keymapsDirs = d.flat().map(v => isWin ? v.replace(fd, '').split("\\keymaps\\") :
            v.replace(fwDir, '').split("/keymaps/"))
        const kb = Array.from(new Set(keymapsDirs.map(v => v[0])))

        return kb.map(k => {
            return {
                kb: k.replace(/\\/g, '/'),
                km: keymapsDirs.filter(v => v[0] === k).map(v => v[1])
            }
        })
    },
    listRemoteKeyboards: async (fw: string): Promise<any[]> => {
        const res = await axios.post(url("/list/keyboards"), {
            fw: fw.toLowerCase()
        }).catch(e => {
        })
        return res?.data ? res.data : []
    },
    generateQMKFile: async (dat: GenerateQMKData): Promise<string> => {
        const res = await axios.post(url("/generate/qmk/file"), {
            kb: dat.kb,
            user: dat.user,
            mcu: dat.mcu,
            layout: dat.layout
        }).catch(e => {
        })

        return res?.status === 200
            ? `Generate!!\n\n${createdMsg}`
            : `Cannot POST`
    },
    generateVialId: async (): Promise<any> => {
        const res = await axios(url(`/generate/vial/id`))
        return res.data
    },
    updateRepository: async (fw: string, mainWindow: BrowserWindow): Promise<void> => {
        const res = await axios(url(`/update/repository/${fw.toLowerCase()}`), { responseType: 'stream' }).catch(e => {
            mainWindow.webContents.send("streamLog", `network error ${e}.\n${getTranslation('common.pleaseRestartApplication')}`)
        })
        if(res) await responseStreamLog(res, mainWindow, "streamLog")
    },
    updateRepositoryCustom: async (obj: UpdateRepositoryCustomData, mainWindow: BrowserWindow): Promise<void> => {
        const res = await axios({
            url: url("/update/repository/custom"),
            method: 'post',
            responseType: 'stream',
            data: {
                id: obj.id.toLowerCase(),
                url: obj.url
            }
        }).catch(e => {
            mainWindow.webContents.send("streamLog", `network error ${e}.\n${getTranslation('common.pleaseRestartApplication')}`)
        })
        if (res) await responseStreamLog(res, mainWindow, "streamLog")
    },
    convertVilJson: async (file: ConvertVilData): Promise<string> => {
        const data = new FormData()
        fileAppend(data, 'vil', file.vilObj)

        const res = await axios.post(url("/convert/vil/keymap_c"), data,
            { headers: { "Content-Type": "multipart/form-data" } })
        return res.data === "convert" ? `Converted!!\n\n${createdMsg}` : res.data
    },
    convertViaJson: async (file: ConvertViaData): Promise<string> => {
        const data = new FormData()
        fileAppend(data, 'info', file.info)
        fileAppend(data, 'kle', file.kle)

        const res = await axios.post(url("/convert/via/json"), data,
            { headers: { "Content-Type": "multipart/form-data" } })
        return res.data === "convert" ? `Converted!!\n\n${createdMsg}` : res.data
    },
    convertKleJson: async (obj: ConvertKleData): Promise<string> => {
        const data = new FormData()
        fileAppend(data, 'kle', obj.file)
        data.append('params', JSON.stringify(obj.params))
        const res = await axios.post(url("/convert/kle/qmk"), data,
            { headers: { "Content-Type": "multipart/form-data" } })
        return res.data === "convert" ? `Converted!!\n\n${createdMsg}` : res.data
    },
    readJson: async (path: string): Promise<any> => {
        const buffer = await fs.readFileSync(path)
        return JSON.parse(buffer.toString())
    },
    getLocalFWdir: (): string => localFWdir
}

export default command