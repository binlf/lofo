import { Command } from "commander";
import fs, { remove } from "fs-extra";
import { getLofoConfig } from "../utils/get-config";
import path from "path";
import { LOFO_CONFIG } from "../constants";

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
  // return console.log(__filename, process.cwd());
  const { fontsDirPath, fonts } = getLofoConfig();
  const fontsDirContent = fs.readdirSync(fontsDirPath as string);
  fontsDirContent.map(
    (file) => file.startsWith("lf-") && remove(path.join(fontsDirPath!, file))
  );
  fonts?.map((font) => {
    const familyDir = path.join(fontsDirPath!, font);
    fs.readdirSync(familyDir).forEach((file) =>
      fs.moveSync(path.join(familyDir, file), path.join(familyDir, "..", file))
    );
  });
  fs.removeSync(path.join(process.cwd(), LOFO_CONFIG));
}
