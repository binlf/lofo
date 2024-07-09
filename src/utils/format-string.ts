// todo: support RegEx
export const replaceAll = (
  str: string,
  config: { [pattern: string]: string }
) => {
  let newString = "";
  Object.entries(config).forEach(([key, val]) => {
    newString = newString
      ? newString.replaceAll(key, val)
      : str.replaceAll(key, val);
  });
  return newString;
};
