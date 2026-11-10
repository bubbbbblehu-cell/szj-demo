export type PortfolioCase = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  descriptionLabel?: string;
  categorySuffix?: string;
  videoPlacement?: 'before-images';
  tags: string[];
  image?: string;
  imageSize?: { width: number; height: number };
  href?: string;
  sections?: { title: string; body: string }[];
  gallery?: { src: string; alt: string; width?: number; height?: number }[];
  videos?: { src: string; poster?: string; title: string; width: number; height: number }[];
  credit?: string;
};

export type PortfolioPlanet = PortfolioCase & {
  cases?: PortfolioCase[];
  category?: string;
  x: number;
  y: number;
  visualRadius: number;
  triggerPadding: number;
  spriteKey: string;
};

