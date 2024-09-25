import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './ProductModal.css';



import { FiShoppingCart } from "react-icons/fi";
import { LuShoppingBag } from "react-icons/lu";
import { FaXmark } from "react-icons/fa6";


// Modal Component
const ProductModal = ({ isOpen, product, onClose }) => {
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
        <div className="modal-overlay " onClick={onClose}>
            <div className="modal-content  bg-white" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}><FaXmark /></button>
                <div className="modal-body">

                    <div class="d-flex justify-content-between align-items-center">
                    
                        <div class="col me-4">
                            <div class="d-flex justify-content-center align-items-end">
                                <img 
                                    class="d-flex justify-content-center align-items-end"
                                    src={product.product_image || 'https://via.placeholder.com/150'}
                                    alt={product.product_name}
                                    style={{ width: '50%' , height: '500%'}}
                                />

                            </div>
                            <hr></hr>
                            <div class="d-flex justify-content-between align-items-center mx-4">
                                <div>
                                    <p>Price</p>
                                </div>
                                <div>
                                    <p class="fw-bold">₱ {product.price}.00</p>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mx-4">
                                <div>
                                    <p>Quantity</p>
                                </div>
                                <div>
                                    <p class="fw-bold">{product.quantity}</p>
                                </div>
                            </div>

                         
                        </div>

                        <div class="col">


                            <p class="fw-bold">{product.product_name}</p>
                            <p>Description<br></br>{product.description || 'No description available.'}</p>
                      
                            <div className="d-flex align-items-center w-100 ">
                                <div className="col d-flex justify-content-center align-items-center">
                                    <button type="button" className="btn btn-primary d-flex justify-content-center align-items-center">
                                    <FiShoppingCart className="me-2" width="40" height="40" />Add to Cart
                                    </button>
                                </div>
                                <div className="col d-flex justify-content-center align-items-center">
                                    <button type="button" className="btn btn-danger  d-flex justify-content-center align-items-center">
                                    <LuShoppingBag className="me-2" />Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                        <hr></hr>

                    </div>
                    


                    






                    {/* <button onClick={onClose}>Close</button> */}

                    {/* Recommendations Section */}
                    <hr></hr>
                    <div className="recommendations ">
    <h4 class="fw-bold text-center">Recommended Products</h4>
    {loading ? (
        <p>Loading recommendations...</p>
    ) : error ? (
        <p>{error}</p>
    ) : recommendedProducts.length > 0 ? (
        <div className="recommendation-grid ">
            {recommendedProducts.map((recProduct) => (
                <div key={recProduct.product_id} className="recommendation-item border border-primary shadow-sm">
                    <img
                        class="col-auto"
                        src={recProduct.product_image || 'https://via.placeholder.com/150'}
                        alt={recProduct.product_name}
                        style={{ width: '100px', marginBottom: '10px' }}
                    />
                    <span>{recProduct.product_name}</span>
                </div>
            ))}
        </div>
    ) : (
        <p>No recommendations available.</p>
    )}
</div>

                </div>
            </div>
        </div>
    );
};

// PropTypes for validation
ProductModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    product: PropTypes.shape({
        product_code: PropTypes.string.isRequired,
        product_image: PropTypes.string,
        product_name: PropTypes.string,
        description: PropTypes.string,
        price: PropTypes.number,
        quantity: PropTypes.number
    }),
    onClose: PropTypes.func.isRequired
};

export default ProductModal;
