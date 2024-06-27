import { renameSync } from "fs";
import { basename } from "path";

type Source = string | string[];

export const moveFile = (
  source: Source,
  dest: string,
  callbackFn?: (err: unknown, movedFilePaths: string[]) => void
) => {
  const isArrayOfFiles = Array.isArray(source);
  const movedFilesPaths: string[] = [];
  try {
    if (isArrayOfFiles) {
      source.forEach((file) => {
        const newFileName = `${dest}/${basename(file)}`;
        renameSync(file, newFileName);
        movedFilesPaths.push(newFileName);
      });
      callbackFn && callbackFn(undefined, movedFilesPaths);
      return movedFilesPaths;
    } else {
      renameSync(source as string, `${dest}/${basename(source)}`);
      movedFilesPaths.push(`${dest}/${basename(source)}`);
      callbackFn && callbackFn(undefined, movedFilesPaths);
      return movedFilesPaths;
    }
  } catch (error) {
    console.error(error);
    callbackFn && callbackFn(error, movedFilesPaths);
    return movedFilesPaths;
  }
};
