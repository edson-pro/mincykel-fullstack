import React from "react";
import { Globe } from "lucide-react";
import Logo from "../Logo";

const footerSections = [
  {
    title: "ListNRide",
    links: [
      { label: "About", href: "#" },
      { label: "Help Center - FAQ", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Jobs", href: "#" },
      { label: "Bike Rental Software", href: "#" },
    ],
  },
  {
    title: "Learn More",
    links: [
      { label: "Rent a Bike", href: "#" },
      { label: "Listing a bike", href: "#" },
      { label: "Photo Tips", href: "#" },
      { label: "Insurance", href: "#" },
    ],
  },
  {
    title: "Top countries",
    links: [
      { label: "Germany", href: "#" },
      { label: "Italy", href: "#" },
      { label: "Spain", href: "#" },
      { label: "Netherlands", href: "#" },
      { label: "Austria", href: "#" },
    ],
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary border-t">
      <div className="">
        <div className="grid  px-4 sm:px-4 lg:px-4 py-12 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Logo className="!text-white" />
          </div>
          {footerSections.map((section) => (
            <FooterSection
              key={section.title}
              title={section.title}
              links={section.links}
            />
          ))}
        </div>
        <BottomBar />
      </div>
    </footer>
  );
};

export default Footer;

const BottomBar: React.FC = () => (
  <div className="border-t px-3 border-gray-200/20 ">
    <div className="py-4 flex max-w-6xl mx-auto flex-wrap justify-between items-center gap-4">
      <p className="text-white">© 2025 MinCykel</p>

      <div className="flex gap-6">
        <a href="#" className="text-white hover:text-primary">
          Imprint
        </a>
        <a href="#" className="text-white hover:text-primary">
          Terms
        </a>
        <a href="#" className="text-white hover:text-primary">
          Privacy
        </a>
      </div>

      <button className="flex items-center gap-2 text-white hover:text-primary">
        <Globe className="w-4 h-4" />
        <span>English (EN)</span>
      </button>
    </div>
  </div>
);

interface FooterSectionProps {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-white">{title}</h3>
    <ul className="space-y-2">
      {links.map(({ label, href }) => (
        <li key={label}>
          <a
            href={href}
            className="text-white hover:text-primary transition-colors"
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);
