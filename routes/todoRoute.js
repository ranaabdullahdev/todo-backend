const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// Get all todos
router.get('/', async (req, res) => {
    console.log('hello')
  const todos = await Todo.find();
  res.json(todos);
});

// Create a todo
router.post('/', async (req, res) => {
  const newTodo = new Todo(req.body);
  const saved = await newTodo.save();
  res.json(saved);
});

// Update a todo
router.put('/:id', async (req, res) => {
  const updated = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete a todo
router.delete('/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: 'Todo deleted' });
});

module.exports = router;