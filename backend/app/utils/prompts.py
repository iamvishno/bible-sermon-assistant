"""
AI Prompt Templates for Sermon Generation
Optimized for token efficiency and quality output
"""

from app.models.sermon import SermonConfig


def get_sermon_prompt(verse_texts: list[str], config: SermonConfig) -> str:
    """
    Generate sermon prompt based on configuration.

    Args:
        verse_texts: List of verse text strings
        config: Sermon configuration

    Returns:
        Formatted prompt string
    """
    verses_combined = "\n".join([f"- {verse}" for verse in verse_texts])

    # Sermon type instructions
    type_instructions = {
        "expository": "Provide verse-by-verse exposition, explaining the original meaning and context.",
        "topical": "Organize the sermon around a central theme derived from the verses.",
        "narrative": "Tell the story in the verses, bringing out lessons and applications.",
        "devotional": "Focus on personal spiritual growth and daily application.",
    }

    # Audience adjustments
    audience_notes = {
        "youth": "Use relatable examples for young people (ages 15-25).",
        "children": "Use simple language and stories suitable for ages 6-12.",
        "adults": "Address mature life topics like career, marriage, parenting.",
        "seniors": "Focus on wisdom, legacy, and faith in later years.",
        "general": "Balance accessibility with depth for mixed audience.",
    }

    # Tone adjustments
    tone_notes = {
        "formal": "Use proper theological terminology and structured arguments.",
        "casual": "Use conversational language and everyday examples.",
        "passionate": "Use emotive language and urgent calls to action.",
        "gentle": "Use comforting language and encouraging tone.",
    }

    # Point count based on length
    point_count_map = {
        10: 2,
        15: 3,
        20: 3,
        30: 4,
        45: 5,
    }
    point_count = point_count_map.get(config.length_minutes, 3)

    # Build prompt
    prompt = f"""Generate a {config.sermon_type} sermon in Telugu language.

VERSE(S):
{verses_combined}

SERMON CONFIGURATION:
- Type: {config.sermon_type} - {type_instructions.get(config.sermon_type, '')}
- Target Audience: {config.target_audience} - {audience_notes.get(config.target_audience, '')}
- Length: {config.length_minutes} minutes (approx {config.length_minutes * 150} words)
- Tone: {config.tone} - {tone_notes.get(config.tone, '')}
- Include Illustrations: {'Yes' if config.include_illustrations else 'No'}

REQUIREMENTS:
1. Write entirely in Telugu language (తెలుగు)
2. Include {point_count} main points
3. Each point should have:
   - Clear biblical point
   - Explanation from the verse
   {"- Practical illustration or story" if config.include_illustrations else ""}
4. Provide practical application for daily life
5. Include 3-5 prayer points
6. Maintain theological accuracy

OUTPUT FORMAT (JSON only, no markdown):
{{
  "title": "Sermon title in Telugu",
  "introduction": "Introduction paragraph in Telugu (2-3 sentences setting context)",
  "main_points": [
    {{
      "point": "Main point 1 in Telugu",
      "explanation": "Detailed explanation in Telugu (3-4 sentences)",
      "illustration": "{"Real-life illustration or story in Telugu" if config.include_illustrations else "null"}"
    }},
    ... ({point_count} points total)
  ],
  "application": "Practical application section in Telugu (3-4 sentences)",
  "conclusion": "Conclusion paragraph in Telugu (2-3 sentences with call to action)",
  "prayer_points": [
    "Prayer point 1 in Telugu",
    "Prayer point 2 in Telugu",
    "Prayer point 3 in Telugu"
  ]
}}

Generate the sermon now:"""

    return prompt


def get_devotional_prompt(verse_texts: list[str]) -> str:
    """
    Generate simplified devotional prompt.

    Args:
        verse_texts: List of verse text strings

    Returns:
        Formatted prompt string
    """
    verses_combined = "\n".join([f"- {verse}" for verse in verse_texts])

    prompt = f"""Generate a short devotional message in Telugu language.

VERSE(S):
{verses_combined}

Generate a brief devotional with:
1. Short introduction (1-2 sentences)
2. Main message (2-3 sentences)
3. Daily application (1-2 sentences)
4. Prayer point

OUTPUT FORMAT (JSON only):
{{
  "title": "Devotional title in Telugu",
  "introduction": "Introduction in Telugu",
  "message": "Main devotional message in Telugu",
  "application": "How to apply today in Telugu",
  "prayer": "Short prayer in Telugu"
}}"""

    return prompt


def get_verse_explanation_prompt(verse_text: str, level: str = "standard") -> str:
    """
    Generate verse explanation prompt.

    Args:
        verse_text: Verse text to explain
        level: simple, standard, or deep

    Returns:
        Formatted prompt string
    """
    depth_instructions = {
        "simple": "Explain in simple terms suitable for new believers. Use everyday language.",
        "standard": "Provide balanced explanation with context and meaning. Suitable for regular church members.",
        "deep": "Provide scholarly exposition with original language insights, historical context, and theological implications.",
    }

    prompt = f"""Explain this Bible verse in Telugu language.

VERSE: {verse_text}

EXPLANATION LEVEL: {level}
{depth_instructions.get(level, depth_instructions['standard'])}

OUTPUT FORMAT (JSON only):
{{
  "explanation": "Detailed explanation in Telugu (3-5 sentences)",
  "key_themes": ["theme 1", "theme 2", "theme 3"],
  "application": "How to apply this verse in daily life (Telugu, 2-3 sentences)",
  "cross_references": ["Book Chapter:Verse", "..."] (optional, if relevant)
}}"""

    return prompt


def get_translation_prompt(
    text: str,
    source_language: str,
    target_language: str
) -> str:
    """
    Generate translation prompt.

    Args:
        text: Text to translate
        source_language: Source language
        target_language: Target language

    Returns:
        Formatted prompt string
    """
    prompt = f"""Translate this Christian/Biblical text accurately.

SOURCE LANGUAGE: {source_language}
TARGET LANGUAGE: {target_language}

TEXT TO TRANSLATE:
{text}

REQUIREMENTS:
1. Maintain theological accuracy
2. Preserve Biblical terminology
3. Use natural language for target audience
4. Keep formatting and structure

Provide only the translated text, no explanations."""

    return prompt


# Sermon type templates for future expansion
SERMON_TEMPLATES = {
    "expository": {
        "description": "Verse-by-verse exposition explaining the biblical text",
        "structure": ["Context", "Explanation", "Application"],
        "min_points": 2,
        "max_points": 5,
    },
    "topical": {
        "description": "Theme-based sermon using multiple verses",
        "structure": ["Theme Introduction", "Biblical Support", "Modern Application"],
        "min_points": 3,
        "max_points": 5,
    },
    "narrative": {
        "description": "Story-based sermon following biblical narrative",
        "structure": ["Story Setup", "Story Development", "Story Conclusion", "Lessons"],
        "min_points": 3,
        "max_points": 4,
    },
    "devotional": {
        "description": "Short personal reflection for daily inspiration",
        "structure": ["Verse", "Reflection", "Application", "Prayer"],
        "min_points": 1,
        "max_points": 2,
    },
}


def get_sermon_template_info(sermon_type: str) -> dict:
    """Get template information for a sermon type"""
    return SERMON_TEMPLATES.get(sermon_type, SERMON_TEMPLATES["expository"])
