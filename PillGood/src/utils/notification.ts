import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform, PermissionsAndroid } from "react-native";
import { TimeSlot, SLOT_CONFIG } from "../components/common/TimeSlotSelector";
import { DayOfWeek } from "../components/common/DaySelector";
import { getAppSetting } from "../api/database"; // DB에서 설정값 가져오기 위해 import


// 알림 핸들러 설정 (앱이 켜져 있을 때 알림 처리)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * 알림 권한 요청 및 초기 설정 (로컬 알림 전용)
 */
export async function initLocalNotifications() {
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    } catch (e) {
      console.warn("Failed to set notification channel:", e);
    }
  }

  try {
    // 1. 현재 권한 상태 확인
    // Expo Go SDK 53+ Android 이슈 회피: 일반적인 getPermissionsAsync 사용 자제
    let finalStatus = 'undetermined';

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      // Android 13+에서는 PermissionsAndroid를 사용하여 POST_NOTIFICATIONS 권한 직접 요청
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        finalStatus = 'granted';
      } else {
        finalStatus = 'denied';
      }
    } else {
        // iOS 또는 구형 Android
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        finalStatus = existingStatus;
        
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
    }

    if (finalStatus !== "granted") {
      console.log("알림 권한이 거부되었습니다.");
      return false;
    }
    return true;
  } catch (e) {
    // 권한 요청 중 오류 발생 시, 로컬 알림은 작동할 수 있으므로 true 반환 시도 또는 로그만 남김
    console.warn("Error checking notifications permissions (ignoring for local notifications):", e);
    return true; 
  }
}

/**
 * 특정 약에 대한 알림 스케줄링
 * @param pillId 약 ID
 * @param pillName 약 이름
 * @param slots 복용 시간 슬롯 배열
 * @param days 요일 배열 (없으면 매일)
 */
export async function schedulePillNotifications(
  pillId: string,
  pillName: string,
  slots: TimeSlot[],
  days: DayOfWeek[] = []
) {
  // 기존 이 약에 대한 알림 모두 취소 (중복 방지)
  await cancelPillNotifications(pillId);

  // 요일 매핑 (JS DayOfWeek string -> Expo weekday number: 1=Sun, 2=Mon... 7=Sat)
  const dayMap: { [key: string]: number } = {
    Sun: 1,
    Mon: 2,
    Tue: 3,
    Wed: 4,
    Thu: 5,
    Fri: 6,
    Sat: 7,
  };

  for (const slot of slots) {
    const timeConfig = SLOT_CONFIG[slot];
    if (!timeConfig) {
      console.warn(`Invalid slot: ${slot}`);
      continue;
    }

    // DB에서 해당 슬롯의 설정된 시간 가져오기 (없으면 기본값 사용)
    const savedTime = await getAppSetting(`time_${slot}`, timeConfig.time.toString());
    const targetHour = parseInt(savedTime, 10);

    // 슬롯별 알림 메시지
    const title = `💊 ${timeConfig.label} 약 드실 시간이에요!`;
    const body = `${pillName} 챙겨 드셨나요?`;

    // 매일 복용인 경우 (days가 비어있음)
    if (!days || days.length === 0) {
      const identifier = `${pillId}_${slot}_daily`;
      try {
        const trigger: any = {
          hour: targetHour,
          minute: 0,
          repeats: true,
        };
        // Android에서는 trigger에 channelId가 필요할 수 있음 (또는 type 명시)
        if (Platform.OS === 'android') {
           trigger.channelId = 'default';
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: "default",
            data: { channelId: 'default' }, // content data에도 추가
          },
          trigger,
          identifier,
        });
      } catch (e) {
        console.error("Failed to schedule daily notification", e);
      }
    } else {
      // 특정 요일 복용인 경우
      for (const day of days) {
        const weekday = dayMap[day as string];
        if (weekday) {
          const identifier = `${pillId}_${slot}_${day}`;
          try {
            const trigger: any = {
              weekday,
              hour: targetHour,
              minute: 0,
              repeats: true,
            };
            if (Platform.OS === 'android') {
                trigger.channelId = 'default';
            }

            await Notifications.scheduleNotificationAsync({
              content: {
                title,
                body,
                sound: "default",
                data: { channelId: 'default' },
              },
              trigger,
              identifier,
            });
          } catch (e) {
            console.error("Failed to schedule weekly notification", e);
          }
        }
      }
    }
  }
}

/**
 * 특정 약의 모든 알림 취소
 * 식별자 패턴: ${pillId}_... 로 시작하는 모든 알림 취소
 * Expo는 prefix로 삭제하는 기능이 없으므로, 우리가 만든 규칙대로 삭제 시도하거나
 * 현재 스케줄된 모든 목록에서 필터링하여 삭제해야 함.
 */
export async function cancelPillNotifications(pillId: string) {
  // 1. 현재 예약된 모든 알림 가져오기
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  
  // 2. 해당 pillId를 포함하는 identifier 찾아서 취소
  for (const item of scheduled) {
    if (item.identifier.startsWith(`${pillId}_`)) {
      await Notifications.cancelScheduledNotificationAsync(item.identifier);
    }
  }
}

/**
 * 테스트용 알림 발송 (3초 뒤)
 */
export async function sendTestNotification() {
  const trigger: any = { seconds: 3, repeats: false };
  if (Platform.OS === 'android') {
    trigger.channelId = 'default';
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔔 알림 테스트",
      body: "알림이 정상적으로 작동하고 있습니다!",
      sound: "default",
    },
    trigger,
  });
}

/**
 * 모든 알림 취소 (디버깅용)
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
