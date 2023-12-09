const express = require('express');
const router = express.Router();
const errorController = require('./controllers/errorController');

router.use((req, res) => {
    if (req.method === 'GET') {
        errorController.get404Page(req, res);
    } else {
        res.status(404).send("Could not find anything for \"" + req.path + "\"");
    }
});


module.exports = router;