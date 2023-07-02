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
    var ok = confirm(zh ? '你需要认证一下你的 GitHub，无需任何其他操作，然后回到这里' : 'You need to authenticate your GitHub, do nothing else, then come back here')
    if(!ok){
        exit(1)
    }
    $`flyctl auth login`
    email = await retry(() => $1`flyctl auth whoami 2>/dev/null`, 1000, 10)
}

var region = await retry(() => {
    var n = question(zh ? `
1. 荷兰
2. 法国
3. 香港
4. 英国
5. 日本
6. 智利
7. 新加坡
8. 美国
9. 澳大利亚
请选择地区：`:`
1. Netherlands
2. France
3. Hong Kong
4. United Kingdom
5. Japan
6. Chile
7. Singapore
8. United States
9. Australia
Please select area:`)
    var v = ['ams', 'cdg', 'hkg', 'lhr', 'nrt', 'scl', 'sin', 'sjc', 'syd'][n]
    if(v) return v
    throw 'again'
}, 0, 10)

var app = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.trim())))).map(byte => byte.toString(16).padStart(2, '0')).join('')
var password = await retry(() => {
    var s = question(zh ? '请设置 brook wsserver 密码：' : 'Please type a password for brook wsserver:')
    if(s && s.trim()) return s.trim()
    throw 'again'
}, 0, 10)

try{ $(`flyctl app destroy ${app} -y > /dev/null 2>&1`) }catch(e){}
$(`flyctl app create ${app}`)

var docker = `
FROM golang:1.19

RUN git clone https://github.com/txthinking/brook.git
RUN cd brook/cli/brook && CGO_ENABLED=0 GOOS=linux go build -o /brook

EXPOSE 8080

ENTRYPOINT ["/brook"]
`
await writefile(`Dockerfile`, docker)

var toml = `
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
`
await writefile(`fly.toml`, toml)

$`flyctl deploy --ha=false --remote-only`
$`rm -rf Dockerfile`
$`rm -rf fly.toml`

var s = $1(`flyctl ip list -a ${app} --json`)
var ip = JSON.parse(s).find(v=>v.Type == 'v6').Address
var brook_wsserver_link = $1(`brook link -s ws://${app}.fly.dev:80 -p "${password}" --address [${ip}]:80`)
var brook_wssserver_link = $1(`brook link -s wss://${app}.fly.dev:443 -p "${password}" --address [${ip}]:443`)

echo(zh ? '你的 brook link：' : 'Your brook link:')
echo(brook_wsserver_link)
echo(brook_wssserver_link)
