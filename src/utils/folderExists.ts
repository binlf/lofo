import fs from "fs";

export const folderExists = (folderPath: string) => {
  return fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory();
};
