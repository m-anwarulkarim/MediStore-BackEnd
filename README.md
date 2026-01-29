## 🔧 পরিবর্তনগুলো:

### ✅ app.ts এ:

1. Review router add করা হয়েছে
2. Route organization আরো clear করা হয়েছে
3. PATCH method CORS এ add করা হয়েছে
4. `express.urlencoded()` middleware add করা হয়েছে
5. Error handler এ development mode এ stack trace দেখানো হবে
6. 404 handler এ method info add করা হয়েছে

### ✅ Router files এ:

1. সব route path consistency maintain করা হয়েছে
2. Role-based guards সঠিকভাবে apply করা হয়েছে
3. Route conflict issues solve করা হয়েছে
4. `/api/cart` prefix দিয়ে cart routes clear করা হয়েছে
5. `/api/reviews` prefix দিয়ে review routes add করা হয়েছে
6. Order routes এ `/my-orders`, `/seller/all`, `/admin/all` দিয়ে conflict এড়ানো হয়েছে
7. Seller profile routes এ `/profile` prefix consistency maintain করা হয়েছে

এখন আপনার API structure এরকম হবে:

```
GET  /                              → Health check
GET  /api/auth/me                   → Current user

// Categories (Public + Admin)
GET    /api/categories              → All categories
POST   /api/categories              → Create (Admin/Seller)
PATCH  /api/categories/:id          → Update (Admin)
DELETE /api/categories/:id          → Delete (Admin)

// Medicines (Public + Seller)
GET    /api/medicines               → All medicines (with filters)
GET    /api/medicines/:medicineId   → Single medicine
POST   /api/medicines               → Create (Seller)
PUT    /api/medicines/:medicineId   → Update (Seller)
DELETE /api/medicines/:medicineId   → Delete (Seller)

// Cart (Customer)
GET    /api/cart                    → Get my cart
POST   /api/cart                    → Add to cart
PUT    /api/cart/:cartItemId        → Update quantity
DELETE /api/cart/:cartItemId        → Remove item

// Orders (Customer + Seller + Admin)
GET    /api/orders/admin/all        → All orders (Admin)
GET    /api/orders/seller/all       → Seller orders (Seller)
GET    /api/orders/my-orders        → My orders (Customer)
GET    /api/orders/:orderId         → Order details
POST   /api/orders                  → Create order (Customer)
PATCH  /api/orders/:orderId/status  → Update status (Seller/Admin)

// Reviews (Public + Customer + Seller + Admin)
GET    /api/reviews/medicine/:medicineId  → Medicine reviews
GET    /api/reviews/seller/all            → Seller reviews (Seller)
POST   /api/reviews                       → Create review (Customer)
DELETE /api/reviews/:reviewId             → Delete review (Admin)

// Address (Customer/Seller + Admin)
GET    /api/address/admin/all       → All addresses (Admin)
GET    /api/address/my-addresses    → My addresses
GET    /api/address/:id             → Single address
POST   /api/address                 → Create address
PUT    /api/address/:id             → Update address
DELETE /api/address/:id             → Delete address

// Seller Profile (Seller + Admin)
GET    /api/seller/all              → All sellers (Admin)
GET    /api/seller/profile          → My profile (Seller)
POST   /api/seller/profile          → Create profile (Seller)
PUT    /api/seller/profile          → Update profile (Seller)

// Admin Users
GET    /api/admin/users             → All users
PATCH  /api/admin/users/:id         → Update user status
DELETE /api/admin/users/:userId     → Delete user
DELETE /api/users/me                → Delete own account
```
