import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cookieParser from "cookie-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (p: string) => path.resolve(__dirname, p);

const isTest = process.env.NODE_ENV === "test" || !!process.env.TEST_BUILD;

const port = process.env.PORT || 3000;

export async function createServer(root = process.cwd(), isProd = process.env.NODE_ENV === "production", hmrPort?: number) {
    const indexProd = isProd ? fs.readFileSync(resolve("../client/index.html"), "utf-8") : "";

    const app = express().disable("x-powered-by").use(cookieParser());

    /**
     * @type {import('vite').ViteDevServer}
     */
    let vite: any;
    if (!isProd) {
        vite = await (
            await import("vite")
        ).createServer({
            root,
            logLevel: isTest ? "error" : "info",
            server: {
                middlewareMode: true,
                watch: {
                    // During tests we edit the files too fast and sometimes chokidar
                    // misses change events, so enforce polling for consistency
                    usePolling: true,
                    interval: 100
                },
                hmr: {
                    port: hmrPort
                }
            },
            appType: "custom"
        });
        // use vite's connect instance as middleware
        app.use(vite.middlewares);
    } else {
        app.use((await import("compression")).default());
        app.use(
            ((await import("serve-static")) as any).default(resolve("../client"), {
                index: false
            })
        );
    }

    app.use("/*", async (req, res) => {
        try {
            const url = req.originalUrl;

            let template, render;
            if (!isProd) {
                // always read fresh template in dev
                template = fs.readFileSync(resolve("../index.html"), "utf-8");
                template = await vite.transformIndexHtml(url, template);
                render = (await vite.ssrLoadModule(resolve("entry.server.tsx"))).render;
            } else {
                template = indexProd;
                // @ts-ignore
                render = (await import("entry.server.js")).render;
            }

            try {
                await render(req, res, template);
            } catch (e: unknown) {
                // When inside of loaders or react components a redirect is thrown we need to handle it here
                if (e instanceof Response && [301, 302, 303, 307, 308].includes(e.status)) {
                    return res.redirect(e.status ?? 301, e.headers.get("Location") ?? "/");
                }
            }
        } catch (e: any) {
            !isProd && vite.ssrFixStacktrace(e);
            console.log(e.stack);
            res.status(500).end(e.stack);
        }
    });

    return { app, vite };
}

if (!isTest) {
    createServer().then(({ app }) =>
        app
            .listen(port, () => {
                console.log(`http://localhost:${port}`);
            })
            .on("error", (error) => {
                console.log(error);
            })
    );
}
