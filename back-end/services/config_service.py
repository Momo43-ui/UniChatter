# services/config_service.py

def load_client_config(cur, client_id):
    """
    Charge la configuration IA pour un client.
    Table attendue : config_ia_clients (client_id, style, instructions)
    Tu adapteras les colonnes en fonction de ton schéma réel.
    """
    sql = """
        SELECT style, instructions
        FROM config_ia_clients
        WHERE client_id = %s
        LIMIT 1
    """
    try:
        cur.execute(sql, (client_id,))
        row = cur.fetchone()
    except Exception:
        # Si la table/colonnes n'existent pas encore, on renvoie un défaut
        row = None

    if not row:
        return {
            "style": "Réponds de manière claire et professionnelle.",
            "instructions": ""
        }

    return {
        "style": row[0] or "Réponds de manière claire et professionnelle.",
        "instructions": row[1] or ""
    }
