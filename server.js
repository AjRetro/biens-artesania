require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Create uploads folder if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Landing page - shop
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Biens Artesania.html'));
});

// ===== AUTHENTICATION API =====
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password required' });
    }
    db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?) RETURNING id',
        [username, email, password],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Username or email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ success: true, userId: this.lastID, message: 'User registered successfully' });
        }
    );
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    db.get(
        'SELECT id, username, email FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(401).json({ error: 'Invalid username or password' });
            res.json({ success: true, user });
        }
    );
});

app.get('/api/auth/user/:id', (req, res) => {
    db.get('SELECT id, username, email FROM users WHERE id = ?', [req.params.id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});

// ===== PRODUCTS API =====
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY created_at DESC', [], (err, products) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(products);
    });
});

app.get('/api/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    });
});

// ===== ORDERS API =====
app.post('/api/orders', (req, res) => {
    const { items, total, payment_method, customer_name, customer_email, customer_phone, user_id } = req.body;
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain items' });
    }
    db.run(
        'INSERT INTO orders (customer_name, customer_email, customer_phone, payment_method, total, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
        [customer_name || 'Guest', customer_email || '', customer_phone || '', payment_method, total, 'pending', user_id || null],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            const orderId = this.lastID;
            const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)');
            let completed = 0;
            items.forEach(item => {
                stmt.run([orderId, item.id || null, item.name, item.quantity, item.price], (err) => {
                    if (err) console.error('Error inserting order item:', err);
                    completed++;
                    if (completed === items.length) {
                        stmt.finalize();
                        res.status(201).json({ success: true, orderId, message: 'Order created successfully' });
                    }
                });
            });
        }
    );
});

app.get('/api/orders/user/:userId', (req, res) => {
    db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId], async (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Fetch items for each order
        for (let order of orders) {
            await new Promise((resolve) => {
                db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id], (err, items) => {
                    order.items = items || [];
                    resolve();
                });
            });
        }
        
        res.json(orders);
    });
});

app.get('/api/orders/:id', (req, res) => {
    db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        db.all('SELECT * FROM order_items WHERE order_id = ?', [req.params.id], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...order, items });
        });
    });
});

app.get('/api/orders', async (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', [], async (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Fetch items for each order
        for (let order of orders) {
            await new Promise((resolve) => {
                db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id], (err, items) => {
                    order.items = items || [];
                    resolve();
                });
            });
        }
        
        res.json(orders);
    });
});

app.put('/api/orders/:id', (req, res) => {
    const { status } = req.body;
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Order updated' });
    });
});

// ===== SITE CONTENT API =====
app.get('/api/content', (req, res) => {
    db.all('SELECT * FROM site_content', [], (err, content) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(content);
    });
});

app.get('/api/content/:section', (req, res) => {
    db.get('SELECT * FROM site_content WHERE section = ?', [req.params.section], (err, content) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!content) return res.status(404).json({ error: 'Content not found' });
        res.json(content);
    });
});

app.put('/api/content/:section', (req, res) => {
    const { title, content } = req.body;
    db.run(
        'UPDATE site_content SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE section = ?',
        [title, content, req.params.section],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Content updated' });
        }
    );
});

// ==================== ADMIN API (with token check) ====================
const ADMIN_TOKEN = 'admin_special_token_2025';

// Middleware to verify admin token
function verifyAdminToken(req, res, next) {
    const token = req.headers['admin-token'];
    if (token === ADMIN_TOKEN) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized - Invalid admin token' });
    }
}

// Get all orders with items (admin only)
app.get('/api/admin/orders', verifyAdminToken, async (req, res) => {
    db.all(`
        SELECT o.*, u.username as user_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
    `, [], async (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Fetch items for each order
        for (let order of orders) {
            await new Promise((resolve) => {
                db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id], (err, items) => {
                    order.items = items || [];
                    resolve();
                });
            });
        }
        
        res.json(orders);
    });
});

// Update order status (admin only)
app.put('/api/admin/orders/:id', verifyAdminToken, (req, res) => {
    const { status } = req.body;
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Get all registered users (admin only)
app.get('/api/admin/users', verifyAdminToken, (req, res) => {
    db.all('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC', [], (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(users);
    });
});

// ===== ADMIN PRODUCTS API =====
// Get all products (admin only)
app.get('/api/admin/products', verifyAdminToken, (req, res) => {
    db.all('SELECT * FROM products ORDER BY created_at DESC', [], (err, products) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(products);
    });
});

// Upload product image
app.post('/api/admin/upload', verifyAdminToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl, filename: req.file.filename });
});

// Add new product (admin only)
app.post('/api/admin/products', verifyAdminToken, (req, res) => {
    const { name, price, image } = req.body;
    if (!name || !price || !image) {
        return res.status(400).json({ error: 'Name, price, and image are required' });
    }
    db.run(
        'INSERT INTO products (name, price, image) VALUES (?, ?, ?) RETURNING id',
        [name, price, image],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Product name already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ success: true, productId: this.lastID, message: 'Product added successfully' });
        }
    );
});

// Update product (admin only)
app.put('/api/admin/products/:id', verifyAdminToken, (req, res) => {
    const { name, price, image } = req.body;
    if (!name || !price || !image) {
        return res.status(400).json({ error: 'Name, price, and image are required' });
    }
    db.run(
        'UPDATE products SET name = ?, price = ?, image = ? WHERE id = ?',
        [name, price, image, req.params.id],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Product name already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Product updated successfully' });
        }
    );
});

// Delete product (admin only)
app.delete('/api/admin/products/:id', verifyAdminToken, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Product deleted successfully' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎨 Bien's Artesania server running on port ${PORT}`);
    console.log('📦 Database initialized and ready to use');
});