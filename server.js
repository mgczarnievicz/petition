const PORT = 8080;

const express = require("express");
const app = express();

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

const secrets = require("./secrets");
const { SECRET_COOKIE_SESSION } = secrets;

const { getName, addSignature } = require("./db");
const {
    getSignerByIdAndTotalSigners,
    registerNewUser,
    logInVerify,
    verifyingInputs,
} = require("./process");

const bodyParser = require("body-parser");

const cookieSession = require("cookie-session");

// FIXME! function not working. doing things by hand.
function setSessionCookie(session, key, value) {
    console.log(`key: ${key}, value: ${value}`);
    session[key] = value;
    console.log("Session in set function", session);
    return;
}

app.use(
    cookieSession({
        /* This is use to generate the signature of the encription. 
        When we recived the cookie, if the signature is not the same that we generate,
        we assume that the cookie was tempted and we distructed. */
        secret: SECRET_COOKIE_SESSION,
        // How much the cookie is going to live.
        maxAge: 1000 * 60 * 60 * 24 * 14,

        // So that the cookies can only use in the same page, can not be modify form another
        sameSite: true,
    })
);

// For Protection propose
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});

app.use((req, res, next) => {
    console.log("---------------------");
    console.log("req.url:", req.url);
    console.log("req.method:", req.method);
    console.log("req.session:", req.session);
    console.log("---------------------");
    next();
});

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(express.static("./public"));

// REVIEW When we have the tables connected.
app.use((req, res, next) => {
    // if (req.url != "/petition" && req.url != "/petition/") {
    //     if (req.session.signatureId) {
    //         next();
    //     } else {
    //         // He did not sign.
    //         res.redirect("/petition");
    //     }
    // } else {
    //     // If the person already signed I want to go to the Thanks page.
    //     if (req.session.signatureId) {
    //         res.redirect("/thanks");
    //     } else {
    //         next();
    //     }
    // }
    next();
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        title: "Petition",
        withNavBar: true,
        error: false,
    });
});

app.get("/thanks", (req, res) => {
    getSignerByIdAndTotalSigners(req.session.signatureId).then((result) => {
        res.render("thanks", {
            title: "Thanks",
            withNavBar: true,
            user: result[0],
            totalSigners: result[1].count,
        });
    });
});

app.get("/signers", (req, res) => {
    getName()
        .then((result) => {
            const listOfSigners = result.rows;
            res.render("signers", {
                title: "Signers",
                withNavBar: true,
                listOfSigners,
            });
        })
        .catch((err) => console.log("Error:", err));
});

app.get("/logout", (req, res) => {
    console.log("I am in Logout, we clear the cookies");
    req.session = null;
    res.redirect("/login");
});

app.get("/home", (req, res) => {
    res.render("home", {
        title: "Home",
        withNavBar: false,
        error: false,
        errMessage: "",
    });
});

app.get("/login", (req, res) => {
    res.render("logIn", { title: "Login", withNavBar: false, error: false });
});

app.get("/configuration", (req, res) => {
    res.render("configuration", {
        title: "Configuration",
        withNavBar: true,
    });
});

app.get("/profile", (req, res) => {
    res.render("profile", { title: "Login", withNavBar: true, error: false });
});

app.get("/signature", (req, res) => {
    res.render("signature", {
        title: "Signature",
        withNavBar: true,
    });
});

app.get("/newpassword", (req, res) => {
    res.render("configuration", {
        title: "Configuracion",
        withNavBar: true,
    });
});

// POST in pettion is missing.
app.post("/petition", (req, res) => {
    console.log("Getting info of pettion");
    addSignature(req.body.name, req.body.surname, req.body.signature)
        .then((result) => {
            // setSessionCookie(req.session, signatureId, result.rows[0].id);
            req.session.signatureId = result.rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("Error:", err);
            res.render("petition", {
                title: "Petition",
                withNavBar: true,
                error: true,
            });
        });
});

app.post("/home", (req, res) => {
    console.log("Getting Home info");
    console.log("req.body", req.body);
    // Verify the empty Strings!   Empty inputs are not valids"
    if (!verifyingInputs(req.body)) {
        // Error
        res.render("home", {
            title: "Home",
            withNavBar: false,
            error: true,
            errMessage: "Empty inputs are not valids",
        });
    } else {
        registerNewUser(req.body)
            .then((currentUser) => {
                console.log("currentUser", currentUser);
                // setSessionCookie(req.session, userId, currentUser.id);
                req.session.userId = currentUser.id;
                res.redirect("/petition");
            })
            .catch((err) =>
                res.render("home", {
                    title: "Home",
                    withNavBar: false,
                    error: true,
                    errMessage: "Oops! an Error has occurred",
                })
            );
    }
});

app.post("/login", (req, res) => {
    logInVerify(req.body)
        .then((userLogIn) => {
            if (typeof userLogIn === "string") {
                res.render("logIn", {
                    title: "Login",
                    withNavBar: false,
                    error: false,
                    errorFiled: userLogIn,
                });
            } else {
                // setSessionCookie(req.session, userId, userLogIn[0].id);
                req.session.userId = currentUser.id;
                // REVIEW: what happend when I have a signature already or not!
                res.redirect("/petition");
            }
        })
        .catch((err) => {
            res.render("logIn", {
                title: "Login",
                withNavBar: false,
                error: false,
                errorFiled: "Oops! an Error has occurred",
            });
        });
});

app.listen(PORT, () => {
    console.log(
        `\t Server is lisening on port ${PORT}\n\t http://localhost:${PORT}/petition\n`
    );
});
