"""baseline existing database

Revision ID: 8c0755f86429
Revises: c410672337c1
Create Date: 2026-10-01 21:35:08.842300

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c0755f86429'
down_revision: Union[str, Sequence[str], None] = 'c410672337c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
