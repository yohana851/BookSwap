import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
DEFAULT_DB_PATH = os.path.join(INSTANCE_DIR, 'app.db')
DEFAULT_UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')


def resolve_database_uri(uri):
    if uri.startswith('sqlite:///') and not uri.startswith('sqlite:////'):
        relative = uri.replace('sqlite:///', '', 1)
        if not os.path.isabs(relative):
            relative = os.path.join(BASE_DIR, relative.replace('/', os.sep))
        os.makedirs(os.path.dirname(relative), exist_ok=True)
        return 'sqlite:///' + relative.replace('\\', '/')
    return uri


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key')
    SQLALCHEMY_DATABASE_URI = resolve_database_uri(
        os.getenv(
            'DATABASE_URL',
            f'sqlite:///{DEFAULT_DB_PATH.replace(os.sep, "/")}',
        )
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-dev-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # File uploads (book cover images)
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', DEFAULT_UPLOAD_DIR)
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_UPLOAD_BYTES', 5 * 1024 * 1024))  # 5 MB

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
