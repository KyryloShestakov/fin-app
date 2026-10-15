"""Add indexes for financial explorer queries.

Revision ID: f2e4d7a9b3c1
Revises: 8c0755f86429
Create Date: 2026-10-15
"""

from typing import Sequence, Union

from alembic import op


revision: str = 'f2e4d7a9b3c1'
down_revision: Union[str, Sequence[str], None] = '8c0755f86429'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Speed up filtering, sorting, and registered-address lookups."""
    # The indexes are also deployed through Supabase in environments where
    # Alembic is not the migration runner, so make this migration safe there.
    op.execute(
        'CREATE INDEX IF NOT EXISTS idx_financial_statements_year_company '
        'ON financial_statements (fiscal_year, company_id)'
    )
    op.execute(
        'CREATE INDEX IF NOT EXISTS idx_financial_values_metric_statement '
        'ON financial_values (metric_id, statement_id)'
    )
    op.execute(
        'CREATE INDEX IF NOT EXISTS idx_company_addresses_type_company '
        'ON company_addresses (address_type, company_id)'
    )


def downgrade() -> None:
    op.drop_index('idx_company_addresses_type_company', table_name='company_addresses')
    op.drop_index('idx_financial_values_metric_statement', table_name='financial_values')
    op.drop_index('idx_financial_statements_year_company', table_name='financial_statements')
