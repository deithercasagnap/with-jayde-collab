import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { cartEventEmitter } from './eventEmitter'; // Import the event emitter
import { Container, Navbar, Nav, Form, Button, FormControl } from 'react-bootstrap';
import logo from '../assets/img/logo.png'
import { SlMagnifier } from "react-icons/sl";
import { IoCartOutline } from "react-icons/io5";

import './Navigation.css'

const Navigation = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    // Fetch cart item count
    const fetchCartItemCount = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get('http://localhost:5000/cart-item-count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200) {
                setCartItemCount(response.data.itemCount);
            }
        } catch (error) {
            console.error('Error fetching cart item count:', error.response ? error.response.data : error.message);
        }
    };

    // Validate token and user session
    const validateToken = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoggedIn(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/validate-token', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200) {
                setIsLoggedIn(true);
                setUsername(localStorage.getItem('username') || '');
                setFirstName(localStorage.getItem('first_name') || ''); // Retrieve first_name
                fetchCartItemCount(); // Fetch cart count on valid session
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('Error validating token:', error.response ? error.response.data : error.message);
            setIsLoggedIn(false);
        }
    };

    // Set up event listener for cart updates
    useEffect(() => {
        validateToken();

        // Subscribe to cart updates
        cartEventEmitter.on('cartUpdated', fetchCartItemCount);

        // Cleanup event listener on component unmount
        return () => {
            cartEventEmitter.off('cartUpdated', fetchCartItemCount);
        };
    }, []);

    // Handle user logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        localStorage.removeItem('first_name'); // Remove first_name
        setUsername('');
        setFirstName('');
        setIsLoggedIn(false);
        navigate('/login');
    };

    // Navigate to cart or login if not logged in
    const handleCartClick = () => {
        if (isLoggedIn) {
            navigate('/cart');
        } else {
            navigate('/login');
        }
    };

    // Handle profile click to navigate to transaction page
    const handleProfileClick = () => {
        navigate('/user/purchase');
    };
 
    // Define navigation links
    const commonLinks = [
        { id: 1, page: "Shop", link: "/shop" },
        { id: 2, page: "About Us", link: "/about-us" },
        { id: 3, page: `Cart (${cartItemCount})`, link: "#" }
    ];

    return (
        <div>
        
            <nav class="navbar navbar-expand-lg ">
                <div class="container-fluid">
                    <div class="d-flex justify-content-between align-items-center w-100">
                    
                    <div class="col-auto">
                        <a class="navbar-brand ms-2 text-pink fw-bold " href="/">
                        <img src={logo} alt="Logo" width="60" height="60" class="d-inline-block align-text-center me-2" />
                        N&B Beauty Vault
                        </a>
                    </div>
                    
                    <div class="col-auto">
                        <form class="d-flex" role="search">
                        <input class="search-input form-control rounded-0" type="search" placeholder="Look for your favorite haircare product..." aria-label="Search" />
                        <button class="btn bg-pink rounded-0" type="submit"> <SlMagnifier class="text-white fw-bold"/></button>
                        </form>
                    </div>
                    
                    <div class="col-auto">
                        <ul class="navbar-nav d-flex flex-row gap-5">
                            {commonLinks.map((data) => (
                                            <li key={data.id} class="nav-item">
                                                <a class="nav-link" href={data.link} onClick={data.id === 3 ? handleCartClick : undefined}>{data.page}</a>
                                            </li>
                                        ))}
                                        {!isLoggedIn ? (
                                            <>
                                                {/* <li class="nav-item">
                                                    <a class="nav-link" aria-current="page" href="#">Shop</a>
                                                </li>
                                                <li class="nav-item">
                                                    <a class="nav-link" aria-current="page" href="#">About Us</a>
                                                </li>
                                                <li class="nav-item">
                                                    <a class="nav-link" href="#"><IoCartOutline class="text-lg" width="40" height="40"/>Cart</a>
                                                </li> */}
                                                <li class="nav-item">
                                                    <a class="nav-link" href="/signup">Signup</a>
                                                </li>
                                                <li class="nav-item">
                                                    <a class="nav-link bg-pink rounded-2 px-2 text-white" href="/login">Login</a>
                                                </li>
                                                </>
                                    ) : (
                                        <>
                                            <li class="nav-item"><span class="nav-link" onClick={handleProfileClick}>Hi! {firstName}</span></li>
                                            <li class="nav-item"><button class="nav-link" onClick={handleLogout}>Logout</button></li>
                                        </>
                                    )}
                        </ul>
                    </div>

                    </div>
                </div>
            </nav>
            <hr/>

        </div>
    );
};

export default Navigation;
