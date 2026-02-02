export interface ImageProps {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  uploader: string;
  imageUrl: string;
  thumbnailUrl: string;
  categoryId?: string;
  categoryName?: string;
}
