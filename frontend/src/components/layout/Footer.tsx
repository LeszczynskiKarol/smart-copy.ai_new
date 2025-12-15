// frontend/src/components/layout/Footer.tsx

import { Link } from "react-router-dom";
import {
  Sparkles,
  Mail,
  //Facebook,
  // Twitter,
  // Linkedin
} from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Funkcje", href: "/#features" },
      { name: "Cennik", href: "/#pricing" },
      { name: "FAQ", href: "/#faq" },
    ],
    company: [
      { name: "O nas", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Kariera", href: "/careers" },
    ],
    legal: [
      { name: "Regulamin", href: "/terms" },
      { name: "Polityka prywatności", href: "/privacy" },
      { name: "Cookies", href: "/cookies" },
    ],
    support: [
      { name: "Kontakt", href: "/contact" },
      { name: "Pomoc", href: "/help" },
      { name: "Status", href: "/status" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Smart-Copy.ai
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 mr-4">
              Twórz profesjonalne treści w kilka sekund dzięki sztucznej
              inteligencji. Oszczędzaj czas i zwiększaj produktywność.
            </p>
            {/* <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>*/}
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produkt</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Prawne</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Strony</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/ai-copywriter"
                  className="text-sm hover:text-purple-400 transition-colors"
                >
                  AI copywriter
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-generator-opisow-produktow"
                  className="text-sm hover:text-purple-400 transition-colors"
                >
                  AI generator opisów produktów
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-gray-400">
            <p>
              &copy; {currentYear} Smart-Copy.ai. Wszystkie prawa zastrzeżone.
            </p>
            <span className="hidden sm:inline text-gray-600">|</span>
            <p>
              Realizacja:{" "}
              <a
                href="https://www.torweb.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-400 transition-colors"
              >
                TorWeb.pl
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Mail className="w-4 h-4" />
            <a
              href="mailto:support@smart-copy.ai"
              className="hover:text-purple-400 transition-colors"
            >
              support@smart-copy.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
