export interface Model {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    fileUrl: string;
  }
  
  export interface ModelsResponse {
    models: Model[];
    totalPages: number;
    currentPage: number;
  }
  