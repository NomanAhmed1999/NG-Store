const { Category } = require('../models/category');
const { Product } = require('../models/product');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
})

const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req, res) => {
    try {
        let filter = {};
        let sort = {};

        // Category filter
        if (req.query.categories) {
            filter.category = { $in: req.query.categories.split(',') };
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        // Search by name
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        // Brand filter
        if (req.query.brands) {
            filter.brand = { $in: req.query.brands.split(',') };
        }

        // Rating filter
        if (req.query.rating) {
            filter.rating = { $gte: Number(req.query.rating) };
        }

        // Sorting
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'price_asc':
                    sort.price = 1;
                    break;
                case 'price_desc':
                    sort.price = -1;
                    break;
                case 'rating_desc':
                    sort.rating = -1;
                    break;
                case 'newest':
                    sort.dateCreated = -1;
                    break;
            }
        }

        // Get total count for pagination
        const total = await Product.countDocuments(filter);

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const productList = await Product.find(filter)
            .populate('category')
            .populate('productType')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        res.json({
            products: productList,
            total,
            page,
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get(`/:id`, async (req, res) => {
    const productList = await Product.findById(req.params.id).populate('category').populate('productType');
    if (productList && productList.colors.length) {
        productList.colors = typeof productList.colors[0] === "string" ? productList.colors[0].split(",") : productList.colors;
    }
    if (productList && productList.sizes.length) {
        productList.sizes = typeof productList.sizes[0] === "string" ? productList.sizes[0].split(",") : productList.colors;
    }

    if (!productList) {
        res.status(500).json({ success: false });
    }
    res.send(productList);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');
    const file = req.file;
    if (!file) return res.status(400).send('Image is required');
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        productType: req.body.productType,
        colors: req.body.colors,
        sizes: req.body.sizes,
    })
    product = await product.save();
    if (!product) {
        return res.status(500).send('The product cannot be created');
    }
    res.send(product);
});


router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagePath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagePath = `${basePath}${fileName}`;
    } else {
        imagePath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
            productType: req.body.productType,
            colors: req.body.colors,
            sizes: req.body.sizes,
        },
        { new: true }
    );

    if (!updatedProduct) {
        return res.status(500).json({ message: 'The product cannot be updated' });
    }
    res.status(200).send(updatedProduct);
});


router.delete('/:id', (req, res) => {
    Product.findByIdAndDelete(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: 'the product is deleted!' });
        } else {
            return res.status(404).json({ success: false, message: 'product not found!' });
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err });
    })
})



router.get(`/get/count`, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        res.send({ productCount });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
});


// how much products returns also the product's isFeatured should be true
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
        res.status(500).json({ message: 'The product cannot be updated' });
    }
    res.status(200).send(products);

});



router.put('/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).send('No images uploaded');
    }

    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    
    // Get existing product
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).send('Product not found');
    }

    // Add new images to existing ones
    const newImagesPaths = files.map(file => `${basePath}${file.filename}`);
    const existingImages = product.images || [];
    
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: [...existingImages, ...newImagesPaths],
        },
        { new: true }
    );

    if (!updatedProduct) {
        return res.status(500).send('The product cannot be updated');
    }
    
    res.status(200).send(updatedProduct);
});

router.delete('/gallery-image/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    
    const imageUrl = req.body.imageUrl;
    if (!imageUrl) {
        return res.status(400).send('Image URL is required');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).send('Product not found');
    }

    // Filter out the image to be deleted
    const updatedImages = product.images.filter(img => img !== imageUrl);

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: updatedImages,
        },
        { new: true }
    );

    if (!updatedProduct) {
        return res.status(500).send('The product cannot be updated');
    }
    
    res.status(200).send(updatedProduct);
});

router.put('/gallery-images-reorder/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    
    const { images } = req.body;
    if (!images || !Array.isArray(images)) {
        return res.status(400).send('Images array is required');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).send('Product not found');
    }

    // Verify that all images in the new order exist in the current product
    const isValidReorder = images.every(img => product.images.includes(img));
    if (!isValidReorder) {
        return res.status(400).send('Invalid image order');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { images },
        { new: true }
    );

    if (!updatedProduct) {
        return res.status(500).send('The product cannot be updated');
    }
    
    res.status(200).send(updatedProduct);
});

router.delete('/gallery-images/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    
    const { imageUrls } = req.body;
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        return res.status(400).send('Image URLs array is required');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).send('Product not found');
    }

    // Filter out the images to be deleted
    const updatedImages = product.images.filter(img => !imageUrls.includes(img));

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: updatedImages,
        },
        { new: true }
    );

    if (!updatedProduct) {
        return res.status(500).send('The product cannot be updated');
    }
    
    res.status(200).send(updatedProduct);
});

module.exports = router;