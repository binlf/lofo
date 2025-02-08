import { Command } from "commander";
import { getLofoConfig } from "../utils/get-config";
import { getFontsDir } from "../helpers/get-fonts-dir";
import fs from "fs-extra";
import { isFontFamilyDir, isFontFile } from "../utils/exists";
import path from "path";
import { logger } from "../utils/logger";
import { whiteBright } from "picocolors";

export const list = new Command()
  .name("list")
  .alias("ls")
  .description("list all added font files")
  .action(listHandler);

function listHandler() {
  const { fonts } = getLofoConfig();
  const fontsDirPath = getFontsDir();
  if (!fonts || !fonts?.length)
    return logger.error("No font files have been added yet.");
  console.log("Fonts:");
  const itemsInFontsDir = fs.readdirSync(fontsDirPath);
  itemsInFontsDir.map((item) => {
    const itemPath = path.join(fontsDirPath, item);
    if (isFontFamilyDir(itemPath) && fonts?.typefaces.includes(item)) {
      console.log(`${whiteBright(`${item}(F)`)}`);
      fs.readdirSync(itemPath).map((fontFile) =>
        console.log(`  - ${fontFile}`)
      );
    }
    if (isFontFile(item)) {
      console.log(whiteBright(item));
    }
  });
}
