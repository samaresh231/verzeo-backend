const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser((user, done) => {
    done(null, user);
})

passport.use(new GoogleStrategy({
    clientID: '722269643277-okt8vov4tgbr5o1n3nl0hgmlsdhhil31.apps.googleusercontent.com',
    clientSecret: '9GT4CupO8iGAn0GoJK_-2snD',
    callbackURL: "http://localhost:3000/google/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile);
        cb(null, profile);
    }
));