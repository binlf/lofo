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
 * `W` - Sets re-write mode to overwrite contents of file `from` a determined node.
 *
 * `I` - Sets re-write mode to overwrite contents of file `at` a determined node.
 */
type Flags = "W" | "I";
/**
 * Re-writes the contents of a file while inserting `content` at a determined node.
 *
 * @param {string} path - Path to file.
 * @param {string} content - The content to be inserted at the determined node.
 * @param {{ key: string; separator: string; flag?: Flags }} config -
 * The configuration for the `key`[describes how to determine the node to overwrite] and
 * the `separator`[the pattern describing how to split file content into nodes] and `flag`[sets the mode for re-write]
 * @returns {undefined} Returns `undefined`
 */
export const reWriteFileSync = (
  path: string,
  content: string,
  config: { key: string; separator: string; flag?: Flags }
) => {
  const flag = config.flag ?? "W";
  const token = "lofo";
  const fileContentNodes = readFileSync(path, { encoding: "utf8" })
    .replaceAll(config.separator, token + config.separator)
    .split(token);

  let keyNodeIndex: number;
  const updatedContentNodes = fileContentNodes.map((node, idx) => {
    if (flag === "W" && idx > keyNodeIndex) return "";
    if (node.trim().includes(config.key)) {
      keyNodeIndex = idx;
      return content;
    }
    return node;
  });

  const updatedContent = Array.from(new Set(updatedContentNodes)).join("\n");
  writeFileSync(path, updatedContent, "utf8");

  return undefined;
};
