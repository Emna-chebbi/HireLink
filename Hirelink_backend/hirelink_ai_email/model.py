from dataclasses import dataclass
from typing import Optional, Literal
import os
import requests

EmailType = Literal["refus", "relance", "invitation"]


@dataclass
class EmailContext:
    candidate_name: str
    candidate_email: str
    job_title: str
    company_name: str
    application_date: str  # "YYYY-MM-DD"
    interview_date: Optional[str]  # None ou "" si non applicable
    email_type: EmailType
    language: str = "fr"
    tone: str = "professionnel"


def build_prompt(ctx: EmailContext) -> str:
    base_context = (
        f"Contexte de recrutement :\n"
        f"- Candidat : {ctx.candidate_name}\n"
        f"- Poste : {ctx.job_title}\n"
        f"- Entreprise : {ctx.company_name}\n"
        f"- Date de candidature : {ctx.application_date}\n"
    )

    if ctx.interview_date:
        base_context += f"- Date d'entretien prévue : {ctx.interview_date}\n"

    if ctx.email_type == "refus":
        objective = (
            "Rédige un email de refus de candidature en français, "
            "au ton {tone}, poli et respectueux, "
            "sans proposer d'autre poste concret."
        )
    elif ctx.email_type == "relance":
        objective = (
            "Rédige un email de relance pour un candidat encore en cours de process, "
            "en français, au ton {tone}, en demandant s'il est toujours intéressé."
        )
    elif ctx.email_type == "invitation":
        objective = (
            "Rédige un email d'invitation à un entretien pour ce poste, "
            "en français, au ton {tone}, en mentionnant la date d'entretien indiquée."
        )
    else:
        raise ValueError(f"Type d'email non supporté: {ctx.email_type}")

    guidelines = (
        "Contraintes de rédaction :\n"
        "- Adresse directement le candidat par son prénom ou nom.\n"
        "- Garde un ton professionnel et humain.\n"
        "- Ne dépasse pas quelques paragraphes.\n"
        "- Ne change pas les informations factuelles (nom, poste, entreprise, date).\n"
    )

    prompt = (
        "Tu es un assistant IA spécialisé en recrutement.\n"
        f"{base_context}\n"
        f"{objective.format(tone=ctx.tone)}\n\n"
        f"{guidelines}\n"
        "Réponse attendue : uniquement le corps de l'email, sans balises HTML."
    )

    return prompt


def call_llm_api(prompt: str) -> str:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("La variable d'environnement OPENROUTER_API_KEY n'est pas définie.")

    # DEBUG : afficher le début de la clé et le modèle
    print("Using OpenRouter key prefix:", api_key[:8], "...")
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "HireLink AI Email Assistant",
    }

    data = {
        "model": "openai/gpt-oss-120b:free",
        "messages": [
            {
                "role": "system",
                "content": "Tu es un assistant IA pour un site de recrutement. "
                           "Tu rédiges des emails professionnels en français pour les candidats.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.4,
    }

    response = requests.post(url, headers=headers, json=data, timeout=30)
    print("Status code:", response.status_code)  # DEBUG
    print("Response text:", response.text[:300])  # DEBUG début du body
    response.raise_for_status()
    payload = response.json()

    try:
        return payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        raise RuntimeError(f"Réponse inattendue de l'API OpenRouter: {payload}")


def generate_email(ctx: EmailContext) -> str:
    prompt = build_prompt(ctx)
    generated = call_llm_api(prompt)
    return generated


if __name__ == "__main__":
    print("=== Assistant IA HireLink – Génération d'email ===")

    candidate_name = input("Nom du candidat : ").strip()
    candidate_email = input("Email du candidat : ").strip()
    job_title = input("Intitulé du poste : ").strip()
    company_name = input("Nom de l'entreprise : ").strip()
    application_date = input("Date de candidature (YYYY-MM-DD) : ").strip()

    email_type = input("Type d'email (refus | relance | invitation) : ").strip().lower()
    if email_type not in ("refus", "relance", "invitation"):
        raise ValueError("Type d'email invalide.")

    interview_date = None
    if email_type == "invitation":
        interview_date_input = input("Date d'entretien (YYYY-MM-DD) : ").strip()
        interview_date = interview_date_input or None

    # Tu peux laisser language/tone par défaut pour l'instant
    language = "fr"
    tone = "professionnel"

    # ICI on crée bien le contexte ctx
    ctx = EmailContext(
        candidate_name=candidate_name,
        candidate_email=candidate_email,
        job_title=job_title,
        company_name=company_name,
        application_date=application_date,
        interview_date=interview_date,
        email_type=email_type,
        language=language,
        tone=tone,
    )

    # Puis on l'utilise
    email_body = generate_email(ctx)

    print("\n=== EMAIL GÉNÉRÉ ===")
    print(email_body)
