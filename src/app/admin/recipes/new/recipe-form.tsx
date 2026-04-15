'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { AdminCategory } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';

type NewRecipeFormProps = {
  categories: AdminCategory[];
};

const NEW_CATEGORY_VALUE = '__new__';

function getFriendlyAdminError(message: string) {
  if (message.toLowerCase().includes('row-level security')) {
    return 'Supabase is blocking this write with RLS. Run docs/supabase-admin-upgrade.sql in the Supabase SQL Editor, then sign out and sign back in as your admin account.';
  }

  return message;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeLines(lines: string[]) {
  return lines.map((line) => line.trim()).filter(Boolean);
}

function splitIngredientLine(line: string) {
  const separators = [' - ', ' | ', ': '];

  for (const separator of separators) {
    if (line.includes(separator)) {
      const [quantity, ...rest] = line.split(separator);
      return {
        quantity: quantity.trim(),
        name: rest.join(separator).trim(),
      };
    }
  }

  return {
    quantity: '',
    name: line.trim(),
  };
}

export function NewRecipeForm({ categories }: NewRecipeFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [imageHint, setImageHint] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('4');
  const [categoryId, setCategoryId] = useState(
    categories[0]?.id ?? NEW_CATEGORY_VALUE
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [tipsText, setTipsText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const normalizedSlug = slugify(slug || title);
      const normalizedIngredients = normalizeLines(ingredientsText.split('\n'));
      const normalizedSteps = normalizeLines(stepsText.split('\n'));
      const normalizedTips = normalizeLines(tipsText.split('\n'));
      const parsedServings = Number.parseInt(servings, 10);

      if (!normalizedSlug) {
        setErrorMessage('Add a recipe title or slug before publishing.');
        return;
      }

      if (!Number.isFinite(parsedServings) || parsedServings <= 0) {
        setErrorMessage('Servings must be a positive whole number.');
        return;
      }

      if (normalizedIngredients.length === 0 || normalizedSteps.length === 0) {
        setErrorMessage(
          'Add at least one ingredient and one instruction step before publishing.'
        );
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage('You need to be signed in as an admin to publish recipes.');
        return;
      }

      // Upload images to Supabase Storage
      const uploadedUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const ext = file.name.split('.').pop();
        const path = `${normalizedSlug}/${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(path, file, { upsert: true });
        if (uploadError) {
          setErrorMessage(`Image upload failed: ${uploadError.message}`);
          return;
        }
        const { data } = supabase.storage.from('recipe-images').getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      let resolvedCategoryId = categoryId;

      if (categoryId === NEW_CATEGORY_VALUE) {
        if (!newCategoryName.trim()) {
          setErrorMessage('Choose a category or create a new category name.');
          return;
        }

        const categorySlug = slugify(newCategoryName);
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle<{ id: string }>();

        if (existingCategory?.id) {
          resolvedCategoryId = existingCategory.id;
        } else {
          const { data: insertedCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({
              name: newCategoryName.trim(),
              slug: categorySlug,
            })
            .select('id')
            .single<{ id: string }>();

          if (categoryError || !insertedCategory) {
            setErrorMessage(
              getFriendlyAdminError(
                categoryError?.message || 'Could not create category.'
              )
            );
            return;
          }

          resolvedCategoryId = insertedCategory.id;
        }
      }

      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          author_id: user.id,
          category_id: resolvedCategoryId,
          slug: normalizedSlug,
          title: title.trim(),
          description: description.trim(),
          story: story.trim(),
          image_url: uploadedUrls[0] ?? null,
          image_hint: imageHint.trim() || null,
          prep_time: prepTime.trim(),
          cook_time: cookTime.trim(),
          servings: parsedServings,
        })
        .select('id, slug')
        .single<{ id: string; slug: string }>();

      if (recipeError || !recipe) {
        setErrorMessage(
          getFriendlyAdminError(recipeError?.message || 'Could not create recipe.')
        );
        return;
      }

      // Insert additional images (index > 0) into recipe_images table
      if (uploadedUrls.length > 1) {
        const extraImages = uploadedUrls.slice(1).map((url, i) => ({
          recipe_id: recipe.id,
          url,
          position: i + 1,
        }));
        const { error: imagesError } = await supabase
          .from('recipe_images')
          .insert(extraImages);
        if (imagesError) {
          setErrorMessage(
            `Recipe created, but extra images failed to save: ${getFriendlyAdminError(imagesError.message)}`
          );
          return;
        }
      }

      const ingredientRows = normalizedIngredients.map((line, index) => {
        const parsedLine = splitIngredientLine(line);
        return {
          recipe_id: recipe.id,
          position: index,
          quantity: parsedLine.quantity || 'to taste',
          name: parsedLine.name,
        };
      });

      const stepRows = normalizedSteps.map((line, index) => ({
        recipe_id: recipe.id,
        position: index,
        body: line,
      }));

      const tipRows = normalizedTips.map((line, index) => ({
        recipe_id: recipe.id,
        position: index,
        body: line,
      }));

      const writes = [
        ingredientRows.length > 0
          ? supabase.from('recipe_ingredients').insert(ingredientRows)
          : Promise.resolve({ error: null }),
        stepRows.length > 0
          ? supabase.from('recipe_steps').insert(stepRows)
          : Promise.resolve({ error: null }),
        tipRows.length > 0
          ? supabase.from('recipe_tips').insert(tipRows)
          : Promise.resolve({ error: null }),
      ];

      const [ingredientResult, stepResult, tipResult] = await Promise.all(writes);
      const writeError =
        ingredientResult.error || stepResult.error || tipResult.error;

      if (writeError) {
        setErrorMessage(
          `Recipe created, but some detail rows failed to save: ${getFriendlyAdminError(writeError.message)}`
        );
        return;
      }

      setSuccessMessage('Recipe published successfully. Opening the recipe page...');
      router.push(`/recipes/${recipe.slug}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary">Admin Recipe Publisher</Badge>
            <div>
              <h1 className="font-headline text-4xl md:text-5xl">Upload a Recipe</h1>
              <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
                Publish a complete recipe entry with structured ingredients,
                instructions, tips, and the story behind the dish.
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t publish recipe</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert>
              <AlertTitle>Recipe published</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Recipe Details</CardTitle>
                <CardDescription>
                  This section controls the public-facing recipe page and card.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    required
                    value={title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    required
                    value={slug}
                    onChange={(event) => setSlug(slugify(event.target.value))}
                    placeholder="classic-spaghetti-carbonara"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    required
                    rows={3}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="story">Story / Intro</Label>
                  <Textarea
                    id="story"
                    required
                    rows={6}
                    value={story}
                    onChange={(event) => setStory(event.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publishing Meta</CardTitle>
                <CardDescription>
                  Category, timing, servings, and cover image information.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                      <SelectItem value={NEW_CATEGORY_VALUE}>
                        Create new category
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {categoryId === NEW_CATEGORY_VALUE ? (
                  <div className="grid gap-2">
                    <Label htmlFor="newCategoryName">New Category Name</Label>
                    <Input
                      id="newCategoryName"
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      placeholder="Dessert"
                    />
                  </div>
                ) : null}

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="prepTime">Prep Time</Label>
                    <Input
                      id="prepTime"
                      required
                      value={prepTime}
                      onChange={(event) => setPrepTime(event.target.value)}
                      placeholder="15 mins"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cookTime">Cook Time</Label>
                    <Input
                      id="cookTime"
                      required
                      value={cookTime}
                      onChange={(event) => setCookTime(event.target.value)}
                      placeholder="30 mins"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    min={1}
                    required
                    value={servings}
                    onChange={(event) => setServings(event.target.value)}
                  />
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="imageFiles">
                    Recipe Images
                    <span className="ml-1 font-normal text-muted-foreground">
                      (first = cover)
                    </span>
                  </Label>
                  <Input
                    id="imageFiles"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFiles}
                    className="cursor-pointer"
                  />
                  {imagePreviews.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {imagePreviews.map((src, i) => (
                        <div key={src} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`Preview ${i + 1}`}
                            className="h-20 w-20 rounded border object-cover overflow-hidden"
                            style={{ display: 'block' }}
                          />
                          {i === 0 ? (
                            <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[10px] text-white">
                              Cover
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="imageHint">Image Hint</Label>
                  <Input
                    id="imageHint"
                    value={imageHint}
                    onChange={(event) => setImageHint(event.target.value)}
                    placeholder="pasta dish"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>
                  One ingredient per line. Use `quantity - ingredient` for the cleanest split.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={14}
                  value={ingredientsText}
                  onChange={(event) => setIngredientsText(event.target.value)}
                  placeholder={'200g - Spaghetti\n2 large - Eggs\n50g - Pecorino Romano cheese'}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>
                  One step per line. These become the numbered cooking steps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={14}
                  value={stepsText}
                  onChange={(event) => setStepsText(event.target.value)}
                  placeholder={'Cook pasta according to package directions.\nWhisk eggs and cheese together.\nToss everything off the heat.'}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
                <CardDescription>
                  Optional but useful. One tip per line for the recipe detail page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={14}
                  value={tipsText}
                  onChange={(event) => setTipsText(event.target.value)}
                  placeholder={'Use room temperature eggs.\nReserve pasta water.\nWork quickly off the heat.'}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing recipe...' : 'Publish Recipe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
