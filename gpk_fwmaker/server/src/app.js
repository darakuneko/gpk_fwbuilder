const express = require('express')
const bodyParser = require('body-parser')
const {cmd, streamError} = require('./command')
const app = express()
const multer = require("multer")

const server = app.listen(3000, async() =>console.log("Node.js is listening to PORT:" + server.address().port))

const streamResponce = async (res, fn) => {
    res.writeHead(200, { "Content-Type": "text/event-stream"})
    await fn()
}

const bufferToJson = (buf) => JSON.parse(buf.toString())

const jsonToStr = (obj) => JSON.stringify(obj, null, 2)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', async (req, res) => res.send('GPK FWMaker!'))

app.get('/tags/qmk', async (req, res) => {
    const tags = await cmd.tags()
    res.send(tags)
})

app.get('/update/repository/qmk', async (req, res) => await cmd.updateRepositoryQmk(res))

app.get('/update/repository/vial', async (req, res) => await cmd.updateRepositoryVial(res))

app.post('/build/qmk', async (req, res) => {
    const fn = async () => {
        try {
            const kb = req.body.kb
            const kbDir = kb.replace(/\/.*/g, "")
            const km = req.body.km.replace(/:.*|flash/g, "")
            const tag = req.body.tag
            const currentTag = await cmd.currentTag()
            if (tag !== currentTag) await cmd.checkoutQmk(res, tag)
            await cmd.cpConfigsToQmk(kbDir)
            await cmd.buildQmkFirmware(res, kb, km)
        } catch (e) {
            streamError(res, e)
        }
    }
    await streamResponce(res, fn)
})
  
app.post('/build/vial', async (req, res) => {
    const fn = async () => {
        try {
            const kb = req.body.kb
            const kbDir = kb.replace(/\/.*/g, "")
            const km = req.body.km.replace(/:.*|flash/g, "")
            const commit = "commit" in req.body && req.body.commit.length > 0 ? req.body.commit : "vial"
            await cmd.checkoutVial(res, commit)
            await cmd.cpConfigsToVial(kbDir)
            await cmd.buildVialFirmware(res, kb, km)
        } catch (e) { streamError(res, e) }
    }

    await streamResponce(res, fn)
})
  
app.post('/generate/qmk/file', async (req, res) => {
    try {
        const kb = req.body.kb
        const kbL = kb.toLowerCase().replace(/-| /g,"_")
        const kbDir = kbL.replace(/\/.*/g, "")
        const mcu = req.body.mcu
        const layout = req.body.layout
        const user = req.body.user

        const result = await cmd.generateQmkFile(kbL, mcu, layout, user)
        const infoQmk = bufferToJson(await cmd.readQmkFile(kbDir, 'info.json')) 
        infoQmk.keyboard_name = kb
        infoQmk.manufacturer = user
        infoQmk.maintainer = user
        await cmd.writeQmkFile(kbDir, 'info.json', jsonToStr(infoQmk))
        await cmd.mvQmkConfigsToVolume(kbDir)
        res.send(result)
    } catch (e) {
        res.send(e)
    }
})

app.get('/generate/vial/id', async (req, res) => {
    try {
        const result = await cmd.generateVialId()
        res.send(result)
    } catch (e) {
        res.send(e)
    }
})

app.post('/convert/via/json', multer().fields([{ name: 'info' }, { name: 'kle' }]), async (req, res) => {
    try {
        const info = bufferToJson(req.files['info'][0].buffer)
        const kle = bufferToJson(req.files['kle'][0].buffer)
        const km = kle.filter(v => Array.isArray(v))

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


app.post('/convert/kle/qmk', multer().single('kle'), async (req, res) => {
    try {
        const params = JSON.parse(req.body.params)
        const kb = params.kb
        const fileKb = kb.toLowerCase().replace(/-| /g,"_")
        const kbDir = fileKb.replace(/\/.*/g, "")
        const mcu = params.mcu
        const layout = "fullsize_ansi"
        const user = params.user
        const vid = params.vid
        const pid = params.pid
        const option = params.option
   
        const rows = params.rows.split(",")
        const cols = params.cols.split(",")
        
        const kle = bufferToJson(req.file.buffer)
        const kleFileName = 'kle.json'
        await cmd.writeFirmFiles(kleFileName, jsonToStr(kle))

        await cmd.generateQmkFile(fileKb, mcu, layout, user)
        await cmd.generateFirmFiles(kleFileName)
      
        const vialFirm = bufferToJson(await cmd.readFirmFiles('vial.json'))
        if(option === 2) {
            await cmd.write('/root/keyboards/via.json', jsonToStr(vialFirm))
            res.send("finish!!")
            return
        }

        const infoQmk = bufferToJson(await cmd.readQmkFile(fileKb, 'info.json')) 
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
        await cmd.writeQmkFile(fileKb, 'info.json', jsonToStr(infoQmk))

        let configQmk = await cmd.readQmkFile(fileKb, 'config.h')
        if(option === 1){
            const configFirm = await cmd.readFirmFiles('config.h')
            configQmk = configQmk + configFirm
        }
        await cmd.writeQmkFile(fileKb, 'config.h', configQmk)
        
        const kbFirm = await cmd.readFirmFiles('kb.h')
        await cmd.writeQmkFile(fileKb, `${fileKb}.h`, kbFirm)

        const kmFirm = await cmd.readFirmFiles('km.c')
        await cmd.writeQmkFile(fileKb, 'keymaps/default/keymap.c', kmFirm)

        if(option === 1){
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

module.exports = app