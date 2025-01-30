export interface ICategories {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;  // Date ko string ke form mein store karne ke liye
  updatedAt: string;
}
