'use client';

import { useState } from 'react';

import { CommunityPostCard } from '@/components/community-post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import type { CommunityPost, User } from '@/lib/types';

type CommunityPageClientProps = {
  initialPosts: CommunityPost[];
  currentUser: User | null;
};

function createImagePath(userId: string, fileName: string) {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-');
  return `${userId}/${Date.now()}-${sanitizedName}`;
}

export function CommunityPageClient({
  initialPosts,
  currentUser,
}: CommunityPageClientProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoggedIn = Boolean(currentUser);

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

      const { data: insertedPost, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: currentUser.id,
          caption: caption.trim(),
          image_path: imagePath,
          image_hint: selectedFile ? 'community food post' : null,
        })
        .select('id, caption, created_at, image_hint')
        .single<{
          id: string;
          caption: string;
          created_at: string;
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
          comments: [],
          createdAt: insertedPost.created_at,
        },
        ...current,
      ]);
      setCaption('');
      setSelectedFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="font-headline text-4xl md:text-5xl">Community Feed</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-lg">
          See what fellow home cooks are creating and sharing.
        </p>
      </header>

      {isLoggedIn && currentUser ? (
        <Card className="mb-8">
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
              />
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

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Sign in to create community posts and join the conversation.
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {posts.length > 0 ? (
          posts.map((post) => <CommunityPostCard key={post.id} post={post} />)
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No community posts yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
