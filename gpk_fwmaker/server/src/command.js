const util = require('util')
const childProcess = require('child_process')
const exec = util.promisify(childProcess.exec)
const fs = require('fs');

const dirQMK = '/root/qmk_firmware'
const dirVial = '/root/vial-qmk'
const dirFirmFiles = '/firmware-scripts/'

const execCd = async (dir, line) => await exec(`cd ${dir} && ${line}`)
const execQMK = async (line) => await execCd(dirQMK, line)
const execVial = async (line) => await execCd(dirVial, line)
const execFirmFiles = async (line) => await execCd(dirFirmFiles, line)

const spawn = (line) => childProcess.spawn(line, { shell: true })

const streamWriteLine = async (dir, line, res) => {
    await exec(`cd ${dir} && ${line}`)
    res.write(`${line}\n`)
}
const streamWriteLineQMK = async (line, res) => await streamWriteLine(dirQMK, line, res)
const streamWriteLineVial = async (line, res) => await streamWriteLine(dirVial, line, res)

const findFirmwareL = (dir) => `find ${dir}/* -maxdepth 0 -regex ".*\\.\\(bin\\|hex\\|uf2\\)"`
const cpFirmwareL = (dir) => `${findFirmwareL(dir)} -type f -exec cp {} /root/keyboards \\;`

const rmL = (path) => `rm -rf ${path}`
const rmKeyboardsL = (path) => rmL(`${path}/keyboards/*`)

const tagZeroFill2Int = (str) => {
    const s = str
            .replace(/\.(\d{1})\./, ".0$1.")
            .replace(/\.(\d{2})$/, ".0$1")
            .replace(/\.(\d{1})$/, ".00$1")
            .replace(/\./g, "")
    return parseInt(s)
}

const streamLog = (line, res) => {
    const response = spawn(line)
    response.stdout.on('data', (data) => res.write(data.toString()))
    response.stderr.on('data', (data) => res.write(data.toString()))
    response.on('close', () => res.end(''))
}

const streamError = (res, e) => {
    res.end(e.toString())
}

const cmd = {
    tags: async () => {
        const result = await execQMK(`git ls-remote --tags`)

        return result
        .stdout
        .split('\n')
        .flatMap(v => v.match(/tags\/[0-9].*?[0-9]$/) ? v.replace(/.*?tags\//g, '') : [])
        .sort((a, b) => tagZeroFill2Int(b) - tagZeroFill2Int(a))
    },
    currentTag: async () => {
        const result = await execQMK(`git branch`)
        return result.stdout.split('\n').filter(v => v.match(/^\* /))[0].replace(/^\* /, '')
    },
    checkoutQmk: async (res, tag) => {
        await exec(rmKeyboardsL(dirQMK))
        await streamWriteLineQMK("git reset --hard HEAD^", res)
        try {  await streamWriteLineQMK(`git checkout -b ${tag} refs/tags/${tag}`, res) } catch (e){
            await streamWriteLineQMK(`git branch -D ${tag}`, res)
            await streamWriteLineQMK(`git checkout -b ${tag} refs/tags/${tag}`, res)
        }
        await streamWriteLineQMK(`make git-submodule\n`, res)
        await exec(rmKeyboardsL(dirQMK))
    },
    checkoutVial: async (res, commit) => {
        await exec(rmKeyboardsL(dirVial))
        await streamWriteLineVial(`git reset --hard HEAD^`, res)
        await streamWriteLineVial(`git checkout ${commit}`, res)
        await streamWriteLineVial(`make git-submodule\n`, res)
        await exec(rmKeyboardsL(dirVial))
    },
    buildQmkFirmware: async (res, kb, km) => {
        await exec(`${findFirmwareL(dirQMK)} -delete`)
        const line = `qmk compile -kb ${kb} -km ${km} && ${cpFirmwareL(dirQMK)}`
        streamLog(line, res)
    },
    buildVialFirmware: async (res, kb, km) => {
        await exec(`${findFirmwareL(dirVial)} -delete`)
        const line = `cd ${dirVial} && make ${kb}:${km} && ${cpFirmwareL(dirVial)}`
        streamLog(line, res)
    },
    updateRepositoryQmk: async (res) => {
        await exec(rmL(dirQMK))
        const line = "cd /root && qmk setup -y"
        streamLog(line, res)
    },
    updateRepositoryVial: async (res) => {
        await exec(rmL(dirVial))
        const line = `cd /root && git clone https://github.com/vial-kb/vial-qmk.git && cd ${dirVial} && make git-submodule`
        streamLog(line, res)
    },
    generateQmkFile: async (kb, mcu, layout, user) => {
        await exec(rmKeyboardsL(dirQMK))
        const result = await exec(`qmk new-keyboard -kb ${kb} -t ${mcu} -l ${layout} -u ${user}`)
        return result
    },
    generateVialId: async () => {
        const result = await execVial("python3 util/vial_generate_keyboard_uid.py")
        return result.stdout
    },
    generateFirmFiles: async (jsonPath) => {
        await execFirmFiles(`python3 ./run.py ${jsonPath}`)
    },
    readFirmFiles: async (filePath) => (await fs.readFileSync(`${dirFirmFiles}${filePath}`)).toString(),
    readQmkFile: async (kb, filePath) => (await fs.readFileSync(`${dirQMK}/keyboards/${kb}/${filePath}`)).toString(),
    write: async (filePath, obj) => await fs.writeFileSync(filePath, obj),
    writeFirmFiles: async (filePath, obj) => await fs.writeFileSync(`${dirFirmFiles}${filePath}`, obj),
    writeQmkFile: async (kb, filePath, obj) => await fs.writeFileSync(`${dirQMK}/keyboards/${kb}/${filePath}`, obj),
    cpConfigsToQmk: async (kbDir) => {
        await exec(rmKeyboardsL(dirQMK))
        await exec(`cp -rf /root/keyboards/${kbDir} ${dirQMK}/keyboards`)
    },
    cpConfigsToVial: async (kbDir) => {
        await exec(rmKeyboardsL(dirVial))
        await exec(`cp -rf /root/keyboards/${kbDir} ${dirVial}/keyboards`)
    },
    cpDefaultToVail: async (kbDir) => {
        await exec(`mkdir -p ${dirQMK}/keyboards/${kbDir}/keymaps/vial`)
        await exec(`cp -rf ${dirQMK}/keyboards/${kbDir}/keymaps/default/* ${dirQMK}/keyboards/${kbDir}/keymaps/vial`)
    },
    mvQmkConfigsToVolume: async (kbDir) => {
        await exec(`rm -rf /root/keyboards/${kbDir} `)
        await exec(`mv -f ${dirQMK}/keyboards/${kbDir} /root/keyboards`)
    }
}

module.exports.cmd = cmd
module.exports.streamError = streamError
