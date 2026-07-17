import { getCanonicalUrl, getPageTitle, SITE_DESCRIPTION, SITE_IMAGE } from "@/lib/seo";

const title = getPageTitle("Profile — Norton University E-Library");
const description = "View and update your Norton University digital library profile, membership information, and account settings.";
const url = getCanonicalUrl("/profile");

export default function Head() {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={SITE_IMAGE} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={SITE_IMAGE} />
    </>
  );
}
