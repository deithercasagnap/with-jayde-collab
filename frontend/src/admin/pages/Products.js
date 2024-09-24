import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../admin.css';
import AdminNav from '../components/AdminNav';
import AdminHeader from '../components/AdminHeader';
import TopProduct from '../components/TopProduct';
// import ProductStatistics from '../components/ProductStatistics';
import ProductTable from '../components/ProductTable';
import AddProductModal from '../components/AddProductModal';
import ProductModal from '../components/UpdateProductModal';


import { FiPlus } from "react-icons/fi";


const Products = () => {
  const [bestSellingCount, setBestSellingCount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockQuantity, setLowStockQuantity] = useState(0);
  const [unpopularProducts, setUnpopularProducts] = useState([]);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [outOfStockQuantity, setOutOfStockQuantity] = useState(0);
  const [discontinuedCount, setDiscontinuedCount] = useState(0);
  const [discontinuedQuantity, setDiscontinuedQuantity] = useState(0);

  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleShowProductModal = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(false);
  };

  const fetchProductData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin-products-with-interaction');
      const {
        total, totalQuantity, lowStockCount, lowStockQuantity, unpopularProducts, outOfStockCount, outOfStockQuantity, discontinuedCount, discontinuedQuantity
      } = response.data;

      setBestSellingCount(total);
      setTotalQuantity(totalQuantity);
      setLowStockCount(lowStockCount);
      setLowStockQuantity(lowStockQuantity);
      setUnpopularProducts(unpopularProducts || []);
      setOutOfStockCount(outOfStockCount);
      setOutOfStockQuantity(outOfStockQuantity);
      setDiscontinuedCount(discontinuedCount);
      setDiscontinuedQuantity(discontinuedQuantity);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await axios.get('http://localhost:5000/products');
      setProducts(response.data);  // Save the fetched products
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchProduct();
  }, []);

  const handleAddProduct = async (newProduct) => {
    try {
      await axios.post('http://localhost:5000/admin-products', newProduct);
      handleCloseAddModal();
      fetchProduct();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div className='dash-con'>
      <AdminNav />
      <div className='dash-board'>
        <div className='dash-header'>
          <div className='header-title'>
            <i className='bx bxs-spa'></i>
            <h1>Products</h1>
          </div>
          <AdminHeader />
        </div>

        <div className='dash-body'>
          <div className='product-con'>
            <div className='product-one'>
              {/* <ProductStatistics
                bestSellingCount={bestSellingCount}
                totalQuantity={totalQuantity}
                lowStockCount={lowStockCount}
                lowStockQuantity={lowStockQuantity}
                unpopularProducts={unpopularProducts}
                outOfStockCount={outOfStockCount}
                outOfStockQuantity={outOfStockQuantity}
                discontinuedCount={discontinuedCount}
                discontinuedQuantity={discontinuedQuantity}
              /> */}
              <TopProduct />
            </div>

            <div className='product-two d-flex justify-content-between'>
              <div className='order-header border border-primary d-flex justify-content-between'>
                

                <div className='d-flex justify-content-between align-items-center order-options  border border-danger'>

                  <div className='col-auto order-search '>
                    <form class="d-flex">
                      <input type='search' placeholder="Search products..." />
                      <button type="submit">Search</button>
                    </form>
                  </div>
                  
                  <div className='col-auto order-print'>
                    <div className='d-flex justify-content-between align-items-center'>
                    <div className='col-auto order-print'>
                      <button>Print Order Summary</button>
                    </div>

                    <div className='col-auto order-sort d-flex align-items-center'>
                      <div class="d-flex align-items-center">
                        <label class="m-0" htmlFor="sort">Sort By</label>
                      </div>
                      <div>
                        <select name="sort" id="sort" class="ms-2">
                          <option value="date">Date</option>
                          <option value="status">Status</option>
                          <option value="id">ID</option>
                          <option value="customer-id">Customer</option>
                        </select>
                      </div>
                      
                    
                    </div>

                    <div className='col-auto  order-add'>
                      <Button variant="primary" onClick={handleShowAddModal}>
                        <FiPlus class="me-2"/>Add Product
                      </Button>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              <ProductTable handleShowProductModal={handleShowProductModal} />
            </div>
          </div>
        </div>
      </div>
      <AddProductModal
        show={showAddModal}
        handleClose={handleCloseAddModal}
        handleAddProduct={handleAddProduct}
      />
      {selectedProduct && (
        <ProductModal
          show={isProductModalOpen}
          product={selectedProduct}
          handleClose={handleCloseProductModal}
          handleUpdateProduct={fetchProduct} // Refresh the product list
        />
      )}
    </div>
  );
};

export default Products;
