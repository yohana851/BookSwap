from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from extensions import db


class User(db.Model):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False, default="buyer")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    books = relationship("Book", backref="seller", cascade="all, delete", lazy=True)
    orders = relationship("Order", backref="buyer", lazy=True)

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() + "Z",
        }


class Category(db.Model):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)

    books = relationship("Book", backref="category", lazy=True)

    def to_dict(self):
        return {
            "category_id": self.category_id,
            "name": self.name,
            "book_count": len(self.books),
        }


class Book(db.Model):
    __tablename__ = "books"

    book_id = Column(Integer, primary_key=True, autoincrement=True)
    seller_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=True)
    isbn = Column(String(16), index=True, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    condition = Column(String(20), nullable=True)
    image_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="Available")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    orders = relationship("Order", backref="book", lazy=True)
    reviews = relationship(
        "Review", backref="book", cascade="all, delete-orphan", lazy=True
    )

    def rating_summary(self):
        ratings = [review.rating for review in self.reviews]
        count = len(ratings)
        average = round(sum(ratings) / count, 2) if count else 0
        return {"average_rating": average, "review_count": count}

    def to_dict(self):
        summary = self.rating_summary()
        return {
            "book_id": self.book_id,
            "seller_id": self.seller_id,
            "category_id": self.category_id,
            "title": self.title,
            "author": self.author,
            "isbn": self.isbn,
            "price": float(self.price),
            "condition": self.condition,
            "image_url": self.image_url,
            "description": self.description,
            "status": self.status,
            "average_rating": summary["average_rating"],
            "review_count": summary["review_count"],
            "created_at": self.created_at.isoformat() + "Z",
        }


class Order(db.Model):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, autoincrement=True)
    book_id = Column(Integer, ForeignKey("books.book_id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    payment_status = Column(String(20), nullable=True, default="Paid")
    payment_method = Column(String(20), nullable=False, default="COD")
    status = Column(String(20), nullable=False, default="Processing")
    delivery_name = Column(String(100), nullable=True)
    delivery_phone = Column(String(20), nullable=True)
    delivery_address = Column(String(255), nullable=True)
    delivery_location = Column(String(20), nullable=True, default="Inside Valley")
    delivery_charge = Column(Numeric(10, 2), nullable=True, default=100)
    order_date = Column(DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "order_id": self.order_id,
            "book_id": self.book_id,
            "buyer_id": self.buyer_id,
            "total_amount": float(self.total_amount),
            "payment_status": self.payment_status,
            "payment_method": self.payment_method,
            "status": self.status,
            "delivery_name": self.delivery_name,
            "delivery_phone": self.delivery_phone,
            "delivery_address": self.delivery_address,
            "delivery_location": self.delivery_location,
            "delivery_charge": float(self.delivery_charge) if self.delivery_charge is not None else None,
            "order_date": self.order_date.isoformat() + "Z",
        }


class Review(db.Model):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("book_id", "user_id", name="uq_review_book_user"),
    )

    review_id = Column(Integer, primary_key=True, autoincrement=True)
    book_id = Column(
        Integer, ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User", backref="reviews", lazy=True)

    def to_dict(self):
        return {
            "review_id": self.review_id,
            "book_id": self.book_id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() + "Z",
        }


class CartItem(db.Model):
    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint("user_id", "book_id", name="uq_cart_user_book"),
    )

    cart_item_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    book_id = Column(
        Integer, ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    book = relationship("Book", lazy=True)

    def to_dict(self):
        return {
            "cart_item_id": self.cart_item_id,
            "user_id": self.user_id,
            "book_id": self.book_id,
            "book": self.book.to_dict() if self.book else None,
            "created_at": self.created_at.isoformat() + "Z",
        }


class WishlistItem(db.Model):
    __tablename__ = "wishlist_items"
    __table_args__ = (
        UniqueConstraint("user_id", "book_id", name="uq_wishlist_user_book"),
    )

    wishlist_item_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    book_id = Column(
        Integer, ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    book = relationship("Book", lazy=True)

    def to_dict(self):
        return {
            "wishlist_item_id": self.wishlist_item_id,
            "user_id": self.user_id,
            "book_id": self.book_id,
            "book": self.book.to_dict() if self.book else None,
            "created_at": self.created_at.isoformat() + "Z",
        }
