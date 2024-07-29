import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "app/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    json(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
  ],
};
