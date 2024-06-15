#!/usr/bin/env node

import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { Command } from "commander";

const program = new Command();

const logger = {
  error(message: string) {
    console.log(`ERROR: ${message}...`);
  },
  success(message: string) {
    console.log(`SUCCESS: ${message}`);
  },
  warning(message: string) {
    console.log(`WARNING: ${message}`);
  },
  info(message: string) {
    console.log(`INFO: ${message}`);
  },
};

const PROJECT_NAME = path.basename(path.resolve(process.cwd()));

logger.info(`lofo is running in ${PROJECT_NAME}`);
const checkFontsDirectoryExists = async () => {
  try {
    logger.info("Getting your fonts directory...");
    const data = await fsPromises.readdir(process.cwd());
    // console.log("Data: ", data);
    if (data.includes("fonts")) {
      logger.info(`Found fonts directory in ${process.cwd()}`);
    } else if (data.includes("src")) {
      try {
        process.chdir("./src");
        const isFontsDir = (await fsPromises.readdir(process.cwd())).includes(
          "fonts"
        );
        isFontsDir && logger.info(`Found fonts directory in ${process.cwd()}`);
      } catch (error) {
        console.error("Something Went Wrong! ", error);
        process.exit(1);
      }
    } else logger.info("Couldn't find your fonts directory!");
  } catch (error) {
    console.error("Something went wrong: ", error);
    process.exit(1);
  }

  // logger.info("Found fonts directory in...");
  // logger.info("Couldn't find fonts directory, creating one...");
};

checkFontsDirectoryExists();

// program
//   .argument("<string>", "string to log")
//   .action((msg: string) => {
//     console.log(`Locy calls ${msg}`);
//   })
//   .description("It's /low-key/");

// program.parse(process.argv);
