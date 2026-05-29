from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from extensions import db


class User(db.Model):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False, default="buyer")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    books = relationship("Book", backref="seller", cascade="all, delete", lazy=True)
    orders = relationship("Order", backref="buyer", lazy=True)

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat() + "Z",
        }


class Category(db.Model):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)

    books = relationship("Book", backref="category", lazy=True)

    def to_dict(self):
        return {"category_id": self.category_id, "name": self.name}


class Book(db.Model):
    __tablename__ = "books"

    book_id = Column(Integer, primary_key=True, autoincrement=True)
    seller_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=True)
    isbn = Column(String(13), index=True, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    condition = Column(String(20), nullable=True)
    image_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="Available")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    orders = relationship("Order", backref="book", lazy=True)

    def to_dict(self):
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
            "created_at": self.created_at.isoformat() + "Z",
        }


class Order(db.Model):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, autoincrement=True)
    book_id = Column(Integer, ForeignKey("books.book_id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    payment_status = Column(String(20), nullable=True, default="Paid")
    order_date = Column(DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "order_id": self.order_id,
            "book_id": self.book_id,
            "buyer_id": self.buyer_id,
            "total_amount": float(self.total_amount),
            "payment_status": self.payment_status,
            "order_date": self.order_date.isoformat() + "Z",
        }
