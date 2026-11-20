import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "CineFlix — Movies worth your time",
  description: "Watch movies and videos published by CineFlix.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>
    <header className="container nav">
      <Link href="/" className="brand">Cine<span>Flix</span></Link>
      <nav className="navlinks">
        <Link href="/">Discover</Link>
        <Link href="/premium">Premium</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/login" className="btn secondary">Sign in</Link>
      </nav>
    </header>
    <main>{children}</main>
    <footer className="container footer">© {new Date().getFullYear()} CineFlix. Only upload and share content you own or are authorized to distribute.</footer>
  </body></html>;
}
