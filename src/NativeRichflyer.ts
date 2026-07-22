import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  initialize(settings: {
    serviceKey: string;
    launchMode?: Array<string>;
    groupId: string;
    sandbox: boolean;
    themeColor?: string;
    prompt?: {
      title?: string;
      message?: string;
      image?: string;
    };
  }): Promise<boolean>;

  registerSegments(
    stringSegments: Object,
    intSegments: Object,
    booleanSegments: Object,
    dateSegments: Object
  ): Promise<boolean>;

  getSegments(): Promise<Object>;

  getReceivedNotifications(): Promise<Array<Object>>;

  getLatestReceivedNotification(): Promise<Object>;

  showReceivedNotification(notificationId: string): Promise<boolean>;

  // For iOS
  resetBadgeNumber(): Promise<boolean>;

  // For iOS
  setForegroundNotification(
    badge: boolean,
    alert: boolean,
    sound: boolean
  ): Promise<boolean>;

  postMessage(
    events: Array<string>,
    variables: Object,
    standbyTime: number
  ): Promise<Array<string>>;

  cancelPosting(eventPostId: string): Promise<string>;

  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RichFlyer');
