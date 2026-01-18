-- Create stripe customers table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe_customers_select_own" ON public.stripe_customers FOR SELECT USING (auth.uid() = user_id);

-- Create ai_credits table
CREATE TABLE IF NOT EXISTS public.ai_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 100,
  lifetime_purchased INTEGER NOT NULL DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_credits_select_own" ON public.ai_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_credits_update_own" ON public.ai_credits FOR UPDATE USING (auth.uid() = user_id);

-- Create credit transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  stripe_payment_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credit_transactions_select_own" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- Create sage_sparks_products table
CREATE TABLE IF NOT EXISTS public.sage_sparks_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_price_id TEXT,
  description TEXT,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sage_sparks_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sage_sparks_products_select_all" ON public.sage_sparks_products FOR SELECT USING (true);

-- Insert default Sage Sparks products
INSERT INTO public.sage_sparks_products (name, credits, price_cents, description, popular) VALUES
  ('Spark Starter', 500, 499, 'Get 500 Sage Sparks for quick AI consultations', false),
  ('Spark Pack', 2000, 1899, 'Popular choice: 2,000 Sage Sparks for extended sessions', true),
  ('Spark Pro', 5000, 4499, 'Power user: 5,000 Sage Sparks for unlimited daily wisdom', false)
ON CONFLICT DO NOTHING;
