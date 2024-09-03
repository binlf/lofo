#!/usr/bin/env node

import { logger } from "./utils/logger";
import { Command } from "commander";
import { getPackageInfo } from "./utils/get-package-info";
import { runLofo } from "./runLofo";
import { getLofoConfig } from "./utils/get-config";

const program = new Command();

//? entry point
async function main() {
  const { version } = getPackageInfo();
  const { reachedSuccess } = getLofoConfig();
  program
    .name("lofo")
    .description("CLI tool for adding local fonts to your Next.js project!")
    .version(version || "0.1.0", "-v, --version", "Display current version")
    .option(
      "-d, --dest, --destination <path>",
      "Specify the destination of the fonts directory",
      "."
    )
    .action((options) => {
      if (options.dest !== "." && !reachedSuccess) return runLofo(options.dest);
      runLofo();
    });

  program.parse();
}

main().catch((err) => {
  logger.error(
    "Something goofed...Feel free to create an issue here: https://github.com/binlf/lofo/issues/new"
  );
  console.error(err);
});
