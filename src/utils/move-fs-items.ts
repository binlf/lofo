import { renameSync } from "fs";
import { basename } from "path";

type Source = string | string[];

export const moveFile = (source: Source, dest: string) => {
  const isArrayOfFiles = Array.isArray(source);
  const movedFilesPaths: string[] = [];
  try {
    if (isArrayOfFiles) {
      source.forEach((file) => {
        const newFileName = `${dest}/${basename(file)}`;
        renameSync(file, newFileName);
        movedFilesPaths.push(newFileName);
      });
      return movedFilesPaths;
    } else {
      renameSync(source as string, `${dest}/${basename(source)}`);
      movedFilesPaths.push(`${dest}/${basename(source)}`);
      return movedFilesPaths;
    }
  } catch (error) {
    console.error(error);
  }
};

export const moveFolder = () => {
  console.log("Moving Folder");
};
