const util = require('util')
const childProcess = require('child_process')
const exec = util.promisify(childProcess.exec)

const qmkDir = `/root/qmk_firmware`
const vialDir = `/root/vial-qmk`
const qmkCmd = async(cmd) => await exec(`cd ${qmkDir} && ${cmd}`)
const vialCmd = async(cmd) => await exec(`cd ${vialDir} && ${cmd}`)

const findFirmwareLine = (dir) => `find ${dir}/* -maxdepth 0 -regex ".*\\.\\(bin\\|hex\\|uf2\\)"`

const tagZeroFill2Int = (str) => {
    const s = str
            .replace(/\.(\d{1})\./, ".0$1.")
            .replace(/\.(\d{2})$/, ".0$1")
            .replace(/\.(\d{1})$/, ".00$1")
            .replace(/\./g, "")
    return parseInt(s)
}

const rmQmk = async () => await exec(`rm -rf ${qmkDir}`)
const rmVial = async () => await exec(`rm -rf ${vialDir}`)
const rmQmkKeyboards = async () => await exec(`rm -rf ${qmkDir}/keyboards/*`)
const rmVialKeyboards = async () => await exec(`rm -rf ${vialDir}/keyboards/*`)

const cmd = {
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
        await rmQmkKeyboards()
        await qmkCmd(`git reset --hard HEAD^`)
        try {  await qmkCmd(`git checkout -b ${tag} refs/tags/${tag}`) } catch (e){
            await qmkCmd(`git branch -D ${tag}`)
            await qmkCmd(`git checkout -b ${tag} refs/tags/${tag}`)
        }
        await qmkCmd(`make git-submodule`)
        await rmQmkKeyboards()
    },
    checkoutVial: async (commit) => {
        await rmVialKeyboards()
        await vialCmd(`git reset --hard HEAD^`)
        await vialCmd(`git checkout ${commit}`)
        await vialCmd(`make git-submodule`)
        await rmVialKeyboards()
    },
    buildQmkFirmware: async (kb, km) => {
        await exec(`${findFirmwareLine(qmkDir)} -delete`)
        const result = await exec(`qmk compile -kb ${kb} -km ${km}`)
        return result
    },
    buildVialFirmware: async (kb, km) => {
        await exec(`${findFirmwareLine(vialDir)} -delete`)
        const result = await vialCmd(`make ${kb}:${km}`)
        return result
    },
    updateRepositoryQmk: async () => {
        await rmQmk()
        await exec("cd /root && qmk setup -y")
    },
    updateRepositoryVial: async () => {
        await rmVial()
        await exec("cd /root && git clone https://github.com/vial-kb/vial-qmk.git")
        await vialCmd(`make git-submodule`)
    },
    generateQmkFile: async (kb, mcu, layout, user) => {
        await rmQmkKeyboards()
        const result = await exec(`qmk new-keyboard -kb ${kb} -t ${mcu} -l ${layout} -u ${user}`)
        return result
    },
    generateVialId: async () => {
        const result = await vialCmd("python3 util/vial_generate_keyboard_uid.py")
        return result
    },
    cpConfigsToQmk: async (kbDir) => {
        await rmQmkKeyboards()
        await exec(`cp -rf /root/keyboards/${kbDir} ${qmkDir}/keyboards`)
    },
    cpConfigsToVial: async (kbDir) => {
        await rmVialKeyboards()
        await exec(`cp -rf /root/keyboards/${kbDir} ${vialDir}/keyboards`)
    },
    mvQmkConfigsToVolume: async (kbDir) => {
        await exec(`rm -rf /root/keyboards/${kbDir} `)
        await exec(`mv -f ${qmkDir}/keyboards/${kbDir} /root/keyboards`)
    },
    cpFirmware: async (dir) => {
        await exec(`${findFirmwareLine(dir)} -type f -exec cp {} /root/keyboards \\;`)
    }
}

module.exports.cmd = cmd
module.exports.qmkDir = qmkDir
module.exports.vialDir = vialDir