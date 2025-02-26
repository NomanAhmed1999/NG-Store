const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false});
    }
    res.send(userList);
});


router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res.status(500).json({ message: 'The user with the given Id was not found' });
    }
    res.status(200).send(user);
});

router.post(`/`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        street: req.body.street,
        appartment: req.body.appartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    });

    user = await user.save();
    if (!user) {
        return res.status(404).send('The user cannot be created');
    }
    res.send(user);
});


router.post(`/login`, async (req, res) => {
    const user = await User.findOne({email: req.body.email});

    if (!user) {
        res.status(400).json({ message: 'User not found' });
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const secret = process.env.JWT_SECRET
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'}
        )
        res.status(200).send({ user: user.email, token: token });
    }else{
        res.status(400).send({ message: 'Password is Wrong!' });
    }

});


router.post(`/register`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        street: req.body.street,
        appartment: req.body.appartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    })
    user = await user.save();
    if (!user) {
        return res.status(500).send('The user cannot be created');
    }
    res.send(user);
});



router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, message: 'the user is deleted!' });
        } else {
            return res.status(404).json({ success: false, message: 'user not found!' });
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err });
    })
})

router.get(`/get/count`, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.send({ userCount });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
});

module.exports = router;