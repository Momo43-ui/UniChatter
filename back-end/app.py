from flask import Flask, request, jsonify, send_from_directory
from services.qa_service import get_answer

app = Flask(__name__, static_folder="static")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message")

    if not message:
        return jsonify({"error": "Missing message"}), 400

    answer, sources = get_answer(message)

    return jsonify({
        "response": answer,
        "sources": sources
    })


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "test_chat.html")


if __name__ == "__main__":
    app.run(debug=True)
