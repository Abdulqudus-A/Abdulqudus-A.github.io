// Renders public/og.png (the image shown when the site is shared) from scripts/og.html.
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage();
  await p.goto("file://" + path.join(__dirname, "og.html"));
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(__dirname, "..", "public", "og.png") });
  await b.close();
})();
