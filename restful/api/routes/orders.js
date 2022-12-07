const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/orders');
const Product = require('../models/products');

const adjustOrderResponse = (response) => ({
    _id: response._id,
    product: response.product,
    quantity: response.quantity
})

router.get('/', (req, res, next) => {
    Order.find()
    .select('_id product quantity').exec()
    .then(orders => {
        res.status(200).json({
            message: 'Orders fetched',
            count: orders.length,
            orders: orders.map(order => adjustOrderResponse(order))
        })
    })
    .catch(error => res.status(500).json({error: error}))
})

router.post('/', (req, res, next) => {
    Product
        .findById(req.body.product).exec()
        .then(product => {
            if (!product) 
                throw {error: {message: 'Product not found'}};

            return new Order({
                _id: new mongoose.Types.ObjectId(),
                product: req.body.product,
                quantity: req.body.quantity
            }).save();
        })
        .then(order => {
            res.status(201).json({
                message: 'Order added',
                order: adjustOrderResponse(order)
            })
        })
        .catch(error => {
            res.status(500).json(error);
        })
})

router.get('/:orderId', (req, res, next) => {
    Order
        .findById(req.params.orderId).exec()
        .then(order => {
            if (order) {
                res.status(200).json({
                    message: 'Order details fetched',
                    order: adjustOrderResponse(order)
                })
            }
            else {
                res.status(404).json({error: 'Order not found'})
            }
        })
        .catch(error => res.status(500).json({error: error}))
})

router.patch('/:orderId', (req, res, next) => {
    const updatedInfo = Object.entries(req.body).reduce((acc, [key, value]) => {
        if (['product', 'quantity'].includes(key))
            acc[key] = value;
        return acc;
    }, {});

    Order
        .updateOne({_id: req.params.orderId}, {$set: updatedInfo})
        .exec()
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({error: error}))
})

router.delete('/:orderId', (req, res, next) => {
    Order.findOneAndRemove({_id: req.params.orderId}).exec()
    .then(response => res.status(200).json(response))
    .catch(error => res.status(500).json({error: error}))
})

module.exports = router;