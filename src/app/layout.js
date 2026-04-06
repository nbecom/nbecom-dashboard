import './globals.css';
export const metadata = { title: 'NBECOM - Hệ thống quản lý nội bộ', description: 'Hệ thống quản lý đơn hàng Etsy - NBECOM' };
export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
