const { ProductType } = require('../models/product-types');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get all product types
router.get(`/`, async (req, res) => {
    try {
        let filter = {};

        // Search by name
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        // Filter by active status
        if (req.query.isActive) {
            filter.isActive = req.query.isActive === 'true';
        }

        // Get total count for pagination
        const total = await ProductType.countDocuments(filter);

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const productTypes = await ProductType.find(filter)
            .sort({ dateCreated: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            productTypes,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get a single product type
router.get('/:id', async (req, res) => {
    try {
        const productType = await ProductType.findById(req.params.id);
        if (!productType) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product type not found' 
            });
        }
        res.json(productType);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create a new product type
router.post('/', async (req, res) => {
    try {
        let productType = new ProductType({
            name: req.body.name,
            description: req.body.description,
            icon: req.body.icon,
            color: req.body.color,
            isActive: req.body.isActive
        });

        productType = await productType.save();
        if (!productType) {
            return res.status(400).json({ 
                success: false, 
                message: 'The product type cannot be created' 
            });
        }
        res.status(201).json(productType);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update a product type
router.put('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid Product Type ID' 
            });
        }

        const productType = await ProductType.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                icon: req.body.icon,
                color: req.body.color,
                isActive: req.body.isActive
            },
            { new: true }
        );

        if (!productType) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product type not found' 
            });
        }

        res.json(productType);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a product type
router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid Product Type ID' 
            });
        }

        const productType = await ProductType.findByIdAndDelete(req.params.id);
        if (!productType) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product type not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Product type deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Toggle product type status
router.patch('/:id/toggle-status', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid Product Type ID' 
            });
        }

        const productType = await ProductType.findById(req.params.id);
        if (!productType) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product type not found' 
            });
        }

        productType.isActive = !productType.isActive;
        await productType.save();

        res.json(productType);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;