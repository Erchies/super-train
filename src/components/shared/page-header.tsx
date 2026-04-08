import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Breadcrumb = { label: string; href?: string };

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  children,
  backHref,
  backLabel,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
  children?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  const actionContent =
    action ??
    children ??
    (backHref ? (
      <Link
        href={backHref}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {backLabel ?? "Voltar"}
      </Link>
    ) : null);

  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              {b.href ? (
                <Link href={b.href} className="hover:text-blue-600">
                  {b.label}
                </Link>
              ) : (
                <span className="text-gray-700 font-medium">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        {actionContent && <div>{actionContent}</div>}
      </div>
    </div>
  );
}
