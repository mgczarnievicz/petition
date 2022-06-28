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
const {
    searchProfileByUserId,
    getSigners,
    getSignersByCity,
    countSignatures,
    getUserNameAndSignatureBySignatureId,
    getUserInformationById,
    getSignatureBySignatureId,
} = require("./db.js");

jest.mock("./db.js");

cookieSession.mockSession({
    userId: 1,
    signatureId: 1,
});

// 1st to petition and then to thanks
test("Get: / -> expected redirect to thanks", () => {
    return supertest(app)
        .get("/")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
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

// 1st to petition and then to thanks
test("Get: /home -> expected to redirect thanks", () => {
    return supertest(app)
        .get("/home")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

// 1st to petition and then to thanks
test("Get: /login -> expected to redirect thanks", () => {
    return supertest(app)
        .get("/login")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

// I already have a user Id and Signature Id.
// And then to thanks
test("Get: /profile -> expected redirect to thenks", () => {
    searchProfileByUserId.mockImplementationOnce(() =>
        Promise.resolve({
            rows: [
                {
                    id: 1,
                    user_id: 1,
                    age: null,
                    city: null,
                    profilePage: null,
                },
            ],
        })
    );
    return supertest(app)
        .get("/profile")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

test("Get: /petition -> expected to go to thanks", () => {
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

test("Get: /thanks -> expected to thanks", () => {
    getUserNameAndSignatureBySignatureId.mockImplementationOnce(() =>
        Promise.resolve({
            rows: [
                {
                    name: "Maria",
                    surname: "Inciarte",
                    signature: "ajfafjbaewh",
                },
            ],
        })
    );

    countSignatures.mockImplementationOnce(() => Promise.resolve({ rows: 2 }));

    return supertest(app)
        .get("/thanks")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /signers -> expected to /signers", () => {
    getSigners.mockImplementationOnce(() =>
        Promise.resolve({
            rows: [
                {
                    id: 1,
                    name: "Maria",
                    surname: "Inciarte",
                    signatureId: 2,
                    age: 21,
                    city: "Paloma",
                    profilePage:
                        "https://spiced.space/cayenne/schedule#current-week",
                },
                {
                    id: 2,
                    name: "Marte",
                    surname: "Inciarte",
                    signatureId: 3,
                    age: 23,
                    city: "Paloma",
                    profilePage:
                        "https://spiced.space/cayenne/schedule#current-week",
                },
            ],
        })
    );

    return supertest(app)
        .get("/signers")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /signers/Paloma -> expected to redirect petition", () => {
    getSignersByCity.mockImplementationOnce(() =>
        Promise.resolve({
            rows: [
                {
                    id: 1,
                    name: "Maria",
                    surname: "Inciarte",
                    signatureId: 2,
                    age: 21,
                    profilePage:
                        "https://spiced.space/cayenne/schedule#current-week",
                },
                {
                    id: 2,
                    name: "Marte",
                    surname: "Inciarte",
                    signatureId: 3,
                    age: 23,
                    profilePage:
                        "https://spiced.space/cayenne/schedule#current-week",
                },
            ],
        })
    );

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
    getUserInformationById.mockImplementationOnce(() =>
        Promise.resolve({
            rows: [
                {
                    name: "Maria",
                    surname: "Inciarte",
                    email: "maria@iniciate",
                    age: 23,
                    city: "Montevideo",
                    profilePage: null,
                },
            ],
        })
    );
    return supertest(app)
        .get("/configuration/profile")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
});

test("Get: /configuration/signature -> expected to go: /configuration/signature", () => {
    getSignatureBySignatureId.mockImplementationOnce(() =>
        Promise.resolve({
            rows: [
                {
                    id: 2,
                    user_id: 1,
                    signature: "asfsdfrg",
                },
            ],
        })
    );
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
