const express = require("express");
const app = express();
const port = 16168;

const cors = require("cors");
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const path = require("path");
const fs = require("fs");

const db = require("better-sqlite3")(
  "D:\\D\\work\\learning_sqlite\\learning.db"
);

const resourcePath =
  "D:\\D\\work\\etc\\N\\magireco-data-downloader\\py3\\resource\\sound_native\\";

/**
 * read dir
 */
let bgm = [];
let fullvoice = [];
let jingle = [];
let surround = [];
let voice = [];
function traverseDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else {
      if (fullPath.split("\\").at(-1) == ".gitignore") {
        return;
      }
      if (fullPath.split("\\").at(-3) == "fullvoice") {
        fullvoice.push({
          section: fullPath.split("\\").at(-2),
          file_name: fullPath.split("\\").at(-1),
        });
      }
      if (fullPath.split("\\").at(-2) == "bgm") {
        let fileName = fullPath.split("\\").at(-1);
        if (fileName.split(".").at(-1) == "hca") {
          let group = fileName.split("_")[0];
          bgm.push({
            group: group,
            file_name: fileName,
          });
        }
      }
      if (fullPath.split("\\").at(-2) == "voice") {
        let fileName = fullPath.split("\\").at(-1);
        let character = fileName.split("_").at(1) + fileName.split("_").at(2);
        voice.push({
          character: character,
          file_name: fileName,
        });
      }
    }
  });
}

/**
 * insert db
 */
const insertBgmSQL = db.prepare(
  "INSERT OR IGNORE INTO bgm ('group', file_name) VALUES (@group, @file_name)"
);
const insertBgm = db.transaction((items) => {
  for (let item of items) insertBgmSQL.run(item);
});

const insertFullvoiceSQL = db.prepare(
  "INSERT OR IGNORE INTO fullvoice (section, file_name) VALUES (@section, @file_name)"
);
const insertFullvoice = db.transaction((items) => {
  for (let item of items) insertFullvoiceSQL.run(item);
});

const insertVoiceSQL = db.prepare(
  "INSERT OR IGNORE INTO voice (character, file_name) VALUES (@character, @file_name)"
);
const insertVoice = db.transaction((items) => {
  for (let item of items) insertVoiceSQL.run(item);
});

/**
 * update db
 */
const updateFullvoiceSQL = db.prepare(
  "UPDATE fullvoice SET (character, ori, chs, eng, other_language, remark) = (@character, @ori, @chs, @eng, @otherLanguage, @remark) WHERE file_name = @name"
);
const updateFullvoice = db.transaction((items) => {
  for (let item of items) updateFullvoiceSQL.run(item);
});
const updateVoiceSQL = db.prepare(
  "UPDATE Voice SET (ori, chs, eng, other_language, remark) = (@ori, @chs, @eng, @otherLanguage, @remark) WHERE file_name = @name"
);
const updateVoice = db.transaction((items) => {
  for (let item of items) updateVoiceSQL.run(item);
});

/**
 * read db
 */
function getBgmObj() {
  let bgmObj = {};
  const group = db.prepare("SELECT distinct [group] FROM bgm").all();
  group.forEach((item) => {
    bgmObj[item.group] = [];
  });
  const bgmFiles = db.prepare("SELECT * FROM bgm").all();
  bgmFiles.forEach((item) => {
    bgmObj[item.group].push({
      group: item.group,
      name: item.file_name,
      remark: item.remark,
    });
  });
  return bgmObj;
}

function getFullvoiceObj() {
  let fullvoiceObj = {};
  const sections = db.prepare("SELECT distinct section FROM fullvoice").all();
  sections.forEach((item) => {
    fullvoiceObj[item.section] = [];
  });
  const fullvoiceFiles = db.prepare("SELECT * FROM fullvoice").all();
  fullvoiceFiles.forEach((item) => {
    fullvoiceObj[item.section].push({
      name: item.file_name,
      character: item.character,
      ori: item.ori,
      chs: item.chs,
      eng: item.eng,
      otherLanguage: item.other_language,
      remark: item.remark,
    });
  });
  return fullvoiceObj;
}

function getVoiceObj() {
  let voiceObj = {};
  const character = db.prepare("SELECT distinct character FROM voice").all();
  character.forEach((item) => {
    voiceObj[item.character] = [];
  });
  const voiceFiles = db.prepare("SELECT * FROM voice").all();
  voiceFiles.forEach((item) => {
    voiceObj[item.character].push({
      character: item.character,
      name: item.file_name,
      ori: item.ori,
      chs: item.chs,
      eng: item.eng,
      otherLanguage: item.other_language,
      remark: item.remark,
    });
  });
  return voiceObj;
}

/**
 * write json
 */
function writeSoundNative() {
  let soundNative = {
    bgm: getBgmObj(),
    fullvoice: getFullvoiceObj(),
    jingle: null,
    surround: null,
    voice: getVoiceObj(),
  };
  fs.writeFile("sound-native.json", JSON.stringify(soundNative), (err) => {
    if (err) {
      console.error(err);
    }
  });
}

/**
 * call function
 */
console.log(
  `${port}, ${new Date().toLocaleString()}=======================================`
);

// traverseDir(resourcePath);
try {
  // insertBgm(bgm);
  // insertFullvoice(fullvoice);
  // insertVoice(voice);
} catch (err) {
  console.log(err);
}
// writeSoundNative();

/**
 * router
 */
app.get("/getFile/*", (req, res) => {
  return res.download(path.join(resourcePath, `${req.params[0]}`));
});
app.get("/getList", (req, res) => {
  let list = require("./sound-native.json");

  res.header("Content-Type", "application/json");
  return res.send(list);
});

app.post("/updateFullvoice", (req, res) => {
  updateFullvoice(req.body)

  return res.sendStatus(200);
});
app.post("/updateVoice", (req, res) => {
  return res.sendStatus(200);
});

app.listen(port, () => {
  console.log(
    `${port}, ${new Date().toLocaleString()}=======================================`
  );
});
