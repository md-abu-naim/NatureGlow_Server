# 🌿 NatureGlow - Organic Skincare & Beauty Products

### Live URL: [NatureGlow](https://natureglow-740e8.web.app)
### Frontend Repo: [Client Link](https://github.com/md-abu-naim/NatureGlow)

## 📌 Overview
NatureGlow is a modern and user-friendly e-commerce website where customers can easily browse, search, filter, and purchase natural and organic skincare and beauty products. The project is built with a responsive design and dynamic features, ensuring a seamless experience across both desktop and mobile devices.

# NatureGlow API Overview
This backend API powers the Product Management, Order Management, User Management, and Review System with a Role-Based Dashboard for administrators, users, and other roles. It provides secure authentication, role-based access control, and a structured way to handle e-commerce operations.

---
## 🔑 Main Features
### 1. User Management (Authentication & Roles)
- **User Registration & Login** with secure password hashing.
- **Role-Based Access Control** (Admin, User, etc.).
- Manage user profiles, update roles, and delete accounts.
- Search users by name for quick management.
- **User Body:**
  ```
  {
    "_id": "6896e1bd3a51be2e06e56f84",
    "name": "Rahim Uddin",
    "email": "rahim@example.com",
    "profile": "https://randomuser.me/api/portraits/men/1.jpg",
    "status": "Active",
    "createdAt": "8/3/2025",
    "role": "User",
    "lastLogin": "8/1/2025",
    "address": "123 Mirpur Road, Dhaka, Bangladesh",
    "phone": "+880-1711-123456"
    "cover": "https://randomuser.me/api/portraits/men/1.jpg"
  },
  ```

  ### 2. Product Management
  - Add new products with **name, price, category, status, image, description,** and **features**.
  - Update or delete existing products.
  - Search products by name.
  - Fetch products for display in frontend shop pages.
  - **Product Body:**
    ```
     {
         "_id": "6896e1bd3a51be2e06e56f84",
        "name": "Green Tea Cream",
        "image": "https://i.postimg.cc/RVNGzwQD/Soothing-Green-Tea-Face-Cream.jpg",
        "shortBio": "Calms sensitive skin & controls oil.",
        "description": "This lightweight face cream is infused with green tea and aloe vera to soothe redness, hydrate skin, and reduce oil build-up.",
        "features": [
         "Ideal for acne-prone skin",
         "Non-comedogenic formula",
         "Day and night use"
       ],
      "price": 8.50,
      "status": "In Stock",
      "category": "Face Care",
      "totalSold": 12,
    }
    ```

    ### 3. Order Management
    - Place orders for one or multiple products.
    - Track **order status** (e.g., Pending, In Progress, Delivered, Cancelled).
    - Update or delete orders.
    - View detailed order information (customer info, product list, total price).
    - **Order Body:**
      ```
      {
       "_id": ""5f1b827c1a938c53a8c3d9b5",
       "customerName": "Mehedi Hasan",
       "customerImage": "https://i.pravatar.cc/150?img=11",
       "email": "mehedi@example.com",
       "address": "Chittagong",
       "phone": "+8801300022244",
       "paymentStatus": "Unpaid",
       "orderStatus": "In Progress",
      "date": "8/3/2025",
      "products": [
      {
        "_id": "5f1b827c1a938c53a8c3d9b5",
        "name": "Cocoa Body Lotion",
        "image": "https://i.postimg.cc/WbbCqDmG/Cocoa-Butter-Body-Lotion.jpg",
        "shortBio": "Deep moisturization for dry skin.",
        "description": "Enriched with pure cocoa butter and vitamin E, this lotion provides 24-hour hydration and improves skin elasticity.",
        "features": [
          "Non-greasy texture",
          "Long-lasting hydration",
          "Mild vanilla scent"
        ],
        "price": 7.20,
        "status": "Low Stock",
        "category": "Body Care"
      }
      ],
      "totalPrice": 7.20
      },   
  ```

### 4. Review System
- Add customer reviews for purchased products.
- Fetch and display product reviews.
- **Review Body:**
  ```
  {
    "_id": ""5f1b827c1a938c53a8c3d9b5",
    "product_id": "68922d937dbe256d76f607e6",
    "name": "Riya Akter",
    "title": "Lifestyle Blogger",
    "profile": "https://i.postimg.cc/B6PjqBMM/Lip-Care.png",
    "review": "I’m obsessed with the packaging and the glow these products give! Minimal, natural, and affordable.",
    "rating": 5
  },
  ```

## Technology Stack
- **Backend Framework:** Node.js with Express.js
- **Database:** MongoDB
- **Error Handling:** Centralized middleware
- **Language:** JavaScript

## 
```bash
# Clone the repository
git clone https://github.com/md-abu-naim/NatureGlow_Server.git

# Navigate to project folder
cd natureglow-server

# Install dependencies
npm install

# Create .env file and add the following variables
USER_NAME=NatureGlow
USER_PASS=4YqKmdVPF96wQYai

ACCESS_TOKEN_SECRET=869cf55aca3bf26557fffe8a71a270fdc4c72531ba4f2e63ac31c772abfca3ab436872a8d0081b783e7a8673646ff85ca856ac0da70cf08faneb253da5ba519f

# Start the server
nodemon start
```



## 📡 API Endpoints

| Module    | Endpoint                     | Method | Description                                           | Auth / Role Required |
|-----------|-----------------------------|--------|-------------------------------------------------------|--------------------|
| **User**  | `/users`                     | GET    | Get all users (searchable by name)                  | ✅ Token + Admin    |
|           | `/user/:email`               | GET    | Get user by email                                   | ✅ Token            |
|           | `/user/admin/:email`         | GET    | Check if user is Admin                               | ✅ Token            |
|           | `/user`                      | POST   | Create new user or update last login                 | ❌ Public           |
|           | `/user/:id`                  | PUT    | Update single user by ID                              | ✅ Token            |
|           | `/user/:id`                  | DELETE | Delete single user by ID                              | ✅ Token + Admin    |
|           | `/jwt`                       | POST   | Generate JWT token                                   | ❌ Public           |
|           | `/logOut`                     | GET    | Remove JWT token / log out                            | ❌ Public           |

| Module     | Endpoint                     | Method | Description                                           | Auth / Role Required |
|------------|-----------------------------|--------|-------------------------------------------------------|--------------------|
| **Product**| `/products`                  | GET    | Get products with filtering, sorting, and pagination | ❌ Public           |
|            | `/all-products`              | GET    | Get all products                                     | ✅ Token + Admin    |
|            | `/products/best`             | GET    | Get best-selling products                             | ❌ Public           |
|            | `/products/new`              | GET    | Get new arrival products                               | ❌ Public           |
|            | `/products/:category`        | GET    | Get products by category                               | ❌ Public           |
|            | `/product/:id`               | GET    | Get single product by ID                               | ❌ Public           |
|            | `/product`                   | POST   | Add new product                                      | ✅ Token + Admin    |
|            | `/product/:id`               | PUT    | Update single product by ID                            | ✅ Token + Admin    |
|            | `/product/:id`               | DELETE | Delete single product by ID                             | ✅ Token + Admin    |

| Module     | Endpoint                     | Method | Description                                           | Auth / Role Required |
|------------|-----------------------------|--------|-------------------------------------------------------|--------------------|
| **Order**  | `/orders`                    | GET    | Get all orders                                       | ✅ Token + Admin    |
|            | `/orders/:email`             | GET    | Get orders by customer email                          | ✅ Token            |
|            | `/order/:id`                 | GET    | Get single order by ID                                 | ✅ Token            |
|            | `/order`                     | POST   | Place a new order                                     | ❌ Public           |
|            | `/update_order/:id`          | PATCH  | Update order status or payment status                 | ✅ Token            |
|            | `/order/:id`                 | DELETE | Delete single order by ID                               | ✅ Token + Admin    |

| Module     | Endpoint                     | Method | Description                                           | Auth / Role Required |
|------------|-----------------------------|--------|-------------------------------------------------------|--------------------|
| **Review** | `/reviews`                   | GET    | Get all reviews                                      | ❌ Public           |
|            | `/reviews/:product_id`       | GET    | Get reviews by product ID                             | ❌ Public           |
|            | `/review`                    | POST   | Add a new review                                     | ❌ Public           |

