import api from "./api";

/** Pas dit type aan als je in de backend andere veldnamen gebruikt. */
export interface CreateStarDTO {
  word: string;          // bijvoorbeeld “HOPE”
  color: string;         // hex-kleur “#ffedaa”
  isPrivate: boolean;    // false  ⇒  public star
  publicName: string;    // wat mensen in de app zien
}

/**
 * Maak één (public of private) ster aan.
 * @returns de response van je backend (je kunt het type nog specifieker maken)
 */
export const createStar = (body: CreateStarDTO) =>
  api.post("/stars", body);     // ↖︎ wijzig het pad als jouw backend /users/:id/stars verwacht