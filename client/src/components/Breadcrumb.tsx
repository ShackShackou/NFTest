import { Link } from "wouter";
import { ChevronRightIcon } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="py-4 text-sm">
      <div className="flex items-center space-x-2 text-neutral-light/70">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-3 w-3 mx-1 text-neutral-light/50" />
            )}
            
            {item.isActive ? (
              <span className="text-primary">{item.label}</span>
            ) : item.href ? (
              <Link href={item.href}>
                <span className="hover:text-primary cursor-pointer">{item.label}</span>
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
