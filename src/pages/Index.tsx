import React, { useState, useEffect } from "react";
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

  const { data: blogPosts, isLoading: blogLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      
      return data?.map(post => ({
        image: post.image_url,
        title: post.title,
        excerpt: post.excerpt,
        date: new Date(post.published_at || post.created_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),
        readTime: post.read_time,
        category: post.category
      })) || [];
    },
  });

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
          
          {blogLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : blogPosts && blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <BlogCard key={index} {...post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum artigo publicado ainda</p>
            </div>
          )}
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
