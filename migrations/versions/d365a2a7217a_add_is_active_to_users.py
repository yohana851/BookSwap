"""Add is_active to users

Revision ID: d365a2a7217a
Revises: 68c0d02bbaee
Create Date: 2026-07-09 07:52:41.935241

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd365a2a7217a'
down_revision = '68c0d02bbaee'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('1'))
        )


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('is_active')
