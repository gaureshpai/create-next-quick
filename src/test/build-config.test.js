import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..", "..");

describe("rollup.config.mjs", () => {
  let config;

  before(async () => {
    const configPath = path.join(ROOT, "rollup.config.mjs");
    const configUrl = pathToFileURL(configPath);
    const mod = await import(configUrl);
    config = mod.default;
  });

  describe("input", () => {
    it("should use src/create-next-quick.js as the entry point", () => {
      assert.strictEqual(config.input, "src/create-next-quick.js");
    });
  });

  describe("output", () => {
    it("should output to the dist directory", () => {
      assert.strictEqual(config.output.dir, "dist");
    });

    it("should use ESM output format", () => {
      assert.strictEqual(config.output.format, "esm");
    });

    it("should use [name].js pattern for entry file names", () => {
      assert.strictEqual(config.output.entryFileNames, "[name].js");
    });

    it("should use [name]-[hash].js pattern for chunk file names", () => {
      assert.strictEqual(config.output.chunkFileNames, "[name]-[hash].js");
    });

    it("should disable hoistTransitiveImports", () => {
      assert.strictEqual(config.output.hoistTransitiveImports, false);
    });

    it("should enable constBindings in generatedCode", () => {
      assert.strictEqual(config.output.generatedCode.constBindings, true);
    });
  });

  describe("plugins", () => {
    it("should have exactly 2 plugins configured", () => {
      assert.ok(Array.isArray(config.plugins), "plugins should be an array");
      assert.strictEqual(config.plugins.length, 2);
    });

    it("should have a node-resolve plugin as the first plugin", () => {
      const resolvePlugin = config.plugins[0];
      assert.ok(resolvePlugin != null, "first plugin should not be null");
      assert.ok(typeof resolvePlugin === "object", "first plugin should be an object");
      assert.strictEqual(resolvePlugin.name, "node-resolve", "first plugin should be node-resolve");
    });

    it("should have a terser plugin as the second plugin", () => {
      const terserPlugin = config.plugins[1];
      assert.ok(terserPlugin != null, "second plugin should not be null");
      assert.ok(typeof terserPlugin === "object", "second plugin should be an object");
      assert.strictEqual(terserPlugin.name, "terser", "second plugin should be terser");
    });
  });

  describe("external", () => {
    it("should have an empty external array (bundle all dependencies)", () => {
      assert.ok(Array.isArray(config.external), "external should be an array");
      assert.strictEqual(config.external.length, 0);
    });
  });
});

describe("package.json build configuration", () => {
  let pkg;

  before(() => {
    const pkgPath = path.join(ROOT, "package.json");
    pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  });

  describe("main entry point", () => {
    it("should point to dist/create-next-quick.js (compiled output)", () => {
      assert.strictEqual(pkg.main, "dist/create-next-quick.js");
    });

    it("should not point to the source file src/create-next-quick.js", () => {
      assert.notStrictEqual(pkg.main, "src/create-next-quick.js");
    });
  });

  describe("bin entry point", () => {
    it("should have create-next-quick binary pointing to dist/create-next-quick.js", () => {
      assert.strictEqual(pkg.bin["create-next-quick"], "dist/create-next-quick.js");
    });

    it("should not point the binary to the source file src/create-next-quick.js", () => {
      assert.notStrictEqual(pkg.bin["create-next-quick"], "src/create-next-quick.js");
    });
  });

  describe("published files", () => {
    it("should include dist in the files array", () => {
      assert.ok(Array.isArray(pkg.files), "files should be an array");
      assert.ok(pkg.files.includes("dist"), "files should include 'dist'");
    });

    it("should not include src in the published files", () => {
      assert.ok(!pkg.files.includes("src"), "files should not include 'src'");
    });
  });

  describe("scripts", () => {
    it("should have a build script using rollup", () => {
      assert.ok(pkg.scripts.build != null, "build script should exist");
      assert.ok(pkg.scripts.build.includes("rollup"), "build script should invoke rollup");
    });

    it("build script should use the rollup config file (-c flag)", () => {
      assert.ok(
        pkg.scripts.build.includes("-c"),
        "build script should include -c flag to use rollup.config.mjs",
      );
    });

    it("build script should set BUILD:production environment", () => {
      assert.ok(
        pkg.scripts.build.includes("BUILD:production"),
        "build script should set BUILD:production environment variable",
      );
    });

    it("should have a start script pointing to dist/create-next-quick.js", () => {
      assert.ok(pkg.scripts.start != null, "start script should exist");
      assert.strictEqual(pkg.scripts.start, "node dist/create-next-quick.js");
    });
  });

  describe("devDependencies", () => {
    it("should include rollup as a devDependency", () => {
      assert.ok(pkg.devDependencies.rollup != null, "rollup should be in devDependencies");
    });

    it("rollup version should be >= 4.0.0", () => {
      const version = pkg.devDependencies.rollup;
      const validMajor4 = /^(?:[\^~]|>=?4(?:\.|$)|>=4\.0\.0|4(?:\.x?|$))/;
      assert.ok(
        validMajor4.test(version),
        `rollup version '${version}' should be >=4.0.0 (e.g. ^4, ~4, 4, 4.x, >=4)`,
      );
    });

    it("should include @rollup/plugin-node-resolve", () => {
      assert.ok(
        pkg.devDependencies["@rollup/plugin-node-resolve"] != null,
        "@rollup/plugin-node-resolve should be in devDependencies",
      );
    });

    it("should include @rollup/plugin-terser", () => {
      assert.ok(
        pkg.devDependencies["@rollup/plugin-terser"] != null,
        "@rollup/plugin-terser should be in devDependencies",
      );
    });
  });
});

describe(".gitignore build artifact exclusion", () => {
  let gitignoreContent;

  before(() => {
    gitignoreContent = readFileSync(path.join(ROOT, ".gitignore"), "utf-8");
  });

  it("should exclude dist/ from version control", () => {
    assert.ok(
      gitignoreContent.includes("dist/"),
      ".gitignore should contain 'dist/' to exclude the build output directory",
    );
  });

  it("dist/ entry should be on its own line", () => {
    const lines = gitignoreContent.split("\n").map((l) => l.trim());
    assert.ok(lines.includes("dist/"), ".gitignore should have 'dist/' as a standalone line entry");
  });
});

describe("CI workflow build step", () => {
  let ciYml;

  before(() => {
    ciYml = readFileSync(path.join(ROOT, ".github", "workflows", "ci.yml"), "utf-8");
  });

  it("should contain a build step", () => {
    assert.ok(ciYml.includes("Build package"), "ci.yml should include a 'Build package' step");
  });

  it("build step should run before the test step", () => {
    const buildIndex = ciYml.indexOf("Build package");
    const testIndex = ciYml.indexOf("Run tests");
    assert.ok(buildIndex !== -1, "ci.yml should have a Build package step");
    assert.ok(testIndex !== -1, "ci.yml should have a Run tests step");
    assert.ok(buildIndex < testIndex, "Build package step should appear before Run tests step");
  });

  it("build step should use the matrix package-manager variable", () => {
    const buildIndex = ciYml.indexOf("Build package");
    assert.ok(buildIndex !== -1, "ci.yml should have a Build package step");
    const nextStepMatch = ciYml.slice(buildIndex + 1).match(/(?=\n {6}- name:)/);
    const endIndex = nextStepMatch ? buildIndex + 1 + nextStepMatch.index : ciYml.length;
    const buildStepSection = ciYml.slice(buildIndex, endIndex);
    assert.ok(
      buildStepSection.includes("matrix.package-manager"),
      `Build step should use ${matrix.package - manager} to run build`,
    );
  });

  it("build step should invoke the build command", () => {
    const buildIndex = ciYml.indexOf("Build package");
    assert.ok(buildIndex !== -1, "ci.yml should have a Build package step");
    const nextStepMatch = ciYml.slice(buildIndex + 1).match(/(?=\n {6}- name:)/);
    const endIndex = nextStepMatch ? buildIndex + 1 + nextStepMatch.index : ciYml.length;
    const buildStepSection = ciYml.slice(buildIndex, endIndex);
    assert.ok(buildStepSection.includes("run build"), "Build step should run the 'build' script");
  });

  it("should contain a smoke test step after build", () => {
    const smokeTestIndex = ciYml.indexOf("Smoke test built artifact");
    const buildIndex = ciYml.indexOf("Build package");
    assert.ok(smokeTestIndex !== -1, "ci.yml should have a Smoke test built artifact step");
    assert.ok(
      smokeTestIndex > buildIndex,
      "Smoke test step should appear after Build package step",
    );
  });
});

describe("publish workflow build step", () => {
  let publishYml;

  before(() => {
    publishYml = readFileSync(path.join(ROOT, ".github", "workflows", "publish.yml"), "utf-8");
  });

  it("should contain a build step", () => {
    assert.ok(
      publishYml.includes("Build package"),
      "publish.yml should include a 'Build package' step",
    );
  });

  it("build step should run before the Configure Git step", () => {
    const buildIndex = publishYml.indexOf("Build package");
    const configureGitIndex = publishYml.indexOf("Configure Git");
    assert.ok(buildIndex !== -1, "publish.yml should have a Build package step");
    assert.ok(configureGitIndex !== -1, "publish.yml should have a Configure Git step");
    assert.ok(
      buildIndex < configureGitIndex,
      "Build package step should appear before Configure Git step",
    );
  });

  it("build step should use pnpm to run build", () => {
    const buildStepSection = publishYml.slice(
      publishYml.indexOf("Build package"),
      publishYml.indexOf("Build package") + 200,
    );
    assert.ok(
      buildStepSection.includes("pnpm build"),
      "publish.yml build step should use 'pnpm build'",
    );
  });

  it("build step should run after tests", () => {
    const testIndex = publishYml.indexOf("Run Tests");
    const buildIndex = publishYml.indexOf("Build package");
    assert.ok(testIndex !== -1, "publish.yml should have a Run Tests step");
    assert.ok(buildIndex !== -1, "publish.yml should have a Build package step");
    assert.ok(testIndex < buildIndex, "Run Tests step should appear before Build package step");
  });
});
