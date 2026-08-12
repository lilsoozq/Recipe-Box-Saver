export type Recipe = {
  id: string;
  title: string;
  description: string;
  image: string;
  sourceName: string;
  sourceUrl: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
  notes: string;
  category: string;
  favorite: boolean;
  createdAt: string;
};

export type ImportedRecipe = Omit<Recipe, "id" | "favorite" | "createdAt">;
