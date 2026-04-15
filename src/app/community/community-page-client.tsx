'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CommunityPostCard } from '@/components/community-post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import type { CommunityPost, Recipe, User } from '@/lib/types';

type CommunityPageClientProps = {
  initialPosts: CommunityPost[];
  availableRecipes?: Recipe[];
  currentUser: User | null;
};

type CommunitySortOption = 'newest' | 'oldest' | 'most-viewed';

function createImagePath(userId: string, fileName: string) {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-');
  return `${userId}/${Date.now()}-${sanitizedName}`;
}

export function CommunityPageClient({
  initialPosts,
  availableRecipes = [],
  currentUser,
}: CommunityPageClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [caption, setCaption] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState('none');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editingCaption, setEditingCaption] = useState('');
  const [editingRecipeId, setEditingRecipeId] = useState('none');
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const isLoggedIn = Boolean(currentUser);
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRecipeId, setFilterRecipeId] = useState('all');
  const [sortOption, setSortOption] = useState<CommunitySortOption>('newest');

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterRecipeId === 'all' || post.linkedRecipeId === filterRecipeId;
    return matchesSearch && matchesFilter;
  });

  const sortedPosts = [...filteredPosts].sort((left, right) => {
    if (sortOption === 'oldest') {
      return (
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      );
    }

    if (sortOption === 'most-viewed') {
      if (right.views !== left.views) {
        return right.views - left.views;
      }

      return (
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime()
      );
    }

    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });

  const startEditingPost = (post: CommunityPost) => {
    setEditingPost(post);
    setEditingCaption(post.caption);
    setEditingRecipeId(post.linkedRecipeId || 'none');
    setEditErrorMessage(null);
  };

  const closeEditDialog = () => {
    setEditingPost(null);
    setEditingCaption('');
    setEditingRecipeId('none');
    setEditErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser) {
      setErrorMessage('Sign in before posting to the community feed.');
      return;
    }

    if (!caption.trim()) {
      setErrorMessage('Write a caption before posting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      let imagePath: string | null = null;
      let imageUrl = '';

      if (selectedFile) {
        imagePath = createImagePath(currentUser.id, selectedFile.name);
        const { error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(imagePath, selectedFile, {
            upsert: false,
          });

        if (uploadError) {
          setErrorMessage(uploadError.message);
          return;
        }

        const { data } = supabase.storage
          .from('community-images')
          .getPublicUrl(imagePath);
        imageUrl = data.publicUrl;
      }

      const linkedRecipeId =
        selectedRecipeId !== 'none' ? selectedRecipeId : null;

      const { data: insertedPost, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: currentUser.id,
          linked_recipe_id: linkedRecipeId,
          caption: caption.trim(),
          image_path: imagePath,
          image_hint: selectedFile ? 'community food post' : null,
        })
        .select('id, caption, created_at, linked_recipe_id, image_hint')
        .single<{
          id: string;
          caption: string;
          created_at: string;
          linked_recipe_id: string | null;
          image_hint: string | null;
        }>();

      if (error || !insertedPost) {
        setErrorMessage(error?.message || 'Could not create post.');
        return;
      }

      setPosts((current) => [
        {
          id: insertedPost.id,
          user: currentUser,
          caption: insertedPost.caption,
          imageUrl,
          imageHint: insertedPost.image_hint || 'community food post',
          likes: 0,
          views: 0,
          isLiked: false,
          comments: [],
          createdAt: insertedPost.created_at,
          linkedRecipeId: insertedPost.linked_recipe_id,
        },
        ...current,
      ]);
      setCaption('');
      setSelectedRecipeId('none');
      setSelectedFile(null);
      setIsCreateExpanded(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
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
      const linkedRecipeId =
        editingRecipeId !== 'none' ? editingRecipeId : null;

      const { data: updatedPost, error } = await supabase
        .from('community_posts')
        .update({
          caption: editingCaption.trim(),
          linked_recipe_id: linkedRecipeId,
        })
        .eq('id', editingPost.id)
        .eq('user_id', currentUser.id)
        .select('id, caption, linked_recipe_id')
        .single<{
          id: string;
          caption: string;
          linked_recipe_id: string | null;
        }>();

      if (error || !updatedPost) {
        setEditErrorMessage(error?.message || 'Could not update post.');
        return;
      }

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === updatedPost.id
            ? {
                ...post,
                caption: updatedPost.caption,
                linkedRecipeId: updatedPost.linked_recipe_id,
              }
            : post
        )
      );
      closeEditDialog();
      router.refresh();
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl">Community Feed</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-lg">
          See what fellow home cooks are creating and sharing.
        </p>
      </header>

      {isLoggedIn && currentUser ? (
        <Card className="mb-8 mx-auto max-w-2xl">
          {!isCreateExpanded ? (
            <CardContent className="p-4">
              <button
                type="button"
                onClick={() => setIsCreateExpanded(true)}
                className="flex w-full items-center gap-3 text-left"
              >
                <Avatar>
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 rounded-full border bg-muted px-4 py-2 text-sm text-muted-foreground hover:bg-muted/80 transition-colors">
                  What did you make?
                </span>
              </button>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Avatar>
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  Create a post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                  {errorMessage ? (
                    <p className="text-sm text-destructive">{errorMessage}</p>
                  ) : null}

                  <Textarea
                    placeholder="What did you make?"
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                    required
                    rows={3}
                    autoFocus
                  />
                  <div>
                    <label
                      htmlFor="recipe-link"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Tag a recipe
                    </label>
                    <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                      <SelectTrigger id="recipe-link" className="mt-1">
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
                    <p className="mt-2 text-xs text-muted-foreground">
                      Tagging a recipe makes this post show up on that recipe page.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="photo"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Add a photo
                    </label>
                    <Input
                      id="photo"
                      type="file"
                      className="mt-1"
                      accept="image/*"
                      onChange={(event) =>
                        setSelectedFile(event.target.files?.[0] || null)
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateExpanded(false);
                        setCaption('');
                        setSelectedRecipeId('none');
                        setSelectedFile(null);
                        setErrorMessage(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      ) : (
        <Card className="mb-8 mx-auto max-w-2xl">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Sign in to create community posts and join the conversation.
          </CardContent>
        </Card>
      )}

      <div className="mx-auto mb-6 grid max-w-4xl gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_220px]">
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Select value={filterRecipeId} onValueChange={setFilterRecipeId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by recipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All recipes</SelectItem>
            {availableRecipes.map((recipe) => (
              <SelectItem key={recipe.id} value={recipe.id}>
                {recipe.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sortOption}
          onValueChange={(value) =>
            setSortOption(value as CommunitySortOption)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort posts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most-viewed">Most viewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              canEdit={currentUser?.id === post.user.id}
              onEdit={startEditingPost}
            />
          ))
        ) : (
          <div>
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {searchQuery || filterRecipeId !== 'all'
                  ? 'No posts match your search.'
                  : 'No community posts yet.'}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={Boolean(editingPost)} onOpenChange={(open) => {
        if (!open) {
          closeEditDialog();
        }
      }}>
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
