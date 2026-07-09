export interface GuideStep {
  /** 1-based step number shown in the UI. */
  n: number;
  title: string;
  /** Optional explanatory text. Some steps are image-only. */
  body?: string;
  /** Screenshot URL (remote CDN or /public path). */
  image?: string;
  alt?: string;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  /** Tab this guide lives under. */
  category: string;
  /** One-line description shown under the title. */
  summary: string;
  /** Optional deep link to where this flow happens in the app. */
  appUrl?: string;
  steps: GuideStep[];
}
