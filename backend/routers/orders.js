const { Order } = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();


router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 });

    if (!orderList) {
        res.status(500).json({ success: false });
    }
    res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category'
            }
        });

    if (!order) {
        res.status(500).json({ success: false });
    }
    res.send(order);
});

router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id, {
        status: req.body.status
    },
        // a[[ly changes on return
        { new: true }
    );
    if (!order) {
        res.status(500).json({ message: 'The order with the given Id was not found' });
    }
    res.status(200).send(order);
});

router.post(`/`, async (req, res) => {
    let orderItems = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }))
    const orderItemsIdsResolved = await orderItems;

    const totalPrices = await Promise.all(
        orderItemsIdsResolved.map(async orderItemId => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
            return orderItem.product.price * orderItem.quantity;
        })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0).toFixed(2);
    console.log(totalPrice);


    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    });

    order = await order.save();
    if (!order) {
        return res.status(404).send('The order cannot be created');
    }
    res.send(order);

});

router.delete('/:id', (req, res) => {
    Order.findByIdAndDelete(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndDelete(orderItem)
            })

            return res.status(200).json({ success: true, message: 'the order is deleted!' });
        } else {
            return res.status(404).json({ success: false, message: 'order not found!' });
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err });
    })
})

router.get('/get/totalsales', async (req, res) => {
    const totalsales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ])
    if(!totalsales) {
        return res.status(404).send({ success: false, message: 'order not found!' });
    }
    res.send({totalsales: totalsales.pop().totalsales});
})


router.get(`/get/count`, async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();
        res.send({ orderCount });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
});



router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({user: req.params.userid})
    .populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            populate: 'category'
        }
    })
    .sort({ 'dateOrdered': -1 });

    if (!userOrderList) {
        res.status(500).json({ success: false });
    }
    res.send(userOrderList);
});


module.exports = router;