import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..", "..");

describe("rollup.config.mjs", function () {
  let config;

  before(async function () {
    const configPath = path.join(ROOT, "rollup.config.mjs");
    const mod = await import(configPath);
    config = mod.default;
  });

  describe("input", function () {
    it("should use src/index.js as the entry point", function () {
      assert.strictEqual(config.input, "src/index.js");
    });
  });

  describe("output", function () {
    it("should output to the dist directory", function () {
      assert.strictEqual(config.output.dir, "dist");
    });

    it("should use ESM output format", function () {
      assert.strictEqual(config.output.format, "esm");
    });

    it("should use [name].js pattern for entry file names", function () {
      assert.strictEqual(config.output.entryFileNames, "[name].js");
    });

    it("should use [name]-[hash].js pattern for chunk file names", function () {
      assert.strictEqual(config.output.chunkFileNames, "[name]-[hash].js");
    });

    it("should disable hoistTransitiveImports", function () {
      assert.strictEqual(config.output.hoistTransitiveImports, false);
    });

    it("should use es2015 preset for generatedCode", function () {
      assert.strictEqual(config.output.generatedCode.preset, "es2015");
    });

    it("should enable constBindings in generatedCode", function () {
      assert.strictEqual(config.output.generatedCode.constBindings, true);
    });
  });

  describe("plugins", function () {
    it("should have exactly 2 plugins configured", function () {
      assert.ok(Array.isArray(config.plugins), "plugins should be an array");
      assert.strictEqual(config.plugins.length, 2);
    });

    it("should have a node-resolve plugin as the first plugin", function () {
      const resolvePlugin = config.plugins[0];
      assert.ok(resolvePlugin != null, "first plugin should not be null");
      assert.ok(typeof resolvePlugin === "object", "first plugin should be an object");
    });

    it("should have a terser plugin as the second plugin", function () {
      const terserPlugin = config.plugins[1];
      assert.ok(terserPlugin != null, "second plugin should not be null");
      assert.ok(typeof terserPlugin === "object", "second plugin should be an object");
    });

    it("node-resolve plugin should have a name property", function () {
      const resolvePlugin = config.plugins[0];
      assert.ok(
        typeof resolvePlugin.name === "string" && resolvePlugin.name.length > 0,
        "resolve plugin should have a non-empty name",
      );
    });
  });

  describe("external", function () {
    it("should have an empty external array (bundle all dependencies)", function () {
      assert.ok(Array.isArray(config.external), "external should be an array");
      assert.strictEqual(config.external.length, 0);
    });
  });
});

describe("package.json build configuration", function () {
  let pkg;

  before(function () {
    const pkgPath = path.join(ROOT, "package.json");
    pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  });

  describe("main entry point", function () {
    it("should point to dist/index.js (compiled output)", function () {
      assert.strictEqual(pkg.main, "dist/index.js");
    });

    it("should not point to the source file src/index.js", function () {
      assert.notStrictEqual(pkg.main, "src/index.js");
    });
  });

  describe("bin entry point", function () {
    it("should have create-next-quick binary pointing to dist/index.js", function () {
      assert.strictEqual(pkg.bin["create-next-quick"], "dist/index.js");
    });

    it("should not point the binary to the source file src/index.js", function () {
      assert.notStrictEqual(pkg.bin["create-next-quick"], "src/index.js");
    });
  });

  describe("published files", function () {
    it("should include dist in the files array", function () {
      assert.ok(Array.isArray(pkg.files), "files should be an array");
      assert.ok(pkg.files.includes("dist"), "files should include 'dist'");
    });

    it("should not include src in the published files", function () {
      assert.ok(!pkg.files.includes("src"), "files should not include 'src'");
    });
  });

  describe("scripts", function () {
    it("should have a build script using rollup", function () {
      assert.ok(pkg.scripts.build != null, "build script should exist");
      assert.ok(
        pkg.scripts.build.includes("rollup"),
        "build script should invoke rollup",
      );
    });

    it("build script should use the rollup config file (-c flag)", function () {
      assert.ok(
        pkg.scripts.build.includes("-c"),
        "build script should include -c flag to use rollup.config.mjs",
      );
    });

    it("build script should set BUILD:production environment", function () {
      assert.ok(
        pkg.scripts.build.includes("BUILD:production"),
        "build script should set BUILD:production environment variable",
      );
    });

    it("should have a start script pointing to dist/index.js", function () {
      assert.ok(pkg.scripts.start != null, "start script should exist");
      assert.strictEqual(pkg.scripts.start, "node dist/index.js");
    });
  });

  describe("devDependencies", function () {
    it("should include rollup as a devDependency", function () {
      assert.ok(pkg.devDependencies.rollup != null, "rollup should be in devDependencies");
    });

    it("rollup version should be >= 4.0.0", function () {
      const version = pkg.devDependencies.rollup;
      assert.ok(
        version.startsWith("^4") || version.startsWith("4") || version.startsWith(">=4"),
        `rollup version '${version}' should be ^4.x.x`,
      );
    });

    it("should include @rollup/plugin-node-resolve", function () {
      assert.ok(
        pkg.devDependencies["@rollup/plugin-node-resolve"] != null,
        "@rollup/plugin-node-resolve should be in devDependencies",
      );
    });

    it("should include @rollup/plugin-terser", function () {
      assert.ok(
        pkg.devDependencies["@rollup/plugin-terser"] != null,
        "@rollup/plugin-terser should be in devDependencies",
      );
    });

    it("should include @rollup/plugin-alias", function () {
      assert.ok(
        pkg.devDependencies["@rollup/plugin-alias"] != null,
        "@rollup/plugin-alias should be in devDependencies",
      );
    });
  });
});

describe(".gitignore build artifact exclusion", function () {
  let gitignoreContent;

  before(function () {
    gitignoreContent = readFileSync(path.join(ROOT, ".gitignore"), "utf-8");
  });

  it("should exclude dist/ from version control", function () {
    assert.ok(
      gitignoreContent.includes("dist/"),
      ".gitignore should contain 'dist/' to exclude the build output directory",
    );
  });

  it("dist/ entry should be on its own line", function () {
    const lines = gitignoreContent.split("\n").map((l) => l.trim());
    assert.ok(
      lines.includes("dist/"),
      ".gitignore should have 'dist/' as a standalone line entry",
    );
  });
});

describe("biome.json dist exclusion", function () {
  let biomeConfig;

  before(function () {
    biomeConfig = JSON.parse(readFileSync(path.join(ROOT, "biome.json"), "utf-8"));
  });

  it("should have a files.ignore configuration", function () {
    assert.ok(
      biomeConfig.files != null && Array.isArray(biomeConfig.files.ignore),
      "biome.json should have files.ignore array",
    );
  });

  it("should ignore dist/** in biome linting/formatting", function () {
    assert.ok(
      biomeConfig.files.ignore.includes("dist/**"),
      "biome.json files.ignore should contain 'dist/**'",
    );
  });

  it("should not lint/format any path under dist", function () {
    const ignorePatterns = biomeConfig.files.ignore;
    const coversDistDir = ignorePatterns.some(
      (p) => p === "dist/**" || p === "dist/" || p === "dist",
    );
    assert.ok(coversDistDir, "At least one ignore pattern should cover the dist directory");
  });
});

describe("CI workflow build step", function () {
  let ciYml;

  before(function () {
    ciYml = readFileSync(path.join(ROOT, ".github", "workflows", "ci.yml"), "utf-8");
  });

  it("should contain a build step", function () {
    assert.ok(
      ciYml.includes("Build package"),
      "ci.yml should include a 'Build package' step",
    );
  });

  it("build step should run before the test step", function () {
    const buildIndex = ciYml.indexOf("Build package");
    const testIndex = ciYml.indexOf("Run tests");
    assert.ok(buildIndex !== -1, "ci.yml should have a Build package step");
    assert.ok(testIndex !== -1, "ci.yml should have a Run tests step");
    assert.ok(buildIndex < testIndex, "Build package step should appear before Run tests step");
  });

  it("build step should use the matrix package-manager variable", function () {
    const buildStepSection = ciYml.slice(
      ciYml.indexOf("Build package"),
      ciYml.indexOf("Build package") + 200,
    );
    assert.ok(
      buildStepSection.includes("matrix.package-manager"),
      "Build step should use ${{ matrix.package-manager }} to run build",
    );
  });

  it("build step should invoke the build command", function () {
    const buildStepSection = ciYml.slice(
      ciYml.indexOf("Build package"),
      ciYml.indexOf("Build package") + 200,
    );
    assert.ok(
      buildStepSection.includes("run build"),
      "Build step should run the 'build' script",
    );
  });
});

describe("publish workflow build step", function () {
  let publishYml;

  before(function () {
    publishYml = readFileSync(path.join(ROOT, ".github", "workflows", "publish.yml"), "utf-8");
  });

  it("should contain a build step", function () {
    assert.ok(
      publishYml.includes("Build package"),
      "publish.yml should include a 'Build package' step",
    );
  });

  it("build step should run before the Configure Git step", function () {
    const buildIndex = publishYml.indexOf("Build package");
    const configureGitIndex = publishYml.indexOf("Configure Git");
    assert.ok(buildIndex !== -1, "publish.yml should have a Build package step");
    assert.ok(configureGitIndex !== -1, "publish.yml should have a Configure Git step");
    assert.ok(
      buildIndex < configureGitIndex,
      "Build package step should appear before Configure Git step",
    );
  });

  it("build step should use pnpm to run build", function () {
    const buildStepSection = publishYml.slice(
      publishYml.indexOf("Build package"),
      publishYml.indexOf("Build package") + 200,
    );
    assert.ok(
      buildStepSection.includes("pnpm build"),
      "publish.yml build step should use 'pnpm build'",
    );
  });

  it("build step should run after tests", function () {
    const testIndex = publishYml.indexOf("Run Tests");
    const buildIndex = publishYml.indexOf("Build package");
    assert.ok(testIndex !== -1, "publish.yml should have a Run Tests step");
    assert.ok(buildIndex !== -1, "publish.yml should have a Build package step");
    assert.ok(
      testIndex < buildIndex,
      "Run Tests step should appear before Build package step",
    );
  });
});