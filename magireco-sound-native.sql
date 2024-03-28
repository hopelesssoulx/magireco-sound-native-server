CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE IF NOT EXISTS "_character" (
  "id" INTEGER NOT NULL,
  "name" TEXT,
  "update_time" DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "bgm" (
  "group" TEXT,
  "file_name" TEXT NOT NULL,
  "remark" TEXT,
  "update_time" DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("file_name")
);
CREATE TABLE IF NOT EXISTS "fullvoice" (
  "section" TEXT,
  "file_name" TEXT NOT NULL,
  "character" TEXT,
  "ori" TEXT,
  "chs" TEXT,
  "eng" TEXT,
  "other_language" TEXT,
  "remark" TEXT,
  "update_time" DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("file_name")
);
CREATE TABLE IF NOT EXISTS "voice" (
  "character" TEXT,
  "file_name" TEXT NOT NULL,
  "ori" TEXT,
  "chs" TEXT,
  "eng" TEXT,
  "other_language" TEXT,
  "remark" TEXT,
  "update_time" DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("file_name")
);
CREATE TRIGGER bgm_update_time
AFTER UPDATE ON bgm
BEGIN
   UPDATE bgm SET update_time = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') WHERE file_name = NEW.file_name;
END;
CREATE TRIGGER fullvoice_update_time
AFTER UPDATE ON fullvoice
BEGIN
   UPDATE fullvoice SET update_time = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') WHERE file_name = NEW.file_name;
END;
CREATE TRIGGER voice_update_time
AFTER UPDATE ON voice
BEGIN
   UPDATE voice SET update_time = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') WHERE file_name = NEW.file_name;
END;
