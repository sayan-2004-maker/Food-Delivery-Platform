# 🍔 FeastFlow – Food Delivery Platform

FeastFlow is a full-stack food delivery web application that allows users to discover restaurants, explore food menus, add items to their cart, and order food online. It also provides administrative features to manage restaurants, food items, users, and orders.

## 🚀 Features

### 👤 User Features
- User registration and login.
- Browse restaurants and food items.
- Search and filter restaurants.
- View restaurant menus.
- Add food items to cart.
- Update food quantities.
- Apply coupon codes.
- Manage delivery addresses.
- Place food orders.
- Track orders and view order history.
- Manage user profiles.
- Save favourite restaurants and food items.
- Submit ratings and reviews.

### 🏪 Restaurant Features
- Restaurant management.
- Manage food items and menus.
- View incoming orders.
- Update order status.
- Manage restaurant information.

### 🔐 Admin Features
- Admin dashboard.
- Manage users.
- Add, update and delete restaurants.
- Manage food items.
- View and manage orders.
- Monitor platform activities.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- JavaScript
- HTML5
- CSS3

**Backend**
- Node.js
- Express.js
- REST API
- JWT Authentication

**Database**
- MongoDB
- Mongoose

**Development Tools**
- Visual Studio Code
- Git
- GitHub
- npm

## 📁 Project Structure

```text
Food-Delivery-Platform/
│
├── frontend/
│   ├── public/
│   └── src/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   ├── server.js
│   └── seed.js
│
├── API.md
├── package.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd Food-Delivery-Platform
```

### 3. Install Dependencies

```bash
npm install
```

Install dependencies for individual applications if required:

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Replace the values with your actual MongoDB connection string and a secure JWT secret.

**Important:** Never upload your `.env` file or database credentials to GitHub.

### 5. Start the Backend

```bash
cd backend
npm run dev
```

### 6. Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

### 7. Open the Application

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

*Actual ports depend on your project configuration.*

## 🔗 API Documentation

The backend provides REST APIs for:

- User Authentication
- Restaurant Management
- Food Management
- Cart Management
- Order Management
- Address Management
- Coupon Management
- User Profiles
- Reviews and Ratings
- Admin Operations

Refer to `API.md` for additional API details.

## 🔒 Security

- JWT-based authentication.
- Protected API routes.
- Environment-based configuration.
- Secure database connection.
- Role-based access control.

## 👨‍💻 Author

**Sayan Das**

B.Tech – Information Technology

GitHub: https://github.com/sayan-2004-maker

LinkedIn: https://www.linkedin.com/in/sayan-das-5a2344283/

---

⭐ If you find this project useful, consider giving it a star on GitHub.

**FeastFlow – Bringing Delicious Food to Your Doorstep!** 🍕
