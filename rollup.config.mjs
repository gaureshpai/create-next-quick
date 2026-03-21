import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.js",
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "[name].js",
    chunkFileNames: "[name]-[hash].js",
    hoistTransitiveImports: false,
    generatedCode: {
      preset: "es2015",
      constBindings: true,
    },
  },
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    terser({
      compress: {
        passes: 2,
        drop_console: false,
        drop_debugger: true,
      },
      mangle: {
        properties: false,
      },
      format: {
        comments: false,
        shebang: true,
      },
    }),
  ],
  external: [],
};
