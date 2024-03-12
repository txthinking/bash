import fs from "node:fs/promises";
import path from "node:path";

if (process.argv.length < 3) {
    echo(`
static/
└── hello.txt

$ jb https://bash.ooo/bundle.js static bundle.js

import readFileSync from './bundle.js';
var data = readFileSync("static/hello.txt"); // Uint8Array
`)
    exit(1)
}

var dir = process.argv[2].endsWith("/") ? process.argv[2].slice(0, -1) : process.argv[2];
var output = process.argv.length >= 4 ? process.argv[3] : "bundle.js"

var f = await fs.open(output, 'w');
await fs.write(f, new TextEncoder().encode(`var m = {};\n`));
var l = await fs.readdir(dir, { recursive: true, withFileTypes: true })
for (var v of l) {
    if (v.isFile()) {
        var k = dir + "/" + v.name
        k = k.replace(dir, path.basename(dir))
        await fs.write(f, new TextEncoder().encode(`m["${k}"] = new Uint8Array([`));
        var b = new Uint8Array(await Bun.file(path.join(dir, v.name)).arrayBuffer());
        for (var j = 0; j < b.length; j++) {
            await fs.write(f, new TextEncoder().encode(`${b[j]},`));
        }
        await fs.write(f, new TextEncoder().encode(`]);\n`));
    }
}
await fs.write(f, new TextEncoder().encode(`export default function(k){if(m[k]) return m[k]; throw 'NotFound';}\n`));
await fs.close(f)
