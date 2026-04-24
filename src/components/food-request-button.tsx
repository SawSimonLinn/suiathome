'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Step = 'form' | 'success';

export function FoodRequestButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [foodName, setFoodName] = useState('');
  const [country, setCountry] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleOpen() {
    setStep('form');
    setFoodName('');
    setCountry('');
    setPhotoFile(null);
    setError(null);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!foodName.trim() || !country.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setUploading(true);
    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        const supabase = createClient();
        const ext = photoFile.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('food-request-photos')
          .upload(path, photoFile, { upsert: false });

        if (uploadError) throw new Error('Photo upload failed. Please try again.');

        const { data: urlData } = supabase.storage
          .from('food-request-photos')
          .getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const res = await fetch('/api/food-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodName, country, photoUrl }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Something went wrong.');
      if (json.emailError) console.error('[food-request] Email failed:', json.emailError);

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={handleOpen}
        aria-label="Request a food"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors border-2 border-primary-foreground/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">
              Request a Food
            </DialogTitle>
          </DialogHeader>

          {step === 'success' ? (
            <div className="py-6 text-center space-y-3">
              <div className="text-4xl">🎉</div>
              <p className="font-headline text-lg text-foreground">
                Request received!
              </p>
              <p className="text-sm text-muted-foreground">
                Thank you! We'll look into adding{' '}
                <span className="font-semibold text-foreground">{foodName}</span>{' '}
                from <span className="font-semibold text-foreground">{country}</span> to the site.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="food-name">Food name</Label>
                <Input
                  id="food-name"
                  placeholder="e.g. Mohinga"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  disabled={uploading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="food-country">Country of origin</Label>
                <Input
                  id="food-country"
                  placeholder="e.g. Myanmar"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={uploading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Photo (optional)</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0"
                  >
                    {photoFile ? 'Change photo' : 'Upload photo'}
                  </Button>
                  {photoFile && (
                    <span className="text-sm text-muted-foreground truncate max-w-[160px]">
                      {photoFile.name}
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  className="hidden"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={uploading}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Sending…' : 'Send request'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
