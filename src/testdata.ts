import { AuthResult } from "./types";

export function randrange(start: number, end: number): number {
    // This is really not intended to be precise.
    return Math.floor(Math.random() * (end - start)) + start;
}

export function randomTimeStamp(): string {
    const year = randrange(1971, 2017);
    const month = randrange(1, 12);
    const day = randrange(1, 28); // Goodness, we don't believe in anything other than February.
    const hour = randrange(1, 23);
    const minute = randrange(1, 59);
    const sec = randrange(1, 59);
    return new Date(year, month, day, hour, minute, sec).toUTCString();
}

export function randomIP(): string {
    // These are of course utter-nonsense.
    const a = Math.floor(Math.random() * (255 - 1) + 1);
    const b = Math.floor(Math.random() * (255 - 1) + 1);
    const c = Math.floor(Math.random() * (255 - 1) + 1);
    const d = Math.floor(Math.random() * (255 - 1) + 1);
    return ":ffff:" + [a, b, c, d].join(".");
}

export function randomUsername(): string {
    return Math.floor((Math.random() * 1e8)).toString(35);
}

export function randomUserAgent(): string {
    return "Internet Exploder 5.5";
}

export function randomResult(): AuthResult {
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
