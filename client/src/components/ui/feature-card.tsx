import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string | ReactNode;
  iconColor?: string;
  borderColor?: string;
  shadowColor?: string;
  iconBgColor?: string;
  iconBgHoverColor?: string;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  iconColor = "text-primary",
  borderColor = "border-primary/50",
  shadowColor = "shadow-primary/5",
  iconBgColor = "bg-primary/10",
  iconBgHoverColor = "group-hover:bg-primary/20",
}: FeatureCardProps) => {
  return (
    <div
      className={`group relative border border-border/50 rounded-2xl p-8 hover:${borderColor} hover:shadow-lg hover:${shadowColor} transition-all duration-300 bg-card/50 backdrop-blur-sm`}
    >
      <div
        className={`w-14 h-14 ${iconBgColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 ${iconBgHoverColor} transition-all duration-300`}
      >
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};
