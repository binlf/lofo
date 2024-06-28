import { renameSync } from "fs";
import { basename } from "path";

type Source = string | string[];

export const moveFile = (
  src: Source,
  dest: string,
  callbackFn?: (err: unknown, movedFilePaths: string[]) => void
) => {
  const isArrayOfFiles = Array.isArray(src);
  const movedFilesPaths: string[] = [];
  try {
    if (isArrayOfFiles) {
      src.forEach((file) => {
        const newFileName = `${dest}/${basename(file)}`;
        renameSync(file, newFileName);
        movedFilesPaths.push(newFileName);
      });
      callbackFn && callbackFn(undefined, movedFilesPaths);
      return movedFilesPaths;
    } else {
      renameSync(src as string, `${dest}/${basename(src)}`);
      movedFilesPaths.push(`${dest}/${basename(src)}`);
      callbackFn && callbackFn(undefined, movedFilesPaths);
      return movedFilesPaths;
    }
  } catch (error) {
    console.error(error);
    callbackFn && callbackFn(error, movedFilesPaths);
    return movedFilesPaths;
  }
};
