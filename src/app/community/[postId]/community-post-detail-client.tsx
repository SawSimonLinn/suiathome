'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { CommunityPostCard } from '@/components/community-post-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { CommunityPost, Recipe, User } from '@/lib/types';

type CommunityPostDetailClientProps = {
  post: CommunityPost;
  currentUser: User | null;
  availableRecipes: Recipe[];
  linkedRecipe: Recipe | null;
};

export function CommunityPostDetailClient({
  post: initialPost,
  currentUser,
  availableRecipes,
  linkedRecipe: initialLinkedRecipe,
}: CommunityPostDetailClientProps) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [linkedRecipe, setLinkedRecipe] = useState(initialLinkedRecipe);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editingCaption, setEditingCaption] = useState('');
  const [editingRecipeId, setEditingRecipeId] = useState('none');
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const canEdit = currentUser?.id === post.user.id;

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', currentUser.id);

      if (error) {
        toast({ variant: 'destructive', title: 'Could not delete post', description: error.message });
        return;
      }

      router.push('/community');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not delete post', description: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleToggleHide = async (p: CommunityPost) => {
    if (!currentUser) return;

    const newHidden = !p.isHidden;
    setPost((current) => ({ ...current, isHidden: newHidden }));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('community_posts')
        .update({ is_hidden: newHidden })
        .eq('id', p.id)
        .eq('user_id', currentUser.id);

      if (error) {
        setPost((current) => ({ ...current, isHidden: p.isHidden }));
        toast({ variant: 'destructive', title: 'Could not update post', description: error.message });
        return;
      }

      router.refresh();
    } catch (error) {
      setPost((current) => ({ ...current, isHidden: p.isHidden }));
      toast({ variant: 'destructive', title: 'Could not update post', description: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const startEditingPost = (p: CommunityPost) => {
    setEditingPost(p);
    setEditingCaption(p.caption);
    setEditingRecipeId(p.linkedRecipeId || 'none');
    setEditErrorMessage(null);
  };

  const closeEditDialog = () => {
    setEditingPost(null);
    setEditingCaption('');
    setEditingRecipeId('none');
    setEditErrorMessage(null);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser || !editingPost) {
      setEditErrorMessage('Sign in before editing your post.');
      return;
    }

    if (!editingCaption.trim()) {
      setEditErrorMessage('Write a caption before saving.');
      return;
    }

    setIsSavingEdit(true);
    setEditErrorMessage(null);

    try {
      const supabase = createClient();
      const linkedRecipeId = editingRecipeId !== 'none' ? editingRecipeId : null;

      const { data: updatedPost, error } = await supabase
        .from('community_posts')
        .update({
          caption: editingCaption.trim(),
          linked_recipe_id: linkedRecipeId,
        })
        .eq('id', editingPost.id)
        .eq('user_id', currentUser.id)
        .select('id, caption, linked_recipe_id')
        .single<{ id: string; caption: string; linked_recipe_id: string | null }>();

      if (error || !updatedPost) {
        setEditErrorMessage(error?.message || 'Could not update post.');
        return;
      }

      setPost((current) => ({
        ...current,
        caption: updatedPost.caption,
        linkedRecipeId: updatedPost.linked_recipe_id,
      }));

      const newLinked = updatedPost.linked_recipe_id
        ? (availableRecipes.find((r) => r.id === updatedPost.linked_recipe_id) ?? null)
        : null;
      setLinkedRecipe(newLinked);

      closeEditDialog();
      router.refresh();
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/community">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Community Feed
          </Link>
        </Button>
      </div>

      <CommunityPostCard
        post={post}
        currentUser={currentUser}
        canEdit={canEdit}
        onEdit={startEditingPost}
        onDelete={handleDeletePost}
        onToggleHide={handleToggleHide}
      />

      {linkedRecipe && (
        <div className="mt-6 rounded-md border-2 border-foreground bg-paper p-4 paper-shadow-sm">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Tagged recipe</p>
          <Link
            href={`/recipes/${linkedRecipe.slug}`}
            className="font-semibold hover:underline"
          >
            {linkedRecipe.title}
          </Link>
        </div>
      )}

      <Dialog
        open={Boolean(editingPost)}
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update your caption or retag the recipe for this post.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleEditSubmit}>
            {editErrorMessage ? (
              <p className="text-sm text-destructive">{editErrorMessage}</p>
            ) : null}
            <Textarea
              value={editingCaption}
              onChange={(event) => setEditingCaption(event.target.value)}
              required
              rows={4}
            />
            <div>
              <label
                htmlFor="edit-recipe-link"
                className="text-sm font-medium text-muted-foreground"
              >
                Tag a recipe
              </label>
              <Select value={editingRecipeId} onValueChange={setEditingRecipeId}>
                <SelectTrigger id="edit-recipe-link" className="mt-1">
                  <SelectValue placeholder="Select a recipe (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableRecipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingEdit}>
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
