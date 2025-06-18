// routes/paymentRoutes.js
require('dotenv').config();
const express = require('express'); //
const router = express.Router(); //
const paymentController = require('../controller/paymentController'); 


router.get('/generate-eazypay-url', paymentController.generateEazypayUrl); //
router.post('/eazypay-return', paymentController.eazypayReturn); //
router.get('/verify-eazypay-payment', paymentController.verifyEazypayPayment); //

module.exports = router; //