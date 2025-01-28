import { FONTS_DIR_NAME } from "../constants";
import {
  doesFileExist,
  doesFolderExist,
  isFontFamilyDir,
  isFontFile,
} from "../utils/exists";
import { getLofoConfig } from "../utils/get-config";
import { logger } from "../utils/logger";
import fs from "fs-extra";
import path from "path";

/**
 * Returns an array of font file paths in a given directory.
 * @param {string} fontsDirPath - Path to directory containing font files.
 * @returns {Promise<string[]>} Returns a promise that resolves with an array of font file paths.
 */
export const getFontFiles = async (fontsDirPath: string) => {
  const { fonts } = getLofoConfig();
  const itemsInFontsDir = fs.readdirSync(fontsDirPath);
  if (!itemsInFontsDir.length) {
    logger.warning(
      `Couldn't find any files, add your font files to your ${FONTS_DIR_NAME} directory and try again...`
    );

    return process.exit(0);
  }

  const fontFilePaths = itemsInFontsDir
    .reduce((acc, item, index) => {
      const itemPath = path.join(fontsDirPath, item);
      if (doesFileExist(itemPath)) {
        if (isFontFile(item)) return [...acc, itemPath];
      }

      if (doesFolderExist(itemPath)) {
        const dirName = item;
        if (fonts?.typefaces.includes(dirName)) {
          if (isFontFamilyDir(itemPath)) {
            const fontFiles = fs.readdirSync(itemPath);
            return [
              ...acc,
              ...fontFiles.map((fontFile) =>
                path.join(fontsDirPath, dirName, fontFile)
              ),
            ];
          }
        }
      }

      return acc;
    }, [] as string[])
    .sort((filePath, nextFilePath) => {
      const [timestamp, nextTimestamp] = [
        fs.statSync(filePath).birthtimeMs,
        fs.statSync(nextFilePath).birthtimeMs,
      ];
      return timestamp - nextTimestamp;
    });

  return fontFilePaths;
};
