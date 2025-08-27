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

export interface PillListType {
  id: number;
  name: string;
  dose: string;
  time: string;
  taken: boolean;
}

export type PillContextType = {
  pilldata: PillListType[];
  setPilldata: React.Dispatch<React.SetStateAction<PillListType[]>>;
};
