import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });
const EXTENSION_ATTR_GUARD = `
  (() => {
    const attrs = ['bis_skin_checked'];

    const stripAttrs = (node) => {
      if (!(node instanceof Element)) {
        return;
      }

      attrs.forEach((attr) => {
        if (node.hasAttribute(attr)) {
          node.removeAttribute(attr);
        }
      });

      attrs.forEach((attr) => {
        node.querySelectorAll(\`[\${attr}]\`).forEach((el) => el.removeAttribute(attr));
      });
    };

    stripAttrs(document.documentElement);

    if (typeof MutationObserver === 'undefined') {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.target instanceof Element &&
          mutation.attributeName &&
          attrs.includes(mutation.attributeName)
        ) {
          mutation.target.removeAttribute(mutation.attributeName);
        }

        mutation.addedNodes.forEach((node) => stripAttrs(node));
      });
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: attrs,
    });

    window.addEventListener(
      'load',
      () => {
        stripAttrs(document.documentElement);
        setTimeout(() => observer.disconnect(), 3000);
      },
      { once: true },
    );
  })();
`;

export const metadata: Metadata = {
  title: 'Souvenote',
  description: 'A card worth keeping',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-[#111111]`} suppressHydrationWarning>
        <Script id="extension-attr-guard" strategy="beforeInteractive">
          {EXTENSION_ATTR_GUARD}
        </Script>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
