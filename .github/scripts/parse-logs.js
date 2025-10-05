import fs from "fs";
import path from "path";

const artifactsDir = "./artifacts";
const summaries = [];

const dirs = fs
  .readdirSync(artifactsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join(artifactsDir, d.name));

for (const dir of dirs) {
  const logFile = path.join(dir, "log.txt");
  if (!fs.existsSync(logFile)) {
    summaries.push({
      nodeVersion: path.basename(dir),
      status: "❌ Log missing",
    });
    continue;
  }

  const log = fs.readFileSync(logFile, "utf8");
  let status;
  if (log.includes("Tests passed successfully")) {
    status = "✅ Passed";
  } else if (log.includes("Tests failed")) {
    status = "❌ Failed";
  } else {
    status = "❓ Unknown";
  }

  summaries.push({
    nodeVersion: path.basename(dir),
    status,
  });
}

fs.writeFileSync(
  "./artifacts/parsed-summary.json",
  JSON.stringify(summaries, null, 2)
);

console.log("✅ Parsed summary ready");
