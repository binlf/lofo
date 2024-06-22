#!/usr/bin/env node

import path from "path";
import { Command } from "commander";
import { logger } from "./utils/logger";
import {
  FONTS_DIR_NAME,
  FONT_FILE_EXTENSIONS as FONT_FILE_EXTS,
} from "./constants";
import { createFontsDir } from "./helpers/create-fonts-dir";
import { getFontsDir } from "./helpers/get-fonts-dir";
import { groupFontsByFamily } from "./helpers/group-fonts-by-family";
import { getFontFiles } from "./helpers/get-font-files";
import { writeFontImports } from "./helpers/write-font-imports";

// const program = new Command();

// todo: get project name from `package.json`
const PROJECT_NAME = path.basename(path.resolve(process.cwd()));

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
  const fams = groupFontsByFamily(fontFiles, fontsDirPath);
  console.log("Font Family's Fonts: ", fams[0]?.fonts);
  writeFontImports(fontsDirPath);
};

main();

//? We can, once the steps are complete inform the user
//? about the ability to change the location of the `fonts` directory
//? if not satisfied, after which they run the cli command again to update
//? the font file import paths

//? add ability for user to pass an argument along with `lofo` command
//? for the path to where they would like the fonts directory to finally be placed,
//? by default it'd be placed in the "public" folder of your Next.js project
//? it'd create one if it doesn't already exist
