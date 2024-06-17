import { rename } from "fs";
import { basename } from "path";

type Source = string | string[];

export const moveFile = (source: Source, dest: string) => {
  const isArrayOfFiles = Array.isArray(source);
  if (isArrayOfFiles) {
    source.forEach((file) => {
      rename(file, `${dest}/${basename(file)}`, (err) => {
        if (err) throw err;
      });
    });
  } else
    rename(source as string, `${dest}/${basename(source)}`, (err) => {
      if (err) throw err;
    });
};
