import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = process.argv[2] ?? "sites";
const expectedNode = "22.23.2";

if (!new Set(["sites", "pages"]).has(target)) {
  console.error(`Unknown build target: ${target}. Expected "sites" or "pages".`);
  process.exit(2);
}
if (process.versions.node !== expectedNode) {
  console.error(`This site build is pinned to Node ${expectedNode}; current runtime is ${process.versions.node}.`);
  console.error("Use pages/.node-version or pages/.nvmrc so vinext exits cleanly after static prerendering on Windows.");
  process.exit(3);
}

await run(process.execPath, [path.join(siteRoot, "scripts", "generate-social-preview.mjs")]);
const vinextArgs = [path.join(siteRoot, "node_modules", "vinext", "dist", "cli.js"), "build"];
if (target === "pages") vinextArgs.push("--prerender-concurrency", "1");

await run(process.execPath, vinextArgs, {
  ...process.env,
  WINFORGE_BUILD_TARGET: target,
  WRANGLER_WRITE_LOGS: "false",
  WRANGLER_LOG_PATH: path.join(siteRoot, ".wrangler", "wrangler.log"),
});

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: siteRoot,
      env,
      stdio: "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(command)} exited with ${code ?? signal ?? "unknown status"}`));
    });
  });
}
