#!/usr/bin/env node

import fs, { mkdirSync } from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { Command } from "commander";
import { logger } from "./utils/logger";
import {
  FONTS_DIR_NAME,
  FONT_FILE_EXTENSIONS as FONT_FILE_EXTS,
} from "./constants";
import { moveFile } from "./utils/move-file";
import { createFontsDir } from "./helpers/create-fonts-dir";
import { getFontsDir } from "./helpers/get-fonts-dir";
import { getFileNames } from "./utils/get-file-names";
import { fileExists, folderExists } from "./utils/exists";

// const program = new Command();

const PROJECT_NAME = path.basename(path.resolve(process.cwd()));

const getLocalFonts = async (fontsDirPath: string) => {
  logger.info("Getting your local font files...");
  const filesInFontsDir = await fsPromises.readdir(fontsDirPath);
  if (!filesInFontsDir.length) {
    logger.error(
      `Couldn't find any files, add your font files to your ${FONTS_DIR_NAME} directory and try again...`
    );
    return process.exit(1);
  }
  const fontFiles = filesInFontsDir.filter((file) => {
    if (fileExists(path.join(fontsDirPath, `/${file}`))) {
      const fileParts = file.split(".");
      const fileExt = fileParts.pop()?.toLowerCase();
      const isFileFont = FONT_FILE_EXTS.some((ext) => ext === fileExt);
      return isFileFont;
    }
  });
  if (!fontFiles.length) {
    logger.error(
      `Couldn't find any font files in your ${FONTS_DIR_NAME} directory...\nAdd your local font files to your ${FONTS_DIR_NAME} directory and run cli again...`
    );
    return process.exit(1);
  }
  logger.info("Found font files...");
  console.log("Font Files: ", fontFiles);
  return fontFiles;
};

const groupFontsByFamily = (fontFiles: string[], fontsDirPath: string) => {
  logger.info("Grouping font files into families...");
  getFileNames(fontFiles).forEach((fileName) => {
    const fontFamilyFolderPath = path.join(fontsDirPath, `/${fileName}`);
    const filesToMove = fontFiles
      .filter((fontFile) => {
        const [name] = getFileNames([fontFile]);
        return name === fileName;
      })
      .map((file) => `${fontsDirPath}/${file}`);
    if (!folderExists(fontFamilyFolderPath)) {
      const createdDirPath = fs.mkdirSync(fontFamilyFolderPath, {
        recursive: true,
      });
      return moveFile(filesToMove, createdDirPath as string);
    }
    return moveFile(filesToMove, fontFamilyFolderPath);
  });
  logger.info("Grouped fonts into families...");
};

//? entry point
const main = async () => {
  logger.info(`lofo is running in ${PROJECT_NAME}`);
  logger.info(`Getting your ${FONTS_DIR_NAME} directory...`);
  const fontsDirPath = getFontsDir();
  if (!fontsDirPath) {
    logger.warning(
      `A ${FONTS_DIR_NAME} directory was not found in your project...`
    );
    return createFontsDir();
  }
  // todo: format `fontsDirPath` -- length might be too long
  logger.info(`Found ${FONTS_DIR_NAME} directory in ${fontsDirPath}`);
  const fontFiles = await getLocalFonts(fontsDirPath);
  groupFontsByFamily(fontFiles, fontsDirPath);
};

main();

// (err, createdDirPath) => {
// if (err) throw err;
// check if font directory already exists
// const fontFolderPath = !createdDirPath
//   ? path.join(fontsDirPath, `/${fileName}`)
//   : createdDirPath;
// console.log("Font Folder Path: ", fontFolderPath);
// moveFile(`${fontsDirPath}/${fileName}`, fontFolderPath);
// }
