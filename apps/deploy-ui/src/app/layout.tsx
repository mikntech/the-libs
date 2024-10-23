import './global.css';

export const metadata = {
  title: 'Generate and deploy your project',
  description: 'Using @the-libs by MikNTech',
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
