import path from "path";
import { FONTS_DIR_NAME, FONT_DIRS_TO_CHECK } from "../constants";
import { doesFolderExist } from "../utils/exists";

const CURRENT_DIR = process.cwd();

export const getFontsDir = () => {
  const dirPathInCurrDir = path.join(CURRENT_DIR, FONTS_DIR_NAME);
  let fontsDirPath = "";
  let dirFound = false;

  if (doesFolderExist(dirPathInCurrDir)) {
    dirFound = true;
    fontsDirPath = dirPathInCurrDir;
  } else {
    let index = 0;
    while (index < FONT_DIRS_TO_CHECK.length) {
      const dir = FONT_DIRS_TO_CHECK[index];
      const dirPathInSubDir = path.join(
        CURRENT_DIR,
        dir as string,
        FONTS_DIR_NAME
      );
      fontsDirPath = dirPathInSubDir;
      if (doesFolderExist(fontsDirPath)) {
        dirFound = true;
        break;
      }
      index++;
    }
    if (!dirFound) fontsDirPath = "";
  }
  return fontsDirPath;
};
