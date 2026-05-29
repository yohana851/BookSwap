from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from app.models import Book, Category, Order, User
from app.schemas import (
    BookSchema,
    CategorySchema,
    LoginSchema,
    OrderSchema,
    RegisterSchema,
    validate_payload,
)
from extensions import db

api_bp = Blueprint("api", __name__)
register_schema = RegisterSchema()
login_schema = LoginSchema()
category_schema = CategorySchema()
book_schema = BookSchema()
order_schema = OrderSchema()


def get_current_user():
    identity = get_jwt_identity()
    if not identity:
        return None
    return User.query.get(int(identity))


def require_roles(*roles):
    user = get_current_user()
    if not user:
        return None, (jsonify({"error": "Unauthorized"}), 401)
    if user.role not in roles:
        return None, (jsonify({"error": "Forbidden: insufficient role"}), 403)
    return user, None


@api_bp.get("/health")
def health_check():
    return jsonify({"message": "BookSwap API is running"})


@api_bp.post("/auth/register")
def register():
    payload, errors = validate_payload(register_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400

    existing = User.query.filter(
        (User.username == payload["username"]) | (User.email == payload["email"])
    ).first()
    if existing:
        return jsonify({"error": "Username or email already exists"}), 409

    user = User(
        username=payload["username"],
        email=payload["email"],
        password_hash=generate_password_hash(payload["password"]),
        role=payload.get("role", "buyer"),
    )
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@api_bp.post("/auth/login")
def login():
    payload, errors = validate_payload(login_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400

    email = payload["email"]
    password = payload["password"]

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.user_id))
    return jsonify({"access_token": token, "user": user.to_dict()})


@api_bp.get("/users")
@jwt_required()
def list_users():
    _, forbidden = require_roles("admin")
    if forbidden:
        return forbidden
    users = [user.to_dict() for user in User.query.order_by(User.user_id.asc()).all()]
    return jsonify(users)


@api_bp.get("/users/<user_id>")
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())


@api_bp.put("/users/<user_id>")
@jwt_required()
def update_user(user_id):
    current_user = get_current_user()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401
    if current_user.role != "admin" and current_user.user_id != user.user_id:
        return jsonify({"error": "Forbidden: cannot edit other users"}), 403

    payload = request.get_json() or {}
    for field in ["username", "email"]:
        if field in payload:
            setattr(user, field, payload[field])
    if "role" in payload:
        if current_user.role != "admin":
            return jsonify({"error": "Only admin can change roles"}), 403
        if payload["role"] not in {"buyer", "seller", "admin"}:
            return jsonify({"error": "Invalid role"}), 400
        user.role = payload["role"]
    if payload.get("password"):
        user.password_hash = generate_password_hash(payload["password"])
    db.session.commit()
    return jsonify(user.to_dict())


@api_bp.delete("/users/<user_id>")
@jwt_required()
def delete_user(user_id):
    current_user = get_current_user()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401
    if current_user.role != "admin" and current_user.user_id != user.user_id:
        return jsonify({"error": "Forbidden: cannot delete other users"}), 403
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})


@api_bp.post("/categories")
@jwt_required()
def create_category():
    _, forbidden = require_roles("admin")
    if forbidden:
        return forbidden
    payload, errors = validate_payload(category_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400

    category = Category(name=payload["name"])
    db.session.add(category)
    db.session.commit()
    return jsonify(category.to_dict()), 201


@api_bp.get("/categories")
def list_categories():
    categories = [cat.to_dict() for cat in Category.query.order_by(Category.category_id.asc()).all()]
    return jsonify(categories)


@api_bp.get("/categories/<category_id>")
def get_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Category not found"}), 404
    return jsonify(category.to_dict())


@api_bp.put("/categories/<category_id>")
@jwt_required()
def update_category(category_id):
    _, forbidden = require_roles("admin")
    if forbidden:
        return forbidden
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Category not found"}), 404
    payload, errors = validate_payload(category_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400
    category.name = payload["name"]
    db.session.commit()
    return jsonify(category.to_dict())


@api_bp.delete("/categories/<category_id>")
@jwt_required()
def delete_category(category_id):
    _, forbidden = require_roles("admin")
    if forbidden:
        return forbidden
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Category not found"}), 404
    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category deleted"})


@api_bp.post("/books")
@jwt_required()
def create_book():
    current_user, forbidden = require_roles("seller", "admin")
    if forbidden:
        return forbidden
    payload, errors = validate_payload(book_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400

    seller = User.query.get(payload["seller_id"])
    category = Category.query.get(payload["category_id"])
    if not seller or not category:
        return jsonify({"error": "Invalid seller_id or category_id"}), 400
    if current_user.role != "admin" and current_user.user_id != payload["seller_id"]:
        return jsonify({"error": "Seller can only create own books"}), 403

    book = Book(
        seller_id=payload["seller_id"],
        category_id=payload["category_id"],
        title=payload["title"],
        author=payload.get("author"),
        isbn=payload.get("isbn"),
        price=payload["price"],
        condition=payload.get("condition"),
        image_url=payload.get("image_url"),
        description=payload.get("description"),
        status=payload.get("status", "Available"),
    )
    db.session.add(book)
    db.session.commit()
    return jsonify(book.to_dict()), 201


@api_bp.get("/books")
def list_books():
    books = [book.to_dict() for book in Book.query.order_by(Book.book_id.asc()).all()]
    return jsonify(books)


@api_bp.get("/books/<book_id>")
def get_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404
    return jsonify(book.to_dict())


@api_bp.put("/books/<book_id>")
@jwt_required()
def update_book(book_id):
    current_user, forbidden = require_roles("seller", "admin")
    if forbidden:
        return forbidden
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404
    payload = request.get_json() or {}
    for field in [
        "title",
        "author",
        "isbn",
        "price",
        "condition",
        "image_url",
        "description",
        "status",
        "seller_id",
        "category_id",
    ]:
        if field in payload:
            setattr(book, field, payload[field])
    if current_user.role != "admin" and book.seller_id != current_user.user_id:
        return jsonify({"error": "Seller can only edit own books"}), 403
    db.session.commit()
    return jsonify(book.to_dict())


@api_bp.delete("/books/<book_id>")
@jwt_required()
def delete_book(book_id):
    current_user, forbidden = require_roles("seller", "admin")
    if forbidden:
        return forbidden
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404
    if current_user.role != "admin" and book.seller_id != current_user.user_id:
        return jsonify({"error": "Seller can only delete own books"}), 403
    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "Book deleted"})


@api_bp.post("/orders")
@jwt_required()
def create_order():
    current_user, forbidden = require_roles("buyer", "admin")
    if forbidden:
        return forbidden
    payload, errors = validate_payload(order_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400

    book = Book.query.get(payload["book_id"])
    buyer = User.query.get(payload["buyer_id"])
    if not book or not buyer:
        return jsonify({"error": "Invalid book_id or buyer_id"}), 400
    if current_user.role != "admin" and current_user.user_id != payload["buyer_id"]:
        return jsonify({"error": "Buyer can only create own orders"}), 403

    order = Order(
        book_id=payload["book_id"],
        buyer_id=payload["buyer_id"],
        total_amount=payload["total_amount"],
        payment_status=payload.get("payment_status", "Paid"),
    )
    db.session.add(order)
    book.status = "Sold"
    db.session.commit()
    return jsonify(order.to_dict()), 201


@api_bp.get("/orders")
def list_orders():
    orders = [order.to_dict() for order in Order.query.order_by(Order.order_id.asc()).all()]
    return jsonify(orders)


@api_bp.get("/orders/<order_id>")
def get_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order.to_dict())


@api_bp.put("/orders/<order_id>")
@jwt_required()
def update_order(order_id):
    current_user, forbidden = require_roles("buyer", "admin")
    if forbidden:
        return forbidden
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    if current_user.role != "admin" and order.buyer_id != current_user.user_id:
        return jsonify({"error": "Buyer can only edit own orders"}), 403
    payload = request.get_json() or {}
    for field in ["book_id", "buyer_id", "total_amount", "payment_status"]:
        if field in payload:
            setattr(order, field, payload[field])
    db.session.commit()
    return jsonify(order.to_dict())


@api_bp.delete("/orders/<order_id>")
@jwt_required()
def delete_order(order_id):
    current_user, forbidden = require_roles("buyer", "admin")
    if forbidden:
        return forbidden
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    if current_user.role != "admin" and order.buyer_id != current_user.user_id:
        return jsonify({"error": "Buyer can only delete own orders"}), 403
    db.session.delete(order)
    db.session.commit()
    return jsonify({"message": "Order deleted"})
