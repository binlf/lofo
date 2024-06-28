import path from "path";
import { folderExists } from "./exists";

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

/**
 * Gets the type of the filesystem item.
 *
 * @param {string} itemPath - The path of the item.
 * @returns {string} - 'file' if it's a file, 'directory' if it's a directory, 'unknown' otherwise.
 */
// function getFsItemType(itemPath) {
//   try {
//       const stats = fs.statSync(itemPath);
//       if (stats.isDirectory()) {
//           return 'directory';
//       } else if (stats.isFile()) {
//           return 'file';
//       } else {
//           return 'unknown';
//       }
//   } catch (error) {
//       console.error('Error reading path:', error);
//       return 'unknown';
//   }
// }
