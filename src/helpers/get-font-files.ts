import { FONTS_DIR_NAME } from "../constants";
import { doesFileExist, isFontFile } from "../utils/exists";
import { logger } from "../utils/logger";
import fs from "fs-extra";
import path from "path";

/**
 * Returns an array of font file paths in a given directory.
 * @param {string} fontsDirPath - Path to directory containing font files.
 * @param {Object} [options] - Optional configuration object.
 * @param {boolean} [options.sort] - Whether to sort files by creation time.
 * @returns {string[]} Returns an array of font file paths.
 * @example
 * ```typescript
 * const fontFiles = getFontFiles('./fonts', { sort: true });
 * // Returns: ['/fonts/Arial.ttf', '/fonts/Roboto.ttf']
 * ```
 */
export const getFontFiles = (
  fontsDirPath: string,
  options?: {
    sort?: boolean;
  }
) => {
  const itemsInFontsDir = fs.readdirSync(fontsDirPath, {
    recursive: true,
    encoding: "utf-8",
  });

  if (!itemsInFontsDir.length) {
    logger.warning(
      `Couldn't find any files, add your font files to your ${FONTS_DIR_NAME} directory and try again...`
    );

    return process.exit(0);
  }

  const fontFilePaths = itemsInFontsDir
    .filter((item) => {
      const itemPath = path.join(fontsDirPath, item);
      return doesFileExist(itemPath) && isFontFile(item);
    })
    .map((fontFile) => path.join(fontsDirPath, fontFile));

  if (options?.sort) {
    return fontFilePaths.sort((filePath, nextFilePath) => {
      const [timestamp, nextTimestamp] = [
        fs.statSync(filePath).birthtimeMs,
        fs.statSync(nextFilePath).birthtimeMs,
      ];
      return timestamp - nextTimestamp;
    });
  }

  return fontFilePaths;
};
