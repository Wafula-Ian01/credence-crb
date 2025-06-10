const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const borrowerRoutes = require('./routes/borrower')
const lenderRoutes = require('./routes/lender')
const creditRoutes = require('./routes/credit')
const consensusRoutes = require('./routes/consensus')

const app = express()
const PORT = process.env.PORT

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/borrower', borrowerRoutes);
app.use('/api/lender', lenderRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/consensus', consensusRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Decentralized CRB Server running on port ${PORT}`);
});