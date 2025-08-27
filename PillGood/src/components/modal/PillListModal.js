import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";

import getPillNameData from "../../api/getPillNameData";
import { setModelData } from "../../model/pillModel";

const PillListModal = ({ items, callbackSelectedBtn }) => {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);



  useEffect(() => {
    // model을 map으로 전달받도록 해놓아서 배열을 받아야 함.
    const fetchData = async () => {
      console.log("items type is", typeof items);
      try {
        if (items === null) {
          console.log("items is null");
          return null;
        }
        const itemsArr = Array.isArray(items) ? items : [items];
        if (itemsArr.length > 0) {
          console.log(itemsArr, "items");
          const promises = itemsArr.map(async (pillName) => {
            const resData = await getPillNameData(pillName);
            const pillData = setModelData(resData);
            return pillData;
          });
          const pillDataArray = await Promise.all(promises);
          const totalCount = pillDataArray[0].totalCount;
          setCount(totalCount);
          console.log("totalCount :", totalCount);
          setData(pillDataArray);
        }
      } catch (error) {
        console.error("fetch error :", error);
      }
    };
    fetchData();
  }, [items]);

  // 버튼을 누르면 선택 결과를 콜백
  const handlebtn = (data) => {
    // console.log(data, "callback data")
    callbackSelectedBtn(data);
  };



  return (
    <View style={styles.container}>
      {/* 결과가 없을 때 */}
      {count === 0 && data === null && (
        <Pressable style={styles.buttonStyle}>
          <Text style={styles.textSty}>결과가 없습니다.</Text>
        </Pressable>
      )}
      {/* 결과 하나일 때 */}
      {count === 1 && data.length > 0 && (
        <Pressable
          style={styles.buttonStyle}
          onPress={() => handlebtn(data[0].items[0])}
        >
          <Text style={styles.textSty}>{data[0].items[0].name}</Text>
        </Pressable>
      )}
      {/* 결과가 다수일 때 */}
      {count > 1 &&
        data.length > 0 &&
        data.map((items, index) =>
          items.items.map((innerItem, innerIndex) => (
            <Pressable key={innerIndex} onPress={() => handlebtn(innerItem)}>
              {/* 약 이름으로 고르도록 이름만 렌더링 */}
              <View style={styles.buttonStyle}>
                <Text style={styles.textSty}>{innerItem.name}</Text>
              </View>
            </Pressable>
          ))
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  buttonStyle: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "pink",
    margin: 10,
    padding: 10,
  },
  textSty: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default PillListModal;
