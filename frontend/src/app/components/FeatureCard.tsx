interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  children?: React.ReactNode;
}

export default function FeatureCard({ title, description, icon, children }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {icon} {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>
      {children}
    </div>
  );
}
