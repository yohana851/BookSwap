# BookSwap API

Flask backend for an online used book marketplace with:
- SQLAlchemy relational models (`users`, `categories`, `books`, `orders`)
- JWT authentication (register/login + protected write routes)
- Role-based authorization (`buyer`, `seller`, `admin`)
- Request validation via Marshmallow schemas
- CRUD APIs testable from Postman

## 1) Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure `.env`:
   ```env
   DATABASE_URL=sqlite:///app.db
   JWT_SECRET_KEY=change-this-jwt-secret
   ```

5. Initialize Flask-Migrate (first time only):
   ```bash
   flask --app run.py db init
   ```

6. Create and apply migration:
   ```bash
   flask --app run.py db migrate -m "initial bookswap schema"
   flask --app run.py db upgrade
   ```

7. Start server:
   ```bash
   python run.py
   ```

Base URL:
- `http://127.0.0.1:5000/api`

## 2) Role behavior

- `admin`: manage users/categories and all books/orders
- `seller`: create/update/delete own books
- `buyer`: create/update/delete own orders

## 3) API routes

Public routes:
- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/<user_id>`
- `GET /categories`
- `GET /categories/<category_id>`
- `GET /books`
- `GET /books/<book_id>`
- `GET /orders`
- `GET /orders/<order_id>`

Protected routes (require `Authorization: Bearer <token>`):
- `GET /users` (admin only)
- `PUT /users/<user_id>` (self or admin)
- `DELETE /users/<user_id>` (self or admin)
- `POST /categories` (admin only)
- `PUT /categories/<category_id>` (admin only)
- `DELETE /categories/<category_id>` (admin only)
- `POST /books` (seller/admin)
- `PUT /books/<book_id>` (owner seller/admin)
- `DELETE /books/<book_id>` (owner seller/admin)
- `POST /orders` (buyer/admin)
- `PUT /orders/<order_id>` (owner buyer/admin)
- `DELETE /orders/<order_id>` (owner buyer/admin)

## 4) Postman quick test

1. Register seller user:
```json
{
  "username": "seller01",
  "email": "seller01@example.com",
  "password": "StrongPass123",
  "role": "seller"
}
```

2. Login:
```json
{
  "email": "seller01@example.com",
  "password": "StrongPass123"
}
```
Copy `access_token`.

3. Set Postman header:
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

4. Create category (admin token required):
```json
{
  "name": "Fiction"
}
```

5. Create book (seller token):
```json
{
  "seller_id": 1,
  "category_id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "price": 18.50,
  "condition": "Good",
  "description": "Second-hand copy in good condition",
  "image_url": "https://example.com/book.jpg",
  "status": "Available"
}
```

6. Register/login buyer, then create order:
```json
{
  "book_id": 1,
  "buyer_id": 2,
  "total_amount": 18.50,
  "payment_status": "Paid"
}
```

## 5) Switching to MySQL (optional)

If you want MySQL instead of SQLite, change:
```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/bookswap
```
Then run:
```bash
flask --app run.py db migrate -m "mysql schema"
flask --app run.py db upgrade
```
