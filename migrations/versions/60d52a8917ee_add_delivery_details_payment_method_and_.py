"""Add delivery details, payment method, and tracking status to orders

Revision ID: 60d52a8917ee
Revises: cdec1cabe3d3
Create Date: 2026-07-10 07:40:50.480018

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '60d52a8917ee'
down_revision = 'cdec1cabe3d3'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                'payment_method', sa.String(length=20), nullable=False,
                server_default='COD',
            )
        )
        batch_op.add_column(
            sa.Column(
                'status', sa.String(length=20), nullable=False,
                server_default='Delivered',
            )
        )
        batch_op.add_column(sa.Column('delivery_name', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('delivery_phone', sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column('delivery_address', sa.String(length=255), nullable=True))


def downgrade():
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_column('delivery_address')
        batch_op.drop_column('delivery_phone')
        batch_op.drop_column('delivery_name')
        batch_op.drop_column('status')
        batch_op.drop_column('payment_method')
