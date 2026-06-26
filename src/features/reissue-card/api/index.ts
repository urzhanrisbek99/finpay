import { createClient } from "@/src/shared/api/supabase/client";

export const reissueCardApi = {
  request: async (
    userId: string,
    cardId: string,
  ): Promise<{ error: string | null }> => {
    const supabase = createClient();

    const { error } = await supabase.from("card_requests").insert({
      user_id: userId,
      card_id: cardId,
      type: "reissue",
      status: "pending",
    });

    return { error: error ? error.message : null };
  },
};
