#!/usr/bin/env jb

var n = question(`
1. English
2. 中文
`)
var zh = n == 2

echo(zh ? `此脚本一键式帮助你在 fly.io 免费部署一个 brook, 无需你去 fly.io 网站进行任何操作，只需要你有一个 GitHub 账号。重新部署只需要再次运行脚本即可。` : `This script helps you deploy a brook on fly.io interactively for free, without you needing to go to the fly.io website for any operations, only you need to have a GitHub account. Redeploying simply requires running the script again.`)

if(!which('flyctl')){
    echo(zh ? '请先安装 flyctl: $ nami install flyctl' : 'Please install flyctl first: $ nami install flyctl')
    exit(1)
}
if(!which('brook')){
    echo(zh ? '请先安装 brook: $ nami install brook' : 'Please install brook first: $ nami install brook')
    exit(1)
}

try{
    var email = $1`flyctl auth whoami 2>/dev/null`
}catch(e){
    var ok = confirm(zh ? '你需要认证一下你的 GitHub，是否需要绑卡验证取决于你的 GitHub 质量，无需任何其他操作，然后回到这里' : 'You need to authenticate your GitHub, whether card binding verification is required depends on the quality of your GitHub, do nothing else, then come back here')
    if(!ok){
        exit(1)
    }
    $`flyctl auth login`
    email = await retry(() => $1`flyctl auth whoami 2>/dev/null`, 1000, 10)
}

var region = await retry(() => {
    var n = question(zh ? `
0. 荷兰
1. 法国
2. 香港
3. 英国
4. 日本
5. 智利
6. 新加坡
7. 美国
8. 澳大利亚
9. 加拿大
请选择地区：`:`
0. Netherlands
1. France
2. Hong Kong
3. United Kingdom
4. Japan
5. Chile
6. Singapore
7. United States
8. Australia
9. Canada
Please select area:`)
    var v = ['ams', 'cdg', 'hkg', 'lhr', 'nrt', 'scl', 'sin', 'sjc', 'syd', 'yyz'][n]
    if(v) return v
    throw 'again'
}, 0, 10)

var app = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-1", new TextEncoder().encode(email.trim())))).map(byte => byte.toString(16).padStart(2, '0')).join('')

$`rm -rf _`
$`mkdir _`
cd('_')
try{ $(`flyctl app destroy ${app} -y > /dev/null 2>&1`) }catch(e){}
$(`flyctl app create ${app}`)
var kind = question(`
1. server
2. wsserver
3. wssserver
`)
var port = 0;
if(kind != 2 && kind != 3){
    port = await retry(() => {
        var s = question(zh ? '请设置端口：' : 'Please type a port:')
        if(parseInt(s.trim())>0) return s.trim()
        throw 'again'
    }, 0, 10)
}
var password = await retry(() => {
    var s = question(zh ? '请设置密码：' : 'Please type a password:')
    if(s && s.trim()) return s.trim()
    throw 'again'
}, 0, 10)

await writefile(`_/Dockerfile`, `
FROM alpine

RUN wget -O /brook https://github.com/txthinking/brook/releases/latest/download/brook_linux_amd64
RUN chmod +x /brook

EXPOSE ${port}

ENTRYPOINT ["/brook"]
`)

if(kind == 2){
await writefile(`_/Dockerfile`, `
FROM alpine

RUN wget -O /brook https://github.com/txthinking/brook/releases/latest/download/brook_linux_amd64
RUN chmod +x /brook

EXPOSE 80

ENTRYPOINT ["/brook"]
`)
}

if(kind == 3){
await writefile(`_/Dockerfile`, `
FROM alpine

RUN wget -O /brook https://github.com/txthinking/brook/releases/latest/download/brook_linux_amd64
RUN chmod +x /brook

EXPOSE 8080

ENTRYPOINT ["/brook"]
`)
}

await writefile(`_/fly.toml`, `
app = "${app}"
primary_region = "${region}"

[[services]]
  internal_port = ${port}
  protocol = "udp"

  [[services.ports]]
    port = "${port}"

[[services]]
  internal_port = ${port}
  protocol = "tcp"

  [[services.ports]]
    port = "${port}"

[experimental]
    entrypoint = ["/brook", "server", "--listen", ":${port}", "--password", "${password}"]
`)

if(kind == 2){
await writefile(`_/fly.toml`, `
app = "${app}"
primary_region = "${region}"

[[services]]
  internal_port = 80
  protocol = "tcp"

  [[services.ports]]
    port = "80"

[experimental]
    entrypoint = ["/brook", "wsserver", "--listen", ":80", "--password", "${password}"]
`)
}

if(kind == 3){
await writefile(`_/fly.toml`, `
app = "${app}"
primary_region = "${region}"

[[services]]
    internal_port = 8080
    protocol = "tcp"
    auto_stop_machines = false
    auto_start_machines = false

    [[services.ports]]
        handlers = ["http"]
        port = "80"

    [[services.ports]]
        handlers = ["tls", "http"]
        port = "443"

[experimental]
    entrypoint = ["/brook", "wsserver", "--listen", ":8080", "--password", "${password}"]
`)
}

$`flyctl deploy --ha=false --remote-only --wait-timeout=600`
cd('..')
$`rm -rf _`

if(kind != 3){
    $(`flyctl ip allocate-v6 -a ${app}`)
}
var s = $1(`flyctl ip list -a ${app} --json`)
var ip = JSON.parse(s).find(v=>v.Type == 'v6').Address
if(kind != 2 && kind != 3){
    var brook_server_link_udpovertcp = $1(`brook link -s [${ip}]:${port} -p "${password}" --udpovertcp --name fly.ipv6.s.udpovertcp`)
    echo(zh ? '你的 brook link：' : 'Your brook link:')
    echo(brook_server_link_udpovertcp)
}
if(kind == 2){
    var brook_wsserver_link = $1(`brook link -s ws://[${ip}]:80 -p "${password}" --address [${ip}]:80 --name fly.ipv6.ws`)
    echo(zh ? '你的 brook link：' : 'Your brook link:')
    echo(brook_wsserver_link)
}
if(kind == 3){
    var brook_wssserver_link = $1(`brook link -s wss://${app}.fly.dev:443 -p "${password}" --address [${ip}]:443 --name fly.ipv6.wss`)
    echo(zh ? '你的 brook link：' : 'Your brook link:')
    echo(brook_wssserver_link)
}
