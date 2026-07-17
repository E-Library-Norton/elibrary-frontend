import type { Book } from "@/types";
import { generateBookSchema } from "@/lib/schema";

export function BookSchema({ book }: { book: Book }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateBookSchema(book)),
      }}
    />
  );
}
