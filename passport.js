
const passport = require('passport');
const googleStrategy = require('passport-google-oauth2').Strategy;

passport.serializeUser((user, done) =>{
    done(null , user);
});

passport.deserializeUser((user, done)=>{
    done(null, user)
});

const isProduction = process.env.NODE_ENV === 'testing'
const callbackURL = isProduction 
    ? 'https://irshadsulthani.shop/auth/google/callback'
    : 'http://localhost:3000/auth/google/callback';

passport.use(new googleStrategy({
    clientID:process.env.CLEINT_ID,
    clientSecret:process.env.CLEINT_SCERET,
    callbackURL:callbackURL,
    passReqToCallback:true
},
function(request, accessToken, refreshToken, profile, done){
    return done(null, profile)
}
));

