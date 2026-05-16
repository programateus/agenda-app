import { build } from "esbuild";

const common = {
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  sourcemap: true,
  packages: "external",
};

await Promise.all([
  build({
    ...common,
    entryPoints: ["src/lambdas/processScheduleEvent.ts"],
    outfile: "dist/lambdas/processScheduleEvent.js",
  }),
  build({
    ...common,
    entryPoints: ["src/lambdas/processChatMessage.ts"],
    outfile: "dist/lambdas/processChatMessage.js",
  }),
]);
