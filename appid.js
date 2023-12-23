#!/usr/bin/env jb

import fs from 'node:fs'

if (process.argv.length != 3) {
    echo()
    echo(`Get appid from macOS app:`)
    echo()
    echo(`  $ jb https://bash.ooo/appid.js /Applications/Safari.app`)
    echo()
    exit()
}

var l = fs.readdirSync(process.argv[2], { recursive: true })
    .filter(v => v.endsWith('Info.plist'))
    .map(v => $1(`defaults read '${process.argv[2]}/${v}' CFBundleIdentifier`))
echo([...new Set(l)].join('\n'))
