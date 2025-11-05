import * as fs from 'node:fs/promises';
import { $ } from 'bun';

if (process.argv.length != 3) {
    console.log()
    console.log(`Get appid from macOS app:`)
    console.log()
    console.log(`  $ bunu https://bash.ooo/appid.js /Applications/Safari.app`)
    console.log()
    process.exit()
}

var l = await fs.readdir(process.argv[2], { recursive: true })
l = l.filter(v => v.endsWith('/Info.plist'))
var l1= []
for(var i=0;i<l.length;i++){
    try{
        l1.push((await $`defaults read '${process.argv[2]}/${l[i]}' CFBundleIdentifier`.text()).trim())
    }catch(e){
        console.error(e)
    }
}
console.log([...new Set(l1)].join('\n'))
