const express = require('express');
const router = express.Router();
const authCheck = require('../middleware/check-auth');
const controllers = require('../controllers/orders');

router.get('/', authCheck, controllers.orderGetAll);
router.post('/', authCheck, controllers.orderPost);
router.get('/:orderId', authCheck, controllers.getOrder);
router.patch('/:orderId', authCheck, controllers.patchOrder);
router.delete('/:orderId', authCheck, controllers.deleteOrder);

module.exports = router;