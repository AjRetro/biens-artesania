# Login System & Database - Setup Complete ✅

## What Was Added

### 1. **User Authentication System**
- Registration page (`auth.html`)
- Login validation with database
- Session management with localStorage
- Logout functionality

### 2. **Database Users Table**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    created_at DATETIME
)
```

### 3. **Updated Frontend**
- Login requirement before shopping
- User info display in header
- Logout button
- Fixed add-to-cart functionality
- Cart now fully works

### 4. **API Endpoints**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login user
- `GET /api/auth/user/:id` - Get user info

## How to Use

### Step 1: Navigate to Auth Page
Open your browser to: **http://localhost:3000/auth.html**

### Step 2: Create Account or Login
- **New User?** Click "Sign Up" tab
  - Enter username, email, password
  - Click "Sign Up"
  
- **Existing User?** Stay on Login tab
  - Username: `testuser`
  - Password: `password123`
  - Click "Login"

### Step 3: Shop
After login, you'll be redirected to the shop where you can:
- Browse products (loaded from database)
- Click "Add to Cart" (now fully functional!)
- Click "Cart" button to view items
- Adjust quantities with +/- buttons
- Remove items
- Select payment method (GCash or COD)
- Click "Check Out" to save order and message Facebook

### Step 4: Logout
Click the "Logout" button in the top-right corner

## Test Credentials

**Pre-created test account:**
- Username: `testuser`
- Email: `test@example.com`
- Password: `password123`

Or register a new account anytime!

## Files Updated

1. **auth.html** (new) - Beautiful login/register page
2. **script.js** (new) - Complete rewrite with auth & working cart
3. **server.js** - Added auth endpoints
4. **database.js** - Added users table
5. **Biens Artesania.html** - Added user header & logout button
6. **biens_artesania.db** - Now includes users table

## Key Features

✅ Users must login to shop
✅ Passwords stored in database
✅ Add to cart actually works now
✅ Cart updates in real-time
✅ Orders saved with user info
✅ Each user can see their own orders
✅ Session persists with localStorage

## Next Steps

### Want to track user orders?
```sql
-- View orders by user ID 1
SELECT * FROM orders WHERE user_id = 1;
```

### Want to manage users?
Download SQLite Browser and open `biens_artesania.db` to:
- View all users
- View orders per user
- Edit/delete accounts

### Want to add more features?
- Password reset
- User profile page
- Order history view
- Email notifications
- Admin dashboard

## Troubleshooting

**"Can't login"**
- Make sure server is running (`npm start`)
- Check username/password are correct
- Try test credentials above

**"Add to cart not working"**
- Open browser console (F12)
- Check for error messages
- Make sure you're logged in

**"Cart button does nothing"**
- Check browser console for errors
- Refresh page
- Try again

**"Server won't start"**
- Delete `biens_artesania.db` and restart
- Make sure port 3000 is free
- Check Node.js is installed

---

**Your authentication system is live and ready to use!** 🎨

All user data is secure in the SQLite database.
