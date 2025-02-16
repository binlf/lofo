import path, { basename, join } from "path";
import fs from "fs-extra";
import { doesFolderExist } from "../utils/exists";
import { type Wght, getFontWeight } from "../utils/get-font-meta";
import { getLofoConfig } from "../utils/get-config";
import { getTypeface } from "../utils/get-file-names";

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

const { updateTypefaces } = getLofoConfig();

export const groupFontsByFamily = (
  fontFilePaths: string[],
  fontsDirPath: string
) => {
  const fontFamilies: FontFamily[] = [];
  const fontFileNames = getTypeface(
    fontFilePaths.map((file) => path.basename(file))
  );

  fontFileNames.forEach((fileName) => {
    let fontFamilyDirPath = join(fontsDirPath, fileName);
    const filesToMove = fontFilePaths.filter((fontFile) => {
      const typeface = getTypeface(path.basename(fontFile));
      return typeface === fileName;
    });

    // skip grouping if font files are not more than 1
    if (filesToMove.length < 2) {
      const fontFamily = getFontMeta(filesToMove[0] || "");
      fontFamilies.push({ familyName: fileName, fonts: [fontFamily] });
      return;
    }

    // create family directory
    if (!doesFolderExist(fontFamilyDirPath)) {
      fontFamilyDirPath = fs.mkdirSync(fontFamilyDirPath, {
        recursive: true,
      }) as string;
    }

    // group font files -- move files into family directory
    const movedFilePaths: string[] = [];
    filesToMove.forEach((filePath) => {
      const movedFilePath = path.join(
        fontFamilyDirPath,
        path.basename(filePath)
      );
      movedFilePaths.push(movedFilePath);
      fs.moveSync(filePath, movedFilePath);
    });
    const fonts = movedFilePaths.map(getFontMeta);
    const family: FontFamily = {
      familyName: fileName,
      fonts: [...fonts],
    };
    fontFamilies.push(family);
  });

  updateTypefaces((fonts) => {
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
