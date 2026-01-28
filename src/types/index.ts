export interface ImageProps {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  uploader: string;
  thumbnailUrl: string;
}

export interface CategoryProps {
  id: string;
  name: string;
  images_qty: number;
  size: number;
  createDate: string;
  creator: string;
}

export interface CreateCategoryProps {
  onSuccess: () => void;
}

export interface UploadImageButtonProps {
  categoryId: string;
  onUploadSuccess: () => void;
}

export interface ImageItem {
  id: string;
  name: string;
  productUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
}

export interface CategoryDetail {
  id: string;
  name: string;
  images: ImageItem[];
}

export interface BreadcrumbProps {
  pageTitle: string;
  subPageTitle?: string;
}