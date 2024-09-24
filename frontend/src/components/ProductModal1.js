import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';


const ProductModal1 = ({ isOpen, product, onClose }) => {
    
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


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
    <>


      <Modal show={show} onHide={handleClose}>
        <div className="modal-dialog modal-dialog-scrollable">
          <Modal.Header closeButton>
            <Modal.Title>Scrollable Modal</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Long content goes here */}
            <p>Lorem ipsum dolor sit amet...</p>
            <p>More content to make the modal scrollable...</p>
            {/* Add enough content here to test the scrolling */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
};

export default ProductModal1;
