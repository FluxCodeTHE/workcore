import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";

interface ProductCardProps {
  image: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  affiliateLink: string;
  productId?: string;
}

const ProductCard = ({
  image,
  title,
  description,
  price,
  originalPrice,
  rating,
  reviewCount,
  badge,
  affiliateLink,
  productId,
}: ProductCardProps) => {
  const { trackProductClick } = useTracking();

  const handleClick = () => {
    if (productId) {
      trackProductClick(productId);
    }
  };

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-accent text-accent-foreground font-semibold">
            {badge}
          </Badge>
        </div>
      )}
      
      <div className="relative h-64 overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 text-card-foreground line-clamp-2 min-h-[3.5rem]">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({reviewCount})</span>
        </div>
        
        <Button 
          className="w-full group/btn" 
          asChild
        >
          <a 
            href={affiliateLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleClick}
          >
            Comprar Agora
            <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
