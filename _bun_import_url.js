const rx_any = /./;
const rx_http = /^https?:\/\//;
const rx_relative_path = /^\.\.?\//;

function load_http_module(href) {
    return fetch(href).then(function (response) {
        return response.text().then(function (text) {
            return (
                response.ok
                ? {contents: text, loader: "js"}
                : Promise.reject(
                    new Error("Failed to load module '" + href + "': " + text)
                )
            );
        });
    });
}

Bun.plugin({
    name: "http_imports",
    setup(build) {
        build.onResolve({filter: rx_relative_path}, function (args) {
            if (rx_http.test(args.importer)) {
                return {path: new URL(args.path, args.importer).href};
            }
        });
        build.onLoad({filter: rx_any, namespace: "http"}, function (args) {
            return load_http_module("http:" + args.path);
        });
        build.onLoad({filter: rx_any, namespace: "https"}, function (args) {
            return load_http_module("https:" + args.path);
        });
    }
});
