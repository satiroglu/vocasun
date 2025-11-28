CREATE OR REPLACE FUNCTION save_user_progress(
    p_user_id uuid,
    p_vocab_id int,
    p_is_correct boolean,
    p_is_mastered boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_interval int;
    v_current_ease_factor float;
    v_current_repetitions int;
    v_current_is_mastered boolean;
    v_new_interval int;
    v_new_ease_factor float;
    v_new_repetitions int;
    v_new_is_mastered boolean;
    v_next_review timestamptz;
BEGIN
    -- 1. Mevcut ilerlemeyi çek
    SELECT 
        COALESCE(interval, 0),
        COALESCE(ease_factor, 2.5),
        COALESCE(repetitions, 0),
        COALESCE(is_mastered, false)
    INTO 
        v_current_interval,
        v_current_ease_factor,
        v_current_repetitions,
        v_current_is_mastered
    FROM user_progress
    WHERE user_id = p_user_id AND vocab_id = p_vocab_id;

    -- Eğer kayıt yoksa varsayılanları ata
    IF NOT FOUND THEN
        v_current_interval := 0;
        v_current_ease_factor := 2.5;
        v_current_repetitions := 0;
        v_current_is_mastered := false;
    END IF;

    -- 2. Yeni değerleri hesapla (SM-2 Algoritması)
    
    IF p_is_mastered THEN
        -- "Biliyorum" butonu: Uzun süre sorma ve master et
        v_new_interval := 100;
        v_new_ease_factor := 3.0;
        v_new_repetitions := v_current_repetitions + 1;
        v_new_is_mastered := true;
    ELSIF p_is_correct THEN
        -- DOĞRU CEVAP
        IF v_current_repetitions = 0 THEN
            v_new_interval := 1;
        ELSIF v_current_repetitions = 1 THEN
            v_new_interval := 6;
        ELSE
            v_new_interval := ROUND(v_current_interval * v_current_ease_factor);
        END IF;

        v_new_repetitions := v_current_repetitions + 1;
        v_new_ease_factor := v_current_ease_factor + 0.1;
        v_new_is_mastered := v_current_is_mastered; -- Mevcut durumu koru
    ELSE
        -- YANLIŞ CEVAP
        v_new_repetitions := 0;
        v_new_interval := 1;
        v_new_ease_factor := GREATEST(1.3, v_current_ease_factor - 0.2);
        v_new_is_mastered := false; -- Yanlış bilinirse master durumu gider
    END IF;

    -- 3. Sonraki tekrar tarihini belirle
    v_next_review := now() + (v_new_interval || ' days')::interval;

    -- 4. Veritabanına kaydet (UPSERT)
    INSERT INTO user_progress (
        user_id,
        vocab_id,
        next_review,
        interval,
        ease_factor,
        repetitions,
        is_mastered,
        updated_at
    ) VALUES (
        p_user_id,
        p_vocab_id,
        v_next_review,
        v_new_interval,
        v_new_ease_factor,
        v_new_repetitions,
        v_new_is_mastered,
        now()
    )
    ON CONFLICT (user_id, vocab_id) DO UPDATE SET
        next_review = EXCLUDED.next_review,
        interval = EXCLUDED.interval,
        ease_factor = EXCLUDED.ease_factor,
        repetitions = EXCLUDED.repetitions,
        is_mastered = EXCLUDED.is_mastered,
        updated_at = EXCLUDED.updated_at;

END;
$$;
