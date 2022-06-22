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
      --  user_id INT REFERENCES user(id),
       user_id INT NOT NULL,
       first VARCHAR NOT NULL CHECK (first != ''),
       last VARCHAR NOT NULL CHECK (last != ''),
       signature VARCHAR NOT NULL CHECK (signature != '')
   );



