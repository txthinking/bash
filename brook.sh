#!/bin/bash

if [ "$(uname -s)" != "Linux" ];then
    echo "This script only support Linux";
    exit;
fi
if [ "$(uname -m)" != "x86_64" ]; then
    echo "This script only support amd64";
    exit;
fi
if [ `cat /etc/*elease 2>/dev/null | grep 'CentOS Linux 7' | wc -l` -eq 1 ]
then
    echo "Requires CentOS version >= 8";
    exit;
fi

restartsh=""
if [ ! -f "$HOME/.nami/bin/nami" ] || [ ! -f "$HOME/.nami/bin/joker" ] || [ ! -f "$HOME/.nami/bin/brook" ] || [ ! -f "$HOME/.nami/bin/brookscript" ] || [ ! -f "$HOME/.nami/bin/jq" ] || [ `echo $PATH | grep $HOME/.nami/bin | wc -l` -eq 0 ];then
	mkdir -p $HOME/.nami/bin
	curl -L -o $HOME/.nami/bin/nami "https://github.com/txthinking/nami/releases/latest/download/nami_linux_amd64"
	chmod +x $HOME/.nami/bin/nami
	echo 'export PATH=$HOME/.nami/bin:$PATH' >> $HOME/.bashrc
	echo 'export PATH=$HOME/.nami/bin:$PATH' >> $HOME/.bash_profile
	echo 'export PATH=$HOME/.nami/bin:$PATH' >> $HOME/.zshenv
	export PATH=$HOME/.nami/bin:$PATH
	nami install joker
	nami install brook
	nami install brookscript
	nami install jq
	restartsh="todo"
fi

if [ `curl -s https://api.github.com/repos/txthinking/bash/releases/latest | jq -r .tag_name` != `brookscript -v` ]
then
    nami install brookscript
fi

brookscript

if [ "$restartsh" = "todo" ];then
    exec -l $SHELL
fi
