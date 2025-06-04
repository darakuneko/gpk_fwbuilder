import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { cmd, streamResponse, streamError } from './command';
import { vial2c } from './vial2c/vial2c';
import util from 'util';
import childProcess from 'child_process';
import multer from 'multer';

const exec = util.promisify(childProcess.exec);

const app = express();

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
    const server = app.listen(3000, async () => {
        const address = server.address();
        const port = typeof address === 'string' ? address : address?.port;
        console.log("Node.js is listening to PORT:" + port);
    });
}

const bufferToJson = (buf: Buffer): any => JSON.parse(buf.toString());

const jsonToStr = (obj: any): string => JSON.stringify(obj, null, 2);

const getFWDir = async (fw: string): Promise<string> => {
    const getDir = async (fw: string): Promise<string> => {
        if (fw === "qmk") return cmd.dirQMK;
        if (fw === "vial") return cmd.dirVial;
        return await cmd.dirCustom(fw);
    };
    return `${await getDir(fw)}/keyboards`;
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
    res.send('GPK FWMaker!');
});

app.get('/tags/qmk', async (req: Request, res: Response) => {
    const tags = await cmd.tags();
    res.send(tags);
});

app.get('/update/repository/qmk', async (req: Request, res: Response) => await cmd.updateRepositoryQmk(res));

app.get('/update/repository/vial', async (req: Request, res: Response) => await cmd.updateRepositoryVial(res));

app.post('/update/repository/custom', async (req: Request, res: Response) => {
    const fn = async (): Promise<void> => {
        try {
            const id: string = req.body.id;
            const url: string = req.body.url;
            await cmd.updateRepositoryCustom(res, id, url);
        } catch (e) {
            streamError(res, e);
        }
    };
    await streamResponse(res, fn);
});

app.post('/build/qmk', async (req: Request, res: Response) => {
    const fn = async (): Promise<void> => {
        try {
            const kb: string = req.body.kb;
            const km: string = req.body.km;
            const tag: string = req.body.tag;
            await cmd.buildQmk(res, kb, km, tag);
        } catch (e) {
            streamError(res, e);
        }
    };
    await streamResponse(res, fn);
});

app.post('/build/vial', async (req: Request, res: Response) => {
    const fn = async (): Promise<void> => {
        try {
            const kb: string = req.body.kb;
            const km: string = req.body.km;
            const tag: string = req.body.tag;
            await cmd.buildVial(res, kb, km, tag);
        } catch (e) {
            streamError(res, e);
        }
    };
    await streamResponse(res, fn);
});

app.post('/build/custom', async (req: Request, res: Response) => {
    const fn = async (): Promise<void> => {
        try {
            const id: string = req.body.id;
            const kb: string = req.body.kb;
            const km: string = req.body.km;
            const tag: string = req.body.tag;
            await cmd.buildCustom(res, id, kb, km, tag);
        } catch (e) {
            streamError(res, e);
        }
    };
    await streamResponse(res, fn);
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

app.post('/generate/qmk/file', upload.fields([
    { name: 'info', maxCount: 1 },
    { name: 'keymap', maxCount: 1 }
]), async (req: Request, res: Response) => {
    const fn = async (): Promise<void> => {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const infoFile = files['info']?.[0];
            const keymapFile = files['keymap']?.[0];
            
            if (!infoFile || !keymapFile) {
                throw new Error('Required files not provided');
            }

            const info = bufferToJson(fs.readFileSync(infoFile.path));
            const keymap = bufferToJson(fs.readFileSync(keymapFile.path));
            const keyboard = req.body.keyboard;
            
            await cmd.generateQmk(res, keyboard, info, keymap);
        } catch (e) {
            streamError(res, e);
        }
    };
    await streamResponse(res, fn);
});

app.post('/convert/kle/qmk', async (req: Request, res: Response) => {
    const fn = async (): Promise<void> => {
        try {
            const layout: any = req.body.layout;
            const keyboard: string = req.body.keyboard;
            const mcu: string = req.body.mcu;
            const bootloader: string = req.body.bootloader;
            
            await cmd.convertKleQmk(res, layout, keyboard, mcu, bootloader);
        } catch (e) {
            streamError(res, e);
        }
    };
    await streamResponse(res, fn);
});

app.post('/convert/kle/vial', async (req: Request, res: Response) => {
    const fn = async (): Promise<void> => {
        try {
            const layout: any = req.body.layout;
            const keyboard: string = req.body.keyboard;
            const mcu: string = req.body.mcu;
            const bootloader: string = req.body.bootloader;
            
            await cmd.convertKleVial(res, layout, keyboard, mcu, bootloader);
        } catch (e) {
            streamError(res, e);
        }
    };
    await streamResponse(res, fn);
});

app.post('/convert/via/json', upload.fields([
    { name: 'info', maxCount: 1 },
    { name: 'layout', maxCount: 1 }
]), async (req: Request, res: Response) => {
    const fn = async (): Promise<void> => {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const infoFile = files['info']?.[0];
            const layoutFile = files['layout']?.[0];
            
            if (!infoFile || !layoutFile) {
                throw new Error('Required files not provided');
            }

            const info = bufferToJson(fs.readFileSync(infoFile.path));
            const layout = bufferToJson(fs.readFileSync(layoutFile.path));
            
            await cmd.convertViaJson(res, info, layout);
        } catch (e) {
            streamError(res, e);
        }
    };
    await streamResponse(res, fn);
});

app.post('/convert/vial/json', upload.single('vial'), async (req: Request, res: Response) => {
    const fn = async (): Promise<void> => {
        try {
            if (!req.file) {
                throw new Error('Vial file not provided');
            }

            const vial = bufferToJson(fs.readFileSync(req.file.path));
            const result = vial2c(vial);
            
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(result);
        } catch (e) {
            streamError(res, e);
        }
    };
    await streamResponse(res, fn);
});

app.get('/list/:fw', async (req: Request, res: Response) => {
    try {
        const fw: string = req.params.fw;
        const fwDir = await getFWDir(fw);
        
        if (!fs.existsSync(fwDir)) {
            res.status(404).send('Firmware directory not found');
            return;
        }

        const keyboards = fs.readdirSync(fwDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
            
        res.json(keyboards);
    } catch (e) {
        res.status(500).send(String(e));
    }
});

app.get('/list/:fw/:kb', async (req: Request, res: Response) => {
    try {
        const fw: string = req.params.fw;
        const kb: string = req.params.kb;
        const kbDir = `${await getFWDir(fw)}/${kb}/keymaps`;
        
        if (!fs.existsSync(kbDir)) {
            res.status(404).send('Keyboard directory not found');
            return;
        }

        const keymaps = fs.readdirSync(kbDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
            
        res.json(keymaps);
    } catch (e) {
        res.status(500).send(String(e));
    }
});

export default app;