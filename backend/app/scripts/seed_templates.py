"""
Скрипт для заполнения БД начальными шаблонами промтов и документов.
Запуск: python -m app.scripts.seed_templates
"""

from app.core.database import SessionLocal, engine
from app.models.ai_provider import AIProvider
from app.models.template import DocumentTemplate, PromptTemplate, TemplateType

# === Начальные промты ===
PROMPT_TEMPLATES = [
    {
        "name": "Why Meta Card",
        "template_type": TemplateType.prompt_meta_why,
        "prompt_text": 'Создай обоснование проекта "{{project_name}}". Опиши: 1) Какую проблему решает проект, 2) Какие выгоды принесёт, 3) Почему это важно сделать сейчас. {{project_description}}',
        "system_prompt": "Ты опытный продукт-менеджер. Помогай формулировать цели проектов ясно и убедительно. Отвечай структурированно, по-русски.",
        "default_model": "llama3.2",
        "default_temperature": 7,
        "default_max_tokens": 2048,
        "description": "Генерация мета-карточки Why (Зачем этот проект)",
        "is_active": True,
        "is_default": True,
    },
    {
        "name": "Requirements Meta Card",
        "template_type": TemplateType.prompt_meta_requirements,
        "prompt_text": 'Создай требования к проекту "{{project_name}}". Опиши: 1) Функциональные требования, 2) Нефункциональные требования, 3) Критерии успеха. {{project_description}}',
        "system_prompt": "Ты старший системный аналитик. Составляй полные и точные требования. Отвечай структурированно, по-русски.",
        "default_model": "llama3.2",
        "default_temperature": 7,
        "default_max_tokens": 2048,
        "description": "Генерация мета-карточки Requirements",
        "is_active": True,
        "is_default": True,
    },
    {
        "name": "Stakeholders Meta Card",
        "template_type": TemplateType.prompt_meta_stakeholders,
        "prompt_text": 'Опиши заинтересованные лица проекта "{{project_name}}". Кто влияет на проект и кто зависит от результата? Их роли, интересы и ожидания. {{project_description}}',
        "system_prompt": "Ты опытный бизнес-аналитик. Выявляй всех стейкхолдеров и их потребности. Отвечай структурированно, по-русски.",
        "default_model": "llama3.2",
        "default_temperature": 7,
        "default_max_tokens": 2048,
        "description": "Генерация мета-карточки Stakeholders",
        "is_active": True,
        "is_default": True,
    },
    {
        "name": "Card Description",
        "template_type": TemplateType.prompt_card_description,
        "prompt_text": 'Создай подробное описание для задачи: "{{card_title}}". Включи: 1) Цель задачи, 2) Шаги для выполнения, 3) Критерии готовности (Definition of Done). {{card_context}}',
        "system_prompt": "Ты опытный тимлид. Помогай формулировать задачи чётко и выполнимо. Отвечай структурированно, по-русски.",
        "default_model": "llama3.2",
        "default_temperature": 7,
        "default_max_tokens": 2048,
        "description": "Генерация описания карточки задачи",
        "is_active": True,
        "is_default": True,
    },
]

# === Начальные шаблоны документов ===
DOCUMENT_TEMPLATES = [
    {
        "name": "Project Brief",
        "template_type": TemplateType.doc_project_brief,
        "content_template": """# Project Brief: {{project_name}}

## Описание
{{project_description}}

## Обоснование (Why)
{{meta_why_content}}

## Требования
{{meta_requirements_content}}

## Заинтересованные лица
{{meta_stakeholders_content}}

## Статистика
- Всего задач: {{total_cards}}
- В работе: {{in_progress_cards}}
- Готово: {{completed_cards}}

---
Сгенерировано: {{generated_at}}
""",
        "output_format": "markdown",
        "description": "Краткая сводка по проекту",
        "is_active": True,
        "is_default": True,
    },
    {
        "name": "Status Report",
        "template_type": TemplateType.doc_status_report,
        "content_template": """# Status Report: {{project_name}}
**Отчёт за период:** {{report_period}}

## Выполнено за период
{{completed_cards_list}}

## В работе
{{in_progress_cards_list}}

## Риски и проблемы
{{risks_issues}}

## Планы на следующий период
{{next_period_plans}}

---
Сгенерировано: {{generated_at}}
""",
        "output_format": "markdown",
        "description": "Еженедельный статус-отчёт",
        "is_active": True,
        "is_default": True,
    },
]


def seed_templates():
    """Заполнить БД начальными шаблонами."""
    db = SessionLocal()

    try:
        # Prompt Templates
        for prompt_data in PROMPT_TEMPLATES:
            existing = (
                db.query(PromptTemplate)
                .filter(PromptTemplate.template_type == prompt_data["template_type"])
                .first()
            )
            if not existing:
                template = PromptTemplate(**prompt_data)
                db.add(template)
                print(f"✓ Created prompt template: {prompt_data['name']}")
            else:
                print(f"⊘ Skip prompt template: {prompt_data['name']} (exists)")

        # Document Templates
        for doc_data in DOCUMENT_TEMPLATES:
            existing = (
                db.query(DocumentTemplate)
                .filter(DocumentTemplate.template_type == doc_data["template_type"])
                .first()
            )
            if not existing:
                template = DocumentTemplate(**doc_data)
                db.add(template)
                print(f"✓ Created document template: {doc_data['name']}")
            else:
                print(f"⊘ Skip document template: {doc_data['name']} (exists)")

        db.commit()
        print("\n✓ Template seeding complete!")

    except Exception as e:
        db.rollback()
        print(f"✗ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_templates()
