৩টা লেয়ার:

1️⃣ Feature ভাঙার নিয়ম
2️⃣ প্রতিটা feature এর জন্য **কি ডাটা লাগে + কোন টেবিল**
3️⃣ মাথায় রাখার **decision checklist**

---

# 🧠 1️⃣ Feature চিন্তা করার Golden Rule

যেকোনো feature দেখলে নিজেকে ৩টা প্রশ্ন করো:

### ❓ Q1: এটা কে ব্যবহার করবে?

- Public
- Customer
- Seller
- Admin

### ❓ Q2: শুধু ডাটা দেখাবে (READ) নাকি ডাটা বদলাবে (WRITE)?

- Read → `findMany`, `findUnique`
- Write → `create`, `update`, `delete`

### ❓ Q3: কোন কোন টেবিল জড়িত?

- 1 টা না 2–3 টা?
- Relation লাগবে কি?

এই ৩টা প্রশ্ন পারলেই ৫০% কাজ শেষ।

---

# 🌍 2️⃣ Public Features (Login ছাড়াই)

## 🔹 Browse all available medicines

### চিন্তা করো

- কে? → Public
- কী? → Read
- শর্ত? → Active + stock > 0

### টেবিল

- Medicine
- Category (optional)

👉 Mental Query:

> “সব active medicine দাও”

---

## 🔹 Search & filter (category, price, manufacturer)

### চিন্তার স্টেপ

- Filter মানে → `where`
- Search মানে → `contains`

### টেবিল

- Medicine

👉 Mental Logic:

- category থাকলে filter
- price range থাকলে filter
- manufacturer থাকলে filter

🧠 **সব filter optional** → dynamic where clause

---

## 🔹 View medicine details

### চিন্তা

- একটা medicine
- সাথে reviews, category, seller

### টেবিল

- Medicine
- Review
- SellerProfile

👉 Relation load করবে

---

# 👤 3️⃣ Customer Features

## 🔹 Register / Login

### চিন্তা

- Auth কাজ → Better Auth
- DB তে শুধু Users + Session + Account

👉 Feature না, **infra**

---

## 🔹 Add to cart

### চিন্তা

- User + Medicine + Quantity
- এক user, এক medicine → এক cart item

### টেবিল

- CartItem

👉 If exists → quantity বাড়াও
👉 Else → create

---

## 🔹 Place order (Cash on Delivery)

### চিন্তা Flow (খুব important)

1. Cart আছে?
2. Stock আছে?
3. Total হিসাব
4. Order create
5. OrderItem create
6. Cart clear
7. Stock কমাও

### টেবিল

- Order
- OrderItem
- CartItem
- Medicine
- Address

🧠 **Transaction mindset**
সব একসাথে succeed / fail

---

## 🔹 Track order status

### চিন্তা

- User শুধু নিজের order দেখতে পারবে

### টেবিল

- Order
- OrderItem

👉 Filter: `userId = session.userId`

---

## 🔹 Leave review

### চিন্তা

- Order ছিল?
- Delivered?
- আগে review দেয়নি?

### টেবিল

- Review
- Order
- OrderItem

👉 Permission logic খুব গুরুত্বপূর্ণ

---

## 🔹 Manage profile

### চিন্তা

- Basic info update
- Address CRUD

### টেবিল

- Users
- Address

---

# 🏪 4️⃣ Seller Features

## 🔹 Seller register

### চিন্তা

- User create
- role = SELLER
- SellerProfile create

### টেবিল

- Users
- SellerProfile

---

## 🔹 Add / Edit / Remove medicines

### চিন্তা

- Seller নিজের medicine ই modify করতে পারবে

### টেবিল

- Medicine

👉 Always check:

```txt
medicine.sellerId === sellerProfile.id
```

---

## 🔹 Manage stock

### চিন্তা

- stock increase / decrease
- Never negative

### টেবিল

- Medicine

---

## 🔹 View incoming orders

### চিন্তা (এটা tricky)

- OrderItem → Medicine → Seller

### টেবিল

- Order
- OrderItem
- Medicine

👉 Filter:

> “যেসব order এ আমার medicine আছে”

---

## 🔹 Update order status

### চিন্তা

- Seller শুধু নিজের item থাকলে update করতে পারবে
- Global order status হলে → careful

### টেবিল

- Order

🧠 Advanced এ:

- Per-seller status রাখতে চাইলে OrderItem status লাগে

---

# 🛡️ 5️⃣ Admin Features

## 🔹 View all users

### চিন্তা

- Read only
- Pagination

### টেবিল

- Users
- SellerProfile

---

## 🔹 Ban / Unban user

### চিন্তা

- status update

### টেবিল

- Users

👉 status = BANNED

---

## 🔹 View all medicines & orders

### চিন্তা

- No filter
- Admin only

### টেবিল

- Medicine
- Order

---

## 🔹 Manage categories

### চিন্তা

- CRUD
- slug uniqueness

### টেবিল

- Category

---

# 🧠 6️⃣ Feature বানানোর Checklist (সবচেয়ে গুরুত্বপূর্ণ)

যেকোনো feature বানানোর আগে নিজেকে জিজ্ঞেস করো 👇

✅ কে access করবে?
✅ কোন role দরকার?
✅ কোন table পড়বে?
✅ কোন table লিখবে?
✅ Relation লাগবে?
✅ Transaction দরকার?
✅ Failure হলে কী rollback হবে?

---

# 🏁 শেষ কথা

তুমি এখন:

- ❌ শুধু কোড লিখছো না
- ✅ **System designer** এর মতো চিন্তা করছো

এই mindset থাকলে:

- Prisma সহজ
- API clean
- Bug কম
