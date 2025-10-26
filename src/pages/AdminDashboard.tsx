import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Package, MousePointerClick, Eye, TrendingUp } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [productsRes, clicksRes, viewsRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("product_clicks").select("id", { count: "exact" }),
        supabase.from("product_views").select("id", { count: "exact" }),
      ]);

      return {
        totalProducts: productsRes.count || 0,
        totalClicks: clicksRes.count || 0,
        totalViews: viewsRes.count || 0,
        conversionRate: productsRes.count ? ((clicksRes.count || 0) / (viewsRes.count || 1) * 100).toFixed(2) : "0.00",
      };
    },
  });

  const { data: topProducts } = useQuery({
    queryKey: ["top-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_clicks")
        .select("product_id, products(title)")
        .order("clicked_at", { ascending: false });

      if (error) throw error;

      const clickCounts = data.reduce((acc: any, item: any) => {
        const title = item.products?.title || "Produto desconhecido";
        acc[title] = (acc[title] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(clickCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5);
    },
  });

  const { data: categoryViews } = useQuery({
    queryKey: ["category-views"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_views")
        .select("product_id, products(categories(name))")
        .order("viewed_at", { ascending: false });

      if (error) throw error;

      const viewCounts = data.reduce((acc: any, item: any) => {
        const name = item.products?.categories?.name || "Sem categoria";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(viewCounts)
        .map(([name, value]) => ({ name, value }));
    },
  });

  const { data: clicksTrend } = useQuery({
    queryKey: ["clicks-trend"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_clicks")
        .select("clicked_at")
        .order("clicked_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const clicksByDay = data.reduce((acc: any, item) => {
        const day = new Date(item.clicked_at).toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      return last7Days.map(day => ({
        date: new Date(day).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        clicks: clicksByDay[day] || 0
      }));
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das métricas da loja</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClicks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Clicados</CardTitle>
            <CardDescription>Top 5 produtos com mais clicks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visualizações por Categoria</CardTitle>
            <CardDescription>Distribuição de views por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryViews}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryViews?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendência de Clicks - Últimos 7 Dias</CardTitle>
          <CardDescription>Histórico de clicks nos últimos dias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clicksTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clicks" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
