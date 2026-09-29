var express = require('express');
var router = express.Router();
const moment = require('moment')
const path = require('path');
const { isLoggedIn } = require('../../helpers/util');
const { title } = require('process');
const { ObjectId } = require('mongodb');

module.exports = function (db) {

  const Todos = db.collection('todos');

  router.get('/', async (req, res) => {
    try {
      const page = req.query.page || 1
      const sortBy = req.query.sortBy || 'id'
      const sortMode = req.query.sortMode || 'desc'
      const limit = parseInt(req.query.limit) || 10
      const offset = (page - 1) * limit

      let params = {}

      if (req.query.executor) {
        params = { ...params, executor: new ObjectId (req.query.executor) }
      }

      if (req.query.title) {
        params = { ...params, title: new RegExp(req.query.title, 'i') }
      }

      if (req.query.startdate && req.query.enddate) {
        const start = new Date(req.query.startdate)
        const end = new Date(req.query.enddate)
        end.setDate(end.getDate() + 1)
        params = { ...params, deadline: { $gte: start, $lt: end } }

      } else if (req.query.startdate) {
        params = { ...params, deadline: { $gte: new Date(req.query.startdate) } }

      } else if (req.query.enddate) {
        const end = new Date(req.query.enddate)
        end.setDate(end.getDate() + 1)
        params = { ...params, deadline: { $lt: end } }
      }

      if (req.query.complete) {
        params = { ...params, complete: JSON.parse(req.query.complete) }
      }

      const total = await Todos.countDocuments(params)
      const pages = Math.ceil(total / limit)
      const sortField = sortBy === 'id' ? '_id' : sortBy
      const sortDirection = sortMode === 'desc' ? -1 : 1
      const data = await Todos.find(params).sort({ [sortField]: sortDirection }).limit(limit).skip(offset).toArray()

      res.json({
        data,
        offset,
        query: req.query,
        page: parseInt(page),
        pages,
        limit,
        total,
        sortBy,
        sortMode
      });
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  router.post('/', async (req, res) => {
    const { title, executor } = req.body
    try {
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + 1)

      const doc = { title, complete: false, deadline }
      if (executor) {
        doc.executor = new ObjectId(executor)
      }
      const data = await Todos.insertOne(doc)
      res.json(data)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: error.message })
    }
  })

  router.get('/:id', async (req, res) => {
    const id = req.params.id
    try {
      const data = await Todos.findOne({_id: new ObjectId(id)})
      res.json(data)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })

  router.put('/:id', async (req, res) => {
    const id = req.params.id
    const { title, deadline, complete } = req.body
    console.log(req.body)
    try {
      const data = await Todos.updateOne({_id: new ObjectId(id)}, {$set: {title, deadline: new Date(deadline), complete: complete === true || complete === 'true' }})
      console.log(data, "test")
      res.json(data)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: error.message })
    }

  })


  router.delete('/:id', async (req, res) => {
    const id = req.params.id
    try {
      const data = await Todos.deleteOne({_id: new ObjectId(id)})
      res.json(data)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })

  return router;

};
