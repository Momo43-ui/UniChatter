import requests

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "phi3"  # ou phi3 / mistral / llama3:3b etc.


def generate_answer(question: str, context: str, history=None) -> str:
    """
    history: liste de dicts [{"role":"user/assistant","content":"..."}]
    """

    if history is None:
        history = []

    system_prompt = (
        "Tu es un assistant chaleureux, accueillant et professionnel destiné à des clients B2C. "
        "Tu réponds toujours de manière très courte, simple et agréable (une phrase maximum). "
        "Tu utilises uniquement les informations présentes dans le contexte fourni. "
        "Si la question ne correspond pas aux services présents dans le contexte, "
        "tu réponds de façon douce : 'Désolé, nous ne proposons pas ce service.' "
        "Tu ne fais aucune supposition, aucune invention, aucune information non vérifiée."
    )

    # On injecte le contexte comme un message système additionnel
    context_message = {
        "role": "system",
        "content": f"Contexte issu des documents de l'entreprise :\n{context}"
    }

    messages = [{"role": "system", "content": system_prompt}]
    messages.append(context_message)

    # Ajoute l’historique (dernier MAX_TURNS côté app.py)
    messages.extend(history)

    # Redonne la question actuelle (sécurité)
    messages.append({"role": "user", "content": question})

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": False
    }

    resp = requests.post(OLLAMA_URL, json=payload, timeout=120)
    resp.raise_for_status()
    data = resp.json()

    return data["message"]["content"]
