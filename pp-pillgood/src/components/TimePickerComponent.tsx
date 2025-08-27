import { useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { Button, Text } from "react-native-paper";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import DayPickerComp from "./DayPickerComp";

export default function TimePickerComponent() {
  const [time, setTime] = useState<Date>(new Date());
  const [show, setShow] = useState<boolean>(false);

  const handleTPVisible = () => {
    setShow(true);
    console.log(show);
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      // 사용자가 선택을 취소한 경우 모달 닫기
      setShow(false);
      return;
    }

    const currentDate = selectedDate || time;
    setShow(Platform.OS === "ios"); // iOS에서만 Picker 유지
    setTime(currentDate);
  };

  return (
    <View style={{ height: "100%", padding: 10 }}>
      <Button mode="contained" onPress={handleTPVisible}>
        시간 설정
      </Button>

      {show && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={onChange}
          onTouchCancel={() => setShow(false)}
        />
      )}
      {/* 데이피커 */}
      <DayPickerComp />
    </View>
  );
}
