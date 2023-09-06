const util = require('util')
const childProcess = require('child_process')
const exec = util.promisify(childProcess.exec)
const spawn = childProcess.spawn
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const path = require('path')
const Store = require("electron-store")
const store = new Store()
const {app} = require("electron")

if (process.platform === 'darwin') process.env.PATH = `/usr/local/bin:${process.env.PATH}`
const instance = axios.create();
instance.defaults.timeout = 2500;
//store.clear('state')
const state  = store.get('state')
const localFWMakerUrl = "http://127.0.0.1:3123"
const localFWdir = `${app.getPath('home')}/GPKFW/`

const fwMakerUrl = state?.setting?.fwMakerUrl ? state.setting.fwMakerUrl : localFWMakerUrl
const fwDir = state?.setting?.fwDir ? state.setting.fwDir : localFWdir

const appPath = __dirname.replace(/\/app\.asar/g, "").replace(/\\app\.asar/g, "")
const fwMakerUrlMassage = "The docker command will not be issued unless the docker URL is 127.0.0.1."
const appExe = async (cmd) =>
    fwMakerUrl.includes("127.0.0.1") ? await exec(`cd "${appPath}/gpk_fwmaker" && ${cmd}`) : fwMakerUrlMassage

const appSpawn =  (cmd) =>
    fwMakerUrl.includes("127.0.0.1") ? `cd "${appPath}/gpk_fwmaker" && ${cmd}` : fwMakerUrlMassage

const url = (path) => new URL(`${fwMakerUrl}${path}`).href
let isDockerUp = false
let skipCheckDocker = !fwMakerUrl.includes("127.0.0.1") ? !fwMakerUrl.includes("127.0.0.1")  : false

const tagZeroFill2Int = (str) => {
    const s = str
        .replace(/\.(\d{1})\./, ".0$1.")
        .replace(/\.(\d{2})$/, ".0$1")
        .replace(/\.(\d{1})$/, ".00$1")
        .replace(/\./g, "")
    return parseInt(s)
}

const parseZeroLastDigit = (num) => parseInt(num.toString().slice(0, -1))  * 10

const fileAppend = (data, key, obj) => {
    const buffer = fs.readFileSync(obj.path)
    data.append(key, buffer, {
        filename: obj.name,
        contentType: 'application/json',
        knownLength: buffer.length
    })
}

const streamLog = (res, mainWindow, init) => {
    isDockerUp = false
    buildCompleted = false
    res.stdout.on('data', (data) => mainWindow.webContents.send("streamLog", data.toString(), init))
    res.stderr.on('data', (data) => mainWindow.webContents.send("streamLog", data.toString(), init))
    res.on('close', () => {
        mainWindow.webContents.send("streamLog", 'finish!!', init)
        isDockerUp = true
        buildCompleted = true
    })
}

const createdMsg  = "Files are created in GKPFW directory"
let buildCompleted = false
const responseStreamLog = async (res, mainWindow, channel) => {
    buildCompleted = false
    const stream = res.data
    stream.on('data', data => mainWindow.webContents.send(channel, data.toString()))
    stream.on('end', () => {
        buildCompleted = true
        mainWindow.webContents.send(channel, "<span style='display: none'>@@@@finish@@@@</span>")
    })
}

const command = {
    upImage: (mainWindow) => {
        if(!skipCheckDocker){
            const res = spawn(appSpawn("docker compose build && docker compose up -d"), { shell: true })
            streamLog(res, mainWindow, true)
        }
    },
    stopImage: async () => {
        if(!skipCheckDocker) await appExe("docker compose stop")
    },
    rebuildImage: async (mainWindow) => {
        const res = spawn(appSpawn("docker compose stop && docker compose rm -f --volumes && docker compose build --no-cache && docker compose up -d"), { shell: true });
        streamLog(res, mainWindow)
    },
    setSkipCheckDocker: async (skip) => skipCheckDocker = skip,
    existSever: async () => {
        if(skipCheckDocker) return 503
        if(isDockerUp) {
            const res = await instance(url("")).catch(e => e)
            return res.status ? res.status : 404
        }
        return 403
    },
    tags: async () => {
        const res = await instance(url('/tags/qmk')).catch(e => e)
        if(res.status === 200) {
            const dat = res.data
            const limit = parseZeroLastDigit(tagZeroFill2Int(dat[0]) - 3000)
            const tags = dat.filter(v => tagZeroFill2Int(v) >= limit)
            return tags
        } else {
            return []
        }
    },
    build: async (dat, mainWindow) => {
        const u = `/build/${dat.fw}`
        const data = dat.fw === "qmk" ? {
            kb: dat.kb,
            km: dat.km,
            tag: dat.tag,
        } : {
            kb: dat.kb,
            km: dat.km,
            commit: dat.commit,
        }
        const res = await axios({
            url: url(u),
            method: 'post',
            responseType: 'stream',
            data: data
        }).catch(e => {})
        const channel = "streamBuildLog"
        mainWindow.webContents.send(channel, "@@@@init@@@@")
        return res.status === 200 ? responseStreamLog(res, mainWindow, channel) :
        mainWindow.webContents.send("streamLog",  `Cannot POST ${u}`)  
    },
    buildCompleted: () => buildCompleted,
    buildCache: (isWin) => {
        const d = []
        const searchFiles = (dirPath) => {
            const allDirents = fs.readdirSync(dirPath, { withFileTypes: true })
            const f = []
            allDirents.map(v => {
                if (v.isDirectory()) {
                    const fp = path.join(dirPath, v.name)
                    f.push(searchFiles(fp))
                    if(isWin) {
                        if(fp.match(/\\keymaps\\/)) d.push(fp)
                    } else {
                        if(fp.match(/\/keymaps\//)) d.push(fp)
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
    generateQMKFile: async (dat) => {
        const res = await axios.post(url("/generate/qmk/file"), {
            kb: dat.kb,
            user: dat.user,
            mcu: dat.mcu,
            layout: dat.layout
        }).catch(e => {})

        return res.status === 200 
         ? `Generate!!\n\n${createdMsg}`
         : `Cannot POST`
    },
    generateVialId: async () => {
        const res = await axios(url(`/generate/vial/id`))
        return res.data
    },
    updateRepository: async (fw, mainWindow) => {
        const res = await axios(url(`/update/repository/${fw}`), {responseType: 'stream'})
        await responseStreamLog(res, mainWindow, "streamLog")
    },
    convertViaJson: async (file) => {
        const data = new FormData()
        fileAppend(data, 'info', file.info)
        fileAppend(data,'kle', file.kle)

        const res = await axios.post(url("/convert/via/json"), data,
            {headers: {"Content-Type": "multipart/form-data"}})
        return res.data === "convert" ? `Converted!!\n\n${createdMsg}` : res.data
    },
    convertKleJson: async (obj) => {
        const data = new FormData()
        fileAppend(data,'kle', obj.file)
        data.append('params', JSON.stringify(obj.params))
        const res = await axios.post(url("/convert/kle/qmk"), data,
            {headers: {"Content-Type": "multipart/form-data"}})
        return res.data === "convert" ? `Converted!!\n\n${createdMsg}` : res.data
    },
    readJson: async (path) => {
        const buffer = await fs.readFileSync(path)
        return JSON.parse(buffer.toString())
    },
    getLocalFWdir: () => localFWdir
}

module.exports.command = command
