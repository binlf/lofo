import path from "path";
import fs, { readdirSync } from "fs-extra";
import type { FontFamily } from "./group-fonts-by-family";
import { logger } from "../utils/logger";
import { getFontSrc } from "../utils/get-font-meta";
import { NEXT_LOCALFONT_UTIL_IMPORT_STATEMENT } from "../constants";
import { fileExists, folderExists } from "../utils/exists";
import { getLofoConfig } from "../utils/get-config";
import { replaceAll } from "../utils/format-string";
import { writeLines, reWriteFileSync, writeLineBy } from "../utils/write-file";
import { isFileFont } from "./get-font-files";

const { reachedSuccess, fonts, shouldUpdateImports } = getLofoConfig();

const CURR_DIR = process.cwd();

export const writeFontImports = async (
  fontsDirPath: string,
  fontFamilies: FontFamily[],
  importAlias?: string
) => {
  if (importAlias) logger.info(`Found project import alias: ${importAlias}`);
  logger.info("Writing font exports...");
  const indexFilePath = path.join(fontsDirPath, "index.ts");
  const [content] = generateFileContent(fontFamilies, fontsDirPath);
  !reachedSuccess
    ? fs.outputFileSync(indexFilePath, content)
    : reWriteFileSync(indexFilePath, content, "export");
  logger.info("Finished writing font exports");
  const srcDir = path.join(CURR_DIR, "/src");
  const appDirPath = folderExists(srcDir)
    ? path.join(srcDir, "/app")
    : path.join(CURR_DIR, "/app");

  try {
    const [layoutFile] = readdirSync(appDirPath, { recursive: true }).filter(
      (item) =>
        fileExists(path.join(appDirPath, item as string)) &&
        item.includes("layout")
    ) as string[];
    if (!layoutFile) {
      logger.error(
        "Couldn't find your root layout file...Make sure you're on Next.js version 13 or later and also using the app router!"
      );
      return process.exit(1);
    }
    const layoutFilePath = path.join(appDirPath, layoutFile);
    const namedExport = fs.readdirSync(fontsDirPath).filter((fsItem) => {
      const folderPath = path.join(fontsDirPath, fsItem);
      return (
        folderExists(folderPath) &&
        fs.readdirSync(folderPath).every((file) => isFileFont(file))
      );
    })[0];
    if (!Boolean(reachedSuccess) || shouldUpdateImports) {
      await writeImportStatement(
        layoutFilePath,
        fontsDirPath,
        namedExport!,
        importAlias
      )
        .then(() => logger.info("Finished writing font imports..."))
        .catch((err) => logger.error(err));
    }
  } catch (error: any) {
    if (error.code === "ENOENT")
      logger.error("Couldn't find your app directory...");
    console.error(error);
    process.exit(1);
  }
};

// GENERATE CONTENT TO WRITE TO INDEX FILE
const generateFileContent = (
  fontFamilies: FontFamily[],
  fontsDirPath: string
): [content: string, chunks: string[]] => {
  const localfontUtilImport = !reachedSuccess
    ? NEXT_LOCALFONT_UTIL_IMPORT_STATEMENT + "\n\n"
    : "";

  const familiesExportArr = fontFamilies.map((family) => {
    return (
      `
    export const ${family.familyName} = localfont({
      \tsrc: ${getFontSrc(family.fonts, fontsDirPath)},
      \tdisplay: "swap",
    })
    `.trim() + "\n"
    );
  });

  const namedExports = familiesExportArr.join("\n");
  const defaultExport = `\nexport default {
    ${Array.from(
      new Set([
        ...fontFamilies.map((family) => family.familyName),
        ...(fonts || ""),
      ])
    ).join(", ")}
  }`;
  const chunks = [localfontUtilImport, namedExports, defaultExport];
  return [chunks.join("\n"), chunks];
};

// WRITE IMPORT STATEMENT TO LAYOUT FILE
const writeImportStatement = async (
  filePath: string,
  fontsDirPath: string,
  namedExport: string,
  alias?: string
) => {
  logger.info("Writing font imports to layout file...");
  // todo: detect when fonts dir path has changed and update import path accordingly
  const importPath = alias
    ? path.resolve(CURR_DIR, fontsDirPath)
    : path.relative(path.parse(filePath).dir, fontsDirPath);
  const importStatement = getImportStatement(namedExport, importPath, alias);
  // await writeLines(filePath, importStatement);
  await writeLineBy(
    filePath,
    importStatement,
    (prevLine, currentLine, nextLine) => {
      if (prevLine) return true;
      return false;
    }
  );
};

// GET IMPORT STATEMENT TO WRITE IN LAYOUT FILE
const getImportStatement = (
  namedExport: string,
  importPath: string,
  alias?: string
) => {
  const formattedImportPath = alias
    ? replaceAll(importPath, {
        [CURR_DIR]: alias,
        "*": "",
        [path.sep]: "/",
        "//": "/",
      })
    : importPath.split(path.sep).join("/");
  return (
    `import localfonts from "${formattedImportPath}"\n` +
    (!reachedSuccess
      ? "// OR IMPORT FONTS AS NAMED EXPORTS\n" +
        `// import { ${namedExport} } from "${formattedImportPath}"\n\n`
      : "")
  );
};
