import path from "path";
import fs from "fs-extra";
import type { FontFamily } from "./group-fonts-by-family";
import { logger } from "../utils/logger";
import { getFontSrc, getFontVarName } from "../utils/get-font-meta";
import { NEXT_LOCALFONT_UTIL_IMPORT_STATEMENT } from "../constants";
import { folderExists, isFileFont } from "../utils/exists";
import { getLofoConfig, getProjectConfig } from "../utils/get-config";
import { replaceAll } from "../utils/format-string";
import { reWriteFileSync, writeLineBy } from "../utils/write-file";

// todo: investigate stale closures -- shouldUpdateImports
const { reachedSuccess, fonts } = getLofoConfig();
const { importAlias, getLayoutFile } = getProjectConfig();

const CURR_DIR = process.cwd();

export const writeFontImports = async (
  fontsDirPath: string,
  fontFamilies: FontFamily[]
) => {
  const { shouldUpdateImports } = getLofoConfig();
  if (importAlias) logger.info(`Found project import alias: ${importAlias}`);
  const indexFilePath = path.join(fontsDirPath, "index.ts");
  if (fontFamilies.length) {
    logger.info("Writing font exports...");
    const [content] = generateFileContent(fontFamilies, fontsDirPath);
    !reachedSuccess
      ? fs.outputFileSync(indexFilePath, content)
      : reWriteFileSync(indexFilePath, content, "export");
    logger.info("Finished writing font exports");
  }

  if (!reachedSuccess || shouldUpdateImports) {
    await writeImportStatement(fontsDirPath);
    logger.info("Finished writing font imports...");
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
  const { shouldUpdateImports } = getLofoConfig();
  const layoutFilePath = getLayoutFile() as string;
  logger.info("Writing font imports to layout file...");

  // get named export
  const namedExport = fs.readdirSync(fontsDirPath).filter((fsItem) => {
    const folderPath = path.join(fontsDirPath, fsItem);
    return (
      folderExists(folderPath) &&
      fs.readdirSync(folderPath).every((file) => isFileFont(file))
    );
  })[0];

  const importPath = importAlias
    ? path.resolve(CURR_DIR, fontsDirPath)
    : path.relative(path.parse(layoutFilePath).dir, fontsDirPath);
  const importStatement = getImportStatement(
    namedExport!,
    importPath,
    importAlias
  );
  await writeLineBy(
    layoutFilePath,
    importStatement,
    (prevLine, currentLine) => {
      if (shouldUpdateImports) {
        if (currentLine.includes("fonts") && !currentLine.startsWith("//"))
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
