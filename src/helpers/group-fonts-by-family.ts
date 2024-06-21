import path from "path";
import fs from "fs";
import { getFileNames } from "../utils/get-file-names";
import { logger } from "../utils/logger";
import { folderExists } from "../utils/exists";
import { moveFile } from "../utils/move-file";

export const groupFontsByFamily = (
  fontFiles: string[],
  fontsDirPath: string
) => {
  logger.info("Grouping font files into families...");
  getFileNames(fontFiles).forEach((fileName) => {
    const fontFamilyFolderPath = path.join(fontsDirPath, `/${fileName}`);
    const filesToMove = fontFiles
      .filter((fontFile) => {
        return getFileNames([fontFile])[0] === fileName;
      })
      .map((file) => `${fontsDirPath}/${file}`);
    if (!folderExists(fontFamilyFolderPath)) {
      const createdDirPath = fs.mkdirSync(fontFamilyFolderPath, {
        recursive: true,
      });
      return moveFile(filesToMove, createdDirPath as string);
    }
    return moveFile(filesToMove, fontFamilyFolderPath);
  });
  logger.info("Grouped fonts into families...");
};
