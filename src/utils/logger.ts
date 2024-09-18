import pc from "picocolors";

export const logger = {
  error(message: string) {
    console.log(`${pc.bold(pc.red("ERROR"))}: ${message}`);
  },
  success(message: string) {
    console.log(`${pc.bold(pc.green("SUCCESS"))}: ${message}`);
  },
  warning(message: string) {
    console.log(`${pc.bold(pc.yellowBright("WARNING"))}: ${message}`);
  },
  info(message: string) {
    console.log(`${pc.bold(pc.whiteBright("INFO"))}: ${message}`);
  },
};

export const whiteBold = (string: string) => pc.bold(pc.whiteBright(string));
