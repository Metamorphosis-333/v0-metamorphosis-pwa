-- Create food database table
CREATE TABLE IF NOT EXISTS public.food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  calories_per_serving INTEGER,
  protein_grams DECIMAL(6,2),
  carbs_grams DECIMAL(6,2),
  fat_grams DECIMAL(6,2),
  fiber_grams DECIMAL(6,2),
  serving_size_grams DECIMAL(8,2),
  serving_unit TEXT DEFAULT 'grams',
  upf_score INTEGER CHECK (upf_score >= 1 AND upf_score <= 4),
  upf_category TEXT CHECK (upf_category IN ('unprocessed', 'processed', 'ultra_processed')),
  ingredients TEXT[],
  allergens TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_items_select_all" ON public.food_items FOR SELECT USING (true);

-- Create food log entries with macro overrides
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES public.food_items(id),
  food_name TEXT NOT NULL,
  servings_consumed DECIMAL(6,2) NOT NULL DEFAULT 1,
  serving_unit TEXT DEFAULT 'grams',
  calories INTEGER,
  protein_grams DECIMAL(6,2),
  carbs_grams DECIMAL(6,2),
  fat_grams DECIMAL(6,2),
  fiber_grams DECIMAL(6,2),
  macro_overrides JSONB,
  notes TEXT,
  logged_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_logs_select_own" ON public.food_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "food_logs_insert_own" ON public.food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "food_logs_update_own" ON public.food_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "food_logs_delete_own" ON public.food_logs FOR DELETE USING (auth.uid() = user_id);

-- Create favorite foods table
CREATE TABLE IF NOT EXISTS public.favorite_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, food_item_id)
);

ALTER TABLE public.favorite_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorite_foods_select_own" ON public.favorite_foods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorite_foods_insert_own" ON public.favorite_foods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorite_foods_delete_own" ON public.favorite_foods FOR DELETE USING (auth.uid() = user_id);
