import Link from "next/link";

interface PricingCardProps {
  title: string;
  description: string;
  price: number | string;
  period?: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  isPrimary?: boolean;
  highlightLabel?: string;
  variant?: "default" | "primary" | "secondary";
}

export const PricingCard = ({
  title,
  description,
  price,
  period = "/mo",
  features,
  ctaText,
  ctaHref,
  isPrimary = false,
  highlightLabel,
  variant = "default",
}: PricingCardProps) => {
  const getBorderClass = () => {
    if (isPrimary) return "border-2 border-primary";
    if (variant === "secondary") return "border border-border/50 hover:border-orange-500/50 hover:shadow-orange-500/5";
    return "border border-border/50 hover:border-primary/50 hover:shadow-primary/5";
  };

  const getShadowClass = () => {
    if (isPrimary) return "shadow-2xl shadow-primary/10";
    return "hover:shadow-lg";
  };

  const getScaleClass = () => {
    if (isPrimary) return "scale-105 md:scale-110";
    return "";
  };

  const getCtaClass = () => {
    if (isPrimary) {
      return "w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-center";
    }
    if (variant === "secondary") {
      return "w-full py-3 px-6 border-2 border-border hover:border-orange-500/50 rounded-xl font-semibold hover:bg-accent transition-all duration-200 text-center";
    }
    return "w-full py-3 px-6 border-2 border-border hover:border-primary/50 rounded-xl font-semibold hover:bg-accent transition-all duration-200 text-center";
  };

  return (
    <div
      className={`group relative ${getBorderClass()} rounded-2xl p-8 ${getShadowClass()} ${getScaleClass()} transition-all duration-300 bg-card/50 backdrop-blur-sm`}
    >
      {highlightLabel && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
            {highlightLabel}
          </span>
        </div>
      )}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-muted-foreground text-sm mt-2">{description}</p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold">{typeof price === "number" ? `$${price}` : price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              {feature}
            </li>
          ))}
        </ul>
        <Link href={ctaHref} className={`block ${getCtaClass()}`}>
          {ctaText}
        </Link>
      </div>
    </div>
  );
};
