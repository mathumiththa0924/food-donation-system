require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: '69fe04c71d8a19d6a298e5fb', role: 'admin' }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1h' });
console.log("Admin Token:", token);
