# services/qa_service.py

import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from PyPDF2 import PdfReader
import docx

DOCUMENTS_FOLDER = "documents/"
_index_cache = None  # on garde l’index en mémoire


def load_local_documents():
    texts = []
    sources = []

    for filename in os.listdir(DOCUMENTS_FOLDER):
        path = os.path.join(DOCUMENTS_FOLDER, filename)

        if filename.endswith(".txt"):
            with open(path, "r", encoding="utf-8") as f:
                texts.append(f.read())
                sources.append(filename)

        elif filename.endswith(".pdf"):
            try:
                reader = PdfReader(path)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                texts.append(text)
                sources.append(filename)
            except:
                print(f"Erreur lecture PDF : {filename}")

        elif filename.endswith(".docx"):
            try:
                doc = docx.Document(path)
                full_text = "\n".join([p.text for p in doc.paragraphs])
                texts.append(full_text)
                sources.append(filename)
            except:
                print(f"Erreur lecture DOCX : {filename}")

    return texts, sources


def build_index():
    texts, sources = load_local_documents()

    vectorizer = TfidfVectorizer(stop_words=None)
    matrix = vectorizer.fit_transform(texts)

    return {
        "texts": texts,
        "sources": sources,
        "vectorizer": vectorizer,
        "matrix": matrix
    }


def get_answer(question, top_k=2):
    global _index_cache

    # Construire l'index une seule fois
    if _index_cache is None:
        _index_cache = build_index()

    index = _index_cache

    if not index["texts"]:
        return "Aucun document chargé.", []

    # Vectoriser la question
    q_vec = index["vectorizer"].transform([question])

    # Similarité cosinus
    sims = cosine_similarity(q_vec, index["matrix"])[0]

    ranked = sorted(
        enumerate(sims),
        key=lambda x: x[1],
        reverse=True
    )

    top = ranked[:top_k]

    if top[0][1] < 0.05:
        return "Je n'ai rien trouvé de pertinent dans les documents.", []

    answer_text = index["texts"][top[0][0]]
    source = index["sources"][top[0][0]]

    return answer_text, [source]
