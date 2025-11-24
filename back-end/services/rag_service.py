import os
import numpy as np
from PyPDF2 import PdfReader
import docx

DOCUMENTS_FOLDER = "documents/"
_cache = None

# ---- CONFIG ----
CHUNK_SIZE = 400   # nombre de mots par chunk
TOP_K = 3          # nombre de chunks renvoyés


# ------------ UTILITAIRES ------------

def chunk_text(text, chunk_size=CHUNK_SIZE):
    """Découpe un texte en chunks de ~400 mots."""
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk_words = words[i:i + chunk_size]
        chunk_text = " ".join(chunk_words)
        chunks.append(chunk_text)

    return chunks


def tokenize(text):
    """Tokenize simple."""
    return text.lower().split()


def cosine(a, b):
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


# ------------ LOADING DES DOCUMENTS ------------

def load_documents():
    texts = []
    sources = []

    if not os.path.exists(DOCUMENTS_FOLDER):
        return texts, sources

    for filename in os.listdir(DOCUMENTS_FOLDER):
        path = os.path.join(DOCUMENTS_FOLDER, filename)

        # Lecture TXT
        if filename.lower().endswith(".txt"):
            with open(path, "r", encoding="utf-8") as f:
                text = f.read()
                chunks = chunk_text(text)
                for chunk in chunks:
                    texts.append(chunk)
                    sources.append(filename)

        # Lecture PDF
        elif filename.lower().endswith(".pdf"):
            try:
                reader = PdfReader(path)
                full_text = ""
                for page in reader.pages:
                    full_text += (page.extract_text() or "") + "\n"
                chunks = chunk_text(full_text)
                for chunk in chunks:
                    texts.append(chunk)
                    sources.append(filename)
            except Exception as e:
                print(f"[PDF ERROR] {filename}: {e}")

        # Lecture DOCX
        elif filename.lower().endswith(".docx"):
            try:
                doc_file = docx.Document(path)
                full_text = "\n".join([p.text for p in doc_file.paragraphs])
                chunks = chunk_text(full_text)
                for chunk in chunks:
                    texts.append(chunk)
                    sources.append(filename)
            except Exception as e:
                print(f"[DOCX ERROR] {filename}: {e}")

    return texts, sources


# ------------ INDEXATION ------------

def build_index():
    texts, sources = load_documents()

    if not texts:
        return None

    # Construction du vocabulaire global
    vocab = {}
    docs_tokens = []

    for text in texts:
        tokens = tokenize(text)
        docs_tokens.append(tokens)
        for t in tokens:
            if t not in vocab:
                vocab[t] = len(vocab)

    # Matrice Document-Term
    matrix = np.zeros((len(texts), len(vocab)))

    for i, tokens in enumerate(docs_tokens):
        for t in tokens:
            idx = vocab.get(t)
            if idx is not None:
                matrix[i][idx] += 1

    return {
        "texts": texts,
        "sources": sources,
        "vocab": vocab,
        "matrix": matrix,
    }


# ------------ RECHERCHE (RAG) ------------

def get_context(question: str, top_k=TOP_K):
    global _cache

    if _cache is None:
        print(">> Reconstruction du RAG index…")
        _cache = build_index()

    if _cache is None:
        return "Aucun document trouvé.", []

    vocab = _cache["vocab"]
    matrix = _cache["matrix"]
    texts = _cache["texts"]
    sources = _cache["sources"]

    # Vectorisation de la question
    q_vec = np.zeros(len(vocab))
    for t in tokenize(question):
        if t in vocab:
            q_vec[vocab[t]] += 1

    # Similarité cosinus
    similarities = [cosine(q_vec, doc_vec) for doc_vec in matrix]

    # Classement
    ranked = sorted(enumerate(similarities), key=lambda x: x[1], reverse=True)
    top = ranked[:top_k]

    if top[0][1] < 0.01:
        return "Je n'ai pas trouvé d'informations pertinentes dans les documents.", []

    # Concaténation des top chunks
    context = "\n\n---\n\n".join([texts[i] for i, score in top])
    selected_sources = [sources[i] for i, score in top]

    return context, selected_sources