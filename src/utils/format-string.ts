type Config = {
  [pattern: string]: string;
};
/**
 * Replaces all patterns found in config with corresponding replacements.
 *
 * @param {string} str - The string to be operated on.
 * @param {Config} config - A configuration object for setting the patterns and their corresponding replacements.
 * @returns {string} The formatted string.
 */
// todo: support RegEx keys
export const replaceAll = (
  str: string,
  config: { [pattern: string]: string }
): string => {
  let newString = "";
  Object.entries(config).forEach(([key, val]) => {
    newString = newString
      ? newString.replaceAll(key, val)
      : str.replaceAll(key, val);
  });
  return newString;
};