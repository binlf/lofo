import path from "path";
import fs, { readdirSync } from "fs-extra";
import readline from "readline";
import type { Family } from "./group-fonts-by-family";
import { logger } from "../utils/logger";
import { getFontSrc } from "../utils/get-font-meta";
import {
  NEXT_LOCALFONT_UTIL_IMPORT_STATEMENT,
  LOCAL_FONT_IMPORT_ANNOTATION,
} from "../constants";
import { fileExists, folderExists } from "../utils/exists";
import { getLofoConfig } from "../utils/get-config";

export const writeFontImports = async (
  fontsDirPath: string,
  fontFamilies: Family[],
  importAlias?: string
) => {
  if (importAlias) logger.info(`Found  project import alias: ${importAlias}`);
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
  // fs.moveSync(fontsDirPath, `./public/fonts`);
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
  const namedExport = fs
    .readdirSync(fontsDirPath)
    .filter((fsItem) => folderExists(path.join(fontsDirPath, fsItem)))[0];
  await writeImportStatement(
    layoutFilePath,
    fontsDirPath,
    namedExport!,
    importAlias
  ).catch((err) => logger.error(err));
  logger.info("Finished writing font imports...");
};

const generateFileContent = (ff: Family[], fontsDirPath: string) => {
  const familiesExportArr = ff.map((family) => {
    return (
      `
    export const ${family.familyName} = localfont({
      \tsrc: ${getFontSrc(family.fonts, fontsDirPath)},
      \tdisplay: "swap",
    })
    `.trim() + "\n"
    );
  });

  // todo: on successive attempts to add font, append new font to default export object
  return `${familiesExportArr.join("\n")}\nexport default {
    ${ff.map((f) => f.familyName).join(",\n")}
  }`;
};

const writeImportStatement = async (
  filePath: string,
  fontsDirPath: string,
  namedExport: string,
  alias?: string
) => {
  const importPath = alias
    ? path.resolve(process.cwd(), fontsDirPath)
    : path.relative(filePath, fontsDirPath);
  const importStatement = getImportStatement(namedExport, importPath, alias);
  const fileReadStream = fs.createReadStream(filePath);
  const fileWriteStream = fs.createWriteStream(filePath, { flags: "r+" });

  // todo: create util for writing to file to properly handle the case of incremental updates
  // todo: to same file. should probably accept streams
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

const getImportStatement = (
  namedExport: string,
  importPath: string,
  alias?: string
) => {
  const { reachedSuccess } = getLofoConfig();
  // todo: check if user is merely updating import path[has run lofo prior]
  // todo: if so, write import statement without additional comment
  // todo: check for name of first dir in fonts dir...
  // todo: ...and use that for named export example
  // const formattedImportPath = alias
  //   ? (alias + importPath.replaceAll(/\\/g, "/")).replaceAll("*", "")
  //   : importPath;
  const formattedImportPath = alias
    ? importPath
        .replaceAll(process.cwd(), alias)
        .replaceAll("*", "")
        .replaceAll(/\\/g, "/")
        .replaceAll("//", "/")
    : importPath;
  return `import localfonts, { ${namedExport} } from "${formattedImportPath}"\n${
    !reachedSuccess() ? LOCAL_FONT_IMPORT_ANNOTATION : ""
  }`;
};
