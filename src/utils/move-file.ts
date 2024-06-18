import { renameSync } from "fs";
import { basename } from "path";

type Source = string | string[];

export const moveFile = (source: Source, dest: string) => {
  const isArrayOfFiles = Array.isArray(source);
  try {
    if (isArrayOfFiles) {
      source.forEach((file) => {
        renameSync(file, `${dest}/${basename(file)}`);
      });
    } else renameSync(source as string, `${dest}/${basename(source)}`);
  } catch (error) {
    console.error(error);
  }
};
