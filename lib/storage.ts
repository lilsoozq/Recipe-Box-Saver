import { createClient } from "./supabase/client";
import type { Recipe } from "./types";

type RecipeRow = {
  id: string; user_id: string; title: string; description: string | null; image_url: string | null;
  source_name: string | null; source_url: string | null; prep_time: string | null; cook_time: string | null;
  total_time: string | null; servings: string | null; ingredients: string[] | null; instructions: string[] | null;
  notes: string | null; category: string | null; favorite: boolean | null; created_at: string;
};

function fromRow(r: RecipeRow): Recipe {
  return { id:r.id, title:r.title, description:r.description||"", image:r.image_url||"", sourceName:r.source_name||"",
    sourceUrl:r.source_url||"", prepTime:r.prep_time||"", cookTime:r.cook_time||"", totalTime:r.total_time||"",
    servings:r.servings||"", ingredients:r.ingredients||[], instructions:r.instructions||[], notes:r.notes||"",
    category:r.category||"", favorite:!!r.favorite, createdAt:r.created_at };
}

function toRow(recipe: Recipe, userId: string) {
  return { id:recipe.id, user_id:userId, title:recipe.title, description:recipe.description, image_url:recipe.image,
    source_name:recipe.sourceName, source_url:recipe.sourceUrl, prep_time:recipe.prepTime, cook_time:recipe.cookTime,
    total_time:recipe.totalTime, servings:recipe.servings, ingredients:recipe.ingredients, instructions:recipe.instructions,
    notes:recipe.notes, category:recipe.category, favorite:recipe.favorite, created_at:recipe.createdAt };
}

async function userId() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Please sign in to Recipe Box.");
  return data.user.id;
}

export async function getRecipes(): Promise<Recipe[]> {
  const supabase=createClient();
  const { data,error }=await supabase.from("recipes").select("*").order("created_at",{ascending:false});
  if(error) throw error; return (data as RecipeRow[]).map(fromRow);
}
export async function addRecipe(recipe: Recipe) {
  const uid=await userId(); const supabase=createClient();
  const { error }=await supabase.from("recipes").insert(toRow(recipe,uid)); if(error) throw error;
}
export async function updateRecipe(recipe: Recipe) {
  const uid=await userId(); const supabase=createClient();
  const { error }=await supabase.from("recipes").update(toRow(recipe,uid)).eq("id",recipe.id); if(error) throw error;
}
export async function deleteRecipe(id: string) {
  const supabase=createClient(); const { error }=await supabase.from("recipes").delete().eq("id",id); if(error) throw error;
}
export async function getRecipe(id: string): Promise<Recipe|null> {
  const supabase=createClient(); const { data,error }=await supabase.from("recipes").select("*").eq("id",id).maybeSingle();
  if(error) throw error; return data ? fromRow(data as RecipeRow) : null;
}
