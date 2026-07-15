"""Seed the database with default categories and demo accounts."""

from werkzeug.security import generate_password_hash

from app import create_app
from app.models import Book, Category, User
from extensions import db

DEFAULT_CATEGORIES = [
    'Fiction',
    'Science',
    'History',
    'Biography',
    'Children',
    'Business',
]

DEMO_USERS = [
    {
        'username': 'admin',
        'email': 'admin@bookswap.com',
        'password': 'admin123',
        'role': 'admin',
    },
    {
        'username': 'seller1',
        'email': 'seller@bookswap.com',
        'password': 'seller123',
        'role': 'seller',
    },
    {
        'username': 'buyer1',
        'email': 'buyer@bookswap.com',
        'password': 'buyer123',
        'role': 'buyer',
    },
]

SAMPLE_BOOKS = [
    {
        'title': 'The Great Gatsby',
        'author': 'F. Scott Fitzgerald',
        'price': 8.99,
        'condition': 'Good',
        'description': 'Classic American novel in good used condition.',
        'category': 'Fiction',
    },
    {
        'title': 'A Brief History of Time',
        'author': 'Stephen Hawking',
        'price': 12.50,
        'condition': 'Like New',
        'description': 'Popular science book explaining cosmology.',
        'category': 'Science',
    },
    {
        'title': 'Sapiens',
        'author': 'Yuval Noah Harari',
        'price': 14.00,
        'condition': 'Good',
        'description': 'A brief history of humankind.',
        'category': 'History',
    },
]


def seed():
    app = create_app()
    with app.app_context():
        for name in DEFAULT_CATEGORIES:
            if not Category.query.filter_by(name=name).first():
                db.session.add(Category(name=name))

        users_by_email = {}
        for entry in DEMO_USERS:
            user = User.query.filter_by(email=entry['email']).first()
            if not user:
                user = User(
                    username=entry['username'],
                    email=entry['email'],
                    password_hash=generate_password_hash(entry['password']),
                    role=entry['role'],
                )
                db.session.add(user)
                db.session.flush()
            users_by_email[entry['email']] = user

        seller = users_by_email.get('seller@bookswap.com')
        if seller and Book.query.count() == 0:
            categories = {cat.name: cat for cat in Category.query.all()}
            for book_data in SAMPLE_BOOKS:
                category = categories.get(book_data['category'])
                if not category:
                    continue
                db.session.add(
                    Book(
                        seller_id=seller.user_id,
                        category_id=category.category_id,
                        title=book_data['title'],
                        author=book_data['author'],
                        price=book_data['price'],
                        condition=book_data['condition'],
                        description=book_data['description'],
                        status='Available',
                    )
                )

        db.session.commit()
        print('Database seeded successfully.')
        print('Demo accounts (password shown for local dev only):')
        for entry in DEMO_USERS:
            print(f"  {entry['role']:6}  {entry['email']}  /  {entry['password']}")


if __name__ == '__main__':
    seed()
