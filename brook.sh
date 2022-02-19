#!/bin/bash

if [ "$(uname -s)" != "Linux" ];then
    echo "This script only support Linux";
    exit;
fi

ip4=`curl -s -4 ipip.ooo`
ip6=`curl -s -6 ipip.ooo`

if [ "$ip4" = "" -a "$ip6" = "" ];then
    echo "Can not find your server public IP";
    exit;
fi

PC='\033[0;35m'
NC='\033[0m'
lang=""
restartsh=""

function install(){
    if [ ! -f "$HOME/.nami/bin/nami" ] || [ ! -f "$HOME/.nami/bin/joker" ] || [ ! -f "$HOME/.nami/bin/brook" ] || [ ! -f "$HOME/.nami/bin/jinbe" ] || [ `echo $PATH | grep $HOME/.nami/bin | wc -l` -eq 0 ];then
        echo
        echo -e "$PC"'>>> bash <(curl https://bash.ooo/nami.sh)'"$NC"
        os=""
        arch=""
        if [ $(uname -s) = "Darwin" ]; then
            os="darwin"
        fi
        if [ $(uname -s) = "Linux" ]; then
            os="linux"
        fi
        if [ $(uname -s | grep "MINGW" | wc -l) -eq 1 ]; then
            os="windows"
        fi
        if [ $(uname -m) = "x86_64" ]; then
            arch="amd64"
        fi
        if [ $(uname -m) = "arm64" ]; then
            arch="arm64"
        fi
        if [ $(uname -m) = "aarch64" ]; then
            arch="arm64"
        fi
        if [ "$os" = "" -o "$arch" = "" ]; then
            echo "Nami does not support your OS/ARCH yet. Please submit issue or PR to https://github.com/txthinking/nami"
            exit
        fi
        sfx=""
        if [ $os = "windows" ]; then
            sfx=".exe"
        fi
        mkdir -p $HOME/.nami/bin
        curl -L -o $HOME/.nami/bin/nami$sfx "https://github.com/txthinking/nami/releases/latest/download/nami_${os}_${arch}$sfx"
        chmod +x $HOME/.nami/bin/nami
        echo 'export PATH=$HOME/.nami/bin:$PATH' >> $HOME/.bashrc
        echo 'export PATH=$HOME/.nami/bin:$PATH' >> $HOME/.bash_profile
        echo 'export PATH=$HOME/.nami/bin:$PATH' >> $HOME/.zshenv
        export PATH=$HOME/.nami/bin:$PATH
        echo
        echo -e "$PC"'>>> nami install joker brook jinbe'"$NC"
        nami install joker brook jinbe
        restartsh="todo"
    fi
}

function all(){
    test "$lang" = "en" && echo "1. I want to run brook server/wsserver/wssserver/socks5";
    test "$lang" = "en" && echo "2. I want to see running brook command";
    test "$lang" = "en" && echo "3. I want to stop a brook command";
    test "$lang" = "en" && echo "4. I want to add auto start brook server/wsserver/wssserver/socks5 at boot";
    test "$lang" = "en" && echo "5. I want to see auto start brook command at boot";
    test "$lang" = "en" && echo "6. I want to remove a brook command from auto start at boot";
    test "$lang" = "zh" && echo "1. 我想运行 brook server/wsserver/wssserver/socks5";
    test "$lang" = "zh" && echo "2. 我想查看运行中的 brook 命令";
    test "$lang" = "zh" && echo "3. 我想停止某个 brook 命令";
    test "$lang" = "zh" && echo "4. 我想添加开机自启动 brook server/wsserver/wssserver/socks5";
    test "$lang" = "zh" && echo "5. 我想查看开机自启动的 brook 命令";
    test "$lang" = "zh" && echo "6. 我想移除某个开机自启动 brook 命令";
    while true; do
        test "$lang" = "en" && read -p "Choose what you want to do: " v
        test "$lang" = "zh" && read -p "选择你想做什么: " v
        case $v in
            1 )
                install;
                test "$lang" = "en" && echo "1. I want to run brook server";
                test "$lang" = "en" && echo "2. I want to run brook wsserver";
                test "$lang" = "en" && echo "3. I want to run brook wssserver";
                test "$lang" = "en" && echo "4. I want to run brook socks5";
                test "$lang" = "zh" && echo "1. 我想运行 brook server";
                test "$lang" = "zh" && echo "2. 我想运行 brook wsserver";
                test "$lang" = "zh" && echo "3. 我想运行 brook wssserver";
                test "$lang" = "zh" && echo "4. 我想运行 brook socks5";
                while true; do
                    test "$lang" = "en" && read -p "Choose which you want to run: " v
                    test "$lang" = "zh" && read -p "选择你想运行什么: " v
                    case $v in
                        1 )
                            test "$lang" = "en" && read -p "Type a port for your brook server, such as 9999: " port
                            test "$lang" = "en" && read -p "Type a password for your brook server, such as mypassword: " password
                            test "$lang" = "zh" && read -p "输入一个端口给你的 brook server, 比如 9999: " port
                            test "$lang" = "zh" && read -p "输入一个密码给你的 brook server, 比如 mypassword: " password

                            echo
                            echo -e "$PC"">>> joker brook server --listen :$port --password '$password'""$NC"
                            joker brook server --listen :$port --password "$password"

                            sleep 3

                            echo
                            echo -e "$PC"">>> joker list""$NC"
                            joker list

                            echo;
                            echo -e "$PC"'>>> joker log `joker last`'"$NC"
                            joker log `joker last`

                            if [ -n "$ip4" ]; then
                                echo;
                                echo -e "$PC"">>> brook link -s $ip4:$port -p '$password'""$NC"
                                brook link -s $ip4:$port -p "$password"
                            fi
                            if [ -n "$ip6" ]; then
                                echo;
                                echo -e "$PC"">>> brook link -s [$ip6]:$port -p '$password'""$NC"
                                brook link -s [$ip6]:$port -p "$password"
                            fi

                            echo;
                            test "$lang" = "en" && echo "Tip: if there is a firewall, remember to open TCP and UDP $port"
                            test "$lang" = "zh" && echo "提示: 如果有防火墙, 记得开放 TCP 和 UDP $port"

                            break;;
                        2 )
                            test "$lang" = "en" && read -p "Type a port for your brook wsserver, such as 9999: " port
                            test "$lang" = "en" && read -p "Type a password for your brook wsserver, such as mypassword: " password
                            test "$lang" = "zh" && read -p "输入一个端口给你的 brook wsserver, 比如 9999: " port
                            test "$lang" = "zh" && read -p "输入一个密码给你的 brook wsserver, 比如 mypassword: " password

                            echo
                            echo -e "$PC"">>> joker brook wsserver --listen :$port --password '$password'""$NC"
                            joker brook wsserver --listen :$port --password "$password"

                            sleep 3

                            echo
                            echo -e "$PC"">>> joker list""$NC"
                            joker list

                            echo;
                            echo -e "$PC"'>>> joker log `joker last`'"$NC"
                            joker log `joker last`

                            if [ -n "$ip4" ]; then
                                echo;
                                echo -e "$PC"">>> brook link -s ws://$ip4:$port -p '$password'""$NC"
                                brook link -s ws://$ip4:$port -p "$password"
                            fi
                            if [ -n "$ip6" ]; then
                                echo;
                                echo -e "$PC"">>> brook link -s [$ip6]:$port -p '$password'""$NC"
                                brook link -s ws://[$ip6]:$port -p "$password"
                            fi

                            echo;
                            test "$lang" = "en" && echo "Tip: if there is a firewall, remember to open TCP $port"
                            test "$lang" = "zh" && echo "提示: 如果有防火墙, 记得开放 TCP $port"

                            break;;
                        3 )
                            test "$lang" = "en" && read -p "Type your domain your brook wssserver, such as example.com: " domain
                            test "$lang" = "en" && read -p "Type a password for your brook wsserver, such as mypassword: " password
                            test "$lang" = "zh" && read -p "输入一个域名给你的 brook wssserver, 比如 example.com: " domain
                            test "$lang" = "zh" && read -p "输入一个密码给你的 brook wssserver, 比如 mypassword: " password

                            echo
                            echo -e "$PC"">>> joker brook wssserver --domain $domain --password '$password'""$NC"
                            joker brook wssserver --domain $domain --password "$password"

                            sleep 3

                            echo
                            echo -e "$PC"">>> joker list""$NC"
                            joker list

                            echo;
                            echo -e "$PC"'>>> joker log `joker last`'"$NC"
                            joker log `joker last`

                            echo;
                            echo -e "$PC"">>> brook link -s wss://$domain:443 -p '$password'""$NC"
                            brook link -s wss://$domain:443 -p "$password"

                            echo;
                            test "$lang" = "en" && echo "Tip: if there is a firewall, remember to open TCP 80 and 443"
                            test "$lang" = "en" && echo "Tip: do not forget to resolve your domain to your server IP"
                            test "$lang" = "zh" && echo "提示: 如果有防火墙, 记得开放 TCP 80 和 443"
                            test "$lang" = "zh" && echo "提示: 不要忘记将你的域名指向你服务器的IP"
                            break;;
                        4 )
                            while true; do
                                test "$lang" = "en" && echo "1. I want to run socks5 server without username and password";
                                test "$lang" = "en" && echo "2. I want to run socks5 server with username and password";
                                test "$lang" = "zh" && echo "1. 我想运行一个socks5 server, 不设置用户名和密码";
                                test "$lang" = "zh" && echo "2. 我想运行一个socks5 server, 并设置用户名和密码";
                                test "$lang" = "en" && read -p "Choose which you want to run: " v
                                test "$lang" = "zh" && read -p "选择你的socks5 server, 要不要用户吗和密码: " v
                                case $v in
                                    1 )
                                        test "$lang" = "en" && read -p "Type a port for your socks5 server, such as 9999: " port
                                        test "$lang" = "zh" && read -p "输入一个端口给你的 socks5 server, 比如 9999: " port
                                        if [ -n "$ip4" ]; then
                                            echo
                                            if [ `brook -v | awk '{print $3}'` -le 20210701 ]
                                            then
                                                echo -e "$PC"">>> joker brook socks5 --socks5 $ip4:$port""$NC"
                                                joker brook socks5 --socks5 $ip4:$port
                                            fi
                                            if [ `brook -v | awk '{print $3}'` -gt 20210701 ]
                                            then
                                                echo -e "$PC"">>> joker brook socks5 --listen :$port --socks5ServerIP $ip4""$NC"
                                                joker brook socks5 --listen :$port --socks5ServerIP $ip4
                                            fi

                                            sleep 3

                                            echo
                                            echo -e "$PC"">>> joker list""$NC"
                                            joker list

                                            echo;
                                            echo -e "$PC"'>>> joker log `joker last`'"$NC"
                                            joker log `joker last`

                                            echo;
                                            echo -e "$PC"">>> brook link -s socks5://$ip4:$port""$NC"
                                            brook link -s socks5://$ip4:$port
                                        fi

                                        if [ -z "$ip4" -a -n "$ip6" ]; then
                                            echo
                                            if [ `brook -v | awk '{print $3}'` -le 20210701 ]
                                            then
                                                echo -e "$PC"">>> joker brook socks5 --socks5 [$ip6]:$port""$NC"
                                                joker brook socks5 --socks5 [$ip6]:$port
                                            fi
                                            if [ `brook -v | awk '{print $3}'` -gt 20210701 ]
                                            then
                                                echo -e "$PC"">>> joker brook socks5 --listen :$port --socks5ServerIP $ip6""$NC"
                                                joker brook socks5 --listen :$port --socks5ServerIP $ip6
                                            fi

                                            sleep 3

                                            echo
                                            echo -e "$PC"">>> joker list""$NC"
                                            joker list

                                            echo;
                                            echo -e "$PC"'>>> joker log `joker last`'"$NC"
                                            joker log `joker last`

                                            echo;
                                            echo -e "$PC"">>> brook link -s socks5://[$ip6]:$port""$NC"
                                            brook link -s socks5://[$ip6]:$port
                                        fi

                                        echo;
                                        test "$lang" = "en" && echo "Tip: if there is a firewall, remember to open TCP and UDP $port"
                                        test "$lang" = "zh" && echo "提示: 如果有防火墙, 记得开放 TCP 和 UDP $port"
                                        break;;
                                    2 )
                                        test "$lang" = "en" && read -p "Type a port for your socks5 server, such as 9999: " port
                                        test "$lang" = "en" && read -p "Type a username for your socks5 server, such as myusername: " username
                                        test "$lang" = "en" && read -p "Type a password for your socks5 server, such as mypassword: " password
                                        test "$lang" = "zh" && read -p "输入一个端口给你的 socks5 server, 比如 9999: " port
                                        test "$lang" = "zh" && read -p "输入一个用户名给你的 socks5 server, 比如 myusername: " username
                                        test "$lang" = "zh" && read -p "输入一个密码给你的 socks5 server, 比如 mypassword: " password
                                        if [ -n "$ip4" ]; then
                                            echo
                                            if [ `brook -v | awk '{print $3}'` -le 20210701 ]
                                            then
                                                echo -e "$PC"">>> joker brook socks5 --socks5 $ip4:$port --username '$username' --password '$password'""$NC"
                                                joker brook socks5 --socks5 $ip4:$port --username "$username" --password "$password"
                                            fi
                                            if [ `brook -v | awk '{print $3}'` -gt 20210701 ]
                                            then
                                                echo -e "$PC"">>> joker brook socks5 --listen :$port --socks5ServerIP $ip4 --username '$username' --password '$password'""$NC"
                                                joker brook socks5 --listen :$port --socks5ServerIP $ip4 --username "$username" --password "$password"
                                            fi

                                            sleep 3

                                            echo
                                            echo -e "$PC"">>> joker list""$NC"
                                            joker list

                                            echo;
                                            echo -e "$PC"'>>> joker log `joker last`'"$NC"
                                            joker log `joker last`

                                            echo;
                                            echo -e "$PC"">>> brook link -s socks5://$ip4:$port -u '$username' -p '$password'""$NC"
                                            brook link -s socks5://$ip4:$port -u "$username" -p "$password"
                                        fi

                                        if [ -z "$ip4" -a -n "$ip6" ]; then
                                            echo
                                            if [ `brook -v | awk '{print $3}'` -le 20210701 ]
                                            then
                                                echo -e "$PC"">>> joker brook socks5 --socks5 [$ip6]:$port --username '$username' --password '$password'""$NC"
                                                joker brook socks5 --socks5 [$ip6]:$port --username "$username" --password "$password"
                                            fi
                                            if [ `brook -v | awk '{print $3}'` -gt 20210701 ]
                                            then
                                                echo -e "$PC"">>> joker brook socks5 --listen :$port --socks5ServerIP $ip6 --username '$username' --password '$password'""$NC"
                                                joker brook socks5 --listen :$port --socks5ServerIP $ip6 --username "$username" --password "$password"
                                            fi

                                            sleep 3

                                            echo
                                            echo -e "$PC"">>> joker list""$NC"
                                            joker list

                                            echo;
                                            echo -e "$PC"'>>> joker log `joker last`'"$NC"
                                            joker log `joker last`

                                            echo;
                                            echo -e "$PC"">>> brook link -s socks5://[$ip6]:$port -u '$username' -p '$password'""$NC"
                                            brook link -s socks5://[$ip6]:$port -u "$username" -p "$password"
                                        fi

                                        echo;
                                        test "$lang" = "en" && echo "Tip: if there is a firewall, remember to open TCP and UDP $port"
                                        test "$lang" = "zh" && echo "提示: 如果有防火墙, 记得开放 TCP 和 UDP $port"
                                        break;;
                                    * ) echo "";;
                                esac
                            done
                            break;;
                        * ) echo "";;
                    esac
                done
                break;;
            2 )
                install;
                echo
                echo -e "$PC"">>> joker list""$NC"
                joker list
                break;;
            3 )
                install;
                echo
                echo -e "$PC"">>> joker list""$NC"
                joker list
                test "$lang" = "en" && read -p "Choose a PID your want to stop: " pid
                test "$lang" = "zh" && read -p "选择你要停止的PID: " pid
                echo
                echo -e "$PC"">>> joker stop $pid""$NC"
                joker stop $pid
                break;;
            4 )
                if [ `cat /etc/*elease 2>/dev/null | grep 'CentOS Linux 7' | wc -l` -eq 1 ]
                then
                    test "$lang" = "en" && echo "jinbe requires CentOS version >= 8";
                    test "$lang" = "zh" && echo "jinbe 需要 CentOS 版本至少是 8";
                    exit;
                fi
                install;
                test "$lang" = "en" && echo "1. I want add brook server";
                test "$lang" = "en" && echo "2. I want add brook wsserver";
                test "$lang" = "en" && echo "3. I want add brook wssserver";
                test "$lang" = "en" && echo "4. I want add brook socks5";
                test "$lang" = "zh" && echo "1. 我想添加 brook server";
                test "$lang" = "zh" && echo "2. 我想添加 brook wsserver";
                test "$lang" = "zh" && echo "3. 我想添加 brook wssserver";
                test "$lang" = "zh" && echo "4. 我想添加 brook socks5";
                while true; do
                    test "$lang" = "en" && read -p "Choose which you want to add: " v
                    test "$lang" = "zh" && read -p "选择你想添加什么: " v
                    case $v in
                        1 )
                            test "$lang" = "en" && read -p "Type a port for your brook server, such as 9999: " port
                            test "$lang" = "en" && read -p "Type a password for your brook server, such as mypassword: " password
                            test "$lang" = "zh" && read -p "输入一个端口给你的 brook server, 比如 9999: " port
                            test "$lang" = "zh" && read -p "输入一个密码给你的 brook server, 比如 mypassword: " password

                            echo
                            echo -e "$PC"">>> jinbe joker brook server --listen :$port --password '$password'""$NC"
                            jinbe joker brook server --listen :$port --password "$password"

                            sleep 3

                            echo
                            echo -e "$PC"">>> jinbe list""$NC"
                            jinbe list

                            break;;
                        2 )
                            test "$lang" = "en" && read -p "Type a port for your brook wsserver, such as 9999: " port
                            test "$lang" = "en" && read -p "Type a password for your brook wsserver, such as mypassword: " password
                            test "$lang" = "zh" && read -p "输入一个端口给你的 brook wsserver, 比如 9999: " port
                            test "$lang" = "zh" && read -p "输入一个密码给你的 brook wsserver, 比如 mypassword: " password

                            echo
                            echo -e "$PC"">>> jinbe joker brook wsserver --listen :$port --password '$password'""$NC"
                            jinbe joker brook wsserver --listen :$port --password "$password"

                            sleep 3

                            echo
                            echo -e "$PC"">>> jinbe list""$NC"
                            jinbe list

                            break;;
                        3 )
                            test "$lang" = "en" && read -p "Type your domain your brook wssserver, such as example.com: " domain
                            test "$lang" = "en" && read -p "Type a password for your brook wsserver, such as mypassword: " password
                            test "$lang" = "zh" && read -p "输入一个域名给你的 brook wssserver, 比如 example.com: " domain
                            test "$lang" = "zh" && read -p "输入一个密码给你的 brook wssserver, 比如 mypassword: " password

                            echo
                            echo -e "$PC"">>> jinbe joker brook wssserver --domain $domain --password '$password'""$NC"
                            jinbe joker brook wssserver --domain $domain --password "$password"

                            sleep 3

                            echo
                            echo -e "$PC"">>> jinbe list""$NC"
                            jinbe list

                            break;;
                        4 )
                            while true; do
                                test "$lang" = "en" && echo "1. I want to run socks5 server without username and password";
                                test "$lang" = "en" && echo "2. I want to run socks5 server with username and password";
                                test "$lang" = "zh" && echo "1. 我想运行一个socks5 server, 不设置用户名和密码";
                                test "$lang" = "zh" && echo "2. 我想运行一个socks5 server, 并设置用户名和密码";
                                test "$lang" = "en" && read -p "Choose which you want to run: " v
                                test "$lang" = "zh" && read -p "选择你的socks5 server, 要不要用户吗和密码: " v
                                case $v in
                                    1 )
                                        test "$lang" = "en" && read -p "Type a port for your socks5 server, such as 9999: " port
                                        test "$lang" = "zh" && read -p "输入一个端口给你的 socks5 server, 比如 9999: " port
                                        if [ -n "$ip4" ]; then
                                            echo
                                            if [ `brook -v | awk '{print $3}'` -le 20210701 ]
                                            then
                                                echo -e "$PC"">>> jinbe joker brook socks5 --socks5 $ip4:$port""$NC"
                                                jinbe joker brook socks5 --socks5 $ip4:$port
                                            fi
                                            if [ `brook -v | awk '{print $3}'` -gt 20210701 ]
                                            then
                                                echo -e "$PC"">>> jinbe joker brook socks5 --listen :$port --socks5ServerIP $ip4""$NC"
                                                jinbe joker brook socks5 --listen :$port --socks5ServerIP $ip4
                                            fi

                                            sleep 3

                                            echo
                                            echo -e "$PC"">>> jinbe list""$NC"
                                            jinbe list
                                        fi

                                        if [ -z "$ip4" -a -n "$ip6" ]; then
                                            echo
                                            if [ `brook -v | awk '{print $3}'` -le 20210701 ]
                                            then
                                                echo -e "$PC"">>> jinbe joker brook socks5 --socks5 [$ip6]:$port""$NC"
                                                jinbe joker brook socks5 --socks5 [$ip6]:$port
                                            fi
                                            if [ `brook -v | awk '{print $3}'` -gt 20210701 ]
                                            then
                                                echo -e "$PC"">>> jinbe joker brook socks5 --listen :$port --socks5ServerIP $ip6""$NC"
                                                jinbe joker brook socks5 --listen :$port --socks5ServerIP $ip6
                                            fi

                                            sleep 3

                                            echo
                                            echo -e "$PC"">>> jinbe list""$NC"
                                            jinbe list
                                        fi
                                        break;;
                                    2 )
                                        test "$lang" = "en" && read -p "Type a port for your socks5 server, such as 9999: " port
                                        test "$lang" = "en" && read -p "Type a username for your socks5 server, such as myusername: " username
                                        test "$lang" = "en" && read -p "Type a password for your socks5 server, such as mypassword: " password
                                        test "$lang" = "zh" && read -p "输入一个端口给你的 socks5 server, 比如 9999: " port
                                        test "$lang" = "zh" && read -p "输入一个用户名给你的 socks5 server, 比如 myusername: " username
                                        test "$lang" = "zh" && read -p "输入一个密码给你的 socks5 server, 比如 mypassword: " password
                                        if [ -n "$ip4" ]; then
                                            echo
                                            if [ `brook -v | awk '{print $3}'` -le 20210701 ]
                                            then
                                                echo -e "$PC"">>> jinbe joker brook socks5 --socks5 $ip4:$port --username '$username' --password '$password'""$NC"
                                                jinbe joker brook socks5 --socks5 $ip4:$port --username "$username" --password "$password"
                                            fi
                                            if [ `brook -v | awk '{print $3}'` -gt 20210701 ]
                                            then
                                                echo -e "$PC"">>> jinbe joker brook socks5 --listen :$port --socks5ServerIP $ip4 --username '$username' --password '$password'""$NC"
                                                jinbe joker brook socks5 --listen :$port --socks5ServerIP $ip4 --username "$username" --password "$password"
                                            fi

                                            sleep 3

                                            echo
                                            echo -e "$PC"">>> jinbe list""$NC"
                                            jinbe list
                                        fi

                                        if [ -z "$ip4" -a -n "$ip6" ]; then
                                            echo
                                            if [ `brook -v | awk '{print $3}'` -le 20210701 ]
                                            then
                                                echo -e "$PC"">>> jinbe joker brook socks5 --socks5 [$ip6]:$port --username '$username' --password '$password'""$NC"
                                                jinbe joker brook socks5 --socks5 [$ip6]:$port --username "$username" --password "$password"
                                            fi
                                            if [ `brook -v | awk '{print $3}'` -gt 20210701 ]
                                            then
                                                echo -e "$PC"">>> jinbe joker brook socks5 --listen :$port --socks5ServerIP $ip6 --username '$username' --password '$password'""$NC"
                                                jinbe joker brook socks5 --listen :$port --socks5ServerIP $ip6 --username "$username" --password "$password"
                                            fi

                                            sleep 3

                                            echo
                                            echo -e "$PC"">>> jinbe list""$NC"
                                            jinbe list
                                        fi
                                        break;;
                                    * ) echo "";;
                                esac
                            done
                            break;;
                        * ) echo "";;
                    esac
                done
                break;;
            5 )
                if [ `cat /etc/*elease 2>/dev/null | grep 'CentOS Linux 7' | wc -l` -eq 1 ]
                then
                    test "$lang" = "en" && echo "jinbe requires CentOS version >= 8";
                    test "$lang" = "zh" && echo "jinbe 需要 CentOS 版本至少是 8";
                    exit;
                fi
                install;
                echo
                echo -e "$PC"">>> jinbe list""$NC"
                jinbe list
                break;;
            6 )
                if [ `cat /etc/*elease 2>/dev/null | grep 'CentOS Linux 7' | wc -l` -eq 1 ]
                then
                    test "$lang" = "en" && echo "jinbe requires CentOS version >= 8";
                    test "$lang" = "zh" && echo "jinbe 需要 CentOS 版本至少是 8";
                    exit;
                fi
                install;
                echo
                echo -e "$PC"">>> jinbe list""$NC"
                jinbe list
                test "$lang" = "en" && read -p "Choose a ID your want to remove: " id
                test "$lang" = "zh" && read -p "选择你要移除的ID: " id
                echo
                echo -e "$PC"">>> jinbe remove $id""$NC"
                jinbe remove $id
                break;;
            * ) echo "";;
        esac
    done
}

while true; do
    echo "1. English";
    echo "2. Chinese";
    read -p "Language: " v
    case $v in
        1 )
            lang="en"
            all;
            break;;
        2 )
            lang="zh"
            all;
            break;;
        * ) echo "";;
    esac
done

if [ "$restartsh" = "todo" ];then
    exec -l $SHELL
fi
