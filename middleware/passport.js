/* passport 설정 */
module.exports = app => {
    app.passport = require("passport");
    const localStrategy = require('passport-local').Strategy;

    app.passport.use(new localStrategy({
        usernameField: "account",
        passwordField: "password",
        session: true,
        passReqToCallback: false
    }, (account, password, done) => {
        const member_filter = { account }
        const member_collection = app.db.collection('member');
        member_collection.findOne(member_filter, (error, result) => {
            if (error) return done(error);
            if (!result) return done(null, false, {
                message: "존재하지 않는 계정입니다."
            });
            if (password === result.password) {
                return done(null, result);
            } else {
                return done(null, false, {
                    message: "비밀번호가 일치하지 않습니다."
                });
            };
        });
    }));

    /* 인증 시 세션 저장 */
    app.passport.serializeUser((user, done) => {
        done(null, user.account);
    });

    /* 요청 시 회원 정보 조회 */
    app.passport.deserializeUser((account, done) => {
        const member_collection = app.db.collection('member');
        member_collection.findOne({ account }, (error, user) => {
            if (error) return console.log(error);
            done(null, user);
            /* 다른 라우터에서 req.user로 조회한 정보를 꺼내어 사용 */
        });
    });

    return app.passport;
}
