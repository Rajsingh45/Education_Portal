const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const stud = require('./models/stud');

passport.use(new LocalStrategy(
    async function(username, password, done) {
        try {
            const userRecord = await stud.findOne({ user: username, password: password });
            if (!userRecord) {
                return done(null, false, { message: 'Invalid credentials' });
            }

            if (userRecord.role === 'admin') {
                return done(null, { role: 'admin', user: userRecord });
            } else {
                return done(null, { role: 'student', user: userRecord });
            }
        } catch (err) {
            return done(err);
        }
    }
));


module.exports=passport;