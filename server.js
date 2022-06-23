const PORT = 8080;

const express = require("express");
const app = express();

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// Bc we are deploding we need to define where to get the value.
const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets").COOKIE_SECRET;

const { addSignature, getSigners } = require("./db");
const {
    getSignerByIdAndTotalSigners,
    registerNewUser,
    logInVerify,
    verifyingInputs,
    addMoreInfo,
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
        secret: COOKIE_SECRET,
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
    if (!req.session.userId) {
        if (req.url != "/home" && req.url != "/login") {
            res.redirect("/home");
        } else {
            next();
        }
    } else if (req.session.userId) {
        if (!req.session.signatureId) {
            if (
                req.url == "/home" ||
                req.url == "/login" ||
                req.url == "/thanks" ||
                req.url.includes("/signers")
            ) {
                res.redirect("/petition");
            } else {
                next();
            }
        } else if (req.session.signatureId) {
            if (
                req.url == "/home" ||
                req.url == "/login" ||
                req.url == "/petition" ||
                req.url == "/profile"
            ) {
                res.redirect("/thanks");
            } else {
                next();
            }
        }
    }
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        title: "Petition",
        withNavBar: true,
        haveSign: false,
        error: false,
    });
});

app.get("/thanks", (req, res) => {
    getSignerByIdAndTotalSigners(req.session.signatureId).then((result) => {
        res.render("thanks", {
            title: "Thanks",
            withNavBar: true,
            haveSign: true,
            user: result[0],
            totalSigners: result[1].count,
        });
    });
});

app.get("/signers", (req, res) => {
    getSigners()
        .then((result) => {
            const listOfSigners = result.rows;
            res.render("signers", {
                title: "Signers",
                withNavBar: true,
                haveSign: true,
                listOfSigners,
            });
        })
        .catch((err) => console.log("Error:", err));
});

app.get("/signers/:city", (req, res) => {
    // REVIEW Change here
    getSigners()
        .then((result) => {
            const listOfSigners = result.rows;
            res.render("signers", {
                title: "Signers",
                withNavBar: true,
                haveSign: true,
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
        haveSign: false,
        error: false,
        errMessage: "",
    });
});

app.get("/login", (req, res) => {
    res.render("logIn", {
        title: "Login",
        withNavBar: false,
        haveSign: false,
        error: false,
    });
});

app.get("/configuration", (req, res) => {
    // This can not be done, any numbre is singatureId exist is truthy.
    const haveSign = req.session.signatureId ? true : false;
    res.render("configuration", {
        title: "Configuration",
        withNavBar: true,
        haveSign: haveSign,
    });
});

app.get("/configuration/profile", (req, res) => {
    res.render("configProfile", {
        title: "Configuration",
        withNavBar: true,
        haveSign: req.session.signatureId,
        error: false,
    });
});

app.get("/configuration/signature", (req, res) => {
    res.render("signature", {
        title: "Configuration",
        haveSign: req.session.signatureId,
        withNavBar: true,
    });
});

app.get("/configuration/newpassword", (req, res) => {
    res.render("configuration", {
        title: "Configuracion",
        haveSign: req.session.signatureId,
        withNavBar: true,
    });
});

app.get("/profile", (req, res) => {
    res.render("moreInfo", {
        title: "Profile",
        withNavBar: true,
        haveSign: false,
        error: false,
    });
});

// POST in pettion is missing.
app.post("/petition", (req, res) => {
    console.log("Getting info of pettion");
    addSignature(req.session.userId, req.body.signature)
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
                haveSign: req.session.signatureId,
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
            haveSign: false,
            error: true,
            errMessage: "Empty inputs are not valids",
        });
    } else {
        registerNewUser(req.body)
            .then((currentUser) => {
                console.log("currentUser", currentUser);
                // setSessionCookie(req.session, userId, currentUser.id);
                req.session.userId = currentUser.id;
                res.redirect("/profile");
            })
            .catch((err) =>
                res.render("home", {
                    title: "Home",
                    withNavBar: false,
                    haveSign: false,
                    error: true,
                    errMessage: "Oops! an Error has occurred",
                })
            );
    }
});

app.post("/login", (req, res) => {
    console.log("Inmedianto req.body", req.body);
    logInVerify(req.body)
        .then((userLogIn) => {
            console.log("userLogIn", userLogIn);
            if (typeof userLogIn === "string") {
                res.render("logIn", {
                    title: "Login",
                    withNavBar: false,
                    haveSign: false,
                    error: false,
                    errorFiled: userLogIn,
                });
            } else {
                console.log("userLogIn not a string");
                // setSessionCookie(req.session, userId, userLogIn[0].id);
                req.session.userId = userLogIn.id;

                if (userLogIn.signatureId) {
                    req.session.signatureId = userLogIn.signatureId;
                    res.redirect("/thanks");
                } else {
                    res.redirect("/petition");
                }
            }
        })
        .catch((err) => {
            console.log("Error in log In", err);
            res.render("logIn", {
                title: "Login",
                withNavBar: false,
                haveSign: false,
                error: false,
                errorFiled: "Oops! an Error has occurred",
            });
        });
});

app.post("/petition", (req, res) => {
    console.log("Getting info of pettion");
    addSignature(req.session.userId, req.body.signature)
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
                haveSign: req.session.signatureId,
                error: true,
            });
        });
});

app.post("/profile", (req, res) => {
    console.log("req.body", req.body);
    addMoreInfo(req.body, req.session.userId)
        .then(() =>
            res.render("moreInfo", {
                title: "Profile",
                withNavBar: true,
                haveSign: false,
                error: false,
            })
        )
        .catch((err) => console.log("Error Profile:", err));
});

app.listen(process.env.PORT || PORT, () => {
    console.log(
        `\t Server is lisening on port ${PORT}\n\t http://localhost:${PORT}/home\n`
    );
});
