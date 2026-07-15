import os
import uuid

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

from app.models import Book, CartItem, Category, Order, Review, User, WishlistItem
from app.schemas import (
    BookSchema,
    CartItemSchema,
    CategorySchema,
    CheckoutSchema,
    LoginSchema,
    OrderSchema,
    RegisterSchema,
    ReviewSchema,
    UpdateUserSchema,
    WishlistItemSchema,
    validate_payload,
)
from extensions import db

DELIVERY_CHARGES = {"Inside Valley": 100, "Outside Valley": 150}

api_bp = Blueprint("api", __name__)
register_schema = RegisterSchema()
login_schema = LoginSchema()
update_user_schema = UpdateUserSchema()
category_schema = CategorySchema()
book_schema = BookSchema()
order_schema = OrderSchema()
checkout_schema = CheckoutSchema()
review_schema = ReviewSchema()
cart_item_schema = CartItemSchema()
wishlist_item_schema = WishlistItemSchema()


def _allowed_image(filename):
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in current_app.config["ALLOWED_IMAGE_EXTENSIONS"]


def get_current_user():
    identity = get_jwt_identity()
    if not identity:
        return None
    user = User.query.get(int(identity))
    if user and not user.is_active:
        return None
    return user


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

    role = payload.get("role", "buyer")
    if role not in {"buyer", "seller"}:
        return jsonify({"error": "Invalid role for registration"}), 403

    user = User(
        username=payload["username"],
        email=payload["email"],
        password_hash=generate_password_hash(payload["password"]),
        role=role,
    )
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@api_bp.post("/auth/login")
def login():
    payload, errors = validate_payload(login_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400

    identifier = payload["identifier"]
    password = payload["password"]

    user = User.query.filter(
        (User.email == identifier) | (User.username == identifier)
    ).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401
    if not user.is_active:
        return jsonify({"error": "This account has been deactivated"}), 403

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

    payload, errors = validate_payload(update_user_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400

    if "email" in payload:
        existing = User.query.filter(
            User.email == payload["email"], User.user_id != user.user_id
        ).first()
        if existing:
            return jsonify({"error": "Email already in use"}), 409
    if "username" in payload:
        existing = User.query.filter(
            User.username == payload["username"], User.user_id != user.user_id
        ).first()
        if existing:
            return jsonify({"error": "Username already in use"}), 409

    for field in ["username", "email"]:
        if field in payload:
            setattr(user, field, payload[field])
    if "role" in payload:
        if current_user.role != "admin":
            return jsonify({"error": "Only admin can change roles"}), 403
        if current_user.user_id == user.user_id and payload["role"] != "admin":
            return jsonify({"error": "You cannot change your own admin role"}), 403
        user.role = payload["role"]
    if "is_active" in payload:
        if current_user.role != "admin":
            return jsonify({"error": "Only admin can activate or deactivate accounts"}), 403
        if current_user.user_id == user.user_id and not payload["is_active"]:
            return jsonify({"error": "You cannot deactivate your own account"}), 403
        user.is_active = payload["is_active"]
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
    if current_user.role == "admin" and current_user.user_id == user.user_id:
        return jsonify({"error": "You cannot delete your own admin account"}), 403
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

    delivery_charge = DELIVERY_CHARGES[payload["delivery_location"]]
    order = Order(
        book_id=payload["book_id"],
        buyer_id=payload["buyer_id"],
        total_amount=payload["total_amount"] + delivery_charge,
        payment_method=payload["payment_method"],
        payment_status="Pending",
        delivery_name=payload["delivery_name"],
        delivery_phone=payload["delivery_phone"],
        delivery_address=payload["delivery_address"],
        delivery_location=payload["delivery_location"],
        delivery_charge=delivery_charge,
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
    for field in ["book_id", "buyer_id", "total_amount"]:
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


@api_bp.post("/orders/<order_id>/accept")
@jwt_required()
def accept_order(order_id):
    current_user, forbidden = require_roles("seller", "admin")
    if forbidden:
        return forbidden
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    book = order.book
    if current_user.role != "admin" and (not book or book.seller_id != current_user.user_id):
        return jsonify({"error": "You can only accept orders for your own books"}), 403
    if order.status != "Processing":
        return jsonify({"error": f"Order is already {order.status}"}), 400
    order.status = "Delivering"
    db.session.commit()
    return jsonify(order.to_dict())


@api_bp.post("/orders/<order_id>/deliver")
@jwt_required()
def deliver_order(order_id):
    current_user, forbidden = require_roles("seller", "admin")
    if forbidden:
        return forbidden
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    book = order.book
    if current_user.role != "admin" and (not book or book.seller_id != current_user.user_id):
        return jsonify({"error": "You can only update orders for your own books"}), 403
    if order.status != "Delivering":
        return jsonify({"error": "Order must be Delivering before it can be marked Delivered"}), 400
    order.status = "Delivered"
    if order.payment_method == "COD":
        order.payment_status = "Paid"
    db.session.commit()
    return jsonify(order.to_dict())


# ---------------------------------------------------------------------------
# Image uploads
# ---------------------------------------------------------------------------
@api_bp.post("/uploads")
@jwt_required()
def upload_image():
    _, forbidden = require_roles("seller", "admin")
    if forbidden:
        return forbidden

    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    if not _allowed_image(file.filename):
        allowed = ", ".join(sorted(current_app.config["ALLOWED_IMAGE_EXTENSIONS"]))
        return jsonify({"error": f"Unsupported file type. Allowed: {allowed}"}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    # Keep the sanitized original name only to validate, but store under a unique name
    secure_filename(file.filename)
    save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    file.save(save_path)

    image_url = request.host_url.rstrip("/") + "/uploads/" + filename
    return jsonify({"image_url": image_url, "filename": filename}), 201


# ---------------------------------------------------------------------------
# Reviews & ratings
# ---------------------------------------------------------------------------
@api_bp.get("/books/<book_id>/reviews")
def list_reviews(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404
    reviews = (
        Review.query.filter_by(book_id=book.book_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return jsonify(
        {
            "reviews": [review.to_dict() for review in reviews],
            **book.rating_summary(),
        }
    )


@api_bp.post("/books/<book_id>/reviews")
@jwt_required()
def create_review(book_id):
    current_user, forbidden = require_roles("buyer", "admin")
    if forbidden:
        return forbidden
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    payload, errors = validate_payload(review_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400

    existing = Review.query.filter_by(
        book_id=book.book_id, user_id=current_user.user_id
    ).first()
    if existing:
        existing.rating = payload["rating"]
        existing.comment = payload.get("comment")
        db.session.commit()
        return jsonify(existing.to_dict())

    review = Review(
        book_id=book.book_id,
        user_id=current_user.user_id,
        rating=payload["rating"],
        comment=payload.get("comment"),
    )
    db.session.add(review)
    db.session.commit()
    return jsonify(review.to_dict()), 201


@api_bp.delete("/reviews/<review_id>")
@jwt_required()
def delete_review(review_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404
    if current_user.role != "admin" and review.user_id != current_user.user_id:
        return jsonify({"error": "You can only delete your own reviews"}), 403
    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Review deleted"})


# ---------------------------------------------------------------------------
# Cart
# ---------------------------------------------------------------------------
@api_bp.get("/cart")
@jwt_required()
def get_cart():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401
    items = (
        CartItem.query.filter_by(user_id=current_user.user_id)
        .order_by(CartItem.created_at.desc())
        .all()
    )
    items_dict = [item.to_dict() for item in items]
    total = sum(
        item["book"]["price"] for item in items_dict if item["book"] is not None
    )
    return jsonify({"items": items_dict, "total": round(total, 2)})


@api_bp.post("/cart")
@jwt_required()
def add_to_cart():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401
    payload, errors = validate_payload(cart_item_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400

    book = Book.query.get(payload["book_id"])
    if not book:
        return jsonify({"error": "Book not found"}), 404

    existing = CartItem.query.filter_by(
        user_id=current_user.user_id, book_id=book.book_id
    ).first()
    if existing:
        return jsonify(existing.to_dict())

    item = CartItem(user_id=current_user.user_id, book_id=book.book_id)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@api_bp.delete("/cart/<book_id>")
@jwt_required()
def remove_from_cart(book_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401
    item = CartItem.query.filter_by(
        user_id=current_user.user_id, book_id=book_id
    ).first()
    if not item:
        return jsonify({"error": "Item not in cart"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Removed from cart"})


@api_bp.post("/cart/checkout")
@jwt_required()
def checkout_cart():
    current_user, forbidden = require_roles("buyer", "admin")
    if forbidden:
        return forbidden

    payload, errors = validate_payload(checkout_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400

    items = CartItem.query.filter_by(user_id=current_user.user_id).all()
    if not items:
        return jsonify({"error": "Cart is empty"}), 400

    delivery_charge = DELIVERY_CHARGES[payload["delivery_location"]]
    orders = []
    for item in items:
        book = item.book
        if not book or book.status != "Available":
            continue
        order = Order(
            book_id=book.book_id,
            buyer_id=current_user.user_id,
            total_amount=book.price + delivery_charge,
            payment_method=payload["payment_method"],
            payment_status="Pending",
            delivery_name=payload["delivery_name"],
            delivery_phone=payload["delivery_phone"],
            delivery_address=payload["delivery_address"],
            delivery_location=payload["delivery_location"],
            delivery_charge=delivery_charge,
        )
        book.status = "Sold"
        db.session.add(order)
        db.session.delete(item)
        orders.append(order)

    if not orders:
        return jsonify({"error": "No available books in cart"}), 400

    db.session.commit()
    return jsonify({"orders": [order.to_dict() for order in orders]}), 201


# ---------------------------------------------------------------------------
# Wishlist
# ---------------------------------------------------------------------------
@api_bp.get("/wishlist")
@jwt_required()
def get_wishlist():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401
    items = (
        WishlistItem.query.filter_by(user_id=current_user.user_id)
        .order_by(WishlistItem.created_at.desc())
        .all()
    )
    return jsonify({"items": [item.to_dict() for item in items]})


@api_bp.post("/wishlist")
@jwt_required()
def add_to_wishlist():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401
    payload, errors = validate_payload(wishlist_item_schema, request.get_json())
    if errors:
        return jsonify({"errors": errors}), 400

    book = Book.query.get(payload["book_id"])
    if not book:
        return jsonify({"error": "Book not found"}), 404

    existing = WishlistItem.query.filter_by(
        user_id=current_user.user_id, book_id=book.book_id
    ).first()
    if existing:
        return jsonify(existing.to_dict())

    item = WishlistItem(user_id=current_user.user_id, book_id=book.book_id)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@api_bp.delete("/wishlist/<book_id>")
@jwt_required()
def remove_from_wishlist(book_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401
    item = WishlistItem.query.filter_by(
        user_id=current_user.user_id, book_id=book_id
    ).first()
    if not item:
        return jsonify({"error": "Item not in wishlist"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Removed from wishlist"})
