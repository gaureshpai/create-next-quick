import fs from "fs";
import path from "path";

const artifactsDir = "./artifacts";
const summaries = [];

if (!fs.existsSync(artifactsDir)) {
  console.error(`❌ Artifacts directory not found: ${artifactsDir}`);
  console.log("Creating empty summary...");
  fs.mkdirSync(artifactsDir, { recursive: true });
  fs.writeFileSync(
    path.join(artifactsDir, "parsed-summary.json"),
    JSON.stringify([], null, 2)
  );
  process.exit(0);
}

const dirs = fs
  .readdirSync(artifactsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join(artifactsDir, d.name));

console.log(`Found ${dirs.length} artifact directories`);

for (const dir of dirs) {
  const dirName = path.basename(dir);
  console.log(`Processing: ${dirName}`);

  const logFile = path.join(dir, "log.txt");
  if (!fs.existsSync(logFile)) {
    console.warn(`⚠️  Log file missing in ${dirName}`);
    summaries.push({
      nodeVersion: dirName.replace("test-logs-", ""),
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
    nodeVersion: dirName.replace("test-logs-", ""),
    status,
  });
}

const outputPath = path.join(artifactsDir, "parsed-summary.json");
fs.writeFileSync(outputPath, JSON.stringify(summaries, null, 2));

console.log(`✅ Parsed summary ready with ${summaries.length} results`);
console.log(JSON.stringify(summaries, null, 2));
