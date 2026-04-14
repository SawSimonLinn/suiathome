import { RecipeCard } from "@/components/recipe-card";
import { recipes, categories } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export default function RecipesPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          All Recipes
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Browse through our collection of curated recipes. Find your next favorite meal here!
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search recipes..." className="pl-10" />
        </div>
        <div className="flex items-center gap-4">
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground"/>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>Search</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
