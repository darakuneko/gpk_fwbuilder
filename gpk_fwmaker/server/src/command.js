const util = require('util')
const childProcess = require('child_process')
const exec = util.promisify(childProcess.exec)

const qmkDir = `/root/qmk_firmware`
const qmkCmd = async(cmd) => await exec(`cd ${qmkDir} && ${cmd}`)
const findFirmwareLine = `find /root/qmk_firmware/* -maxdepth 0 -regex ".*\\.\\(bin\\|hex\\|uf2\\)"`

const tagZeroFill2Int = (str) => {
    const s = str
            .replace(/\.(\d{1})\./, ".0$1.")
            .replace(/\.(\d{2})$/, ".0$1")
            .replace(/\.(\d{1})$/, ".00$1")
            .replace(/\./g, "")
    return parseInt(s)
}

const command = {
    tags: async () => {
        const result = await qmkCmd(`git ls-remote --tags`)

        return result
        .stdout
        .split('\n')
        .flatMap(v => v.match(/tags\/[0-9].*?[0-9]$/) ? v.replace(/.*?tags\//g, '') : [])
        .sort((a, b) => tagZeroFill2Int(b) - tagZeroFill2Int(a))
    },
    currentTag: async () => {
        const result = await qmkCmd(`git branch`)
        return result.stdout.split('\n').filter(v => v.match(/^\* /))[0].replace(/^\* /, '')
    },
    checkoutQmk: async (tag) => {
        await exec("rm -rf /root/qmk_firmware/keyboards/*")
        await qmkCmd(`git reset --hard HEAD^`)
        try {  await qmkCmd(`git checkout -b ${tag} refs/tags/${tag}`) } catch (e){
            await qmkCmd(`git branch -D ${tag}`)
            await qmkCmd(`git checkout -b ${tag} refs/tags/${tag}`)
        }
        await qmkCmd(`make git-submodule`)
        await exec(`rm -rf /root/qmk_firmware/keyboards/*`)
    },
    buildQmkFirmware: async (kb, km) => {
        await exec(`${findFirmwareLine} -delete`)
        const result = await exec(`qmk compile -kb ${kb} -km ${km}`)
        return result
    },
    updateQmk: async () => {
        await exec("rm -rf /root/qmk_firmware")
        await exec("cd /root && git clone https://github.com/qmk/qmk_firmware.git")
    },
    cpConfigs: async (kbDir) => {
        await exec("rm -rf /root/qmk_firmware/keyboards/*")
        await exec(`cp -rf /root/keyboards/${kbDir} /root/qmk_firmware/keyboards`)
    },
    cpFirmware: async () => {
        await exec(`${findFirmwareLine} -type f -exec cp {} /root/keyboards \\;`)
    }
}
module.exports = command;