import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { MdDelete } from 'react-icons/md';
import { Edit } from 'lucide-react';
import { Resizable, ResizableBox } from 'react-resizable';



function ProductTable() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/v1/products/')
            .then(response => response.json())
            .then(data => setProducts(data))
            .catch(error => console.error('Error fetching products:', error));
    }, []);



    return (
        <>
            <Table className='border'>
                <TableCaption>A list of your recent products.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Count In Stock</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Num Reviews</TableHead>
                        <TableHead>Is Featured</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product: any) => (
                        <TableRow key={product._id}>
                            <TableCell>{product._id}</TableCell>
                            <TableCell>
                                <img src={product.image} alt={product.name} className='w-12 h-12' />
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>{product.countInStock}</TableCell>
                            <TableCell>{product.rating}</TableCell>
                            <TableCell>{product.numReviews}</TableCell>
                            <TableCell>{product.isFeatured ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{product.price}</TableCell>
                            <TableCell>
                                <Button variant={'outline'} size={'icon'}>
                                    <MdDelete />
                                </Button>
                                <Button className='ms-2' variant={'outline'} size={'icon'}>
                                    <Edit />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        </>
    );
}

export default ProductTable;