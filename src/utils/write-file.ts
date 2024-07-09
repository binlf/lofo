import { ReadStream, WriteStream } from "fs-extra";
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
  let lineContent;
  for await (const line of rl) {
    // warn: this would break if \n appears between two import statement lines
    if (lineNumber > 1 && !line.trim() && lineContent?.includes("import")) {
      ws.write(content);
    } else {
      ws.write(`${line}\n`);
    }
    lineContent = line;
    lineNumber++;
  }

  ws.end();
  await new Promise((resolve, reject) =>
    ws.on("finish", resolve).on("error", reject)
  );
  rs.close();
};
