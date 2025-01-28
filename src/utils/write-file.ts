import {
  createReadStream,
  createWriteStream,
  readFileSync,
  writeFileSync,
} from "fs-extra";
import { once } from "events";
import readline from "readline";

/**
 * Write a line to a file based on the result of `predicate`.
 *
 * @param {string} path - The path to the file.
 * @param {string} content - The content to write to file.
 * @param {(prevLine: string, currentLine: string, nextLine: string) => boolean} predicate - Evaluates to a boolean value which results
 * in `content` being written or not.
 * @returns {Promise<void>} Returns a promise that resolves with `void`.
 * @example
 * await writeLineBy('/path/to/file.txt', 'New content', (_, currentLine) => typeof(currentLine) === "string"); // Writes to every line in file.
 */

export const writeLineBy = async (
  path: string,
  content: string,
  predicate: (
    prevLine: string,
    currentLine: string,
    nextLine: string
  ) => boolean
) => {
  const fileReadStream = createReadStream(path);
  const fileWriteStream = createWriteStream(path, { flags: "r+" });
  const rl = readline.createInterface({
    input: fileReadStream,
    crlfDelay: Infinity,
  });

  let previousLine: string,
    nextLine: string,
    lineNumber = 1;
  rl.on("line", (line) => {
    if (predicate(previousLine, line, nextLine!)) {
      fileWriteStream.write(content);
    } else {
      // todo: remove string concat
      fileWriteStream.write(line + "\r\n");
    }
    previousLine = line;
    lineNumber++;
  });

  await once(rl, "close");
  fileWriteStream.end();
};

/**
 * Synchronously rewrites the content of a file while modifying content of file at matched chunk(s)
 *
 * @param {string} path - The path to the file to be rewritten.
 * @param {string} content - The new content to write into the file. It will be used to match the chunk to be rewritten and if no chunk(s) is matched it will be appended to the file.
 * @param {string} separator - The pattern describing how to split file content and new `content` into chunks. Default is LF(`'\n'`).
 * @param {boolean} shouldRemoveChunk - A boolean flag that determines whether the determined chunk should be removed.
 * @returns {undefined} Returns `undefined`
 * @example
 * reWriteFileSync('/path/to/file.txt', 'New content', ", ");
 */
export const reWriteFileSync = (
  path: string,
  content: string,
  separator: string = "\n",
  shouldRemoveChunk: boolean = false
): undefined => {
  const fileContent = readFileSync(path, { encoding: "utf8" });
  const fileContentChunks = getChunks(fileContent, separator, true);
  const newContentChunks = getChunks(content, separator, true);

  function getChunks(content: string, sep: string, normalize?: boolean) {
    const token = "lofo";
    const chunks = normalize ? content.replaceAll("\n", "LF") : content;
    return chunks.replaceAll(sep, token + sep).split(token);
  }

  function compareChunks(...chunks: string[]) {
    let union;
    const intersection = [];
    const tokensArray = chunks.reduce<string[][]>((acc, chunk) => {
      const tokens = chunk.split(" ", 4);
      return [...acc, tokens];
    }, []);
    union = Array.from(
      // remove empty strings
      new Set(tokensArray.flat().filter((token) => Boolean(token)))
    );
    let sampleTokens = tokensArray[0] as string[];
    for (let index = 0; index < sampleTokens.length; index++) {
      const sampleToken = sampleTokens[index] as string;
      for (let j = 1; j < tokensArray.length; j++) {
        const restTokens = tokensArray[j];
        if (
          sampleToken &&
          sampleToken !== "LF" &&
          restTokens?.includes(sampleToken)
        )
          intersection.push(sampleToken);
      }
    }
    const simIndex = !intersection.length
      ? 0
      : intersection.length / union.length;
    return Number(simIndex.toFixed(1));
  }

  // todo: if chunk of chunks doesn't include "separator", ignore it
  function getUpdatedChunks() {
    const foundChunkIndexes: number[] = [];
    const updatedContentChunks = fileContentChunks.map((oldChunk) => {
      let updatedChunk = "";
      const THRESHOLD = 0.7;
      let index = 0;
      for (const chunk of newContentChunks) {
        // if (!oldChunk.includes(separator)) continue;
        const similarityIndex = compareChunks(chunk, oldChunk);
        if (similarityIndex && similarityIndex > THRESHOLD) {
          if (shouldRemoveChunk) {
            foundChunkIndexes.push(index);
            return updatedChunk;
          }
          updatedChunk = chunk;
          foundChunkIndexes.push(index);
          break;
        }
        index++;
      }
      return (updatedChunk || oldChunk).replaceAll("LF", "\n");
    });
    const restContent = newContentChunks
      .filter((_, idx) => !foundChunkIndexes.includes(idx))
      .join("")
      .replaceAll("LF", "\n");
    if (restContent) {
      const restUpdatedContentChunks = [...updatedContentChunks];
      restUpdatedContentChunks.splice(
        updatedContentChunks.length - 1,
        0,
        restContent
      );
      return restUpdatedContentChunks;
    }
    return updatedContentChunks;
  }

  const updatedContent = Array.from(new Set(getUpdatedChunks())).join("");
  writeFileSync(path, updatedContent, "utf8");

  return undefined;
};
