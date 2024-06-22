import { FONTS_DIR_NAME, FONT_FILE_EXTENSIONS } from "../constants";
import { fileExists } from "../utils/exists";
import { logger } from "../utils/logger";
import fsPromises from "fs/promises";
import path from "path";

export const getFontFiles = async (fontsDirPath: string) => {
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
      const isFileFont = FONT_FILE_EXTENSIONS.some((ext) => ext === fileExt);
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
