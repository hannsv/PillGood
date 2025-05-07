import { createContext } from "react";
import { PillContextType } from "../type/type";

export const PillContext = createContext<PillContextType>({
  pilldata: [],
  setPilldata: () => {}, // 더미 함수
});
