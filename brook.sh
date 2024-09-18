#!/bin/bash

if [ "$(uname -s)" != "Linux" ];then
    echo "This script only support Linux";
    exit;
fi

restartsh=""
if [ ! -f "$HOME/.nami/bin/nami" ] || [ ! -f "$HOME/.nami/bin/joker" ] || [ ! -f "$HOME/.nami/bin/brook" ] || [ ! -f "$HOME/.nami/bin/7z" ] || [ ! -f "$HOME/.nami/bin/bun" ] || [ ! -f "$HOME/.nami/bin/bunu" ] || [ `echo $PATH | grep $HOME/.nami/bin | wc -l` -eq 0 ];then
	mkdir -p $HOME/.nami/bin
	curl -L -o $HOME/.nami/bin/nami "https://github.com/txthinking/nami/releases/latest/download/nami_linux_amd64"
	chmod +x $HOME/.nami/bin/nami
	echo 'export PATH=$HOME/.nami/bin:$PATH' >> $HOME/.bashrc
	echo 'export PATH=$HOME/.nami/bin:$PATH' >> $HOME/.bash_profile
	echo 'export PATH=$HOME/.nami/bin:$PATH' >> $HOME/.zshenv
	export PATH=$HOME/.nami/bin:$PATH
	nami install joker
	nami install brook
	nami install 7z
	nami install bun
	nami install bun.plus
	restartsh="todo"
fi

bunu https://bash.ooo/brook.js

if [ "$restartsh" = "todo" ];then
    exec -l $SHELL
fi
