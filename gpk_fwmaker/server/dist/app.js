"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const command_1 = require("./command");
const vial2c_1 = require("./vial2c/vial2c");
const util_1 = __importDefault(require("util"));
const child_process_1 = __importDefault(require("child_process"));
const multer_1 = __importDefault(require("multer"));
const exec = util_1.default.promisify(child_process_1.default.exec);
const app = (0, express_1.default)();
// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
    const server = app.listen(3000, async () => {
        const address = server.address();
        const port = typeof address === 'string' ? address : address?.port;
        console.log("Node.js is listening to PORT:" + port);
    });
}
const bufferToJson = (buf) => JSON.parse(buf.toString());
const jsonToStr = (obj) => JSON.stringify(obj, null, 2);
const getFWDir = async (fw) => {
    const getDir = async (fw) => {
        if (fw === "qmk")
            return command_1.cmd.dirQMK;
        if (fw === "vial")
            return command_1.cmd.dirVial;
        return await command_1.cmd.dirCustom(fw);
    };
    return `${await getDir(fw)}/keyboards`;
};
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.get('/', (req, res) => {
    res.send('GPK FWMaker!');
});
app.get('/tags/qmk', async (req, res) => {
    const tags = await command_1.cmd.tags();
    res.send(tags);
});
app.get('/update/repository/qmk', async (req, res) => await command_1.cmd.updateRepositoryQmk(res));
app.get('/update/repository/vial', async (req, res) => await command_1.cmd.updateRepositoryVial(res));
app.post('/update/repository/custom', async (req, res) => {
    const fn = async () => {
        try {
            const id = req.body.id;
            const url = req.body.url;
            await command_1.cmd.updateRepositoryCustom(res, id, url);
        }
        catch (e) {
            (0, command_1.streamError)(res, e);
        }
    };
    await (0, command_1.streamResponse)(res, fn);
});
app.post('/build/qmk', async (req, res) => {
    const fn = async () => {
        try {
            const kb = req.body.kb;
            const km = req.body.km;
            const tag = req.body.tag;
            await command_1.cmd.buildQmk(res, kb, km, tag);
        }
        catch (e) {
            (0, command_1.streamError)(res, e);
        }
    };
    await (0, command_1.streamResponse)(res, fn);
});
app.post('/build/vial', async (req, res) => {
    const fn = async () => {
        try {
            const kb = req.body.kb;
            const km = req.body.km;
            const tag = req.body.tag;
            await command_1.cmd.buildVial(res, kb, km, tag);
        }
        catch (e) {
            (0, command_1.streamError)(res, e);
        }
    };
    await (0, command_1.streamResponse)(res, fn);
});
app.post('/build/custom', async (req, res) => {
    const fn = async () => {
        try {
            const id = req.body.id;
            const kb = req.body.kb;
            const km = req.body.km;
            const tag = req.body.tag;
            await command_1.cmd.buildCustom(res, id, kb, km, tag);
        }
        catch (e) {
            (0, command_1.streamError)(res, e);
        }
    };
    await (0, command_1.streamResponse)(res, fn);
});
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
app.post('/generate/qmk/file', upload.fields([
    { name: 'info', maxCount: 1 },
    { name: 'keymap', maxCount: 1 }
]), async (req, res) => {
    const fn = async () => {
        try {
            const files = req.files;
            const infoFile = files['info']?.[0];
            const keymapFile = files['keymap']?.[0];
            if (!infoFile || !keymapFile) {
                throw new Error('Required files not provided');
            }
            const info = bufferToJson(fs_1.default.readFileSync(infoFile.path));
            const keymap = bufferToJson(fs_1.default.readFileSync(keymapFile.path));
            const keyboard = req.body.keyboard;
            await command_1.cmd.generateQmk(res, keyboard, info, keymap);
        }
        catch (e) {
            (0, command_1.streamError)(res, e);
        }
    };
    await (0, command_1.streamResponse)(res, fn);
});
app.post('/convert/kle/qmk', async (req, res) => {
    const fn = async () => {
        try {
            const layout = req.body.layout;
            const keyboard = req.body.keyboard;
            const mcu = req.body.mcu;
            const bootloader = req.body.bootloader;
            await command_1.cmd.convertKleQmk(res, layout, keyboard, mcu, bootloader);
        }
        catch (e) {
            (0, command_1.streamError)(res, e);
        }
    };
    await (0, command_1.streamResponse)(res, fn);
});
app.post('/convert/kle/vial', async (req, res) => {
    const fn = async () => {
        try {
            const layout = req.body.layout;
            const keyboard = req.body.keyboard;
            const mcu = req.body.mcu;
            const bootloader = req.body.bootloader;
            await command_1.cmd.convertKleVial(res, layout, keyboard, mcu, bootloader);
        }
        catch (e) {
            (0, command_1.streamError)(res, e);
        }
    };
    await (0, command_1.streamResponse)(res, fn);
});
app.post('/convert/via/json', upload.fields([
    { name: 'info', maxCount: 1 },
    { name: 'layout', maxCount: 1 }
]), async (req, res) => {
    const fn = async () => {
        try {
            const files = req.files;
            const infoFile = files['info']?.[0];
            const layoutFile = files['layout']?.[0];
            if (!infoFile || !layoutFile) {
                throw new Error('Required files not provided');
            }
            const info = bufferToJson(fs_1.default.readFileSync(infoFile.path));
            const layout = bufferToJson(fs_1.default.readFileSync(layoutFile.path));
            await command_1.cmd.convertViaJson(res, info, layout);
        }
        catch (e) {
            (0, command_1.streamError)(res, e);
        }
    };
    await (0, command_1.streamResponse)(res, fn);
});
app.post('/convert/vial/json', upload.single('vial'), async (req, res) => {
    const fn = async () => {
        try {
            if (!req.file) {
                throw new Error('Vial file not provided');
            }
            const vial = bufferToJson(fs_1.default.readFileSync(req.file.path));
            const result = (0, vial2c_1.vial2c)(vial);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(result);
        }
        catch (e) {
            (0, command_1.streamError)(res, e);
        }
    };
    await (0, command_1.streamResponse)(res, fn);
});
app.get('/list/:fw', async (req, res) => {
    try {
        const fw = req.params.fw;
        const fwDir = await getFWDir(fw);
        if (!fs_1.default.existsSync(fwDir)) {
            res.status(404).send('Firmware directory not found');
            return;
        }
        const keyboards = fs_1.default.readdirSync(fwDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        res.json(keyboards);
    }
    catch (e) {
        res.status(500).send(String(e));
    }
});
app.get('/list/:fw/:kb', async (req, res) => {
    try {
        const fw = req.params.fw;
        const kb = req.params.kb;
        const kbDir = `${await getFWDir(fw)}/${kb}/keymaps`;
        if (!fs_1.default.existsSync(kbDir)) {
            res.status(404).send('Keyboard directory not found');
            return;
        }
        const keymaps = fs_1.default.readdirSync(kbDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        res.json(keymaps);
    }
    catch (e) {
        res.status(500).send(String(e));
    }
});
exports.default = app;
//# sourceMappingURL=app.js.map