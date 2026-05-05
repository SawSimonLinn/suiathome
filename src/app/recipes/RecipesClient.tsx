'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RecipeCard } from '@/components/recipe-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Recipe, Category } from '@/lib/types';

interface RecipesClientProps {
  initialRecipes: Recipe[];
  categories: Category[];
  initialHasMore: boolean;
}

export function RecipesClient({ initialRecipes, categories, initialHasMore }: RecipesClientProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const hasMounted = useRef(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchRecipes = useCallback(async (targetPage: number, searchTerm: string, catId: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        search: searchTerm,
        categoryId: catId,
      });
      const res = await fetch(`/api/recipes?${params}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = (await res.json()) as { recipes: Recipe[]; hasMore: boolean };
      setRecipes(data.recipes);
      setHasMore(data.hasMore);
    } catch {
      // silently ignore — previous results remain visible
    } finally {
      setIsLoading(false);
    }
  }, []);

  // When filter changes, reset to page 0 and fetch (skip on initial mount)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    setPage(0);
    void fetchRecipes(0, debouncedSearch, categoryId);
  }, [debouncedSearch, categoryId, fetchRecipes]);

  const handlePrev = () => {
    const newPage = page - 1;
    setPage(newPage);
    void fetchRecipes(newPage, debouncedSearch, categoryId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    const newPage = page + 1;
    setPage(newPage);
    void fetchRecipes(newPage, debouncedSearch, categoryId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        {isLoading ? (
          <div className="col-span-full flex justify-center py-16">
            <p className="text-muted-foreground animate-pulse">Loading recipes…</p>
          </div>
        ) : recipes.length > 0 ? (
          recipes.map((recipe, index) => (
            <RecipeCard key={recipe.id} recipe={recipe} priority={index < 3} />
          ))
        ) : (
          <div className="col-span-full border-2 border-foreground bg-paper p-8 text-center text-muted-foreground paper-shadow">
            {debouncedSearch || categoryId !== 'all'
              ? 'No recipes match your search.'
              : 'No recipes are published yet.'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {(page > 0 || hasMore) && !isLoading && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={page === 0}
            className="flex items-center gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {page + 1}
          </span>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={!hasMore}
            className="flex items-center gap-1.5"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
