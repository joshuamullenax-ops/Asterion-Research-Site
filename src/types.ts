export interface Report {
  id: string;
  ticker: string;
  companyName: string;
  title: string;
  summary: string;
  fullContent: string[];
  rating: "BUY" | "HOLD" | "SELL";
  ratingStatus: "Overweight" | "Neutral" | "Underweight";
  sector: string;
  region: "Americas" | "EMEA" | "APAC";
  author: {
    name: string;
    role: string;
    avatar?: string;
    bio: string;
  };
  date: string;
  isFeatured?: boolean;
  image?: string;
  driveUrl?: string;
  targetPrice?: string;
  impliedUpside?: string;
  isComingSoon?: boolean;
}

export interface SavedReport {
  reportId: string;
  savedAt: string;
}

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
}
