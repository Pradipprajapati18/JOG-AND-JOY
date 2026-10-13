import { useMemo } from 'react';
import { useProductsList } from './useProducts';
import { useCategoriesList } from './useCategories';

export function useCombinedProducts() {
  const { data: productsData, isLoading: isProductsLoading } = useProductsList();
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategoriesList();
  
  const combinedProducts = useMemo(() => {
    const rawProducts = productsData?.data || [];
    const categories = categoriesResponse?.data || [];

    // Map Category Labels to UUIDs for legacy support
    const categoryMap = new Map();
    categories.forEach(c => categoryMap.set(c.label, c.id));

    const liveProducts = rawProducts
      .filter(p => p.status === 'live' || !p.status) // filter out draft/archived
      .map(p => {
        let finalCategoryId = p.categoryId;
        
        // Graceful handling for legacy products where categoryId is the label
        if (categoryMap.has(p.categoryId)) {
          finalCategoryId = categoryMap.get(p.categoryId);
        }

        let categoryName = finalCategoryId;
        const matchedCat = categories.find(c => c.id === finalCategoryId || c.label === finalCategoryId);
        if (matchedCat) {
          categoryName = matchedCat.label;
        }

        return {
          id: p.id,
          name: p.title || 'Untitled Product',
          categoryId: finalCategoryId,
          category: categoryName,
          price: p.price || p.basePrice || 0,
          originalPrice: p.originalPrice || p.compareAtPrice,
          isNew: p.isNewArrival || false,
          image: p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop',
          gallery: p.images || (p.image ? [p.image] : []),
          description: p.description,
          fabric: p.fabric,
          care: p.care,
          shipping: p.shipping,
          sizes: p.sizes || [],
          colors: p.colors || [],
          variants: p.variants || [],
          groupId: p.groupId || null,
          stock: p.variants?.[0]?.stock || p.stock || 0,
          collections: p.collections || [],
          ageGroup: p.ageGroup || null,
          rating: p.rating || 4.8,
          reviewsCount: p.reviewsCount || 24
        };
      });
    
    return liveProducts;
  }, [productsData, categoriesResponse]);

  return { combinedProducts, isLoading: isProductsLoading || isCategoriesLoading };
}
