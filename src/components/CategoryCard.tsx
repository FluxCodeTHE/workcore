import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  productCount: number;
}

const CategoryCard = ({ icon: Icon, title, description, productCount }: CategoryCardProps) => {
  return (
    <div className="group cursor-pointer">
      <div className="bg-card rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
        <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
          <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-card-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm mb-3">{description}</p>
        <span className="text-primary text-sm font-medium">
          {productCount} produtos disponíveis
        </span>
      </div>
    </div>
  );
};

export default CategoryCard;
