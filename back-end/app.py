from flask import Flask, request, jsonify, send_from_directory
from services.rag_service import get_context
from services.llm_local_service import generate_answer

import uuid

app = Flask(__name__, static_folder="static")

# Mémoire en RAM : { session_id: [ {"role":..,"content":..}, ... ] }
CHAT_MEMORY = {}
MAX_TURNS = 8  # garde ~8 messages (4 tours user/assistant)


def get_or_create_session_id(data):
    sid = data.get("session_id")
    if not sid:
        sid = str(uuid.uuid4())
    return sid


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({"error": "Missing message"}), 400

    # 1) session
    session_id = get_or_create_session_id(data)
    history = CHAT_MEMORY.get(session_id, [])

    # 2) Ajoute le message user à l’historique
    history.append({"role": "user", "content": message})

    # 3) RAG = contexte depuis docs locaux
    context, sources = get_context(message, top_k=3)

    # 4) Génération avec historique + contexte
    try:
        answer = generate_answer(
            question=message,
            context=context,
            history=history[-MAX_TURNS:]  # on ne garde que les derniers
        )
    except Exception as e:
        return jsonify({
            "error": "Erreur lors de l'appel au modèle local",
            "details": str(e)
        }), 500

    # 5) Ajoute la réponse assistant à l’historique
    history.append({"role": "assistant", "content": answer})

    # 6) Sauvegarde en RAM
    CHAT_MEMORY[session_id] = history[-MAX_TURNS:]

    return jsonify({
        "session_id": session_id,
        "response": answer,
        "sources": sources
    })


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "test_chat.html")


if __name__ == "__main__":
    app.run(debug=True)
