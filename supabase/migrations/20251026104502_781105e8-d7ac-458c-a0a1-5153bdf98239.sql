-- Tornar campos de preço opcionais
ALTER TABLE products 
ALTER COLUMN price DROP NOT NULL,
ALTER COLUMN price DROP DEFAULT;

ALTER TABLE products 
ALTER COLUMN original_price DROP NOT NULL;

-- Criar tabela de relacionamento many-to-many entre produtos e categorias
CREATE TABLE public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Todos podem ver relações produto-categoria"
ON public.product_categories
FOR SELECT
USING (true);

CREATE POLICY "Apenas admins podem inserir relações"
ON public.product_categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem deletar relações"
ON public.product_categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Índice para performance
CREATE INDEX idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON public.product_categories(category_id);