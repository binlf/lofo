import {
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

/**
 * Synchronously rewrites the content of a file while inserting new `content` at a determined chunk.
 *
 * @param {string} path - The path to the file that will be rewritten.
 * @param {string} content - The new content to write into the file.
 * @param {string} separator - The pattern describing how to split file content into chunks. Default is LF("\n").
 * @param {Flags} flag - Optional flag that modifies the behavior of the re-write operation. Default is "p"(pop).
 *
 * @returns {undefined} Returns `undefined`
 * @example
 * reWriteFileSync('/path/to/file.txt', 'New content', ", ", "i");
 */
export const reWriteFileSync = (
  path: string,
  content: string,
  separator: string = "\n",
  flag: Flags = "p"
): undefined => {
  const fileContent = readFileSync(path, { encoding: "utf8" });
  const fileContentChunks = getChunks(fileContent, separator, true);
  const newContentChunks = getChunks(content, separator, true);

  console.log("File Content Chunks: ", fileContentChunks);
  console.log("New Content Chunks: ", newContentChunks);

  function getChunks(content: string, sep: string, normalize?: boolean) {
    const token = "lofo";
    const chunks = normalize ? content.replaceAll("\n", "LF") : content;
    return chunks.replaceAll(sep, token + sep).split(token);
  }

  // max: two chunks(for now). Compares by words
  function compareChunks(chunk: string, nextChunk: string) {
    const words = chunk.split(" ", 4);
    console.log("Words: ", words);
    if (words) {
      const wordRank = words.reduce<{ [word: string]: number }>((acc, word) => {
        if (
          word &&
          !word.includes("LF") &&
          word !== "export" &&
          nextChunk.includes(word)
        ) {
          const wordCount = nextChunk.split(word).length - 1;
          return { ...acc, [word]: wordCount };
        }
        return acc;
      }, {});
      let popWord = "";
      for (const [word, count] of Object.entries(wordRank)) {
        if (popWord && count > wordRank[popWord]!) {
          return (popWord = word);
        }
        if (!popWord) popWord = word;
      }
      return popWord;
    }
    return undefined;
  }

  const updatedContentChunks = fileContentChunks.map((oldChunk, idx) => {
    let updatedChunk = "";
    for (const chunk of newContentChunks) {
      console.log("New Chunk: ", chunk);
      console.log("Old Chunk: ", oldChunk);
      const commonWord = compareChunks(chunk, oldChunk);
      console.log("Common Word: ", commonWord);
      if (commonWord && commonWord !== "const") {
        if (chunk.includes(commonWord)) {
          console.log("Should rewrite");
          // updatedChunk = chunk;
        }
      }
      updatedChunk = oldChunk;
    }
    return updatedChunk.replaceAll("LF", "\n");
  });
  // const updatedContent = Array.from(new Set(updatedContentChunks)).join(" ");
  // writeFileSync(path, updatedContent, "utf8");

  return undefined;
};
