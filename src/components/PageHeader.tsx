interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      )}
    </div>
  );
}
