import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, FileText, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";

const blogPostSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  excerpt: z.string().trim().min(1, "Resumo é obrigatório").max(500, "Resumo muito longo"),
  content: z.string().trim().min(1, "Conteúdo é obrigatório"),
  image_url: z.string().trim().url("URL da imagem inválida"),
  category: z.string().trim().min(1, "Categoria é obrigatória").max(50, "Categoria muito longa"),
  read_time: z.string().trim().min(1, "Tempo de leitura é obrigatório").max(20, "Tempo muito longo"),
});

type BlogPostForm = z.infer<typeof blogPostSchema>;

interface BlogPost extends BlogPostForm {
  id: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const AdminBlog = () => {
  const [open, setOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogPostForm>({
    title: "",
    excerpt: "",
    content: "",
    image_url: "",
    category: "",
    read_time: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogPostForm & { is_published: boolean }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("blog_posts").insert({
        ...data,
        author_id: user.user?.id,
        published_at: data.is_published ? new Date().toISOString() : null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: "Artigo criado com sucesso!" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar artigo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BlogPostForm & { is_published: boolean }> }) => {
      const updateData: any = { ...data };
      if (data.is_published !== undefined && data.is_published) {
        const currentPost = posts?.find(p => p.id === id);
        if (!currentPost?.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }
      const { error } = await supabase.from("blog_posts").update(updateData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: "Artigo atualizado com sucesso!" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar artigo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: "Artigo deletado com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar artigo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingPost(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      image_url: "",
      category: "",
      read_time: "",
    });
    setErrors({});
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.image_url,
      category: post.category,
      read_time: post.read_time,
    });
    setOpen(true);
  };

  const handleSubmit = async (publish: boolean) => {
    try {
      const validated = blogPostSchema.parse(formData);
      setErrors({});

      if (editingPost) {
        await updateMutation.mutateAsync({
          id: editingPost.id,
          data: { ...validated, is_published: publish },
        });
      } else {
        await createMutation.mutateAsync({ ...validated, is_published: publish });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const togglePublish = async (post: BlogPost) => {
    await updateMutation.mutateAsync({
      id: post.id,
      data: { is_published: !post.is_published },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Artigos do Blog</h1>
          <p className="text-muted-foreground">Gerencie os artigos da seção "Dicas e Guias"</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Artigo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Editar Artigo" : "Novo Artigo"}</DialogTitle>
              <DialogDescription>
                {editingPost ? "Atualize as informações do artigo" : "Crie um novo artigo para o blog"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Como Montar um Home Office Produtivo"
                />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Guia Completo, Produtividade, Saúde"
                />
                {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">URL da Imagem</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
                {errors.image_url && <p className="text-sm text-destructive mt-1">{errors.image_url}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Tempo de Leitura</label>
                <Input
                  value={formData.read_time}
                  onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                  placeholder="Ex: 5 min"
                />
                {errors.read_time && <p className="text-sm text-destructive mt-1">{errors.read_time}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Resumo</label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Breve descrição do artigo..."
                  rows={3}
                />
                {errors.excerpt && <p className="text-sm text-destructive mt-1">{errors.excerpt}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Conteúdo Completo</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Conteúdo completo do artigo..."
                  rows={10}
                />
                {errors.content && <p className="text-sm text-destructive mt-1">{errors.content}</p>}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleSubmit(false)}
                  variant="outline"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar como Rascunho
                </Button>
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Publicar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {posts?.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <Badge variant={post.is_published ? "default" : "secondary"}>
                        {post.is_published ? "Publicado" : "Rascunho"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {post.category} • {post.read_time} • {new Date(post.created_at).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => togglePublish(post)}
                      disabled={updateMutation.isPending}
                    >
                      {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(post)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteMutation.mutate(post.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              </CardContent>
            </Card>
          ))}
          {posts?.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum artigo cadastrado ainda</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
