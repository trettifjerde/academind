const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling Get request'
    });
});

router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'Handling POST request'
    });
});

router.get('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'You have requested info on product #',
        productId: req.params.productId
    })
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    res.status(200).json({
        message: 'You have updated product #' + id
    })
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    res.status(200).json({
        message: 'You have deleted product #' + id
    })
});

module.exports = router;