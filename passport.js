
const passport = require('passport');
const googleStrategy = require('passport-google-oauth2').Strategy;

passport.serializeUser((user, done) =>{
    done(null , user);
});

passport.deserializeUser((user, done)=>{
    done(null, user)
});

passport.use(new googleStrategy({
    clientID:process.env.CLEINT_ID,
    clientSecret:process.env.CLEINT_SCERET,
    callbackURL:'http://localhost:3000/auth/google/callback',
    passReqToCallback:true
},
function(request, accessToken, refreshToken, profile, done){
    return done(null, profile)
}
));

