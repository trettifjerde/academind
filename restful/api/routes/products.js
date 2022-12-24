const express = require('express');
const Product = require('../models/products');
const mongoose = require('mongoose');
const multer = require('multer');
const authCheck = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: "uploads",
    filename: function(req, file, cb) {
        console.log(file);
        cb(null, new Date().getTime() + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    switch (file.mimetype) {
        case 'image/jpeg':
        case 'image/png': 
            cb(null, true);
            break;
        default:
            cb(new Error('Invalid file extension'), false);
    }
}

const upload = multer({storage: storage, limits: {fileSize: 1024 * 1024 * 10}, fileFilter: fileFilter});

const router = express.Router();

const adjustProductInfo = (product) => ({
    name: product.name || null,
    price: product.price || null,
    _id: product._id || product._id,
    productImage: product.productImage || null
    /*request: {
        type: 'GET',
        url: 'http://localhost:3000/products/' + product._id
    }*/
}); 

router.get('/', (req, res, next) => {
    Product.find()
        .exec()
        .then(products => {
            const response = {
                count: products.length,
                products: products.map(product => adjustProductInfo(product))
            };
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({error: err})
        })
});

router.post('/', authCheck, upload.single('productImage'), (req, res, next) => {
    console.log(req.file ? req.file : 'no file');
    new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file?.path
    })
    .save()
    .then(result => {
        res.status(201).json({
            message: 'Product created',
            product: adjustProductInfo(result)
        });
    })
    .catch(error => {
        res.status(500).json({error: error})
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product
        .findById(id).exec()
        .then(doc => {
            if (doc)
                res.status(200).json(doc);
            else
                res.status(404).json({message: "Product not found"})
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            })
        });
});

router.patch('/:productId', authCheck, (req, res, next) => {
    const updatedProduct = Object.entries(req.body).reduce((acc, [key, value]) => {
        if (key === 'name' || key === 'price')
            acc[key] = value;
        return acc;
    }, {});
    console.log('Updating product', req.params.productId, updatedProduct);
    Product.updateOne({_id: req.params.productId}, {$set: updatedProduct}).exec()
        .then(result => res.status(200).json(result))
        .catch(err => res.status(500).json({error: err}))
});

router.delete('/:productId', authCheck, (req, res, next) => {
    Product.findOneAndRemove({_id: req.params.productId}).exec()
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({error: error}))
});

module.exports = router;