import { cn } from "../../lib/utils";

export function Card({ children, className }) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, icon: Icon }) {
  return (
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
      {Icon && <div className="p-2 bg-blue-100 text-brand-600 rounded-lg"><Icon size={20} /></div>}
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}