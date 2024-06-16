// todo: add chalk for color
export const logger = {
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
