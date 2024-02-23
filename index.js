const express = require("express");
const app = express();
const port = 16168;

const cors = require("cors");
app.use(cors());

const path = require("path");
const fs = require("fs");

const db = require("better-sqlite3")(
  "D:\\D\\work\\learning_sqlite\\learning.db"
);

const resourcePath =
  "D:\\D\\work\\etc\\N\\magireco-data-downloader\\py3\\resource\\sound_native\\fullvoice\\";
// const resourcePath = "D:\\D\\download\\z_test\\";

/**
 * read dir
 */
let fullvoiceData = [];
function traverseDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else {
      fullvoiceData.push({
        section: fullPath.split("\\").at(-2),
        file_name: fullPath.split("\\").at(-1),
      });
    }
  });
}
traverseDir(resourcePath);

/**
 * insert db
 */
const insertFolderSQL = db.prepare(
  "INSERT INTO fullvoice (section, file_name) VALUES (@section, @file_name)"
);
const insertFolder = db.transaction((items) => {
  for (let item of items) insertFolderSQL.run(item);
});
try {
  insertFolder(fullvoiceData);
} catch (err) {}

/**
 * read db
 */
let obj = {};
const sections = db.prepare("SELECT distinct section FROM fullvoice").all();
sections.forEach((item) => {
  obj[item.section] = [];
});
const files = db.prepare("SELECT * FROM fullvoice").all();
files.forEach((item) => {
  obj[item.section].push({
    name: item.file_name,
    character: item.character,
    ori: item.ori,
    chs: item.chs,
    eng: item.eng,
    otherLanguage: item.other_language,
    remark: item.remark,
  });
});

/**
 * write json
 */
fs.writeFile("test.json", JSON.stringify(obj), (err) => {
  if (err) {
    console.error(err);
  }
});

/**
 * router
 */
app.get("/getFile/*", (req, res) => {
  return res.download(path.join(resourcePath, `${req.params[0]}`));
});
app.get("/getList", (req, res) => {
  let list = require("./test.json");

  res.header("Content-Type", "application/json");
  return res.send({
    bgm: null,
    fullvoice: list,
    jingle: null,
    surround: null,
    voice: null,
  });
});

app.listen(port, () => {
  console.log(`${port}=======================================`);
});
