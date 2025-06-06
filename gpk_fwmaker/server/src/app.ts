import childProcess from 'child_process'
import fs from 'fs'
import path from 'path'
import util from 'util'

import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import multer from 'multer'

import {cmd, streamResponse, streamError} from './command'
import {vial2c} from './vial2c/vial2c'
import type { 
    QMKBuildRequest, 
    VialBuildRequest, 
    CustomBuildRequest,
    UpdateRepositoryRequest,
    DeleteRepositoryRequest,
    CheckoutRequest,
    ListKeyboardsRequest,
    CopyKeyboardRequest,
    GenerateQMKFileRequest,
    ConvertKleQmkParams,
    KeyboardInfo
} from './types'

const exec = util.promisify(childProcess.exec)

const app = express()

const server = app.listen(3000, async (): Promise<void> => {
    const addr = server.address()
    const port = typeof addr === 'string' ? addr : addr?.port
    // eslint-disable-next-line no-console
    console.log("Node.js is listening to PORT:" + port)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bufferToJson = (buf: any): any => JSON.parse(buf.toString())

const jsonToStr = (obj: unknown): string => JSON.stringify(obj, null, 2)

const getFWDir = async (fw: string): Promise<string> => {
    const getDir = async (fw: string): Promise<string> => {
        if (fw === "qmk") return cmd.dirQMK
        if (fw === "vial") return cmd.dirVial
        return await cmd.dirCustom(fw)
    }
    return `${await getDir(fw)}/keyboards`
}

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get('/', async (req: Request, res: Response): Promise<void> => {
    res.send('GPK FWMaker!')
})

app.get('/tags/qmk', async (req: Request, res: Response): Promise<void> => {
    const tags = await cmd.tags()
    res.send(tags)
})

app.get('/update/repository/qmk', async (req: Request, res: Response): Promise<void> => await cmd.updateRepositoryQmk(res))

app.get('/update/repository/vial', async (req: Request, res: Response): Promise<void> => await cmd.updateRepositoryVial(res))

app.post('/update/repository/custom', async (req: Request<unknown, unknown, UpdateRepositoryRequest>, res: Response): Promise<void> => {
    const fn = async (): Promise<void> => {
        try {
            const id = req.body.id
            const url = req.body.url
            await cmd.updateRepositoryCustom(res, id, url)
        } catch (e) {
            streamError(res, e)
        }
    }
    await streamResponse(res, fn)
})

app.post('/delete/repository/custom', async (req: Request<unknown, unknown, DeleteRepositoryRequest>, res: Response): Promise<void> => {
    const fn = async (): Promise<void> => {
        try {
            const id = req.body.id
            await cmd.deleteRepositoryCustom(res, id)
        } catch (e) {
            streamError(res, e)
        }
    }
    await streamResponse(res, fn)
})

app.get('/update/repository/qmk', async (req: Request, res: Response): Promise<void> => await cmd.updateRepositoryQmk(res))

app.get('/update/repository/vial', async (req: Request, res: Response): Promise<void> => await cmd.updateRepositoryVial(res))

app.post('/build/qmk', async (req: Request<unknown, unknown, QMKBuildRequest>, res: Response): Promise<void> => {
    const fn = async (): Promise<void> => {
        try {
            const kb = req.body.kb
            const kbDir = kb.replace(/\/.*/g, "")
            const km = req.body.km.replace(/:.*|flash/g, "")
            const tag = req.body.tag
            const currentTag = await cmd.currentTag()
            if (tag !== currentTag) await cmd.checkoutQmk(res, tag)
            const useRepo = req.body?.useRepo
            if (!useRepo) await cmd.cpConfigsToQmk(kbDir)
            await cmd.buildQmkFirmware(res, kb, km)
        } catch (e) {
            streamError(res, e)
        }
    }
    await streamResponse(res, fn)
})

app.post('/build/vial', async (req: Request<unknown, unknown, VialBuildRequest>, res: Response): Promise<void> => {
    const fn = async (): Promise<void> => {
        try {
            const repo = 'vial'
            const kb = req.body.kb
            const kbDir = kb.replace(/\/.*/g, "")
            const km = req.body.km.replace(/:.*|flash/g, "")
            const commit = "commit" in req.body && req.body.commit.length > 0 ? req.body.commit : repo
            await cmd.checkoutVial(res, repo, commit)
            const useRepo = req.body?.useRepo
            if (!useRepo) await cmd.cpConfigsToVial(kbDir)
            await cmd.buildVialFirmware(res, kb, km)
        } catch (e) {
            streamError(res, e)
        }
    }

    await streamResponse(res, fn)
})

app.post('/build/custom', async (req: Request<unknown, unknown, CustomBuildRequest>, res: Response): Promise<void> => {
    const fn = async (): Promise<void> => {
        try {
            const fw = req.body.fw
            const kb = req.body.kb
            const kbDir = kb.replace(/\/.*/g, "")
            const km = req.body.km.replace(/:.*|flash/g, "")
            const commit = req.body.commit
            const obj = await cmd.checkoutCustom(res, fw, commit)
            const useRepo = req.body?.useRepo
            if (!useRepo) await cmd.cpConfigsToCustom(obj.dir, kbDir)
            await cmd.buildCustomFirmware(res, obj, kb, km)
        } catch (e) {
            streamError(res, e)
        }
    }

    await streamResponse(res, fn)
})


app.post('/checkout', async (req: Request<unknown, unknown, CheckoutRequest>, res: Response): Promise<void> => {
    const fn = async (): Promise<void> => {
        try {
            const fw = req.body.fw
            if (fw === "qmk") {
                const tag = req.body.tag
                await cmd.checkoutQmk(res, tag)
            } else if (fw === "vial") {
                const repo = 'vial'
                const commit = "commit" in req.body && req.body.commit.length > 0 ? req.body.commit : repo
                await cmd.checkoutVial(res, repo, commit)
            } else {
                const commit = req.body.commit
                await cmd.checkoutCustom(res, fw, commit)
            }
            res.end('finish')
        } catch (e) {
            streamError(res, e)
        }
    }

    await streamResponse(res, fn)
})

app.post('/list/keyboards', async (req: Request<unknown, unknown, ListKeyboardsRequest>, res: Response): Promise<void> => {
    const d: string[] = []
    const searchFiles = (dirPath: string): void => {
        const allDirs = fs.readdirSync(dirPath, {withFileTypes: true})
        const f = []
        allDirs.map((v): void => {
            if (v.isDirectory()) {
                const fp = path.join(dirPath, v.name)
                f.push(searchFiles(fp))
                if (fp.match(/\/keymaps\//)) d.push(fp)
            }
        })
    }

    try {
        const fwDir = await getFWDir(req.body.fw)
        searchFiles(fwDir)
        const keymapsDirs = d.flat().map((v): string[] => v.replace(fwDir, '').split("/keymaps/"))
        const kb = Array.from(new Set(keymapsDirs.map((v): string => v[0])))
        const obj: KeyboardInfo[] = kb.map((k): KeyboardInfo => {
            return {
                kb: k.replace(/\\/g, '/').replace(/^\//, '').replace(/.*\/keyboards\//, ''),
                km: keymapsDirs.filter((v): boolean => v[0] === k).map((v): string => v[1])
            }
        })
        res.send(obj)
        res.on('close', (): void => {
            res.end('finish')
        })
    } catch (e) {
        res.send(e)
    }
})

app.post('/copy/keyboard', async (req: Request<unknown, unknown, CopyKeyboardRequest>, res: Response): Promise<void> => {
    try {
        const fwDir = await getFWDir(req.body.fw)
        const kb = req.body.kb
        const kbL = kb.toLowerCase().replace(/-| /g, "_")
        const kbDir = kbL.replace(/\/.*/g, "")
        await cmd.copyKeyboard(fwDir, kbDir)
        res.send("finish")
    } catch (e) {
        res.send(e)
    }
})

app.post('/generate/qmk/file', async (req: Request<unknown, unknown, GenerateQMKFileRequest>, res: Response): Promise<void> => {
    try {
        const kb = req.body.kb
        const kbL = kb.toLowerCase().replace(/-| /g, "_")
        const kbDir = kbL.replace(/\/.*/g, "")
        const mcu = req.body.mcu
        const layout = req.body.layout
        const user = req.body.user

        const result = await cmd.generateQmkFile(kbL, kbDir, mcu, layout, user)
        
        // Try to read existing keyboard.json first (latest QMK), then fallback to info.json
        let infoQmk
        let configFile = 'keyboard.json'
        try {
            infoQmk = bufferToJson(await cmd.readQmkFile(kbL, 'keyboard.json'))
        } catch (e) {
            try {
                configFile = 'info.json'
                infoQmk = bufferToJson(await cmd.readQmkFile(kbL, 'info.json'))
            } catch (e) {
                // If neither file exists, create a basic structure
                infoQmk = {
                    keyboard_name: kb,
                    manufacturer: user,
                    maintainer: user,
                    processor: mcu,
                    bootloader: "atmel-dfu",
                    usb: {
                        vid: "0xFEED",
                        pid: "0x0000"
                    },
                    features: {
                        bootmagic: true,
                        command: false,
                        console: false,
                        extrakey: true,
                        mousekey: true,
                        nkro: true
                    },
                    matrix_pins: {
                        cols: [],
                        rows: []
                    },
                    layouts: {}
                }
            }
        }
        
        infoQmk.keyboard_name = kb
        infoQmk.manufacturer = user
        infoQmk.maintainer = user
        await cmd.writeQmkFile(kbL, configFile, jsonToStr(infoQmk))
        await cmd.mvQmkConfigsToVolume(kbDir)
        res.send(result)
    } catch (e) {
        res.send(e)
    }
})

app.get('/generate/vial/id', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await cmd.generateVialId()
        res.send(result)
    } catch (e) {
        res.send(e)
    }
})

app.post('/convert/via/json', multer().fields([{name: 'info'}, {name: 'kle'}]), async (req: Request, res: Response): Promise<void> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const info = bufferToJson((req as any).files['info'][0].buffer)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const kle = bufferToJson((req as any).files['kle'][0].buffer)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const km = kle.filter((v: any): boolean => Array.isArray(v))

        if (!info.keyboard_name) throw new Error("No Property: keyboard_name")
        if (!info.usb.vid) throw new Error("No Property: usb.vid")
        if (!info.usb.pid) throw new Error("No Property: usb.pid")
        if (!info.matrix_size.rows) throw new Error("No Property: matrix_size.rows")
        if (!info.matrix_size.cols) throw new Error("No Property: matrix_size.cols")

        const via = {
            name: info.keyboard_name,
            vendorId: info.usb.vid,
            productId: info.usb.pid,
            lighting: "none",
            matrix: {
                rows: info.matrix_size.rows,
                cols: info.matrix_size.cols,
            },
            layouts: {
                keymap: km
            }
        }
        await cmd.write('/root/keyboards/via.json', jsonToStr(via))
        res.send('convert')
    } catch (e) {
        res.send(e.toString())
    }
})


app.post('/convert/kle/qmk', multer().single('kle'), async (req: Request, res: Response): Promise<void> => {
    try {
        const params: ConvertKleQmkParams = JSON.parse(req.body.params)
        const kb = params.kb
        const fileKb = kb.toLowerCase().replace(/-| /g, "_")
        const kbDir = fileKb.replace(/\/.*/g, "")
        const mcu = params.mcu
        const layout = "fullsize_ansi"
        const user = params.user
        const vid = params.vid
        const pid = params.pid
        const option = params.option

        const rows = params.rows.split(",")
        const cols = params.cols.split(",")

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const kle = bufferToJson((req as any).file.buffer)
        const kleFileName = 'kle.json'
        await cmd.writeFirmFiles(kleFileName, jsonToStr(kle))

        await cmd.generateQmkFile(fileKb, kbDir, mcu, layout, user)
        await cmd.generateFirmFiles(kleFileName)

        const vialFirm = bufferToJson(await cmd.readFirmFiles('vial.json'))
        if (option === 2) {
            await cmd.write('/root/keyboards/via.json', jsonToStr(vialFirm))
            res.send("finish!!")
            return
        }

        let json = 'keyboard.json'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let infoQmk: any = {}
        try {
            infoQmk = bufferToJson(await cmd.readQmkFile(fileKb, json))
        } catch {
            json = 'info.json'
            infoQmk =bufferToJson(await cmd.readQmkFile(fileKb, json))
        }
        const infoFirm = bufferToJson(await cmd.readFirmFiles('info.json'))
        infoQmk.keyboard_name = kb
        infoQmk.manufacturer = user
        infoQmk.maintainer = user
        infoQmk.usb.vid = vid
        infoQmk.usb.pid = pid
        infoQmk.layouts = infoFirm.layouts
        infoQmk.matrix_size = {
            rows: vialFirm.matrix.rows,
            cols: vialFirm.matrix.cols
        }
        infoQmk.matrix_pins = {
            rows: rows,
            cols: cols
        }
        await cmd.writeQmkFile(fileKb, json, jsonToStr(infoQmk))

        let configQmk = ""
        try {
            configQmk = (await cmd.readQmkFile(fileKb, 'config.h')).toString()
        } catch { 
            // Ignore errors when config.h doesn't exist
        }
        if (option === 1) {
            configQmk = (await cmd.readFirmFiles('config.h')).toString()
        }
        if(configQmk !== "") {
            await cmd.writeQmkFile(fileKb, 'config.h', configQmk)
        }
        const kmFirm = (await cmd.readFirmFiles('keymap.c')).toString()
        await cmd.writeQmkFile(fileKb, 'keymaps/default/keymap.c', kmFirm)

        if (option === 1) {
            vialFirm.name = kb
            vialFirm.vendorId = vid
            vialFirm.productId = pid
            const rules = `VIA_ENABLE = yes\nVIAL_ENABLE = yes\n`
            await cmd.cpDefaultToVail(fileKb)
            await cmd.writeQmkFile(fileKb, 'keymaps/vial/vial.json', jsonToStr(vialFirm))
            await cmd.writeQmkFile(fileKb, 'keymaps/vial/rules.mk', rules)
        }

        await cmd.mvQmkConfigsToVolume(kbDir)
        res.send("finish!!")
    } catch (e) {
        res.send(e.toString())
    }
})



app.post('/convert/vil/keymap_c',  multer().fields([{name: 'vil'}]), async (req: Request, res: Response): Promise<void> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const keymap = vial2c(bufferToJson((req as any).files['vil'][0].buffer))
        await cmd.write(`${cmd.dirClient}/keymap.c`, keymap)
        await exec(`chmod 777 -R ${cmd.dirClient}/keymap.c`)
        res.send("finish!!")
    } catch (e) {
        res.send(e.toString())
    }
})

module.exports = app