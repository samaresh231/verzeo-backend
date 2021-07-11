Routes:

POST /signup
    for signup using email id and password.
    payload: name, email, phone_no, password
    message: if successful "successful signup", if not "wrong email and password".

POST /login
    for login using email id and password.
    payload: email, password
    messag: if successful "logged in", if not "wrong email and password".

GET /google
    for google authentication

POST /send
    for google sending email through nodemailer
    payload: name, message, email
    message: if successful "successful", if not error message.

