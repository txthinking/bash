export default {

    now: function(){
        return parseInt(Date.now() / 1000);
    },

    question: function (q, v) {
        if (!v) {
            return prompt(q);
        }
        for (; ;) {
            var s = prompt(q);
            if (!s) {
                continue;
            }
            if (typeof v === "function") {
                if (v(s)) {
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

    select: async function (question, anwseraction) {
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

    read_url: async function (url) {
        var res = await fetch(url);
        if (!res.ok) {
            throw res.status + ": " + (await res.text());
        }
        return await res.text();
    },

}
