module.exports = app => {
    const router = require('express').Router();
    router.use(require('../middleware/auth'));
    const fileSystem = require('fs');

    /* 파일 전송 설정 */
    const multer = require('multer');
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './public/images');
        },
        filename: (req, file, callback) => {
            callback(null, file.originalname);
        }
    });

    const upload = multer({
        storage,
        fileFilter: (req, file, callback) => {
            const ext = require('path').extname(file.originalname);
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
                return callback({ message: 'PNG, JPG, JPEG 형식만 업로드하세요.' }, false);
            }
            callback(null, true);
        },
        // limits: 파일 용량
    });

    /* 이미지 업로드 페이지 */
    router.get('/', (req, res) => {
        const { filename } = req.query;
        if (filename) {
            const filepath = `${__dirname.split('\\').slice(0, -1).join('/')}/public/images/${filename}`
            res.sendFile(filepath)
        } else {
            fileSystem.readdir('./public/images/', (error, files) => {
                if (error) return console.log(error);
                res.render('upload.ejs', { files });
            });
        }
    });

    /* 이미지 업로드 */
    router.post('/', upload.single('file'), (req, res) => {
        res.status(200).send({ message: "성공적으로 업로드하였습니다." });
    });

    return router;
};