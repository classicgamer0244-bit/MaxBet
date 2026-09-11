import { Goal, CircleDot, Target, Disc, Circle, Zap, Activity, Shield, type LucideIcon } from "lucide-react";
import type { SportSlug } from "@/types";

export const SPORT_ICONS: Record<SportSlug, LucideIcon> = {
  football: Goal,
  basketball: CircleDot,
  tennis: Target,
  cricket: Disc,
  baseball: Circle,
  "ice-hockey": Zap,
  handball: Activity,
  "american-football": Shield,
};
