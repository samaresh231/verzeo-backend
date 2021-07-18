const express = require('express')
const passport = require('passport')
const app = express()
const validationCheck = require('./validationCheck')
const mailer = require('./mailer')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

require('./authenticate');

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const userDetailsMap = new Map();    // map for storing user's name, email, phone no. and password
const hashCheckMap = new Map();  // map for storing user's temporary bcrypt hash for email verification.
const passwordResetMap = new Map(); // map for storing user's temporary bcrypt hash for email verification.

app.use(passport.initialize());

app.get('/google', passport.authenticate('google', {scope: 'profile'}));
app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/' }))

app.get('/', (req, res) => {
    res.json({
        message: 'welcome to the project'
    })
})

// signup
// user details used: name, email, phone_no, password
app.post('/signup', async (req, res) => {
    const {name, email, password, phone_no} = req.body;
    if(userDetailsMap[email] !== undefined) {
        return res.status(404).json({
            message: 'email already exist'
        })
    }
    if(validationCheck(email, phone_no)) {
        const hashedPassword = await bcrypt.hash(password, 10)

        userDetailsMap[email] = {name, password: hashedPassword, phone_no, active: false}

        const secretCode = uuidv4() + Date.now().toString();
        const activationLinkHash = await bcrypt.hash(secretCode, 10);
        hashCheckMap[email] = activationLinkHash

        const mailOptions = {
            from: `"Verzeo" <TEST_EMAIL>`, // sender address
            to: `${email}`, // list of receivers
            subject: "Activate your account", // Subject line
            text: `go to this link to activate your account http://localhost:8000/auth?code=${secretCode}&email=${email}`, // plain text body
            html: `<div>
                <p>Hi ${name}</p>
                <p>Click on this link to activate your account <a href=http://localhost:8000/auth?code=${secretCode}&email=${email}>http://localhost:8000/auth?code=${secretCode}&email=${email}</a></p>
            </div>`
        }

        const err = await mailer(mailOptions)
        if(err == null) {
            res.status(200).json({
                message: "successful sign up"
            })
        } else {
            res.status(500).json({
                message: err.message
            })
        }
    } else {
        res.status(404).json({
            message: "wrong email id or password"
        });
    }
})

// email verification route
app.get('/auth', async (req, res) => {
    const {email, code} = req.query

    if(hashCheckMap[email] !== undefined && await bcrypt.compare(code, hashCheckMap[email])) {
        userDetailsMap[email].active = true
        delete hashCheckMap[email];
        res.status(200).json({
            message: 'successful'
        })
    } else {
        res.status(404).json({
            message: 'unsuccessful'
        })
    }
})

//login
//login details used: name, email, phone_no, password
app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    userDetails = userDetailsMap[email]
    if(userDetails !== undefined && userDetails.active && await bcrypt.compare(password, userDetails.password)) {
        res.status(200).json({
            message: "logged in"
        })
    } else {
        res.status(404).json({
            message: "wrong password or wrong email"
        })
    }
})

// reset password route
app.post('/reset', async (req, res) => {
    const { email } = req.body;

    if(userDetailsMap[email] === undefined) {
        return res.status(404).json({
            message: "email id doesnot exist"
        })
    }

    const name = userDetailsMap[email]
    const secretCode = uuidv4() + Date.now().toString();
    const passwordResetHash = await bcrypt.hash(secretCode, 10);
    let date = new Date();
    date.setMinutes(date.getMinutes() + 10);
    passwordResetMap[email] = {
        passwordResetHash, 
        expiryDate: date, 
        clicked: false
    }

    const mailOptions = {
        from: `"Verzeo" <testing.samaresh@gmail.com>`, // sender address
        to: `${email}`, // list of receivers
        subject: "Reset your password", // Subject line
        text: `go to this link to activate your account http://localhost:8000/resetpassword?code=${secretCode}&email=${email}`, // plain text body
        html: `<div>
            <p>Hi ${name}</p>
            <p>Click on this link to reset your password <a href=http://localhost:8000/resetpassword?code=${secretCode}&email=${email}>http://localhost:8000/resetpassword?code=${secretCode}&email=${email}</a></p>
        </div>`
    }

    const err = await mailer(mailOptions)
    if(err == null) {
        res.status(200).json({
            message: "successful"
        })
    } else {
        res.status(500).json({
            message: err.message
        })
    }
})

app.get('/resetpassword', async (req, res) => {
    const {email, code} = req.query;
    const hashDetails = passwordResetMap[email];
    if(hashDetails !== undefined && await bcrypt.compare(code, hashDetails.passwordResetHash)) {
        if(hashDetails.expiryDate < Date.now()) {
            passwordResetMap[email].clicked = true;
            return res.status(504).json({
                message: 'session expired'
            })
        }
        res.status(200).json({
            message: 'successful',
            email
        })
    } else {
        res.status(404).json({
            message: 'unsuccessful'
        })
    }
})

app.post('/resetpassword', async (req, res) => {
    const {email, newPassword, confirmPassword} = req.body;
    const passwordHashDetails = passwordResetMap[email];
    if(passwordHashDetails === undefined && passwordHashDetails.clicked) {
        return res.status(404).json({
            message: "unsuccessful"
        })
    }
    if(newPassword === confirmPassword) {
        if(Date.now() > passwordHashDetails.expiryDate) {
            return res.status(504).json({
                message: 'session exipred'
            })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        userDetailsMap[email].password = hashedPassword
        res.status(200).json({
            message: 'password changed successfully'
        })
    } else {
        console.log(passwordHashDetails.clicked)
        res.status(404).json({
            message: "password doesn't match"
        })
    }
})

app.listen(8000, () => {
    console.log("listening to port 8000")
})
