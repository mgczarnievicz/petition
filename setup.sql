  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS signatures;


  CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       name VARCHAR NOT NULL CHECK (name != ''),
       surname VARCHAR NOT NULL CHECK (surname != ''),
       email VARCHAR NOT NULL CHECK (email != '') UNIQUE,
       password VARCHAR NOT NULL CHECK (password != '')
   );


  CREATE TABLE signatures (
       id SERIAL PRIMARY KEY,
       user_id INT REFERENCES user(id) UNIQUE,
       signature VARCHAR NOT NULL CHECK (signature != '')
   );


/* Be careful to save things all in lower case email, and first letter capital  */

  CREATE TABLE user_profiles (
       id SERIAL PRIMARY KEY,
       user_id INT REFERENCES user(id) UNIQUE,
       age INT NOT NULL CHECK (age != ''),
       city VARCHAR NOT NULL CHECK (city != ''),
       homePage VARCHAR NOT NULL CHECK (homePage != '')
   );

