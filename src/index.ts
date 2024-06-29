#!/usr/bin/env node

import path from "path";
import { Command } from "commander";
import fs from "fs-extra";
import { logger } from "./utils/logger";
import { FONTS_DIR_NAME } from "./constants";
import { createFontsDir } from "./helpers/create-fonts-dir";
import { getFontsDir } from "./helpers/get-fonts-dir";
import { groupFontsByFamily } from "./helpers/group-fonts-by-family";
import { getFontFiles } from "./helpers/get-font-files";
import { writeFontImports } from "./helpers/write-font";

// const program = new Command();

// todo: get project name from `package.json`
const PROJECT_NAME = path.basename(path.resolve(process.cwd()));

//? entry point
const main = async () => {
  logger.info(`lofo is running in ${PROJECT_NAME}`);
  logger.info(`Getting your ${FONTS_DIR_NAME} directory...`);
  // todo: on first pass, store path in `lofo.json`.
  // todo: reference path in `lofo.json` for succeeding passes to determine whether to update font import paths
  const fontsDirPath = getFontsDir();
  if (!fontsDirPath) {
    logger.warning(
      `A ${FONTS_DIR_NAME} directory was not found in your project...`
    );
    return createFontsDir();
  }
  logger.info(`Found ${FONTS_DIR_NAME} directory at ${fontsDirPath}`);
  const fontFiles = await getFontFiles(fontsDirPath);
  // todo: find a way to implicitly get `fontsDirPath` inside here
  const fontFamilies = groupFontsByFamily(fontFiles, fontsDirPath);
  //! remove
  console.log("Font Family's Fonts: ", fontFamilies[0]?.fonts);
  writeFontImports(fontsDirPath, fontFamilies);
};

main();
// const filesInAppDir = fs.readdirSync("src/app");
// console.log("Files In App Dir: ", filesInAppDir);
