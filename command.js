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


const streamLog = (result, mainWindow) => {
    result.stdout.on('data', (data) => mainWindow.webContents.send("upImage", data.toString()))
    result.stderr.on('data', (data) => mainWindow.webContents.send("upImage", data.toString()))
    result.on('close', () => {
        mainWindow.webContents.send("upImage", 'finish!!')
        isDockerUp = true
    })
}

const command = {
    upImage: (mainWindow) => {
        const result = spawn(appSpawn("docker-compose build && docker-compose up -d"), { shell: true });
        streamLog(result, mainWindow)
    },
    stopImage: async () => await appExe("docker-compose stop"),
    rebuildImage: async (mainWindow) => {
        isDockerUp = false
        const result = spawn(appSpawn("docker-compose build --no-cache && docker-compose up -d"), { shell: true });
        streamLog(result, mainWindow)
    },
    existSever: async () => {
        if(isDockerUp) {
            const res = await axios(url("")).catch(e => {})
            return res.status === 200
        }
        return isDockerUp
    },
    tags: async () => {
        const res = await axios(url('/tags/qmk'))
        const dat = res.data
        const limit = parseZeroLastDigit(tagZeroFill2Int(dat[0]) - 3000)
        const tags = dat.filter(v => tagZeroFill2Int(v) >= limit)
        return tags
    },
    build: async (dat) => {
        const u = `/build/${dat.fw}`
        const params = dat.fw === "qmk" ? {
            kb: dat.kb,
            km: dat.km,
            tag: dat.tag,
        } : {
            kb: dat.kb,
            km: dat.km,
            commit: dat.commit,
        }
        const res = await axios.post(url(u), params).catch(e => {})
        return res.status === 200 ? res.data : {
            stderr: `Cannot POST ${u}`,
            stdout: ""
        }
    },
    generateQMKFile: async (dat) => {
        const res = await axios.post(url("/generate/qmk/file"), {
            kb: dat.kb,
            user: dat.user,
            mcu: dat.mcu,
            layout: dat.layout
        }).catch(e => {})

        return res.status === 200 ? {
            stderr: "",
            stdout: "Generate!!\n\nFiles are created in GKPFW directory"
        } : {
            stderr: `Cannot POST ${u}`,
            stdout: ""
        }
    },
    generateVialId: async () => {
        const result = await axios(url(`/generate/vial/id`))
        return result.data
    },
    updateRepository: async (fw) => {
        const result = await axios(url(`/update/repository/${fw}`))
        return result.data
    }
}

module.exports.command = command
