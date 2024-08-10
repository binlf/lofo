import { FONTS_DIR_NAME, FONT_FILE_EXTENSIONS } from "../constants";
import { fileExists, folderExists } from "../utils/exists";
import { getLofoConfig } from "../utils/get-config";
import { logger } from "../utils/logger";
import fsPromises from "fs/promises";
import path from "path";
import { getFontFileNames } from "../utils/get-file-names";

/**
 * Returns an array of font file paths in a given directory.
 * @param {string} fontsDirPath - Directory path for font files.
 * @returns {Promise<string[]>} Returns a promise that resolves with an array of font file paths.
 */
export const getFontFiles = async (fontsDirPath: string) => {
  const { fonts } = getLofoConfig();
  logger.info("Getting your local font files...");
  const filesInFontsDir = await fsPromises.readdir(fontsDirPath);
  if (!filesInFontsDir.length) {
    logger.warning(
      `Couldn't find any files, add your font files to your ${FONTS_DIR_NAME} directory and try again...`
    );
    return process.exit(0);
  }

  const oldFonts: string[] = [];
  const newFontFiles: string[] = filesInFontsDir.reduce<string[]>(
    (acc, file) => {
      if (isFileFont(file)) {
        const [fontName] = getFontFileNames([file]);
        if (fontName && fonts?.includes(fontName)) oldFonts.push(fontName);
        return [...acc, path.join(fontsDirPath, file)];
      }
      return acc;
    },
    []
  );
  const oldFontFiles = await oldFonts.reduce<Promise<string[]>>(
    async (accPromise, font) => {
      const acc = await accPromise;
      const oldFontsDirPath = path.join(fontsDirPath, font);
      if (folderExists(oldFontsDirPath)) {
        const files = await fsPromises.readdir(oldFontsDirPath);
        if (files.length)
          return [
            ...acc,
            ...files
              .filter((file) => isFileFont(file))
              .map((f) => oldFontsDirPath + path.sep + f),
          ];
      }
      return acc;
    },
    Promise.resolve([])
  );
  const fontFiles = [...newFontFiles, ...oldFontFiles];
  if (!newFontFiles.length) {
    logger.warning(
      `Couldn't find any font files in your ${FONTS_DIR_NAME} directory...\nAdd your local font files to your ${FONTS_DIR_NAME} directory and run cli again...`
    );
    return process.exit(0);
  }
  logger.info("Found font files...");
  console.log(
    "Font Files: ",
    newFontFiles.map((ff) => path.basename(ff))
  );

  return fontFiles;
};

export const isFileFont = (file: string) => {
  const fileExt = file.split(".").pop()?.toLowerCase();
  return FONT_FILE_EXTENSIONS.some((ext) => ext === fileExt);
};
