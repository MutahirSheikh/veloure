import { z } from "zod";

const imageSchema = z.string().trim().min(1, "Image path is required.");
const textSchema = z.string().trim().min(1, "Value is required.");
const linkSchema = z.object({
  label: textSchema,
  href: z.string().trim().min(1, "Link is required.")
});

const heroSpotlightCardSchema = z.object({
  title: textSchema,
  price: textSchema,
  compare_at: textSchema,
  image: imageSchema
});

const collectionTileSchema = z.object({
  title: textSchema,
  image: imageSchema,
  href: z.string().trim().min(1).default("/shop")
});

const promoBannerSchema = z.object({
  title: textSchema,
  eyebrow: textSchema,
  image: imageSchema,
  cta_label: textSchema,
  cta_href: z.string().trim().min(1).default("/shop"),
  background: textSchema
});

const storySchema = z.object({
  title: textSchema,
  image: imageSchema,
  category: textSchema,
  href: z.string().trim().min(1).default("/about")
});

const footerPostSchema = z.object({
  title: textSchema,
  date: textSchema,
  image: imageSchema
});

const footerLinkGroupSchema = z.object({
  title: textSchema,
  links: z.array(linkSchema).min(1)
});

const contactCardSchema = z.object({
  title: textSchema,
  body: textSchema,
  icon: z.enum(["mail", "phone", "map-pin"])
});

const homeHeroSchema = z.object({
  supporting_text: textSchema,
  accent_word: textSchema,
  avatar_image: imageSchema,
  hero_image: imageSchema,
  circle_text: textSchema,
  primary_cta_label: textSchema,
  primary_cta_href: z.string().trim().min(1).default("/shop"),
  secondary_cta_label: textSchema,
  secondary_cta_href: z.string().trim().min(1).default("/shop"),
  spotlight_cards: z.array(heroSpotlightCardSchema).min(1)
});

const collectionSectionSchema = z.object({
  eyebrow: textSchema,
  title: textSchema,
  featured_image: imageSchema,
  cta_href: z.string().trim().min(1).default("/shop"),
  tiles: z.array(collectionTileSchema).min(1)
});

const titledSectionSchema = z.object({
  eyebrow: textSchema,
  title: textSchema,
  cta_label: textSchema,
  cta_href: z.string().trim().min(1).default("/shop")
});

const aboutSectionSchema = z.object({
  hero_title: textSchema,
  hero_crumb: textSchema,
  eyebrow: textSchema,
  title: textSchema,
  paragraphs: z.array(textSchema).min(1)
});

const contactSectionSchema = z.object({
  hero_title: textSchema,
  hero_crumb: textSchema,
  cards: z.array(contactCardSchema).min(1)
});

const footerSectionSchema = z.object({
  address: textSchema,
  newsletter_heading: textSchema,
  newsletter_placeholder: textSchema,
  recent_posts: z.array(footerPostSchema).min(1),
  stores: z.array(textSchema).min(1),
  link_groups: z.array(footerLinkGroupSchema).min(1),
  copyright_label: textSchema,
  accepted_payments: z.array(textSchema).min(1)
});

export const storefrontContentSchema = z.object({
  home_hero: homeHeroSchema,
  collection_section: collectionSectionSchema,
  popular_products: z.object({
    eyebrow: textSchema,
    title: textSchema,
    tabs: z.array(textSchema).min(1)
  }),
  editorial_promos: z.array(promoBannerSchema).min(1),
  arrivals_section: titledSectionSchema.extend({
    featured_image: imageSchema
  }),
  offer_section: titledSectionSchema.extend({
    banners: z.array(promoBannerSchema).min(1)
  }),
  journal_section: titledSectionSchema.extend({
    stories: z.array(storySchema).min(1)
  }),
  about_page: aboutSectionSchema,
  contact_page: contactSectionSchema,
  footer: footerSectionSchema
});

export type StorefrontContent = z.infer<typeof storefrontContentSchema>;

export const defaultStorefrontContent: StorefrontContent = {
  home_hero: {
    supporting_text: "Sell globally in minutes with localized style and polished experiences.",
    accent_word: "charming",
    avatar_image: "/images/2.png",
    hero_image: "/images/4.png",
    circle_text: "Explore More",
    primary_cta_label: "Add to cart",
    primary_cta_href: "/shop",
    secondary_cta_label: "View details",
    secondary_cta_href: "/shop",
    spotlight_cards: [
      {
        title: "Cozy Knit Cardigan Sweater",
        price: "$80",
        compare_at: "$87",
        image: "/images/1.png"
      },
      {
        title: "Checkered Slim Collar Shirt",
        price: "$94",
        compare_at: "$103",
        image: "/images/2.png"
      }
    ]
  },
  collection_section: {
    eyebrow: "Discover",
    title: "Latest collection",
    featured_image: "/images/pic8.jpg",
    cta_href: "/shop",
    tiles: [
      { title: "Kid Dress", image: "/images/2.png", href: "/shop" },
      { title: "Woman Dress", image: "/images/3.png", href: "/shop" },
      { title: "Urban Pop", image: "/images/4.png", href: "/shop" },
      { title: "Soft Tailoring", image: "/images/5.png", href: "/shop" }
    ]
  },
  popular_products: {
    eyebrow: "Most Popular Products",
    title: "Shop the statement edit",
    tabs: ["All", "Dresses", "Tops", "Outerwear", "Jacket"]
  },
  editorial_promos: [
    {
      title: "Summer 2024",
      eyebrow: "Sale up to 50% off",
      image: "/images/banner-media3.png",
      cta_label: "Shop now",
      cta_href: "/shop",
      background: "bg-[#f9cad7]"
    },
    {
      title: "New Summer Collection",
      eyebrow: "Sale up to 50% off",
      image: "/images/lady-3.png",
      cta_label: "Shop now",
      cta_href: "/shop",
      background: "bg-[#ffcf57]"
    }
  ],
  arrivals_section: {
    eyebrow: "Users also viewed",
    title: "New arrivals to know",
    cta_label: "See all",
    cta_href: "/shop?new=true",
    featured_image: "/images/pic3.jpg"
  },
  offer_section: {
    eyebrow: "Featured Offer For You",
    title: "Seasonal promotions",
    cta_label: "See all",
    cta_href: "/shop",
    banners: [
      {
        title: "Summer 2024",
        eyebrow: "Sale up to 50% off",
        image: "/images/lady-1.png",
        cta_label: "Collect now",
        cta_href: "/shop",
        background: "bg-[#f7ced9]"
      },
      {
        title: "Swimwear Sale",
        eyebrow: "20% off",
        image: "/images/lady-2.png",
        cta_label: "Collect now",
        cta_href: "/shop",
        background: "bg-[#ddb282]"
      },
      {
        title: "Luxury Bras",
        eyebrow: "20% off",
        image: "/images/pic3.jpg",
        cta_label: "Collect now",
        cta_href: "/shop",
        background: "bg-[#eadfd9]"
      }
    ]
  },
  journal_section: {
    eyebrow: "Latest Post",
    title: "Stories from the Veloure journal",
    cta_label: "View all",
    cta_href: "/about",
    stories: [
      {
        title: "Trendsetter Chronicles: Unveiling the latest in fashion",
        image: "/images/banner-media3.png",
        category: "May 2026",
        href: "/about"
      },
      {
        title: "Dress to impress: elevate your everyday style",
        image: "/images/6.png",
        category: "May 2026",
        href: "/about"
      },
      {
        title: "Chic and unique: personalized fashion finds",
        image: "/images/pic8.jpg",
        category: "May 2026",
        href: "/about"
      }
    ]
  },
  about_page: {
    hero_title: "About Veloure",
    hero_crumb: "About",
    eyebrow: "Our point of view",
    title: "Quiet luxury for everyday rituals.",
    paragraphs: [
      "Veloure is a fashion and lifestyle ecommerce experience built around considered materials, calm silhouettes, and practical service. Every product is managed with variants, inventory, imagery, and order workflows that support a polished retail operation.",
      "This first release focuses on cash-on-delivery shopping, customer accounts, and complete admin operations so the brand can launch quickly while staying ready for future online payments."
    ]
  },
  contact_page: {
    hero_title: "Contact",
    hero_crumb: "Contact",
    cards: [
      { title: "Email", body: "support@veloure.example", icon: "mail" },
      { title: "Phone", body: "+1 555 0184", icon: "phone" },
      { title: "Studio", body: "Manchester showroom and fulfillment desk", icon: "map-pin" }
    ]
  },
  footer: {
    address: "451 Wall Street, UK, London",
    newsletter_heading: "Subscribe To Our Newsletter",
    newsletter_placeholder: "Your Email Address",
    recent_posts: [
      {
        title: "Cozy Knit Cardigan Sweater",
        date: "Jan 23, 2026",
        image: "/images/2.png"
      },
      {
        title: "Sophisticated Swagger Suit",
        date: "Jan 23, 2026",
        image: "/images/1.png"
      },
      {
        title: "Athletic Mesh Sports Leggings",
        date: "Jan 23, 2026",
        image: "/images/4.png"
      }
    ],
    stores: ["New York", "London SF", "Edinburgh", "Los Angeles", "Chicago", "Las Vegas"],
    link_groups: [
      {
        title: "Useful Links",
        links: [
          { label: "Privacy Policy", href: "/about" },
          { label: "Returns", href: "/contact" },
          { label: "Terms & Conditions", href: "/about" },
          { label: "Contact Us", href: "/contact" },
          { label: "Latest News", href: "/search" },
          { label: "Our Sitemap", href: "/sitemap.xml" }
        ]
      },
      {
        title: "Footer Menu",
        links: [
          { label: "Instagram Profile", href: "/about" },
          { label: "New Collection", href: "/shop?new=true" },
          { label: "Woman Dress", href: "/shop" },
          { label: "Contact Us", href: "/contact" },
          { label: "Latest News", href: "/search" }
        ]
      }
    ],
    copyright_label: "Veloure",
    accepted_payments: ["Visa", "PayPal", "Stripe", "Apple Pay"]
  }
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, incoming: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(incoming) ? incoming : base) as T;
  }

  if (isObject(base)) {
    const source = isObject(incoming) ? incoming : {};
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(base)) {
      result[key] = deepMerge(value as never, source[key]);
    }
    return result as T;
  }

  return (incoming ?? base) as T;
}

export function normalizeStorefrontContent(raw: unknown): StorefrontContent {
  const merged = deepMerge(defaultStorefrontContent, raw);
  const parsed = storefrontContentSchema.safeParse(merged);
  return parsed.success ? parsed.data : defaultStorefrontContent;
}
