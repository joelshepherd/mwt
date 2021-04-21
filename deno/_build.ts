import * as base64 from "https://deno.land/std/encoding/base64.ts";

// Build rust project
const buildStatus = await Deno.run({
  cmd: [
    "cargo",
    "build",
    "--target",
    "wasm32-unknown-unknown",
    "--release",
  ],
}).status();
if (!buildStatus.success) {
  console.error(`Failed to build cargo: ${buildStatus.code}`);
  Deno.exit(1);
}

// Generate wasm bindings
const genStatus = await Deno.run({
  cmd: [
    "wasm-bindgen",
    "--target",
    "deno",
    "--out-dir",
    "wasm",
    "--weak-refs",
    "../target/wasm32-unknown-unknown/release/wasm.wasm",
  ],
}).status();
if (!genStatus.success) {
  console.error(`Failed to generate bindings: ${genStatus.code}`);
  Deno.exit(1);
}

// Read wasm output
const wasm = await Deno.readFile(`wasm/wasm_bg.wasm`);
const encodedWasm = base64.encode(wasm);

// Add custom bootstrap
let script = `import * as base64 from "https://deno.land/std/encoding/base64.ts";`;
script += await Deno.readTextFile("wasm/wasm.js");
script = script.replace(
  `const file = new URL(import.meta.url).pathname;
const wasmFile = file.substring(0, file.lastIndexOf(Deno.build.os === 'windows' ? '\\\\' : '/') + 1) + 'wasm_bg.wasm';
const wasmModule = new WebAssembly.Module(Deno.readFileSync(wasmFile));`,
  `const wasmModule = new WebAssembly.Module(base64.decode("${encodedWasm}"));`,
);

// Save file
await Deno.writeFile("_wasm.js", new TextEncoder().encode(script));
