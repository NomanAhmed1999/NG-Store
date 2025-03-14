const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    description: {
        type: String,
        default: ''
    },
    minAmount: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

couponSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

couponSchema.set('toJSON', {
    virtuals: true
});

exports.Coupon = mongoose.model('Coupon', couponSchema); 