import type { Book } from "@/types";
import { SITE_NAME, SITE_URL, getImageUrl } from "./seo";

/**
 * Generate Book schema (JSON-LD) for Google Search
 * @see https://schema.org/Book
 */
export function generateBookSchema(book: Book) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    alternativeHeadline: book.titleKh,
    description: book.description,
    isbn: book.isbn,
    image: book.coverUrl ? getImageUrl(book.coverUrl) : undefined,
    inLanguage: book.language || "en",
    author: book.Authors?.map((author) => ({
      "@type": "Person",
      name: author.name,
    })),
    publisher: book.Publisher
      ? {
          "@type": "Organization",
          name: book.Publisher.name,
        }
      : undefined,
    datePublished: book.publicationYear
      ? `${book.publicationYear}-01-01`
      : undefined,
    numberOfPages: book.pages,
    aggregateRating: book.averageRating
      ? {
          "@type": "AggregateRating",
          ratingValue: book.averageRating,
          reviewCount: book.reviewCount || 0,
        }
      : undefined,
    url: `${SITE_URL}/books/${book.id}`,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * Generate SearchAction schema for site search
 * @see https://schema.org/SearchAction
 */
export function generateSearchActionSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: SITE_URL,
    name: SITE_NAME,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/books?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 * @see https://schema.org/BreadcrumbList
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQPage schema for FAQs
 * @see https://schema.org/FAQPage
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Organization schema
 * @see https://schema.org/Organization
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        availableLanguage: ["English"],
        url: `${SITE_URL}/contact`,
      },
    ],
    sameAs: [
      // Add your social media URLs here
      // "https://www.facebook.com/...",
      // "https://twitter.com/...",
      // "https://www.linkedin.com/...",
    ],
  };
}
