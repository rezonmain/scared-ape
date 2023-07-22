import type { PuppeteerLaunchOptions } from "puppeteer";

const common: PuppeteerLaunchOptions = {
  headless: "new",
  args: process.env.NODE_ENV === "prod" ? ["--no-sandbox"] : undefined,
  executablePath:
    process.env.NODE_ENV === "prod" ? "/usr/bin/google-chrome" : undefined,
};

export { common };
