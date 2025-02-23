// todo: handle less common, edge file naming patterns

import { isFontFile } from "./exists";

/**
 * Returns an array of font typefaces.
 * @param {string[]} files - An array of font files(with annotations and extensions).
 * @returns {string[]} An array of font typefaces.
 * @example getTypeface(["Roboto-Medium.otf", "Inter-Regular.ttf"]) // Output: ["Roboto", "Inter"]
 */
export function getTypeface(files: string[]): string[];
/**
 * Returns the typeface name of a font file without its annotations and extensions.
 * @param {string} file - A font file.
 * @returns {string} The typeface of the font file.
 * @example getTypeface("Roboto-Medium.otf") // Output: "Roboto"
 */
export function getTypeface(file: string): string;
export function getTypeface(fileOrFiles: string | string[]): string | string[] {
  if (Array.isArray(fileOrFiles)) {
    return fileOrFiles.reduce((acc, file) => {
      if (!isFontFile(file)) return [...acc, file];
      const fileName = file.split(".")[0]?.split("-")[0] as string;
      return !acc.includes(fileName) ? [...acc, fileName] : acc;
    }, [] as string[]);
  }
  if (!isFontFile(fileOrFiles)) return fileOrFiles;
  return fileOrFiles.split(".")[0]?.split("-")[0] as string;
}
