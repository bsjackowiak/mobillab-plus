import { buildProductJsonLd, type ProductJsonLdInput } from "@/lib/seo";

type Props = {
  data: ProductJsonLdInput;
};

export function OfertaJsonLd({ data }: Props) {
  const json = buildProductJsonLd(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
