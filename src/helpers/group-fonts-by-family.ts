import path, { basename, join } from "path";
import fs from "fs";
import { getFontFileNames } from "../utils/get-file-names";
import { logger } from "../utils/logger";
import { folderExists } from "../utils/exists";
import { moveFile } from "../utils/move-fs-items";
import { type Wght, getFontWeight } from "../utils/get-font-meta";
import { getLofoConfig } from "../utils/get-config";
import { moveSync } from "fs-extra";

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
  fontFilePaths: string[],
  fontsDirPath: string
) => {
  // logger.info("Grouping font files into families...");
  const fontFamilies: FontFamily[] = [];
  const fontFileNames = getFontFileNames(
    fontFilePaths.map((file) => path.basename(file))
  );
  fontFileNames.forEach((fileName) => {
    let fontFamilyFolderPath = join(fontsDirPath, `/${fileName}`);
    const filesToMove = fontFilePaths.filter((fontFile) => {
      const [fontFileName] = getFontFileNames([path.basename(fontFile)]);
      return fontFileName === fileName;
    });
    // skip grouping if font files are not more than 1
    if (filesToMove.length < 2) {
      const fontFamily = getFontMeta(filesToMove[0] || "");
      fontFamilies.push({ familyName: fileName, fonts: [fontFamily] });
      return;
    }

    if (!folderExists(fontFamilyFolderPath)) {
      fontFamilyFolderPath = fs.mkdirSync(fontFamilyFolderPath, {
        recursive: true,
      }) as string;
    }

    moveFile(filesToMove, fontFamilyFolderPath, (err, movedFilePaths) => {
      if (err) {
        throw new Error(err as string);
      }
      const fonts = movedFilePaths.map(getFontMeta);
      const family: FontFamily = {
        familyName: fileName,
        fonts: [...fonts],
      };
      fontFamilies.push(family);
    });
  });
  // logger.info("Grouped fonts into families...");
  updateFonts((fonts) => {
    const newFonts = fontFamilies.map((font) => font.familyName);
    if (fonts && fonts.length) {
      return Array.from(new Set([...fonts, ...newFonts]));
    }
    return newFonts;
  });
  return fontFamilies;
};

const getFontMeta = (fontFilePath: string): Font => ({
  name: basename(fontFilePath),
  path: fontFilePath,
  style: "normal",
  weight: getFontWeight(fontFilePath),
});
