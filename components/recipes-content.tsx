"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuoteBanner } from "@/components/quote-banner"
import { ArrowLeft, Clock, Flame, Beef, Lightbulb } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Recipe {
  id: string
  title: string
  description: string
  protein_grams: number
  calories: number
  prep_time_minutes: number
  ingredients: string[]
  instructions: string
  functional_tip: string
  meal_type: string
}

interface RecipesContentProps {
  recipes: Recipe[]
  mood: string | null | undefined
}

export function RecipesContent({ recipes, mood }: RecipesContentProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [filter, setFilter] = useState<string>("all")

  // Filter recipes based on mood
  const getRecommendedRecipes = () => {
    if (mood === "stressed") {
      return recipes.filter((r) => r.meal_type === "easy")
    } else if (mood === "high-energy") {
      return recipes.filter((r) => r.meal_type === "performance")
    }
    return recipes
  }

  const displayedRecipes = filter === "all" ? recipes : recipes.filter((r) => r.meal_type === filter)

  const recommendedRecipes = getRecommendedRecipes()

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="glass">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Recipe Library</h1>
              <p className="text-muted-foreground">Trainer-approved meals with functional nutrition tips</p>
            </div>
          </div>

          {/* Quote Banner */}
          <QuoteBanner />

          {/* Mood-based Recommendations */}
          {mood && recommendedRecipes.length > 0 && (
            <Card className="glass-strong border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">
                  {mood === "stressed" && "Quick & Easy Recipes for You"}
                  {mood === "high-energy" && "Performance Meals for Peak Energy"}
                  {mood === "neutral" && "Recommended for You"}
                </CardTitle>
                <CardDescription>Based on your morning headspace check</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {recommendedRecipes.slice(0, 3).map((recipe) => (
                    <Button
                      key={recipe.id}
                      variant="outline"
                      size="sm"
                      className="glass bg-transparent"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      {recipe.title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "" : "glass bg-transparent"}
            >
              All Recipes
            </Button>
            <Button
              variant={filter === "easy" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("easy")}
              className={filter === "easy" ? "" : "glass bg-transparent"}
            >
              Quick & Easy
            </Button>
            <Button
              variant={filter === "performance" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("performance")}
              className={filter === "performance" ? "" : "glass bg-transparent"}
            >
              Performance
            </Button>
            <Button
              variant={filter === "balanced" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("balanced")}
              className={filter === "balanced" ? "" : "glass bg-transparent"}
            >
              Balanced
            </Button>
          </div>

          {/* Recipe Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {displayedRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="glass border-white/10 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{recipe.title}</CardTitle>
                    <Badge variant="outline" className="glass bg-transparent">
                      {recipe.meal_type}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.prep_time_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Beef className="h-4 w-4" />
                      <span>{recipe.protein_grams}g protein</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="h-4 w-4" />
                      <span>{recipe.calories} cal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="glass-strong border-white/20 max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedRecipe?.title}</DialogTitle>
            <DialogDescription>{selectedRecipe?.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 pr-4">
              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{selectedRecipe?.prep_time_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Beef className="h-4 w-4 text-primary" />
                  <span>{selectedRecipe?.protein_grams}g protein</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  <span>{selectedRecipe?.calories} calories</span>
                </div>
              </div>

              {/* Functional Tip */}
              <div className="glass rounded-lg p-4 border border-primary/30">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-1">Functional Nutrition Tip</p>
                    <p className="text-sm text-muted-foreground">{selectedRecipe?.functional_tip}</p>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="font-semibold mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {selectedRecipe?.ingredients.map((ingredient, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="font-semibold mb-3">Instructions</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {selectedRecipe?.instructions}
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
