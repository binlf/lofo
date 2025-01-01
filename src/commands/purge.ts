import { Command } from "commander";
import fs, { pathExistsSync, remove } from "fs-extra";
import { getLofoConfig } from "../utils/get-config";
import path from "path";
import { LOFO_CONFIG } from "../constants";
import { logger } from "../utils/logger";

export const purge = new Command()
  .name("purge")
  .alias("pr")
  .description("purge all lofo files")
  .option("-p", "destory config")
  .action(purgeHandler);

/**
 * Handler for the purge command
 * @param {Object} options - Command options object
 * @param {import('commander').Command} command - The commander Command object
 */
function purgeHandler() {
  const { fontsDirPath, fonts } = getLofoConfig();
  if (!fontsDirPath || !fonts) return;
  const fontsDirContent = fs.readdirSync(fontsDirPath as string);
  fontsDirContent.map(
    (file) => file.startsWith("lf-") && remove(path.join(fontsDirPath!, file))
  );
  // ungroup font files
  fonts?.map((font) => {
    const familyDirPath = path.join(fontsDirPath!, font);
    pathExistsSync(familyDirPath) &&
      fs
        .readdirSync(familyDirPath)
        .forEach((file) =>
          fs.moveSync(
            path.join(familyDirPath, file),
            path.join(familyDirPath, "..", file)
          )
        );
    fs.removeSync(familyDirPath);
  });
  fs.removeSync(path.join(process.cwd(), LOFO_CONFIG));
  logger.success("Purge complete!");
}
