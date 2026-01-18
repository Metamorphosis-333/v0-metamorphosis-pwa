-- Create pantry inventory table
CREATE TABLE IF NOT EXISTS public.pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('proteins', 'grains', 'vegetables', 'fruits', 'dairy', 'pantry', 'frozen', 'other')),
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'items',
  photo_url TEXT,
  expiry_date DATE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pantry_items_select_own" ON public.pantry_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pantry_items_insert_own" ON public.pantry_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pantry_items_update_own" ON public.pantry_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pantry_items_delete_own" ON public.pantry_items FOR DELETE USING (auth.uid() = user_id);

-- Create user favorite recipes table
CREATE TABLE IF NOT EXISTS public.user_favorite_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE public.user_favorite_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_favorite_recipes_select_own" ON public.user_favorite_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_favorite_recipes_insert_own" ON public.user_favorite_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_favorite_recipes_delete_own" ON public.user_favorite_recipes FOR DELETE USING (auth.uid() = user_id);
