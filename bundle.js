import * as fs from 'node:fs/promises'

if (process.argv.length < 4) {
    console.log("$ bunu https://bash.ooo/bundle.js /path/to/directory bundled.js")
    console.log("```")
    console.log("import readfile from './bundled.js'")
    console.log("new TextDecoder().decode(readfile('public/to/file'))")
    console.log("```")
    process.exit(1)
}

var dir = process.argv[2].endsWith("/") ? process.argv[2] : process.argv[2] + '/'
var output = process.argv[3]

var f = await fs.open(output, 'w+');
await fs.write(f.fd, new TextEncoder().encode(`var m = {};\n`));
var l = await fs.readdir(dir, { recursive: true, withFileTypes: true })
for (var v of l) {
    if (v.isFile()) {
        var s = v.path + "/" + v.name
        var k = s.replace(dir, '')
        await fs.write(f.fd, new TextEncoder().encode(`m["${k}"] = new Uint8Array([`));
        var b = new Uint8Array(await Bun.file(s).arrayBuffer());
        for (var j = 0; j < b.length; j++) {
            await fs.write(f.fd, new TextEncoder().encode(`${b[j]},`));
        }
        await fs.write(f.fd, new TextEncoder().encode(`]);\n`));
    }
}
await fs.write(f.fd, new TextEncoder().encode(`export default function(k){if(m[k]) return m[k]; throw 'NotFound';}\n`));
await fs.close(f.fd)
