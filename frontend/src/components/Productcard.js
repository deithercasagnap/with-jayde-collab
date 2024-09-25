import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { cartEventEmitter } from './eventEmitter';
import ProductModal from './ProductModal';  // Import the modal
import './modal.css';
import './ProductCard.css'

import { IoCartOutline } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";
import { LuShoppingBag } from "react-icons/lu";
import ProductModal1 from './ProductModal1';
import ViewProductModal from './ViewProductModal';

const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }


    return array;
};

const PAGE_SIZE = 4;

// ProductCard Component
const ProductCard = React.memo(({ product, onAddToCart, onProductInteraction, onProductClick }) => {
    if (!product) {
        return <div>Product data is not available</div>;
    }

    return (
        <>
        <div className="card border border-danger" style={{ width: '18rem' }}>
        <img
            src={product.product_image}
            width="50"
            height="200"
            className="card-img-top"
            alt={product.product_name || 'Product Image'}
            onClick={() => onProductClick(product)} // Trigger modal on click
        />

  <div className="card-body">
    <h5 className="card-title">{product.product_name || 'No product name'}</h5>
    <p className="card-text">Quantity: {product.quantity}</p>

    <div className="d-flex justify-content-between align-items-end w-100 ">
      <div className="col-auto align-items-end">
        <button onClick={() => onAddToCart(product)} type="button" className="btn btn-primary">
          <FiShoppingCart className="me-2" width="40" height="40" />Add to Cart
        </button>
      </div>
      <div className="col-auto align-items-end">
        <button onClick={() => onProductInteraction(product.product_code, 'view')} type="button" className="btn btn-danger">
          <LuShoppingBag className="me-2" />Buy Now
        </button>
      </div>
    </div>
  </div>
</div>



        {/* <div className='procard' style={{ width: '22%', margin: '1%' }}>
            <div className='productimg' style={{ width: '100%', height: '65%' }}>
                <img
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    src={product.product_image || 'https://via.placeholder.com/150'}
                    alt={product.product_name || 'Product Image'}
                    onClick={() => onProductClick(product)}  // Trigger modal on click
                />
            </div>
            <div className='productdesc' style={{ width: '100%', height: '35%' }}>
                <div className='product-data'>
                    <p>{product.product_name || 'No product name'}</p>
                    <p>Quantity: {product.quantity}</p>
                    <div className='order-options'>
                        <button onClick={() => onAddToCart(product)}>Add to Cart</button>
                        <button onClick={() => onProductInteraction(product.product_code, 'view')}>Buy Now</button>
                    </div>
                </div>
            </div>
        </div> */}
        </>
    );
});

ProductCard.propTypes = {
    product: PropTypes.shape({
        product_image: PropTypes.string,
        product_name: PropTypes.string,
        product_code: PropTypes.string.isRequired,
        quantity: PropTypes.number
    }).isRequired,
    onAddToCart: PropTypes.func.isRequired,
    onProductInteraction: PropTypes.func.isRequired,
    onProductClick: PropTypes.func.isRequired
};

// ProductList Component
const ProductList = () => {
    const [products, setProducts] = React.useState([]);
    const [recommendedProducts, setRecommendedProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [customerId, setCustomerId] = React.useState(null);
    const [currentPage, setCurrentPage] = React.useState(0);
    const [selectedProduct, setSelectedProduct] = React.useState(null); // Modal product state
    const [isModalOpen, setIsModalOpen] = React.useState(false); // Modal visibility state

    React.useEffect(() => {
        const storedCustomerId = localStorage.getItem('customer_id');
        if (storedCustomerId) {
            setCustomerId(storedCustomerId);
            fetchRecommendations(storedCustomerId); // Fetch recommendations based on customer ID
        }

        const fetchProducts = async () => {
            setLoading(true);
            try {

                // JUST UNCOMMENT PRA MA TEST NNMO ANG MGA BACKEND
                //const response = await axios.get('http://localhost:5000/products-top-mix-picks');
                const response = await axios.get('http://localhost:5000/products');

                const shuffledProducts = shuffleArray(response.data);
                setProducts(shuffledProducts);
            } catch (error) {
                setError('Error fetching products: ' + (error.response ? error.response.data : error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Fetch recommended products for a given customer
    const fetchRecommendations = async (customerId) => {
        try {
            const response = await axios.get(`http://localhost:5000/recommend-products`);
            const recShuffledProducts = shuffleArray(response.data);
            setRecommendedProducts(recShuffledProducts);
        } catch (error) {
            setError('Error fetching recommendations: ' + (error.response ? error.response.data : error.message));
        }
    };

    // Debounce for add to cart
    const handleAddToCart = (() => {
        let timeout;
        return async (product) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const token = localStorage.getItem('token');
                if (!token || !customerId) {
                    console.log('User not logged in or customer ID missing');
                    return;
                }

                try {
                    const response = await axios.post('http://localhost:5000/add-to-cart', {
                        customer_id: customerId,
                        product_code: product.product_code,
                        quantity: 1
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.status === 200) {
                        cartEventEmitter.emit('cartUpdated');
                        await handleProductInteraction(product.product_code, 'cart');
                    }
                } catch (error) {
                    console.error('Error adding product to cart:', error.response ? error.response.data : error.message);
                }
            }, 300); // Debounce delay
        };
    })();

    const handleProductInteraction = async (productCode, interactionType) => {
        const customerId = localStorage.getItem('customer_id'); // Retrieve customer ID from local storage
        if (!customerId) {
            console.log('Customer ID is not available');
            return;
        }

        try {
            await axios.get('http://localhost:5000/products-interaction', {
                params: {
                    product_code: productCode,
                    customerId: customerId,
                    interaction_type: interactionType
                }
            });
            console.log('Product interaction updated');
        } catch (error) {
            console.error('Error updating product interaction:', error.response ? error.response.data : error.message);
        }
    };

    const handlePageChange = (direction) => {
        setCurrentPage((prevPage) => {
            const newPage = prevPage + direction;
            const maxPage = Math.ceil(products.length / PAGE_SIZE) - 1;
            return Math.max(0, Math.min(newPage, maxPage));
        });
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product); // Set product to be displayed in modal
        setIsModalOpen(true); // Open modal
    };

    const closeModal = () => {
        setIsModalOpen(false); // Close modal
        setSelectedProduct(null); // Clear selected product
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const paginatedProducts = products.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
    

    return (
        <div className='product-list'>
            <h2>Top Products</h2>

            


            <div className='product-list' style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>

                {paginatedProducts.map((product) => (
                    <ProductCard
                        class="border border-danger"
                        key={product.product_code}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onProductInteraction={handleProductInteraction}
                        onProductClick={handleProductClick}  // Pass down the click handler for modal
                    />
                ))}
            </div>
            <div className='pagination-controls'>
                <button onClick={() => handlePageChange(-1)} disabled={currentPage === 0}>Previous</button>
                <button onClick={() => handlePageChange(1)} disabled={(currentPage + 1) * PAGE_SIZE >= products.length}>Next</button>
            </div>

            {/* Render the modal for selected product */}
            {/* <ProductModal
                isOpen={isModalOpen}
                product={selectedProduct}
                onClose={closeModal}
            /> */}

            <ProductModal
                isOpen={isModalOpen}
                product={selectedProduct}
                onClose={closeModal}
            />
        </div>
    );
};

export default ProductList;
