import { Command } from "commander";
import { logger, whiteBold } from "../utils/logger";
import { getLofoConfig } from "../utils/get-config";
import { ENV, FONTS_DIR_NAME, LOFO_CONFIG } from "../constants";
import fs, { pathExistsSync } from "fs-extra";
import path from "path";
import { reWriteFileSync } from "../utils/write-file";
import { isTypescriptProject } from "../utils/get-project-info";
import { getFontsDir } from "../helpers/get-fonts-dir";
import { doesFolderExist, isFontFamilyDir, isFontFile } from "../utils/exists";
import prompts, { type Choice } from "prompts";
import pc from "picocolors";
import { getTypeface } from "../utils/get-file-names";

export const remove = new Command()
  .name("remove")
  .alias("rm")
  .description("remove a font family")
  .option("-a, --all", "remove all font families")
  .action(removeHandler);

const { fonts, reachedSuccess, writeConfig, updateFonts } = getLofoConfig();
function removeHandler(options: { all: boolean }) {
  const fontsDirPath = getFontsDir();

  if (!fs.pathExistsSync(fontsDirPath as string)) {
    // throw new Error(`${FONTS_DIR_NAME} directory does not exist`);
    logger.error(`${whiteBold(FONTS_DIR_NAME)} directory does not exist`);
    process.exit(1);
  }
  // remove all font families
  if (options.all) return removeFont("", "all");

  if (!fonts) {
    logger.error(
      `${whiteBold(
        FONTS_DIR_NAME
      )} entry is missing in ${LOFO_CONFIG}. Try adding font files to your project and try again...`
    );
    process.exit(1);
  }
  if (fonts && !fonts.length && reachedSuccess) {
    logger.warning(
      `${whiteBold(
        FONTS_DIR_NAME
      )} entry is empty in ${LOFO_CONFIG}. Try adding font files to your project and try again...`
    );
    process.exit(1);
  }
  // if (font && !fonts.includes(font)) {
  //   logger.warning(
  //     `Font family ${whiteBold(
  //       font
  //     )} does not exist. Ensure it exists in the ${whiteBold(
  //       FONTS_DIR_NAME
  //     )} directory and try again...`
  //   );
  //   process.exit(1);
  // }
  const itemsInFontsDir = fs.readdirSync(fontsDirPath as string);

  const fontChoices = fonts.typefaces.reduce((acc, currVal) => {
    const [fontFileOrDir] = itemsInFontsDir.filter((item) =>
      item.includes(currVal)
    );
    if (fontFileOrDir)
      return [
        ...acc,
        {
          title: !isFontFile(fontFileOrDir)
            ? `${fontFileOrDir}(F)`
            : fontFileOrDir,
          value: fontFileOrDir,
        },
      ];
    return acc;
  }, [] as Choice[]);

  prompts({
    type: "select",
    name: "fontToRemove",
    message: "What font do you want to remove?",
    choices: fontChoices,
  })
    .then((res) => {
      if (!res.fontToRemove) return;
      removeFont(res.fontToRemove);
    })
    .catch((err) => logger.error(err));
}

const removeFont = (font?: string, flag: "single" | "all" = "single") => {
  const fontsDirPath = getFontsDir();
  const itemsInFontsDir = fs.readdirSync(fontsDirPath as string);
  const indexFile =
    ((ENV === "development" && "lf-") || "") +
    (isTypescriptProject() ? "index.ts" : "index.js");
  const indexFilePath = path.join(fontsDirPath!, indexFile);
  if (flag === "single") {
    if (!font) {
      logger.warning("Please specify a font to remove");
      process.exit(1);
    }
    if (!itemsInFontsDir.includes(font as string)) {
      throw new Error(
        `Font${!isFontFile(font) && " family"}: ${whiteBold(
          font
        )} does not exist in the ${whiteBold(FONTS_DIR_NAME)} directory`
      );
    }
    const fontPath = path.join(fontsDirPath!, font);
    // remove font font directory
    fs.removeSync(fontPath);
    const namedExport = `export const ${font} = localfont`;
    const restFonts = fonts?.typefaces.filter(
      (f) => f !== (isFontFile(font) ? getTypeface(font) : font)
    ) as string[];
    const defaultExport = `\nexport default {
      ${restFonts.join(", ")}
    }`;
    // remove  font named export in index file
    reWriteFileSync(indexFilePath, namedExport, "export", true);
    // remove font in default export object
    reWriteFileSync(indexFilePath, defaultExport, "export");
    if (reachedSuccess) {
      updateFonts(() => restFonts);
      writeConfig();
    }
    logger.success(`Removed font(s)`);
    console.log(
      `\t${pc.redBright("-")} ${!isFontFile(font) ? `${font}(F)` : font}`
    );
  }

  return;
  // logger.info(`Removing all font families`);
  if (!itemsInFontsDir.length)
    return logger.warning(`${whiteBold(FONTS_DIR_NAME)} directory is empty`);
  let hasRemovedFontFamily = false;
  itemsInFontsDir?.forEach((fsItem) => {
    const fsItemPath = path.join(fontsDirPath!, fsItem);
    if (!pathExistsSync(fsItemPath)) return;
    if (doesFolderExist(fsItemPath) && isFontFamilyDir(fsItemPath)) {
      fs.removeSync(fsItemPath);
      hasRemovedFontFamily = true;
    }
  });
  if (!hasRemovedFontFamily)
    return logger.error("No font family directories were found");
  fs.removeSync(indexFilePath);
  if (reachedSuccess) {
    updateFonts(() => []);
    writeConfig();
  }
  logger.success("Removed all font familes");
};
