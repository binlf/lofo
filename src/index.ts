#!/usr/bin/env node

import { logger } from "./utils/logger";
import { Command } from "commander";
import { getPackageInfo } from "./utils/get-package-info";
import { dest } from "./commands/dest";
import { runLofo } from "./runLofo";

const program = new Command();

//? entry point
async function main() {
  const { version } = getPackageInfo();
  program
    .name("lofo")
    .description("CLI tool for adding local fonts to your Next.js project!")
    .version(version || "0.1.0", "-v, --version", "Display current version")
    .option(
      "-d, --dest, --destination",
      "Specify the destination of the fonts directory",
      "."
    )
    .action((cmdObj) => {
      const options = cmdObj.opts();
      if (options.dest) console.log(options.dest);
      // runLofo();
      console.log("Heyyy");
    });

  // program.addCommand(dest);
  program.parse();
  // runLofo();
}

main().catch((err) => {
  logger.error(
    "Something broke...Feel free to create an issue here: https://github.com/binlf/lofo/issues/new"
  );
  console.error(err);
});
