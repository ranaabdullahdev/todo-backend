const express = require('express');
const connectDB = require('./config');
const todoRoutes = require('./routes/todoRoute');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
require('dotenv').config();



const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Todo API",
			version: "1.0.0",
			description: "A simple Express Todo API",
		},
		servers: [
			{
				url: "http://localhost:8000",
			},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

const app = express();
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
const PORT = process.env.PORT ;

// Connect DB
connectDB();

// Middleware
app.use(express.json());
app.use(require('cors')());

// Routes
app.use('/api/todos', todoRoutes);

// Server
app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);
});