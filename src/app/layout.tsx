import './globals.css';

export const metadata = {
  title: 'Mission 003',
  description: 'Private read-only visibility for the autonomous agents team.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}