// Gatehouse
import * as bcryptjs from "bcryptjs";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as csurf from "csurf";
import * as express from "express";
import * as session from "express-session";
import * as http from "http";
import * as _ from "lodash";
import * as mongodb from "mongodb";
import * as morgan from "morgan";
import * as path from "path";
// tslint:disable-next-line:no-var-requires
const flash = require("connect-flash");

// Configuration
const gatehousePort = 3000;
const mongoDatabase = "mongodb://localhost:27017/gatehouse";

log(`Initializing Gatehouse on :${gatehousePort}`);

const gatehouse = express();
gatehouse.set("view engine", "pug");
gatehouse.set("views", "./views");
gatehouse.use(morgan("common"));
gatehouse.use(bodyParser.urlencoded({ extended: false }));
gatehouse.use(cookieParser());
gatehouse.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "fidelio-alskfwenr2234oin234o32in4o23i4o3r",
}));
gatehouse.use(flash());
gatehouse.use(csurf());

type HttpMethod = "get" | "put" | "post" | "delete" | "*";
type AuthResult = "auth-pass" | "auth-fail" | "auth-unknown" | "auth-error" | "auth-end";

interface IGatehouseUser {
    username: string;
    passhash: string;
    role: string;
}

interface IAuthEvent {
    timestamp: string;
    ipAddress: string;
    username: string;
    userAgent: string;
    result: AuthResult;
}

function randrange(start: number, end: number): number {
    // This is really not intended to be precise.
    return Math.floor(Math.random() * (end - start)) + start;
}
function randomTimeStamp(): string {
    const year = randrange(1971, 2017);
    const month = randrange(1, 12);
    const day = randrange(1, 28); // Goodness, we don't believe in anything other than February.
    const hour = randrange(1, 23);
    const minute = randrange(1, 59);
    const sec = randrange(1, 59);
    return new Date(year, month, day, hour, minute, sec).toUTCString();
}
function randomIP(): string {
    // These are of course utter-nonsense.
    const a = Math.floor(Math.random() * (255 - 1) + 1);
    const b = Math.floor(Math.random() * (255 - 1) + 1);
    const c = Math.floor(Math.random() * (255 - 1) + 1);
    const d = Math.floor(Math.random() * (255 - 1) + 1);
    return ":ffff:" + [a, b, c, d].join(".");
}

function randomUsername(): string {
    return Math.floor((Math.random() * 1e8)).toString(35);
}

function randomUserAgent(): string {
    return "Internet Exploder 5.5";
}

function randomResult(): AuthResult {
    const observation = Math.random();
    if (observation < 0.005) {
        return "auth-error";
    }
    if (observation < 0.015) {
        return "auth-unknown";
    }
    if (observation < 0.02) {
        return "auth-fail";
    }
    if (observation < 0.40) {
        return "auth-end";
    }
    return "auth-pass";
}

function generateIAuthEvent(): IAuthEvent {
    const ae: IAuthEvent = {
        ipAddress: randomIP(),
        result: randomResult(),
        timestamp: randomTimeStamp(),
        userAgent: randomUserAgent(),
        username: randomUsername(),
    };
    return ae;
}

function recordIAuthEvent(ae: IAuthEvent) {
    const recorder = MDB.collection("authEvents");
    recorder.insertOne(ae);
}

interface IExRoute {
    method: HttpMethod;
    path: string;
    handler: (request, response) => void;
}

// FIXME Need to add authorization middleware to routing to
// exclude API/pages from unauthenticated users. In other words,
// this has *authentication* but not *authorization* checks.
const gatehouseRoutes: IExRoute[] = [
    { method: "get", path: "/", handler: getFrontR }
    , { method: "get", path: "/acct/register", handler: getRegisterR }
    , { method: "post", path: "/acct/register", handler: postRegisterR }
    , { method: "get", path: "/test/generateData", handler: getTestGenerateDataR }
    , { method: "get", path: "/test/eraseDb", handler: getTestEraseDbR }
    , { method: "get", path: "/test/eraseIAuthEvents", handler: getTestEraseIAuthEventsR }
    , { method: "post", path: "/acct/login", handler: postLoginR }
    , { method: "get", path: "/acct/login", handler: getFrontR }
    , { method: "get", path: "/acct/logout", handler: getLogoutR }
    , { method: "post", path: "/api/1/record", handler: postRecordR }
    , { method: "get", path: "/acct/dashboard", handler: getDashboardR }
    , { method: "get", path: "/api/1/findRecords", handler: getFindRecordsR }
    ,
];

function getTestGenerateDataR(request, response) {
    const num = 50;
    for (let i = 0; i < num; i++) {
        recordIAuthEvent(generateIAuthEvent());
    }
    request.flash("info", `Created ${num} test records.`);
    response.redirect("/acct/dashboard");
}

function getTestEraseDbR(request, response) {
    MDB.dropDatabase();
    request.flash("info", `Dropped the database.`);
    response.redirect("/");
}

function getTestEraseIAuthEventsR(request, response) {
    MDB.dropCollection("authEvents");
    request.flash("info", `Dropped the authEvents.`);
    response.redirect("/acct/dashboard");
}

function getTestEraseUsersR(request, response) {
    MDB.dropCollection("users");
    request.flash("info", `Dropped the users.`);
    response.redirect("/");
}
function getFrontR(request, response): void {
    response.render("index", {
        csrfToken: request.csrfToken(),
        errors: request.flash("error"),
        messages: request.flash("info"),
        title: "",
        username: request.session.username,
    });
}

function getDashboardR(request, response): void {
    response.render("acct/dashboard", {
        csrfToken: request.csrfToken(),
        errors: request.flash("error"),
        messages: request.flash("info"),
        title: "Dashboard",
        username: request.session.username,
    });
}

function getRegisterR(request, response): void {
    response.render("acct/register", {
        csrfToken: request.csrfToken(),
        errors: request.flash("error"),
        messages: request.flash("info"),
        title: "Account Registration",
        username: request.session.username,
    });
}

function getFindRecordsR(request, response): void {
    const authEvents = MDB.collection("auth_events");
    authEvents.find().toArray(processRecords);
    function processRecords(err, recs) {
        if (err) {
            response.end(err);
            return;
        }
        response.end(JSON.stringify(recs));
    }
}

function postRegisterR(request, response): void {
    // Unpack form parameters.
    const un = request.body.username;
    const pw = request.body.password;
    const pwc = request.body.confirm;

    // cases:
    //    mismatched passwords
    //    pre-existing user
    if (pw !== pwc) {
        request.flash("error", "Password and password confirmation do not match.");
        response.redirect("/acct/register");
        return;
    }
    // Utilities and behaviors

    function genericDatabaseError() {
        request.flash("error", "Database error returned.");
        response.redirect("/acct/register");
        return;
    }

    function maybeExists(err, exists) {
        if (err) {
            genericDatabaseError();
            return;
        }
        if (exists) {
            request.flash("error", "Username already exists.");
            response.redirect("/acct/register");
            return;
        }
        createUser();
    }

    function createUser() {
        registerUser(un, pw, maybeCreated);
    }

    function maybeCreated(err, created) {
        if (err) {
            genericDatabaseError();
            return;
        }
        if (created) {
            request.flash("info", "Account created, please login.");
            response.redirect("/acct/login");
            return;
        }
        request.flash("error", "Unknown error creating account.");
        response.redirect("/acct/register");
        return;
    }

    // Registration processing begins here:
    userExists(un, maybeExists);
}

function userExists(un: string, cb: (err, exists) => void) {
    function eitherErrorUser(err, user) {
        if (err) {
            cb(err, true); // Don't allow registration if there was an error.
            return;
        }
        if (user) { // Don't re-register the same user.
            cb(null, true);
            return;
        }
        cb(null, false);
    }
    getUser(un, eitherErrorUser);
}

function postRecordR(request, response): void {
    response.end("TBD (record).");
}
function getLogoutR(request, response): void {
    request.flash("info", `Thank you ${request.session.username}, you are now logged out.`);
    request.session.username = null;
    response.redirect("/");
}
function postLoginR(request, response): void {
    const un = request.body.username;
    const pw = request.body.password;

    verifyUser(request.ip, request.userAgent, un, pw, eitherErrorVerified);
    function eitherErrorVerified(err, verified) {
        if (err) {
            request.flash("error", "There was an error accessing the account.");
            response.redirect("/acct/login");
            return;
        }
        if (!err && !verified) {
            request.flash("error", "Access denied.");
            response.redirect("/acct/login");
            return;
        }
        request.flash("info", "Access permitted.");
        request.session.username = un;
        response.redirect("/acct/dashboard");
    }
}

function log_error(str: string): void {
    log(`ERROR\t ${str}`);
}

function log(str: string): void {
    const ts = new Date().toString();
    process.stderr.write([ts, str].join(":") + "\n");
}

function registerRoute(r: IExRoute) {
    log("Route: " + [r.method, r.path].join(" "));
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
        log_error(`Mongo connection error: ${err}`);
        // This is not production, will not reconnect in future.
        process.exit(1);
    }
    log(`Connected to ${mongoDatabase}`);
    MDB = db;
}
_.each(gatehouseRoutes, registerRoute);

process.on("SIGINT", () => {
    log_error("SIGINT: Caught.");
    if (MDB !== null) {
        log_error("Closing database connection.");
        MDB.close();
    }
    process.exit();
});

function registerUser(username: string, password: string, cb?: (err: string, created: boolean) => void) {
    const salt = bcryptjs.genSaltSync();
    const hashed = bcryptjs.hashSync(password, salt);
    const users = MDB.collection("users");
    cb = cb ? cb : (): void => { return; };
    users.insertOne({
        passhash: hashed,
        salt,
        username,
    }, cb);
}

function getUser(username: string, cb: (err, user) => void) {
    const users = MDB.collection("users");
    users.findOne({ username }, cb);
}

function getTimestamp(): string {
    const now = new Date();
    return now.toUTCString();
}

function verifyUser(ip: string, userAgent: string, username: string, password: string, cb: (err, verified) => void) {
    getUser(username, eitherErrorMaybeUser);
    function eitherErrorMaybeUser(err, user) {
        if (err) {
            const authError: IAuthEvent = {
                ipAddress: ip,
                result: "auth-error",
                timestamp: getTimestamp(),
                userAgent,
                username,
            };
            recordIAuthEvent(authError);
            cb(err, null);
            return;
        }
        if (!err && !user) {
            const authUnknown: IAuthEvent = {
                ipAddress: ip,
                result: "auth-unknown",
                timestamp: getTimestamp(),
                userAgent,
                username,
            };
            recordIAuthEvent(authUnknown);
            cb(null, false);
            return;
        }
        const verifier = bcryptjs.hashSync(password, user.salt);
        if (verifier === user.passhash) {
            const authPassed: IAuthEvent = {
                ipAddress: ip,
                result: "auth-pass",
                timestamp: getTimestamp(),
                userAgent,
                username,
            };
            recordIAuthEvent(authPassed);
            cb(null, true);
            return;
        }
        const ae: IAuthEvent = {
            ipAddress: ip,
            result: "auth-fail",
            timestamp: getTimestamp(),
            userAgent,
            username,
        };
        recordIAuthEvent(ae);
        cb(null, false);
    }
}

gatehouse.use(express.static("public"));
http.createServer(gatehouse).listen(gatehousePort);
