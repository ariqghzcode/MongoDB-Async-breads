var express = require('express');
var router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  const sortBy = req.query.sortBy || 'id';
  const sortMode = req.query.sortMode || 'asc';

  res.render('todos/table', {
    query: req.query,
    sortBy,
    sortMode,
    url: new URLSearchParams({ ...req.query, sortBy, sortMode }).toString()
  });
});

module.exports = router