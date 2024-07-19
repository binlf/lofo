import {
  type ReadStream,
  type WriteStream,
  readFileSync,
  writeFileSync,
} from "fs-extra";
import readline from "readline";

/**
 * Writes to a file using the `node:readline` module
 *
 * @param {ReadStream} rs - A readable stream for the file.
 * @param {WriteStream} ws - A writeable stream for the file.
 * @param {string} content - The content to be written to the file.
 * @returns {Promise<void>} Returns a promise that resolves with `void`
 */
// todo: make function more generic
export const writeLines = async (
  rs: ReadStream,
  ws: WriteStream,
  content: string
) => {
  const rl = readline.createInterface({
    input: rs,
    crlfDelay: Infinity,
  });

  let lineNumber = 1;
  let prevLineContent;
  for await (const line of rl) {
    // warn: this would break if \n appears between two import statement lines
    if (lineNumber > 1 && !line.trim() && prevLineContent?.includes("import")) {
      ws.write(content);
    } else {
      ws.write(`${line}\n`);
    }
    prevLineContent = line;
    lineNumber++;
  }

  ws.end();
  await new Promise((resolve, reject) =>
    ws.on("finish", resolve).on("error", reject)
  );
  rs.close();
};

/**
 * Re-writes the contents of a file while inserting `content` at a determined node.
 *
 * @param {string} path - Path to file.
 * @param {string} content - The content to be inserted at the determined node.
 * @param {string} config - The configuration for the `key`[the node to be overwritten] and
 * the `separator`[the pattern describing how to split file into nodes].
 * @returns {undefined} Returns `undefined`
 */
export const reWriteFileSync = (
  path: string,
  content: string,
  config: { key: string; separator: string }
) => {
  const token = "lofo";
  const fileContentNodes = readFileSync(path, { encoding: "utf8" })
    .replaceAll(config.separator, token + ` ${config.separator}`)
    .split(token);

  // console.log(fileContentNodes);

  const updatedContentNodes = fileContentNodes.map((node) => {
    if (node.trim().startsWith(config.key)) return content;
    return node;
  });

  // console.log("Updated Nodes: ", updatedContentNodes);
  const updatedContent = Array.from(new Set(updatedContentNodes)).join("\n");
  writeFileSync(path, updatedContent, "utf8");

  return undefined;
};
