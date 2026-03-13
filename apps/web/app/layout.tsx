import "../app.css";

/**
 * Root layout for the Production City web application.
 *
 * Security headers are applied at the worker level (worker/index.ts).
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Production City™ — Coming Soon</title>
        <meta
          name="description"
          content="Production City™ is coming soon."
        />
        <meta property="og:title" content="Production City™ — Coming Soon" />
        <meta
          property="og:description"
          content="Production City™ is coming soon."
        />
        <meta property="og:type" content="website" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%230f172a'/><text x='50' y='68' font-size='52' text-anchor='middle' fill='white' font-family='system-ui'>P</text></svg>"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
