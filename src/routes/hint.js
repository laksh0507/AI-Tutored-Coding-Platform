const express = require('express');
const hintrouter = express.Router();
const usermiddleware = require('../middleware/usermiddleware');
const ratelimit = require('../middleware/ratelimit');
const { gethint, aihint, getfullsolution } = require('../controllers/userhint');

hintrouter.get('/:id', usermiddleware, ratelimit, gethint);
hintrouter.post('/ai/:id', usermiddleware, ratelimit, aihint);
hintrouter.get('/solution/:id', usermiddleware, ratelimit, getfullsolution);

module.exports = hintrouter;
