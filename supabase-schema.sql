-- =============================================
-- 门店活动系统 - Supabase 数据库建表脚本
-- =============================================

-- 1. 用户 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  password TEXT NOT NULL DEFAULT 'user123',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 插入默认账号
INSERT INTO profiles (email, display_name, role, password, enabled) VALUES
  ('admin@demo.com', '管理员', 'admin', 'admin123', true),
  ('user@demo.com', '普通用户', 'user', 'user123', true)
ON CONFLICT (email) DO NOTHING;

-- 2. 活动方案表
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('online', 'offline')),
  store_type TEXT NOT NULL CHECK (store_type IN ('convenience', 'wholesale')),
  title TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Layers',
  description TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '[]',
  note TEXT,
  example TEXT,
  cost TEXT,
  estimated_cost NUMERIC,
  linked_activity_product_ids JSONB DEFAULT '[]',
  maintainer TEXT,
  creator_id TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 宣传方式表
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  time TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  price_label TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'Megaphone',
  maintainer TEXT,
  creator_id TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 物料表
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('onetime', 'reusable')),
  unit_price NUMERIC NOT NULL DEFAULT 0,
  default_qty INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT '个',
  billing_mode TEXT DEFAULT 'quantity' CHECK (billing_mode IN ('quantity', 'size')),
  default_length NUMERIC,
  default_width NUMERIC,
  maintainer TEXT,
  creator_id TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. 商品预算表
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  default_qty INTEGER NOT NULL DEFAULT 1,
  subsidy_rate NUMERIC NOT NULL DEFAULT 0,
  linked_plan_ids JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. 活动商品表
CREATE TABLE IF NOT EXISTS activity_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  retail_price NUMERIC NOT NULL DEFAULT 0,
  default_qty INTEGER NOT NULL DEFAULT 1,
  maintainer TEXT,
  creator_id TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. 活动记录表
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'awaiting_input')),
  activity_name TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT '',
  competitor TEXT NOT NULL DEFAULT '',
  owner TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  expected_sales NUMERIC DEFAULT 0,
  expected_daily_sales NUMERIC DEFAULT 0,
  expected_traffic NUMERIC DEFAULT 0,
  expected_new_members NUMERIC DEFAULT 0,
  expected_redemption_rate NUMERIC DEFAULT 0,
  expected_roi NUMERIC DEFAULT 0,
  plan_snapshot JSONB NOT NULL DEFAULT '{}',
  actual_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. 常用方案表
CREATE TABLE IF NOT EXISTS saved_presets (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  state JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_activities_creator ON activities(creator_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_saved_presets_user ON saved_presets(user_email);

-- 启用 RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_presets ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有表对 anon 用户开放读写（演示项目）
CREATE POLICY "Allow all for anon" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON promotions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON activity_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON saved_presets FOR ALL USING (true) WITH CHECK (true);
