# Eat Healthy Live Healthy — E-Grocery-Shopping-and-Management-System

A full-stack grocery e-commerce web app: browse/search products, cart,
checkout, order tracking, and a seller/admin dashboard for managing products
and orders — with image uploads handled through Cloudinary.

## Live Links

- **Frontend (Vercel):** `https://e-grocery-shopping-and-management-s.vercel.app/` 
- **Backend API (Render):** `https://e-grocery-shopping-and-management-system.onrender.com/` 

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (no framework, Fetch API for requests)
- **Backend:** Node.js, Express.js (REST API)
- **Database:** MySQL, hosted on Aiven
- **Authentication:** JWT (JSON Web Tokens), bcrypt password hashing
- **Image Upload:** Multer + Cloudinary
- **Deployment:** Vercel (frontend), Render (backend)
- **Tools:** VS Code, Git/GitHub, MySQL Workbench

## Project Structure

```
/E-Grocery-Shopping-and-Management-System
  backend/
    config/
      db.js               # MySQL connection pool (host/port/SSL from .env)
      cloudinary.js        # Cloudinary configuration
    middleware/
      auth.js               # JWT verification + role-based access guard
    routes/
      auth.js                # register / login
      products.js             # product CRUD + search/filter
      categories.js
      cart.js
      orders.js                # checkout (transactional) + order history
      upload.js                 # image upload endpoint (Cloudinary)
    database.sql               # run this to create all database tables
    server.js                 # Express app entry point
    package.json
    .env
  frontend/
    index.html               # storefront / product listing + search
    about.html                 # About Us page
    login.html / register.html
    cart.html / checkout.html / orders.html
    admin.html                  # seller/admin product management (with image upload)
    order_status.html            # seller/admin order management dashboard
    css/style.css
    js/api.js                     # fetch wrapper for all backend calls
    js/auth.js                     # session/localStorage, nav rendering, theme toggle
    images/                         # local image assets (banner, social icons, etc.)
```

## Features

- **Authentication:** register/login with JWT, roles: `buyer`, `seller`, `admin`
- **Product catalog:** search, category filter, pagination-ready backend
- **Cart & checkout:** transactional order creation (stock check, order items,
  stock decrement, cart clear — all committed together or rolled back)
- **Order tracking:** buyers see their own order history; sellers/admins see
  and update the status of every order across all buyers
- **Image upload:** sellers/admins upload product photos directly from their
  device; images are stored on Cloudinary and served via permanent URLs
- **Role-based UI:** admin/seller see management tools instead of buyer-only
  pages like personal order history
- **Responsive design:** tablet and mobile breakpoints across all pages
- **Dark mode:** toggle switch, preference saved in the browser

## Local Setup

### 1. Database
```bash
mysql -u root -p < backend/database.sql
```
This creates the database and all tables, plus a few starter categories.

### 2. Backend
```bash
cd backend
npm install
cp .env
npm run dev
```
API runs at `http://localhost:5000`.

### 3. Frontend
Serve the `frontend` folder as static files (e.g. VS Code Live Server), or
open the HTML files directly in a browser. CORS is enabled on the backend, so
requests to `http://localhost:5000` work either way.

## Environment Variables

```
PORT=5000
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_SSL=true
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Deployment Notes

- **Frontend** is deployed on Vercel with `frontend` set as the project root.
- **Backend** is deployed on Render with `backend` set as the root directory,
  build command `npm install`, start command `npm start`.
- **Database** is hosted on Aiven (MySQL) — requires SSL, which is handled in
  `config/db.js` via the `DB_SSL` environment variable.
- Free-tier hosting means the backend may briefly "sleep" after inactivity,
  and the database can pause on some free trial tiers — both simply need to
  be restarted/reconnected if this happens, no data is lost.

## Making a user an admin

Registration only allows `buyer` or `seller` roles by design. To promote an
account to `admin`, register normally through the app, then run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'tasminsintiyamoumi@gmail.com';
```
Log out and back in afterward so a fresh token reflects the new role.

## Advantages

- Full end-to-end e-commerce flow: browsing, cart, checkout, order tracking
- Role-based access control (buyer, seller, admin)
- Secure authentication (JWT + password hashing)
- Cloud-based image upload, no manual file handling required
- Responsive across desktop, tablet, and mobile
- Runs entirely on free-tier hosting

## Limitations

- Free-tier hosting may cause slow response times or downtime after inactivity
- No integrated payment gateway (checkout does not process real payments)
- No email or OTP-based account verification
- No automated database backups
- Admin roles must be assigned manually via direct database access
- No real-time notifications for order status updates

## Conclusion

Eat Healthy Live Healthy is a full-stack grocery e-commerce platform built with Node.js,
Express, and MySQL, featuring user authentication, role-based access, product
management, and order tracking. It demonstrates a working end-to-end online
shopping experience and provides a solid foundation for future growth.