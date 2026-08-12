import { NextResponse } from "next/server";
import { extractRecipe } from "@/lib/recipe-parser";
import { assertSafePublicUrl } from "@/lib/safe-url";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = await assertSafePublicUrl(String(body?.url ?? "").trim());

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let response: Response;
    try {
      response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; RecipeBox/1.0; +personal recipe organizer)",
          "Accept": "text/html,application/xhtml+xml"
        }
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) throw new Error(`The recipe site returned ${response.status}.`);
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) throw new Error("That link did not return a web page.");

    const html = await response.text();
    if (html.length > 8_000_000) throw new Error("That page is too large to import safely.");

    const recipe = extractRecipe(html, url.toString());
    if (!recipe) return NextResponse.json({ error: "I couldn't find a recognizable recipe on that page. You can try another recipe URL." }, { status: 422 });

    return NextResponse.json(recipe);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong while clipping the recipe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
