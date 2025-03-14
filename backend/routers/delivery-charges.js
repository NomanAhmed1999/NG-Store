const { DeliveryCharges } = require('../models/delivery-charges');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get all delivery charges
router.get('/', async (req, res) => {
    try {
        let filter = {};

        // Filter by active status
        if (req.query.isActive) {
            filter.isActive = req.query.isActive === 'true';
        }

        const deliveryCharges = await DeliveryCharges.find(filter)
            .sort({ dateCreated: -1 });

        res.json(deliveryCharges);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get a single delivery charge
router.get('/:id', async (req, res) => {
    try {
        const deliveryCharge = await DeliveryCharges.findById(req.params.id);
        if (!deliveryCharge) {
            return res.status(404).json({
                success: false,
                message: 'Delivery charge not found'
            });
        }
        res.json(deliveryCharge);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create a new delivery charge
router.post('/', async (req, res) => {
    try {
        let deliveryCharge = new DeliveryCharges({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            estimatedDays: req.body.estimatedDays,
            freeShippingThreshold: req.body.freeShippingThreshold,
            isActive: req.body.isActive
        });

        deliveryCharge = await deliveryCharge.save();
        res.status(201).json(deliveryCharge);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update a delivery charge
router.put('/:id', async (req, res) => {
    try {
        const deliveryCharge = await DeliveryCharges.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                estimatedDays: req.body.estimatedDays,
                freeShippingThreshold: req.body.freeShippingThreshold,
                isActive: req.body.isActive
            },
            { new: true }
        );

        if (!deliveryCharge) {
            return res.status(404).json({
                success: false,
                message: 'Delivery charge not found'
            });
        }

        res.json(deliveryCharge);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a delivery charge
router.delete('/:id', async (req, res) => {
    try {
        const deliveryCharge = await DeliveryCharges.findByIdAndDelete(req.params.id);
        if (!deliveryCharge) {
            return res.status(404).json({
                success: false,
                message: 'Delivery charge not found'
            });
        }

        res.json({
            success: true,
            message: 'Delivery charge deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Toggle delivery charge status
router.patch('/:id/toggle-status', async (req, res) => {
    try {
        const deliveryCharge = await DeliveryCharges.findById(req.params.id);
        if (!deliveryCharge) {
            return res.status(404).json({
                success: false,
                message: 'Delivery charge not found'
            });
        }

        deliveryCharge.isActive = !deliveryCharge.isActive;
        await deliveryCharge.save();

        res.json(deliveryCharge);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 