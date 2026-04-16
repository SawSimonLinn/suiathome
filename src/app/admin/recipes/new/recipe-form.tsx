'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AdminNav } from '@/components/layout/admin-nav';
import { ImageStripLightbox } from '@/components/image-strip-lightbox';
import { useNavigationFeedback } from '@/components/layout/navigation-feedback-provider';
import { RecipeTipsPanel } from '@/components/recipe-tips-panel';
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
import type { AdminCategory, AdminEditableRecipe } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';

type NewRecipeFormProps = {
  categories: AdminCategory[];
  initialRecipe?: AdminEditableRecipe | null;
  mode?: 'create' | 'edit';
};

type RecipeDraftPreview = {
  title: string;
  description: string;
  story: string;
  prepTime: string;
  cookTime: string;
  parsedServings: number;
  categoryName: string;
  ingredientRows: { quantity: string; name: string }[];
  stepRows: string[];
  tipRows: string[];
  coverImagePreview: string | null;
  galleryImagePreviews: string[];
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

function buildTemporaryRecipeSlug(title: string) {
  const base = slugify(title) || 'recipe';
  const suffix =
    globalThis.crypto?.randomUUID?.().slice(0, 8) ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  return `${base}-${suffix}`;
}

function splitRecipeTitleParts(fullTitle: string) {
  const normalizedTitle = fullTitle.trim();
  const match = normalizedTitle.match(/^(.*?)\s*\(([^()]*)\)\s*$/);

  if (!match) {
    return {
      mainTitle: normalizedTitle,
      burmeseTitle: '',
    };
  }

  const mainTitle = match[1]?.trim() ?? '';
  const burmeseTitle = match[2]?.trim() ?? '';

  if (!mainTitle || !burmeseTitle) {
    return {
      mainTitle: normalizedTitle,
      burmeseTitle: '',
    };
  }

  return { mainTitle, burmeseTitle };
}

function formatRecipeTitle(mainTitle: string, burmeseTitle: string) {
  const normalizedMainTitle = mainTitle.trim();
  const normalizedBurmeseTitle = burmeseTitle.trim();

  if (!normalizedBurmeseTitle) {
    return normalizedMainTitle;
  }

  return `${normalizedMainTitle} (${normalizedBurmeseTitle})`;
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

function getFileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function formatIngredientLine(ingredient: { quantity: string; name: string }) {
  return ingredient.quantity
    ? `${ingredient.quantity} - ${ingredient.name}`
    : ingredient.name;
}

function buildRecipeDraftPreview({
  mainTitle,
  burmeseTitle,
  description,
  story,
  prepTime,
  cookTime,
  servings,
  categoryId,
  newCategoryName,
  categories,
  ingredientsText,
  stepsText,
  tipsText,
  imagePreviews,
}: {
  mainTitle: string;
  burmeseTitle: string;
  description: string;
  story: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  categoryId: string;
  newCategoryName: string;
  categories: AdminCategory[];
  ingredientsText: string;
  stepsText: string;
  tipsText: string;
  imagePreviews: string[];
}) {
  const normalizedTitle = formatRecipeTitle(mainTitle, burmeseTitle);
  const normalizedDescription = description.trim();
  const normalizedStory = story.trim();
  const normalizedPrepTime = prepTime.trim();
  const normalizedCookTime = cookTime.trim();
  const normalizedIngredients = normalizeLines(ingredientsText.split('\n'));
  const normalizedSteps = normalizeLines(stepsText.split('\n'));
  const normalizedTips = normalizeLines(tipsText.split('\n'));
  const parsedServings = Number.parseInt(servings, 10);

  if (!normalizedTitle) {
    return { draft: null, error: 'Add a recipe title before continuing.' };
  }

  if (!normalizedDescription) {
    return { draft: null, error: 'Add a short description before continuing.' };
  }

  if (!normalizedStory) {
    return { draft: null, error: 'Add the story or intro before continuing.' };
  }

  if (!normalizedPrepTime || !normalizedCookTime) {
    return { draft: null, error: 'Add both prep time and cook time before continuing.' };
  }

  if (!Number.isFinite(parsedServings) || parsedServings <= 0) {
    return { draft: null, error: 'Servings must be a positive whole number.' };
  }

  if (normalizedIngredients.length === 0 || normalizedSteps.length === 0) {
    return {
      draft: null,
      error:
        'Add at least one ingredient and one instruction step before continuing.',
    };
  }

  if (categoryId === NEW_CATEGORY_VALUE && !newCategoryName.trim()) {
    return {
      draft: null,
      error: 'Choose a category or create a new category name.',
    };
  }

  const categoryName =
    categoryId === NEW_CATEGORY_VALUE
      ? newCategoryName.trim()
      : categories.find((category) => category.id === categoryId)?.name || 'Uncategorized';

  return {
    draft: {
      title: normalizedTitle,
      description: normalizedDescription,
      story: normalizedStory,
      prepTime: normalizedPrepTime,
      cookTime: normalizedCookTime,
      parsedServings,
      categoryName,
      ingredientRows: normalizedIngredients.map((line) => {
        const parsedLine = splitIngredientLine(line);

        return {
          quantity: parsedLine.quantity || 'to taste',
          name: parsedLine.name,
        };
      }),
      stepRows: normalizedSteps,
      tipRows: normalizedTips,
      coverImagePreview: imagePreviews[0] ?? null,
      galleryImagePreviews: imagePreviews,
    },
    error: null,
  };
}

export function NewRecipeForm({
  categories,
  initialRecipe = null,
  mode = 'create',
}: NewRecipeFormProps) {
  const titleParts = splitRecipeTitleParts(initialRecipe?.title ?? '');
  const router = useRouter();
  const { startNavigation } = useNavigationFeedback();
  const isEditMode = mode === 'edit' && Boolean(initialRecipe);
  const [currentStep, setCurrentStep] = useState<'edit' | 'preview'>('edit');
  const [mainTitle, setMainTitle] = useState(titleParts.mainTitle);
  const [burmeseTitle, setBurmeseTitle] = useState(titleParts.burmeseTitle);
  const [description, setDescription] = useState(initialRecipe?.description ?? '');
  const [story, setStory] = useState(initialRecipe?.story ?? '');
  const [imageHint, setImageHint] = useState(initialRecipe?.imageHint ?? '');
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    initialRecipe?.imageUrls ?? []
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState(initialRecipe?.prepTime ?? '');
  const [cookTime, setCookTime] = useState(initialRecipe?.cookTime ?? '');
  const [servings, setServings] = useState(String(initialRecipe?.servings ?? 4));
  const [categoryId, setCategoryId] = useState(
    initialRecipe?.categoryId ?? categories[0]?.id ?? NEW_CATEGORY_VALUE
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [ingredientsText, setIngredientsText] = useState(
    initialRecipe?.ingredients.map(formatIngredientLine).join('\n') ?? ''
  );
  const [stepsText, setStepsText] = useState(
    initialRecipe?.steps.join('\n') ?? ''
  );
  const [tipsText, setTipsText] = useState(
    initialRecipe?.tips.join('\n') ?? ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadKey] = useState(
    () =>
      initialRecipe?.id ??
      `recipe-draft-${
        globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)
      }`
  );
  const allImagePreviews = [...existingImageUrls, ...imagePreviews];

  const previewResult =
    currentStep === 'preview'
      ? buildRecipeDraftPreview({
          mainTitle,
          burmeseTitle,
          description,
          story,
          prepTime,
          cookTime,
          servings,
          categoryId,
          newCategoryName,
          categories,
          ingredientsText,
          stepsText,
          tipsText,
          imagePreviews: allImagePreviews,
        })
      : null;
  const previewDraft = previewResult?.draft ?? null;

  const handleImageFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const existingKeys = new Set(imageFiles.map(getFileKey));
    const nextFiles = files.filter((file) => !existingKeys.has(getFileKey(file)));

    if (nextFiles.length === 0) {
      event.target.value = '';
      return;
    }

    setImageFiles((prev) => [...prev, ...nextFiles]);
    setImagePreviews((prev) => [
      ...prev,
      ...nextFiles.map((file) => URL.createObjectURL(file)),
    ]);
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    if (index < existingImageUrls.length) {
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    const previewIndex = index - existingImageUrls.length;
    const previewUrl = imagePreviews[previewIndex];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFiles((prev) => prev.filter((_, i) => i !== previewIndex));
    setImagePreviews((prev) => prev.filter((_, i) => i !== previewIndex));
  };

  const handleViewRecipe = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const { draft, error } = buildRecipeDraftPreview({
      mainTitle,
      burmeseTitle,
      description,
      story,
      prepTime,
      cookTime,
      servings,
      categoryId,
      newCategoryName,
      categories,
      ingredientsText,
      stepsText,
      tipsText,
      imagePreviews: allImagePreviews,
    });

    if (!draft || error) {
      setCurrentStep('edit');
      setErrorMessage(error || 'Review the recipe details and try again.');
      return;
    }

    setCurrentStep('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublish = async () => {
    if (!isEditMode && currentStep !== 'preview') {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { draft, error } = buildRecipeDraftPreview({
        mainTitle,
        burmeseTitle,
        description,
        story,
        prepTime,
        cookTime,
        servings,
        categoryId,
        newCategoryName,
        categories,
        ingredientsText,
        stepsText,
        tipsText,
        imagePreviews,
      });

      if (!draft || error) {
        setCurrentStep('edit');
        setErrorMessage(error || 'Review the recipe details and try again.');
        return;
      }

      const {
        ingredientRows: previewIngredientRows,
        stepRows: previewStepRows,
        tipRows: previewTipRows,
        parsedServings,
      } = draft;

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
        const ext = file.name.split('.').pop() || 'jpg';
        const uniqueName =
          globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${i}`;
        const path = `${uploadKey}/${uniqueName}.${ext}`;
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

      const visibleImageUrls = [...existingImageUrls, ...uploadedUrls];

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

      let recipeId = initialRecipe?.id ?? '';
      const storedSlug =
        initialRecipe?.slug?.trim() ||
        (isEditMode && initialRecipe?.id
          ? initialRecipe.id
          : buildTemporaryRecipeSlug(mainTitle));

      if (isEditMode && initialRecipe) {
        const { data: recipe, error: recipeError } = await supabase
          .from('recipes')
          .update({
            category_id: resolvedCategoryId,
            slug: storedSlug,
            title: draft.title,
            description: description.trim(),
            story: story.trim(),
            image_url: visibleImageUrls[0] ?? null,
            image_hint: imageHint.trim() || null,
            prep_time: prepTime.trim(),
            cook_time: cookTime.trim(),
            servings: parsedServings,
          })
          .eq('id', initialRecipe.id)
          .select('id')
          .single<{ id: string }>();

        if (recipeError || !recipe) {
          setErrorMessage(
            getFriendlyAdminError(recipeError?.message || 'Could not update recipe.')
          );
          return;
        }

        recipeId = recipe.id;
      } else {
        const { data: recipe, error: recipeError } = await supabase
          .from('recipes')
          .insert({
            author_id: user.id,
            category_id: resolvedCategoryId,
            slug: storedSlug,
            title: draft.title,
            description: description.trim(),
            story: story.trim(),
            image_url: visibleImageUrls[0] ?? null,
            image_hint: imageHint.trim() || null,
            prep_time: prepTime.trim(),
            cook_time: cookTime.trim(),
            servings: parsedServings,
          })
          .select('id')
          .single<{ id: string }>();

        if (recipeError || !recipe) {
          setErrorMessage(
            getFriendlyAdminError(recipeError?.message || 'Could not create recipe.')
          );
          return;
        }

        recipeId = recipe.id;

        // New recipes use the row id as the public identifier, even though the table still requires a slug column.
        const { error: slugUpdateError } = await supabase
          .from('recipes')
          .update({ slug: recipe.id })
          .eq('id', recipe.id);

        if (slugUpdateError) {
          setErrorMessage(
            getFriendlyAdminError(
              slugUpdateError.message ||
                'Recipe was created, but the internal identifier could not be finalized.'
            )
          );
          return;
        }
      }

      if (isEditMode) {
        const [deleteImages, deleteIngredients, deleteSteps, deleteTips] =
          await Promise.all([
            supabase.from('recipe_images').delete().eq('recipe_id', recipeId),
            supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId),
            supabase.from('recipe_steps').delete().eq('recipe_id', recipeId),
            supabase.from('recipe_tips').delete().eq('recipe_id', recipeId),
          ]);

        const deleteError =
          deleteImages.error ||
          deleteIngredients.error ||
          deleteSteps.error ||
          deleteTips.error;

        if (deleteError) {
          setErrorMessage(
            `Recipe updated, but clearing old detail rows failed: ${getFriendlyAdminError(deleteError.message)}`
          );
          return;
        }
      }

      if (visibleImageUrls.length > 1) {
        const extraImages = visibleImageUrls.slice(1).map((url, i) => ({
          recipe_id: recipeId,
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

      const ingredientInsertRows = previewIngredientRows.map((line, index) => ({
        recipe_id: recipeId,
        position: index,
        quantity: line.quantity,
        name: line.name,
      }));

      const stepInsertRows = previewStepRows.map((line, index) => ({
        recipe_id: recipeId,
        position: index,
        body: line,
      }));

      const tipInsertRows = previewTipRows.map((line, index) => ({
        recipe_id: recipeId,
        position: index,
        body: line,
      }));

      const writes = [
        ingredientInsertRows.length > 0
          ? supabase.from('recipe_ingredients').insert(ingredientInsertRows)
          : Promise.resolve({ error: null }),
        stepInsertRows.length > 0
          ? supabase.from('recipe_steps').insert(stepInsertRows)
          : Promise.resolve({ error: null }),
        tipInsertRows.length > 0
          ? supabase.from('recipe_tips').insert(tipInsertRows)
          : Promise.resolve({ error: null }),
      ];

      const [ingredientResult, stepResult, tipResult] = await Promise.all(writes);
      const writeError =
        ingredientResult.error || stepResult.error || tipResult.error;

      if (writeError) {
        setErrorMessage(
          `Recipe ${isEditMode ? 'updated' : 'created'}, but some detail rows failed to save: ${getFriendlyAdminError(writeError.message)}`
        );
        return;
      }

      setSuccessMessage(
        isEditMode
          ? 'Recipe updated successfully. Going back to admin...'
          : 'Recipe published successfully. Opening the recipe page...'
      );
      startNavigation();
      router.push(isEditMode ? '/admin/recipes' : `/recipes/${recipeId}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary">
            {currentStep === 'preview'
              ? isEditMode
                ? 'Admin Recipe Review'
                : 'Admin Recipe Preview'
              : isEditMode
                ? 'Admin Recipe Editor'
                : 'Admin Recipe Publisher'}
          </Badge>
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl">
              {currentStep === 'preview'
                ? isEditMode
                  ? 'Review Changes'
                  : 'View Recipe'
                : isEditMode
                  ? 'Edit Uploaded Recipe'
                  : 'Upload a Recipe'}
            </h1>
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
              {currentStep === 'preview'
                ? isEditMode
                  ? 'Review your changes carefully. The live recipe will not update until you explicitly save the changes.'
                  : 'Review the draft recipe exactly before it goes live. Publish it, or go back and edit anything first.'
                : isEditMode
                  ? 'Update the existing recipe entry, then review the changes before saving them to the live recipe.'
                  : 'Publish a complete recipe entry with structured ingredients, instructions, tips, and the story behind the dish.'}
            </p>
          </div>
        </div>

        <AdminNav />

        <div className="grid gap-6">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>
                {isEditMode ? 'Couldn&apos;t save recipe changes' : 'Couldn&apos;t publish recipe'}
              </AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert>
              <AlertTitle>Recipe published</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : null}

          {!isEditMode && (
            <div className="flex flex-wrap gap-2">
              <Badge variant={currentStep === 'edit' ? 'default' : 'outline'}>
                1. Edit Recipe
              </Badge>
              <Badge variant={currentStep === 'preview' ? 'default' : 'outline'}>
                2. View Recipe
              </Badge>
            </div>
          )}

          {currentStep === 'edit' ? (
            <>
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
                      <Label htmlFor="mainTitle">Title in English</Label>
                      <Input
                        id="mainTitle"
                        required
                        value={mainTitle}
                        onChange={(event) => setMainTitle(event.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="burmeseTitle">
                        Title in Burmese
                        <span className="ml-1 font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="burmeseTitle"
                        value={burmeseTitle}
                        onChange={(event) => setBurmeseTitle(event.target.value)}
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
                          (first = cover, you can add more than once)
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
                          {allImagePreviews.map((src, i) => (
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

              <div className="grid gap-6 lg:grid-cols-2">
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
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Tips</CardTitle>
                  <CardDescription>
                    Optional. Add a short tip or a longer note for the recipe page.
                    New lines are fine, but the public recipe will show this as one readable text block.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    rows={6}
                    value={tipsText}
                    onChange={(event) => setTipsText(event.target.value)}
                  />
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin">Cancel</Link>
                </Button>
                {isEditMode ? (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => { void handlePublish(); }}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                ) : (
                  <Button type="button" onClick={handleViewRecipe}>
                    Review Recipe
                  </Button>
                )}
              </div>
            </>
          ) : previewDraft ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Draft Preview</CardTitle>
                  <CardDescription>
                    {isEditMode
                      ? 'This is the last review step before saving. The public recipe stays unchanged until you click save.'
                      : 'This is the last review step before publishing. Nothing is live yet, so you can proofread, check spelling, and review the gallery safely.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Only the{' '}
                    <span className="font-semibold text-foreground">
                      {isEditMode ? 'Save Changes' : 'Publish When Ready'}
                    </span>{' '}
                    button will {isEditMode ? 'update the live recipe.' : 'make this recipe live.'}
                  </p>
                </CardContent>
              </Card>

              <article className="mx-auto w-full max-w-5xl border-2 border-foreground bg-paper p-4 paper-shadow sm:p-6 md:p-10">
                <header className="mb-8 text-center">
                  <Badge variant="secondary" className="mb-4">
                    {previewDraft.categoryName}
                  </Badge>
                  <h2 className="mb-4 font-headline text-3xl tracking-tight sm:text-4xl md:text-6xl md:leading-tight">
                    {previewDraft.title}
                  </h2>
                  <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                    {previewDraft.description}
                  </p>
                </header>

                {previewDraft.coverImagePreview ? (
                  <div className="relative mb-8 aspect-video w-full border-2 border-foreground paper-shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewDraft.coverImagePreview}
                      alt={previewDraft.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-8 flex aspect-video w-full items-center justify-center border-2 border-dashed border-foreground bg-background p-6 text-center text-sm text-muted-foreground">
                    No cover image selected yet. The recipe will publish without a cover image unless one is added.
                  </div>
                )}

                <div className="my-8 border-y-2 border-dashed border-foreground py-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Prep Time</p>
                      <p className="text-lg font-semibold">{previewDraft.prepTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cook Time</p>
                      <p className="text-lg font-semibold">{previewDraft.cookTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Servings</p>
                      <p className="text-lg font-semibold">{previewDraft.parsedServings}</p>
                    </div>
                  </div>
                </div>

                <div className="my-8 border-2 border-foreground bg-secondary p-6 text-lg text-foreground/90 paper-shadow-sm">
                  <p className="italic leading-relaxed">{previewDraft.story}</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-5 md:gap-8 lg:gap-12">
                  <div className="md:col-span-2">
                    <h3 className="mb-4 border-b-2 border-foreground pb-2 font-headline text-3xl">
                      Ingredients
                    </h3>
                    <ul className="space-y-3 text-base">
                      {previewDraft.ingredientRows.map((ingredient, index) => (
                        <li key={`${ingredient.name}-${index}`} className="flex items-start gap-3 p-2">
                          <div>
                            <span className="font-semibold">{ingredient.quantity}</span>
                            <span className="text-muted-foreground"> {ingredient.name}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="md:col-span-3">
                    <h3 className="mb-4 border-b-2 border-foreground pb-2 font-headline text-3xl">
                      Instructions
                    </h3>
                    <ol className="space-y-6 text-base leading-loose">
                      {previewDraft.stepRows.map((step, index) => (
                        <li key={`${step}-${index}`} className="flex items-start gap-4">
                          <div className="mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center border-2 border-foreground font-headline text-lg font-bold text-foreground">
                            {index + 1}
                          </div>
                          <p>{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {previewDraft.tipRows.length > 0 ? (
                  <>
                    <Separator className="my-10" />
                    <section>
                      <h3 className="mb-4 font-headline text-3xl">Tips</h3>
                      <RecipeTipsPanel
                        tips={previewDraft.tipRows}
                        className="bg-background"
                      />
                    </section>
                  </>
                ) : null}

                {previewDraft.galleryImagePreviews.length > 1 ? (
                  <>
                    <Separator className="my-10" />
                    <section>
                      <h3 className="mb-4 font-headline text-3xl">Additional Images</h3>
                      <ImageStripLightbox
                        dialogTitle={`${previewDraft.title} draft gallery`}
                        dialogDescription={`Large preview for the additional draft images in ${previewDraft.title}.`}
                        images={previewDraft.galleryImagePreviews
                          .slice(1)
                          .map((src, index) => ({
                            alt: `${previewDraft.title} gallery ${index + 1}`,
                            src,
                          }))}
                      />
                    </section>
                  </>
                ) : null}
              </article>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentStep('edit');
                    setErrorMessage(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Go Back to Edit
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    void handlePublish();
                  }}
                >
                  {isSubmitting
                    ? isEditMode
                      ? 'Saving changes...'
                      : 'Publishing recipe...'
                    : isEditMode
                      ? 'Save Changes'
                      : 'Publish When Ready'}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
