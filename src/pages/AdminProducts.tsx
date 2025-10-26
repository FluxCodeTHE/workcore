import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const AdminProducts = () => {
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_categories(
            category_id,
            categories(id, name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
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

  const createMutation = useMutation({
    mutationFn: async ({ productData, categoryIds }: { productData: any; categoryIds: string[] }) => {
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single();
      
      if (productError) throw productError;

      if (categoryIds.length > 0) {
        const categoryRelations = categoryIds.map(catId => ({
          product_id: product.id,
          category_id: catId
        }));
        
        const { error: categoriesError } = await supabase
          .from("product_categories")
          .insert(categoryRelations);
        
        if (categoriesError) throw categoriesError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Produto criado com sucesso!" });
      setOpen(false);
      setSelectedCategories([]);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar produto", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, productData, categoryIds }: { id: string; productData: any; categoryIds: string[] }) => {
      const { error: productError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", id);
      
      if (productError) throw productError;

      // Remove categorias antigas
      const { error: deleteError } = await supabase
        .from("product_categories")
        .delete()
        .eq("product_id", id);
      
      if (deleteError) throw deleteError;

      // Adiciona novas categorias
      if (categoryIds.length > 0) {
        const categoryRelations = categoryIds.map(catId => ({
          product_id: id,
          category_id: catId
        }));
        
        const { error: categoriesError } = await supabase
          .from("product_categories")
          .insert(categoryRelations);
        
        if (categoriesError) throw categoriesError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Produto atualizado com sucesso!" });
      setOpen(false);
      setEditingProduct(null);
      setSelectedCategories([]);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar produto",
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Produto deletado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao deletar produto", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      image_url: formData.get("image_url") as string,
      affiliate_link: formData.get("affiliate_link") as string,
      rating: parseInt(formData.get("rating") as string),
      review_count: parseInt(formData.get("review_count") as string),
      badge: formData.get("badge") as string || null,
      is_active: formData.get("is_active") === "on",
    };

    if (editingProduct) {
      updateMutation.mutate({ 
        id: editingProduct.id, 
        productData, 
        categoryIds: selectedCategories 
      });
    } else {
      createMutation.mutate({ productData, categoryIds: selectedCategories });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    const productCategoryIds = product.product_categories?.map((pc: any) => pc.category_id) || [];
    setSelectedCategories(productCategoryIds);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingProduct(null);
    setSelectedCategories([]);
  };

  useEffect(() => {
    if (!open) {
      setSelectedCategories([]);
      setEditingProduct(null);
    }
  }, [open]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Produtos</h1>
          <p className="text-muted-foreground">Gerencie os produtos da loja</p>
        </div>
        <Dialog open={open} onOpenChange={handleCloseDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título*</Label>
                <Input id="title" name="title" required defaultValue={editingProduct?.title} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição*</Label>
                <Textarea id="description" name="description" required defaultValue={editingProduct?.description} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem*</Label>
                <Input id="image_url" name="image_url" type="url" required defaultValue={editingProduct?.image_url} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliate_link">Link de Afiliado*</Label>
                <Input id="affiliate_link" name="affiliate_link" type="url" required defaultValue={editingProduct?.affiliate_link} />
              </div>

              <div className="space-y-2">
                <Label>Categorias</Label>
                <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                  {categories?.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
                      <Label 
                        htmlFor={`cat-${cat.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {cat.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Avaliação (1-5)*</Label>
                  <Input id="rating" name="rating" type="number" min="1" max="5" required defaultValue={editingProduct?.rating || 5} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review_count">Nº de Avaliações*</Label>
                  <Input id="review_count" name="review_count" type="number" min="0" required defaultValue={editingProduct?.review_count || 0} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Badge (opcional)</Label>
                <Input id="badge" name="badge" placeholder="Ex: MAIS VENDIDO" defaultValue={editingProduct?.badge} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is_active" name="is_active" defaultChecked={editingProduct?.is_active ?? true} />
                <Label htmlFor="is_active">Produto ativo</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingProduct ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categorias</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img src={product.image_url} alt={product.title} className="w-12 h-12 object-cover rounded" />
                </TableCell>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>
                  {product.product_categories?.length > 0 
                    ? product.product_categories.map((pc: any) => pc.categories?.name).filter(Boolean).join(", ")
                    : "Sem categoria"}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${product.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {product.is_active ? "Ativo" : "Inativo"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm("Tem certeza que deseja deletar este produto?")) {
                        deleteMutation.mutate(product.id);
                      }
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminProducts;
