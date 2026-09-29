var express = require('express');
var router = express.Router();
const moment = require('moment')
const path = require('path');
const { isLoggedIn } = require('../../helpers/util');
const { ObjectId } = require('mongodb');

module.exports = function (db) {

  const Users = db.collection('users');

  router.get('/', async (req, res) => {
    try {
      const page = req.query.page || 1
      const sortBy = req.query.sortBy 
      const sortMode = req.query.sortMode === 'desc' ? -1 : 1
      const limit = req.query.limit === 'all' ? 0 : parseInt(req.query.limit) || 5
      const offset = (page - 1) * limit

      const allowedSortFields = ['name', 'phone']
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name'

      let params = {}

      if (req.query.search) {
        const regex = new RegExp(req.query.search, 'i')
        params = { ...params, $or: [{ name: regex }, { phone: regex }] }
      }

      const total = await Users.countDocuments(params)
      const pages = limit === 0 ? 1 : Math.ceil(total / limit)

      const data = await ( 
        sortBy && allowedSortFields.includes(sortBy)
          ? Users.find(params).sort({ [sortBy]: sortMode }) 
          : Users.find(params)).limit(limit).skip(offset).toArray()

      res.json({
        data,
        query: req.query,
        page: parseInt(page),
        pages,
        sortBy,
        sortMode
      });
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  router.post('/', async (req, res) => {
    const { name, phone } = req.body
    try {
      const data = await Users.insertOne({ name, phone })
      res.json(data)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: error.message })
    }
  })

  router.get('/:id', async (req, res) => {
    const id = req.params.id
    try {
      const data = await Users.findOne({ _id: new ObjectId(id) })
      res.json(data)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })

  router.put('/:id', async (req, res) => {
    const id = req.params.id
    const { name, phone } = req.body
    console.log(req.body)
    try {
      const data = await Users.updateOne({ _id: new ObjectId(id) }, { $set: { name, phone } })
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
      const data = await Users.deleteOne({ _id: new ObjectId(id) })
      res.json(data)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })

  return router;

};
