import { defineConfig, normalizePath } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import checker from "vite-plugin-checker";
import dns from "dns";
import browserRouteModulesVitePlugin from "./browserRouteModulesPlugin";
import path from "path";

dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteTsconfigPaths(),
        checker({
            typescript: true
        }),
        svgrPlugin()
        // browserRouteModulesVitePlugin({
        //     match(path) {
        //         if (path.startsWith(normalizePath(`${__dirname}/src/app/pages/`))) return ["loader"];
        //     }
        // })
    ],
    server: {
        port: 3000
    },
    ssr: {
        noExternal: ["@loadable/component"]
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
});
