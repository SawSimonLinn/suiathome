export type Category = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  role?: 'user' | 'admin' | null;
};

export type Comment = {
  id: string;
  text: string;
  user: User;
  createdAt: string;
  replies: Comment[];
  isPinned?: boolean;
};

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  description: string;
  story: string;
  imageId?: string;
  imageUrl?: string;
  imageHint?: string;
  galleryImages?: { url: string; position: number }[];
  category: Category;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: { quantity: string; name: string }[];
  steps: string[];
  tips: string[];
  likes: number;
  favorites: number;
  views: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  comments: Comment[];
  createdAt: string;
  author: User;
};

export type CommunityComment = {
  id: string;
  text: string;
  user: User;
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  user: User;
  caption: string;
  imageUrl: string;
  imageHint: string;
  likes: number;
  views: number;
  isLiked?: boolean;
  comments: CommunityComment[];
  createdAt: string;
  linkedRecipeId?: string | null;
  linkedRecipe?: Recipe;
};
