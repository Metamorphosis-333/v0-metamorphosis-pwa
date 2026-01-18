-- Seed 10 trainer-approved recipes
INSERT INTO public.recipes (title, description, protein_grams, calories, prep_time_minutes, ingredients, instructions, functional_tip, meal_type) VALUES
(
  'Power Chicken Bowl',
  'High-protein chicken with quinoa and greens',
  45.0,
  520,
  15,
  ARRAY['6oz chicken breast', '1 cup quinoa', '2 cups spinach', 'olive oil', 'lemon'],
  'Grill chicken, cook quinoa, sauté spinach. Combine and dress with lemon and olive oil.',
  'Quinoa contains all 9 essential amino acids, making it a complete protein source that aids muscle recovery.',
  'performance'
),
(
  '5-Minute Protein Smoothie',
  'Quick post-workout recovery drink',
  30.0,
  280,
  5,
  ARRAY['1 scoop whey protein', '1 banana', '1 cup almond milk', '1 tbsp peanut butter', 'ice'],
  'Blend all ingredients until smooth.',
  'Consuming protein within 30 minutes post-workout maximizes muscle protein synthesis.',
  'easy'
),
(
  'Mediterranean Salmon',
  'Omega-3 rich salmon with roasted vegetables',
  38.0,
  480,
  20,
  ARRAY['6oz salmon fillet', '1 cup cherry tomatoes', '1 zucchini', 'olive oil', 'garlic', 'herbs'],
  'Season salmon with herbs. Roast with vegetables at 400°F for 18 minutes.',
  'Wild-caught salmon provides EPA and DHA omega-3s that reduce inflammation and support brain health.',
  'performance'
),
(
  'Greek Yogurt Parfait',
  'High-protein breakfast or snack',
  25.0,
  320,
  3,
  ARRAY['2 cups Greek yogurt', '1/2 cup berries', '1/4 cup granola', '1 tbsp honey'],
  'Layer yogurt, berries, and granola. Drizzle with honey.',
  'Greek yogurt contains probiotics that support gut health and improve nutrient absorption.',
  'easy'
),
(
  'Beef & Sweet Potato Power Plate',
  'Iron-rich beef with complex carbs',
  42.0,
  580,
  25,
  ARRAY['6oz lean ground beef', '1 large sweet potato', '1 cup broccoli', 'spices'],
  'Cook beef with spices. Bake sweet potato. Steam broccoli. Combine.',
  'Sweet potatoes have a low glycemic index, providing sustained energy without blood sugar spikes.',
  'performance'
),
(
  'Tuna Avocado Wrap',
  'Quick protein-packed lunch',
  32.0,
  420,
  5,
  ARRAY['1 can tuna', '1/2 avocado', 'whole wheat wrap', 'spinach', 'tomato'],
  'Mix tuna with mashed avocado. Add to wrap with veggies.',
  'Avocado provides monounsaturated fats that improve nutrient absorption from vegetables.',
  'easy'
),
(
  'Egg White Veggie Scramble',
  'Low-calorie high-protein breakfast',
  28.0,
  240,
  10,
  ARRAY['8 egg whites', '1 cup mixed vegetables', 'olive oil', 'herbs'],
  'Sauté vegetables, add egg whites, scramble until cooked.',
  'Egg whites are pure protein with no fat, ideal for lean muscle building.',
  'easy'
),
(
  'Turkey Chili',
  'Hearty protein and fiber combo',
  40.0,
  460,
  30,
  ARRAY['1lb ground turkey', '1 can kidney beans', '1 can diced tomatoes', 'chili spices', 'onion'],
  'Brown turkey, add beans, tomatoes, and spices. Simmer 20 minutes.',
  'Beans provide resistant starch that feeds beneficial gut bacteria and stabilizes blood sugar.',
  'balanced'
),
(
  'Protein Pancakes',
  'Muscle-building breakfast treat',
  35.0,
  380,
  12,
  ARRAY['1 cup oats', '2 whole eggs', '1 scoop protein powder', '1 banana', 'cinnamon'],
  'Blend all ingredients. Cook pancakes on griddle.',
  'Oats contain beta-glucan fiber that lowers cholesterol and improves heart health.',
  'balanced'
),
(
  'Shrimp Stir-Fry',
  'Quick Asian-inspired protein dish',
  36.0,
  390,
  15,
  ARRAY['8oz shrimp', '2 cups mixed vegetables', 'soy sauce', 'ginger', 'garlic', 'sesame oil'],
  'Stir-fry shrimp and vegetables with sauce ingredients.',
  'Shrimp is one of the leanest protein sources with only 1g fat per 100g.',
  'performance'
);
