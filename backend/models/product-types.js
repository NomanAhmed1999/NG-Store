const mongoose = require('mongoose');

const productTypeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: '#000000'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    }
});

productTypeSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productTypeSchema.set('toJSON', {
    virtuals: true,
});

exports.ProductType = mongoose.model('ProductType', productTypeSchema);