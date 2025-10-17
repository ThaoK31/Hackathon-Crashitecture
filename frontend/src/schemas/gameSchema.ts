import { z } from "zod";

export const playerSchema = z.object({
  user_id: z.string().min(1, "Veuillez sélectionner un utilisateur"),
  team_color: z.enum(["RED", "BLUE"]),
  role: z.enum(["ATTACK", "DEFENSE"]),
});

export const gameSchema = z
  .object({
    table_id: z.string().min(1, "Veuillez sélectionner une table"),
    players: z
      .array(playerSchema)
      .min(2, "Au moins 2 joueurs sont requis")
      .max(4, "Maximum 4 joueurs"),
  })
  .refine(
    (data) => {
      const userIds = data.players.map((p) => p.user_id).filter(Boolean);
      const uniqueUserIds = new Set(userIds);
      return userIds.length === uniqueUserIds.size;
    },
    {
      message: "Un joueur ne peut pas être sélectionné plusieurs fois",
      path: ["players"],
    }
  );

export type GameFormData = z.infer<typeof gameSchema>;

