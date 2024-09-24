const express = require('express');
const router = express.Router();
const db = require('../db');


// Function to generate a unique product code
const generateProductCode = async () => {
    const query = `SELECT MAX(CAST(SUBSTRING(product_code, 2) AS UNSIGNED)) AS maxCode FROM product WHERE product_code LIKE 'P%'`;
    const [rows] = await db.query(query);

    const maxCode = rows[0].maxCode || 0;
    const newCode = `P${String(maxCode + 1).padStart(3, '0')}`;

    return newCode;
};


// Route to add a product
router.post('/add-product', async (req, res) => {
    try {
        console.log('Request body:', req.body);

        const { productName, description, category, price, quantity, expirationDate, size } = req.body;

        console.log('Product details:');
        console.log('Name:', productName);
        console.log('Description:', description);
        console.log('Category ID:', category);
        console.log('Price:', price);
        console.log('Quantity:', quantity);
        console.log('Expiration Date:', expirationDate);
        console.log('Size:', size);

        // Generate unique product code
        const productCode = await generateProductCode();
        console.log('Generated product code:', productCode);

        const query = `
            INSERT INTO product (product_name, description, category_id, price, quantity, expiration_date, product_code, size)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [productName, description, category, price, quantity, expirationDate, productCode, size];

        console.log('Executing query:', query);
        console.log('With values:', values);

        await db.query(query, values);

        console.log('Product added successfully');
        res.status(200).send('Product added successfully');
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
});

// Route to get product categories
router.get('/product-category', async (req, res) => {
    try {
        let query = `
        SELECT
            category.category_id, 
            category.category_name
        FROM
            category
        `;

        const [rows] = await db.query(query);
        // Respond with product categories
        res.json(rows);
        console.error('output', rows);
    } catch (error) {
        console.error('Error fetching product categories:', error);
        res.status(500).send('Error fetching product categories');
    }
});



// Update Product Route
router.put('/admin-update-products/:product_code', async (req, res) => {
    const { product_code } = req.params;
    const { product_name, description, category_id, price, quantity, size, expiration_date, product_status, product_image } = req.body;



    // SQL query to update product details
    const query = `
        UPDATE product
        SET
            product_name = ?,
            description = ?,
            category_id = ?,
            price = ?,
            quantity = ?,
            size = ?,
            expiration_date = ?,
            product_status = ?,
            product_image = ?,
            product_update = NOW()
        WHERE product_code = ?;
    `;

    try {
        // Execute the query
        const [result] = await db.query(query, [
            product_name,
            description,
            category_id,
            price,
            quantity,
            size,
            expiration_date,
            product_status,
            product_image,
            product_code
        ]);

        // Check if the update was successful
        if (result.affectedRows > 0) {
            console.log('Product updated successfully', { product_code });
            res.json({ message: 'Product updated successfully' });
        } else {
            console.warn('Product not found', { product_code });
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error updating product details', { product_code, error: error.message });
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});



router.get('/admin-products-with-interaction', async (req, res) => {
    try {
        // Define thresholds for low stock and low interaction
        const LOW_STOCK_THRESHOLD = 10;
        const LOW_INTERACTION_THRESHOLD = 1;

        // Query to get the count of Top Products
        const [[{ total }]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM product
            WHERE interaction_cart >= ?
        `, [LOW_INTERACTION_THRESHOLD]);

        // Query to get product names with interaction_cart >= 1
        const [products] = await db.query(`
            SELECT product_name
            FROM product
            WHERE interaction_cart >= ?
        `, [LOW_INTERACTION_THRESHOLD]);

        // Query to get the total quantity of products
        const [[{ totalQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS totalQuantity
            FROM product
        `);

        // Query to get the count of low stock items
        const [[{ lowStockCount }]] = await db.query(`
            SELECT COUNT(*) AS lowStockCount
            FROM product
            WHERE quantity <= ?
        `, [LOW_STOCK_THRESHOLD]);

        // Query to get the total quantity of low stock items
        const [[{ lowStockQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS lowStockQuantity
            FROM product
            WHERE quantity <= ?
        `, [LOW_STOCK_THRESHOLD]);

        // Query to get the count of unpopular items (interaction_cart <= 0)
        const [unpopularProducts] = await db.query(`
            SELECT product_name
            FROM product
            WHERE interaction_cart <= 0
        `);

        // Query to get the count and total quantity of out-of-stock items
        const [[{ outOfStockCount }]] = await db.query(`
            SELECT COUNT(*) AS outOfStockCount
            FROM product
            WHERE quantity = 0
        `);

        const [[{ outOfStockQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS outOfStockQuantity
            FROM product
            WHERE quantity = 0
        `);

        // Query to get the count and total quantity of discontinued products
        const [[{ discontinuedCount }]] = await db.query(`
            SELECT COUNT(*) AS discontinuedCount
            FROM product
            WHERE product_status = 'discontinued'
        `);

        const [[{ discontinuedQuantity }]] = await db.query(`
            SELECT SUM(quantity) AS discontinuedQuantity
            FROM product
            WHERE product_status = 'discontinued'
        `);

        // Send response with all the gathered data
        res.json({
            total,
            totalQuantity,
            products: products.map(product => product.product_name),
            lowStockCount,
            lowStockQuantity,
            unpopularProducts: unpopularProducts.map(product => product.product_name),
            outOfStockCount,
            outOfStockQuantity,
            discontinuedCount,
            discontinuedQuantity
        });
    } catch (error) {
        console.error('Error fetching products data:', error);
        res.status(500).send('Error fetching products');
    }
});


router.get('/admin-products', async (req, res) => {
    try {
        // Fetch all products and their categories
        const [rows] = await db.query(`
            SELECT p.product_id, p.product_code, p.product_name, p.price ,p.description, p.quantity, c.category_name, p.product_image
            FROM product p
            INNER JOIN category c ON p.category_id = c.category_id
        `);

        // Respond with product details including categories
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});


router.get('/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT category_id, category_name FROM category');
        res.json({ categories: rows });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
});


module.exports = router;