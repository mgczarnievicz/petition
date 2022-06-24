const spicedPg = require("spiced-pg");

let USER_NAME, USER_PASSWORD;
console.log("process.env.NODE_ENV", process.env.NODE_ENV);

if (!process.env.DATABASE_URL) {
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

module.exports.getSignatureBySignatureId = (rowNum) => {
    return db.query(
        `SELECT * FROM signatures
                        WHERE id = $1`,
        [rowNum]
    );
};

module.exports.countSignatures = () => {
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
                    users TABLE
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

module.exports.updateUser = (name, surname, email, password, userId) => {
    const q = `UPDATE users (name, surname, email, password)
    SET name = $1, surname = $2, email = $3, password =$4  
    WHERE id = $5`;

    // RETURNING all
    const param = [name, surname, email, password, userId];
    return db.query(q, param);
};

/* ---------------------------------------------------------------
                    user Profiles TABLE
----------------------------------------------------------------*/
module.exports.addUserInfo = (user_id, age, city, profilePage) => {
    const q = `INSERT INTO user_profiles (user_id, age, city, profilePage)
    VALUES ($1, $2, $3, $4 ) RETURNING id`;

    const param = [user_id, age, city, profilePage];
    return db.query(q, param);
};

module.exports.updateProfile = (user_id, age, city, profilePage) => {
    const q = ` INSERT INTO user_profiles (user_id, age, city, profilePage)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (users_id)
    DO UPDATE SET age=$2, city=$3,profilePage=$4`;
    const param = [user_id, age, city, profilePage];

    return db.query(q, param);
};

/* ---------------------------------------------------------------
                    JOIN TABLES
----------------------------------------------------------------*/

// we should do a LEFT JOIN to have all the users and if they have sign  good, if not not.
module.exports.getUserByEmail = (email) => {
    return db.query(
        `SELECT users.*, signatures.id AS "signatureId"
FROM users 
LEFT JOIN signatures
ON signatures.user_id=users.id
WHERE email = $1`,
        [email]
    );
};

// When we want all signers!!!!
module.exports.getSigners = () => {
    return db.query(
        `SELECT users.name, users.surname, signatures.id AS "signatureId", user_profiles.age, user_profiles.city, user_profiles.profilePage
FROM users 
RIGHT JOIN signatures
ON signatures.user_id=users.id  
LEFT JOIN user_profiles
ON user_profiles.user_id=users.id`
    );
};

module.exports.getSignersByCity = (searchCity) => {
    return db.query(
        `SELECT users.name, users.surname, signatures.id AS "signatureId", user_profiles.age, user_profiles.profilePage
FROM users 
RIGHT JOIN signatures
ON signatures.user_id=users.id  
JOIN user_profiles
ON user_profiles.user_id=users.id
WHERE user_profiles.city = $1`,
        [searchCity]
    );
};

// REVIEW!!! is not working we are not using it!
module.exports.getUserInformationById = (rowNum) => {
    return db.query(
        `SELECT users.name, users.surname, users.email, user_profiles.age, user_profiles.city, user_profiles.profilePage
FROM users 
LEFT JOIN user_profiles
ON user_profiles.user_id=users.id
WHERE users.id = $1`,
        [rowNum]
    );
};
