const express = require('express');
const router = express.Router();
const { Product } = require('../models/product');
const { Order } = require('../models/order');
const { User } = require('../models/user');

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
    try {
        // Total revenue
        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        
        // Sales by category
        const salesByCategory = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "orderItems.product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: "$category.name",
                    total: { $sum: "$orderItems.quantity" }
                }
            }
        ]);

        // Monthly revenue
        const monthlyRevenue = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$dateOrdered" },
                        month: { $month: "$dateOrdered" }
                    },
                    total: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Top selling products
        const topProducts = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    totalSold: { $sum: "$orderItems.quantity" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" }
        ]);

        // Recent orders
        const recentOrders = await Order.find()
            .populate('user', 'name')
            .sort('-dateOrdered')
            .limit(5);

        // Stock alerts (low stock products)
        const lowStockProducts = await Product.find({ countInStock: { $lt: 10 } })
            .select('name countInStock')
            .limit(5);

        // Basic stats
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();

        res.json({
            totalRevenue,
            salesByCategory,
            monthlyRevenue,
            topProducts,
            recentOrders,
            lowStockProducts,
            stats: {
                totalOrders,
                totalProducts,
                totalUsers,
                averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 