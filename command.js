const util = require('util')
const childProcess = require('child_process')
const exec = util.promisify(childProcess.exec)
const spawn = childProcess.spawn
const axios = require('axios')

if (process.platform === 'darwin') process.env.PATH = `/usr/local/bin:${process.env.PATH}`

const appPath = __dirname.replace(/\/app\.asar/g, "").replace(/\\app\.asar/g, "")
const appExe = async (cmd) => await exec(`cd "${appPath}/gpk_fwmaker" && ${cmd}`)
const appSpawn =  (cmd) => `cd "${appPath}/gpk_fwmaker" && ${cmd}`
const url = (path) => new URL(`http://127.0.0.1:3123${path}`).href
let isDockerUp = false

const tagZeroFill2Int = (str) => {
    const s = str
        .replace(/\.(\d{1})\./, ".0$1.")
        .replace(/\.(\d{2})$/, ".0$1")
        .replace(/\.(\d{1})$/, ".00$1")
        .replace(/\./g, "")
    return parseInt(s)
}

const parseZeroLastDigit = (num) => parseInt(num.toString().slice(0, -1))  * 10

const streamLog = (res, mainWindow, init) => {
    isDockerUp = false
    res.stdout.on('data', (data) => mainWindow.webContents.send("streamLog", data.toString(), init))
    res.stderr.on('data', (data) => mainWindow.webContents.send("streamLog", data.toString(), init))
    res.on('close', () => {
        mainWindow.webContents.send("streamLog", 'finish!!', init)
        isDockerUp = true
    })
}

let buildCompleted = false
const responseStreamLog = async (res, mainWindow, channel) => {
    buildCompleted = false
    const stream = res.data
    stream.on('data', data => mainWindow.webContents.send(channel, data.toString()))
    stream.on('end', () => {
        buildCompleted = true
        mainWindow.webContents.send(channel, "finish!!")
    })
}

const command = {
    upImage: (mainWindow) => {
        const res = spawn(appSpawn("docker-compose build && docker-compose up -d"), { shell: true });
        streamLog(res, mainWindow, true)
    },
    stopImage: async () => await appExe("docker-compose stop"),
    rebuildImage: async (mainWindow) => {
        const res = spawn(appSpawn("docker-compose build --no-cache && docker-compose up -d"), { shell: true });
        streamLog(res, mainWindow)
    },
    existSever: async () => {
        if(isDockerUp) {
            const res = await axios(url("")).catch(e => e)
            return res.status ? res.status : 404
        }
        return 403
    },
    tags: async () => {
        const res = await axios(url('/tags/qmk'))
        const dat = res.data
        const limit = parseZeroLastDigit(tagZeroFill2Int(dat[0]) - 3000)
        const tags = dat.filter(v => tagZeroFill2Int(v) >= limit)
        return tags
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
        mainWindow.webContents.send(channel, "@@@@@init@@@@")
        return res.status === 200 ? responseStreamLog(res, mainWindow, channel) :
        mainWindow.webContents.send("streamLog",  `Cannot POST ${u}`)  
    },
    buildCompleted: () => buildCompleted,
    generateQMKFile: async (dat) => {
        const res = await axios.post(url("/generate/qmk/file"), {
            kb: dat.kb,
            user: dat.user,
            mcu: dat.mcu,
            layout: dat.layout
        }).catch(e => {})

        return res.status === 200 
         ? "Generate!!\n\nFiles are created in GKPFW directory"
         : `Cannot POST ${u}`
    },
    generateVialId: async () => {
        const res = await axios(url(`/generate/vial/id`))
        return res.data
    },
    updateRepository: async (fw, mainWindow) => {
        const res = await axios(url(`/update/repository/${fw}`), {responseType: 'stream'})
        await responseStreamLog(res, mainWindow, "streamLog")
    }
}

module.exports.command = command
