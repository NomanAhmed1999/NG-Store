const { Coupon } = require('../models/coupon');
const express = require('express');
const router = express.Router();

// Get all coupons
router.get('/', async (req, res) => {
    try {
        let filter = {};
        
        if (req.query.isActive) {
            filter.isActive = req.query.isActive === 'true';
        }

        const coupons = await Coupon.find(filter).sort({ dateCreated: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get a single coupon
router.get('/:id', async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Validate coupon
router.post('/validate', async (req, res) => {
    try {
        const { code, amount } = req.body;
        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(),
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        if (!coupon) {
            return res.status(400).json({ success: false, message: 'Invalid coupon code' });
        }

        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit exceeded' });
        }

        if (amount < coupon.minAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimum order amount should be Rs. ${coupon.minAmount}`
            });
        }

        const discountAmount = Math.min(
            (amount * coupon.discountPercentage) / 100,
            coupon.maxDiscount || Infinity
        );

        res.json({
            success: true,
            discountAmount,
            discountPercentage: coupon.discountPercentage
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create a new coupon
router.post('/', async (req, res) => {
    try {
        let coupon = new Coupon({
            code: req.body.code.toUpperCase(),
            discountPercentage: req.body.discountPercentage,
            description: req.body.description,
            minAmount: req.body.minAmount,
            maxDiscount: req.body.maxDiscount,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            isActive: req.body.isActive,
            usageLimit: req.body.usageLimit
        });

        coupon = await coupon.save();
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update a coupon
router.put('/:id', async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            {
                code: req.body.code.toUpperCase(),
                discountPercentage: req.body.discountPercentage,
                description: req.body.description,
                minAmount: req.body.minAmount,
                maxDiscount: req.body.maxDiscount,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                isActive: req.body.isActive,
                usageLimit: req.body.usageLimit
            },
            { new: true }
        );

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.json(coupon);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a coupon
router.delete('/:id', async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 