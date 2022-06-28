const PORT = 8080;

const express = require("express");
const app = express();
exports.app = app;

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// Bc we are deploding we need to define where to get the value.
const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets").COOKIE_SECRET;

const {
    addSignature,
    getSigners,
    getSignersByCity,
    getUserInformationById,
    updateUser,
    updateProfile,
    getSignatureBySignatureId,
    deleteSignatureBySignatureId,
} = require("./db");

const {
    getSignatureByIdAndTotalSigners,
    registerNewUser,
    logInVerify,
    verifyingEmptyInputs,
    addMoreInfo,
    setNewPassword,
    deleteUser,
    validateProfileInputs,
    searchProfile,
    cleanEmptySpaces,
} = require("./process");

const bodyParser = require("body-parser");

const cookieSession = require("cookie-session");

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

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

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
                req.url == "/" ||
                req.url == "/home" ||
                req.url == "/login" ||
                req.url == "/thanks" ||
                req.url.includes("/signers")
            ) {
                res.redirect("/petition");
            } else if (req.url == "/configuration/signature") {
                res.redirect("/configuration");
            } else {
                next();
            }
        } else if (req.session.signatureId) {
            if (
                req.url == "/" ||
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

/*------------------------------------------------------------------------- 
                                GET METHOD
-------------------------------------------------------------------------*/
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
        errorMessage: false,
    });
});

app.get("/login", (req, res) => {
    res.render("logIn", {
        title: "Login",
        withNavBar: false,
        haveSign: false,
        errorMessage: false,
    });
});

app.get("/profile", (req, res) => {
    // look in db if thez have a row.
    searchProfile(req.session.userId)
        .then((result) => {
            console.log("Result searchProfile", result);
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("Error in profile", err);
            res.render("moreInfo", {
                title: "Profile",
                withNavBar: true,
                haveSign: false,
                errorMessage: false,
            });
        });
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        title: "Petition",
        withNavBar: true,
        haveSign: false,
        errorMessage: false,
    });
});

app.get("/thanks", (req, res) => {
    console.log("req.session.signatureId", req.session.signatureId);
    getSignatureByIdAndTotalSigners(req.session.signatureId)
        .then((result) => {
            res.render("thanks", {
                title: "Thanks",
                withNavBar: true,
                haveSign: true,
                user: result[0],
                totalSigners: result[1].count,
            });
        })
        .catch(() =>
            res.render("petition", {
                title: "petition",
                withNavBar: true,
                haveSign: req.session.signatureId,
                errorMessage: "Oops! an Error has occurred.",
            })
        );
});

app.get("/signers", (req, res) => {
    getSigners()
        .then((result) => {
            res.render("signers", {
                title: "Signers",
                withNavBar: true,
                haveSign: true,
                listOfSigners: result.rows,
            });
        })
        // REVIEW: VER QUE PASA EN CASO DE ERROR EN ESE CASO!
        .catch((err) => console.log("Error:", err));
});

app.get("/signers/:city", (req, res) => {
    console.log("req.params", req.params);
    getSignersByCity(req.params.city)
        .then((result) => {
            res.render("signers", {
                title: "Signers",
                withNavBar: true,
                haveSign: true,
                nameCity: req.params.city,
                listOfSigners: result.rows,
            });
        })
        // REVIEW: VER QUE PASA EN CASO DE ERROR EN ESE CASO!
        .catch((err) => console.log("Error:", err));
});

app.get("/configuration", (req, res) => {
    res.render("configuration", {
        title: "Configuration",
        withNavBar: true,
        haveSign: req.session.signatureId,
    });
});

app.get("/configuration/profile", (req, res) => {
    getUserInformationById(req.session.userId)
        .then((result) => {
            res.render("configProfile", {
                title: "Configuration",
                withNavBar: true,
                haveSign: req.session.signatureId,
                errorMessage: false,
                user: result.rows[0],
            });
        })
        // REVIEW: VER QUE PASA EN CASO DE ERROR EN ESE CASO!
        .catch((err) => console.log("Error getUserInformationById:", err));
});

app.get("/configuration/signature", (req, res) => {
    getSignatureBySignatureId(req.session.signatureId)
        .then((result) => {
            console.log("result.rows", result.rows);
            res.render("signature", {
                title: "Configuration",
                haveSign: req.session.signatureId,
                withNavBar: true,
                signature: result.rows[0].signature,
            });
        })
        // REVIEW: VER QUE PASA EN CASO DE ERROR EN ESE CASO!
        .catch((err) => console.log("Error in config/signature", err));
});

app.get("/configuration/newpassword", (req, res) => {
    res.render("newPassword", {
        title: "Configuracion",
        haveSign: req.session.signatureId,
        withNavBar: true,
    });
});

app.get("/configuration/deleteAccount", (req, res) => {
    res.render("deleteAccount", {
        title: "Configuracion",
        haveSign: req.session.signatureId,
        withNavBar: true,
    });
});

/*------------------------------------------------------------------------- 
                            POST METHOD
-------------------------------------------------------------------------*/

app.post("/home", (req, res) => {
    console.log("Getting Home info");
    console.log("req.body", req.body);
    // Verify the empty Strings!   Empty inputs are not valids"
    if (verifyingEmptyInputs(req.body)) {
        res.render("home", {
            title: "Home",
            withNavBar: false,
            haveSign: false,
            errorMessage: "Empty inputs are not valids.",
        });
    } else {
        const userInfo = cleanEmptySpaces(req.body);
        console.log("userInfo clean", userInfo);
        registerNewUser(userInfo)
            .then((currentUser) => {
                console.log("currentUser", currentUser);

                if (typeof currentUser === "string") {
                    res.render("home", {
                        title: "Home",
                        withNavBar: false,
                        haveSign: false,
                        errorMessage: currentUser,
                    });
                } else {
                    req.session.userId = currentUser.id;
                    res.redirect("/profile");
                }
            })
            .catch(() => {
                res.render("home", {
                    title: "Home",
                    withNavBar: false,
                    haveSign: false,
                    errorMessage: "Oops! an Error has occurred.",
                });
            });
    }
});

app.post("/login", (req, res) => {
    logInVerify(cleanEmptySpaces(req.body))
        .then((userLogIn) => {
            console.log("userLogIn:", userLogIn);
            if (typeof userLogIn === "string") {
                res.render("logIn", {
                    title: "Login",
                    withNavBar: false,
                    haveSign: false,
                    errorMessage: userLogIn,
                });
            } else {
                console.log("userLogIn not a string");
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
                errorMessage: "Oops! an Error has occurred.",
            });
        });
});

app.post("/petition", (req, res) => {
    console.log("Getting info of pettion");
    // REVIEW: SEE VERIFY THAT SIGNATURE IS NOT EMPTY!
    if (req.body.signature == "") {
        res.render("petition", {
            title: "Petition",
            withNavBar: true,
            haveSign: req.session.signatureId,
            errorMessage: "Signature is missing.",
        });
    } else {
        addSignature(req.session.userId, req.body.signature)
            .then((result) => {
                req.session.signatureId = result.rows[0].id;
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("Error:", err);
                res.render("petition", {
                    title: "Petition",
                    withNavBar: true,
                    haveSign: req.session.signatureId,
                    errorMessage: "Oops! an Error has occurred.",
                });
            });
    }
});

// REVIEW add a row if there is no inputs.
app.post("/profile", (req, res) => {
    console.log("req.body", req.body);
    addMoreInfo(req.body, req.session.userId)
        .then(() => res.redirect("/petition"))
        .catch((err) => {
            console.log("Error Profile:", err);
            res.render("moreInfo", {
                title: "Profile",
                withNavBar: true,
                haveSign: req.session.signatureId,
                errorMessage: "Oops! an Error has occurred.",
            });
        });
});

app.post("/configuration/profile", (req, res) => {
    console.log("req.body in config User", req.body);
    // First verify Password if password correct then all good.
    let uesrInfo = (({ name, surname, email }) => ({ name, surname, email }))(
        req.body
    );
    let profileObj = (({ age, city, profilePage }) => ({
        age,
        city,
        profilePage,
    }))(req.body);

    // const uesrInfo = req.body;
    uesrInfo = cleanEmptySpaces(uesrInfo);
    profileObj = cleanEmptySpaces(profileObj);

    console.log("New uesrInfo", uesrInfo);
    console.log("New profileObj", profileObj);

    if (verifyingEmptyInputs(uesrInfo)) {
        res.render("configProfile", {
            title: "Configuration",
            withNavBar: true,
            haveSign: req.session.signatureId,
            errorMessage: "Name, Surname and Email must be complete.",
            user: req.body,
        });
    } else {
        const profileObjCl = validateProfileInputs(profileObj);

        //  updateUser (name, surname, email, password, userId)
        // updateProfile = (user_id, age, city, profilePage)
        Promise.all([
            updateUser(
                uesrInfo.name,
                uesrInfo.surname,
                uesrInfo.email,
                req.session.userId
            ),
            updateProfile(
                req.session.userId,
                profileObjCl.age,
                profileObjCl.city,
                profileObjCl.profilePage
            ),
        ])
            .then(() => res.redirect("/configuration"))
            .catch((err) => {
                console.log("Erro Updating user", err);
                res.render("configProfile", {
                    title: "Configuration",
                    withNavBar: true,
                    haveSign: req.session.signatureId,
                    errorMessage: "Oops! an Error has occurred.",
                });
            });

        //If not, not save changes.
        // addMoreInfo(req.body, req.session.userId)
        //     .then(() => res.redirect("/petition"))
        //     .catch((err) => console.log("Error Profile:", err));
    }
});

app.post("/configuration/signature", (req, res) => {
    deleteSignatureBySignatureId(req.session.signatureId)
        .then(() => {
            req.session.signatureId = null;
            res.redirect("/configuration");
        })
        .catch(() =>
            res.render("signature", {
                title: "Configuration",
                withNavBar: true,
                haveSign: req.session.signatureId,
                errorMessage: "Oops! an Error has occurred.",
            })
        );
});

app.post("/configuration/newpassword", (req, res) => {
    console.log("req.body:", req.body);
    // get old password.
    setNewPassword(req.session.userId, req.body.old, req.body.new)
        .catch(() =>
            res.render("newPassword", {
                title: "Configuration",
                withNavBar: true,
                haveSign: req.session.signatureId,
                errorMessage: "Oops! an Error has occurred.",
            })
        )
        .then(() => {
            res.redirect("/configuration");
        });
});

app.post("/configuration/deleteAccount", (req, res) => {
    // Dete account.
    deleteUser(req.session.userId, req.body.password)
        .then((result) => {
            if (typeof result === "string") {
                res.render("deleteAccount", {
                    title: "Configuration",
                    withNavBar: true,
                    haveSign: req.session.signatureId,
                    errorMessage: result,
                });
            } else {
                req.session = null;
                res.redirect("/home");
            }
        })
        .catch(() =>
            res.render("deleteAccount", {
                title: "Configuration",
                withNavBar: true,
                haveSign: req.session.signatureId,
                errorMessage: "Oops! an Error has occurred.",
            })
        );
});

if (require.main === module) {
    app.listen(process.env.PORT || PORT, () => {
        console.log(
            `\t Server is lisening on port ${PORT}\n\t http://localhost:${PORT}/home\n`
        );
    });
}
