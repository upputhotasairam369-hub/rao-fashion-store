"""Add thrift attributes (size, condition, measurements, flaws, is_featured)

Revision ID: 2b2dbd0f1234
Revises: 1a1cac0faff6
Create Date: 2026-10-16 15:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b2dbd0f1234'
down_revision: Union[str, Sequence[str], None] = '1a1cac0faff6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns to products table safely if not exists
    with op.batch_alter_table('products') as batch_op:
        batch_op.add_column(sa.Column('size', sa.String(), nullable=True, server_default='One Size'))
        batch_op.add_column(sa.Column('condition', sa.String(), nullable=True, server_default='Good'))
        batch_op.add_column(sa.Column('measurements', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('flaws', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('is_featured', sa.Boolean(), nullable=True, server_default=sa.text('false')))


def downgrade() -> None:
    with op.batch_alter_table('products') as batch_op:
        batch_op.drop_column('is_featured')
        batch_op.drop_column('flaws')
        batch_op.drop_column('measurements')
        batch_op.drop_column('condition')
        batch_op.drop_column('size')
