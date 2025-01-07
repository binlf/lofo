/**
 * Returns an array of font file names without their annotations and extensions.
 * @param {string[]} files - An array of font file names(with annotations and extensions).
 * @returns {string[]} An array of font file names.
 * @example getFontFileNames(["Roboto-Medium.otf", "Inter-Regular.ttf"]) // Output: ["Roboto", "Inter"]
 */
// todo: handle less common, edge file naming patterns
// todo: overload this function such that it accepts a string as well
// todo: rename this function to `getTypeface()` as it just extracts the Typeface
export function getTypeface(files: string[]): string[];
export function getTypeface(file: string): string;
export function getTypeface(fileOrFiles: string | string[]): string | string[] {
  if (Array.isArray(fileOrFiles)) {
    return fileOrFiles.reduce((acc, file) => {
      const fileName = file.split(".")[0]?.split("-")[0] as string;
      return !acc.includes(fileName) ? [...acc, fileName] : acc;
    }, [] as string[]);
  }
  return fileOrFiles.split(".")[0]?.split("-")[0] as string;
}
