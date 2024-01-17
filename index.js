const express = require('express')
const app = express()
const port = 16168


const cors = require('cors')
app.use(cors())


const db = require('better-sqlite3')('D:\\D\\work\\learning_sqlite\\learning.db');
const sections = db.prepare('SELECT distinct section FROM fullvoice').all();
let obj = {}
sections.forEach(item => {
    obj[item.section] = []
})
const files = db.prepare('SELECT * FROM fullvoice').all();
files.forEach(item => {
    obj[item.section].push(item.file_name)
})


const fs = require('fs')
fs.writeFile('test.json', JSON.stringify(obj, null, 2), err => {
    if (err) {
        console.error(err);
    }
});


var path = require("path");
app.get('/getFile/*', (req, res) => {
    return res.sendFile(path.join('D:\\D\\download\\z_test\\', `${req.params[0]}`))
    // return res.download(path.join('D:\\D\\download\\z_test\\', `${req.params[0]}`))
    // return res.send('Hello World!')
})
app.get('/getList', (req, res) => {
    let list = require('./test.json')

    res.header("Content-Type", 'application/json');
    return res.send(JSON.stringify(list))
})


app.listen(port, () => {
    console.log(`${port}=======================================`)
})