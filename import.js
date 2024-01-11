#!/usr/bin/env jb
import os from 'node:os';
import { Database } from "bun:sqlite";

var html = `<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/@picocss/pico@1.5.3/css/pico.min.css" />
    <script src="https://unpkg.com/vue@3.2.29/dist/vue.global.prod.js"></script>
    <!--RECAPTCHA_HEAD-->
    <title>Brook Import Link Generator</title>
    <style>
        [data-theme="light"],
        :root:not([data-theme="dark"]) {
            --primary: #000000;
            --primary-inverse: #ffffff;
        }
    </style>
    <script>
        window.addEventListener("DOMContentLoaded", async (e) => {
            var app = {
                data() {
                    return {
                        content: "brook://server?name=%F0%9F%87%BA%F0%9F%87%B8+heygirl&password=hello&server=example.com%3A9999\\nbrook://server?name=hey+boy&password=hello&server=example2.com%3A9999&udpovertcp=true",
                        times: 1,
                        expired_at: 60,
                        ing: false,
                        zh: navigator.language.toLowerCase().startsWith("zh-"),
                        url: "",
                    };
                },
                methods: {
                    async generate() {
                        if (this.ing) {
                            return;
                        }
                        this.ing = true;
                        var self = this;
                        var set = async (token) => {
                            self.url = "";
                            var r = await fetch("/set?recaptcha_token=" + encodeURIComponent(token), {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    content: self.content.trim(),
                                    times: parseInt(self.times),
                                    expired_at: parseInt(self.expired_at),
                                }),
                            });
                            if (r.status != 200) {
                                throw await r.text();
                            }
                            self.url = location.origin + "/get?uuid=" + (await r.text());
                        }
                        if (!window.grecaptcha) {
                            try {
                                await set("")
                            } catch (e) {
                                alert(e.toString());
                            }
                            self.ing = false;
                        }
                        if (window.grecaptcha) {
                            grecaptcha.ready(async function () {
                                try {
                                    var token = await grecaptcha.execute("<!--RECAPTCHA_KEY-->", {action: "submit"});
                                    await set(token)
                                } catch (e) {
                                    alert(e.toString());
                                }
                                self.ing = false;
                            });
                        }
                    },
                },
            };
            Vue.createApp(app).mount("body");
        });
    </script>
</head>

<body style="margin: 0">
    <nav class="container-fluid" style="background-color: #000000">
        <ul>
            <li>
                <a href="https://brook.app"><strong style="color: #ffffff">Brook Import Link Generator</strong></a>
            </li>
        </ul>
    </nav>
    <main class="container-fluid">
        <textarea v-model="content" style="height: 300px; width: 100%"></textarea>
    </main>
    <main class="container">
        <div>{{zh ? "次数限制" : "Times limit"}}</div>
        <input type="number" v-model="times" min="1" max="10000" />
        <div>{{zh ? "过期时间" : "Expiration"}}</div>
        <select v-model="expired_at">
            <option value="60">{{ zh ? "1分钟" : "1 minute" }}</option>
            <option value="300">{{ zh ? "5分钟" : "5 minutes" }}</option>
            <option value="600">{{ zh ? "10分钟" : "10 minutes" }}</option>
            <option value="1800">{{ zh ? "30分钟" : "30 minutes" }}</option>
            <option value="3600">{{ zh ? "1小时" : "1 hour" }}</option>
            <option value="21600">{{ zh ? "6小时" : "6 hours" }}</option>
            <option value="43200">{{ zh ? "12小时" : "12 hours" }}</option>
            <option value="86400">{{ zh ? "24小时" : "24 hours" }}</option>
        </select>
        <button @click="generate" :aria-busy="ing ? 'true' : ''">{{zh ? "生成" : "Generate"}}</button>
        <input v-if="url" onclick="this.select();" v-model="url" />
    </main>
</body>

</html>`

const { program } = require('commander')
program
    .name('jb https://bash.ooo/import.js')
    .description('Brook Import Link Generator, limit times, expiration time, restrict browser access. ')
    .option('--ip <string>', 'listen ip', '127.0.0.1')
    .option('--port <int>', 'listen port', 40107)
    .option('--browser', 'allow browser to access brook links directly', false)
    .option('--key <string>', 'Google reCAPTCHA v3 key, optional', '')
    .option('--secret <string>', 'Google reCAPTCHA v3 secret, optional', '')
program.parse();
const options = program.opts();

var sdb = new Database(os.homedir() + "/.import.db", { create: true });
var l = sdb.query(`SELECT name FROM sqlite_master WHERE type='table'`).all();
if (!l.find(v => v.name == 'import')) {
    sdb.query(`
create table import(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid text not null UNIQUE,
    content text not null,
    times INTEGER not null,
    expired_at INTEGER not null
)
`).run();
}

Bun.serve({
    development: false,
    port: options.port,
    hostname: options.ip,
    async fetch(req) {
        try {
            var p = new URL(req.url).pathname
            var q = (k) => new URL(req.url).searchParams.get(k) ? new URL(req.url).searchParams.get(k).trim() : ''
            if (p == "/") {
                if (options.key && options.secret) {
                    html = html
                        .replace('<!--RECAPTCHA_HEAD-->', `<script src="https://www.recaptcha.net/recaptcha/api.js?render=${options.key}"></script>`)
                        .replace('<!--RECAPTCHA_KEY-->', options.key)
                }
                return new Response(html, {
                    headers: {
                        'Content-Type': 'text/html; charset=utf8',
                    },
                });
            }
            if (p == "/set") {
                if (options.key && options.secret) {
                    var r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({ secret: options.secret, response: q('recaptcha_token') }).toString(),
                    })
                    if (!(await r.json()).success) {
                        throw 'Are you bot?'
                    }
                }
                var j = await req.json()
                if (!j.content || j.times <= 0 || j.expired_at <= 0 || j.expired_at > 24 * 60 * 60) {
                    throw 'Are you bot?'
                }
                j.uuid = crypto.randomUUID()
                j.expired_at = now() + j.expired_at
                sdb.query('insert into import(uuid, content, times, expired_at) values(?, ?, ?, ?)').run(j.uuid, j.content, j.times, j.expired_at)
                return new Response(j.uuid);
            }
            if (p == "/get") {
                if (!options.browser) {
                    if (req.headers.get('User-Agent').indexOf('Go-http-client/') == -1 && req.headers.get('User-Agent').indexOf('Dart/') == -1) {
                        var s = req.headers.get('Accept-Language').indexOf('zh-') == -1 ? 'You need Brook to import this link' : '你需要 Brook 客户端来导入此链接'
                        throw s
                    }
                }
                var r = sdb.query('select * from import where uuid=?').get(q('uuid'))
                if (!r) {
                    throw 'not found'
                }
                if (r.expired_at < now()) {
                    sdb.query('delete from import where uuid=?').run(q('uuid'))
                    throw 'expired'
                }
                r.times -= 1
                if (r.times > 0) {
                    sdb.query('update import set times=? where uuid=?').run(r.times, q('uuid'))
                }
                if (r.times <= 0) {
                    sdb.query('delete from import where uuid=?').run(q('uuid'))
                }
                return new Response(r.content)
            }
        } catch (e) {
            return new Response(e.toString(), { status: 500 });
        }
    },
});

var s = options.ip.indexOf(':') == -1 ? `http://${options.ip}:${options.port}` : `http://[${options.ip}]:${options.port}`
echo(`Your server: ${s}`)
echo(`Your may need: nico yourdomain.com ${s}`)
