const PORT = 8080;

const express = require("express");
const app = express();

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

const { getAllSignature, getName, addSignature } = require("./db");

const bodyParser = require("body-parser");

const cookieSession = require("cookie-session");

app.use(
    cookieSession({
        /* This is use to generate the signature of the encription. 
        When we recived the cookie, if the signature is not the same that we generate,
        we assume that the cookie was tempted and we distructed. */
        secret: `I'm always angry.`,
        // How much the cookie is going to live.
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.get("/read-cookies", (req, res) => {
    console.log("req.session", req.session);
    res.sendStatus(200);
});

app.get("/add-to-cookie", (req, res) => {
    // Session is an object.
    req.session.cohort = "cayanne";
});

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(express.static("./public"));

app.get("/petition", (req, res) => {
    console.log("I am in petition");
    res.render("petition", { title: "Petition", error: false });
});

app.get("/petition/thanks", (req, res) => {
    console.log("I am in thenks");
    res.render("thanks", { title: "Thanks" });
});

app.get("/petition/signers", (req, res) => {
    console.log("I am in signers");
    getAllSignature()
        .then((result) => {
            console.log("nameList", result.rows);
            const listOfSigners = result.rows;
            res.render("signers", { title: "Signers", listOfSigners });
        })
        .catch((err) => console.log("Error:", err));
});

app.get("/petition/logout", (req, res) => {
    console.log("I am in Logout, we clear the cookies");
    req.session = {};
    res.render("thanks", { title: "Thanks" });
});

// POST in pettion is missing.
app.post("/petition", (req, res) => {
    console.log("Getting info of pettion");
    console.log("Body:", req.body);
    addSignature(req.body.name, req.body.surname, req.body.signature)
        .then(() => res.render("thanks", { title: "Thanks" }))
        .catch((err) => {
            console.log("Error:", err);
            res.render("petition", { title: "Petition", error: true });
        });
});

app.listen(PORT, () => {
    console.log(
        `\t Server is lisening on port ${PORT}\n\t http://localhost:${PORT}/petition\n`
    );
});
