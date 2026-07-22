import {
  TurboModuleRegistry,
  NativeEventEmitter,
  DeviceEventEmitter,
  Platform,
  type EmitterSubscription,
  type TurboModule,
  type NativeModule,
} from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-richflyer' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const OPEN_NOTIFICATION_EVENT = 'RFOpenNotification';

export const RFLaunchMode = {
  Text: 'Text',
  Image: 'Image',
  Gif: 'Gif',
  Movie: 'Movie',
} as const;

export type RFLaunchModeValue =
  (typeof RFLaunchMode)[keyof typeof RFLaunchMode];

export type RFSettings = {
  serviceKey: string;
  launchMode?: RFLaunchModeValue[];
  groupId: string;
  sandbox: boolean;
  prompt?: RFPrompt;
  themeColor?: string;
};

// Action button attached to a received notification (from RFContent.actionButtons).
export type RFAction = {
  title: string;
  type: string;
  value: string;
  index: number;
  extendedProperty: string;
  notificationId: string;
};

// Delivered to addOpenNotificationListener when an action button attached to
// the notification was tapped: title/type/value/notificationId are always
// present together.
export type RFOpenNotificationButtonEvent = {
  notificationId: string;
  title: string;
  type: string;
  value: string;
  extendedProperty?: string;
};

// Delivered to addOpenNotificationListener when the notification was opened
// without tapping a specific action button (e.g. tapping the notification
// body, or launching the app from it). No button information is available.
export type RFOpenNotificationBodyEvent = {
  notificationId?: string;
  extendedProperty?: string;
  title?: undefined;
  type?: undefined;
  value?: undefined;
};

// Payload delivered to addOpenNotificationListener. Check for `title` (or any
// other button-only field) to narrow to RFOpenNotificationButtonEvent.
export type RFOpenNotificationEvent =
  | RFOpenNotificationButtonEvent
  | RFOpenNotificationBodyEvent;

export type RFContent = {
  title: string;
  body: string;
  notificationId: string;
  imagePath: string;
  receivedDate: number;
  notificationDate: number;
  type: number;
  actionButtons: RFAction[];
  extendedProperty: string;
};

export type RFPrompt = {
  title: string;
  message: string;
  image: string;
};

// Values registerSegments() accepts for a single segment.
export type RFSegmentValue = string | number | boolean | Date;
export type RFSegments = Record<string, RFSegmentValue>;

interface RFEventEmitter {
  addListener(
    eventName: string,
    listener: (...args: any[]) => void
  ): EmitterSubscription;
  listenerCount(eventName: string): number;
}

interface RichFlyerNativeModule {
  initialize(settings: RFSettings): Promise<any>;
  registerSegments(
    stringSegments: Record<string, string>,
    intSegments: Record<string, number>,
    booleanSegments: Record<string, boolean>,
    dateSegments: Record<string, number>
  ): Promise<any>;
  getSegments(): Promise<Record<string, string>>;
  getReceivedNotifications(): Promise<RFContent[]>;
  getLatestReceivedNotification(): Promise<RFContent>;
  showReceivedNotification(notificationId: string): Promise<boolean>;
  resetBadgeNumber(): Promise<boolean>;
  setForegroundNotification(
    badge: boolean,
    alert: boolean,
    sound: boolean
  ): Promise<boolean>;
  postMessage(
    events: string[],
    variables: Record<string, string>,
    standbyTime: number
  ): Promise<string[]>;
  cancelPosting(eventPostId: string): Promise<any>;
}

export class RichFlyer {
  private readonly richflyer: RichFlyerNativeModule;
  private readonly emitter: RFEventEmitter;
  private openNotificationSubscription: EmitterSubscription | null = null;

  constructor() {
    // TurboModuleRegistry.get, not NativeModules.RichFlyer -- under Bridgeless
    // (New Architecture), NativeModules resolves via a different, legacy-only
    // proxy that TurboModuleRegistry.get bypasses entirely, so it never finds
    // this module even though it's correctly linked. TurboModuleRegistry.get
    // is the API that actually works under both the old bridge and Bridgeless.
    const nativeModule = TurboModuleRegistry.get<
      RichFlyerNativeModule & TurboModule
    >('RichFlyer');

    this.richflyer = nativeModule
      ? nativeModule
      : (new Proxy(
          {},
          {
            get() {
              throw new Error(LINKING_ERROR);
            },
          }
        ) as RichFlyerNativeModule);

    // Only iOS and Android ship a native RichFlyer module. On any other
    // platform we fall back to DeviceEventEmitter so construction doesn't
    // throw; listeners registered on it simply never fire.
    this.emitter =
      Platform.OS === 'ios' || Platform.OS === 'android'
        ? new NativeEventEmitter(
            nativeModule as unknown as NativeModule | undefined
          )
        : DeviceEventEmitter;
  }

  initialize(settings: RFSettings): Promise<any> {
    return this.richflyer.initialize(settings);
  }

  registerSegments(segments: RFSegments): Promise<any> {
    const stringSegments: Record<string, string> = {};
    const intSegments: Record<string, number> = {};
    const booleanSegments: Record<string, boolean> = {};
    const dateSegments: Record<string, number> = {};

    Object.keys(segments).forEach((key) => {
      const value = segments[key];
      if (typeof value === 'string') {
        stringSegments[key] = value;
      } else if (typeof value === 'number') {
        intSegments[key] = value;
      } else if (typeof value === 'boolean') {
        booleanSegments[key] = value;
      } else if (value instanceof Date) {
        dateSegments[key] = Math.floor(value.getTime());
      }
    });

    return this.richflyer.registerSegments(
      stringSegments,
      intSegments,
      booleanSegments,
      dateSegments
    );
  }

  getSegments(): Promise<Record<string, string>> {
    return this.richflyer.getSegments();
  }

  getReceivedNotifications(): Promise<RFContent[]> {
    return this.richflyer.getReceivedNotifications();
  }

  getLatestReceivedNotification(): Promise<RFContent> {
    return this.richflyer.getLatestReceivedNotification();
  }

  showReceivedNotification(notificationId: string): Promise<boolean> {
    return this.richflyer.showReceivedNotification(notificationId);
  }

  // For iOS
  resetBadgeNumber(): Promise<boolean> {
    return this.richflyer.resetBadgeNumber();
  }

  // For iOS
  setForegroundNotification(
    badge: boolean,
    alert: boolean,
    sound: boolean
  ): Promise<boolean> {
    return this.richflyer.setForegroundNotification(badge, alert, sound);
  }

  // Only one listener is active at a time: calling this again replaces the
  // previous callback rather than adding a second one. Call
  // removeOpenNotificationListener() first if you need to swap callbacks
  // explicitly.
  addOpenNotificationListener(
    callback: (action: RFOpenNotificationEvent) => void
  ): void {
    if (this.emitter.listenerCount(OPEN_NOTIFICATION_EVENT) === 0) {
      this.openNotificationSubscription = this.emitter.addListener(
        OPEN_NOTIFICATION_EVENT,
        callback
      );
    }
  }

  removeOpenNotificationListener(): void {
    this.openNotificationSubscription?.remove();
    this.openNotificationSubscription = null;
  }

  postMessage(
    events: string[],
    variables: Record<string, string>,
    standbyTime: number
  ): Promise<string[]> {
    return this.richflyer.postMessage(events, variables, standbyTime);
  }

  cancelPosting(eventPostId: string): Promise<any> {
    return this.richflyer.cancelPosting(eventPostId);
  }
}
