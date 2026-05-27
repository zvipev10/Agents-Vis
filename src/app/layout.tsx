import './globals.css';

export const metadata = {
  title: 'Agents-Vis',
  description: 'Private read-only visibility for the autonomous agents team.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}