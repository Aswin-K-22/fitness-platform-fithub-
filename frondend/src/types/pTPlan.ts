export interface PTPlan {
  id: string;
  title: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  mode: 'online';
  description: string;
  goal: string;
  features: string[];
  duration: number;
  image: string | null;
  trainerPrice: number;
  adminPrice: number | null;
  totalPrice: number | null;
  verifiedByAdmin: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive :boolean; 
}

export interface FetchPTPlansResponse {
  plans: PTPlan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}