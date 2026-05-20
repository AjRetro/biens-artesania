const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Convert SQLite placeholders (?) to PostgreSQL placeholders ($1, $2, etc)
function convertQueryPlaceholders(query, params) {
    if (!params || params.length === 0) {
        return { query, params };
    }
    
    let paramIndex = 1;
    let newQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    return { query: newQuery, params };
}

// Initialize database tables
async function initializeDatabase() {
    try {
        // Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Products table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                price NUMERIC(10, 2) NOT NULL,
                image TEXT,
                description TEXT,
                category TEXT,
                stock INTEGER DEFAULT 100,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Orders table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                customer_name TEXT,
                customer_email TEXT,
                customer_phone TEXT,
                payment_method TEXT,
                total NUMERIC(10, 2) NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Order items table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id),
                product_id INTEGER,
                product_name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price NUMERIC(10, 2) NOT NULL
            )
        `);

        // Site content table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS site_content (
                id SERIAL PRIMARY KEY,
                section TEXT UNIQUE,
                title TEXT,
                content TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Connected to PostgreSQL database');

        // Insert sample products if empty
        const productsResult = await pool.query('SELECT COUNT(*) as count FROM products');
        if (parseInt(productsResult.rows[0].count) === 0) {
            const products = [
                { name: 'Sea Shell Keychain', price: 75, image: 'seashell.jpg', category: 'Charms' },
                { name: 'Avocado Easel Charm', price: 75, image: 'avocado.jpg', category: 'Charms' },
                { name: 'Easel Charm', price: 75, image: 'sale3.jpg', category: 'Charms' },
                { name: 'Corn Easel Charm', price: 75, image: 'corn.jpg', category: 'Charms' },
                { name: 'Cutie Easel Charm', price: 75, image: 'cutie.jpg', category: 'Charms' },
                { name: 'Squid Easel Charm', price: 75, image: 'squid.jpg', category: 'Charms' },
                { name: 'Boquet Easel Charm', price: 75, image: 'boquet.jpg', category: 'Charms' },
                { name: 'Bread Easel Charm', price: 75, image: 'bread.jpg', category: 'Charms' },
                { name: 'Cap Easel Charm', price: 75, image: 'cap.jpg', category: 'Charms' },
                { name: 'Chili Easel Charm', price: 75, image: 'chili.jpg', category: 'Charms' },
                { name: 'Coconut Easel Charm', price: 75, image: 'coconut.jpg', category: 'Charms' },
                { name: 'Cutie Potato Easel Charm', price: 75, image: 'cutiepotato.jpg', category: 'Charms' },
                { name: 'Egg Easel Charm', price: 75, image: 'egg.jpg', category: 'Charms' },
                { name: 'Flowers Easel Charm', price: 75, image: 'flowers.jpg', category: 'Charms' },
                { name: 'Fries Easel Charm', price: 75, image: 'fries.jpg', category: 'Charms' },
                { name: 'Frog Easel Charm', price: 75, image: 'frog.jpg', category: 'Charms' },
                { name: 'Fruit Easel Charm', price: 75, image: 'fruit.jpg', category: 'Charms' },
                { name: 'Ice Cream Easel Charm', price: 75, image: 'icecream.jpg', category: 'Charms' },
                { name: 'Jellyfish Easel Charm', price: 75, image: 'jellyfish.jpg', category: 'Charms' },
                { name: 'Orange Bob Easel Charm', price: 75, image: 'orangebob.jpg', category: 'Charms' },
                { name: 'Pechay Easel Charm', price: 75, image: 'pechay.jpg', category: 'Charms' },
                { name: 'Pink Hat Easel Charm', price: 75, image: 'pinkhat.jpg', category: 'Charms' },
                { name: 'Ribbon Easel Charm', price: 75, image: 'ribbon.jpg', category: 'Charms' },
                { name: 'Basket Easel Charm', price: 75, image: 'basket.jpg', category: 'Charms' },
                { name: 'Starfish Easel Charm', price: 75, image: 'starfish.jpg', category: 'Charms' },
                { name: 'Tulip Easel Charm', price: 75, image: 'tulip.jpg', category: 'Charms' }
            ];
            
            for (const p of products) {
                await pool.query(
                    'INSERT INTO products (name, price, image, category) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
                    [p.name, p.price, p.image, p.category]
                );
            }
            console.log('✅ Products inserted into database');
        }

        // Insert default site content
        const contentResult = await pool.query('SELECT COUNT(*) as count FROM site_content');
        if (parseInt(contentResult.rows[0].count) === 0) {
            const content = [
                { section: 'about_small_batch', title: 'Small-Batch Quality', content: 'Every piece is made in small quantities so each product stays unique, personal, and carefully finished.' },
                { section: 'about_local_studio', title: 'Local Craft Studio', content: 'Created from a local studio using handcrafted techniques, natural materials, and gentle color palettes.' },
                { section: 'about_gifts', title: 'Gifts That Feel Special', content: 'Perfect for gifts, decor, or daily use — designed to feel cozy, warm, and memorable.' }
            ];
            
            for (const c of content) {
                await pool.query(
                    'INSERT INTO site_content (section, title, content) VALUES ($1, $2, $3) ON CONFLICT (section) DO NOTHING',
                    [c.section, c.title, c.content]
                );
            }
            console.log('✅ Site content inserted into database');
        }
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        process.exit(1);
    }
}

// Initialize on startup
initializeDatabase();

// Create wrapper object to match SQLite API for backward compatibility
const db = {
    query: (text, params, callback) => {
        const { query, params: convertedParams } = convertQueryPlaceholders(text, params);
        if (callback && typeof callback === 'function') {
            pool.query(query, convertedParams, callback);
        } else {
            return pool.query(query, convertedParams);
        }
    },
    get: (text, params, callback) => {
        const { query, params: convertedParams } = convertQueryPlaceholders(text, params);
        pool.query(query, convertedParams, (err, res) => {
            if (err) return callback(err);
            callback(null, res.rows[0]);
        });
    },
    all: (text, params, callback) => {
        const { query, params: convertedParams } = convertQueryPlaceholders(text, params);
        pool.query(query, convertedParams, (err, res) => {
            if (err) return callback(err);
            callback(null, res.rows);
        });
    },
    run: (text, params, callback) => {
        const { query, params: convertedParams } = convertQueryPlaceholders(text, params);
        pool.query(query, convertedParams, (err, res) => {
            if (err) return callback(err);
            callback.call({ lastID: res.rows[0]?.id }, null);
        });
    },
    prepare: (text) => {
        return {
            run: (params, callback) => {
                const { query, params: convertedParams } = convertQueryPlaceholders(text, params);
                pool.query(query, convertedParams, callback);
            },
            finalize: () => {}
        };
    }
};

module.exports = db;