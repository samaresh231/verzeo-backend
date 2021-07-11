const express = require('express');
const passport = require('passport');
const nodemailer = require('nodemailer');
const app = express()

require('./authenticate');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const mp = new Map();    // map for storing user's name, email, phone no. and password

app.use(passport.initialize());

app.get('/google', passport.authenticate('google', {scope: 'profile'}));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/' }))

// validation for phone_no and email id
function validationCheck(email, phone_no) {
    const email_regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(phone_no.toString().length != 10 || isNaN(phone_no)) {
        return false
    }
    if(!email_regex.test(email)) {
        return false;
    }
    return true;
}

app.get('/', (req, res) => {
    res.json({
        message: 'successful'
    })
})

// signup
// user details used: name, email, phone_no, password
app.post('/signup', (req, res) => {
    const {name, email, password, phone_no} = req.body;
    if(mp[email] === undefined && validationCheck(email, phone_no)) {
        mp[email] = {name, password, phone_no}
        res.status(200).json({
            message: "successful sign up"
        })
    } else {
        res.status(404).json({
            message: "wrong email id or password"
        });
    }
})

//login
//login details used: name, email, phone_no, password
app.post('/login', (req, res) => {
    const {email, password} = req.body;
    userDetails = mp[email]
    if(userDetails !== undefined && userDetails.password == password) {
        res.status(200).json({
            message: "logged in"
        })
    } else {
        res.status(404).json({
            message: "wrong password or wrong email"
        })
    }
})

app.post('/send', async (req, res) => {
    try {
        const {name, message} = req.body;
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: TESTING_EMAIL,
                pass: TESTING_PASSWORD
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"Verzeo" <TESTING_EMAIL>`, // sender address
            to: "SENDER'S EMAIL", // list of receivers
            subject: "Node mailer example", // Subject line
            text: "Hello world?", // plain text body
            html: `<h1>Hello ${name}</h1>
            <p> ${message} </p>`, // html body
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        res.status(200).json({
            message: 'successful'
        })
    } catch(err) {
        res.status(404).json({
            message: err.message
        })
    }
})

app.listen(3000, () => {
    console.log("listening to port 3000")
})