const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const envVars = require('./env-vars');

app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next) => {
    req.header('Access-Control-Allow-Origin', '*');
    req.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Authorization, Accept');
    if (req.method === 'OPTIONS') {
        req.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        return res.status(200).json(); 
    }
    next();
});

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

mongoose.set('strictQuery', true);
mongoose.connect(
    "mongodb+srv://trettifjerde:" + envVars.mongoAtlasPw + "@cluster1.lbfxwcr.mongodb.net/?retryWrites=true&w=majority"
);

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;