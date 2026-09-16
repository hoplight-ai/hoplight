import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Keyboard users jump past the nav; visible only when focused (see .skip-link in globals.css). */}
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
