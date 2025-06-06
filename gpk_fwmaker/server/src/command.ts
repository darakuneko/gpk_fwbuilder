import util from 'util'
import childProcess from 'child_process'
import fs from 'fs'

import { Response } from 'express'

import type { CommandModule, GitCheckoutResult } from './types'

// Command execution result type
interface ExecResult {
    stdout: string;
    stderr: string;
}

const exec = util.promisify(childProcess.exec)

const dirClient: string = '/root/keyboards'
const dirQMK: string = '/root/qmk_firmware'
const dirVial: string = '/root/vial-qmk'
const dirCustomRepo: string = `/root/custom_repository`
const dirFirmFiles: string = '/firmware-scripts/'

const execCd = async (dir: string, line: string): Promise<ExecResult> => await exec(`cd ${dir} && ${line}`)
const execQMK = async (line: string): Promise<ExecResult> => await execCd(dirQMK, line)
const execVial = async (line: string): Promise<ExecResult> => await execCd(dirVial, line)
const execFirmFiles = async (line: string): Promise<ExecResult> => await execCd(dirFirmFiles, line)

const spawn = (line: string): childProcess.ChildProcess => childProcess.spawn(line, {shell: true})

const streamWriteLine = async (dir: string, line: string, res: Response): Promise<void> => {
    await exec(`cd ${dir} && ${line}`)
    res.write(`${line}\n`)
}
const streamWriteLineQMK = async (line: string, res: Response): Promise<void> => await streamWriteLine(dirQMK, line, res)

const findFirmwareL = (dir: string): string => {
    const d = dir.match(/\/$/) ? dir : `${dir}/`
    return `find ${d}* -maxdepth 0 -regex ".*\\.\\(bin\\|hex\\|uf2\\)"`
}

const cpFirmwareL = (dir: string): string => `${findFirmwareL(dir)} -type f -exec bash -c 'cp "$1" "${dirClient}" && chmod 777 "${dirClient}/$(basename "$1")"' _ {} \\;`

const rmL = (path: string): string => `rm -rf ${path}`
const rmKeyboardsL = (path: string, kb: string): string => rmL(`${path}/keyboards/${kb}`)

const mkCustomDir = async (fw: string): Promise<string> => {
    const baseDir = `${dirCustomRepo}/${fw}`
    const result = await exec(`cd ${baseDir} && ls -d */`)
    return `${baseDir}/${result.stdout.split("\n")[0].replace(/\//g, "")}`
}

const tagZeroFill2Int = (str: string): number => {
    const s = str
        .replace(/\.(\d{1})\./, ".0$1.")
        .replace(/\.(\d{2})$/, ".0$1")
        .replace(/\.(\d{1})$/, ".00$1")
        .replace(/\./g, "")
    return parseInt(s)
}

const streamResponse = async (res: Response, fn: () => Promise<void>): Promise<void> => {
    res.writeHead(200, {"Content-Type": "text/event-stream"})
    await fn()
}

const streamLog = (line: string, res: Response): void => {
    const response = spawn(line)
    response.stdout.on('data', (data: Buffer): void => {
        res.write(data.toString())
    })
    response.stderr.on('data', (data: Buffer): void => {
        res.write(data.toString())
    })
    response.on('close', (): void => {
        res.end('')
    })
}

const streamEnd = (res: Response, msg: string): void => {
    res.end(msg)
}

const streamError = (res: Response, e: unknown): void => {
    res.end(e.toString())
}

const buildCustomFW = async (res: Response, dir: string, branch: string, kb: string, km: string): Promise<void> => {
    await exec(`${findFirmwareL(dir)} -delete`)
    const line = `cd ${dir} && { make ${kb}:${km} || true; } && git checkout ${branch} > /dev/null 2>&1 && ${cpFirmwareL(dir)}`
    await streamLog(line, res)
}

const cpCfgToCustom = async (dir: string, kbDir: string): Promise<void> => {
    await exec(rmKeyboardsL(dir, kbDir))
    await exec(`cp -rf ${dirClient}/${kbDir} ${dir}/keyboards`)
}

const checkoutRepo = async (res: Response, dir: string, fw: string, commit: string): Promise<string> => {
    const result = await exec(`cd ${dir} && python3 -m pip install --break-system-packages -r ${dir}/requirements.txt > /dev/null && git symbolic-ref --short HEAD`)
    const branch = result.stdout.replaceAll('\n', '')
    await streamWriteLine(dir, `git fetch origin`, res)
    await streamWriteLine(dir, `git reset --hard ${branch}`, res)
    await streamWriteLine(dir, `git checkout ${commit.length > 0 ? commit : branch}`, res)
    await streamWriteLine(dir, `make git-submodule`, res)
    return branch
}

const cmd: CommandModule = {
    dirClient: dirClient,
    dirQMK: dirQMK,
    dirVial: dirVial,
    dirCustom: async (fw: string): Promise<string> => await mkCustomDir(fw),
    tags: async (): Promise<string[]> => {
        const result = await execQMK(`git ls-remote --tags`)

        return result
            .stdout
            .split('\n')
            .flatMap((v: string): string[] => v.match(/tags\/[0-9].*?[0-9]$/) ? [v.replace(/.*?tags\//g, '')] : [])
            .sort((a: string, b: string): number => tagZeroFill2Int(b) - tagZeroFill2Int(a))
    },
    currentTag: async (): Promise<string> => {
        const result = await execQMK(`git branch`)
        return result.stdout.split('\n').filter((v: string): boolean => Boolean(v.match(/^\* /)))[0].replace(/^\* /, '')
    },
    checkoutQmk: async (res: Response, tag: string): Promise<void> => {
        await streamWriteLineQMK(`git fetch origin`, res)
        await streamWriteLineQMK(`git reset --hard master`, res)
        await streamWriteLineQMK(`git checkout master`, res)
        try {
            await streamWriteLineQMK(`git checkout -b ${tag} refs/tags/${tag}`, res)
        } catch {
            await streamWriteLineQMK(`git branch -D ${tag}`, res)
            await streamWriteLineQMK(`git checkout -b ${tag} refs/tags/${tag}`, res)
        }
        await streamWriteLineQMK(`make git-submodule\n`, res)
    },
    checkoutVial: async (res: Response, repo: string, commit: string): Promise<void> => {
        await checkoutRepo(res, dirVial, repo, commit)
    },
    checkoutCustom: async (res: Response, fw: string, commit: string): Promise<GitCheckoutResult> => {
        const dir = await mkCustomDir(fw)
        const branch = await checkoutRepo(res, dir, fw, commit)
        return {branch: branch, dir: dir}
    },
    copyKeyboard: async (fwDir: string, kbDir: string): Promise<void> => {
        await exec(`cp -rf ${fwDir}/${kbDir} ${dirClient}/`)
        await exec(`chmod 777 -R ${dirClient}`)
    },
    buildQmkFirmware: async (res: Response, kb: string, km: string): Promise<void> => {
        await exec(`${findFirmwareL(dirQMK)} -delete`)
        const line = `qmk compile -kb ${kb} -km ${km} && ${cpFirmwareL(dirQMK)}`
        streamLog(line, res)
    },
    buildVialFirmware: async (res: Response, kb: string, km: string): Promise<void> => await buildCustomFW(res, dirVial, "vial", kb, km),
    buildCustomFirmware: async (res: Response, obj: GitCheckoutResult, kb: string, km: string): Promise<void> => await buildCustomFW(res, obj.dir, obj.branch, kb, km),
    updateRepositoryQmk: async (res: Response): Promise<void> => {
        await exec(rmL(dirQMK))
        const line = "cd /root && qmk setup -y"
        streamLog(line, res)
    },
    updateRepositoryVial: async (res: Response): Promise<void> => {
        await exec(rmL(dirVial))
        const line = `cd /root && git clone https://github.com/vial-kb/vial-qmk.git && cd ${dirVial} && /usr/bin/python3 -m pip install --break-system-packages -r /root/vial-qmk/requirements.txt && make git-submodule`
        streamLog(line, res)
    },
    updateRepositoryCustom: async (res: Response, customDir: string, url: string): Promise<void> => {
        const dir = `${dirCustomRepo}/${customDir}`
        const match = url.match(/\/([^/]+)\.git$/)
        const cloneDir = `${dir}/${match ? match[1] : 'repository'}`
        const line = `rm -rf ${dir} && mkdir ${dir} && cd ${dir} && git clone ${url} && cd ${cloneDir} && /usr/bin/python3 -m pip install --break-system-packages -r ${cloneDir}/requirements.txt && make git-submodule`
        streamLog(line, res)
    },
    deleteRepositoryCustom: async (res: Response, customDir: string): Promise<void> => {
        const dir = `${dirCustomRepo}/${customDir}`
        const line = `rm -rf ${dir}`
        streamLog(line, res)
    },
    generateQmkFile: async (kb: string, kbDir: string, mcu: string, layout: string, user: string): Promise<string> => {
        await exec(rmKeyboardsL(dirQMK, kbDir))
        const result = await exec(`qmk new-keyboard -kb ${kb} -t ${mcu} -l ${layout} -u ${user}`)
        return result.stdout
    },
    generateVialId: async (): Promise<string> => {
        const result = await execVial("python3 util/vial_generate_keyboard_uid.py")
        return result.stdout
    },
    generateFirmFiles: async (jsonPath: string): Promise<void> => {
        await execFirmFiles(`python3 ./run.py ${jsonPath}`)
    },
    readFirmFiles: async (filePath: string): Promise<Buffer> => (await fs.readFileSync(`${dirFirmFiles}${filePath}`)),
    readQmkFile: async (kb: string, filePath: string): Promise<Buffer> => (await fs.readFileSync(`${dirQMK}/keyboards/${kb}/${filePath}`)),
    write: async (filePath: string, obj: string): Promise<void> => await fs.writeFileSync(filePath, obj),
    writeFirmFiles: async (filePath: string, obj: string): Promise<void> => await fs.writeFileSync(`${dirFirmFiles}${filePath}`, obj),
    writeQmkFile: async (kb: string, filePath: string, obj: string): Promise<void> => await fs.writeFileSync(`${dirQMK}/keyboards/${kb}/${filePath}`, obj),
    cpConfigsToQmk: async (kbDir: string): Promise<void> => {
        await exec(rmKeyboardsL(dirQMK, kbDir))
        await exec(`cp -rf ${dirClient}/${kbDir} ${dirQMK}/keyboards`)
        await exec(`chmod 777 -R ${dirQMK}/keyboards`)
    },
    cpConfigsToVial: async (kbDir: string): Promise<void> => await cpCfgToCustom(dirVial, kbDir),
    cpConfigsToCustom: async (dir: string, kbDir: string): Promise<void> => await cpCfgToCustom(dir, kbDir),
    cpDefaultToVail: async (kbDir: string): Promise<void> => {
        await exec(`mkdir -p ${dirQMK}/keyboards/${kbDir}/keymaps/vial`)
        await exec(`cp -rf ${dirQMK}/keyboards/${kbDir}/keymaps/default/* ${dirQMK}/keyboards/${kbDir}/keymaps/vial`)
    },
    mvQmkConfigsToVolume: async (kbDir: string): Promise<void> => {
        await exec(`rm -rf ${dirClient}/${kbDir} `)
        await exec(`mv -f ${dirQMK}/keyboards/${kbDir} ${dirClient}`)
        await exec(`chmod 777 -R ${dirClient}`)
    }
}

export { cmd, streamResponse, streamError, streamEnd }