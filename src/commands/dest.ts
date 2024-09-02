import { Command } from "commander";
import { runLofo } from "../runLofo";

// final destination
export const dest = new Command()
  .name("destination")
  .description("Specify the destination of your fonts directory")
  .argument("<path>", "the path to destination")
  .action(runLofo);

export function destHandler(path: string) {}
