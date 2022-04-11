#!/bin/bash

if [ $# -ne 1 ]; then
    echo "./build.sh version"
    exit
fi

mkdir _

deno compile -A -r --unstable --target x86_64-unknown-linux-gnu -o _/brookscript_linux_amd64 https://raw.githubusercontent.com/txthinking/bash/master/brook.js

nami release github.com/txthinking/bash $1 _

rm -rf _
