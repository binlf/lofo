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

const { fonts, reachedSuccess, writeConfig, updateTypefaces, setFilesLength } =
  getLofoConfig();
function removeHandler(options: { all: boolean }) {
  const fontsDirPath = getFontsDir();

  // check if `fonts` directory exists
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

const removeFont = (fontItem?: string, flag: "single" | "all" = "single") => {
  const fontsDirPath = getFontsDir();
  const itemsInFontsDir = fs.readdirSync(fontsDirPath as string);
  const fontExportsFile =
    ((ENV === "dev" && "lf-") || "") +
    (isTypescriptProject() ? "index.ts" : "index.js");
  const fontExportsFilePath = path.join(fontsDirPath!, fontExportsFile);

  if (flag === "single") {
    // remove this check, it may never be used
    if (!fontItem) {
      logger.warning("Please specify a font to remove");
      process.exit(1);
    }

    // this check is redundant as the remove command doesn't accept arguments anymore
    // if execution reaches this code block, everything should be valid and guaranteed
    if (!itemsInFontsDir.includes(fontItem as string)) {
      throw new Error(
        `Font${!isFontFile(fontItem) && " family"}: ${whiteBold(
          fontItem
        )} does not exist in the ${whiteBold(FONTS_DIR_NAME)} directory`
      );
    }

    // remove font(file or directory)
    const fontItemPath = path.join(fontsDirPath!, fontItem);
    fs.removeSync(fontItemPath);

    // update font exports file
    const typeface = getTypeface(fontItem);
    const namedExport = `export const ${typeface} = localfont`;

    const restTypefaces = fonts?.typefaces.filter(
      (tf) => tf !== typeface
    ) as string[];
    const defaultExport = `\nexport default {
      ${restTypefaces.join(", ")}
    }`;
    // remove named export in font exports file
    reWriteFileSync(fontExportsFilePath, namedExport, "export", true);
    // in font exports file, remove font in default export object
    reWriteFileSync(fontExportsFilePath, defaultExport, "export");
    if (reachedSuccess) {
      updateTypefaces(() => restTypefaces);
      writeConfig();
    }
    logger.success(`Removed font(s)`);
    console.log(
      `\t${pc.redBright("-")} ${
        !isFontFile(fontItem) ? `${fontItem}(F)` : fontItem
      }`
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
  fs.removeSync(fontExportsFilePath);
  if (reachedSuccess) {
    updateTypefaces(() => []);
    writeConfig();
  }
  logger.success("Removed all font familes");
};
