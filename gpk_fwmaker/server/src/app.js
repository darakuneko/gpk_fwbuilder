const express = require('express')
const bodyParser = require('body-parser')
const cmd = require('./command')
const app = express()

const server = app.listen(3000, async() =>console.log("Node.js is listening to PORT:" + server.address().port))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', async (req, res) => res.send('GPK FWMaker!'))

app.get('/tags/qmk', async (req, res) => {
    const tags = await cmd.tags()
    res.send(tags)
})

app.get('/update/repository/qmk', async (req, res) => {
    await cmd.updateQmk()
    res.send('success')
})

app.post('/build/qmk', async (req, res) => {
    try {
        const kb = req.body.kb
        const kbDir = kb.replace(/\/.*/g, "")
        const km = req.body.km.replace(/:.*|flash/g, "")
        const tag = req.body.tag
        const currentTag = await cmd.currentTag()
        if(tag !== currentTag) await cmd.checkoutQmk(tag)
        await cmd.cpConfigsToQmk(kbDir)
        const result = await cmd.buildQmkFirmware(kb, km)
        await cmd.cpFirmware()
        res.send(result)
    } catch (e) {
        res.send(e)
    }
})
  
app.post('/generate/qmk/file', async (req, res) => {
    try {
        const kb = req.body.kb
        const kbDir = kb.replace(/\/.*/g, "")
        const mcu = req.body.mcu
        const layout = req.body.layout
        const user = req.body.user
        const result = await cmd.generateQmkFile(kb, mcu, layout, user)
        await cmd.mvQmkConfigsToVolume(kbDir)
        res.send(result)
    } catch (e) {
        res.send(e)
    }
})

module.exports = app