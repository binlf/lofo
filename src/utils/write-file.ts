import {
  type ReadStream,
  type WriteStream,
  createReadStream,
  createWriteStream,
  readFileSync,
  writeFileSync,
} from "fs-extra";
import readline from "readline";

// todo: make function more generic
/**
 * Writes to a file using the `node:readline` module
 * @param {string} filePath - Path to file.
 * @param {string} content - The content to be written to the file.
 * @returns {Promise<void>} Returns a promise that resolves with `void`
 */
export const writeLines = async (filePath: string, content: string) => {
  const fileReadStream = createReadStream(filePath);
  const fileWriteStream = createWriteStream(filePath, { flags: "r+" });
  const rl = readline.createInterface({
    input: fileReadStream,
    crlfDelay: Infinity,
  });

  let lineNumber = 1;
  let prevLineContent;
  for await (const line of rl) {
    // warn: this would break if \n appears between two import statement lines
    if (lineNumber > 1 && !line.trim() && prevLineContent?.includes("import")) {
      fileWriteStream.write(content);
    } else {
      fileWriteStream.write(`${line}\n`);
    }
    prevLineContent = line;
    lineNumber++;
  }

  fileWriteStream.end();
  await new Promise((resolve, reject) =>
    fileWriteStream.on("finish", resolve).on("error", reject)
  );
  fileReadStream.close();
};

/**
 * Sets the mode for re-writing the file
 *
 * `w` - Sets re-write behavior to overwrite content of file `from` the determined chunk.
 *
 * `i` - Sets re-write behavior to overwrite content of file `at` the determined chunk.
 *
 * `p` - Sets re-write behavior to overwrite content of file `at` the last chunk.
 *
 * `i+` Sets re-write behavior to overwrite content `at` a determined chunk. If chunk doesn't exist,
 * it appends that chunk to end of file.
 */
type Flags = "w" | "i" | "p" | "i+";

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
export const reWriteFileSync = (
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

// if (flag === "w" && idx > keyChunkIndex) return "";
// if (flag === "p" && idx === chunks.length - 1) return content;
// if (Array.isArray(config.key)) {
//   if (config.key.length) {
//     const keys = config.key;
//     const key
//   }
// } else {
//   if (config.key && flag !== "p" && chunk.trim().includes(config.key)) {
//     keyChunkIndex = idx;
//     return content;
//   }
// }
