import "../app.css";

/**
 * Root layout for the Production City web application.
 *
 * Security headers are applied at the Cloudflare Worker level
 * via wrangler.jsonc headers configuration.
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
        <title>Production City</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
