const express = require('express')
const bodyParser = require('body-parser')
const cmd = require('./command')
const app = express()

const server = app.listen(3000, async() =>console.log("Node.js is listening to PORT:" + server.address().port))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', async (req, res) => res.send('GPK FWMaker!'))

app.get('/tags/qmk', async (req, res) => {
    const tags = await cmd.tags()
    res.send(tags)
})

app.get('/update/qmk', async (req, res) => {
    await cmd.updateQmk()
    res.send('success')
})

app.post('/build/qmk', async(req, res) => {
    const kb = req.body.kb
    const kbDir = kb.replace(/\/.*/g, "")
    const km = req.body.km.replace(/:.*|flash/g, "")
    const tag = req.body.tag

    try {
        const currentTag = await cmd.currentTag()
        if(tag !== currentTag) await cmd.checkoutQmk(tag)
        await cmd.cpConfigs(kbDir)
        const result = await cmd.buildQmkFirmware(kb, km)
        await cmd.cpFirmware()
        res.send(result);
    } catch (e) {
        res.send(e);
    }
});
  
module.exports = app;