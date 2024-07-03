import path from "path";
import fs, { readdirSync } from "fs-extra";
import readline from "readline";
import type { Family } from "./group-fonts-by-family";
import { logger } from "../utils/logger";
import { getFontSrc } from "../utils/get-font-meta";
import { NEXT_LOCAL_FONT_IMPORT_STATEMENT } from "../constants";
import { fileExists, folderExists } from "../utils/exists";

// todo: implement writing font imports to layout file
export const writeFontImports = async (
  fontsDirPath: string,
  fontFamilies: Family[]
) => {
  logger.info("Writing font exports...");
  const indexFilePath = path.join(fontsDirPath, "index.ts");
  const content = `${NEXT_LOCAL_FONT_IMPORT_STATEMENT}\n\n${generateFileContent(
    fontFamilies,
    fontsDirPath
  )}`;
  fs.outputFileSync(indexFilePath, content);
  logger.info("Finished writing font exports");
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
    logger.info(
      "Couldn't find your root layout file...Make sure you're on Next.js version 13 or later and also using the app router!"
    );
    return process.exit(1);
  }
  const layoutFilePath = path.join(appDirPath, layoutFile);
  await writeImportStatement(layoutFilePath);
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
  const importStatement =
    'import localfonts, { Poppins } from "../../public/fonts"\n// IMPORT YOUR LOCAL FONTS AS A DEFAULT EXPORT[import localfonts from ...]\n// OR AS A NAMED EXPORT[import { <font_name> } from ...]\n// YOU SHOULD PROBABLY GET RID OF THESE COMMENTS NOW\n\n';
  const fileReadStream = fs.createReadStream(filePath);
  const fileWriteStream = fs.createWriteStream(filePath, { flags: "r+" });
  //? Get rid of original output without logging to console
  const nullWriteStream = fs.createWriteStream(filePath, { flags: "r+" });

  const rl = readline.createInterface({
    input: fileReadStream,
    output: nullWriteStream, // get rid of original output without using `process.stdout`
    crlfDelay: Infinity,
  });

  let lineNumber = 1;
  let lineContent;
  for await (const line of rl) {
    if (lineNumber > 1 && !line.trim() && lineContent?.includes("import")) {
      fileWriteStream.write(importStatement);
    } else {
      fileWriteStream.write(`${line}\n`);
    }
    lineContent = line;
    lineNumber++;
  }
  // todo: DRY this up
  await new Promise((resolve, reject) =>
    fileWriteStream.on("finish", resolve).on("error", reject)
  );
  await new Promise((resolve, reject) =>
    nullWriteStream.on("finish", resolve).on("error", reject)
  );
  fileWriteStream.end();
  return fileReadStream.close();
};
