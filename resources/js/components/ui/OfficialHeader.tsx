interface OfficialHeaderProps {
  title?: string;
}

export function OfficialHeader({ title }: OfficialHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 p-6 rounded-t-lg shadow-md flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <img src="/images/ched-logo.png" alt="CHED Logo" className="h-20" />
      <div className="text-center text-gray-900 dark:text-gray-100">
        <p className="font-fira-sans text-sm text-gray-700 dark:text-gray-300">Republic of the Philippines</p>
        <p className="font-fira-sans text-sm text-gray-700 dark:text-gray-300">OFFICE OF THE PRESIDENT</p>
        <p className="font-georgia text-xl font-bold tracking-wider">COMMISSION ON HIGHER EDUCATION</p>
        {title && <p className="font-georgia text-lg font-semibold mt-2">{title}</p>}
      </div>
      <img src="/images/bagong-pilipinas-logo.png" alt="Bagong Pilipinas Logo" className="h-20" />
    </header>
  );
}
