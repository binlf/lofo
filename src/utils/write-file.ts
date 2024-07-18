import { ReadStream, WriteStream, readFileSync, writeFileSync } from "fs-extra";
import readline from "readline";

// todo: make function more generic
export const writeFile = async (
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

export const reWriteFileSync = (
  path: string,
  content: string,
  options: { key: string; separator: string }
) => {
  const fileContentNodes = readFileSync(path, { encoding: "utf8" })
    .split("\n")
    .join()
    .split(";")
    .join()
    .split(options.separator);

  const updatedContentNodes = fileContentNodes.map((node) => {
    if (node.includes(options.key)) return content;
    return node;
  });
  const updatedContent = [...new Set(updatedContentNodes)].join("\n");
  writeFileSync(path, updatedContent, "utf8");

  return undefined;
};
