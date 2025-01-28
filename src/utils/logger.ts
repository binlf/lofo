import pc from "picocolors";

export const logger = {
  error(message: string) {
    console.log(`> ${pc.bold(pc.red("ERROR"))}: ${message}`);
  },
  success(message: string) {
    console.log(`> ${pc.green("SUCCESS")}: ${message}`);
  },
  warning(message: string) {
    console.log(`> ${pc.yellowBright("WARNING")}: ${message}`);
  },
  info(message: string) {
    console.log(`> ${whiteBold("INFO")}: ${message}`);
  },
  nominal(message: string) {
    console.log(`> ${message}`);
  },
};

export const whiteBold = (string: string) => pc.bold(pc.whiteBright(string));
export const gray = (string: string) => pc.gray(string);
