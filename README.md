# Petition

## Running the project

1. Clone the project.
2. Run `npm install`
3. Create Data Base call `petition`
4. Create tables running file `setup.sql`
5. Create a `secret.json` file.

```json
{
    "USER_NAME": "",
    "USER_PASSWORD": "",
    "COOKIE_SECRET": ""
}
```

Now run the server:

```bash
node server
```

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result.

## Overview

The purpose of this project was to create an online petition where supporters can register for the petition, log in, update their profile information, provide their signature for the cause, redo their signature if needed, and view a list of who else signed thus far (sorted by location).

This particular petition advocates for more latin product in german supermarkets.

## Features

-   Registration and login.
-   Hashed passwords using bcrypt.
-   User can update their profile at any time saving the latest information in the database and rendering the updated information immediately.
-   Users are able to redo their signatures.
-   Users are able to sort list of supporters by city as well as access their provided url websites, if available, by clicking on any name.
-   Users are able to change their password.
-   Users are able to delete their accounts.

## Technologies
[![My Skills](https://skillicons.dev/icons?i=js)](https://skillicons.dev) Javascript

[![My Skills](https://skillicons.dev/icons?i=css)](https://skillicons.dev) CSS

<a href="https://handlebarsjs.com/" target="_blank"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/handlebars/handlebars-original.svg" alt="handlebars" width="40" height="40"/> </a> Handlebars

## Preview

### Registration

![Registration](/public/readme/petition-registration.gif)

![Adding Info](/public/readme/petition-moreInfo.gif)

### Signing the Petition

![Signing](/public/readme/petition-signature.gif)

### Viewing List of Supporters (Total Count & by Location)

![List of Signers](/public/readme/petitio-list-of-signers.gif)

### Updating User Profile
![Updating user Profile](/public/readme/petition-updating-profile-info.gif)

### Delete Signature
![Delete Signature](/public/readme/petition-deleting-sgnature.gif)

### Resigning Petition
![Delete Signature](/public/readme/petition-adding-new-signature.gif)

### Logout

![LogOut](/public/readme/petition-logout.gif)

### Delete Account
![DeleteAccount](/public/readme/petition-delete-account.gif)


### Login

![LogIn](/public/readme/petition-login.gif)
