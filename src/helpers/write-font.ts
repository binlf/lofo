import path from "path";
import fs, { readdirSync } from "fs-extra";
import readline from "readline";
import type { Family } from "./group-fonts-by-family";
import { logger } from "../utils/logger";
import { getFontSrc } from "../utils/get-font-meta";
import {
  NEXT_LOCALFONT_UTIL_IMPORT_STATEMENT,
  LOCAL_FONT_IMPORT_STATEMENT,
  LOCAL_FONT_IMPORT_ANNOTATION,
} from "../constants";
import { fileExists, folderExists } from "../utils/exists";
// import { getLofoConfig } from "../utils/get-config";

export const writeFontImports = async (
  fontsDirPath: string,
  fontFamilies: Family[],
  importAlias?: string
) => {
  if (importAlias) logger.info(`Found project import alias: ${importAlias}`);
  logger.info("Writing font exports...");
  const indexFilePath = path.join(fontsDirPath, "index.ts");
  const content = `${NEXT_LOCALFONT_UTIL_IMPORT_STATEMENT}\n\n${generateFileContent(
    fontFamilies,
    fontsDirPath
  )}`;
  fs.outputFileSync(indexFilePath, content, { flag: "a" });
  logger.info("Finished writing font exports");
  // warn: this breaks if fonstDirPath is initially in "public"
  // warn: also breaks on successive attempts to add fonts
  fs.moveSync(fontsDirPath, `./public/fonts`);
  logger.info("Importing fonts in layout file...");
  const srcDir = path.join(process.cwd(), "/src");
  const appDirPath = folderExists(srcDir)
    ? path.join(srcDir, "/app")
    : path.join(process.cwd(), "/app");

  const [layoutFile] = readdirSync(appDirPath, { recursive: true }).filter(
    (item) =>
      fileExists(path.join(appDirPath, item as string)) &&
      item.includes("layout")
  ) as string[];
  if (!layoutFile) {
    logger.warning(
      "Couldn't find your root layout file...Make sure you're on Next.js version 13 or later and also using the app router!"
    );
    return process.exit(1);
  }
  const layoutFilePath = path.join(appDirPath, layoutFile);
  await writeImportStatement(layoutFilePath).catch((err) => logger.error(err));
  logger.info("Finished writing font imports...");
};

const generateFileContent = (ff: Family[], fontsDirPath: string) => {
  const familiesExportsArr = ff.map((family) => {
    return (
      `
    export const ${family.familyName} = localfont({
      \tsrc: ${getFontSrc(family.fonts, fontsDirPath)},
      \tdisplay: "swap",
    })
    `.trim() + "\n"
    );
  });

  return `${familiesExportsArr.join("\n")}\nexport default {
    ${ff.map((f) => f.familyName).join(",\n")}
  }`;
};

const writeImportStatement = async (filePath: string) => {
  // const { reachedSuccess } = getLofoConfig();
  // todo: check if user is merely updating import path[has run lofo prior]
  // todo: if so, write import statement without additional comment
  // todo: check for name of first dir in fonts dir...
  // todo: ...and use that for named export example
  const importStatement =
    LOCAL_FONT_IMPORT_STATEMENT + LOCAL_FONT_IMPORT_ANNOTATION;
  const fileReadStream = fs.createReadStream(filePath);
  const fileWriteStream = fs.createWriteStream(filePath, { flags: "r+" });

  // todo: create util for writing to file in case of incremental updates
  // todo: should probably accept streams
  const rl = readline.createInterface({
    input: fileReadStream,
    crlfDelay: Infinity,
  });

  let lineNumber = 1;
  let lineContent;
  for await (const line of rl) {
    // warn: this would break if \n appears between two import statement lines
    if (lineNumber > 1 && !line.trim() && lineContent?.includes("import")) {
      fileWriteStream.write(importStatement);
    } else {
      fileWriteStream.write(`${line}\n`);
    }
    lineContent = line;
    lineNumber++;
  }

  fileWriteStream.end();
  await new Promise((resolve, reject) =>
    fileWriteStream.on("finish", resolve).on("error", reject)
  );
  fileReadStream.close();
};
