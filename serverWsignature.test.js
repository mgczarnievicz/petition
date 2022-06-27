/* ------------------------------------------------------------------
            Testing server: with user, with signature
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

// !!!!! como hago esto??
jest.mock("./db.js");

cookieSession.mockSession({
    userId: 1,
    signatureId: 1,
});

test("Get: / -> expected redirect to petition", () => {
    return supertest(app)
        .get("/")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

// Se pueden ver las cookies???
test("Get: /logout -> expected to go to login", () => {
    return supertest(app)
        .get("/logout")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/login");
        });
});

test("Get: /home -> expected to redirect petition", () => {
    return supertest(app)
        .get("/home")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("Get: /login -> expected to redirect petition", () => {
    return supertest(app)
        .get("/login")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

// ?????? what should I do???
test("Get: /profile -> expected redirect to thanks", () => {
    return supertest(app)
        .get("/profile")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

test("Get: /petition -> expected to go to petition", () => {
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

test("Get: /thanks -> expected to thanks", () => {
    return supertest(app)
        .get("/thanks")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /signers -> expected to /signers", () => {
    return supertest(app)
        .get("/signers")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /signers/Paloma -> expected to redirect petition", () => {
    return supertest(app)
        .get("/signers/Paloma")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /configuration -> expected to go to configuration", () => {
    return supertest(app)
        .get("/configuration")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /configuration/profile -> expected to go to  /configuration/profile", () => {
    return supertest(app)
        .get("/configuration/profile")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /configuration/signature -> expected to go: /configuration/signature", () => {
    return supertest(app)
        .get("/configuration/signature")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /configuration/newpassword -> expected to go /configuration/newpassword", () => {
    return supertest(app)
        .get("/configuration/newpassword")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /configuration/deleteAccount -> expected to /configuration/deleteAccount", () => {
    return supertest(app)
        .get("/configuration/deleteAccount")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});
