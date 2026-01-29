# 🏥 MediStore Backend API

MediStore is a **Medicine E-Commerce Backend API** built with a role-based system for  
**Admin, Seller, and Customer** users.

This backend allows users to:

- Browse and purchase medicines
- Manage cart and orders
- Submit reviews and ratings
- Manage addresses and seller profiles
- Control the entire system through admin access

---

## 🚀 Live Project

- **Backend URL:**  
  https://backend-three-pi-86.vercel.app/

- **GitHub Repository:**  
  https://github.com/m-anwarulkarim/MediStore-BackEnd

---

## 🛠 Tech Stack

- **Runtime:** Bun / Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Better Auth
- **Deployment:** Vercel

---

## 🔐 Authentication & Authorization

Authentication in MediStore is handled using **Better Auth**.

- Secure authentication and session management handled by Better Auth
- Role-based access control:
  - **ADMIN** – Full system access
  - **SELLER** – Manage medicines, orders, reviews, and seller profile
  - **CUSTOMER** – Manage cart, orders, reviews, and addresses
- Protected routes require a valid authenticated session
- Role permissions are enforced at the API level

---

## 📌 API Endpoints

### 🔍 Health & Auth

```

GET  /                      → Health check
GET  /api/auth/me           → Get current logged-in user

```

---

### 📂 Categories (Public + Admin)

```

GET    /api/categories        → Get all categories
POST   /api/categories        → Create category (Admin/Seller)
PATCH  /api/categories/:id    → Update category (Admin)
DELETE /api/categories/:id    → Delete category (Admin)

```

---

### 💊 Medicines (Public + Seller)

```

GET    /api/medicines                 → Get all medicines (with filters)
GET    /api/medicines/:medicineId     → Get single medicine
POST   /api/medicines                 → Create medicine (Seller)
PUT    /api/medicines/:medicineId     → Update medicine (Seller)
DELETE /api/medicines/:medicineId     → Delete medicine (Seller)

```

---

### 🛒 Cart (Customer)

```

GET    /api/cart              → Get my cart
POST   /api/cart              → Add item to cart
PUT    /api/cart/:cartItemId  → Update item quantity
DELETE /api/cart/:cartItemId  → Remove item from cart

```

---

### 📦 Orders (Customer + Seller + Admin)

```

GET    /api/orders/admin/all        → Get all orders (Admin)
GET    /api/orders/seller/all       → Get seller orders (Seller)
GET    /api/orders/my-orders        → Get my orders (Customer)
GET    /api/orders/:orderId         → Get order details
POST   /api/orders                  → Create order (Customer)
PATCH  /api/orders/:orderId/status  → Update order status (Seller/Admin)

```

---

### ⭐ Reviews (Public + Customer + Seller + Admin)

```

GET    /api/reviews/medicine/:medicineId  → Get medicine reviews
GET    /api/reviews/seller/all            → Get seller reviews (Seller)
POST   /api/reviews                       → Create review (Customer)
DELETE /api/reviews/:reviewId             → Delete review (Admin)

```

---

### 🏠 Address (Customer/Seller + Admin)

```

GET    /api/address/admin/all     → Get all addresses (Admin)
GET    /api/address/my-addresses  → Get my addresses
GET    /api/address/:id           → Get single address
POST   /api/address               → Create address
PUT    /api/address/:id           → Update address
DELETE /api/address/:id           → Delete address

```

---

### 🧑‍⚕️ Seller Profile (Seller + Admin)

```

GET    /api/seller/all        → Get all sellers (Admin)
GET    /api/seller/profile   → Get my seller profile
POST   /api/seller/profile   → Create seller profile
PUT    /api/seller/profile   → Update seller profile

```

---

### 🛡 Admin Users

```

GET    /api/admin/users           → Get all users
PATCH  /api/admin/users/:id       → Update user status
DELETE /api/admin/users/:userId   → Delete user
DELETE /api/users/me              → Delete own account

```

---

## ✅ Features Overview

- Role-based access control (Admin, Seller, Customer)
- Secure authentication & session management via Better Auth
- Seller & customer-specific workflows
- Complete order lifecycle management
- Review and rating system
- Clean, scalable, and maintainable backend architecture

---

## 📌 Project Status

✅ Backend Complete  
🚀 Production Ready  
🌐 Deployed on Vercel

---

## 👨‍💻 Author

**Anwarul Karim**  
GitHub: *https://github.com/m-anwarulkarim*
