const express = require("express");
const app = express();
const port = 16167;

const cors = require("cors");
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const path = require("path");
const fs = require("fs");

const db = require("better-sqlite3")("D:\\D\\work\\db_sqlite\\learning.db", {
  // nativeBinding: "./better_sqlite3.node",
  nativeBinding:
    "./node_modules/better-sqlite3/build/release/better_sqlite3.node",
});

const resourcePath =
  "D:\\D\\work\\etc\\N\\magireco-data-downloader\\py3\\resource\\";

/**
 * read dir
 */
let bgm = [];
let fullvoice = [];
let jingle = [];
let surround = [];
let voice = [];
function traverseDirSoundNative(dir) {
  fs.readdirSync(dir).forEach((file) => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDirSoundNative(fullPath);
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

let char = [];
let other = [];
let mini = [];
function traverseDirMovie(dir) {
  fs.readdirSync(dir).forEach((file) => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDirMovie(fullPath);
    } else {
      let fileName = fullPath.split("\\").at(-1);
      let folderName = fullPath.split("\\").at(-2);
      if (folderName == "char") {
        let character = fileName.slice(6, 10);
        char.push({
          character: character,
          fileName: fileName,
        });
      }
      if (folderName == "other") {
        other.push({
          fileName: fileName,
        });
      }
      if (folderName == "mini") {
        let character = fileName.slice(6, 12);
        mini.push({
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

const insertCharSQL = db.prepare(
  "INSERT OR IGNORE INTO char (character, file_name) VALUES (@character, @fileName)"
);
const insertChar = db.transaction((items) => {
  for (let item of items) insertCharSQL.run(item);
});

const insertOtherSQL = db.prepare(
  "INSERT OR IGNORE INTO other (file_name) VALUES (@fileName)"
);
const insertOther = db.transaction((items) => {
  for (let item of items) insertOtherSQL.run(item);
});

const insertMiniSQL = db.prepare(
  "INSERT OR IGNORE INTO mini (character, file_name) VALUES (@character, @fileName)"
);
const insertMini = db.transaction((items) => {
  for (let item of items) insertMiniSQL.run(item);
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

function getCharObj() {
  let charObj = {};
  const char = db.prepare("SELECT DISTINCT character FROM char").all();
  char.forEach((item) => {
    charObj[item.character] = [];
  });
  const charFiles = db.prepare("SELECT * FROM char").all();
  charFiles.forEach((item) => {
    charObj[item.character].push({
      file_name: item.file_name,
      remark: item.remark,
    });
  });
  return charObj;
}

function getOtherObj() {
  let otherObj = [];
  const otherFiles = db.prepare("SELECT * FROM other").all();
  otherFiles.forEach((item) => {
    otherObj.push({
      file_name: item.file_name,
      remark: item.remark,
    });
  });
  return otherObj;
}

function getMiniObj() {
  let miniObj = {};
  const mini = db.prepare("SELECT DISTINCT character FROM mini").all();
  mini.forEach((item) => {
    miniObj[item.character] = [];
  });
  const miniFiles = db.prepare("SELECT * FROM mini").all();
  miniFiles.forEach((item) => {
    miniObj[item.character].push({
      file_name: item.file_name,
      remark: item.remark,
    });
  });
  return miniObj;
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

function readDBwriteMovie() {
  let soundNative = {
    char: getCharObj(),
    other: getOtherObj(),
    mini: getMiniObj(),
  };
  fs.writeFile("movie.json", JSON.stringify(soundNative), (err) => {
    if (err) {
      console.error(err);
    }
  });
}

function readDBwriteMovieBrief() {
  let charObj = [];
  const char = db.prepare("SELECT DISTINCT file_name FROM char").all();
  for (let item of char) charObj.push(item.file_name);

  let otherObj = [];
  const other = db.prepare("SELECT DISTINCT file_name FROM other").all();
  for (let item of other) otherObj.push(item.file_name);

  let miniObj = [];
  const mini = db.prepare("SELECT DISTINCT file_name FROM mini").all();
  for (let item of mini) miniObj.push(item.file_name);

  let movieBrief = {
    char: charObj,
    other: otherObj,
    mini: miniObj,
  };

  fs.writeFile("movie-brief.json", JSON.stringify(movieBrief), (err) => {
    if (err) {
      console.error(err);
    }
  });
}

/**
 * call function
 */
console.log(
  `${port}, ${new Date().toLocaleString()}======================================= init`
);

// traverseDirSoundNative(resourcePath + "sound_native\\");
// traverseDirMovie(resourcePath + "movie\\");
// insertBgm(bgm);
// insertFullvoice(fullvoice);
// insertVoice(voice);
// insertChar(char);
// insertOther(other);
// insertMini(mini);

// readDBwriteSoundNative();
// readDBwriteSoundNativeBrief();
// readDBwriteMovie();
// readDBwriteMovieBrief();

/**
 * scratch
 */

/**
 * listen
 */

app.listen(port, () => {
  console.log(
    `${port}, ${new Date().toLocaleString()}======================================= launched`
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
app.get("/getMovie", (req, res) => {
  let file = path.resolve("./movie.json");
  delete require.cache[file];
  let list = require("./movie.json");

  res.header("Content-Type", "application/json");
  return res.send(list);
});
// app.get("/getMovieBrief", (req, res) => {
//   let file = path.resolve("./movie-brief.json");
//   delete require.cache[file];
//   let list = require("./movie-brief.json");

//   res.header("Content-Type", "application/json");
//   return res.send(list);
// });

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
  return res.sendStatus(200);
});
app.post("/updateFullvoice", (req, res) => {
  updateFullvoice(req.body);
  return res.sendStatus(200);
});
app.post("/updateVoice", (req, res) => {
  updateVoice(req.body);
  return res.sendStatus(200);
});
