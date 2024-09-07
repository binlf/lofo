import path, { basename, join } from "path";
import fs from "fs";
import { getFontFileNames } from "../utils/get-file-names";
import { logger } from "../utils/logger";
import { folderExists } from "../utils/exists";
import { moveFile } from "../utils/move-fs-items";
import { type Wght, getFontWeight } from "../utils/get-font-meta";
import { getLofoConfig } from "../utils/get-config";

export type Font = {
  name: string;
  path: string;
  style: "normal" | "italic";
  weight: Wght;
};

export type FontFamily = {
  familyName: string;
  fonts: Font[];
};

const { updateFonts } = getLofoConfig();

export const groupFontsByFamily = (
  fontFiles: string[],
  fontsDirPath: string
) => {
  logger.info("Grouping font files into families...");
  const fontFamilies: FontFamily[] = [];
  getFontFileNames(fontFiles.map((file) => path.basename(file))).forEach(
    (fileName) => {
      let fontFamilyFolderPath = join(fontsDirPath, `/${fileName}`);
      const filesToMove = fontFiles.filter((fontFile) => {
        return getFontFileNames([path.basename(fontFile)])[0] === fileName;
      });
      if (!folderExists(fontFamilyFolderPath)) {
        fontFamilyFolderPath = fs.mkdirSync(fontFamilyFolderPath, {
          recursive: true,
        }) as string;
      }
      moveFile(filesToMove, fontFamilyFolderPath, (err, movedFilePaths) => {
        if (err) process.exit(1);
        const fonts = movedFilePaths.map((filePath): Font => {
          return {
            name: basename(filePath),
            path: filePath,
            style: "normal",
            weight: getFontWeight(basename(filePath)),
          };
        });
        const family: FontFamily = {
          familyName: fileName,
          fonts: [...fonts],
        };
        fontFamilies.push(family);
      });
    }
  );
  logger.info("Grouped fonts into families...");
  updateFonts((fonts) =>
    Array.from(
      new Set([...fonts, ...fontFamilies.map((font) => font.familyName)])
    )
  );
  return fontFamilies;
};
