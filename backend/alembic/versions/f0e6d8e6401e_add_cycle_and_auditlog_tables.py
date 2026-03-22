"""Add Cycle and AuditLog tables

Revision ID: f0e6d8e6401e
Revises: d5cb9bf77071
Create Date: 2026-03-22 00:00:00.000000

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "f0e6d8e6401e"
down_revision = "d5cb9bf77071"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # === Таблица cycles ===
    op.create_table(
        "cycles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("start_date", sa.DateTime(), nullable=False),
        sa.Column("end_date", sa.DateTime(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=True, default=False),
        sa.Column("is_completed", sa.Boolean(), nullable=True, default=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_cycles_id"), "cycles", ["id"], unique=False)

    # === Таблица audit_logs ===
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("entity_type", sa.String(), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column(
            "action",
            sa.Enum(
                "create",
                "update",
                "delete",
                "status_change",
                "cycle_start",
                "cycle_complete",
                name="auditaaction",
            ),
            nullable=False,
        ),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=True),
        sa.Column("field_name", sa.String(), nullable=True),
        sa.Column("old_value", sa.Text(), nullable=True),
        sa.Column("new_value", sa.Text(), nullable=True),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_logs_id"), "audit_logs", ["id"], unique=False)
    op.create_index(
        op.f("ix_audit_logs_timestamp"), "audit_logs", ["timestamp"], unique=False
    )

    # === Добавление cycle_id в таблицу cards (SQLite batch mode) ===
    # КРИТИЧНО: Используем batch_alter_table для совместимости с SQLite
    with op.batch_alter_table("cards", schema=None) as batch_op:
        batch_op.add_column(sa.Column("cycle_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_cards_cycle_id",  # имя ограничения
            "cycles",  # целевая таблица
            ["cycle_id"],  # колонка в cards
            ["id"],  # колонка в cycles
        )


def downgrade() -> None:
    # Удаляем внешний ключ и колонку cycle_id из cards (через batch mode)
    with op.batch_alter_table("cards", schema=None) as batch_op:
        batch_op.drop_constraint("fk_cards_cycle_id", type_="foreignkey")
        batch_op.drop_column("cycle_id")

    # Удаляем индексы и таблицу audit_logs
    op.drop_index(op.f("ix_audit_logs_timestamp"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_id"), table_name="audit_logs")
    op.drop_table("audit_logs")

    # Удаляем индексы и таблицу cycles
    op.drop_index(op.f("ix_cycles_id"), table_name="cycles")
    op.drop_table("cycles")
