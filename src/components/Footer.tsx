"use client";

import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Products: [
      { name: "Services", href: "/search/services" },
      { name: "Freelancers", href: "/search/services?type=freelancers" },
      { name: "Agencies", href: "/search/services?type=agencies" },
    ],
    "For PSPs": [
      { name: "Training", href: "/training" },
      { name: "Dashboard", href: "/dashboard" },
      { name: "Benefits", href: "/benefits" },
    ],
    Resources: [
      { name: "Help Center", href: "/help" },
      { name: "Blog", href: "/blog" },
      { name: "Guides", href: "/guides" },
    ],
    About: [
      { name: "Vision", href: "/about" },
      { name: "Mission", href: "/mission" },
      { name: "Contact", href: "/contact" },
    ],
  };

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo & Tagline */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                RE
              </div>
              <span className="font-bold text-xl">RE Network</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Connecting talent with opportunity, one project at a time.
            </p>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t pt-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>PO BOX 591, FIREBAUGH CA 93622</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp: +1-213-926-1906</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2025 RE Network</span>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal"
              className="hover:text-primary transition-colors"
            >
              Legal
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
