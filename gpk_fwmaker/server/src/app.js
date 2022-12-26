const express = require('express')
const bodyParser = require('body-parser')
const {cmd, streamError} = require('./command')
const app = express()

const server = app.listen(3000, async() =>console.log("Node.js is listening to PORT:" + server.address().port))

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
    try {
        const kb = req.body.kb
        const kbDir = kb.replace(/\/.*/g, "")
        const km = req.body.km.replace(/:.*|flash/g, "")
        const tag = req.body.tag
        const currentTag = await cmd.currentTag()
        if(tag !== currentTag) await cmd.checkoutQmk(tag)
        await cmd.cpConfigsToQmk(kbDir)
        await cmd.buildQmkFirmware(res, kb, km)
    } catch (e) { streamError(res, e) }
})
  
app.post('/build/vial', async (req, res) => {
    try {
        const kb = req.body.kb
        const kbDir = kb.replace(/\/.*/g, "")
        const km = req.body.km.replace(/:.*|flash/g, "")

        if("commit" in req.body) {
            const commit = req.body.commit
            if(commit.length > 0) await cmd.checkoutVial(commit)
        } else {
            await cmd.checkoutVial()
        }
        await cmd.cpConfigsToVial(kbDir)
        await cmd.buildVialFirmware(res,kb, km)
    } catch (e) { streamError(res, e) }
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

app.get('/generate/vial/id', async (req, res) => {
    try {
        const result = await cmd.generateVialId()
        res.send(result)
    } catch (e) {
        res.send(e)
    }
})

module.exports = app