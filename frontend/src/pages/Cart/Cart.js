import React, { useEffect, useState } from 'react';
import './Cart.css';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import CartProduct from '../../components/CartProduct';
import cartEventEmitter from '../../components/cartEventEmitter'; 
import { useNavigate } from 'react-router-dom';

const CartContent = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/cart', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setCartItems(data.items);
        } else {
          setError(data.message || 'Failed to fetch cart items');
        }
      } catch (err) {
        setError('Error fetching cart items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const computeTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems[item.product_code]) {
        return total + item.sub_total;
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    setTotalPrice(computeTotalPrice());
  }, [selectedItems, cartItems]);

  const toggleItemSelection = (productCode) => {
    setSelectedItems(prevSelected => ({
      ...prevSelected,
      [productCode]: !prevSelected[productCode],
    }));
  };

  const handleSelectAll = (selectAll) => {
    const newSelection = {};
    cartItems.forEach(item => {
      newSelection[item.product_code] = selectAll;
    });
    setSelectedItems(newSelection);
  };

  useEffect(() => {
    const handleToggleSelectAll = (selectAll) => {
      handleSelectAll(selectAll);
    };

    cartEventEmitter.on('toggleSelectAll', handleToggleSelectAll);

    return () => {
      cartEventEmitter.off('toggleSelectAll', handleToggleSelectAll);
    };
  }, [cartItems]);

  const handleCheckout = () => {
    const selectedProducts = cartItems.filter(item => selectedItems[item.product_code]);
    navigate('/checkout', { state: { selectedProducts, totalPrice } });
  };

  const handleSelectAllChange = () => {
    const allSelected = Object.keys(selectedItems).length === cartItems.length;
    const newSelectAllState = !allSelected;
    cartEventEmitter.emit('toggleSelectAll', newSelectAllState);
    handleSelectAll(newSelectAllState);
  };

  return (
    <div className='cart-con'>
      <Navigation />
      <div className='cart-box'>
        <h1>Shopping Cart</h1>
        {loading ? (
          <p>Loading cart items...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : cartItems.length === 0 ? (
          <p className="cart-empty">Your cart is empty!</p>
        ) : (
          <div className='cart-table'>
            <table>
              <thead>
                <tr>
                  <th>
                    <form>
                      <input
                        type='checkbox'
                        checked={Object.keys(selectedItems).length === cartItems.length && cartItems.length > 0}
                        onChange={handleSelectAllChange}
                      />
                    </form>
                  </th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Sub-total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <CartProduct
                    key={item.product_code}
                    productName={item.product_name}
                    quantity={item.quantity}
                    price={item.price}
                    subTotal={item.sub_total}
                    productCode={item.product_code}
                    description={item.description}
                    brand={item.brand}
                    category={item.category}
                    size={item.size}
                    isSelected={!!selectedItems[item.product_code]}
                    toggleItemSelection={toggleItemSelection}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4">Total</td>
                  <td>${totalPrice.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            <div className='checkout-btncon'>
              <button className='checkout-btn' onClick={handleCheckout}>
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartContent;
