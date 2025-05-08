const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the todo
 *         title:
 *           type: string
 *           description: Title of the todo item
 *         completed:
 *           type: boolean
 *           description: Completion status of the todo
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         title: Complete project documentation
 *         completed: false
 *         createdAt: 2023-01-15T10:30:00.000Z
 *   responses:
 *     BadRequest:
 *       description: Bad request - invalid data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *     NotFound:
 *       description: The requested resource was not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 */

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: Todo management API
 */

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Retrieve all todos
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: A list of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    console.log('Todos retrieved successfully:', todos);
    res.status(200).json(todos);

  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to retrieve todos' });
  }
});

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a todo by ID
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The todo ID
 *     responses:
 *       200:
 *         description: Todo details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(200).json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid todo ID format' });
    }
    res.status(500).json({ error: 'Failed to retrieve todo' });
  }
});

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const newTodo = new Todo({
      title: req.body.title,
      completed: req.body.completed || false
    });
    
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, completed } = req.body;
    
    // Validate that at least one field is being updated
    if (!title && completed === undefined) {
      return res.status(400).json({ error: 'At least one field is required for update' });
    }
    
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid todo ID format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The todo ID
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    await Todo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid todo ID format' });
    }
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = router;