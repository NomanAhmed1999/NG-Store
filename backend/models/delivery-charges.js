const mongoose = require('mongoose');

const deliveryChargesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    estimatedDays: {
        type: String,
        required: true
    },
    freeShippingThreshold: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

deliveryChargesSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

deliveryChargesSchema.set('toJSON', {
    virtuals: true
});

exports.DeliveryCharges = mongoose.model('DeliveryCharges', deliveryChargesSchema); 