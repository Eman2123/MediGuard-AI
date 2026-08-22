import "./globals.css";

export const metadata = {
  title: "MediGuard AI",
  description: "Agentic route intelligence for life-critical medical cargo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
