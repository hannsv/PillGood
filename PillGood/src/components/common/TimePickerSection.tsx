import { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Text, IconButton, useTheme } from "react-native-paper";

interface TimePickerSectionProps {
  date: Date;
  onChange: (date: Date) => void;
}

export default function TimePickerSection({
  date,
  onChange,
}: TimePickerSectionProps) {
  const theme = useTheme();

  // 입력 모드 상태 관리
  const [editingMode, setEditingMode] = useState<"none" | "hour" | "minute">(
    "none",
  );
  const [tempInput, setTempInput] = useState("");
  const inputRef = useRef<TextInput>(null);

  // 입력 모드 진입 시 포커스
  useEffect(() => {
    if (editingMode !== "none") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [editingMode]);

  const adjustTime = (type: "hour" | "minute", delta: number) => {
    const newDate = new Date(date);
    if (type === "hour") {
      newDate.setHours(newDate.getHours() + delta);
    } else {
      newDate.setMinutes(newDate.getMinutes() + delta);
    }
    onChange(newDate);
  };

  const setAmPm = (isAm: boolean) => {
    const currentHours = date.getHours();
    const newDate = new Date(date);
    if (isAm && currentHours >= 12) {
      newDate.setHours(currentHours - 12);
    } else if (!isAm && currentHours < 12) {
      newDate.setHours(currentHours + 12);
    }
    onChange(newDate);
  };

  const handleTimePress = (type: "hour" | "minute", value: number) => {
    setTempInput(
      type === "minute" ? value.toString().padStart(2, "0") : value.toString(),
    );
    setEditingMode(type);
  };

  const handleInputSubmit = () => {
    if (editingMode === "none") return;

    const val = parseInt(tempInput, 10);
    if (isNaN(val)) {
      setEditingMode("none");
      return;
    }

    const newDate = new Date(date);

    if (editingMode === "hour") {
      // 1-12 사이 값으로 제한
      let newHour = val;
      if (newHour < 1) newHour = 1;
      if (newHour > 12) newHour = 12;

      // 현재 AM/PM 유지하면서 시간 적용
      const isPm = date.getHours() >= 12;
      if (isPm && newHour !== 12) newHour += 12;
      else if (!isPm && newHour === 12) newHour = 0; // 12 AM is 0

      newDate.setHours(newHour);
    } else {
      // 0-59 사이 값으로 제한
      let newMin = val;
      if (newMin < 0) newMin = 0;
      if (newMin > 59) newMin = 59;
      newDate.setMinutes(newMin);
    }

    onChange(newDate);
    setEditingMode("none");
  };

  const formatTimePart = (num: number) => num.toString().padStart(2, "0");

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isAm = hours < 12;
  const displayHours = hours % 12 || 12;

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={{ marginBottom: 10 }}>
        알림 시간 설정
      </Text>
      <View style={styles.timeContainer}>
        {/* AM/PM 버튼 */}
        <View style={styles.ampmContainer}>
          <TouchableOpacity
            onPress={() => setAmPm(true)}
            style={[
              styles.ampmButton,
              isAm && { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Text
              style={[
                styles.ampmText,
                isAm && {
                  color: theme.colors.onPrimaryContainer,
                  fontWeight: "bold",
                },
              ]}
            >
              오전
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAmPm(false)}
            style={[
              styles.ampmButton,
              !isAm && { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Text
              style={[
                styles.ampmText,
                !isAm && {
                  color: theme.colors.onPrimaryContainer,
                  fontWeight: "bold",
                },
              ]}
            >
              오후
            </Text>
          </TouchableOpacity>
        </View>

        {/* 시간 조절 */}
        <View style={styles.pickerColumn}>
          <IconButton icon="chevron-up" onPress={() => adjustTime("hour", 1)} />
          {editingMode === "hour" ? (
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { color: theme.colors.onSurface, fontSize: 45 },
              ]}
              value={tempInput}
              onChangeText={setTempInput}
              keyboardType="number-pad"
              onBlur={handleInputSubmit}
              onSubmitEditing={handleInputSubmit}
              maxLength={2}
              selectTextOnFocus
              textAlign="center"
            />
          ) : (
            <TouchableOpacity
              onPress={() => handleTimePress("hour", displayHours)}
            >
              <Text variant="displayMedium">
                {formatTimePart(displayHours)}
              </Text>
            </TouchableOpacity>
          )}
          <IconButton
            icon="chevron-down"
            onPress={() => adjustTime("hour", -1)}
          />
        </View>

        <Text
          variant="displayMedium"
          style={{ marginHorizontal: 10, paddingBottom: 10 }}
        >
          :
        </Text>

        {/* 분 조절 */}
        <View style={styles.pickerColumn}>
          <IconButton
            icon="chevron-up"
            onPress={() => adjustTime("minute", 10)}
          />
          {editingMode === "minute" ? (
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { color: theme.colors.onSurface, fontSize: 45 },
              ]}
              value={tempInput}
              onChangeText={setTempInput}
              keyboardType="number-pad"
              onBlur={handleInputSubmit}
              onSubmitEditing={handleInputSubmit}
              maxLength={2}
              selectTextOnFocus
              textAlign="center"
            />
          ) : (
            <TouchableOpacity
              onPress={() => handleTimePress("minute", minutes)}
            >
              <Text variant="displayMedium">{formatTimePart(minutes)}</Text>
            </TouchableOpacity>
          )}
          <IconButton
            icon="chevron-down"
            onPress={() => adjustTime("minute", -10)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 20,
  },
  ampmContainer: {
    marginRight: 20,
    justifyContent: "center",
  },
  ampmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginVertical: 4,
  },
  ampmText: {
    fontSize: 16,
    color: "#666",
  },
  pickerColumn: {
    alignItems: "center",
    width: 60,
  },
  input: {
    textAlign: "center",
    minWidth: 80,
    padding: 0,
    margin: 0,
  },
});
