# ai-service/app/knowledge/prompt_builder.py
# Constructs the system prompt from PortfolioKnowledge.
# Separated from the service so it can be tested and tuned independently.
# The prompt is the only place portfolio data enters the AI context.

from app.knowledge.portfolio import PortfolioKnowledge, PORTFOLIO_KNOWLEDGE


def build_system_prompt(knowledge: PortfolioKnowledge = PORTFOLIO_KNOWLEDGE) -> str:
    c = knowledge.contact
    sections: list[str] = []

    # ── Identity ──────────────────────────────────────────────────────────────
    sections.append(f"""\
You are an AI assistant representing {c.name}, {c.title}.
Your role is to answer questions from potential clients, recruiters, and collaborators \
about {c.name}'s background, projects, skills, services, and availability.

Tone: professional, direct, and confident — matching {c.name}'s engineering voice.
Never fabricate information. If you don't know something, say so and direct the visitor \
to contact {c.name} directly at {c.email}.
Keep responses concise unless the visitor asks for detail.
Always refer to {c.name} in the third person (he/him).\
""")

    # ── Professional summary ──────────────────────────────────────────────────
    sections.append(f"""\
## Professional Summary
{c.name} is a {c.title} with {knowledge.years_of_experience}+ years of experience.
{knowledge.bio}
{knowledge.tagline}
Availability: {c.availability}
Response time: {c.response_time}\
""")

    # ── Contact ───────────────────────────────────────────────────────────────
    sections.append(f"""\
## Contact Information
Email: {c.email}
Phone: {c.phone}
Location: {c.location} ({c.timezone})
GitHub: {c.github}
LinkedIn: {c.linkedin}
Book a call: {c.calendly_url}
Resume: {c.site_url}{c.resume_url}\
""")

    # ── Career timeline ───────────────────────────────────────────────────────
    career_lines = ["## Career Timeline"]
    for entry in knowledge.career:
        current_tag = " (Current)" if entry.current else ""
        career_lines.append(f"\n### {entry.role} — {entry.company}{current_tag}")
        career_lines.append(f"Period: {entry.period}")
        career_lines.append("Key achievements:")
        for h in entry.highlights:
            career_lines.append(f"  - {h}")
        career_lines.append(f"Technologies: {', '.join(entry.technologies)}")
    sections.append("\n".join(career_lines))

    # ── Projects ──────────────────────────────────────────────────────────────
    project_lines = ["## Projects"]
    for p in knowledge.projects:
        project_lines.append(f"\n### {p.title} ({p.year})")
        project_lines.append(f"Category: {p.category} | Role: {p.role}")
        project_lines.append(f"Summary: {p.description}")
        project_lines.append(f"Outcome: {p.outcome}")
        project_lines.append(f"Technologies: {', '.join(p.technologies)}")
        project_lines.append(f"Metrics: {' | '.join(p.metrics)}")
    sections.append("\n".join(project_lines))

    # ── Skills ────────────────────────────────────────────────────────────────
    # Group by category for readability
    from collections import defaultdict
    by_category: dict[str, list] = defaultdict(list)
    for s in knowledge.skills:
        by_category[s.category].append(s)

    skill_lines = ["## Skills"]
    for category, skills in by_category.items():
        skill_lines.append(f"\n{category.title()}:")
        for s in skills:
            skill_lines.append(f"  - {s.name} ({s.level}, {s.years}yr): {s.context}")
    sections.append("\n".join(skill_lines))

    # ── Services ──────────────────────────────────────────────────────────────
    service_lines = ["## Services Offered"]
    for s in knowledge.services:
        service_lines.append(f"\n### {s.title}")
        service_lines.append(f"{s.tagline}")
        service_lines.append(f"Engagement: {s.engagement} | Duration: {s.duration}")
        service_lines.append(f"Deliverables: {', '.join(s.deliverables)}")
    sections.append("\n".join(service_lines))

    # ── FAQ ───────────────────────────────────────────────────────────────────
    faq_lines = ["## Frequently Asked Questions"]
    for f in knowledge.faq:
        faq_lines.append(f"\nQ: {f.question}")
        faq_lines.append(f"A: {f.answer}")
    sections.append("\n".join(faq_lines))

    # ── Closing instruction ───────────────────────────────────────────────────
    sections.append(f"""\
## Instructions
- Answer questions using only the information above.
- For pricing or project-specific scoping, direct the visitor to book a call: {c.calendly_url}
- For anything not covered above, say: "I don't have that information — please reach out to {c.name} directly at {c.email}."
- Never invent project names, client names, or metrics not listed above.\
""")

    return "\n\n---\n\n".join(sections)
