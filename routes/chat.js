

module.exports = (app) => {
    const router = require('express').Router();
    router.use(require('../middleware/auth'));

    /* 채팅방 목록 페이지 */
    router.get('/', (req, res) => {
        const chat_collection = req.app.db.collection('chat');
        chat_collection.find().toArray((error, result) => {
            if (error) return console.log(error);
            if (req.query.search === undefined) {
                res.render('chat.ejs', {
                    rooms: result
                });
            } else {
                res.render('chat.ejs', {
                    rooms: result.filter(room => room.title.includes(req.query.search))
                });
            }
        })
    });

    /* 채팅방 생성 페이지 */
    router.get('/new', (req, res) => {
        res.render('chat_new.ejs');
    });

    /* 채팅방 생성 기능 */
    router.post('/new/add', (req, res) => {
        const status = { message: "" }
        const { title, description } = req.body;
        if (title === "") {
            status.message = "방 제목을 입력하세요."
            res.send(status)
        } else {
            const seq_filter = { key: "chat" };
            const seq_collection = req.app.db.collection('sequence');
            const chat_collection = req.app.db.collection('chat');
            seq_collection.findOne(seq_filter, (error, result) => {
                if (error) return console.log('seq 추가 에러', error);
                if (!result) {
                    seq_collection.insertOne({ key: "chat", seq: 1 }, (error) => {
                        if (error) return console.log(error);
                        chat_collection.insertOne({
                            _id: 1,
                            title,
                            description,
                            account: req.user.account,
                            date: new Date(),
                            messages: []
                        }, (error) => {
                            if (error) return console.log(error);
                            res.redirect(`/chat/1`);
                        })
                    })
                } else {
                    seq_collection.updateOne(seq_filter, { $inc: { seq: 1 } }, (error) => {
                        if (error) return console.log(error);
                        chat_collection.insertOne({
                            _id: result.seq + 1,
                            title,
                            description,
                            account: req.user.account,
                            date: new Date(),
                            messages: []
                        }, (error) => {
                            if (error) return console.log(error);
                            res.redirect(`/chat/${result.seq + 1}`);
                        })
                    })
                }
            })
            res.status(200).send(status)
        }
    });

    /* 채팅방 페이지 */
    router.get('/:_id', (req, res) => {
        const { _id } = req.params;
        const chat_filter = { _id: Number(_id) };
        const chat_collection = req.app.db.collection('chat');
        chat_collection.findOne(chat_filter, (error, result) => {
            if (error) return console.log(error);
            res.render('chat_room.ejs', { chat: result });
        });
    });

    /* 실시간 데이터 스트림 */
    router.get('/:_id/messages', (req, res) => {
        const { _id } = req.params;
        const chat_filter = { _id: Number(_id) };
        const chat_collection = req.app.db.collection('chat');

        // 헤더 변경
        res.writeHead(200, {
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache"
        });

        // 최초 이벤트 실행
        chat_collection.findOne(chat_filter).then((result) => {
            res.write('event: getMessages\n');
            res.write(`data: ${JSON.stringify(result.messages)}\n\n`);
        });

        // 파이프라인(필터)
        const pipeline = [
            { $match: { $expr: { "_id": Number(_id) } } }
        ];

        // 데이터 스트림 -> 데이터 변경 시 이벤트 실행 
        const changeStream = chat_collection.watch(pipeline);
        changeStream.on('change', (result) => {
            res.write('event: getMessages\n');
            res.write(`data: ${JSON.stringify(result.updateDescription.updatedFields.messages)}\n\n`);
        });
    });

    /* 채팅 추가 기능 */
    router.post('/:_id/add', (req, res) => {
        const { _id } = req.params;
        const { content } = req.body;

        if (content) {
            const chat_filter = { _id: Number(_id) };
            const chat_collection = req.app.db.collection('chat');
            chat_collection.findOne(chat_filter, (error, result) => {
                if (error) return console.log(error);
                chat_collection.updateOne(chat_filter, {
                    $set: {
                        messages: [...result.messages, {
                            _id: result.messages.length + 1,
                            content: content,
                            account: req.user.account,
                            date: new Date()
                        }]
                    }
                }, error => {
                    if (error) return console.log(error);
                    res.status(200);
                })
            });
        }
    });

    return router;
}