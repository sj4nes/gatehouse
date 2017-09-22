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
function randomTimeStamp(): string {
    let ts = Math.floor(Math.random() * 1e8 * 1000);
    return new Date(ts).toUTCString();
}
function randomIP(): string {
    // These are of course utter-nonsense.
    let a = Math.floor(Math.random() * (255 - 1) + 1);
    let b = Math.floor(Math.random() * (255 - 1) + 1);
    let c = Math.floor(Math.random() * (255 - 1) + 1);
    let d = Math.floor(Math.random() * (255 - 1) + 1);
    return ":ffff:" + [a, b, c, d].join('.');
}

function randomUsername(): string {
    return Math.floor((Math.random() * 1e8)).toString(35);
}

function randomUserAgent(): string {
    return "Internet Exploder 5.5";
}

function randomResult(): string {
    let observation = Math.random();
    if (observation < 0.01) {
        return "failed";
    }
    if (observation < 0.40) {
        return "logged-out";
    }
    return "logged-in";
}

function generateAuthEvent(): AuthEvent {
    let ae: AuthEvent =
        {
            timestamp: randomTimeStamp(),
            ip_address: randomIP(),
            username: randomUsername(),
            user_agent: randomUserAgent(),
            result: randomResult()
        };
    return ae;
}

function recordAuthEvent(ae: AuthEvent) {
    let log = MDB.collection('auth_events');
    log.insertOne(ae);
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
    , { method: "get", path: "/acct/test", handler: getCreateTestDataR }
    , { method: "post", path: "/acct/login", handler: postLoginR }
    , { method: "post", path: "/api/1/record", handler: postRecordR }
];

function getCreateTestDataR(request, response) {
    registerUser("admin", "swordfish");
    registerUser("baduser", "password");
    for (var i = 0; i < 1e5; i++) {
        recordAuthEvent(generateAuthEvent());
    }
    response.end("Test data created.");
}

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
    let ts = new Date().toString();
    process.stderr.write("\n" + [ts, str].join(':'));
}

function registerRoute(r: ExRoute) {
    log_error("Path: " + [r.method, r.path].join(' '))
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
    console.log(arguments);
    if (err !== null) {
        log_error("Mongo connection error: " + err);
        // This is not production, will not reconnect in future.
        process.exit(1);
    }
    MDB = db;
}
gatehouse.use(serverLogger);
function serverLogger(request, response, next) {
    log_error([request.method, request.url, request.ip].join(" "));
    next();
}
_.each(gatehouseRoutes, registerRoute);

process.on('SIGINT', function () {
    log_error("SIGINT: Caught.");
    if (MDB !== null) {
        log_error("Closing database connection.");
        MDB.close();
    }
    process.exit();
});
log_error("Starting Gatehouse");
log_error("Listening on " + gatehousePort);

function registerUser(username: string, password: string) {
    let salt = bcryptjs.genSaltSync();
    let hashed = bcryptjs.hashSync(password, salt);
    let users = MDB.collection('users');
    users.insertOne({
        username: username,
        passhash: hashed,
        salt: salt
    });
}

http.createServer(gatehouse).listen(gatehousePort);
