  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS signatures;
  DROP TABLE IF EXISTS user_profiles;

  CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       name VARCHAR NOT NULL CHECK (name != ''),
       surname VARCHAR NOT NULL CHECK (surname != ''),
       email VARCHAR NOT NULL CHECK (email != '') UNIQUE,
       password VARCHAR NOT NULL CHECK (password != '')
   );


  CREATE TABLE signatures (
       id SERIAL PRIMARY KEY,
       user_id INT REFERENCES users(id) UNIQUE,
       signature VARCHAR NOT NULL CHECK (signature != '')
   );



  CREATE TABLE user_profiles (
       id SERIAL PRIMARY KEY,
       user_id INT REFERENCES users(id) UNIQUE,
       age INT NOT NULL,
       city VARCHAR NOT NULL CHECK (city != ''),
       homePage VARCHAR NOT NULL CHECK (homePage != '')
   );


/* Be careful to save things all in lower case email, and first letter capital  */

