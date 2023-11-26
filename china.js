#!/usr/bin/env jb

import os from 'node:os';
import { Database } from "bun:sqlite";

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

if (process.argv.length == 3 && process.argv[2] == 'list') {
    var r = db.query('select * from cn where iscn=1').all();
    echo(r.map(v => v.domain).join('\n'))
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
    // TODO remove this after brook v20240101
    if (!global.exists('/tmp/brook')) {
        cp(`https://github.com/txthinking/bash/releases/latest/download/brook_${nami.os}_${nami.arch}.20240101`, `/tmp/brook`)
        $`chmod +x /tmp/brook`
    }

    var l = []
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
    if (!l.length) {
        echo('没有发现任何 Brook 或 Shiliew 的日志，是最新版吗？先运行一段时间吧')
        exit(1)
    }
    return [...new Set(l)]
}

if (process.argv.length == 3 && process.argv[2] == 'check') {
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
            var cn = await retry(async () => {
                var s = $1(`/tmp/brook dohclient -t A --short -d ${s0}`)
                if (!s) {
                    s = $1(`/tmp/brook dohclient -t AAAA --short -d ${s0}`)
                }
                if (s) {
                    s = $1(`/tmp/brook ipcountry --ip ${s}`)
                    if (s == 'CN') return 1
                }
                s = $1(`/tmp/brook dohclient -t A --short -d ${d}`)
                if (!s) {
                    s = $1(`/tmp/brook dohclient -t AAAA --short -d ${d}`)
                }
                if (!s) {
                    throw `unknown ${d}`
                }
                s = $1(`/tmp/brook ipcountry --ip ${s}`)
                return s == 'CN' ? 1 : 2
            }, 1000, 3)
            echo(`${parseInt((i + 1) / l.length * 100)}%`)
            db.query('insert into cn(domain, iscn) values(?, ?)').run(s0, cn)
        } catch (e) {
            echo(d, e.toString())
        }
    }
    exit()
}

echo(`
从 Brook 或 Shiliew 的日常日志里自动增量(比如隔几天运行一次)生成自用的国内域名列表:

jb https://bash.ooo/china.js check

当然因为运行需要时间，可以用 joker 后台运行

joker jb https://bash.ooo/china.js check

查看自己日积月累的列表:

jb https://bash.ooo/china.js list
`)
