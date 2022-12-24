const mongoose = require('mongoose');
const Order = require('../models/orders');
const Product = require('../models/products');

const adjustOrderResponse = (response) => ({
    _id: response._id,
    product: response.product,
    quantity: response.quantity
});

const http500 = (err, res) => {
    console.log(err);
    res.status(500).json({error: err});
}

exports.orderGetAll = (req, res, next) => {
    Order.find()
    .select('_id product quantity')
    .populate('product', 'name _id')
    .exec()
    .then(orders => {
        res.status(200).json({
            message: 'Orders fetched',
            count: orders.length,
            orders: orders.map(order => adjustOrderResponse(order))
        })
    })
    .catch(err => http500(err, res));
};

exports.orderPost = (req, res, next) => {
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
        .catch(err => http500(err, res));
};

exports.getOrder = (req, res, next) => {
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
        .catch(err => http500(err, res));
};

exports.patchOrder = (req, res, next) => {
    const updatedInfo = Object.entries(req.body).reduce((acc, [key, value]) => {
        if (['product', 'quantity'].includes(key))
            acc[key] = value;
        return acc;
    }, {});

    Order
        .updateOne({_id: req.params.orderId}, {$set: updatedInfo})
        .exec()
        .then(result => res.status(200).json(result))
        .catch(err => http500(err, res));
};

exports.deleteOrder = (req, res, next) => {
    Order.findOneAndRemove({_id: req.params.orderId}).exec()
    .then(response => res.status(200).json(response))
    .catch(err => http500(err, res));
};