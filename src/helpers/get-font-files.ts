import { FONTS_DIR_NAME } from "../constants";
import { folderExists, isFontFile } from "../utils/exists";
import { getLofoConfig } from "../utils/get-config";
import { logger } from "../utils/logger";
import fsPromises from "fs/promises";
import path from "path";
import { getTypeface } from "../utils/get-file-names";

/**
 * Returns an array of font file paths in a given directory.
 * @param {string} fontsDirPath - Path to directory containing font files.
 * @returns {Promise<string[]>} Returns a promise that resolves with an array of font file paths.
 */
export const getFontFiles = async (fontsDirPath: string) => {
  const { fonts } = getLofoConfig();
  // logger.info("Getting your local font files...");
  const filesInFontsDir = await fsPromises.readdir(fontsDirPath);
  if (!filesInFontsDir.length) {
    logger.warning(
      `Couldn't find any files, add your font files to your ${FONTS_DIR_NAME} directory and try again...`
    );

    return process.exit(0);
  }

  const oldFonts: string[] = [];
  const newFontFilePaths: string[] = filesInFontsDir.reduce<string[]>(
    (acc, file) => {
      if (isFontFile(file)) {
        // const [fontName] = getFontFileNames([file]);
        const typeface = getTypeface(file);
        if (typeface && fonts?.includes(typeface)) oldFonts.push(typeface);
        return [...acc, path.join(fontsDirPath, file)];
      }
      return acc;
    },
    []
  );
  const oldFontFilePaths = await oldFonts.reduce<Promise<string[]>>(
    async (accPromise, font) => {
      const acc = await accPromise;
      const oldFontsDirPath = path.join(fontsDirPath, font);
      if (folderExists(oldFontsDirPath)) {
        const filesInDir = await fsPromises.readdir(oldFontsDirPath);
        const fontFilePaths = filesInDir
          .filter((file) => isFontFile(file))
          .map((f) => oldFontsDirPath + path.sep + f);
        if (filesInDir.length) return [...acc, ...fontFilePaths];
      }
      return acc;
    },
    Promise.resolve([])
  );
  const fontFilePaths = [...newFontFilePaths, ...oldFontFilePaths];
  if (!newFontFilePaths.length) {
    logger.warning(
      `Couldn't find any font files at the root of your ${FONTS_DIR_NAME} directory...\nAdd your font files to your ${FONTS_DIR_NAME} directory and run cli again...`
    );
    return process.exit(0);
  }
  // logger.info("Found font files...");
  // console.log(
  //   "Font Files: ",
  //   newFontFilePaths.map((fontFilePath) => path.basename(fontFilePath))
  // );

  return fontFilePaths;
};
