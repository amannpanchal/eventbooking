const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const graphQLSchema = require('./graphql/schema');
const graphQLResolvers = require('./graphql/resolvers');
const isAuth = require('./middleware/is-auth');

const app = express();

// Middleware to parse incoming JSON bodies
app.use(bodyParser.json());

// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Short-circuit for preflight requests
  }

  next();
});

// Auth middleware (checks for valid Authorization header)
app.use(isAuth);

// GraphQL API endpoint
app.use(
  '/graphql',
  graphqlHttp({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
    graphiql: true, // Enable GraphiQL UI (for development)
  })
);

// Connect to MongoDB using Mongoose
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-mmohl.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(3001, () => {
      console.log('🚀 Server running at http://localhost:3001/graphql');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
  });
