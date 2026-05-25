"""Create posts table.

Revision ID: 20260525_0002
Revises: 20260525_0001
Create Date: 2026-05-25
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260525_0002"
down_revision: Union[str, Sequence[str], None] = "20260525_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "posts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("visibility", sa.String(length=30), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("moderation_status", sa.String(length=30), nullable=False),
        sa.Column("moderation_reason", sa.String(length=500), nullable=True),
        sa.Column("moderated_by_id", sa.Integer(), nullable=True),
        sa.Column("moderated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["moderated_by_id"], ["users.id"]),
        sa.CheckConstraint(
            "visibility IN ('public', 'authenticated', 'private', 'staff_only')",
            name="ck_posts_visibility",
        ),
        sa.CheckConstraint(
            "moderation_status IN ('visible', 'hidden')",
            name="ck_posts_moderation_status",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_posts_author_id"), "posts", ["author_id"], unique=False)
    op.create_index(op.f("ix_posts_id"), "posts", ["id"], unique=False)
    op.create_index(op.f("ix_posts_moderated_by_id"), "posts", ["moderated_by_id"], unique=False)
    op.create_index(
        op.f("ix_posts_moderation_status"),
        "posts",
        ["moderation_status"],
        unique=False,
    )
    op.create_index(op.f("ix_posts_published_at"), "posts", ["published_at"], unique=False)
    op.create_index(op.f("ix_posts_visibility"), "posts", ["visibility"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_posts_visibility"), table_name="posts")
    op.drop_index(op.f("ix_posts_published_at"), table_name="posts")
    op.drop_index(op.f("ix_posts_moderation_status"), table_name="posts")
    op.drop_index(op.f("ix_posts_moderated_by_id"), table_name="posts")
    op.drop_index(op.f("ix_posts_id"), table_name="posts")
    op.drop_index(op.f("ix_posts_author_id"), table_name="posts")
    op.drop_table("posts")
