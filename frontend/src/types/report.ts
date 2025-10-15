export interface ReportImage {
  public_id: string;
  url: string;
  _id: string;
}

export interface ReportCategory {
  name: string;
}

export interface ReportItem {
  _id: string;
  name: string;
  description: string;
  category: ReportCategory;
  images: ReportImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  _id: string;
  title: string;
  type: "lost" | "found";
  location: string;
  date: string;
  contactInfo: string;
  reward: string;
  reporter: string;
  item: ReportItem;
  createdAt: string;
  updatedAt: string;
}

export interface ReportsApiResponse {
  status: boolean;
  message: string;
  data: {
    total: number;
    page: number;
    totalPages: number;
    limit?: number;
    reports: Report[];
  };
}

export interface ReportsPaginationMeta {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ItemCardData {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  type: "lost" | "found";
  image?: string;
}
