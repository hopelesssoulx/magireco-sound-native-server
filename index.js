const express = require("express");
const app = express();
const port = 16167;

const cors = require("cors");
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const path = require("path");
const fs = require("fs");

const db = require("better-sqlite3")(
  "D:\\D\\work\\learning_sqlite\\learning.db",
  { nativeBinding: "./better_sqlite3.node" }
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
          fileName: fullPath.split("\\").at(-1),
        });
      }
      if (fullPath.split("\\").at(-2) == "bgm") {
        let fileName = fullPath.split("\\").at(-1);
        if (fileName.split(".").at(-1) == "hca") {
          let group = fileName.split("_")[0];
          bgm.push({
            group: group,
            fileName: fileName,
          });
        }
      }
      if (fullPath.split("\\").at(-2) == "voice") {
        let fileName = fullPath.split("\\").at(-1);
        let character = fileName.split("_").at(1) + fileName.split("_").at(2);
        voice.push({
          character: character,
          fileName: fileName,
        });
      }
    }
  });
}

/**
 * insert db
 */
const insertBgmSQL = db.prepare(
  "INSERT OR IGNORE INTO bgm ('group', file_name) VALUES (@group, @fileName)"
);
const insertBgm = db.transaction((items) => {
  for (let item of items) insertBgmSQL.run(item);
});

const insertFullvoiceSQL = db.prepare(
  "INSERT OR IGNORE INTO fullvoice (section, file_name) VALUES (@section, @fileName)"
);
const insertFullvoice = db.transaction((items) => {
  for (let item of items) insertFullvoiceSQL.run(item);
});

const insertVoiceSQL = db.prepare(
  "INSERT OR IGNORE INTO voice (character, file_name) VALUES (@character, @fileName)"
);
const insertVoice = db.transaction((items) => {
  for (let item of items) insertVoiceSQL.run(item);
});

/**
 * update db
 */
const updateBgmSQL = db.prepare(
  "UPDATE bgm SET (remark) = (@remark) WHERE file_name = @file_name"
);
const updateBgm = db.transaction((items) => {
  for (let item of items) updateBgmSQL.run(item);
});
const updateFullvoiceSQL = db.prepare(
  "UPDATE fullvoice SET (character, ori, chs, eng, other_language, remark) = (@character, @ori, @chs, @eng, @other_language, @remark) WHERE file_name = @file_name"
);
const updateFullvoice = db.transaction((items) => {
  for (let item of items) updateFullvoiceSQL.run(item);
});
const updateVoiceSQL = db.prepare(
  "UPDATE voice SET (ori, chs, eng, other_language, remark) = (@ori, @chs, @eng, @other_language, @remark) WHERE file_name = @file_name"
);
const updateVoice = db.transaction((items) => {
  for (let item of items) updateVoiceSQL.run(item);
});

/**
 * read db
 */
function getBgmObj() {
  let bgmObj = {};
  const group = db.prepare("SELECT DISTINCT [group] FROM bgm").all();
  group.forEach((item) => {
    bgmObj[item.group] = [];
  });
  const bgmFiles = db.prepare("SELECT * FROM bgm").all();
  bgmFiles.forEach((item) => {
    bgmObj[item.group].push({
      group: item.group,
      file_name: item.file_name,
      remark: item.remark,
    });
  });
  return bgmObj;
}

function getFullvoiceObj() {
  let fullvoiceObj = {};
  const sections = db.prepare("SELECT DISTINCT section FROM fullvoice").all();
  sections.forEach((item) => {
    fullvoiceObj[item.section] = [];
  });
  const fullvoiceFiles = db.prepare("SELECT * FROM fullvoice").all();
  fullvoiceFiles.forEach((item) => {
    fullvoiceObj[item.section].push({
      file_name: item.file_name,
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
  const character = db.prepare("SELECT DISTINCT character FROM voice").all();
  character.forEach((item) => {
    voiceObj[item.character] = [];
  });
  const voiceFiles = db.prepare("SELECT * FROM voice").all();
  voiceFiles.forEach((item) => {
    voiceObj[item.character].push({
      character: item.character,
      file_name: item.file_name,
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
function readDBwriteSoundNative() {
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

function readDBwriteSoundNativeBrief() {
  let bgmObj = [];
  const group = db.prepare("SELECT DISTINCT [group] FROM bgm").all();
  for (let item of group) bgmObj.push(item.group);

  let fullvoiceObj = [];
  const sections = db.prepare("SELECT DISTINCT section FROM fullvoice").all();
  for (let item of sections) fullvoiceObj.push(item.section);

  let voiceObj = [];
  const characters = db.prepare("SELECT DISTINCT character FROM voice").all();
  for (let item of characters) voiceObj.push(item.character);

  let soundNativeBrief = {
    bgm: bgmObj,
    fullvoice: fullvoiceObj,
    jingle: null,
    surround: null,
    voice: voiceObj,
  };

  fs.writeFile(
    "sound-native-brief.json",
    JSON.stringify(soundNativeBrief),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
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
// readDBwriteSoundNative();
readDBwriteSoundNativeBrief();

/**
 * scratch
 */

/**
 * listen
 */

app.listen(port, () => {
  console.log(
    `${port}, ${new Date().toLocaleString()}=======================================`
  );
});

/**
 * router
 */
app.get("/getFile/*", (req, res) => {
  return res.download(path.join(resourcePath, `${req.params[0]}`));
});
// app.get("/getList", (req, res) => {
//   // let list = require("./sound-native.json");

//   let file = path.resolve("./sound-native.json");
//   delete require.cache[file];
//   let list = require("./sound-native.json");

//   res.header("Content-Type", "application/json");
//   return res.send(list);
// });
app.get("/getListBrief", (req, res) => {
  let file = path.resolve("./sound-native-brief.json");
  delete require.cache[file];
  let list = require("./sound-native-brief.json");

  res.header("Content-Type", "application/json");
  return res.send(list);
});

app.get("/getListBgm/*", (req, res) => {
  const obj = db
    .prepare(`SELECT * FROM bgm where [group] = '${req.params[0]}'`)
    .all();
  return res.send(obj);
});
app.get("/getListFullvoice/*", (req, res) => {
  const obj = db
    .prepare(`SELECT * FROM fullvoice where section = '${req.params[0]}'`)
    .all();
  return res.send(obj);
});
app.get("/getListVoice/*", (req, res) => {
  const obj = db
    .prepare(`SELECT * FROM voice where character = '${req.params[0]}'`)
    .all();
  return res.send(obj);
});

app.post("/updateBgm", (req, res) => {
  updateBgm(req.body);
  // setTimeout(() => {
  //   readDBwriteSoundNative();
  // }, 1000);

  return res.sendStatus(200);
});
app.post("/updateFullvoice", (req, res) => {
  updateFullvoice(req.body);
  // setTimeout(() => {
  //   readDBwriteSoundNative();
  // }, 1000);

  return res.sendStatus(200);
});
app.post("/updateVoice", (req, res) => {
  updateVoice(req.body);
  // setTimeout(() => {
  //   readDBwriteSoundNative();
  // }, 1000);

  return res.sendStatus(200);
});
