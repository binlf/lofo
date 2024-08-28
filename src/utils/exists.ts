import fs from "fs";
import { FONT_FILE_EXTENSIONS } from "../constants";

export const folderExists = (folderPath: string) => {
  return fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory();
};

export const fileExists = (filePath: string) => {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
};

export const isFileFont = (file: string) => {
  const fileExt = file.split(".").pop()?.toLowerCase();
  return FONT_FILE_EXTENSIONS.some((ext) => ext === fileExt);
};
