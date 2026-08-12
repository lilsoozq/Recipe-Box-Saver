"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ImportedRecipe, Recipe } from "@/lib/types";
import { addRecipe } from "@/lib/storage";

const empty: ImportedRecipe = { title:"", description:"", image:"", sourceName:"", sourceUrl:"", prepTime:"", cookTime:"", totalTime:"", servings:"", ingredients:[], instructions:[], notes:"", category:"" };

export default function RecipeForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [recipe, setRecipe] = useState<ImportedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function clipRecipe() {
    setLoading(true); setError(""); setRecipe(null);
    try {
      const response = await fetch("/api/clip-recipe", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({url}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Recipe import failed.");
      setRecipe({ ...empty, ...data });
    } catch (e) { setError(e instanceof Error ? e.message : "Recipe import failed."); }
    finally { setLoading(false); }
  }

  async function save() {
    if (!recipe?.title.trim()) { setError("Please give the recipe a title before saving."); return; }
    const item: Recipe = { ...recipe, id: crypto.randomUUID(), favorite:false, createdAt:new Date().toISOString() };
    try {
      await addRecipe(item);
      router.push(`/recipe/${item.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save recipe."); }
  }

  function update<K extends keyof ImportedRecipe>(key: K, value: ImportedRecipe[K]) { if (recipe) setRecipe({...recipe, [key]:value}); }

  return <>
    <section className="clipCard">
      <div>
        <div className="eyebrow">RECIPE CLIPPER</div>
        <h1>Save the recipe.<br/><em>Skip the clutter.</em></h1>
        <p>Paste a recipe webpage and Recipe Box will pull out the useful parts: ingredients, directions, times and servings.</p>
      </div>
      <div className="urlRow">
        <input aria-label="Recipe URL" type="url" placeholder="https://example.com/my-favorite-recipe" value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') clipRecipe(); }} />
        <button onClick={clipRecipe} disabled={loading || !url.trim()}>{loading ? "Clipping…" : "Clip Recipe"}</button>
      </div>
      {error && <div className="error">{error}</div>}
      <p className="fineprint">Recipe Box keeps the original source link with every recipe. Some sites may block automated imports.</p>
    </section>

    {recipe && <section className="editorCard">
      <div className="sectionHead"><div><div className="eyebrow">REVIEW BEFORE SAVING</div><h2>Clean it up, then save it.</h2></div><button onClick={save}>Save Recipe</button></div>
      <div className="formGrid">
        <label className="span2">Recipe title<input value={recipe.title} onChange={e=>update('title',e.target.value)} /></label>
        <label>Category<input placeholder="Dinner, Dessert…" value={recipe.category} onChange={e=>update('category',e.target.value)} /></label>
        <label>Servings<input value={recipe.servings} onChange={e=>update('servings',e.target.value)} /></label>
        <label>Prep time<input value={recipe.prepTime} onChange={e=>update('prepTime',e.target.value)} /></label>
        <label>Cook time<input value={recipe.cookTime} onChange={e=>update('cookTime',e.target.value)} /></label>
        <label className="span2">Photo URL<input value={recipe.image} onChange={e=>update('image',e.target.value)} /></label>
        <label className="span2">Description<textarea rows={3} value={recipe.description} onChange={e=>update('description',e.target.value)} /></label>
        <label>Ingredients <span className="hint">one per line</span><textarea rows={12} value={recipe.ingredients.join('\n')} onChange={e=>update('ingredients',e.target.value.split('\n'))} /></label>
        <label>Directions <span className="hint">one step per line</span><textarea rows={12} value={recipe.instructions.join('\n')} onChange={e=>update('instructions',e.target.value.split('\n'))} /></label>
        <label className="span2">Notes<textarea rows={4} value={recipe.notes} onChange={e=>update('notes',e.target.value)} /></label>
      </div>
    </section>}
  </>;
}
