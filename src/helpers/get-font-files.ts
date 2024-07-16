import { FONTS_DIR_NAME, FONT_FILE_EXTENSIONS } from "../constants";
import { fileExists } from "../utils/exists";
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
      const files = await fsPromises.readdir(path.join(fontsDirPath, font));
      if (files.length)
        return [...acc, ...files.filter((file) => isFileFont(file))];
      return acc;
    },
    Promise.resolve([])
  );
  const fontFiles = [...newFontFiles, ...oldFontFiles];
  // for (const file of filesInFontsDir) {
  //   const filePath = path.join(fontsDirPath, file);
  //   if (fileExists(filePath))
  //     if (isFileFont(file)) fontFiles.push([file, filePath]);
  // }
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

const isFileFont = (file: string) => {
  const fileExt = file.split(".").pop()?.toLowerCase();
  return FONT_FILE_EXTENSIONS.some((ext) => ext === fileExt);
};

// if (fileExists(path.join(fontsDirPath, `/${file}`))) {
//   if (isFileFont(file)) {
//     const [fontName] = getFontFileNames([file]);
//     if (fonts && fonts.includes(fontName!)) {
//       const fontDirPath = path.join(fontsDirPath, fontName!);
//       try {
//         const files = (await fsPromises.readdir(fontDirPath)).map((file) =>
//           path.join(fontDirPath, file)
//         );
//         return [
//           ...acc,
//           ...files.filter((file) => isFileFont(path.basename(file))),
//           path.join(fontsDirPath, file),
//         ];
//       } catch (error) {
//         logger.error("Error reading directory...");
//         console.error(error);
//         return acc;
//       }
//     }
//     return [...acc, path.join(fontsDirPath, file)];
//   }
// }
// return acc;
