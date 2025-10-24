import { supabase } from "@/integrations/supabase/client";

export const useTracking = () => {
  const trackProductView = async (productId: string) => {
    try {
      await supabase.from("product_views").insert({
        product_id: productId,
        referrer: document.referrer || null,
      });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const trackProductClick = async (productId: string) => {
    try {
      await supabase.from("product_clicks").insert({
        product_id: productId,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  return { trackProductView, trackProductClick };
};
