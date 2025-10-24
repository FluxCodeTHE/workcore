import { Button } from "@/components/ui/button";
import { Menu, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/workcore-logo.png";
import { useAdmin } from "@/hooks/useAdmin";

interface NavbarProps {
  onSearch?: (term: string) => void;
  searchTerm?: string;
}

const Navbar = ({ onSearch, searchTerm }: NavbarProps) => {
  const { isAdmin } = useAdmin();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <img src={logo} alt="WorkCore - Construa seu espaço de trabalho ideal" className="h-10 w-auto" />
            </a>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#produtos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Produtos
              </a>
              <a href="#categorias" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Categorias
              </a>
              <a href="#blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Blog
              </a>
              {isAdmin && (
                <Link to="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm || ""}
                onChange={(e) => onSearch?.(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
