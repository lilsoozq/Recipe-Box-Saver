"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Recipe } from "@/lib/types";
import { deleteRecipe, getRecipe, updateRecipe } from "@/lib/storage";

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [r, setR] = useState<Recipe | null | undefined>(undefined);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    getRecipe(id).then(setR).catch(() => setR(null));
  }, [id]);

  if (r === undefined) {
    return <div className="loading">Loading recipe…</div>;
  }

  if (!r) {
    return (
      <div className="notFound">
        <h1>Recipe not found</h1>
        <Link href="/">Return to My Recipes</Link>
      </div>
    );
  }

  // Capture the narrowed value so TypeScript knows it remains a Recipe
  // inside async event handlers.
  const recipe: Recipe = r;

  async function fav() {
    const next: Recipe = {
      ...recipe,
      favorite: !recipe.favorite,
    };

    setR(next);

    try {
      await updateRecipe(next);
    } catch {
      setR(recipe);
    }
  }

  async function remove() {
    if (confirm("Delete this recipe from Recipe Box?")) {
      await deleteRecipe(recipe.id);
      router.push("/");
    }
  }

  return (
    <article className="detail">
      <div className="detailTop">
        <Link href="/" className="back">
          ← My Recipes
        </Link>

        <div className="detailActions">
          <button className="plain" onClick={fav}>
            {recipe.favorite ? "♥ Favorite" : "♡ Favorite"}
          </button>
          <button className="plain danger" onClick={remove}>
            Delete
          </button>
        </div>
      </div>

      <div className="detailHero">
        <div className="detailText">
          <div className="eyebrow">{recipe.category || "SAVED RECIPE"}</div>
          <h1>{recipe.title}</h1>
          {recipe.description && <p>{recipe.description}</p>}

          <div className="facts">
            {recipe.prepTime && (
              <div>
                <b>{recipe.prepTime}</b>
                <span>Prep</span>
              </div>
            )}
            {recipe.cookTime && (
              <div>
                <b>{recipe.cookTime}</b>
                <span>Cook</span>
              </div>
            )}
            {recipe.totalTime && (
              <div>
                <b>{recipe.totalTime}</b>
                <span>Total</span>
              </div>
            )}
            {recipe.servings && (
              <div>
                <b>{recipe.servings}</b>
                <span>Servings</span>
              </div>
            )}
          </div>
        </div>

        {recipe.image && (
          <img className="detailImage" src={recipe.image} alt={recipe.title} />
        )}
      </div>

      <div className="recipeColumns">
        <section>
          <h2>Ingredients</h2>
          <div className="ingredientList">
            {recipe.ingredients.filter(Boolean).map((x, i) => (
              <label className={checked[i] ? "checked" : ""} key={i}>
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  onChange={() =>
                    setChecked((c) => ({ ...c, [i]: !c[i] }))
                  }
                />
                <span>{x}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2>Directions</h2>
          <ol className="steps">
            {recipe.instructions.filter(Boolean).map((x, i) => (
              <li key={i}>
                <span className="stepNum">{i + 1}</span>
                <p>{x}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {recipe.notes && (
        <section className="notes">
          <h2>Notes</h2>
          <p>{recipe.notes}</p>
        </section>
      )}

      <footer className="source">
        Originally clipped from{" "}
        <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
          {recipe.sourceName || new URL(recipe.sourceUrl).hostname} ↗
        </a>
      </footer>
    </article>
  );
}
