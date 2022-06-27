/* ------------------------------------------------------------------
            Testing server: no user
-------------------------------------------------------------------*/

/*                  MY Routs :

req.url == "/logout"
req.url == "/home"
req.url == "/login"
req.url == "/profile"
req.url == "/petition" 
req.url == "/thanks"
req.url == "/signers"
req.url == "/signers/:city"

req.url == "/configuration"
req.url == "/configuration/profile"
req.url == "/configuration/signature"
req.url == "/configuration/newpassword"
req.url == "/configuration/deleteAccount"


*/

const supertest = require("supertest");
const { app } = require("./server.js");
const cookieSession = require("cookie-session");

cookieSession.mockSession({
    userId: null,
    signatureId: null,
});

test("Get: / -> expected redirect to Home", () => {
    return supertest(app)
        .get("/")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test("Get: /logout -> expected to go to home", () => {
    return supertest(app)
        .get("/logout")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test("Get: /home -> expected to go to home", () => {
    return supertest(app)
        .get("/home")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /login -> expected to go to login", () => {
    return supertest(app)
        .get("/login")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /profile -> expected redirect to home", () => {
    return supertest(app)
        .get("/profile")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test("Get: /petition -> expected to go to home", () => {
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test("Get: /thanks -> expected to go to home", () => {
    return supertest(app)
        .get("/thanks")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test("Get: /signers -> expected to go to home", () => {
    return supertest(app)
        .get("/signers")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test("Get: /signers/hola -> expected to go to home", () => {
    return supertest(app)
        .get("/signers/hola")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test("Get: /configuration -> expected to go to home", () => {
    return supertest(app)
        .get("/configuration")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test("Get: /configuration/profile -> expected to go to home", () => {
    return supertest(app)
        .get("/configuration/profile")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test("Get: /configuration/signature -> expected to go to home", () => {
    return supertest(app)
        .get("/configuration/signature")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test("Get: /configuration/newpassword -> expected to go to home", () => {
    return supertest(app)
        .get("/configuration/newpassword")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test("Get: /configuration/deleteAccount -> expected to go to home", () => {
    return supertest(app)
        .get("/configuration/deleteAccount")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});
