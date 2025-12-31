import { useState } from "react";
import { Card, Chip, Searchbar, Text } from "react-native-paper";

export default function PillSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");

  const onChangeSearch = (query: string) => setSearchQuery(query);

  return (
    <>
      <Searchbar
        value={searchQuery}
        placeholder="약 이름을 입력하세요"
        onChangeText={onChangeSearch}
      ></Searchbar>
    </>
  );
}
