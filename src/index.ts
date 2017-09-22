// Gatehouse
import * as http from "http";
import * as _ from "lodash";
import * as path from "path";

// Configuration
let gatehousePort = 3000;
let publicPath = path.resolve(__dirname, "public");

let express = require('express');
let gatehouse = express();

type HttpMethod = "get" | "put" | "post" | "delete" | "*";

interface ExRoute {
    method: HttpMethod;
    path: string;
    handler: Function;
}

let gatehouseRoutes: Array<ExRoute> = [
    { method: "get", path: "/", handler: getFrontR }
    , { method: "get", path: "/acct/register", handler: getRegisterR }
];

function getFrontR(request, response): void {
    response.end("TBD (front).");
}

function getRegisterR(request, response): void {
    response.end("TBD (registration).");
}

function log_error(str: string): void {
    process.stderr.write(str);
}

function registerRoute(r: ExRoute) {
    switch (r.method) {
        case "get": gatehouse.get(r.path, r.handler); break;
        case "put": gatehouse.put(r.path, r.handler); break;
        case "post": gatehouse.post(r.path, r.handler); break;
        case "delete": gatehouse.delete(r.path, r.handler); break;
        case "*": gatehouse.all(r.path, r.handler); break;
        default:
            log_error("Unknown method type: " + r.method);
            process.exit(1);
    }
}

_.each(gatehouseRoutes, registerRoute);
http.createServer(gatehouse).listen(gatehousePort);
