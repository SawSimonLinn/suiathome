'use client';

import { useState, useMemo } from 'react';
import { RecipeCard } from '@/components/recipe-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Recipe, Category } from '@/lib/types';

interface RecipesClientProps {
  recipes: Recipe[];
  categories: Category[];
}

export function RecipesClient({ recipes, categories }: RecipesClientProps) {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return recipes.filter((r) => {
      const matchesCategory = categoryId === 'all' || r.category?.id === categoryId;
      const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [recipes, search, categoryId]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-grow">
          <Input
            placeholder="Search recipes..."
            className="pl-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="🏷️ All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">🏷️ All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mx-auto grid w-full max-w-[78rem] grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),18rem))] justify-center gap-6 md:gap-8">
        {filtered.length > 0 ? (
          filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <div className="col-span-full border-2 border-foreground bg-paper p-8 text-center text-muted-foreground paper-shadow">
            {recipes.length === 0 ? 'No recipes are published yet.' : 'No recipes match your search.'}
          </div>
        )}
      </div>
    </>
  );
}
