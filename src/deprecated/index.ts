import path from "path";
import { folderExists } from "../utils/exists";
import { readFileSync, writeFileSync } from "fs-extra";

// ** GET FILE SYSTEM ITEM

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

// ** GET FILE NAMES
export const getFileNamesDep = (files: string[]) => {
  return files.reduce((acc, file) => {
    const fileName = file.split(".")[0]?.split("-")[0] as string;
    if (!acc.includes(fileName)) {
      acc.push(fileName);
    }
    return acc;
  }, [] as string[]);
};

// ** RE-WRITE FILE **

/**
 * Sets the mode for re-writing the file
 *
 * `w` - Sets re-write behavior to overwrite content of file `from` the determined chunk.
 *
 * `i` - Sets re-write behavior to overwrite content of file `at` the determined chunk.
 *
 * `p` - Sets re-write behavior to overwrite content of file `at` the last chunk.
 *
 * `i+` - Sets re-write behavior to overwrite content of file `at` a determined chunk. If chunk doesn't exist,
 * it appends that chunk to end of file.
 *
 * `m` - Sets re-write behavior to overwrite content of file `at` chunks that are determined to be isomorphic to the incoming chunks.
 *
 * `m+` - Sets re-write behavior to overwrite content of file `at` chunks that are determined to be isomorphic to the incoming chunks.
 * If not, overwite last chunk with incoming chunks.
 */
type Flags = "w" | "i" | "p" | "i+" | "m" | "m+";

/**
 * Synchronously rewrites the content of a file while inserting new `content` at a determined chunk.
 *
 * @param {string} path - The path to the file that will be rewritten.
 * @param {string} content - The new content to write into the file.
 * @param {Object} config - Configuration options for re-writing the file.
 * @param {string} config.key - A key that describes how to determine the chunk to overwrite.
 * @param {string} config.separator - The pattern describing how to split file content into chunks.
 * @param {Flags} [config.flag] - Optional flag that modifies the behavior of the re-write operation.
 *
 * @returns {undefined} Returns `undefined`
 * @example
 * reWriteFileSync('/path/to/file.txt', 'New content', {
 *   key: 'myKey',
 *   separator: ',',
 *   flag: 'w'
 * });
 */
export const reWriteFileSyncDep = (
  path: string,
  content: string,
  config: {
    key: string;
    separator: string;
    flag?: Flags;
  }
) => {
  const flag = config.flag ?? "w";
  const token = "lofo";
  const fileContentChunks = readFileSync(path, { encoding: "utf8" })
    .replaceAll(config.separator, token + config.separator)
    .split(token);

  let keyChunkIndex: number;
  const updatedContentChunks = fileContentChunks.map((chunk, idx, chunks) => {
    switch (flag) {
      case "w":
        if (idx > keyChunkIndex) return "";
        break;
      case "p": {
        if (idx === chunks.length - 1) return content;
        break;
      }
      case "i": {
        if (config.key && chunk.trim().includes(config.key)) {
          keyChunkIndex = idx;
          return content;
        }
        break;
      }
      default:
        return chunk;
    }

    return chunk;
  });

  const updatedContent = Array.from(new Set(updatedContentChunks)).join("\n");
  writeFileSync(path, updatedContent, "utf8");

  return undefined;
};
