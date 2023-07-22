import type { PuppeteerLaunchOptions } from "puppeteer";

const common: PuppeteerLaunchOptions = {
  headless: "new",
  executablePath:
    process.env.NODE_ENV === "production"
      ? "/usr/bin/google-chrome"
      : undefined,
};

export { common };
