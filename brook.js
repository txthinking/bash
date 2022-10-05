import { sh1, sh, s2b, b2s, home, splithostport, joinhostport, which, what, echo, log, sleep, now, exit } from "https://raw.githubusercontent.com/txthinking/denolib/master/f.js";
import { parse } from "https://deno.land/std@0.130.0/flags/mod.ts";

var i18n = {
    "Choose what you want to do: ": {
        zh: "选择你想做什么: ",
    },
    "I want to run brook server/wsserver/wssserver/socks5": {
        zh: "我想运行 brook server/wsserver/wssserver/socks5",
    },
    "Choose which you want to run: ": {
        zh: "选择你要运行什么: ",
    },
    "I want to run brook server": {
        zh: "我想运行 brook server",
    },
    "Type a port, such as 9999: ": {
        zh: "输入一个端口，比如 9999: ",
    },
    "This port is occupied!": {
        zh: "这个端口被占用了!",
    },
    "Type a password, such as mypassword: ": {
        zh: "输入一个密码，比如 mypassword: ",
    },
    "Tip: if there is a firewall, remember to open TCP and UDP": {
        zh: "如果有防火墙，记得开放 TCP 和 UDP 端口",
    },
    "I want to run brook wsserver": {
        zh: "我想运行 brook wsserver",
    },
    "Tip: if there is a firewall, remember to open TCP": {
        zh: "如果有防火墙，记得开放 TCP 端口",
    },
    "I want to run brook wssserver": {
        zh: "我想运行 brook wssserver",
    },
    "Port 80 is occupied!": {
        zh: "端口 80 被占用了!",
    },
    "Type your domain, such as hello.com:": {
        zh: "输入你的域名，比如 hello.com: ",
    },
    "Please resolve your domain to your server's IP": {
        zh: "请解析你的域名到你服务器的IP",
    },
    "Tip: if there is a firewall, remember to open TCP 80 and": {
        zh: "如果有防火墙，记得开放 TCP 端口 80 和",
    },
    "I want to run brook wssserver withoutBrookProtocol": {
        zh: "我想运行 brook wssserver 及 withoutBrookProtocol",
    },
    "I want to run brook socks5 without username and password": {
        zh: "我想运行 brook socks5，不设置用户名和密码",
    },
    "I want to run brook socks5 with username and password": {
        zh: "我想运行 brook socks5，并设置用户名和密码",
    },
    "Type a username, such as myusername: ": {
        zh: "输入一个用户名，比如 myusername: ",
    },
    "I want to see running brook command": {
        zh: "我想查看运行中的 brook 命令",
    },
    "I want to stop a brook command": {
        zh: "我想停止一个运行中的 brook 命令",
    },
    "Choose a PID your want to stop: ": {
        zh: "选择你要停止的命令 ID",
    },
};

var language = "";
var lang = (s) => (i18n[s] ? i18n[s][language] ?? s : s);

if (parse(Deno.args).v) {
    echo("v20221005");
    exit(0);
}

var ip4 = (await sh1("curl -s -4 http3.ooo").catch((e) => "")).trim();
var ip6 = (await sh1("curl -s -6 http3.ooo").catch((e) => "")).trim();
if (!ip4 && !ip6) {
    log("Can not find your server public IP");
    exit(1);
}

var letsgo = async () => {
    await which(lang("Choose what you want to do: "), [
        {
            anwser: lang("I want to run brook server/wsserver/wssserver/socks5"),
            action: async () => {
                await which(lang("Choose which you want to run: "), [
                    {
                        anwser: lang("I want to run brook server"),
                        action: async () => {
                            var port = await what(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await sh1(`lsof -i:${port}`).catch((e) => "")).trim()) {
                                echo(lang("This port is occupied!"));
                                exit(1);
                            }
                            var password = await what(lang("Type a password, such as mypassword: "), /.+/);
                            await sh(`joker brook server --listen :${port} --password "${password}"`);
                            await sleep(2000);
                            await sh(`joker list`);
                            await sh("joker log `joker last`");
                            if (ip4) {
                                await sh(`brook link -s ${joinhostport(ip4, port)} -p "${password}"`);
                                await sh(`brook link -s ${joinhostport(ip4, port)} -p "${password}" --udpovertcp`);
                            }
                            if (ip6) {
                                await sh(`brook link -s ${joinhostport(ip6, port)} -p "${password}"`);
                                await sh(`brook link -s ${joinhostport(ip6, port)} -p "${password}" --udpovertcp`);
                            }
                            echo(`${lang("Tip: if there is a firewall, remember to open TCP and UDP")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook wsserver"),
                        action: async () => {
                            var port = await what(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await sh1(`lsof -i:${port}`).catch((e) => "")).trim()) {
                                echo(lang("This port is occupied!"));
                                exit(1);
                            }
                            var password = await what(lang("Type a password, such as mypassword: "), /.+/);
                            await sh(`joker brook wsserver --listen :${port} --password "${password}"`);
                            await sleep(2000);
                            await sh(`joker list`);
                            await sh("joker log `joker last`");
                            if (ip4) {
                                await sh(`brook link -s ws://${joinhostport(ip4, port)} -p "${password}"`);
                            }
                            if (ip6) {
                                await sh(`brook link -s ws://${joinhostport(ip6, port)} -p "${password}"`);
                            }
                            echo(`${lang("Tip: if there is a firewall, remember to open TCP")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook wssserver"),
                        action: async () => {
                            if ((await sh1(`lsof -i:80`).catch((e) => "")).trim()) {
                                echo(lang("Port 80 is occupied!"));
                                exit(1);
                            }
                            var domain = await what(lang("Type your domain, such as hello.com: "), /([1-9]|[a-z]|-|\.)+/);
                            if ((await sh1(`dig +short -t A ${domain}`)).trim() != ip4 && (await sh1(`dig +short -t AAAA ${domain}`)).trim() != ip6) {
                                echo(lang("Please resolve your domain to your server's IP"));
                                exit(1);
                            }
                            var port = await what(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await sh1(`lsof -i:${port}`).catch((e) => "")).trim()) {
                                echo(lang("This port is occupied!"));
                                exit(1);
                            }
                            var password = await what(lang("Type a password, such as mypassword: "), /.+/);
                            await sh(`joker brook wssserver --domainaddress ${domain}:${port} --password "${password}"`);
                            await sleep(2000);
                            await sh(`joker list`);
                            await sh("joker log `joker last`");
                            await sh(`brook link -s wss://${joinhostport(domain, port)} -p "${password}"`);
                            echo(`${lang("Tip: if there is a firewall, remember to open TCP 80 and")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook wssserver withoutBrookProtocol"),
                        action: async () => {
                            if ((await sh1(`lsof -i:80`).catch((e) => "")).trim()) {
                                echo(lang("Port 80 is occupied!"));
                                exit(1);
                            }
                            var domain = await what(lang("Type your domain, such as hello.com: "), /([1-9]|[a-z]|-|\.)+/);
                            if ((await sh1(`dig +short -t A ${domain}`)).trim() != ip4 && (await sh1(`dig +short -t AAAA ${domain}`)).trim() != ip6) {
                                echo(lang("Please resolve your domain to your server's IP"));
                                exit(1);
                            }
                            var port = await what(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await sh1(`lsof -i:${port}`).catch((e) => "")).trim()) {
                                echo(lang("This port is occupied!"));
                                exit(1);
                            }
                            var password = await what(lang("Type a password, such as mypassword: "), /.+/);
                            await sh(`joker brook wssserver --domainaddress ${domain}:${port} --password "${password}" --withoutBrookProtocol`);
                            await sleep(2000);
                            await sh(`joker list`);
                            await sh("joker log `joker last`");
                            await sh(`brook link -s wss://${joinhostport(domain, port)} -p "${password}" --withoutBrookProtocol`);
                            echo(`${lang("Tip: if there is a firewall, remember to open TCP 80 and")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook socks5 without username and password"),
                        action: async () => {
                            var ip = ip4 ? ip4 : ip6;
                            var port = await what(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await sh1(`lsof -i:${port}`).catch((e) => "")).trim()) {
                                echo(lang("This port is occupied!"));
                                exit(1);
                            }
                            await sh(`joker brook socks5 -listen :${port} --socks5ServerIP ${ip}`);
                            await sleep(2000);
                            await sh(`joker list`);
                            await sh("joker log `joker last`");
                            await sh(`brook link -s socks5://${joinhostport(ip, port)}`);
                            echo(`${lang("Tip: if there is a firewall, remember to open TCP and UDP")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook socks5 with username and password"),
                        action: async () => {
                            var ip = ip4 ? ip4 : ip6;
                            var port = await what(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await sh1(`lsof -i:${port}`).catch((e) => "")).trim()) {
                                echo(lang("This port is occupied!"));
                                exit(1);
                            }
                            var username = await what(lang("Type a username, such as myusername: "), /.+/);
                            var password = await what(lang("Type a password, such as mypassword: "), /.+/);
                            await sh(`joker brook socks5 -listen :${port} --socks5ServerIP ${ip} --username "${username}" --password "${password}"`);
                            await sleep(2000);
                            await sh(`joker list`);
                            await sh("joker log `joker last`");
                            await sh(`brook link -s socks5://${joinhostport(ip, port)} --username "${username}" --password "${password}"`);
                            echo(`${lang("Tip: if there is a firewall, remember to open TCP and UDP")} ${port}`);
                        },
                    },
                ]);
            },
        },
        {
            anwser: lang("I want to see running brook command"),
            action: async () => {
                await sh(`joker list`);
            },
        },
        {
            anwser: lang("I want to stop a brook command"),
            action: async () => {
                await sh(`joker list`);
                var id = await what(lang("Choose a PID your want to stop: "), /\d+/);
                await sh(`joker stop ${id}`);
            },
        },
    ]);
};

await which("Language: ", [
    {
        anwser: "English",
        action: async () => {
            language = "en";
            await letsgo();
        },
    },
    {
        anwser: "Chinese",
        action: async () => {
            language = "zh";
            await letsgo();
        },
    },
]);
