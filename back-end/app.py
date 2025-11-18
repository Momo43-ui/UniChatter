from flask import Flask, request, jsonify, send_from_directory
import psycopg2
from services.config_service import load_client_config
from services.interaction_service import save_interaction
from services.qa_service import get_answer_from_documents

app = Flask(__name__, static_folder="static")

DB_CONFIG = {
    "dbname": "innov_ia",
    "user": "innov_rw",
    "password": "TON_PASSWORD",  # à adapter
    "host": "172.16.145.70",
    "port": "5432"
}


def db_connect():
    return psycopg2.connect(**DB_CONFIG)


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    client_id = data.get("client_id")
    message = data.get("message")

    if not client_id or not message:
        return jsonify({"error": "Missing client_id or message"}), 400

    conn = db_connect()
    cur = conn.cursor()

    # 1. Charger la config du client (style, etc.) – optionnel mais prêt
    client_config = load_client_config(cur, client_id)

    # 2. Obtenir une réponse basée sur les documents du client
    answer, sources = get_answer_from_documents(cur, client_id, message, client_config)

    # 3. Sauvegarder l'interaction
    save_interaction(cur, conn, client_id, message, answer)

    cur.close()
    conn.close()

    return jsonify({
        "response": answer,
        "sources": sources
    })


# Servir le front de test
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "test_chat.html")


if __name__ == "__main__":
    app.run(debug=True)
