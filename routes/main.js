module.exports = (app) => {
    const router = require('express').Router();

    /* TODO 메인 페이지 */
    app.get('/', (req, res) => {
        res.render("index.ejs");
    });

    /* TODO 회원가입 페이지 */
    router.get('/regist', (req, res) => {
        res.render("regist.ejs");
    });

    /* TODO 회원가입 및 인증 */
    router.post('/regist', (req, res) => {
        const { name, account, password, confirm } = req.body;
        if (account === "") {
            // 아이디 정규식 검사
        } else if (password !== confirm) {
            // 비밀번호 정규식 검사 및 일치 여부 확인
        } else {
            const member_filter = { account };
            const member_collection = req.app.db.collection('member');
            member_collection.findOne(member_filter, (error, result) => {
                if (result.account) {
                    // 이미 존재하는 아이디
                } else {
                    member_collection.insertOne({ name, account, password });
                }
            });
        };
    });

    /* TODO 로그인 페이지 */
    router.get('/login', (req, res) => {
        res.render("login.ejs");
    });

    /* TODO 로그인 인증 */
    router.post('/login', app.passport.authenticate('local', {
        failureRedirect: '/login'
    }), (req, res) => {
        res.redirect('/item');
    });

    /* TODO 로그아웃 */
    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/login');
    });

    return router;
};

