# BookSwap — Full Stack Marketplace

Online used book marketplace with a **React frontend**, **Flask REST API**, and **SQL database** (SQLite by default, MySQL optional).

## Architecture

```
React (Vite)  →  /api proxy  →  Flask API  →  SQLAlchemy  →  SQLite / MySQL
   :5173                           :5000
```

The frontend already calls the API via `frontend/src/api/client.js`. In development, Vite proxies `/api` to `http://127.0.0.1:5000`.

## Quick start (Windows)

1. **One-time setup** — double-click `setup.bat` or run:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   flask --app run.py db upgrade
   python seed.py
   cd frontend && npm install
   ```

2. **Start backend** — double-click `start-backend.bat` or:
   ```bash
   venv\Scripts\activate
   python run.py
   ```

3. **Start frontend** — double-click `start-frontend.bat` or:
   ```bash
   npm run dev
   ```

4. Open **http://localhost:5173**

Both servers must run at the same time for the app to work.

## Demo accounts (after seed)

| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | admin@bookswap.com  | admin123   |
| Seller | seller@bookswap.com | seller123  |
| Buyer  | buyer@bookswap.com  | buyer123   |

## Environment variables

Copy `.env.example` to `.env` in the project root:

```env
SECRET_KEY=change-this-secret-key
JWT_SECRET_KEY=change-this-jwt-secret
DATABASE_URL=sqlite:///instance/app.db
```

Optional frontend override (`frontend/.env`):

```env
VITE_API_URL=http://127.0.0.1:5000/api
```

## Database

- **SQLite (default):** file at `instance/app.db` — no extra install
- **MySQL (optional):** set in `.env`:
  ```env
  DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/bookswap
  ```
  Create the database first, then run:
  ```bash
  flask --app run.py db upgrade
  python seed.py
  ```

### Tables

| Table        | Purpose                          |
|--------------|----------------------------------|
| `users`      | Accounts (buyer, seller, admin)  |
| `categories` | Book genres                      |
| `books`      | Listings                         |
| `orders`     | Purchases                        |

## API base URL

- Direct: `http://127.0.0.1:5000/api`
- Via Vite proxy (dev): `http://localhost:5173/api`

### Public routes

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /categories`, `GET /books`, `GET /orders`
- `GET /users/<id>`, `GET /books/<id>`, etc.

### Protected routes (Bearer JWT)

- Admin: users, categories CRUD
- Seller: create/edit/delete own books
- Buyer: create/edit/delete own orders

## Role behavior

- **buyer:** browse, buy books, view orders
- **seller:** list and manage books
- **admin:** manage users, categories, and all data

## Frontend pages connected to API

| Page              | API used                                      |
|-------------------|-----------------------------------------------|
| Login / Register  | `/auth/login`, `/auth/register`               |
| Books browse      | `/books`, `/categories`                       |
| Book detail       | `/books/:id`, `/orders` (buy)                 |
| Seller listings   | `/books` (filtered), CRUD                     |
| Orders            | `/orders`, `/books`                           |
| Admin dashboard   | `/users`, `/books`, `/orders`, `/categories` |
| Admin categories  | categories CRUD                               |
| Admin users       | `/users`                                      |

## NPM scripts (root)

```bash
npm run dev          # frontend only
npm run dev:backend  # Flask API only
npm run db:upgrade   # apply migrations
npm run db:seed      # seed demo data
npm run setup        # install + migrate + seed
```
