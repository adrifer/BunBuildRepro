import { renderToPipeableStream } from "react-dom/server";

import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { Helmet } from "react-helmet";
import { isbot } from "isbot";
import App from "@/app/App";

// see index.html
const APP_HTML = "<!--app-html-->";


export async function render(req: ExpressRequest, res: ExpressResponse, template: string) {
    const templateChunks = template.split(APP_HTML);

    let didError = false;

    const callbackName = isbot(req.headers["user-agent"]) ? "onAllReady" : "onShellReady";

    const stream = renderToPipeableStream(
        <App />,
        {
            [callbackName]: () => {
                const helmet = Helmet.renderStatic();
                const headTags = `${helmet.title.toString()}\n${helmet.meta.toString()}\n${helmet.link.toString()}\n${helmet.style.toString()}\n`;

                res.setHeader("Content-type", "text/html");
                res.write(templateChunks[0].replace("</head>", `\n${headTags}\n</head>`));
                res.statusCode = didError ? 500 : 200;
                stream.pipe(res);
            },
            onError: (err) => {
                didError = true;
                console.log(err);
            }
        }
    );
}
