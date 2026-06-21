/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // Markdown or rich HTML-compatible paragraphs
  category: "Finance" | "Technology" | "Lifestyle" | "Wellness";
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
  image: string;
  tags: string[];
}

export interface AdSenseConfig {
  publisherId: string; // e.g., pub-xxxxxxxxxxxxxxxx
  headerSlotId: string;
  sidebarSlotId: string;
  inArticleSlotId: string;
  footerSlotId: string;
  autoAdsEnabled: boolean;
  adsTxtContent: string;
  isLiveMode: boolean; // false = renders beautiful simulation placeholders, true = runs actual AdSense JS
}

export type AdPosition = "header" | "sidebar" | "in_article" | "footer";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}
