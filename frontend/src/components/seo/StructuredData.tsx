// frontend/src/components/seo/StructuredData.tsx

import { Helmet } from "react-helmet-async";

interface StructuredDataProps {
  type:
    | "WebSite"
    | "Organization"
    | "FAQPage"
    | "Product"
    | "BlogPosting"
    | "BreadcrumbList";
  data: any;
}

export const StructuredData = ({ type, data }: StructuredDataProps) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
    </Helmet>
  );
};

// Gotowe komponenty dla typowych przypadków

export const WebsiteSchema = () => (
  <StructuredData
    type="WebSite"
    data={{
      name: "Smart-Copy.ai",
      description:
        "Generator tekstów AI - profesjonalne tworzenie treści ze sztuczną inteligencją",
      url: "https://www.smart-copy.ai",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://www.smart-copy.ai/blog?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    }}
  />
);

export const OrganizationSchema = () => (
  <StructuredData
    type="Organization"
    data={{
      name: "Smart-Copy.ai",
      legalName: "Smart-Copy.ai",
      url: "https://www.smart-copy.ai",
      logo: "https://www.smart-copy.ai/favicon.svg",
      foundingDate: "2024",
      founders: [
        {
          "@type": "Person",
          name: "Karol",
        },
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Toruń",
        addressRegion: "Kujawsko-Pomorskie",
        addressCountry: "PL",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@smart-copy.ai",
      },
      sameAs: [
        // Dodaj social media
      ],
    }}
  />
);

export const FAQPageSchema = ({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) => (
  <StructuredData
    type="FAQPage"
    data={{
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    }}
  />
);

export const ProductSchema = () => (
  <StructuredData
    type="Product"
    data={{
      name: "Smart-Copy.ai Generator Tekstów AI",
      description:
        "Profesjonalny generator treści AI do tworzenia artykułów, opisów produktów i raportów",
      brand: {
        "@type": "Brand",
        name: "Smart-Copy.ai",
      },
      offers: {
        "@type": "Offer",
        url: "https://www.smart-copy.ai",
        priceCurrency: "PLN",
        price: "3.99",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "3.99",
          priceCurrency: "PLN",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: "1000",
            unitCode: "CHR", // characters
          },
        },
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "127",
      },
    }}
  />
);
