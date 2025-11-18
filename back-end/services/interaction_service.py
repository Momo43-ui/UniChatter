# services/interaction_service.py

def save_interaction(cur, conn, client_id, user_message, bot_response):
    """
    Sauvegarde une interaction dans historique_interactions.
    Table attendue : 
      historique_interactions(client_id, user_message, bot_response, created_at)
    """
    sql = """
        INSERT INTO historique_interactions
        (client_id, user_message, bot_response, created_at)
        VALUES (%s, %s, %s, NOW())
    """
    cur.execute(sql, (client_id, user_message, bot_response))
    conn.commit()
