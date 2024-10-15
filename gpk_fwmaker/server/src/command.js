const util = require('util')
const childProcess = require('child_process')
const exec = util.promisify(childProcess.exec)
const fs = require('fs');

const dirClient = '/root/keyboards'
const dirQMK = '/root/qmk_firmware'
const dirVial = '/root/vial-qmk'
const dirCustomRepo = `/root/custom_repository`
const dirFirmFiles = '/firmware-scripts/'

const execCd = async (dir, line) => await exec(`cd ${dir} && ${line}`)
const execQMK = async (line) => await execCd(dirQMK, line)
const execVial = async (line) => await execCd(dirVial, line)
const execFirmFiles = async (line) => await execCd(dirFirmFiles, line)

const spawn = (line) => childProcess.spawn(line, {shell: true})

const streamWriteLine = async (dir, line, res) => {
    await exec(`cd ${dir} && ${line}`)
    res.write(`${line}\n`)
}
const streamWriteLineQMK = async (line, res) => await streamWriteLine(dirQMK, line, res)
const streamWriteLineVial = async (line, res) => await streamWriteLine(dirVial, line, res)

const findFirmwareL = (dir) => {
    const d = dir.match(/\/$/) ? dir : `${dir}/`
    return `find ${d}* -maxdepth 0 -regex ".*\\.\\(bin\\|hex\\|uf2\\)"`
}
const cpFirmwareL = (dir) => `${findFirmwareL(dir)} -type f -exec cp {} ${dirClient} \\;`

const rmL = (path) => `rm -rf ${path}`
const rmKeyboardsL = (path, kb) => rmL(`${path}/keyboards/${kb}`)

const mkCustomDir = async (fw) => {
    const baseDir = `${dirCustomRepo}/${fw}`
    const result = await exec(`cd ${baseDir} && ls -d */`)
    return `${baseDir}/${result.stdout.split("\n")[0].replace(/\//g, "")}`
}

const tagZeroFill2Int = (str) => {
    const s = str
        .replace(/\.(\d{1})\./, ".0$1.")
        .replace(/\.(\d{2})$/, ".0$1")
        .replace(/\.(\d{1})$/, ".00$1")
        .replace(/\./g, "")
    return parseInt(s)
}

const streamResponse = async (res, fn) => {
    res.writeHead(200, {"Content-Type": "text/event-stream"})
    await fn()
}

const streamLog = (line, res) => {
    const response = spawn(line)
    response.stdout.on('data', (data) => res.write(data.toString()))
    response.stderr.on('data', (data) => res.write(data.toString()))
    response.on('close', () => res.end(''))
}

const streamEnd = (res, msg) => {
    res.end(msg)
}

const streamError = (res, e) => {
    res.end(e.toString())
}

const buildCustomFW = async (res, dir, branch, kb, km) => {
    await exec(`${findFirmwareL(dir)} -delete`)
    const line = `cd ${dir} && { make ${kb}:${km} || true; } && git checkout ${branch} > /dev/null 2>&1 && ${cpFirmwareL(dir)}`
    await streamLog(line, res)
}

const cpCfgToCustom = async (dir, kbDir) => {
    await exec(rmKeyboardsL(dir, kbDir))
    await exec(`cp -rf ${dirClient}/${kbDir} ${dir}/keyboards`)
}

const checkoutRepo = async (res, dir, fw, commit) => {
    const result = await exec(`cd ${dir} && git symbolic-ref --short HEAD`)
    const branch = result.stdout.replaceAll('\n', '')
    await streamWriteLine(dir, `git fetch origin`, res)
    await streamWriteLine(dir, `git reset --hard ${branch}`, res)
    await streamWriteLine(dir, `git checkout ${commit.length > 0 ? commit : branch}`, res)
    await streamWriteLine(dir, `make git-submodule`, res)
    return branch
}

const cmd = {
    dirClient: dirClient,
    dirQMK: dirQMK,
    dirVial: dirVial,
    dirCustom: async (fw) => await mkCustomDir(fw),
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
        await streamWriteLineQMK(`git fetch origin`, res)
        await streamWriteLineQMK(`git reset --hard master`, res)
        await streamWriteLineQMK(`git checkout master`, res)
        try {
            await streamWriteLineQMK(`git checkout -b ${tag} refs/tags/${tag}`, res)
        } catch (e) {
            await streamWriteLineQMK(`git branch -D ${tag}`, res)
            await streamWriteLineQMK(`git checkout -b ${tag} refs/tags/${tag}`, res)
        }
        await streamWriteLineQMK(`make git-submodule\n`, res)
    },
    checkoutVial: async (res, repo, commit) => await checkoutRepo(res, dirVial, repo, commit),
    checkoutCustom: async (res, fw, commit) => {
        const dir = await mkCustomDir(fw)
        const branch = await checkoutRepo(res, dir, fw, commit)
        return {branch: branch, dir: dir}
    },
    copyKeyboard: async (fwDir, kbDir) => {
        await exec(`cp -rf ${fwDir}/${kbDir} ${dirClient}/`)
    },
    buildQmkFirmware: async (res, kb, km) => {
        await exec(`${findFirmwareL(dirQMK)} -delete`)
        const line = `qmk compile -kb ${kb} -km ${km} && ${cpFirmwareL(dirQMK)}`
        streamLog(line, res)
    },
    buildVialFirmware: async (res, kb, km) => await buildCustomFW(res, dirVial, "vial", kb, km),
    buildCustomFirmware: async (res, obj, kb, km) => await buildCustomFW(res, obj.dir, obj.branch, kb, km),
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
    updateRepositoryCustom: async (res, customDir, url) => {
        const dir = `${dirCustomRepo}/${customDir}`
        const cloneDir = `${dir}/${url.match(/\/([^/]+)\.git$/)[1]}`
        const line = `rm -rf ${dir} && mkdir ${dir} && cd ${dir} && git clone ${url} && cd ${cloneDir} && make git-submodule`
        streamLog(line, res)
    },
    deleteRepositoryCustom: async (res, customDir) => {
        const dir = `${dirCustomRepo}/${customDir}`
        const line = `rm -rf ${dir}`
        streamLog(line, res)
    },
    generateQmkFile: async (kb, kbDir, mcu, layout, user) => {
        await exec(rmKeyboardsL(dirQMK, kbDir))
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
        await exec(rmKeyboardsL(dirQMK, kbDir))
        await exec(`cp -rf ${dirClient}/${kbDir} ${dirQMK}/keyboards`)
    },
    cpConfigsToVial: async (kbDir) => await cpCfgToCustom(dirVial, kbDir),
    cpConfigsToCustom: async (dir, kbDir) => await cpCfgToCustom(dir, kbDir),
    cpDefaultToVail: async (kbDir) => {
        await exec(`mkdir -p ${dirQMK}/keyboards/${kbDir}/keymaps/vial`)
        await exec(`cp -rf ${dirQMK}/keyboards/${kbDir}/keymaps/default/* ${dirQMK}/keyboards/${kbDir}/keymaps/vial`)
    },
    mvQmkConfigsToVolume: async (kbDir) => {
        await exec(`rm -rf ${dirClient}/${kbDir} `)
        await exec(`mv -f ${dirQMK}/keyboards/${kbDir} ${dirClient}`)
    }
}

module.exports.cmd = cmd
module.exports.streamResponse = streamResponse
module.exports.streamError = streamError
module.exports.streamEnd = streamEnd