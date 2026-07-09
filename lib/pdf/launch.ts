import type { Browser } from "puppeteer-core";

/**
 * Launch a headless Chromium that works in two environments:
 *   - Production / serverless (AWS Lambda, Amplify SSR, Vercel): uses the
 *     Lambda-compatible binary from @sparticuz/chromium.
 *   - Local dev: uses a Chrome already installed on your machine. Set
 *     CHROME_PATH in .env.local to override the auto-detected path.
 */
export async function launchBrowser(): Promise<Browser> {
  const puppeteer = await import("puppeteer-core");
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  return puppeteer.launch({
    headless: true,
    executablePath: localChromePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
  });
}

function localChromePath(): string {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  switch (process.platform) {
    case "darwin":
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    case "win32":
      return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    default:
      return "/usr/bin/google-chrome";
  }
}
