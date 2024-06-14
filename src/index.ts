#!/usr/bin/env node

import fs from "fs";
import { Command } from "commander";

const program = new Command();

program
  .argument("<string>", "string to log")
  .action((msg: string) => {
    console.log(`Locy calls ${msg}`);
  })
  .description("It's /low-key/");

program.parse(process.argv);
