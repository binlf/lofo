import path from "path";
import fs, { pathExistsSync } from "fs-extra";
import type { FontFamily } from "./group-fonts-by-family";
import { logger } from "../utils/logger";
import { getFontSrc, getFontVarName } from "../utils/get-font-meta";
import { NEXT_LOCALFONT_UTIL_IMPORT_STATEMENT } from "../constants";
import { folderExists, isFontFamilyDir, isFontFile } from "../utils/exists";
import { getLofoConfig } from "../utils/get-config";
import { replaceAll } from "../utils/format-string";
import { reWriteFileSync, writeLineBy } from "../utils/write-file";
import {
  getLayoutFile,
  getProjectConfig,
  isTypescriptProject,
} from "../utils/get-project-info";

const { reachedSuccess, fonts } = getLofoConfig();
const { importAlias } = getProjectConfig();

const CURR_DIR = process.cwd();

export const writeFontImports = async (
  fontsDirPath: string,
  fontFamilies: FontFamily[]
) => {
  const { shouldUpdateImports } = getLofoConfig();
  if (importAlias) logger.info(`Found project import alias: ${importAlias}`);
  const indexFile = isTypescriptProject() ? "index.ts" : "index.js";
  const indexFilePath = path.join(fontsDirPath, indexFile);
  if (fontFamilies.length) {
    logger.info("Writing font exports...");
    const [content, _] = generateFileContent(fontFamilies, fontsDirPath);
    !pathExistsSync(indexFilePath)
      ? fs.outputFileSync(indexFilePath, content)
      : reWriteFileSync(indexFilePath, content, "export");
    logger.info("Finished writing font exports");
  }

  if (fontFamilies.length || shouldUpdateImports) {
    await writeImportStatement(fontsDirPath);
    logger.info("Finished writing font imports...");
  }
};

// GENERATE CONTENT TO WRITE TO INDEX FILE
const generateFileContent = (
  fontFamilies: FontFamily[],
  fontsDirPath: string
): [content: string, chunks: string[]] => {
  const localfontUtilImport = NEXT_LOCALFONT_UTIL_IMPORT_STATEMENT + "\n";

  const familiesExportArr = fontFamilies.map((family) => {
    return (
      `
    export const ${family.familyName} = localfont({
      \tsrc: ${getFontSrc(family.fonts, fontsDirPath)},
      \tvariable: "${getFontVarName(family.familyName)}",
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
const writeImportStatement = async (fontsDirPath: string) => {
  const { shouldUpdateImports, destPath } = getLofoConfig();
  const layoutFilePath = getLayoutFile() as string;
  logger.info("Writing font imports to layout file...");

  // get named export
  const namedExport = fs.readdirSync(fontsDirPath).filter((fsItem) => {
    const folderPath = path.join(fontsDirPath, fsItem);
    return isFontFamilyDir(folderPath);
  })[0];

  // get import path
  const importPath = importAlias
    ? path.resolve(CURR_DIR, destPath)
    : path.relative(path.parse(layoutFilePath).dir, destPath);
  const importStatement = getImportStatement(
    namedExport as string,
    importPath,
    importAlias as string
  );
  await writeLineBy(
    layoutFilePath,
    importStatement,
    (prevLine, currentLine) => {
      if (shouldUpdateImports) {
        if (currentLine.includes("/fonts") && !currentLine.startsWith("//"))
          return true;
        return false;
      }
      if (!currentLine.trim() && prevLine.includes("import")) return true;
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
