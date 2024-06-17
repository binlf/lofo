#!/usr/bin/env node

import fs, { mkdirSync } from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { Command } from "commander";
import { logger } from "./utils/logger";
import { folderExists } from "./utils/folderExists";
import { FONTS_DIR_NAME } from "./constants";
import { moveFile } from "./utils/moveFile";

// const program = new Command();

const PROJECT_NAME = path.basename(path.resolve(process.cwd()));
const CURRENT_DIR = process.cwd();

// todo: recursively traverse the project tree for the `fonts` directory

const getFontsDir = () => {
  // todo: make this a global constant
  const dirsToCheck = [
    "src",
    "public",
    "public/assets",
    "src/public",
    "src/public/assets",
  ];
  const dirPathInCurrDir = path.join(CURRENT_DIR, FONTS_DIR_NAME);
  let fontsDirPath = "";
  let dirFound = false;

  if (folderExists(dirPathInCurrDir)) {
    dirFound = true;
    fontsDirPath = dirPathInCurrDir;
  } else {
    let index = 0;
    while (index < dirsToCheck.length) {
      const dir = dirsToCheck[index];
      const dirPathInSubDir = path.join(
        CURRENT_DIR,
        dir as string,
        FONTS_DIR_NAME
      );
      fontsDirPath = dirPathInSubDir;
      if (folderExists(dirPathInSubDir)) {
        dirFound = true;
        break;
      }
      index++;
    }
    if (!dirFound) fontsDirPath = "";
  }
  return fontsDirPath;
};

const createFontsDir = () => {
  logger.info(
    `Creating a ${FONTS_DIR_NAME} directory in the root directory of your project...`
  );
  const fontsDirPathInRoot = fs.mkdirSync(
    path.join(CURRENT_DIR, `/${FONTS_DIR_NAME}`),
    { recursive: true }
  );
  logger.info(
    `Created a ${FONTS_DIR_NAME} directory in ${fontsDirPathInRoot}.\nPut all your local font files into the ${FONTS_DIR_NAME} directory and run the cli again...`
  );
};

const checkLocalFontFiles = async (dirPath: string) => {
  logger.info("Getting your local font files...");
  const fontFileExts = ["ttf", "otf", "woff", "woff2"];
  const fontFileNames: string[] = [];
  const filesInFontsDir = await fsPromises.readdir(dirPath, {
    recursive: true,
  });
  if (!filesInFontsDir) {
    logger.error(
      `Couldn't find any files, add your font files to your ${FONTS_DIR_NAME} directory and try again... `
    );
    return process.exit(1);
  }
  const fontFiles = filesInFontsDir.filter((file) => {
    if (fs.lstatSync(path.join(dirPath, `/${file}`)).isFile()) {
      const fileParts = file.split(".");
      const fileExt = fileParts.pop()?.toLowerCase();
      const isFileFont = fontFileExts.some((ext) => ext === fileExt);
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
  logger.info("Grouping font files into families..,");
  fontFiles.forEach((fontFile) => {
    // todo: extract this logic to a function to handle weird conventions -- `getFileName()`
    const fileName = fontFile.split(".")[0]?.split("-")[0] as string;
    if (!fontFileNames.includes(fileName)) fontFileNames.push(fileName);
  });
  fontFileNames.forEach((fileName) => {
    fs.mkdir(
      path.join(dirPath, `/${fileName}`),
      { recursive: true },
      (err, createdDirPath) => {
        if (err) throw err;
        // check if font directory already exists
        const fontFolderPath = !createdDirPath
          ? path.resolve(path.join(dirPath, `/${fileName}`))
          : createdDirPath;
        moveFile(
          fontFiles
            .filter(
              (fontFile) =>
                (fontFile.split(".")[0]?.split("-")[0] as string) === fileName
            )
            .map((file) => `${dirPath}/${file}`),
          fontFolderPath
        );
        logger.info("Grouped fonts into families...");
      }
    );
  });
  console.log("Font Files: ", fontFiles);
  console.log("Font File Names: ", fontFileNames);
};

//? entry point
const main = () => {
  logger.info(`lofo is running in ${PROJECT_NAME}`);
  logger.info(`Getting your ${FONTS_DIR_NAME} directory...`);
  const fontsDirPath = getFontsDir();
  if (!fontsDirPath) {
    logger.warning(
      `A ${FONTS_DIR_NAME} directory was not found in your project...`
    );
    createFontsDir();
  } else {
    // todo: format `fontsDirPath` -- length might be too long
    logger.info(`Found ${FONTS_DIR_NAME} directory in ${fontsDirPath}`);
    checkLocalFontFiles(fontsDirPath);
  }
};

main();
