const spicedPg = require("spiced-pg");

let USER_NAME, USER_PASSWORD;
console.log("process.env.NODE_ENV", process.env.NODE_ENV);

if (process.env.DATABASE_URL) {
    // Bc we are deploding we need to define where to get the value.
    USER_NAME = require("./secrets").USER_NAME;
    USER_PASSWORD = require("./secrets").USER_PASSWORD;
}

const database = "petition";

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${USER_NAME}:${USER_PASSWORD}@localhost:5432/${database}`
);

/* ---------------------------------------------------------------
                    signatures TABLE
----------------------------------------------------------------*/

module.exports.getAllSignature = () => {
    return db.query(`SELECT * FROM signatures`);
};

// module.exports.getName = () => {
//     return db.query(`SELECT first, last FROM signatures`);
// };

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

module.exports.addSignature = (user_id, signature) => {
    // console.log(
    //     `[db]Name: ${name} [db]surnmae: ${surname} signature: ${signature}`
    // );
    const q = `INSERT INTO signatures (user_id, signature)
    VALUES ($1, $2 ) RETURNING id`;

    // RETURNING id
    const param = [user_id, signature];
    return db.query(q, param);
};

/* ---------------------------------------------------------------
                    user TABLE
----------------------------------------------------------------*/

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

/* ---------------------------------------------------------------
                    JOIN TABLES
----------------------------------------------------------------*/

// we should do a LEFT JOIN to have all the users and if they have sign  good, if not not.
module.exports.getUserByEmail = (email) => {
    return db.query(
        `SELECT user.*, signature.id AS "signatureId"
FROM users 
JOIN signatures
ON signatures.user_id=user.id
WHERE email = $1`,
        [email]
    );
};

module.exports.getSigners = () => {
    return db.query(
        `SELECT user.*, signature.id AS "signatureId", user_profiles.id AS "profileId"
FROM users 
LEFT JOIN signatures
ON signatures.user_id=user.id  
LEFT JOIN user_profiles
ON user_profile.user_id=user.id`
    );
};
