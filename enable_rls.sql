-- 1. Tablolar için RLS'i Aktif Et
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 2. VOCABULARY Politikaları
-- Herkes okuyabilir
DROP POLICY IF EXISTS "Vocabulary is public read" ON vocabulary;
CREATE POLICY "Vocabulary is public read" ON vocabulary
  FOR SELECT USING (true);

-- Sadece servis rolü (admin) ekleme/düzenleme yapabilir
DROP POLICY IF EXISTS "Vocabulary is admin write" ON vocabulary;
CREATE POLICY "Vocabulary is admin write" ON vocabulary
  FOR ALL USING (auth.role() = 'service_role');


-- 3. PROFILES Politikaları
-- Herkes profilleri görebilir (Liderlik tablosu için)
DROP POLICY IF EXISTS "Profiles are public read" ON profiles;
CREATE POLICY "Profiles are public read" ON profiles
  FOR SELECT USING (true);

-- Kullanıcılar sadece kendi profilini düzenleyebilir
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Kullanıcılar kendi profilini oluşturabilir (Auth trigger'ı yoksa gerekebilir)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);


-- 4. USER_PROGRESS Politikaları
-- Kullanıcılar sadece kendi ilerlemelerini görebilir
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi ilerlemelerini düzenleyebilir (Insert/Update/Delete)
DROP POLICY IF EXISTS "Users can manage own progress" ON user_progress;
CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);
