#!/usr/bin/env jb

import os from 'node:os';
import { Database } from "bun:sqlite";

const { program } = require('commander')
program
    .name('jb https://bash.ooo/china.js')
    .description('https://www.txthinking.com/talks/articles/china-list.article')
    .option('--source <string>', "gui: 自动查找 GUI 日志; 或 /path/to/log", '')
    .option('--how <string>', 'A: 从海外 IP 向海外 DNS  发起查询, 比如开启 GUI 的情况下或在服务器端运行, 缺点是如果域名同时有国内和海外 IP 则会被认为是海外域名; B: 从国内 IP 向阿里 DNS 发起查询, 开启 GUI 情况下也没事，GUI 默认 bypass 了阿里 DNS, 缺点是如果返回的污染 IP 是国内的 IP 就会错乱，但历史经验不会, 还有一个缺点是 Google 有一些域名有国内的 IP', '')
    .option('--china <string>', '弥补 A 和 B 方案的不足，手动设置某个域名为国内域名', '')
    .option('--global <string>', '弥补 A 和 B 方案的不足，手动设置某个域名为国际域名', '')
    .option('--delete <string>', '移除某个域名. 如果想删除所有, 直接删除 rm -rf ~/.china.db', '')
    .option('--table', '打印整个表', false)
    .option('--list', '打印列表', false)
    .option('--module', '打印 module, 让域名走 bypass DNS 来解析', false)
    .option('--modulea', '打印 module, 让域名走 bypass DNS 来解析出 A 记录，然后直接 bypass', false)
program.parse();
const options = program.opts();

if (!options.china && !options.global && !options.delete && !options.table && !options.list && !options.module && !options.modulea && (!options.source || !options.how)) {
    program.help()
}

var db = new Database(os.homedir() + "/.china.db", { create: true });
var l = db.query(`SELECT name FROM sqlite_master WHERE type='table'`).all();
if (!l.find(v => v.name == 'cn')) {
    db.query(`
create table cn(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain text not null UNIQUE,
    iscn INTEGER not null default 0
)
`).run();
    db.query('insert into cn(domain, iscn) values(?, ?)').run('cn', 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run('apple', 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run('apple.com', 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run('cdn-apple.com', 1)
}

if (options.china) {
    var l1 = options.china.split('.')
    var a = l1.pop()
    var b = l1.pop()
    var d = b + '.' + a
    var r = db.query('select * from cn where domain=?').get(d);
    if (r) {
        db.query('update cn set iscn=1 where domain=?').run(d);
    } else {
        db.query('insert into cn(domain, iscn) values(?, ?)').run(d, 1)
    }
    exit()
}

if (options.global) {
    var l1 = options.global.split('.')
    var a = l1.pop()
    var b = l1.pop()
    var d = b + '.' + a
    var r = db.query('select * from cn where domain=?').get(d);
    if (r) {
        db.query('update cn set iscn=2 where domain=?').run(d);
    } else {
        db.query('insert into cn(domain, iscn) values(?, ?)').run(d, 2)
    }
    exit()
}

if (options.delete) {
    db.query('delete from cn where domain=?').run(options.delete);
    exit()
}

if (options.table) {
    var r = db.query('select * from cn').values();
    const { printTable } = require('console-table-printer');
    printTable(r)
    exit()
}

if (options.list) {
    var r = db.query('select * from cn where iscn=1').all();
    echo(r.map(v => v.domain).join('\n'))
    exit()
}

if (options.module) {
    var r = db.query('select * from cn where iscn=1').all();
    var i = 0
    var s = ""
    var l = []
    r.map(v => v.domain).forEach(v => {
        l.push(`"${v}": true,`)
        i++
        if (i == 200) {
            s += `
        l = {
${l.join("\n").slice(0, -1)}
        }
        r = f(m.domain, l)
        if r != undefined {
            return r
        }
`
            i = 0
            l = []
        }
    })
    if (l.length) {
        s += `
        l = {
${l.join("\n").slice(0, -1)}
        }
        r = f(m.domain, l)
        if r != undefined {
            return r
        }
`
    }
    s = `
modules = append(modules, {
    dnsquery: func(m) {
        text := import("text")
        f := func(domain, l){
            ss := text.split(text.to_lower(domain), ".")
            s := ""
            for i := len(ss) - 1; i >= 0; i-- {
                if s == "" {
                    s = ss[i]
                } else {
                    s = ss[i] + "." + s
                }
                if l[s] {
                    return { bypass: true }
                }
            }
        }
        l := undefined
        r := undefined
        ${s}
    }
})
`
    echo(s)
    exit()
}

if (options.modulea) {
    var r = db.query('select * from cn where iscn=1').all();
    var i = 0
    var s = ""
    var l = []
    r.map(v => v.domain).forEach(v => {
        l.push(`"${v}": true,`)
        i++
        if (i == 200) {
            s += `
            l = {
${l.join("\n").slice(0, -1)}
            }
            r = f(hp.host, l)
            if r != undefined {
                return r
            }
`
            i = 0
            l = []
        }
    })
    if (l.length) {
        s += `
            l = {
${l.join("\n").slice(0, -1)}
            }
            r = f(hp.host, l)
            if r != undefined {
                return r
            }
`
    }
    s = `
modules = append(modules, {
    address: func(m) {
        if m.domainaddress {
            brook := import("brook")
            hp := brook.splithostport(m.domainaddress)
            if is_error(hp) {
                return hp
            }
            text := import("text")
            f := func(domain, l){
                ss := text.split(text.to_lower(domain), ".")
                s := ""
                for i := len(ss) - 1; i >= 0; i-- {
                    if s == "" {
                        s = ss[i]
                    } else {
                        s = ss[i] + "." + s
                    }
                    if l[s] {
                        return { ipaddressfrombypassdns: "A", bypass: true }
                    }
                }
            }
            l := undefined
            r := undefined
            ${s}
        }
    }
})
`
    echo(s)
    exit()
}

function get_domain(addr) {
    if (addr.indexOf(':') == -1) {
        return addr
    }
    if (addr.startsWith('[')) {
        return
    }
    var i = addr.lastIndexOf(':')
    var s = addr.slice(0, i)
    if (/^[\d\.]+$/.test(s)) {
        return
    }
    return s
}

function get_todo() {
    var l = []
    if (options.source == 'gui') {
        if (global.exists(os.homedir() + "/Library/Group Containers/group.com.txthinking.brook.onemacos/b.log")) {
            var s = read_file(os.homedir() + "/Library/Group Containers/group.com.txthinking.brook.onemacos/b.log")
            if (s && s.trim()) {
                l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY").map(v => get_domain(v.content)).filter(v => v))
            }
        }
        if (global.exists(os.homedir() + "/Library/Group Containers/group.com.txthinking.brookmacos/b.log")) {
            var s = read_file(os.homedir() + "/Library/Group Containers/group.com.txthinking.brookmacos/b.log")
            if (s && s.trim()) {
                l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY").map(v => get_domain(v.content)).filter(v => v))
            }
        }
        if (global.exists(os.homedir() + "/.b.log")) {
            var s = read_file(os.homedir() + "/.b.log")
            if (s && s.trim()) {
                l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY").map(v => get_domain(v.content)).filter(v => v))
            }
        }
    } else {
        var s = read_file(options.source)
        if (s && s.trim()) {
            l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY").map(v => get_domain(v.content)).filter(v => v))
            l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.dst).map(v => get_domain(v.dst)).filter(v => v))
            l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.dns).map(v => get_domain(v.domain)).filter(v => v))
        }
    }
    if (!l.length) {
        echo('没有发现域名')
        exit(1)
    }
    return [...new Set(l)]
}

function get_cn_domain_with_global_dns(domain) {
    var s = $1(`brook dohclient -t A --short -d ${domain}`)
    if (s) {
        if ($1(`brook ipcountry --ip ${s}`) != 'CN') {
            return
        }
        s = $1(`brook dohclient -t A -d ${domain}`)
        var l = s.trim().split('\n').map(v => v.split(/\s+/)).filter(v => v.length == 5 && v[3] == 'CNAME').map(v => v[4].slice(0, -1))
        l.push(domain)
        return l.map(v => {
            var l1 = v.split('.')
            var a = l1.pop()
            var b = l1.pop()
            return b + '.' + a
        })
    }
    var s = $1(`brook dohclient -t AAAA --short -d ${domain}`)
    if (s) {
        if ($1(`brook ipcountry --ip ${s}`) != 'CN') {
            return
        }
        s = $1(`brook dohclient -t AAAA -d ${domain}`)
        var l = s.trim().split('\n').map(v => v.split(/\s+/)).filter(v => v.length == 5 && v[3] == 'CNAME').map(v => v[4].slice(0, -1))
        l.push(domain)
        return l.map(v => {
            var l1 = v.split('.')
            var a = l1.pop()
            var b = l1.pop()
            return b + '.' + a
        })
    }
    throw `unknown ${domain}`
}

function get_cn_domain_with_china_dns(domain) {
    var s = $1(`brook dohclient -s 'https://dns.alidns.com/dns-query?address=223.5.5.5:443' -t A --short -d ${domain}`)
    if (s) {
        if ($1(`brook ipcountry --ip ${s}`) != 'CN') {
            return
        }
        s = $1(`brook dohclient -s 'https://dns.alidns.com/dns-query?address=223.5.5.5:443' -t A -d ${domain}`)
        var l = s.trim().split('\n').map(v => v.split(/\s+/)).filter(v => v.length == 5 && v[3] == 'CNAME').map(v => v[4].slice(0, -1))
        l.push(domain)
        return l.map(v => {
            var l1 = v.split('.')
            var a = l1.pop()
            var b = l1.pop()
            return b + '.' + a
        })
    }
    var s = $1(`brook dohclient -s 'https://dns.alidns.com/dns-query?address=223.5.5.5:443' -t AAAA --short -d ${domain}`)
    if (s) {
        if ($1(`brook ipcountry --ip ${s}`) != 'CN') {
            return
        }
        s = $1(`brook dohclient -s 'https://dns.alidns.com/dns-query?address=223.5.5.5:443' -t AAAA -d ${domain}`)
        var l = s.trim().split('\n').map(v => v.split(/\s+/)).filter(v => v.length == 5 && v[3] == 'CNAME').map(v => v[4].slice(0, -1))
        l.push(domain)
        return l.map(v => {
            var l1 = v.split('.')
            var a = l1.pop()
            var b = l1.pop()
            return b + '.' + a
        })
    }
    throw `unknown ${domain}`
}

var l = get_todo()
echo('todo', l.length)
for (var i = 0; i < l.length; i++) {
    var d = l[i].toLowerCase()
    if (d.endsWith('.cn')) {
        continue
    }
    var l1 = d.split('.')
    var a = l1.pop()
    var b = l1.pop()
    var s0 = b + '.' + a
    var r = db.query('select * from cn where domain=? or domain like ?').get(s0, "%." + s0);
    if (r) {
        continue
    }
    try {
        echo(d)
        var l1 = await retry(() => options.how == 'A' ? get_cn_domain_with_global_dns(d) : get_cn_domain_with_china_dns(d), 1000, 2)
        echo(l1)
        if (l1) {
            l1.forEach(v => {
                var r = db.query('select * from cn where domain=?').get(v);
                if (r) {
                    return
                }
                db.query('insert into cn(domain, iscn) values(?, ?)').run(v, 1)
            })
        } else {
            db.query('insert into cn(domain, iscn) values(?, ?)').run(s0, 2)
        }
        echo(`${parseInt((i + 1) / l.length * 100)}%`)
    } catch (e) {
        echo(d, e.toString())
    }
}
