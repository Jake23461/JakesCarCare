/**
 * Serializes a schema.org object into the static HTML at build time.
 * The `<` escape prevents `</script>` breakout from any string content.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
