import path from "path";
import { folderExists } from "../utils/exists";

/**
 * Retrieves a filesystem item from specified locations.
 *
 * @param {string} item - The name of the filesystem item to retrieve.
 * @param {string[]} [locations] - An optional array of locations to search for the item.
 * @returns {any} The filesystem item if found, otherwise an appropriate response.
 */
export const getFsItem = (item: string, locations?: string[]) => {
  const CURRENT_DIR = process.cwd();
  let itemPath = path.join(CURRENT_DIR, item);
  if (folderExists(itemPath)) {
  }
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
