import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  return (
    <div className="mb-6 bg-gradient-red-subtle p-6 rounded-xl border border-secondary-red-medium shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src="https://intek.co.id/wp-content/uploads/Logo-Intek-RED-logogram-300x203.png" 
            alt="PT Intek Solusi Indonesia Logo" 
            className="h-12 object-contain drop-shadow-sm"
          />
          <div>
            <h1 className="text-2xl font-bold text-primary-red-dark">{title}</h1>
            {subtitle && <p className="text-primary-red">{subtitle}</p>}
          </div>
        </div>
        {children && (
          <div className="text-right">
            {children}
          </div>
        )}
      </div>
    </div>
  );
} 