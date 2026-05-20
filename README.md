# Bien's Artesania - Database Setup Guide

## Overview
Your website now has a complete Node.js + Express + SQLite backend with the following features:

✅ **Products Database** - All 27 products stored in SQLite  
✅ **Order Management** - Save and track customer orders  
✅ **Site Content Management** - Store About section and other content  
✅ **Shopping Cart** - Dynamic cart with database persistence  
✅ **RESTful API** - Full API for frontend integration  

---

## Installation & Setup

### Step 1: Install Node.js
If you haven't already, download and install Node.js from https://nodejs.org/ (LTS version recommended)

### Step 2: Install Dependencies
Open PowerShell in this folder and run:

```powershell
npm install
```

This installs:
- **express** - Web server framework
- **sqlite3** - Database engine
- **cors** - Enable cross-origin requests
- **body-parser** - Parse JSON requests

### Step 3: Start the Server
```powershell
npm start
```

You should see:
```
🎨 Bien's Artesania server running on http://localhost:3000
📦 Database initialized and ready to use
```

---

## Database Schema

### Products Table
```
id (INTEGER) - Product ID
name (TEXT) - Product name
price (REAL) - Price in ₱
image (TEXT) - Image filename
category (TEXT) - Product category
stock (INTEGER) - Available stock (default: 100)
created_at (DATETIME) - Creation timestamp
```

### Orders Table
```
id (INTEGER) - Order ID
customer_name (TEXT) - Customer name
customer_email (TEXT) - Customer email
customer_phone (TEXT) - Customer phone
payment_method (TEXT) - Payment method (GCash/COD)
total (REAL) - Order total
status (TEXT) - Order status (pending/completed/cancelled)
created_at (DATETIME) - Order creation timestamp
```

### Order Items Table
```
id (INTEGER) - Item ID
order_id (INTEGER) - Associated order ID
product_id (INTEGER) - Associated product ID
product_name (TEXT) - Product name snapshot
quantity (INTEGER) - Quantity ordered
price (REAL) - Price per unit at time of order
```

### Site Content Table
```
id (INTEGER) - Content ID
section (TEXT) - Section identifier (unique)
title (TEXT) - Section title
content (TEXT) - Section content
updated_at (DATETIME) - Last updated timestamp
```

---

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Orders
- `POST /api/orders` - Create new order
  - Body: `{ items: [{id, name, price, quantity}], total, payment_method, customer_name, customer_email, customer_phone }`
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order with items
- `PUT /api/orders/:id` - Update order status
  - Body: `{ status: 'completed' | 'cancelled' | 'pending' }`

### Site Content
- `GET /api/content` - Get all site content
- `GET /api/content/:section` - Get specific content section
- `PUT /api/content/:section` - Update content
  - Body: `{ title, content }`

---

## How It Works

### Frontend (Your HTML/CSS/JS)
1. When the page loads, JavaScript fetches products from `/api/products`
2. Products are dynamically rendered in the grid
3. When a customer clicks "Add to Cart", the item is added to the local cart
4. When they click "Check Out", the cart data is saved to the database via `/api/orders`
5. The order is stored with all details (items, customer info, payment method)

### Backend (Node.js + Express)
- Serves the website files
- Provides REST API endpoints
- Manages SQLite database
- Automatically creates tables and inserts sample data on first run

### Database (SQLite)
- File: `biens_artesania.db` (created automatically in project folder)
- All data is persisted between server restarts
- Easy to query and modify using SQLite tools

---

## File Structure

```
RON/
├── server.js              # Express server & API routes
├── database.js            # SQLite setup & schema
├── package.json           # Node.js dependencies
├── Biens Artesania.html   # Updated frontend
├── script.js              # Updated with API calls
├── style.css              # Styling (unchanged)
├── biens_artesania.db     # SQLite database (auto-created)
└── [image files]          # Product images
```

---

## Usage Examples

### View All Products
```bash
curl http://localhost:3000/api/products
```

### View All Orders
```bash
curl http://localhost:3000/api/orders
```

### View Specific Order
```bash
curl http://localhost:3000/api/orders/1
```

### Update Order Status
```bash
curl -X PUT http://localhost:3000/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

---

## Database Browsing Tools

To view/edit your SQLite database directly:

### Option 1: SQLite Browser (Free)
Download from: https://sqlitebrowser.org/

### Option 2: VSCode Extension
Install "SQLite Viewer" extension in VS Code

### Option 3: Command Line
```powershell
sqlite3 biens_artesania.db
sqlite> SELECT * FROM products;
sqlite> SELECT * FROM orders;
```

---

## Troubleshooting

### Port Already in Use
If port 3000 is busy, edit `server.js` and change:
```javascript
const PORT = 3000; // Change to 3001, 5000, etc.
```

### Database Won't Start
- Make sure `database.js` is in the same folder
- Check that you have write permissions in the folder
- Delete `biens_artesania.db` and restart (it will be recreated)

### Products Not Loading
- Make sure server is running (`npm start`)
- Check browser console for errors (F12 > Console)
- Verify API is responding: `http://localhost:3000/api/products`

### Orders Not Saving
- Check that payment method is selected in dropdown
- Look at server console for error messages
- Verify cart has items before checkout

---

## Next Steps

### Customize the Database
Edit product information:
```javascript
// In database.js, modify the products array
const products = [
    { name: 'Your Item', price: 100, image: 'image.jpg', category: 'Charms' },
    // ...
];
```

### Add Admin Panel
Create an admin dashboard to:
- View/manage products
- View/update orders
- Edit site content
- View sales analytics

### Deploy to Production
Options:
- **Heroku** - Free tier, easy deployment
- **Replit** - Online IDE with hosting
- **Your own server** - Full control

---

## Support
For questions about your database setup, check the server console for error messages or review the API code in `server.js`.

Enjoy your new database-powered website! 🎨
