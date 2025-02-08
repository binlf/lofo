#!/usr/bin/env node

import { logger } from "./utils/logger";
import { Command } from "commander";
import { getPackageInfo } from "./utils/get-package-info";
import { runLofo } from "./runLofo";
import { remove } from "./commands/remove";
import { purge } from "./commands/purge";
import { list } from "./commands/list";
// import { version } from "../package.json";

const program = new Command();

//? entry point
async function main() {
  const { version } = getPackageInfo();
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
      if (options.dest && options.dest !== ".") {
        // todo: refactor
        return runLofo(options.dest).catch((err) => {
          logger.error("Something goofed...");
          console.error(err);
        });
      }
      runLofo().catch((err) => {
        logger.error("Something goofed...");
        console.error(err);
      });
    });

  program.addCommand(remove).addCommand(purge).addCommand(list);
  program.parse();
}

main().catch((err) => {
  logger.error(
    "Something goofed...Feel free to create an issue here: https://github.com/binlf/lofo/issues/new"
  );
  console.error(err);
});
