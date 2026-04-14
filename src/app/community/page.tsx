'use client';

import { useState } from 'react';
import { CommunityPostCard } from '@/components/community-post-card';
import { getCommunityPosts, recipes, users } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CommunityPost } from '@/lib/types';

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(getCommunityPosts());
  const [caption, setCaption] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState('');
  
  // Placeholder for auth state
  const isLoggedIn = true;
  const currentUser = users[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      user: currentUser,
      caption: caption,
      imageUrl: 'https://picsum.photos/seed/newpost/600/600', // Placeholder image
      imageHint: 'community food post',
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      linkedRecipe: recipes.find(r => r.id === selectedRecipe),
    };

    setPosts([newPost, ...posts]);
    setCaption('');
    setSelectedRecipe('');
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Community Feed
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          See what fellow home cooks are creating and sharing!
        </p>
      </header>

      {isLoggedIn && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              Create a post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Textarea
                placeholder="What did you make?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                required
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="photo" className="text-sm font-medium text-muted-foreground">Add a photo</label>
                    <Input id="photo" type="file" className="mt-1"/>
                 </div>
                 <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                    <SelectTrigger>
                      <SelectValue placeholder="Link a recipe (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {recipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Post</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {posts.map((post) => (
          <CommunityPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
