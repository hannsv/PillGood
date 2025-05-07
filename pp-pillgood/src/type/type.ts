import { createContext } from "react";

export type PillDataType = {
  company: string;
  pillName: string;
  sequenceId: string;
  efficacy: string;
  usage: string;
  precautions: string;
  ingredients: string;
  warning: string | null;
  storageMethod: string;
  sideEffects: string;
  imageUrl: string;
};

export type PillListType = {
  id: string;
  name: string;
  time: string;
};

export type PillContextType = {
  pilldata: PillListType[];
  setPilldata: React.Dispatch<React.SetStateAction<PillListType[]>>;
};

// PillContext.ts
export const PillContext = createContext<PillContextType | null>(null);
