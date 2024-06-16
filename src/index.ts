#!/usr/bin/env node

import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { Command } from "commander";

const program = new Command();

const logger = {
  error(message: string) {
    console.log(`ERROR: ${message}...`);
  },
  success(message: string) {
    console.log(`SUCCESS: ${message}`);
  },
  warning(message: string) {
    console.log(`WARNING: ${message}`);
  },
  info(message: string) {
    console.log(`INFO: ${message}`);
  },
};

const PROJECT_NAME = path.basename(path.resolve(process.cwd()));
const CURRENT_DIR = process.cwd();
const FONTS_DIR = "fonts";

const folderExists = (folderPath: string) => {
  return fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory();
};

// todo: recursively traverse the project tree for the `fonts` directory
let index = 0;
let dirFound = false;

const getFontsDir = () => {
  const dirsToCheck = ["src", "src/public"];
  const dirPathInCurrDir = path.join(CURRENT_DIR, FONTS_DIR);
  let fontsDirPath = "";

  if (folderExists(dirPathInCurrDir)) {
    dirFound = true;
    fontsDirPath = dirPathInCurrDir;
  } else {
    while (index < dirsToCheck.length) {
      const dir = dirsToCheck[index];
      const dirPathInSubDir = path.join(CURRENT_DIR, dir!, FONTS_DIR);
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

const main = () => {
  logger.info(`lofo is running in ${PROJECT_NAME}`);
  logger.info(`Getting your ${FONTS_DIR} directory...`);
  const fontsDirPath = getFontsDir();
  if (!fontsDirPath)
    logger.warning(
      `A ${FONTS_DIR} was not found in your project, creating one...`
    );
  else logger.info(`Found ${FONTS_DIR} directory in ${fontsDirPath}`);
};

main();
