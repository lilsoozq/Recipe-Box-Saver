import * as cheerio from "cheerio";
import type { ImportedRecipe } from "./types";

type Json = Record<string, any>;

function hasType(item: Json, expected: string) {
  const type = item?.["@type"];
  return type === expected || (Array.isArray(type) && type.includes(expected));
}

function findRecipe(value: any): Json | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findRecipe(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof value !== "object") return null;
  if (hasType(value, "Recipe")) return value;
  if (value["@graph"]) {
    const found = findRecipe(value["@graph"]);
    if (found) return found;
  }
  for (const nested of Object.values(value)) {
    if (nested && typeof nested === "object") {
      const found = findRecipe(nested);
      if (found) return found;
    }
  }
  return null;
}

function text(value: any): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value === "object") return text(value.name ?? value.text ?? value.value ?? value.url);
  return "";
}

function imageUrl(image: any): string {
  if (!image) return "";
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return imageUrl(image[0]);
  return text(image.url ?? image.contentUrl);
}

function ingredients(value: any): string[] {
  if (!Array.isArray(value)) return value ? [text(value)].filter(Boolean) : [];
  return value.map((item) => {
    if (typeof item === "string") return item.trim();
    if (item?.["@type"] === "PropertyValue") {
      return [text(item.value), text(item.unitText ?? item.unitCode), text(item.name)].filter(Boolean).join(" ");
    }
    return text(item);
  }).filter(Boolean);
}

function instructionList(value: any): string[] {
  if (!value) return [];
  if (typeof value === "string") {
    return value.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(value)) return instructionList(value.itemListElement ?? value.text ?? value.name);

  const output: string[] = [];
  for (const step of value) {
    if (typeof step === "string") {
      if (step.trim()) output.push(step.trim());
      continue;
    }
    if (hasType(step, "HowToSection")) {
      const section = text(step.name);
      const children = instructionList(step.itemListElement);
      if (section && children.length) output.push(...children.map((child) => `${section}: ${child}`));
      else output.push(...children);
      continue;
    }
    const line = text(step.text ?? step.name);
    if (line) output.push(line);
    else output.push(...instructionList(step.itemListElement));
  }
  return output;
}

function cleanText($: cheerio.CheerioAPI, selector: string): string[] {
  return $(selector).toArray().map((el) => $(el).text().replace(/\s+/g, " ").trim()).filter((v) => v.length > 1);
}

function domFallback(html: string, sourceUrl: string): ImportedRecipe | null {
  const $ = cheerio.load(html);
  const title = $("meta[property='og:title']").attr("content")?.trim() || $("h1").first().text().trim() || $("title").text().trim();
  const ingredientSelectors = ["[class*='ingredient'] li", "[class*='ingredients'] p", "[itemprop='recipeIngredient']"];
  const instructionSelectors = ["[class*='instruction'] li", "[class*='direction'] li", "[itemprop='recipeInstructions'] li", "[itemprop='recipeInstructions']"];
  const ing = ingredientSelectors.flatMap((s) => cleanText($, s));
  const steps = instructionSelectors.flatMap((s) => cleanText($, s));
  const uniq = (values: string[]) => Array.from(new Set(values));
  if (!title || (!ing.length && !steps.length)) return null;
  return {
    title,
    description: $("meta[name='description']").attr("content")?.trim() || "",
    image: $("meta[property='og:image']").attr("content")?.trim() || "",
    sourceName: new URL(sourceUrl).hostname.replace(/^www\./, ""),
    sourceUrl,
    prepTime: "",
    cookTime: "",
    totalTime: "",
    servings: "",
    ingredients: uniq(ing).slice(0, 100),
    instructions: uniq(steps).slice(0, 100),
    notes: "",
    category: ""
  };
}

export function extractRecipe(html: string, sourceUrl: string): ImportedRecipe | null {
  const $ = cheerio.load(html);
  const parsedBlocks: any[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html();
    if (!raw) return;
    try { parsedBlocks.push(JSON.parse(raw)); } catch { /* malformed block */ }
  });

  const recipe = findRecipe(parsedBlocks);
  if (!recipe) return domFallback(html, sourceUrl);

  const author = recipe.author;
  const publisher = recipe.publisher;
  const sourceName = text(publisher?.name ?? author?.name ?? publisher ?? author) || new URL(sourceUrl).hostname.replace(/^www\./, "");

  return {
    title: text(recipe.name) || "Untitled Recipe",
    description: text(recipe.description),
    image: imageUrl(recipe.image),
    sourceName,
    sourceUrl,
    prepTime: text(recipe.prepTime),
    cookTime: text(recipe.cookTime),
    totalTime: text(recipe.totalTime),
    servings: Array.isArray(recipe.recipeYield) ? recipe.recipeYield.map(text).filter(Boolean).join(", ") : text(recipe.recipeYield),
    ingredients: ingredients(recipe.recipeIngredient),
    instructions: instructionList(recipe.recipeInstructions),
    notes: "",
    category: Array.isArray(recipe.recipeCategory) ? recipe.recipeCategory.map(text).join(", ") : text(recipe.recipeCategory)
  };
}
