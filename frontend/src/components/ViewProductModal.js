import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const ViewProductModal = ({ isOpen, product, onClose }) => {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (product) {
            setLoading(true);
            setError(null);

            // Send POST request to fetch recommended products based on the selected product's category
            fetch('http://localhost:5000/products/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_code: product.product_code }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    setRecommendedProducts(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching recommendations:', error);
                    setError('Failed to load recommendations.');
                    setLoading(false);
                });
        }
    }, [product]);

    if (!isOpen || !product) return null;

    return (
        <Modal onClick={onClose}>
            <Modal.Header closeButton onClick={(e) => e.stopPropagation()}>
                <Modal.Title>Update Product</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}
                <Form >
                    <Form.Group controlId="formProductCode">
                        <Form.Label>Product Code</Form.Label>
                        <Form.Control
                            type="text"
                            name="product_code"
                            // value={formData.product_code}
                            // onChange={handleChange}
                            required
                            
                        />
                    </Form.Group>
                    <Form.Group controlId="formProductName">
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="product_name"
                            // value={formData.product_name}
                            // onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formPrice">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="number"
                            name="price"
                            // value={formData.price}
                            // onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    
                    <Form.Group controlId="formQuantity">
                        <Form.Label>Quantity</Form.Label>
                        <Form.Control
                            type="number"
                            name="quantity"
                            // value={formData.quantity}
                            // onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            // value={formData.description}
                            // onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formImage">
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control
                            type="text"
                            name="product_image"
                            // value={formData.product_image}
                            // onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formExpirationDate">
                        <Form.Label>Expiration Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="expiration_date"
                            // value={formData.expiration_date}
                            // onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Update Product
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ViewProductModal;
