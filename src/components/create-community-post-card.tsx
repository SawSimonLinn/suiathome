'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { convertHeicToJpeg } from '@/lib/convert-heic';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/lib/types';

interface CreateCommunityPostCardProps {
  recipeId: string;
  recipeTitle: string;
  currentUser: User | null;
}

type Step = 'confirm' | 'compose';

export function CreateCommunityPostCard({
  recipeId,
  recipeTitle,
  currentUser,
}: CreateCommunityPostCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('confirm');
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    if (!currentUser) {
      toast({ title: 'Sign in to post', description: 'You need an account to share your creation.' });
      return;
    }
    setStep('confirm');
    setCaption('');
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    if (!caption.trim()) {
      setError('Add a caption before posting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      let imagePath: string | null = null;

      if (imageFile) {
        const convertedImage = await convertHeicToJpeg(imageFile);
        const ext = convertedImage.name.split('.').pop();
        const path = `${currentUser.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(path, convertedImage, { upsert: false });

        if (uploadError) {
          setError(uploadError.message);
          return;
        }
        imagePath = path;
      }

      const { error: insertError } = await supabase.from('community_posts').insert({
        user_id: currentUser.id,
        linked_recipe_id: recipeId,
        caption: caption.trim(),
        image_path: imagePath,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      toast({ title: 'Post shared!', description: 'Your creation is now in the community feed.' });
      setOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* + card */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-3 border-2 border-dashed border-foreground/40 bg-secondary/30 transition-colors hover:border-foreground hover:bg-secondary/60"
      >
        <span className="flex h-12 w-12 items-center justify-center border-2 border-foreground text-2xl font-bold">
          +
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          Share your creation
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          {step === 'confirm' ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Post about this recipe?</DialogTitle>
                <DialogDescription>
                  You&apos;re about to share your creation based on{' '}
                  <span className="font-semibold text-foreground">&ldquo;{recipeTitle}&rdquo;</span>.
                  Your post will appear in the Community Creations section of this recipe.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setStep('compose')}>
                  Yes, let&apos;s go
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Share your creation</DialogTitle>
                <DialogDescription>
                  Add a photo and caption for your take on &ldquo;{recipeTitle}&rdquo;.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                {/* Image upload */}
                <div className="grid gap-2">
                  <Label htmlFor="post-image">Photo</Label>
                  {imagePreview ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-56 w-full object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-black/60 text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <Input
                      ref={fileInputRef}
                      id="post-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  )}
                </div>

                {/* Caption */}
                <div className="grid gap-2">
                  <Label htmlFor="post-caption">Caption <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="post-caption"
                    rows={3}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Tell us about your version of this recipe..."
                  />
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setStep('confirm')} disabled={isSubmitting}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
