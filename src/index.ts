// Gatehouse
import * as http from "http";
import * as _ from "lodash";
import * as path from "path";
import * as bcryptjs from "bcryptjs";
import * as mongodb from "mongodb";
import * as csurf from "csurf";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as session from "express-session";
import * as morgan from "morgan";
let flash = require('connect-flash');

// Configuration
let gatehousePort = 3000;
let mongoDatabase = "mongodb://localhost:27017/gatehouse";

log(`Initializing Gatehouse on :${gatehousePort}`);

let express = require('express');
let gatehouse = express();
gatehouse.set('view engine', 'pug');
gatehouse.set('views', './views');
gatehouse.use(morgan('common'));
gatehouse.use(bodyParser.urlencoded({ extended: false }));
gatehouse.use(cookieParser());
gatehouse.use(session({
    secret: "fidelio-alskfwenr2234oin234o32in4o23i4o3r",
    resave: true,
    saveUninitialized: true
}));
gatehouse.use(flash());
gatehouse.use(csurf());

type HttpMethod = "get" | "put" | "post" | "delete" | "*";
type AuthResult = "auth-pass" | "auth-fail" | "auth-unknown" | "auth-error" | "auth-end";

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
    result: AuthResult;
}
function randrange(start: number, end: number): number {
    // This is really not intended to be precise.
    return Math.floor(Math.random() * (end - start)) + start;
}
function randomTimeStamp(): string {
    let year = randrange(1971,2017);
    let month = randrange(1,12);
    let day = randrange(1,28); // Goodness, we don't believe in anything other than February.
    let hour = randrange(1,23);
    let minute = randrange(1,59);
    let sec = randrange(1,59);
    return new Date(year, month, day, hour, minute, sec).toUTCString();
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

function randomResult(): AuthResult {
    let observation = Math.random();
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
    let recorder = MDB.collection('auth_events');
    recorder.insertOne(ae);
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
    for (var i = 0; i < 50; i++) {
        recordAuthEvent(generateAuthEvent());
    }
    response.redirect("/");
}

function getFrontR(request, response): void {
    response.render('index', {
        title: "",
        csrfToken: request.csrfToken()
    });
}

function getRegisterR(request, response): void {
    response.render('acct/register', {
        title: "Account Registration",
        csrfToken: request.csrfToken()
    });
}

function postRegisterR(request, response): void {
    // Unpack form parameters. 
    let un = request.body['username'];
    let pw = request.body['password'];
    let pwc = request.body['confirm'];

    // cases: 
    //    mismatched passwords
    //    pre-existing user 

    if (pw !== pwc) {
        response.render('acct/register', {
            title: "Account Registration",
            error: "Password and password confirmation do not match."
        });
        return;
    }
    // Utilities and behaviors

    function genericDatabaseError() {
        response.render('acct/register', {
            title: "Account Registration",
            error: "Database error returned."
        });
        return;
    }

    function maybeExists(err, exists) {
        if (err) {
            genericDatabaseError();
            return;
        }
        if (exists) {
            response.render('acct/register', {
                title: "Account Registration",
                error: "Username already exists."
            });
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
            response.render("acct/login", { title: "Account Login", message: "Account created, please log-in." });
            return;
        }
        response.render("acct/register", {
            title: "Account Registration",
            error: "Unknown error creating account."
        });
        return;
    }

    // Registration processing begins here:
    userExists(un, maybeExists);
}

function userExists(un: string, cb: Function) {
    function eitherErrorUser(err, user) {
        if (err) {
            cb(err, true); // Don't allow registration if there was an error.
            return;
        }
        if (!(err && user)) {
            cb(null, false);
            return;
        }
        cb(null, false);
    }
    getUser(un, eitherErrorUser);
}

function postRecordR(request, response): void {
    response.end("TBD (record).");
}
function postLoginR(request, response): void {
    let un = request.body['username'];
    let pw = request.body['password'];
    
    verifyUser(request.ip, request.user_agent, un, pw, eitherErrorVerified);
    function eitherErrorVerified(err, verified) {
        if (err) {
            response.render("acct/login", {
                title: "Account Login",
                error: "There was an error accessing the account."
            });
            return;
        }
        if (!err && !verified) {
            response.render("acct/login", {
                title: "Account Login",
                error: "Access denied."
            });
            return;
        }
        response.redirect("/acct/dashboard");
    }
}

function log_error(str: string): void {
    log(`ERROR\t ${str}`);
}

function log(str: string): void {
    let ts = new Date().toString();
    process.stderr.write([ts, str].join(':') + "\n");
}

function registerRoute(r: ExRoute) {
    log("Route: " + [r.method, r.path].join(' '))
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

process.on('SIGINT', function () {
    log_error("SIGINT: Caught.");
    if (MDB !== null) {
        log_error("Closing database connection.");
        MDB.close();
    }
    process.exit();
});


function registerUser(username: string, password: string, cb?: Function) {
    let salt = bcryptjs.genSaltSync();
    let hashed = bcryptjs.hashSync(password, salt);
    let users = MDB.collection('users');
    cb = cb ? cb : () => { };
    users.insertOne({
        username: username,
        passhash: hashed,
        salt: salt
    }, cb);
}

function getUser(username: string, cb: Function) {
    var users = MDB.collection('users');
    users.findOne({ username: username }, cb);
}

function getTimestamp(): string {
    let now = new Date();
    return now.toUTCString();
}

function verifyUser(ip: string, user_agent: string, username: string, password: string, cb: Function) {
    getUser(username, eitherErrorMaybeUser);
    function eitherErrorMaybeUser(err, user) {
        if (err) {
            let ae: AuthEvent = {
                timestamp: getTimestamp(),
                ip_address: ip,
                username: username,
                user_agent: user_agent,
                result: "auth-error"
            };
            recordAuthEvent(ae);
            cb(err, null);
            return;
        }
        if (!err && !user) {
            let ae: AuthEvent = {
                timestamp: getTimestamp(),
                ip_address: ip,
                username: username,
                user_agent: user_agent,
                result: "auth-unknown"
            };
            recordAuthEvent(ae);            
            cb(null, false);
            return;
        }
        var verifier = bcryptjs.hashSync(password, user.salt);
        if (verifier === user.passhash) {
            let ae: AuthEvent = {
                timestamp: getTimestamp(),
                ip_address: ip,
                username: username,
                user_agent: user_agent,
                result: "auth-pass"
            };
            recordAuthEvent(ae);              
            cb(null, true);
            return;
        }
        let ae: AuthEvent = {
            timestamp: getTimestamp(),
            ip_address: ip,
            username: username,
            user_agent: user_agent,
            result: "auth-fail"
        };
        recordAuthEvent(ae);         
        cb(null, false);
    }
}

gatehouse.use(express.static('public'));
http.createServer(gatehouse).listen(gatehousePort);
