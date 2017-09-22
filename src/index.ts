// Gatehouse
import * as http from "http";
import * as _ from "lodash";
import * as path from "path";
import * as bcryptjs from "bcryptjs";
import * as mongodb from "mongodb";

// Configuration
let gatehousePort = 3000;
let publicPath = path.resolve(__dirname, "public");
let mongoDatabase = "mongodb://localhost:27017/gatehouse";

let express = require('express');
let gatehouse = express();

type HttpMethod = "get" | "put" | "post" | "delete" | "*";

interface GatehouseUser {
    username: string;
    passhash: string;
    role: string;
}

interface AuthEvent {
    timestamp: string;
    ip_address: string;
    username: string;
    user_agent: string; 
    result: string;
}

interface ExRoute {
    method: HttpMethod;
    path: string;
    handler: Function;
}

let gatehouseRoutes: Array<ExRoute> = [
    { method: "get", path: "/", handler: getFrontR }
    , { method: "get", path: "/acct/register", handler: getRegisterR }
    , { method: "post", path: "/acct/register", handler: postRegisterR }
    , { method: "post", path: "/acct/login", handler: postLoginR }
    , { method: "post", path: "/api/1/record", handler: postRecordR }
];

function getFrontR(request, response): void {
    response.end("TBD (front).");
}

function getRegisterR(request, response): void {
    response.end("TBD (registration).");
}

function postRegisterR(request, response): void {
    response.end("TBD (registration).");
}

function postRecordR(request, response): void {
    response.end("TBD (record).");
}
function postLoginR(request, response): void {
    response.end("TBD (login).");
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
let MDB = null;
mongodb.MongoClient.connect(mongoDatabase, mclientHandler);
function mclientHandler(err, db) {
    if (err !== null) {
        log_error("Mongo connection error: " + err);
        // This is not production, will not reconnect in future.
        process.exit(1);
    }
    MDB = db;
}
_.each(gatehouseRoutes, registerRoute);

process.on('SIGINT', function () {
    log_error("SIGINT: Caught.");
    if (MDB!==null) { 
        MDB.close();
    }
    process.exit();
});

http.createServer(gatehouse).listen(gatehousePort);
