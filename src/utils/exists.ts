import fs from "fs";

export const folderExists = (folderPath: string) => {
  return fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory();
};

export const fileExists = (filePath: string) => {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
};
