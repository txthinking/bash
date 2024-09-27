import { Database } from "bun:sqlite";
import * as fs from 'node:fs/promises';

var db = (sdb) => {
    return {
        c: (table, o) => {
            var l = [];
            var l1 = [];
            var params = {};
            for (var k in o) {
                if (k == 'id') {
                    continue;
                }
                l.push(k);
                l1.push(`$${k}`);
                params[`$${k}`] = o[k];
            }
            var r = sdb.query(`insert into ${table}(${l.join(', ')}) values(${l1.join(', ')})`).run(params);
            return sdb.query(`select * from ${table} where id=?`).get(r.lastInsertRowid);
        },
        u: (table, o) => {
            if (!o.id) {
                throw new Error('u needs object has id');
            }
            var l = [];
            var params = {};
            for (var k in o) {
                if (k == 'id') {
                    continue;
                }
                l.push(`${k}=$${k}`);
                params[`$${k}`] = o[k];
            }
            params[`$id`] = o.id;
            sdb.query(`update ${table} set ${l.join(', ')} where id=$id`).run(params);
            return sdb.query(`select * from ${table} where id=?`).get(o.id);
        },
        r: (table, id) => {
            return sdb.query(`select * from ${table} where id=?`).get(id)
        },
        d: (table, id) => {
            sdb.query(`delete from ${table} where id=?`).run(id)
        },
        query: (...args) => {
            return sdb.query(...args);
        },
        transaction: (f) => {
            return sdb.transaction(f)();
        },
        close: () => {
            sdb.close();
        },
    };
};

export default {
    
    country_to_emoji: function (country_code) {
        if (country_code === "UK") {
            country_code = "GB";
        }
        const flag = country_code.replace(/[A-Z]/g, (match) => {
            const cc = match.charCodeAt(0);
            return String.fromCodePoint(cc + 127397);
        });
        return flag;
    },
    
    file_exists: async function(s) {
        try {
            await fs.access(s, fs.constants.F_OK)
            return true
        } catch {
            return false
        }
    },
    
    sqlite: function(path, options) {
        if (options) options = {}
        var s = new Database(path, {
            create: options.readonly ? false : true,
            readonly: options.readonly ? true : false,
        });
        if (options.wal) {
            s.exec("PRAGMA journal_mode = WAL;");
        }
        return db(s);
    },

    migrate: function(sqlite) {
        var f = (id, sql) => {
            var r = sqlite.query(`select * from migration where id=?`).get(id);
            if (r) {
                return
            }
            sqlite.query(sql).run();
            sqlite.query(`insert into migration(id) values(?)`).run(id);
        };
        var l = sqlite.query(`SELECT name FROM sqlite_master WHERE type='table'`).all();
        if (!l.find(v => v.name == 'migration')) {
            sqlite.query(`
create table migration(
    id text not null UNIQUE
)
`).run();
        }
        return f;
    },

    now: function() {
        return parseInt(Date.now() / 1000);
    },

    question: async function(q, v) {
        if (!v) {
            return prompt(q);
        }
        for (; ;) {
            var s = prompt(q);
            if (!s) {
                continue;
            }
            if (typeof v === "function") {
                if (await v(s)) {
                    return s;
                }
                continue;
            }
            if (v.test(s)) {
                return s;
            }
        }
    },

    stdin: async function() {
        var reader = (await Bun.stdin.stream()).getReader();
        var l = [];
        for (; true;) {
            var { done, value } = await reader.read();
            if (value) {
                l.push(value);
            }
            if (done) {
                break;
            }
        }
        var b = new Uint8Array(l.reduce((v, a) => a.length + v, 0));
        var i = 0;
        l.forEach(v => {
            b.set(v, i);
            i += v.length;
        });
        return new TextDecoder().decode(b);
    },

    retry: async function(f, delay, times) {
        var i = 0;
        for (; true; i++) {
            try {
                return await f();
            } catch (e) {
                if (i < times) {
                    if (delay) {
                        await Bun.sleep(delay);
                    }
                    continue;
                }
                throw e;
            }
        }
    },

    select: async function(question, anwseraction) {
        for (; ;) {
            var i = prompt(anwseraction.map((v, i) => `${i + 1}: ${v.anwser}`).join("\n") + `\n${question}`);
            i = parseInt(i);
            if (isNaN(i) || i < 1 || i > anwseraction.length) {
                continue;
            }
            break;
        }
        await anwseraction[i - 1].action();
    },

    go: function(js, args) {
        return new Promise((resolve, reject) => {
            var blob = new Blob(
                [
                    js,
                ],
                {
                    type: "application/javascript",
                },
            );
            var url = URL.createObjectURL(blob);
            var worker = new Worker(url);
            worker.postMessage(args);
            worker.onmessage = event => {
                worker.terminate();
                resolve(event.data)
            };
        });
    },

    setImmediatePromise: function() {
        return new Promise((resolve) => {
            setImmediate(() => resolve());
        });
    },

    // async lock, js lock, js mutex, js sync, js queue
    // var sync = new Sync();
    // await sync.atomic(async () => {});
    Sync: function() {
        var p = Promise.resolve();
        this.atomic = (f) => {
            p = new Promise((resolve, reject) => {
                p.then(() => {
                    f()
                        .then((v) => resolve(v))
                        .catch((v) => reject(v));
                }).catch((e) => {
                    f()
                        .then((v) => resolve(v))
                        .catch((v) => reject(v));
                });
            });
            return p;
        };
    },

    read_url: async function(url) {
        var res = await fetch(url);
        if (!res.ok) {
            throw res.status + ": " + (await res.text());
        }
        return await res.text();
    },

}
