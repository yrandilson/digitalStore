import { collection, getDocs, query, where, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  imageUrl: string;
  fileUrl: string;
  category: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  featured: boolean;
  active: boolean;
  createdAt: any;
}

/**
 * Map Firestore document to Product interface
 */
function mapDocToProduct(doc: QueryDocumentSnapshot<DocumentData>): Product {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || "",
    slug: data.slug || "",
    price: data.price || 0,
    description: data.description || "",
    imageUrl: data.imageUrl || "",
    fileUrl: data.fileUrl || "",
    category: data.category || "",
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    salesCount: data.salesCount || 0,
    featured: data.featured || false,
    active: data.active !== false,
    createdAt: data.createdAt || null,
  };
}

/**
 * Get all active products
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, "products"), where("active", "==", true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = collection(db, "products");
    const q = query(docRef, where("__name__", "==", id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    return mapDocToProduct(querySnapshot.docs[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, "products"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    return mapDocToProduct(querySnapshot.docs[0]);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category),
      where("active", "==", true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToProduct);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("featured", "==", true),
      where("active", "==", true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.slice(0, limit).map(mapDocToProduct);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}
