# Quick Start Guide

## ✅ Your Database is Ready!

Your Bien's Artesania website now has a complete backend with:

### Database Features
- **26 Products** stored in SQLite database
- **Order Management** - Every checkout saves to the database
- **Site Content Management** - All text is now in the database
- **RESTful API** - Full backend to power your frontend

---

## 🚀 To Start Using Your Website

### 1. Keep the Server Running
The server is currently running in your terminal. **Keep this window open** for your website to work.

If you close it, run this again:
```powershell
cd "c:\Users\L470\Documents\a\Website For FIS-20260505T141754Z-3-001\RON"
npm start
```

### 2. Open Your Website
Once server shows `🎨 Bien's Artesania server running on http://localhost:3000`

Open in your browser: **http://localhost:3000/Biens%20Artesania.html**

### 3. Test It Out
- Browse products (fetched from database)
- Add items to cart
- Click "Check Out" to save order to database
- View order in database

---

## 📊 Database Files

Your database file: `biens_artesania.db` (auto-created)

Contains:
- ✅ 26 products with names, prices, images
- ✅ Orders with customer details
- ✅ Order items with quantities
- ✅ Site content (About sections, contact info)

---

## 🔌 API Endpoints

### Test in Browser or Postman

**Get all products:**
```
http://localhost:3000/api/products
```

**Get all orders:**
```
http://localhost:3000/api/orders
```

**View specific order:**
```
http://localhost:3000/api/orders/1
```

---

## 📖 Full Documentation

See `README.md` in your project folder for:
- Complete API reference
- Database schema details
- How to view/edit database
- Troubleshooting
- Next steps (admin panel, deployment, etc.)

---

## 💡 What's Different Now

**Before (Frontend Only):**
- Products were hardcoded in HTML
- No order history
- No data persistence

**Now (Full Backend):**
- Products in SQLite database ✅
- Orders automatically saved ✅
- Customer data persisted ✅
- Easy to manage & scale ✅

---

## 🎯 Next Steps

1. **Browse your database** → Download SQLite Browser from https://sqlitebrowser.org/
2. **Customize products** → Edit database with new items
3. **Track orders** → See all customer orders in database
4. **Build admin panel** → Manage orders & content online
5. **Deploy** → Put live on web server (see README)

---

**Your server is running! Enjoy your new database-powered website! 🎨**
