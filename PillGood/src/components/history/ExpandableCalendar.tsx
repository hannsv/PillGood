import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Text, IconButton, useTheme, Surface } from "react-native-paper";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExpandableCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  markedDates?: string[]; // "YYYY-MM-DD" array of dates with history
}

export default function ExpandableCalendar({
  selectedDate,
  onSelectDate,
  markedDates = [],
}: ExpandableCalendarProps) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate)); // For navigation

  // Sync current month when selected date changes significantly (optional)
  useEffect(() => {
    setCurrentMonth(new Date(selectedDate));
  }, [selectedDate]);

  // Helper: Get dates for the week view (containing the selected date or current nav date)
  const getWeekDays = (baseDate: Date) => {
    const days = [];
    const current = new Date(baseDate);
    const day = current.getDay(); // 0 (Sun) - 6 (Sat)

    // Set to Sunday of this week
    current.setDate(current.getDate() - day);

    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  // Helper: Get dates for the month view (dynamic rows)
  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // Start from the Sunday before the 1st (or the 1st if it is Sunday)
    const startPadding = firstDay.getDay();

    // Calculate total days needed to fill complete weeks
    const totalDays = startPadding + lastDay.getDate() + (6 - lastDay.getDay());

    const current = new Date(year, month, 1 - startPadding);

    for (let i = 0; i < totalDays; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  const handlePrev = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newDate = new Date(currentMonth);
    if (isExpanded) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentMonth(newDate);
  };

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newDate = new Date(currentMonth);
    if (isExpanded) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentMonth(newDate);
  };

  const changeMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const renderDay = (date: Date, index: number) => {
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const dateString = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    const hasMark = markedDates.includes(dateString);

    const dayOfWeek = date.getDay();
    const getTextColor = () => {
      if (isSelected) return theme.colors.onPrimary;
      if (!isCurrentMonth && isExpanded) return theme.colors.outline;
      if (dayOfWeek === 0) return theme.colors.error; // 일요일
      if (dayOfWeek === 6) return "#2196F3"; // 토요일 (파란색)
      return theme.colors.onSurface;
    };

    return (
      <View key={index} style={styles.dayCellWrapper}>
        <TouchableOpacity
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            onSelectDate(date);
          }}
          style={[
            styles.dayInnerCircle,
            isSelected && {
              backgroundColor: theme.colors.primary,
            },
            !isSelected &&
              isToday(date) && {
                borderWidth: 1,
                borderColor: theme.colors.primary,
              },
          ]}
        >
          <Text
            style={{
              color: getTextColor(),
              fontWeight: isSelected || isToday(date) ? "bold" : "normal",
            }}
          >
            {date.getDate()}
          </Text>
          {hasMark && (
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isSelected
                    ? theme.colors.onPrimary
                    : theme.colors.primary,
                },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const daysToRender = isExpanded
    ? getMonthDays(currentMonth)
    : getWeekDays(currentMonth);

  return (
    <Surface style={styles.container} elevation={1}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </Text>
        <View style={{ flexDirection: "row" }}>
          <IconButton icon="chevron-left" onPress={handlePrev} size={20} />
          <IconButton icon="chevron-right" onPress={handleNext} size={20} />
          <IconButton
            icon={isExpanded ? "chevron-up" : "chevron-down"}
            onPress={changeMode}
            size={20}
          />
        </View>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekRow}>
        {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
          <Text
            key={i}
            style={[
              styles.weekdayLabel,
              {
                color:
                  i === 0
                    ? theme.colors.error
                    : i === 6
                      ? "#2196F3"
                      : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysContainer}>
        {daysToRender.map((date, i) => renderDay(date, i))}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingBottom: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  weekdayLabel: {
    width: 32,
    textAlign: "center",
    fontSize: 12,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  dayCellWrapper: {
    width: `${100 / 7}%`,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },
  dayInnerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "absolute",
    bottom: 4,
  },
});
