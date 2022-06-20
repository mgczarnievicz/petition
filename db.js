const spicedPg = require("spiced-pg");

const secrets = require("./secrets");
const { USER_NAME, USER_PASSWORD } = secrets;

const database = "petition";

const db = spicedPg(
    `postgres:${USER_NAME}:${USER_PASSWORD}@localhost:5432/${database}`
);

console.log(`[db] conntecting to ${database}`);

module.exports.getAllSignature = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.getName = () => {
    return db.query(`SELECT first, last FROM signatures`);
};

module.exports.addSignature = (name, surname, signature) => {
    console.log(
        `[db]Name: ${name} [db]surnmae: ${surname} signature: ${signature}`
    );
    const q = `INSERT INTO signatures (first, last, signature)
    VALUES ($1, $2, $3 )`;

    const param = [name, surname, signature];
    return db.query(q, param);
};
