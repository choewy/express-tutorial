const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');

/* 시스템 변수 */
require('dotenv').config();
const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY;
const SERVER_PORT = process.env.SERVER_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;

/* db 연결 */
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}`, (error, client) => {
    if (error) return console.log(error);
    app.db = client.db('todoapp');
    app.listen(SERVER_PORT, () => {
        console.log(`Node Todo App Server Running on port ${SERVER_PORT}`);
    });
});

/* 서버 및 세션 미들웨어 설정 */
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(session({
    secret: SESSION_SECRET_KEY,
    resave: true,
    saveUninitialized: false
}));

passport = require('./middleware/passport')(app);
app.use(passport.initialize());
app.use(passport.session());

/* TODO 메인 페이지 */
app.get('/', (req, res) => {
    res.render("index.ejs");
});

/* 라우터 설정 */
app.use('/', require('./routes/main')(app));
app.use('/item', require('./routes/item')(app));
app.use('/chat', require('./routes/chat')(app));
app.use('/upload', require('./routes/upload')(app));