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
import { createFontsDir } from "./helpers/create-fonts-dir";
import { getFontsDir } from "./helpers/get-fonts-dir";
import { fileExists } from "./utils/exists";
import { groupFontsByFamily } from "./helpers/group-fonts-by-family";

// const program = new Command();

const PROJECT_NAME = path.basename(path.resolve(process.cwd()));

const getFontFiles = async (fontsDirPath: string) => {
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
  const fontFiles = await getFontFiles(fontsDirPath);
  // todo: find a way to implicitly get `fontsDirPath` inside here
  groupFontsByFamily(fontFiles, fontsDirPath);
};

main();
