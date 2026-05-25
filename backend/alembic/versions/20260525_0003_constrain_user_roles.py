"""Constrain user roles to application roles.

Revision ID: 20260525_0003
Revises: 20260525_0002
Create Date: 2026-05-25
"""

from typing import Sequence, Union

from alembic import op


revision: str = "20260525_0003"
down_revision: Union[str, Sequence[str], None] = "20260525_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "UPDATE users SET role = 'user' "
        "WHERE role NOT IN ('user', 'moderator', 'admin')"
    )
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('user', 'moderator', 'admin')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
