if(process.argv.length <= 3 || process.argv[3] == 'help' || process.argv[3] == '-h' || process.argv[3] == '--help' || process.argv[3] == 'version' || process.argv[3] == '-v' || process.argv[3] == '--version'){
    echo(`
本工具的目的是从 Brook 或 Shiliew 的日志的 PROXY 行里自动判断出哪些是中国大陆域名，以制作专属于你的绕过域名列表。

第一步：你需要打开 Brook 或 Shiliew 日志【菜单 - 日志 - 开启】，并连接 Brook 或 Shiliew，然后运行一段时间
第二步：复制 Brook 或 Shiliew 日志【菜单 - 活动 - 右上角复制】
第三步：将复制的粘贴到本地一个文件里，比如 log.txt。如果你是 MacOS 复制以后可以用命令直接粘贴到文件里：$ pbpaste > log.txt

当然如果没有安装 jb，需要先安装：$ nami install jb

然后运行以下命令，会打印出中国大陆域名：

$ jb https://bash.ooo/china_domain_check.js ./log.txt
`)
    exit(1)
}

function splithostport(s) {
    if (s.indexOf("]:") != -1) {
        var l = s.split("]:");
        if (l.length != 2) {
            throw "Invalid address";
        }
        var p = parseInt(l[1]);
        if (isNaN(p)) {
            throw "Invalid address";
        }
        return [l[0].replace("[", ""), p];
    }
    if (s.indexOf(":") == -1) {
        throw "Invalid address";
    }
    var l = s.split(":");
    if (l.length != 2) {
        throw "Invalid address";
    }
    var p = parseInt(l[1]);
    if (isNaN(p)) {
        throw "Invalid address";
    }
    return [l[0], p];
}

var str = (await readfile(process.argv[3])).trim()
if(!str.startsWith('{"action"')){
    echo('你确定是 Brook 或 Shiliew 的日志文件吗')
    exit(1)
}
var l = str.split("\n").map(v=>JSON.parse(v)).filter(v=>v.action == "PROXY")
var m = {}
echo(`${l.length} PROXY 条数据，最多用时大约为：${parseInt(l.length*5/60)} 分钟，请耐心等待，并避免电脑休眠`)
for (var i=0; i<l.length; i++){
    var [h, _] = splithostport(l[i].content)
    var l1 = h.split('.')
    var a = l1.pop()
    var b = l1.pop()
    var s = b+'.'+a
    if(a == 'cn'){
        s = 'cn'
    }
    if(m[s]){
        continue
    }
    m[s] = 1
    if(s == 'cn'){
        echo(s)
        continue
    }
    var j = $1(new TextDecoder().decode(new Uint8Array([99, 117, 114, 108,  32,  45, 115,  32, 104, 116, 116, 112, 115,  58,  47,  47,  97, 112, 105,  46, 107, 105, 116,  57,  46,  99, 110,  47,  97, 112, 105,  47, 100, 111, 109,  97, 105, 110,  95, 110,  97, 109, 101,  95,102, 105, 108, 105, 110, 103,  47,  97, 112, 105,  46,112, 104, 112,  63, 117, 114, 108,  61]))+s)
    if(JSON.parse(j).code == 200){
        echo(s)
    }
    sleep(5000)
}
