const util = require('util')
const childProcess = require('child_process')
const exec = util.promisify(childProcess.exec)
const axios = require('axios')

if (process.platform === 'darwin') process.env.PATH = `/usr/local/bin:${process.env.PATH}`

const appPath = __dirname.replace(/\/app\.asar/g, "")
const appExe = async (cmd) => await exec(`cd '${appPath}/gpk_fwmaker' && ${cmd}`)

const tagZeroFill2Int = (str) => {
    const s = str
        .replace(/\.(\d{1})\./, ".0$1.")
        .replace(/\.(\d{2})$/, ".0$1")
        .replace(/\.(\d{1})$/, ".00$1")
        .replace(/\./g, "")
    return parseInt(s)
}

const parseZeroLastDigit = (num) => parseInt(num.toString().slice(0, -1))  * 10

const url = (path) => new URL(`http://127.0.0.1:3123${path}`).href

const command = {
    upImage: async () => await appExe("docker-compose build && docker-compose up -d"),
    stopImage: async () => await appExe("docker-compose stop"),
    existSever: async () => {
        const res = await axios(url("")).catch(e => {})
        return !!res
    },
    tags: async () => {
        const res = await axios(url('/tags/qmk '))
        const dat = res.data
        const limit = parseZeroLastDigit(tagZeroFill2Int(dat[0]) - 3000)
        const tags = dat.filter(v => tagZeroFill2Int(v) >= limit)
        return tags
    },
    build: async (dat) => {
        const result = await axios.post(url(`/build/${dat.fw}`), {
                tag: dat.selectedTag,
                kb: dat.kb,
                km: dat.km
            })
        return result.data
    },
    update: async (fw) => {
        const result = await axios(url(`/update/${fw}`))
        return result.data
    }
}

module.exports.command = command
