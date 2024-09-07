import { Command } from "commander";
import { logger } from "../utils/logger";
import { getLofoConfig } from "../utils/get-config";
import { FONTS_DIR_NAME } from "../constants";
import fs, { pathExistsSync } from "fs-extra";
import path from "path";
import { reWriteFileSync } from "../utils/write-file";
import { isTypescriptProject } from "../utils/get-project-info";

export const remove = new Command()
  .name("remove")
  .alias("rm")
  .description("remove a font family")
  .argument("[family]", "font family to remove")
  .option("-a, --all", "remove all font families")
  .action(removeHandler);

const { fonts, fontsDirPath, reachedSuccess, signalSuccess, updateFonts } =
  getLofoConfig();
function removeHandler(family: string, options: any) {
  if (options.all) return removeFontFamily("", "all");
  if (!family) {
    logger.warning("Please specify a font family to remove");
    process.exit(1);
  }
  if (!fonts) throw new Error("'fonts' entry is missing in lofo-config.json");
  if (fonts && !fonts.length && reachedSuccess) {
    logger.warning(
      "'fonts' entry is empty in lofo-config.json. Try adding local fonts to your project and try again"
    );
    process.exit(1);
  }
  if (!fonts.includes(family)) {
    logger.warning(
      `Font family ${family} does not exist. Ensure it exists in the ${FONTS_DIR_NAME} directory and try again...`
    );
    process.exit(1);
  }
  if (!fs.pathExistsSync(fontsDirPath as string)) {
    throw new Error(`${fonts} directory does not exist`);
  }

  removeFontFamily(family);
}

const removeFontFamily = (
  family?: string,
  flag: "single" | "all" = "single"
) => {
  const itemsInFontsDir = fs.readdirSync(fontsDirPath as string);
  const indexFile = isTypescriptProject() ? "index.ts" : "index.js";
  const indexFilePath = path.join(fontsDirPath!, indexFile);
  if (flag === "single") {
    logger.info(`Removing font family: ${family}`);
    if (!family) {
      logger.warning("Please specify a font family to remove");
      process.exit(1);
    }
    if (!itemsInFontsDir.includes(family as string)) {
      throw new Error(
        `Font family: ${family} does not exist in ${FONTS_DIR_NAME} directory`
      );
    }
    const fontFamilyPath = path.join(fontsDirPath!, family);
    // remove font family directory
    fs.removeSync(fontFamilyPath);
    // remove font family named export in index file
    const namedExport = `export const ${family} = localfont`;
    const restFonts = fonts?.filter(
      (fontFamily) => fontFamily !== family
    ) as string[];
    const defaultExport = `\nexport default {
        ${restFonts.join(", ")}
      }`;
    reWriteFileSync(indexFilePath, namedExport, "export", "r");
    reWriteFileSync(indexFilePath, defaultExport, "export");
    updateFonts(() => restFonts);
    signalSuccess();
    return logger.success(`Font family ${family} was successfully removed!`);
  }
  logger.info(`Removing all font families`);
  fonts?.forEach((font) => {
    const fontFamilyPath = path.join(fontsDirPath!, font);
    if (!pathExistsSync(fontFamilyPath))
      return logger.error(`Font family ${font} does not exist`);
    fs.removeSync(fontFamilyPath);
  });
  fs.removeSync(indexFilePath);
  updateFonts(() => []);
  signalSuccess();
  logger.success("Removed all font familes");
};
