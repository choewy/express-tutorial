module.exports = app => {
    const router = require('express').Router();
    router.use(require('../middleware/auth'));

    /* TODO 목록 페이지 */
    router.get('/', (req, res) => {
        const item_filter = { account: req.user.account };
        const item_collection = req.app.db.collection('item');
        item_collection.find(item_filter).toArray((error, result) => {
            if (error) return console.log(error);
            if (req.query.search === undefined) {
                res.render('item.ejs', {
                    items: result
                });
            } else {
                res.render('item.ejs', {
                    items: result.filter(item => item.title.includes(req.query.search))
                });
            }
        });
    });

    /* TODO 항목 등록 페이지 */
    router.get('/new', (req, res) => {
        res.render("item_new.ejs");
    });

    /* TODO 항목 등록 */
    router.post('/new/add', (req, res) => {
        const seq_filter = { key: "item" };
        const seq_collection = req.app.db.collection('sequence');
        const item_collection = req.app.db.collection('item');
        seq_collection.findOne(seq_filter, (error, result) => {
            if (error) return console.log(error);
            seq_collection.updateOne(seq_filter, { $inc: { seq: 1 } }, (error) => {
                if (error) return console.log(error);
                item_collection.insertOne({
                    ...req.body,
                    account: req.user.account,
                    _id: result.seq + 1
                }, (error) => {
                    if (error) return console.log(error);
                    res.redirect('/item')
                });
            });
        });
    });

    /* TODO 상세 페이지 */
    router.get('/:_id', (req, res) => {
        const { _id } = req.params;
        const item_filter = { _id: Number(_id) };
        const item_collection = req.app.db.collection('item');
        item_collection.findOne(item_filter, (error, result) => {
            if (error) return console.log(error);
            res.render('edit.ejs', { item: result });
        });
    });

    /* TODO 항목 삭제 */
    router.delete('/:_id/delete', (req, res) => {
        const { _id } = req.params;
        const item_filter = { _id: Number(_id), account: req.user.account };
        const item_collection = req.app.db.collection('item');
        item_collection.deleteOne(item_filter, (error) => {
            if (error) return console.log(error);
            res.status(200).send({ message: "성공적으로 삭제하였습니다." });
        });
    });

    /* TODO 항목 수정 */
    router.put('/:_id/edit', (req, res) => {
        const { _id } = req.params;
        const item_filter = { _id: Number(_id), account: req.user.account };
        const item_collection = req.app.db.collection('item');
        item_collection.updateOne(item_filter, { $set: { ...req.body } }, (error) => {
            if (error) return console.log(error);
            res.redirect('/item');
        });
    });

    return router;
};