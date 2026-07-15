"""Add delivery_location and delivery_charge to orders

Revision ID: 7a3f9c2e1b4d
Revises: 60d52a8917ee
Create Date: 2026-07-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7a3f9c2e1b4d'
down_revision = '60d52a8917ee'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                'delivery_location', sa.String(length=20), nullable=True,
                server_default='Inside Valley',
            )
        )
        batch_op.add_column(
            sa.Column(
                'delivery_charge', sa.Numeric(precision=10, scale=2), nullable=True,
                server_default='100',
            )
        )


def downgrade():
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_column('delivery_charge')
        batch_op.drop_column('delivery_location')
