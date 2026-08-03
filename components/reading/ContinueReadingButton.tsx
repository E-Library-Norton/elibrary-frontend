import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ContinueReadingButtonProps {
  bookId: string | number;
  pageNumber: number;
  from?: string;
  className?: string;
}

export function ContinueReadingButton({
  bookId,
  pageNumber,
  from = "/library",
  className,
}: ContinueReadingButtonProps) {
  const t = useTranslations("Library");
  const params = new URLSearchParams({
    page: String(Math.max(1, pageNumber)),
    from,
  });

  return (
    <Button asChild className={className}>
      <Link href={`/books/${bookId}/read?${params.toString()}`}>
        <BookOpen className="h-4 w-4" />
        {t("continueReading")}
      </Link>
    </Button>
  );
}
