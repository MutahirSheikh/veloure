export const homeHeroSpotlights = [
  {
    title: "Cozy Knit Cardigan Sweater",
    price: "$80",
    compareAt: "$87",
    image: "/images/1.png"
  },
  {
    title: "Checkered Slim Collar Shirt",
    price: "$94",
    compareAt: "$103",
    image: "/images/2.png"
  }
] as const;

export const homeCollectionTiles = [
  { title: "Kid Dress", image: "/images/2.png" },
  { title: "Woman Dress", image: "/images/3.png" },
  { title: "Urban Pop", image: "/images/4.png" },
  { title: "Soft Tailoring", image: "/images/5.png" }
] as const;

export const editorialPromos = [
  {
    title: "Summer 2024",
    eyebrow: "Sale up to 50% off",
    image: "/images/banner-media3.png",
    cta: "Shop now"
  },
  {
    title: "New Summer Collection",
    eyebrow: "Sale up to 50% off",
    image: "/images/lady-3.png",
    cta: "Shop now"
  }
] as const;

export const offerBanners = [
  {
    title: "Summer 2024",
    eyebrow: "Sale up to 50% off",
    image: "/images/lady-1.png",
    cta: "Collect now"
  },
  {
    title: "Swimwear Sale",
    eyebrow: "20% off",
    image: "/images/lady-2.png",
    cta: "Collect now"
  },
  {
    title: "Luxury Bras",
    eyebrow: "20% off",
    image: "/images/pic3.jpg",
    cta: "Collect now"
  }
] as const;

export const latestStories = [
  {
    title: "Trendsetter Chronicles: Unveiling the latest in fashion",
    image: "/images/banner-media3.png",
    category: "May 2026"
  },
  {
    title: "Dress to impress: elevate your everyday style",
    image: "/images/6.png",
    category: "May 2026"
  },
  {
    title: "Chic and unique: personalized fashion finds",
    image: "/images/pic8.jpg",
    category: "May 2026"
  }
] as const;

export const footerPosts = [
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
] as const;

export const footerStores = ["New York", "London SF", "Edinburgh", "Los Angeles", "Chicago", "Las Vegas"] as const;

export const footerLinkGroups = [
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
] as const;

export const acceptedPayments = ["Visa", "PayPal", "Stripe", "Apple Pay"] as const;
