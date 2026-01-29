import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import {
  Text,
  List,
  Switch,
  Divider,
  useTheme,
  Avatar,
  TouchableRipple,
} from "react-native-paper";
import { sendTestNotification, cancelAllNotifications, schedulePillNotifications } from "../utils/notification";
import { getAppSetting, setAppSetting, getPillsFromDB } from "../api/database";
import { SLOT_CONFIG, TimeSlot } from "../components/common/TimeSlotSelector";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SettingsScreen() {
    const theme = useTheme();
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
    // 시간 설정 상태
    const [times, setTimes] = useState<{ [key in TimeSlot]: number }>({
        morning: SLOT_CONFIG.morning.time,
        lunch: SLOT_CONFIG.lunch.time,
        dinner: SLOT_CONFIG.dinner.time,
        bedtime: SLOT_CONFIG.bedtime.time,
    });
    // DatePicker 상태
    const [showPicker, setShowPicker] = useState(false);
    const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);
    const [pickerTime, setPickerTime] = useState(new Date());

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const newTimes = { ...times };
            for (const slot of Object.keys(SLOT_CONFIG) as TimeSlot[]) {
                const savedTime = await getAppSetting(`time_${slot}`, SLOT_CONFIG[slot].time.toString());
                newTimes[slot] = parseInt(savedTime, 10);
            }
            setTimes(newTimes);
        } catch (e) {
            console.error("Failed to load settings", e);
        }
    };

    const handleTimePress = (slot: TimeSlot) => {
        const now = new Date();
        now.setHours(times[slot]);
        now.setMinutes(0);
        setPickerTime(now);
        setCurrentSlot(slot);
        setShowPicker(true);
    };

    const handleTimeChange = async (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        
        // 취소(dismissed) 시 저장하지 않음
        if (event.type === "dismissed" || !selectedDate) {
            return;
        }

        if (currentSlot) {
            const hours = selectedDate.getHours();
            
            // 1. 상태 업데이트
            const newTimes = { ...times, [currentSlot]: hours };
            setTimes(newTimes);

            // 2. DB 저장
            await setAppSetting(`time_${currentSlot}`, hours.toString());

            // 3. 알림 재설정
            Alert.alert("알림 시간 변경", "모든 약의 알림 시간이 업데이트됩니다.", [
                {
                    text: "확인",
                    onPress: async () => {
                         await rescheduleAllNotifications();
                    }
                }
            ]);
        }
    };

    const rescheduleAllNotifications = async () => {
         try {
            await cancelAllNotifications(); // 기존 알림 모두 취소
            const pills = await getPillsFromDB();
            
            // 각 약에 대해 스케줄링 다시 수행
            // schedulePillNotifications 함수 내부에서 getAppSetting을 다시 호출하므로 
            // DB값 기준으로 최신화된 시간이 적용됨.
            for (const pill of pills) {
                if (pill.isActive) {
                    await schedulePillNotifications(pill.id, pill.name, pill.slots, pill.days);
                }
            }
            Alert.alert("완료", "알림 시간이 변경되었습니다.");
         } catch (e) {
             console.error("Failed to reschedule", e);
             Alert.alert("오류", "알림 재설정에 실패했습니다.");
         }
    };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert(
        "테스트 알림 예약됨",
        "3초 뒤에 알림이 발송됩니다. 앱을 백그라운드로 보내보세요."
      );
    } catch (e) {
      Alert.alert("오류", "알림 발송에 실패했습니다.");
      console.error(e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 헤더 영역 */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ fontWeight: "bold" }}>
            설정
          </Text>
        </View>

        {/* 1. 사용자 프로필 섹션 */}
        <View style={styles.sectionContainer}>
          <TouchableRipple onPress={() => {}} rippleColor="rgba(0, 0, 0, .1)">
            <View style={styles.profileRow}>
              <Avatar.Icon size={50} icon="account" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.onPrimaryContainer} />
              <View style={{ marginLeft: 16 }}>
                <Text variant="titleMedium" style={{ fontWeight: "bold" }}>사용자님</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>내 정보 수정하기</Text>
              </View>
            </View>
          </TouchableRipple>
        </View>

        <Divider style={styles.divider} />

        {/* 2. 알림 설정 섹션 */}
        <List.Section>
          <List.Subheader style={styles.subheader}>알림</List.Subheader>
          <List.Item
            title="앱 알림 받기"
            description="복용 알림을 받습니다"
            left={(props) => <List.Icon {...props} icon="bell-ring" />}
            right={() => (
              <Switch
                value={isNotificationEnabled}
                onValueChange={setIsNotificationEnabled}
                color={theme.colors.primary}
              />
            )}
            onPress={() => setIsNotificationEnabled(!isNotificationEnabled)}
          />
          <List.Item
            title="알림 테스트 발송"
            description="3초 뒤 테스트 알림을 보냅니다"
            left={(props) => (
              <List.Icon {...props} icon="bell-check" color={theme.colors.primary} />
            )}
            onPress={handleTestNotification}
          />
        </List.Section>
        
        <Divider style={styles.divider} />

        {/* 2.5 복용 시간 설정 섹션 */}
        <List.Section>
            <List.Subheader style={styles.subheader}>복용 시간 설정</List.Subheader>
            {(Object.keys(SLOT_CONFIG) as TimeSlot[]).map((slot) => (
                <List.Item
                    key={slot}
                    title={`${SLOT_CONFIG[slot].label} 시간`}
                    description={`${times[slot].toString().padStart(2, '0')}:00`}
                    left={(props) => <List.Icon {...props} icon={SLOT_CONFIG[slot].icon} />}
                    right={(props) => <List.Icon {...props} icon="clock-edit-outline" />}
                    onPress={() => handleTimePress(slot)}
                />
            ))}
        </List.Section>

        <Divider style={styles.divider} />

        {/* 3. 데이터 관리 섹션 */}
        <List.Section>
          <List.Subheader style={styles.subheader}>데이터 및 보안</List.Subheader>
          <List.Item
            title="데이터 백업 및 복원"
            left={(props) => <List.Icon {...props} icon="cloud-upload" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <List.Item
            title="모든 데이터 초기화"
            titleStyle={{ color: theme.colors.error }}
            left={(props) => <List.Icon {...props} icon="delete-forever" color={theme.colors.error} />}
            onPress={() => {}}
          />
        </List.Section>

        <Divider style={styles.divider} />

        {/* 4. 앱 정보 섹션 */}
        <List.Section>
          <List.Subheader style={styles.subheader}>앱 정보</List.Subheader>
          <List.Item
            title="버전 정보"
            description="1.0.0 (최신 버전)"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="문의하기"
            left={(props) => <List.Icon {...props} icon="email" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </List.Section>
        {showPicker && (
            <DateTimePicker
                value={pickerTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleTimeChange}
                locale="ko"
                positiveButton={{label: '확인', textColor: theme.colors.primary}}
                negativeButton={{label: '취소', textColor: theme.colors.onSurface}}
            />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  subheader: {
    fontWeight: "600",
    fontSize: 14,
    color: "#666",
  },
  divider: {
    height: 8,
    backgroundColor: "#F2F2F2", // 섹션 구분을 위한 두꺼운 구분선
  },
});
