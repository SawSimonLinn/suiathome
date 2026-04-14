export type Category = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Comment = {
  id: string;
  text: string;
  user: User;
  createdAt: string;
};

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  description: string;
  story: string;
  imageId: string;
  category: Category;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: { quantity: string; name: string }[];
  steps: string[];
  tips: string[];
  likes: number;
  favorites: number;
  comments: Comment[];
  createdAt: string;
  author: User;
};
