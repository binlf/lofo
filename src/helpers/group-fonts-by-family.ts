import path, { basename, join } from "path";
import fs from "fs-extra";
import { doesFolderExist } from "../utils/exists";
import { type Wght, getFontWeight } from "../utils/get-font-meta";
import { getLofoConfig } from "../utils/get-config";
import { getTypeface } from "../utils/get-file-names";
import { logger } from "../utils/logger";

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
    const fontFamilyDirPath = path.join(fontsDirPath, fileName);
    // get all font file paths that match the current `fileName`
    const fontFilesInFamily = fontFilePaths.filter(
      (fontFilePath) => getTypeface(path.basename(fontFilePath)) === fileName
    );
    const ungroupedFiles = fontFilesInFamily.filter((fontFilePath) => {
      const dirName = path.basename(path.dirname(fontFilePath));
      return dirName !== fileName;
    });

    // group files if ungrouped files are more than one and there's no existing group for them
    if (
      ungroupedFiles.length &&
      ungroupedFiles.length > 1 &&
      !fs.pathExistsSync(fontFamilyDirPath)
    )
      return fontFamilies.push({
        familyName: fileName,
        fonts: [
          ...groupFontFiles(fontsDirPath, ungroupedFiles).map(getFontMeta),
        ],
      });

    // group files (and merge) if ungrouped file(s) is not part of its already exisiting group
    if (ungroupedFiles.length && fs.pathExistsSync(fontFamilyDirPath)) {
      const allGroupedFiles = [
        ...groupFontFiles(fontsDirPath, ungroupedFiles),
        ...fontFilesInFamily.filter(
          (fontFile) => !ungroupedFiles.includes(fontFile)
        ),
      ];

      return fontFamilies.push({
        familyName: fileName,
        fonts: allGroupedFiles.map(getFontMeta),
      });
    }

    // if there's no more than one file and it's not part of an already existing group
    return fontFamilies.push({
      familyName: fileName,
      fonts: [...fontFilesInFamily.map(getFontMeta)],
    });

    // skip grouping if font files are not more than 1
    // if (ungroupedFiles.length < 2) {
    //   const fontFamily = getFontMeta(ungroupedFiles[0] || "");
    //   fontFamilies.push({ familyName: fileName, fonts: [fontFamily] });
    //   return;
    // }

    // create family directory
    // if (!doesFolderExist(fontFamilyDirPath)) {
    //   fontFamilyDirPath = fs.mkdirSync(fontFamilyDirPath, {
    //     recursive: true,
    //   }) as string;
    // }

    // group font files -- move files into family directory
    // const movedFilePaths: string[] = [];
    // ungroupedFiles.forEach((filePath) => {
    //   const movedFilePath = path.join(
    //     fontFamilyDirPath,
    //     path.basename(filePath)
    //   );
    //   movedFilePaths.push(movedFilePath);
    //   fs.moveSync(filePath, movedFilePath);
    // });
    // const fonts = groupedFilePaths.map(getFontMeta);
    // const family: FontFamily = {
    //   familyName: fileName,
    //   fonts: [...fonts],
    // };
    // fontFamilies.push(family);
  });

  // update typefaces in config
  updateTypefaces((fonts) => {
    const newFonts = fontFamilies.map((font) => font.familyName);
    if (fonts && fonts.length) {
      return Array.from(new Set([...fonts, ...newFonts]));
    }
    return newFonts;
  });
  return fontFamilies;
};

// extract metadata and construct Font object
const getFontMeta = (fontFilePath: string): Font => ({
  name: basename(fontFilePath),
  path: fontFilePath,
  style: "normal",
  weight: getFontWeight(fontFilePath),
});

// create directory for font files and move them into the directory
const groupFontFiles = (fontsDirPath: string, filePaths: string[]) => {
  if (!filePaths[0]) throw new Error("No files to group");

  const dirName = getTypeface(path.basename(filePaths[0]));
  const dirPath = path.join(fontsDirPath, dirName);

  if (!doesFolderExist(dirPath)) fs.mkdirSync(dirPath);

  // directory is guaranteed to be created at this point, if not it'd have failed
  return filePaths.map((filePath) => {
    const fileName = path.basename(filePath);
    const destFilePath = path.join(dirPath, fileName);
    fs.moveSync(filePath, destFilePath);
    return destFilePath;
  });
};
