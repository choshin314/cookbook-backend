const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { search, sort } = req.query;
    //if search, get all recipes where title or tags include search query
    //if sort, sort by sort DESC
    //default is return all recipes sorted by likes

    res.send(`Retrieving`)
})

module.exports = router;