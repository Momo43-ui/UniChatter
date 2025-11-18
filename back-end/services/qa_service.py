# services/qa_service.py

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# On garde un cache en mémoire pour éviter de recalculer à chaque fois
_client_indexes = {}


class ClientIndex:
    def __init__(self, texts, ids):
        self.texts = texts          # liste de textes (documents ou chunks)
        self.ids = ids              # ids en base (id document par ex.)
        self.vectorizer = TfidfVectorizer(stop_words="french")
        self.matrix = self.vectorizer.fit_transform(self.texts)


def _build_index_for_client(cur, client_id):
    """
    Construit un index TF-IDF pour un client à partir de la table documents.
    Table attendue : documents(id, client_id, content)
    """
    sql = """
        SELECT id, content
        FROM documents
        WHERE client_id = %s
    """
    cur.execute(sql, (client_id,))
    rows = cur.fetchall()

    if not rows:
        return None

    ids = [r[0] for r in rows]
    texts = [r[1] for r in rows]

    return ClientIndex(texts, ids)


def get_answer_from_documents(cur, client_id, question, client_config, top_k=3):
    """
    Renvoie une réponse basée sur les documents du client.
    1. Construit ou récupère l'index TF-IDF pour le client
    2. Calcule la similarité de la question avec les textes
    3. Retourne le texte le plus pertinent comme 'réponse'
    """

    # 1. Récupérer ou construire l'index
    if client_id not in _client_indexes:
        index = _build_index_for_client(cur, client_id)
        if index is None:
            # Pas de documents => réponse générique
            answer = (
                "Je n'ai pas encore de documents pour cette entreprise, "
                "je ne peux donc pas répondre précisément à cette question."
            )
            return answer, []
        _client_indexes[client_id] = index

    index = _client_indexes[client_id]

    if not index.texts:
        answer = (
            "Je n'ai pas encore de contenu à analyser pour cette entreprise."
        )
        return answer, []

    # 2. Vectoriser la question
    question_vec = index.vectorizer.transform([question])

    # 3. Similarité cosinus avec tous les documents
    sims = cosine_similarity(question_vec, index.matrix)[0]  # vecteur 1D

    # 4. Obtenir les top_k indices
    ranked = sorted(
        enumerate(sims),
        key=lambda x: x[1],
        reverse=True
    )
    top = ranked[:top_k]

    # Si les similarités sont toutes très faibles, on peut renvoyer un message neutre
    if top[0][1] < 0.05:
        answer = (
            "Je n'ai pas trouvé d'information suffisamment pertinente dans les documents "
            "pour répondre à cette question."
        )
        return answer, []

    # 5. Construire une réponse simple à partir du meilleur document
    best_idx = top[0][0]
    best_text = index.texts[best_idx]

    # On peut enrichir un peu la réponse
    style = client_config.get("style", "")
    instructions = client_config.get("instructions", "")

    answer = (
        f"{style}\n\n"
        f"{instructions}\n\n"
        f"Voici ce que j'ai trouvé dans les documents de l'entreprise :\n\n"
        f"{best_text}"
    )

    # Sources : liste d'ID de documents utilisés
    sources = [index.ids[i] for (i, _) in top]

    return answer, sources
