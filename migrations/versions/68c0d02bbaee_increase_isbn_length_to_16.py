"""Increase isbn length to 16

Revision ID: 68c0d02bbaee
Revises: d0b20593c0a6
Create Date: 2026-07-08 21:47:53.734158

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '68c0d02bbaee'
down_revision = 'd0b20593c0a6'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('books', schema=None) as batch_op:
        batch_op.alter_column('isbn',
               existing_type=sa.VARCHAR(length=13),
               type_=sa.String(length=16),
               existing_nullable=True)


def downgrade():
    with op.batch_alter_table('books', schema=None) as batch_op:
        batch_op.alter_column('isbn',
               existing_type=sa.String(length=16),
               type_=sa.VARCHAR(length=13),
               existing_nullable=True)
