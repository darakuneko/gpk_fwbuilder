"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamEnd = exports.streamError = exports.streamResponse = exports.cmd = void 0;
const util_1 = __importDefault(require("util"));
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const exec = util_1.default.promisify(child_process_1.default.exec);
const dirClient = '/root/keyboards';
const dirQMK = '/root/qmk_firmware';
const dirVial = '/root/vial-qmk';
const dirCustomRepo = '/root/custom_repository';
const dirFirmFiles = '/firmware-scripts/';
const execCd = async (dir, line) => await exec(`cd ${dir} && ${line}`);
const execQMK = async (line) => await execCd(dirQMK, line);
const execVial = async (line) => await execCd(dirVial, line);
const execFirmFiles = async (line) => await execCd(dirFirmFiles, line);
const spawn = (line) => child_process_1.default.spawn(line, { shell: true });
const streamWriteLine = async (dir, line, res) => {
    await exec(`cd ${dir} && ${line}`);
    res.write(`${line}\n`);
};
const streamWriteLineQMK = async (line, res) => await streamWriteLine(dirQMK, line, res);
const findFirmwareL = (dir) => {
    const d = dir.match(/\/$/) ? dir : `${dir}/`;
    return `find ${d}* -maxdepth 0 -regex ".*\\.\\(bin\\|hex\\|uf2\\)"`;
};
const cpFirmwareL = (dir) => `${findFirmwareL(dir)} -type f -exec bash -c 'cp "$1" "${dirClient}" && chmod 777 "${dirClient}/$(basename "$1")"' _ {} \\;`;
const rmL = (path) => `rm -rf ${path}`;
const rmKeyboardsL = (path, kb) => rmL(`${path}/keyboards/${kb}`);
const mkCustomDir = async (fw) => {
    const baseDir = `${dirCustomRepo}/${fw}`;
    const result = await exec(`cd ${baseDir} && ls -d */`);
    return `${baseDir}/${result.stdout.split("\n")[0].replace(/\//g, "")}`;
};
const tagZeroFill2Int = (str) => {
    const s = str
        .replace(/\.(\d{1})\./, ".0$1.")
        .replace(/\.(\d{2})$/, ".0$1")
        .replace(/\.(\d{1})$/, ".00$1")
        .replace(/\./g, "");
    return parseInt(s);
};
const streamResponse = async (res, fn) => {
    res.writeHead(200, { "Content-Type": "text/event-stream" });
    await fn();
};
exports.streamResponse = streamResponse;
const streamLog = (line, res) => {
    const response = spawn(line);
    response.stdout?.on('data', (data) => res.write(data.toString()));
    response.stderr?.on('data', (data) => res.write(data.toString()));
    response.on('close', () => res.end(''));
};
const streamEnd = (res, msg) => {
    res.end(msg);
};
exports.streamEnd = streamEnd;
const streamError = (res, e) => {
    res.end(e.toString());
};
exports.streamError = streamError;
const buildCustomFW = async (res, dir, branch, kb, km) => {
    await exec(`${findFirmwareL(dir)} -delete`);
    const line = `cd ${dir} && { make ${kb}:${km} || true; } && git checkout ${branch} > /dev/null 2>&1 && ${cpFirmwareL(dir)}`;
    await streamLog(line, res);
};
const cpCfgToCustom = async (dir, kbDir) => {
    await exec(rmKeyboardsL(dir, kbDir));
    await exec(`cp -rf ${dirClient}/${kbDir} ${dir}/keyboards`);
};
const checkoutRepo = async (res, dir, fw, commit) => {
    const result = await exec(`cd ${dir} && python3 -m pip install --break-system-packages -r ${dir}/requirements.txt > /dev/null && git symbolic-ref --short HEAD`);
    const branch = result.stdout.replace(/\n/g, '');
    await streamWriteLine(dir, `git fetch origin`, res);
    await streamWriteLine(dir, `git reset --hard ${branch}`, res);
    await streamWriteLine(dir, `git checkout ${commit.length > 0 ? commit : branch}`, res);
    await streamWriteLine(dir, `make git-submodule`, res);
    return branch;
};
const cmd = {
    dirClient: dirClient,
    dirQMK: dirQMK,
    dirVial: dirVial,
    dirCustom: async (fw) => await mkCustomDir(fw),
    tags: async () => {
        const result = await execQMK(`git ls-remote --tags`);
        return result
            .stdout
            .split('\n')
            .flatMap(v => v.match(/tags\/[0-9].*?[0-9]$/) ? v.replace(/.*?tags\//g, '') : [])
            .sort((a, b) => tagZeroFill2Int(b) - tagZeroFill2Int(a));
    },
    currentTag: async () => {
        const result = await execQMK(`git branch`);
        return result.stdout.split('\n').filter(v => v.match(/^\* /))[0].replace(/^\* /, '');
    },
    checkoutQmk: async (res, tag) => {
        await streamWriteLineQMK(`git fetch origin`, res);
        await streamWriteLineQMK(`git reset --hard master`, res);
        await streamWriteLineQMK(`git checkout master`, res);
        try {
            await streamWriteLineQMK(`git checkout -b ${tag} refs/tags/${tag}`, res);
        }
        catch (e) {
            await streamWriteLineQMK(`git branch -D ${tag}`, res);
            await streamWriteLineQMK(`git checkout -b ${tag} refs/tags/${tag}`, res);
        }
        await streamWriteLineQMK(`make git-submodule\n`, res);
    },
    checkoutVial: async (res, repo, commit) => await checkoutRepo(res, dirVial, repo, commit),
    checkoutCustom: async (res, fw, commit) => {
        const dir = await mkCustomDir(fw);
        const branch = await checkoutRepo(res, dir, fw, commit);
        return { branch: branch, dir: dir };
    },
    copyKeyboard: async (fwDir, kbDir) => {
        await exec(`cp -rf ${fwDir}/${kbDir} ${dirClient}/`);
        await exec(`chmod 777 -R ${dirClient}`);
    },
    buildQmkFirmware: async (res, kb, km) => {
        await exec(`${findFirmwareL(dirQMK)} -delete`);
        const line = `qmk compile -kb ${kb} -km ${km} && ${cpFirmwareL(dirQMK)}`;
        streamLog(line, res);
    },
    buildVialFirmware: async (res, kb, km) => await buildCustomFW(res, dirVial, "vial", kb, km),
    buildCustomFirmware: async (res, obj, kb, km) => await buildCustomFW(res, obj.dir, obj.branch, kb, km),
    updateRepositoryQmk: async (res) => {
        await exec(rmL(dirQMK));
        const line = "cd /root && qmk setup -y";
        streamLog(line, res);
    },
    updateRepositoryVial: async (res) => {
        await exec(rmL(dirVial));
        const line = `cd /root && git clone https://github.com/vial-kb/vial-qmk.git && cd ${dirVial} && /usr/bin/python3 -m pip install --break-system-packages -r /root/vial-qmk/requirements.txt && make git-submodule`;
        streamLog(line, res);
    },
    updateRepositoryCustom: async (res, customDir, url) => {
        const dir = `${dirCustomRepo}/${customDir}`;
        const match = url.match(/\/([^/]+)\.git$/);
        if (!match)
            throw new Error('Invalid git URL format');
        const cloneDir = `${dir}/${match[1]}`;
        const line = `rm -rf ${dir} && mkdir ${dir} && cd ${dir} && git clone ${url} && cd ${cloneDir} && /usr/bin/python3 -m pip install --break-system-packages -r ${cloneDir}/requirements.txt && make git-submodule`;
        streamLog(line, res);
    },
    deleteRepositoryCustom: async (res, customDir) => {
        const dir = `${dirCustomRepo}/${customDir}`;
        const line = `rm -rf ${dir}`;
        streamLog(line, res);
    },
    generateQmkFile: async (kb, kbDir, mcu, layout, user) => {
        await exec(rmKeyboardsL(dirQMK, kbDir));
        const result = await exec(`qmk new-keyboard -kb ${kb} -t ${mcu} -l ${layout} -u ${user}`);
        return result;
    },
    generateVialId: async () => {
        const result = await execVial("python3 util/vial_generate_keyboard_uid.py");
        return result.stdout;
    },
    generateFirmFiles: async (jsonPath) => {
        await execFirmFiles(`python3 ./run.py ${jsonPath}`);
    },
    readFirmFiles: async (filePath) => (await fs_1.default.readFileSync(`${dirFirmFiles}${filePath}`)).toString(),
    readQmkFile: async (kb, filePath) => (await fs_1.default.readFileSync(`${dirQMK}/keyboards/${kb}/${filePath}`)).toString(),
    write: async (filePath, obj) => await fs_1.default.writeFileSync(filePath, obj),
    writeFirmFiles: async (filePath, obj) => await fs_1.default.writeFileSync(`${dirFirmFiles}${filePath}`, obj),
    writeQmkFile: async (kb, filePath, obj) => await fs_1.default.writeFileSync(`${dirQMK}/keyboards/${kb}/${filePath}`, obj),
    cpConfigsToQmk: async (kbDir) => {
        await exec(rmKeyboardsL(dirQMK, kbDir));
        await exec(`cp -rf ${dirClient}/${kbDir} ${dirQMK}/keyboards`);
        await exec(`chmod 777 -R ${dirQMK}/keyboards`);
    },
    cpConfigsToVial: async (kbDir) => await cpCfgToCustom(dirVial, kbDir),
    cpConfigsToCustom: async (dir, kbDir) => await cpCfgToCustom(dir, kbDir),
    cpDefaultToVail: async (kbDir) => {
        await exec(`mkdir -p ${dirQMK}/keyboards/${kbDir}/keymaps/vial`);
        await exec(`cp -rf ${dirQMK}/keyboards/${kbDir}/keymaps/default/* ${dirQMK}/keyboards/${kbDir}/keymaps/vial`);
    },
    mvQmkConfigsToVolume: async (kbDir) => {
        await exec(`rm -rf ${dirClient}/${kbDir} `);
        await exec(`mv -f ${dirQMK}/keyboards/${kbDir} ${dirClient}`);
        await exec(`chmod 777 -R ${dirClient}`);
    },
    // Additional methods referenced in app.js but missing from original command.js
    buildQmk: async (res, kb, km, tag) => {
        await cmd.checkoutQmk(res, tag);
        await cmd.buildQmkFirmware(res, kb, km);
    },
    buildVial: async (res, kb, km, tag) => {
        await cmd.checkoutVial(res, 'vial', tag);
        await cmd.buildVialFirmware(res, kb, km);
    },
    buildCustom: async (res, id, kb, km, tag) => {
        const obj = await cmd.checkoutCustom(res, id, tag);
        await cmd.buildCustomFirmware(res, obj, kb, km);
    },
    generateQmk: async (res, keyboard, info, keymap) => {
        // Implementation for QMK generation
        streamError(res, new Error('generateQmk not implemented'));
    },
    convertKleQmk: async (res, layout, keyboard, mcu, bootloader) => {
        // Implementation for KLE to QMK conversion
        streamError(res, new Error('convertKleQmk not implemented'));
    },
    convertKleVial: async (res, layout, keyboard, mcu, bootloader) => {
        // Implementation for KLE to Vial conversion
        streamError(res, new Error('convertKleVial not implemented'));
    },
    convertViaJson: async (res, info, layout) => {
        // Implementation for Via JSON conversion
        streamError(res, new Error('convertViaJson not implemented'));
    }
};
exports.cmd = cmd;
//# sourceMappingURL=command.js.map