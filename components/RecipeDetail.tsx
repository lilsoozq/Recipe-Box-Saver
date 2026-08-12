"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Recipe } from "@/lib/types";
import { deleteRecipe, getRecipe, updateRecipe } from "@/lib/storage";
export default function RecipeDetail(){
 const {id}=useParams<{id:string}>(); const router=useRouter(); const [r,setR]=useState<Recipe|null|undefined>(undefined); const [checked,setChecked]=useState<Record<number,boolean>>({});
 useEffect(()=>{getRecipe(id).then(setR).catch(()=>setR(null));},[id]);
 if(r===undefined)return <div className="loading">Loading recipe…</div>;
 if(!r)return <div className="notFound"><h1>Recipe not found</h1><Link href="/">Return to My Recipes</Link></div>;
 async function fav(){const next={...r,favorite:!r.favorite};setR(next);try{await updateRecipe(next);}catch{setR(r);}} async function remove(){if(confirm("Delete this recipe from Recipe Box?")){await deleteRecipe(r.id);router.push("/");}}
 return <article className="detail"><div className="detailTop"><Link href="/" className="back">← My Recipes</Link><div className="detailActions"><button className="plain" onClick={fav}>{r.favorite?"♥ Favorite":"♡ Favorite"}</button><button className="plain danger" onClick={remove}>Delete</button></div></div><div className="detailHero"><div className="detailText"><div className="eyebrow">{r.category||"SAVED RECIPE"}</div><h1>{r.title}</h1>{r.description&&<p>{r.description}</p>}<div className="facts">{r.prepTime&&<div><b>{r.prepTime}</b><span>Prep</span></div>}{r.cookTime&&<div><b>{r.cookTime}</b><span>Cook</span></div>}{r.totalTime&&<div><b>{r.totalTime}</b><span>Total</span></div>}{r.servings&&<div><b>{r.servings}</b><span>Servings</span></div>}</div></div>{r.image&&<img className="detailImage" src={r.image} alt={r.title}/>}</div><div className="recipeColumns"><section><h2>Ingredients</h2><div className="ingredientList">{r.ingredients.filter(Boolean).map((x,i)=><label className={checked[i]?"checked":""} key={i}><input type="checkbox" checked={!!checked[i]} onChange={()=>setChecked(c=>({...c,[i]:!c[i]}))}/><span>{x}</span></label>)}</div></section><section><h2>Directions</h2><ol className="steps">{r.instructions.filter(Boolean).map((x,i)=><li key={i}><span className="stepNum">{i+1}</span><p>{x}</p></li>)}</ol></section></div>{r.notes&&<section className="notes"><h2>Notes</h2><p>{r.notes}</p></section>}<footer className="source">Originally clipped from <a href={r.sourceUrl} target="_blank" rel="noreferrer">{r.sourceName||new URL(r.sourceUrl).hostname} ↗</a></footer></article>;
}
