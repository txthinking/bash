import lib from 'https://bash.ooo/lib.js';
import { $ } from 'bun';

function joinhostport(host, port){
    if(host.indexOf(":") != -1){
        return `[${host}]:${port}`
    }
    return `${host}:${port}`
}

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

var ip4 = (await $`curl -s -4 http3.ooo`.text().catch((e) => "")).trim();
var ip6 = (await $`curl -s -6 http3.ooo`.text().catch((e) => "")).trim();
if (!ip4) {
    console.log("Can not find your server public IPv4");
    process.exit(1);
}
if (!ip6) {
    console.log("Can not find your server public IPv6");
    process.exit(1);
}

var letsgo = async () => {
    await lib.select(lang("Choose what you want to do: "), [
        {
            anwser: lang("I want to run brook server/wsserver/wssserver/socks5"),
            action: async () => {
                await lib.select(lang("Choose which you want to run: "), [
                    {
                        anwser: lang("I want to run brook server"),
                        action: async () => {
                            var port = await lib.question(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await $`lsof -i:${port}`.text().catch((e) => "")).trim()) {
                                console.log(lang("This port is occupied!"));
                                process.exit(1);
                            }
                            var password = await lib.question(lang("Type a password, such as mypassword: "), /.+/);
                            await $`joker brook server --listen :${port} --password "${password}"`
                            await Bun.sleep(2000);
                            await $`joker list`
                            await $`joker log $(joker last)`
                            if (ip4) {
                                await $`brook link -s ${joinhostport(ip4, port)} -p "${password}" --udpovertcp`
                            }
                            if (ip6) {
                                await $`brook link -s ${joinhostport(ip6, port)} -p "${password}" --udpovertcp`
                            }
                            console.log(`${lang("Tip: if there is a firewall, remember to open TCP and UDP")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook wsserver"),
                        action: async () => {
                            var port = await lib.question(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await $`lsof -i:${port}`.text().catch((e) => "")).trim()) {
                                console.log(lang("This port is occupied!"));
                                process.exit(1);
                            }
                            var password = await lib.question(lang("Type a password, such as mypassword: "), /.+/);
                            await $`joker brook wsserver --listen :${port} --password "${password}"`
                            await Bun.sleep(2000);
                            await $`joker list`
                            await $`joker log $(joker last)`
                            if (ip4) {
                                await $`brook link -s ws://${joinhostport(ip4, port)} -p "${password}"`
                            }
                            if (ip6) {
                                await $`brook link -s ws://${joinhostport(ip6, port)} -p "${password}"`
                            }
                            console.log(`${lang("Tip: if there is a firewall, remember to open TCP")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook wssserver"),
                        action: async () => {
                            if ((await $`lsof -i:80`.text().catch((e) => "")).trim()) {
                                console.log(lang("Port 80 is occupied!"));
                                process.exit(1);
                            }
                            var domain = await lib.question(lang("Type your domain, such as hello.com: "), /([1-9]|[a-z]|-|\.)+/);
                            if ((await $`dig +short -t A ${domain}`.text()).trim() != ip4 && (await $`dig +short -t AAAA ${domain}`.text()).trim() != ip6) {
                                console.log(lang("Please resolve your domain to your server's IP"));
                                process.exit(1);
                            }
                            var port = await lib.question(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await $`lsof -i:${port}`.text().catch((e) => "")).trim()) {
                                console.log(lang("This port is occupied!"));
                                process.exit(1);
                            }
                            var password = await lib.question(lang("Type a password, such as mypassword: "), /.+/);
                            await $`joker brook wssserver --domainaddress ${domain}:${port} --password "${password}"`
                            await Bun.sleep(2000);
                            await $`joker list`
                            await $`joker log $(joker last)`
                            await $`brook link -s wss://${joinhostport(domain, port)} -p "${password}"`
                            console.log(`${lang("Tip: if there is a firewall, remember to open TCP 80 and")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook wssserver withoutBrookProtocol"),
                        action: async () => {
                            if ((await $`lsof -i:80`.text().catch((e) => "")).trim()) {
                                console.log(lang("Port 80 is occupied!"));
                                process.exit(1);
                            }
                            var domain = await lib.question(lang("Type your domain, such as hello.com: "), /([1-9]|[a-z]|-|\.)+/);
                            if ((await $`dig +short -t A ${domain}`.text()).trim() != ip4 && (await $`dig +short -t AAAA ${domain}`.text()).trim() != ip6) {
                                console.log(lang("Please resolve your domain to your server's IP"));
                                process.exit(1);
                            }
                            var port = await lib.question(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await $`lsof -i:${port}`.text().catch((e) => "")).trim()) {
                                console.log(lang("This port is occupied!"));
                                process.exit(1);
                            }
                            var password = await lib.question(lang("Type a password, such as mypassword: "), /.+/);
                            await $`joker brook wssserver --domainaddress ${domain}:${port} --password "${password}" --withoutBrookProtocol`
                            await Bun.sleep(2000);
                            await $`joker list`
                            await $`joker log $(joker last)`
                            await $`brook link -s wss://${joinhostport(domain, port)} -p "${password}" --withoutBrookProtocol`
                            console.log(`${lang("Tip: if there is a firewall, remember to open TCP 80 and")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook quicserver"),
                        action: async () => {
                            if ((await $`lsof -i:80`.text().catch((e) => "")).trim()) {
                                console.log(lang("Port 80 is occupied!"));
                                process.exit(1);
                            }
                            var domain = await lib.question(lang("Type your domain, such as hello.com: "), /([1-9]|[a-z]|-|\.)+/);
                            if ((await $`dig +short -t A ${domain}`.text()).trim() != ip4 && (await $`dig +short -t AAAA ${domain}`.text()).trim() != ip6) {
                                console.log(lang("Please resolve your domain to your server's IP"));
                                process.exit(1);
                            }
                            var port = await lib.question(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await $`lsof -i:${port}`.text().catch((e) => "")).trim()) {
                                console.log(lang("This port is occupied!"));
                                process.exit(1);
                            }
                            var password = await lib.question(lang("Type a password, such as mypassword: "), /.+/);
                            await $`joker brook quicserver --domainaddress ${domain}:${port} --password "${password}"`
                            await Bun.sleep(2000);
                            await $`joker list`
                            await $`joker log $(joker last)`
                            await $`brook link -s quic://${joinhostport(domain, port)} -p "${password}" --udpoverstream`
                            console.log(`${lang("Tip: if there is a firewall, remember to open TCP 80 and")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook quicserver withoutBrookProtocol"),
                        action: async () => {
                            if ((await $`lsof -i:80`.text().catch((e) => "")).trim()) {
                                console.log(lang("Port 80 is occupied!"));
                                process.exit(1);
                            }
                            var domain = await lib.question(lang("Type your domain, such as hello.com: "), /([1-9]|[a-z]|-|\.)+/);
                            if ((await $`dig +short -t A ${domain}`.text()).trim() != ip4 && (await $`dig +short -t AAAA ${domain}`.text()).trim() != ip6) {
                                console.log(lang("Please resolve your domain to your server's IP"));
                                process.exit(1);
                            }
                            var port = await lib.question(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await $`lsof -i:${port}`.text().catch((e) => "")).trim()) {
                                console.log(lang("This port is occupied!"));
                                process.exit(1);
                            }
                            var password = await lib.question(lang("Type a password, such as mypassword: "), /.+/);
                            await $`joker brook quicserver --domainaddress ${domain}:${port} --password "${password}" --withoutBrookProtocol`
                            await Bun.sleep(2000);
                            await $`joker list`
                            await $`joker log $(joker last)`
                            await $`brook link -s quic://${joinhostport(domain, port)} -p "${password}" --udpoverstream --withoutBrookProtocol`
                            console.log(`${lang("Tip: if there is a firewall, remember to open TCP 80 and")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook socks5 without username and password"),
                        action: async () => {
                            var ip = ip4 ? ip4 : ip6;
                            var port = await lib.question(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await $`lsof -i:${port}`.text().catch((e) => "")).trim()) {
                                console.log(lang("This port is occupied!"));
                                process.exit(1);
                            }
                            await $`joker brook socks5 -listen :${port} --socks5ServerIP ${ip}`
                            await Bun.sleep(2000);
                            await $`joker list`
                            await $`joker log $(joker last)`
                            await $`brook link -s socks5://${joinhostport(ip, port)}`
                            console.log(`${lang("Tip: if there is a firewall, remember to open TCP and UDP")} ${port}`);
                        },
                    },
                    {
                        anwser: lang("I want to run brook socks5 with username and password"),
                        action: async () => {
                            var ip = ip4 ? ip4 : ip6;
                            var port = await lib.question(lang("Type a port, such as 9999: "), /\d+/);
                            if ((await $`lsof -i:${port}`.text().catch((e) => "")).trim()) {
                                console.log(lang("This port is occupied!"));
                                process.exit(1);
                            }
                            var username = await lib.question(lang("Type a username, such as myusername: "), /.+/);
                            var password = await lib.question(lang("Type a password, such as mypassword: "), /.+/);
                            await $`joker brook socks5 -listen :${port} --socks5ServerIP ${ip} --username "${username}" --password "${password}"`
                            await Bun.sleep(2000);
                            await $`joker list`
                            await $`joker log $(joker last)`
                            await $`brook link -s socks5://${joinhostport(ip, port)} --username "${username}" --password "${password}"`
                            console.log(`${lang("Tip: if there is a firewall, remember to open TCP and UDP")} ${port}`);
                        },
                    },
                ]);
            },
        },
        {
            anwser: lang("I want to see running brook command"),
            action: async () => {
                await $`joker list`
            },
        },
        {
            anwser: lang("I want to stop a brook command"),
            action: async () => {
                await $`joker list`
                var id = await lib.question(lang("Choose a PID your want to stop: "), /\d+/);
                await $`joker stop ${id}`
            },
        },
    ]);
};

await lib.select("Language: ", [
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
