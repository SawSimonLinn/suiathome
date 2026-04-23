import type { Recipe, Category, User, CommunityPost, CommunityComment } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Sui', avatarUrl: 'https://i.pravatar.cc/150?u=user-1' },
  { id: 'user-2', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?u=user-2' },
  { id: 'user-3', name: 'Maria', avatarUrl: 'https://i.pravatar.cc/150?u=user-3' },
];

export const categories: Category[] = [
  { id: 'cat-1', name: 'Italian' },
  { id: 'cat-2', name: 'Dessert' },
  { id: 'cat-3', name: 'Indian' },
  { id: 'cat-4', name: 'Breakfast' },
  { id: 'cat-5', name: 'Mexican' },
  { id: 'cat-6', name: 'Soup' },
  { id: 'cat-7', name: 'Salad' },
];

export const recipes: Recipe[] = [
  {
    id: 'recipe-1',
    slug: 'classic-spaghetti-carbonara',
    title: 'Classic Spaghetti Carbonara',
    description: 'A creamy, delicious, and authentic Italian pasta that comes together in under 30 minutes.',
    story: 'This recipe is a tribute to my travels in Rome. The simplicity of fresh ingredients creating such a rich flavor always amazes me. It’s a go-to for a quick yet impressive weeknight dinner.',
    imageId: 'spaghetti-carbonara',
    category: categories[0],
    prepTime: '10 mins',
    cookTime: '20 mins',
    servings: 4,
    ingredients: [
      { quantity: '200g', name: 'Spaghetti' },
      { quantity: '100g', name: 'Pancetta or Guanciale' },
      { quantity: '2 large', name: 'Eggs' },
      { quantity: '50g', name: 'Pecorino Romano cheese, grated' },
      { quantity: 'to taste', name: 'Black pepper' },
    ],
    steps: [
      'Cook spaghetti according to package directions.',
      'While pasta cooks, fry pancetta in a large skillet until crisp.',
      'In a bowl, whisk eggs and Pecorino cheese.',
      'Drain pasta, reserving some pasta water. Add pasta to the skillet with pancetta.',
      'Remove from heat and quickly stir in the egg mixture. Add pasta water if needed to create a creamy sauce.',
      'Serve immediately with lots of freshly ground black pepper.',
    ],
    tips: [
      'Use room temperature eggs to prevent scrambling.',
      'The heat of the pasta cooks the eggs, so work quickly!',
      'Don\'t drain all the pasta water; it\'s liquid gold for the sauce.',
    ],
    likes: 256,
    favorites: 120,
    views: 0,
    comments: [
      { id: 'comment-1', text: 'This was amazing! So easy to make.', user: users[1], createdAt: '2024-05-10T12:00:00Z', replies: [] },
      { id: 'comment-2', text: 'My family loved it. Will make again!', user: users[2], createdAt: '2024-05-11T14:30:00Z', replies: [] },
    ],
    createdAt: '2024-05-10T10:00:00Z',
    author: users[0],
  },
  {
    id: 'recipe-2',
    slug: 'chewy-chocolate-chip-cookies',
    title: 'Chewy Chocolate Chip Cookies',
    description: 'The ultimate recipe for perfectly soft, chewy, and chocolate-packed cookies every time.',
    story: 'Baking cookies has been a family tradition since I was a child. The smell of these baking instantly brings back warm memories. This recipe has been perfected over years to achieve that ideal chewy texture.',
    imageId: 'chocolate-chip-cookies',
    category: categories[1],
    prepTime: '15 mins',
    cookTime: '12 mins',
    servings: 24,
    ingredients: [
      { quantity: '2 1/4 cups', name: 'All-purpose flour' },
      { quantity: '1 tsp', name: 'Baking soda' },
      { quantity: '1 cup', name: 'Unsalted butter, softened' },
      { quantity: '3/4 cup', name: 'Brown sugar' },
      { quantity: '1/4 cup', name: 'Granulated sugar' },
      { quantity: '1', name: 'Egg' },
      { quantity: '2 tsp', name: 'Vanilla extract' },
      { quantity: '2 cups', name: 'Semi-sweet chocolate chips' },
    ],
    steps: [
      'Preheat oven to 375°F (190°C).',
      'Combine flour and baking soda in a small bowl.',
      'In a large bowl, cream together butter and sugars until light and fluffy.',
      'Beat in the egg and vanilla.',
      'Gradually add the flour mixture.',
      'Stir in chocolate chips.',
      'Drop by rounded tablespoons onto ungreased baking sheets.',
      'Bake for 10-12 minutes or until golden brown.',
    ],
    tips: [
      'Chilling the dough for at least 30 minutes prevents spreading.',
      'Use a mix of dark and milk chocolate chips for more complex flavor.',
      'A pinch of sea salt on top before baking enhances the sweetness.',
    ],
    likes: 512,
    favorites: 350,
    views: 0,
    comments: [],
    createdAt: '2024-05-09T10:00:00Z',
    author: users[0],
  },
  {
    id: 'recipe-3',
    slug: 'creamy-chicken-curry',
    title: 'Creamy Chicken Curry',
    description: 'A fragrant and flavorful chicken curry with a rich, creamy tomato-based sauce.',
    story: 'This chicken curry is my comfort food. The blend of spices creates a symphony of flavors that is both warming and satisfying. It’s a dish that brings people together around the dinner table.',
    imageId: 'chicken-curry',
    category: categories[2],
    prepTime: '20 mins',
    cookTime: '30 mins',
    servings: 4,
    ingredients: [
      { quantity: '1 lb', name: 'Chicken breast, cubed' },
      { quantity: '1', name: 'Onion, chopped' },
      { quantity: '2 cloves', name: 'Garlic, minced' },
      { quantity: '1 inch', name: 'Ginger, grated' },
      { quantity: '1 can (14oz)', name: 'Diced tomatoes' },
      { quantity: '1 cup', name: 'Coconut milk' },
      { quantity: '2 tbsp', name: 'Curry powder' },
      { quantity: '1 tsp', name: 'Turmeric' },
    ],
    steps: [
        'Season chicken with salt and pepper.',
        'In a large pot, sauté onion, garlic, and ginger until soft.',
        'Add curry powder and turmeric, cooking for another minute until fragrant.',
        'Add chicken and cook until browned.',
        'Stir in diced tomatoes and coconut milk. Bring to a simmer.',
        'Reduce heat, cover, and cook for 15-20 minutes until chicken is cooked through.',
        'Serve hot with rice and naan bread.',
    ],
    tips: [
      'For a richer flavor, marinate the chicken in yogurt and spices for an hour beforehand.',
      'A squeeze of lime juice at the end brightens up the flavors.',
      'Toast the spices in the pan before adding liquids to deepen their aroma.',
    ],
    likes: 480,
    favorites: 280,
    views: 0,
    comments: [],
    createdAt: '2024-05-08T10:00:00Z',
    author: users[0],
  },
  {
    id: 'recipe-4',
    slug: 'perfect-avocado-toast',
    title: 'Perfect Avocado Toast',
    description: 'A simple, quick, and nutritious breakfast or snack that is endlessly customizable.',
    story: 'Avocado toast is more than a trend; it\'s a canvas for creativity. This is my go-to version for a busy morning, providing a perfect balance of healthy fats, protein, and carbs to start the day right.',
    imageId: 'avocado-toast',
    category: categories[3],
    prepTime: '5 mins',
    cookTime: '5 mins',
    servings: 1,
    ingredients: [
      { quantity: '1 slice', name: 'Sourdough bread' },
      { quantity: '1/2', name: 'Avocado' },
      { quantity: '1', name: 'Egg' },
      { quantity: 'to taste', name: 'Red pepper flakes' },
      { quantity: 'to taste', name: 'Salt and pepper' },
    ],
    steps: [
      'Toast the bread to your desired crispness.',
      'While toasting, mash the avocado in a small bowl.',
      'Fry or poach an egg to your liking.',
      'Spread the mashed avocado over the toast.',
      'Top with the egg, and season with red pepper flakes, salt, and pepper.',
      'Enjoy immediately!',
    ],
    tips: [
      'A sprinkle of "Everything Bagel" seasoning is a game-changer.',
      'Drizzle with a high-quality olive oil for extra richness.',
      'Add some crumbled feta or goat cheese for a tangy kick.',
    ],
    likes: 350,
    favorites: 180,
    views: 0,
    comments: [],
    createdAt: '2024-05-07T10:00:00Z',
    author: users[0],
  },
  {
    id: 'recipe-5',
    slug: 'flavorful-beef-tacos',
    title: 'Flavorful Beef Tacos',
    description: 'Easy, weeknight-friendly ground beef tacos with a homemade seasoning blend.',
    story: 'Taco night is a celebration in our house! This recipe uses a simple homemade spice mix that blows store-bought packets out of the water. It\'s all about fresh, vibrant flavors coming together for a fun, interactive meal.',
    imageId: 'beef-tacos',
    category: categories[4],
    prepTime: '15 mins',
    cookTime: '15 mins',
    servings: 4,
    ingredients: [
        { quantity: '1 lb', name: 'Ground beef' },
        { quantity: '1 tbsp', name: 'Chili powder' },
        { quantity: '1 tsp', name: 'Cumin' },
        { quantity: '1/2 tsp', name: 'Garlic powder' },
        { quantity: '8', name: 'Taco shells' },
        { quantity: 'Assorted', name: 'Toppings (lettuce, cheese, salsa, sour cream)' },
    ],
    steps: [
        'In a large skillet, cook ground beef over medium-high heat until browned. Drain fat.',
        'Stir in chili powder, cumin, garlic powder, salt, and pepper.',
        'Add 1/2 cup of water, bring to a simmer, and cook until the liquid has reduced.',
        'Warm taco shells according to package directions.',
        'Assemble tacos with beef and your favorite toppings.',
    ],
    tips: [
        'Add a tablespoon of tomato paste to the beef mixture for a richer sauce.',
        'A splash of beer or beef broth instead of water can add more depth of flavor.',
        'Squeeze fresh lime over the finished tacos to brighten everything up.',
    ],
    likes: 415,
    favorites: 210,
    views: 0,
    comments: [],
    createdAt: '2024-05-06T10:00:00Z',
    author: users[0],
  }
];

export const communityPosts: CommunityPost[] = [
  {
    id: 'comm-post-1',
    user: users[1], // Alex
    caption: 'Tried the Classic Spaghetti Carbonara and it was a hit! Added a little extra pecorino. 😉',
    imageUrl: 'https://picsum.photos/seed/comm1/600/600',
    imageHint: 'plate of carbonara',
    likes: 42,
    comments: [
      { id: 'cc-1', text: 'Looks delicious!', user: users[2], createdAt: '2024-05-20T10:00:00Z' }
    ],
    createdAt: '2024-05-19T18:00:00Z',
    linkedRecipe: recipes[0], // Classic Spaghetti Carbonara
  },
  {
    id: 'comm-post-2',
    user: users[2], // Maria
    caption: 'My weekend baking project: the Chewy Chocolate Chip Cookies! They are seriously the best.',
    imageUrl: 'https://picsum.photos/seed/comm2/600/600',
    imageHint: 'cookies on a rack',
    likes: 108,
    comments: [],
    createdAt: '2024-05-18T12:30:00Z',
    linkedRecipe: recipes[1], // Chewy Chocolate Chip Cookies
  },
  {
    id: 'comm-post-3',
    user: users[0], // Sui
    caption: 'Just experimenting with some plating for my beef tacos recipe. What do you all think?',
    imageUrl: 'https://picsum.photos/seed/comm3/600/600',
    imageHint: 'plated tacos',
    likes: 95,
    comments: [],
    createdAt: '2024-05-17T09:00:00Z',
    linkedRecipe: recipes[4], // Flavorful Beef Tacos
  }
];

// Helper functions to get data
export function getRecipeBySlug(slug: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.slug === slug);
}

export function getLatestRecipes(count: number): Recipe[] {
  return [...recipes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, count);
}

export function getPopularRecipes(count: number): Recipe[] {
  return [...recipes].sort((a, b) => b.likes - a.likes).slice(0, count);
}

export function getCommunityPosts(): CommunityPost[] {
  return [...communityPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getCommunityPostsByRecipeId(recipeId: string, count: number): CommunityPost[] {
  return communityPosts
    .filter(post => post.linkedRecipe?.id === recipeId)
    .slice(0, count);
}

export function getRelatedRecipes(currentRecipe: Recipe, count: number): Recipe[] {
    // Find recipes in the same category, excluding the current one.
    const relatedByCategory = recipes.filter(
        (recipe) => recipe.category.id === currentRecipe.category.id && recipe.id !== currentRecipe.id
    );

    // If we have enough, return them, sorted by likes.
    if (relatedByCategory.length >= count) {
        return relatedByCategory.sort((a, b) => b.likes - a.likes).slice(0, count);
    }

    // If not, find more recipes from other categories, excluding ones we already have and the current one.
    const otherRecipes = recipes.filter(
        (recipe) => recipe.id !== currentRecipe.id && !relatedByCategory.some(r => r.id === recipe.id)
    ).sort((a,b) => b.likes - a.likes);

    // Combine related by category with other popular recipes.
    const combined = [...relatedByCategory, ...otherRecipes];

    // Return the required number of recipes.
    return combined.slice(0, count);
}
