const spicedPg = require("spiced-pg");

const secrets = require("./secrets");
const { USER_NAME, USER_PASSWORD } = secrets;

const database = "petition";

const db = spicedPg(
    `postgres:${USER_NAME}:${USER_PASSWORD}@localhost:5432/${database}`
);

/* ---------------------------------------------------------------
                    signatures TABLE
----------------------------------------------------------------*/

module.exports.getAllSignature = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.getName = () => {
    return db.query(`SELECT first, last FROM signatures`);
};

module.exports.getRowById = (rowNum) => {
    return db.query(
        `SELECT * FROM signatures
                        WHERE id = $1`,
        [rowNum]
    );
};

module.exports.countRowsInTable = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.addSignature = (name, surname, signature) => {
    // console.log(
    //     `[db]Name: ${name} [db]surnmae: ${surname} signature: ${signature}`
    // );
    const q = `INSERT INTO signatures (first, last, signature)
    VALUES ($1, $2, $3 ) RETURNING id, first, last, signature`;

    // RETURNING id
    const param = [name, surname, signature];
    return db.query(q, param);
};

/* ---------------------------------------------------------------
                    user TABLE
----------------------------------------------------------------*/
module.exports.getUserByEmail = (email) => {
    return db.query(
        `SELECT * FROM users
                        WHERE email = $1`,
        [email]
    );
};

module.exports.getCompleteName = () => {
    return db.query(`SELECT name, surname FROM user`);
};

module.exports.registerUser = (name, surname, email, password) => {
    const q = `INSERT INTO users (name, surname, email, password)
    VALUES ($1, $2, $3, $4 ) RETURNING id, name, surname`;

    // RETURNING all
    const param = [name, surname, email, password];
    return db.query(q, param);
};
