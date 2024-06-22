import { basename, join } from "path";
import fs from "fs";
import { getFileNames } from "../utils/get-file-names";
import { logger } from "../utils/logger";
import { folderExists } from "../utils/exists";
import { moveFile } from "../utils/move-fs-items";
import { Wght, getFontWeight } from "../utils/get-font-meta";

type Font = {
  name: string;
  path: string;
  style: "normal" | "italic";
  weight: Wght;
};

type Family = {
  familyName: string;
  fonts: Font[];
};

export const groupFontsByFamily = (
  fontFiles: string[],
  fontsDirPath: string
) => {
  logger.info("Grouping font files into families...");
  const fontFamilies: Family[] = [];
  getFileNames(fontFiles).forEach((fileName) => {
    const fontFamilyFolderPath = join(fontsDirPath, `/${fileName}`);
    const filesToMove = fontFiles
      .filter((fontFile) => {
        return getFileNames([fontFile])[0] === fileName;
      })
      .map((file) => `${fontsDirPath}/${file}`);
    if (!folderExists(fontFamilyFolderPath)) {
      const createdDirPath = fs.mkdirSync(fontFamilyFolderPath, {
        recursive: true,
      });
      const movedFiles = moveFile(filesToMove, createdDirPath as string);
      // todo: avoid code duplication[here and below]
      const fonts = movedFiles?.map((filePath) => {
        return {
          name: basename(filePath),
          path: filePath,
          style: "normal" as Font["style"],
          weight: getFontWeight(basename(filePath)),
        };
      });
      const family: Family = {
        familyName: fileName,
        fonts: [...fonts!],
      };
      return fontFamilies.push(family);
    }
    return moveFile(filesToMove, fontFamilyFolderPath);
  });
  logger.info("Grouped fonts into families...");
  return fontFamilies;
};
