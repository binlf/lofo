// todo: handle less common, edge file naming patterns
export const getFileNames = (files: string[]) => {
  return files.reduce((acc, file) => {
    const fileName = file.split(".")[0]?.split("-")[0] as string;
    return !acc.includes(fileName) ? [...acc, fileName] : acc;
  }, [] as string[]);
};

// deprecated impl.
export const getFileNamesDep = (files: string[]) => {
  return files.reduce((acc, file) => {
    const fileName = file.split(".")[0]?.split("-")[0] as string;
    if (!acc.includes(fileName)) {
      acc.push(fileName);
    }
    return acc;
  }, [] as string[]);
};
