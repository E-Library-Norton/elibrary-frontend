import { getPageTitle, SITE_IMAGE, SITE_NAME } from "@/lib/seo";

export default function Head() {
  const title = getPageTitle("Book details");
  const description =
    "Find book details, summary, ratings, and digital access information in Norton University's E-Library.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />

      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={SITE_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={SITE_IMAGE} />
    </>
  );
}
