import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import BlogCard from "@/components/BlogCard";
import { 
  Laptop, 
  Monitor, 
  Armchair, 
  Keyboard, 
  Mouse, 
  Webcam, 
  Headphones,
  Cable
} from "lucide-react";

const Index = () => {
  const categories = [
    {
      icon: Laptop,
      title: "Notebooks",
      description: "Potência e mobilidade para trabalho remoto",
      productCount: 24
    },
    {
      icon: Monitor,
      title: "Monitores",
      description: "Telas de alta qualidade para produtividade",
      productCount: 18
    },
    {
      icon: Armchair,
      title: "Cadeiras Ergonômicas",
      description: "Conforto durante longas jornadas",
      productCount: 12
    },
    {
      icon: Keyboard,
      title: "Teclados",
      description: "Digitação confortável e precisa",
      productCount: 15
    },
    {
      icon: Mouse,
      title: "Mouses",
      description: "Controle ergonômico e responsivo",
      productCount: 20
    },
    {
      icon: Webcam,
      title: "Webcams",
      description: "Imagem profissional para videoconferências",
      productCount: 8
    },
    {
      icon: Headphones,
      title: "Fones de Ouvido",
      description: "Áudio cristalino e cancelamento de ruído",
      productCount: 16
    },
    {
      icon: Cable,
      title: "Acessórios",
      description: "Tudo para otimizar seu setup",
      productCount: 30
    }
  ];

  const featuredProducts = [
    {
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop",
      title: "Notebook Dell XPS 15 - 11ª Geração Intel i7",
      description: "Perfeito para multitarefas e trabalho pesado com 16GB RAM e SSD 512GB",
      price: "R$ 8.999",
      originalPrice: "R$ 10.499",
      rating: 5,
      reviewCount: 234,
      badge: "Mais Vendido",
      affiliateLink: "#"
    },
    {
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop",
      title: "Monitor LG UltraWide 34\" Curvo IPS",
      description: "Tela curva de 34 polegadas para máxima produtividade e imersão",
      price: "R$ 2.499",
      originalPrice: "R$ 2.999",
      rating: 5,
      reviewCount: 189,
      badge: "Melhor Custo-Benefício",
      affiliateLink: "#"
    },
    {
      image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d786?w=800&auto=format&fit=crop",
      title: "Cadeira Ergonômica Herman Miller Aeron",
      description: "Design ergonômico premiado com ajustes completos para máximo conforto",
      price: "R$ 6.499",
      rating: 5,
      reviewCount: 456,
      affiliateLink: "#"
    },
    {
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop",
      title: "Teclado Mecânico Logitech MX Keys",
      description: "Teclas retroiluminadas e experiência de digitação premium",
      price: "R$ 699",
      originalPrice: "R$ 849",
      rating: 4,
      reviewCount: 312,
      affiliateLink: "#"
    }
  ];

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
      <Navbar />
      
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque Section */}
      <section id="produtos" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Seleção especial dos melhores equipamentos com ótimo custo-benefício
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
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
                <li><a href="#" className="hover:text-primary transition-colors">Categorias</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
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
