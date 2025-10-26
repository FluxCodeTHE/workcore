import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import BlogCard from "@/components/BlogCard";
import { Loader2 } from "lucide-react";
import * as Icons from "lucide-react";
import { useTracking } from "@/hooks/useTracking";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { trackProductView } = useTracking();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products", selectedCategory, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          product_categories(
            category_id,
            categories(id, name)
          )
        `)
        .eq("is_active", true);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      // Filtrar por categoria se selecionada
      if (selectedCategory && data) {
        return data.filter(product => 
          product.product_categories?.some((pc: any) => pc.category_id === selectedCategory)
        );
      }

      return data;
    },
  });

  useEffect(() => {
    products?.forEach((product) => {
      trackProductView(product.id);
    });
  }, [products]);

  const categoriesWithCounts = categories?.map((cat) => {
    const count = products?.filter((p) => 
      p.product_categories?.some((pc: any) => pc.category_id === cat.id)
    ).length || 0;
    const IconComponent = (Icons as any)[cat.icon] || Icons.Package;
    
    return {
      icon: IconComponent,
      title: cat.name,
      description: cat.description || "",
      productCount: count,
      id: cat.id,
    };
  });

  const blogPosts = [
    {
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop",
      title: "Como Montar um Home Office Produtivo em 2024",
      excerpt: "Descubra as melhores práticas e equipamentos essenciais para criar um ambiente de trabalho remoto eficiente e confortável.",
      date: "15 Jan 2024",
      readTime: "5 min",
      category: "Guia Completo"
    },
    {
      image: "https://images.unsplash.com/photo-1593642532400-2682810df593?w=800&auto=format&fit=crop",
      title: "Ergonomia no Home Office: Evite Dores e Lesões",
      excerpt: "Aprenda a posicionar corretamente seus equipamentos e manter uma postura saudável durante o trabalho remoto.",
      date: "12 Jan 2024",
      readTime: "7 min",
      category: "Saúde"
    },
    {
      image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop",
      title: "10 Dicas para Aumentar sua Produtividade em Casa",
      excerpt: "Técnicas comprovadas e ferramentas essenciais para maximizar seu desempenho trabalhando remotamente.",
      date: "08 Jan 2024",
      readTime: "6 min",
      category: "Produtividade"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar onSearch={setSearchTerm} searchTerm={searchTerm} />
      
      <Hero />

      {/* Categorias Section */}
      <section id="categorias" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore por Categoria
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Encontre exatamente o que você precisa para equipar seu home office
            </p>
          </div>
          
          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoriesWithCounts?.map((category) => (
                <div key={category.id} onClick={() => {
                  setSelectedCategory(selectedCategory === category.id ? null : category.id);
                  window.location.href = "#produtos";
                }}>
                  <CategoryCard {...category} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Produtos em Destaque Section */}
      <section id="produtos" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {selectedCategory 
                ? `Produtos - ${categoriesWithCounts?.find(c => c.id === selectedCategory)?.title}`
                : searchTerm 
                  ? `Resultados para "${searchTerm}"`
                  : "Produtos em Destaque"
              }
            </h2>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-primary hover:underline mb-4"
              >
                Ver todos os produtos
              </button>
            )}
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {products?.length === 0 
                ? "Nenhum produto encontrado" 
                : `${products?.length || 0} produto(s) disponíve${products?.length === 1 ? 'l' : 'is'}`
              }
            </p>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.map((product) => (
                <ProductCard 
                  key={product.id} 
                  image={product.image_url}
                  title={product.title}
                  description={product.description}
                  rating={product.rating}
                  reviewCount={product.review_count}
                  badge={product.badge || undefined}
                  affiliateLink={product.affiliate_link}
                  productId={product.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Dicas e Guias
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Aprenda a otimizar seu espaço e aumentar sua produtividade
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <BlogCard key={index} {...post} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-primary mb-4">WorkCore</h3>
              <p className="text-muted-foreground mb-4">
                Sua fonte confiável para equipamentos de home office de qualidade. 
                Ajudamos profissionais a criar espaços de trabalho produtivos e confortáveis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre Nós</a></li>
                <li><a href="#categorias" className="hover:text-primary transition-colors">Categorias</a></li>
                <li><a href="#blog" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Guias de Compra</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Reviews</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Afiliados</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 FluxCode. Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
