CREATE OR REPLACE FUNCTION get_learning_session(
    p_user_id uuid,
    p_limit int
)
RETURNS SETOF vocabulary
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_review_count int;
    v_new_count int;
BEGIN
    -- 1. Tekrar zamanı gelmiş kelimeleri çek (Review Words)
    RETURN QUERY
    SELECT v.*
    FROM user_progress up
    JOIN vocabulary v ON up.vocab_id = v.id
    WHERE up.user_id = p_user_id
      AND up.next_review <= now()
      AND up.is_mastered = false -- Master edilenleri getirme
    ORDER BY up.next_review ASC
    LIMIT p_limit;

    -- Kaç tane review kelimesi çekildiğini bul
    GET DIAGNOSTICS v_review_count = ROW_COUNT;

    -- Eğer limit dolmadıysa, geri kalanı yeni kelimelerle doldur
    IF v_review_count < p_limit THEN
        v_new_count := p_limit - v_review_count;

        RETURN QUERY
        SELECT v.*
        FROM vocabulary v
        WHERE NOT EXISTS (
            SELECT 1 FROM user_progress up 
            WHERE up.vocab_id = v.id AND up.user_id = p_user_id
        )
        ORDER BY random()
        LIMIT v_new_count;
    END IF;
END;
$$;
