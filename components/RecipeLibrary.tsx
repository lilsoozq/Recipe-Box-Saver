"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Recipe } from "@/lib/types";
import { getRecipes, updateRecipe } from "@/lib/storage";
export default function RecipeLibrary(){
 const [recipes,setRecipes]=useState<Recipe[]>([]); const [query,setQuery]=useState(""); const [favorites,setFavorites]=useState(false);
 useEffect(()=>{getRecipes().then(setRecipes).catch(e=>console.error(e));},[]);
 const visible=useMemo(()=>recipes.filter(r=>(!favorites||r.favorite)&&[r.title,r.category,...r.ingredients].join(" ").toLowerCase().includes(query.toLowerCase())),[recipes,query,favorites]);
 async function toggle(r:Recipe){const next={...r,favorite:!r.favorite};setRecipes(v=>v.map(x=>x.id===r.id?next:x));try{await updateRecipe(next);}catch(e){console.error(e);setRecipes(v=>v.map(x=>x.id===r.id?r:x));}}
 return <>
  <section className="hero"><div><div className="eyebrow">YOUR PERSONAL COOKBOOK</div><h1>Recipes worth<br/><em>coming back to.</em></h1><p>Clip them once. Cook them without the pop-ups, autoplay videos or endless scrolling.</p></div><Link href="/add" className="button heroButton">Clip a recipe →</Link></section>
  <section className="library"><div className="libraryTools"><input className="search" placeholder="Search recipes or ingredients…" value={query} onChange={e=>setQuery(e.target.value)}/><button className={favorites?"filter activeFilter":"filter"} onClick={()=>setFavorites(!favorites)}>♥ Favorites</button></div>
  {visible.length===0?<div className="empty"><div className="emptyIcon">⌁</div><h2>{recipes.length?"No matching recipes":"Your recipe box is empty"}</h2><p>{recipes.length?"Try a different search or turn off the favorites filter.":"Start by clipping a recipe from one of your favorite cooking sites."}</p>{!recipes.length&&<Link href="/add" className="button">Add your first recipe</Link>}</div>:<div className="cards">{visible.map(r=><article className="recipeCard" key={r.id}><Link href={`/recipe/${r.id}`} className="imageWrap">{r.image?<img src={r.image} alt=""/>:<div className="imagePlaceholder">Recipe</div>}</Link><button aria-label="Favorite" className={r.favorite?"heart fav":"heart"} onClick={()=>toggle(r)}>♥</button><div className="cardBody"><div className="cardMeta">{r.category||r.sourceName||"Saved recipe"}</div><Link href={`/recipe/${r.id}`}><h3>{r.title}</h3></Link><div className="cardFoot"><span>{r.servings?`Serves ${r.servings}`:"Saved recipe"}</span><span>→</span></div></div></article>)}</div>}</section>
 </>;
}
