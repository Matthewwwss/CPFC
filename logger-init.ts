import logger from "./utils/logger";

if (import.meta.env.MODE === "development") {
  logger.setLevel("debug");
} else {
  logger.setLevel("error");
}

export default logger;
