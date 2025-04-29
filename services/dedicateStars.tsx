import api from "./api";

export interface CreateDedicatedStarDTO {
  publicName: string;
  word: string;          // PEACEFUL, LIVELY, …
  color: string;         // hex, bv. "#d8ffd8"
}

/** POST /stars – maakt dedicated (= private) star aan */
export const createDedicatedStar = (body: CreateDedicatedStarDTO) =>
  api.post("/stars", {
    ...body,
    starFor: "dedicate",
    isPrivate: true,
  });