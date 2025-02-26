import React, { useState } from 'react';
import { z } from 'zod';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
    name: z.string().nonempty('Name is required'),
    description: z.string().nonempty('Description is required'),
    price: z.number().positive('Price must be positive'),
    category: z.string().nonempty('Category is required'),
    countInStock: z.number().positive('Count in stock must be positive'),
    richDescription: z.string().optional(),
    image: z.any().optional(),
    brand: z.string().optional(),
    rating: z.number().optional(),
    numReviews: z.number().optional(),
    isFeatured: z.boolean().optional(),
});

const AddProduct = () => {
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        price: string;
        category: string;
        countInStock: string;
        richDescription: string;
        image: File | null;
        brand: string;
        rating: string;
        numReviews: string;
        isFeatured: boolean;
    }>({
        name: '',
        description: '',
        price: '',
        category: '',
        countInStock: '',
        richDescription: '',
        image: null,
        brand: '',
        rating: '',
        numReviews: '',
        isFeatured: false,
    });

    const [errors, setErrors] = useState<any>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked }: any = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleEditorChange = (content: string) => {
        setFormData({
            ...formData,
            richDescription: content,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            image: e.target.files ? e.target.files[0] : null,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        console.log('Form data:', formData);


        e.preventDefault();
        const parsedData = schema.safeParse({
            ...formData,
            price: parseFloat(formData.price),
            countInStock: parseInt(formData.countInStock),
            rating: formData.rating ? parseFloat(formData.rating) : undefined,
            numReviews: formData.numReviews ? parseInt(formData.numReviews) : undefined,
        });
        if (!parsedData.success) {
            setErrors(parsedData.error.format());
            return;
        }

        const data: any = parsedData.data;
        const formDataToSend = new FormData();
        Object.keys(data).forEach(key => {
            formDataToSend.append(key, data[key]);
        });


        fetch('http://localhost:3000/api/v1/products', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_TOKEN_HERE',
            },
            body: formDataToSend,
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className='my-2'>
                <label>Name</label>
                <Input name="name" value={formData.name} onChange={handleChange} />
                {errors.name && <p className='text-red-500 text-sm'>{errors.name._errors[0]}</p>}
            </div>
            <div className='my-2'>
                <label>Description</label>
                <Textarea name="description" value={formData.description} onChange={handleChange} />
                {errors.description && <p className='text-red-500 text-sm'>{errors.description._errors[0]}</p>}
            </div>
            <div className='my-2'>
                <label>Rich Description</label>
                <ReactQuill value={formData.richDescription} onChange={handleEditorChange} />
            </div>
            <div className='my-2'>
                <label>Image</label>
                <Input type="file" name="image" onChange={handleFileChange} />
            </div>
            <div className='my-2'>
                <label>Brand</label>
                <Input name="brand" value={formData.brand} onChange={handleChange} />
            </div>
            <div className='my-2'>
                <label>Price</label>
                <Input type="number" name="price" value={formData.price} onChange={handleChange} />
                {errors.price && <p className='text-red-500 text-sm'>{errors.price._errors[0]}</p>}
            </div>
            <div className='my-2'>
                <label>Category</label>
                <Select name="category" value={formData.category} onValueChange={(e: any) => {
                    setFormData({
                        ...formData,
                        "category": e,
                    });
                }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
                {errors.category && <p className='text-red-500 text-sm'>{errors.category._errors[0]}</p>}
            </div>
            <div className='my-2'>
                <label>Count In Stock</label>
                <Input type="number" name="countInStock" value={formData.countInStock} onChange={handleChange} />
                {errors.countInStock && <p className='text-red-500 text-sm'>{errors.countInStock._errors[0]}</p>}
            </div>
            <div className='my-2'>
                <label>Rating</label>
                <Input type="number" name="rating" value={formData.rating} onChange={handleChange} />
            </div>
            <div className='my-2'>
                <label>Num Reviews</label>
                <Input type="number" name="numReviews" value={formData.numReviews} onChange={handleChange} />
            </div>
            <div className='my-2 flex flex-col'>
                <label>Is Featured</label>
                <Switch name="isFeatured" checked={formData.isFeatured} onCheckedChange={() => {
                    console.log(formData.isFeatured);
                    
                    setFormData({
                        ...formData,
                        'isFeatured': !formData.isFeatured,
                    });
                }} />
            </div>
            <Button type="submit">Submit</Button>
        </form>
    );
};

export default AddProduct;