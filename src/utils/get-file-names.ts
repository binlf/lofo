/**
 * Returns an array of font file names without their annotations and extensions.
 * @param {string[]} files - An array of font file names(with annotations and extensions).
 * @returns {string[]} An array of font file names.
 * @example getFontFileNames(["Roboto-Medium.otf", "Inter-Regular.ttf"]) // Output: ["Roboto", "Inter"]
 */
// todo: handle less common, edge file naming patterns
export const getFontFileNames = (files: string[]) => {
  return files.reduce((acc, file) => {
    const fileName = file.split(".")[0]?.split("-")[0] as string;
    return !acc.includes(fileName) ? [...acc, fileName] : acc;
  }, [] as string[]);
};
