import {
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
  Platform,
} from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-richflyer' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export const RFLaunchMode = {
  Text: 'Text',
  Image: 'Image',
  Gif: 'Gif',
  Movie: 'Movie',
};

export type RFSettings = {
  serviceKey: string;
  launchMode?: string[];
  groupId: string;
  sandbox: boolean;
  prompt?: RFPrompt;
  themeColor?: string;
};

export type RFAction = {
  title: string;
  type: string;
  value: string;
  index: number;
  extendedProperty: string;
  notificationId: string;
};
export type RFContent = {
  title: string;
  body: string;
  notificationId: string;
  imagePath: string;
  receivedDate: number;
  notificationDate: number;
  type: number;
  actionButtons: RFAction[];
};
export type RFPrompt = {
  title: string;
  message: string;
  image: string;
};

export class RichFlyer {
  readonly richflyer: any;

  constructor() {
    this.richflyer = NativeModules.RichFlyer
      ? NativeModules.RichFlyer
      : new Proxy(
          {},
          {
            get() {
              throw new Error(LINKING_ERROR);
            },
          }
        );
  }

  initialize(settings: RFSettings): Promise<any> {
    return this.richflyer.initialize(settings);
  }

  registerSegments(segments: any): Promise<any> {
    var stringSegments: { [key: string]: string } = {};
    var booleanSegments: { [key: string]: boolean } = {};
    var intSegments: { [key: string]: number } = {};
    var dateSegments: { [key: string]: number } = {};

    Object.keys(segments).forEach(function (key) {
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

  getSegments(): Promise<any> {
    return this.richflyer.getSegments();
  }

  getReceivedNotifications(): Promise<Array<RFContent>> {
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

  addOpenNotificationListener(callback: (action: RFAction) => void): void {
    const emitter =
      Platform.OS === 'ios' || Platform.OS === 'android'
        ? new NativeEventEmitter(NativeModules.RichFlyer)
        : DeviceEventEmitter;

    const listnerName = 'RFOpenNotification';
    if (emitter.listenerCount(listnerName) === 0) {
      emitter.addListener(listnerName, callback);
    }
  }

  postMessage(
    events: Array<string>,
    variables: any,
    standbyTime: number
  ): Promise<any> {
    return this.richflyer.postMessage(events, variables, standbyTime);
  }

  cancelPosting(eventPostId: string): Promise<any> {
    return this.richflyer.cancelPosting(eventPostId);
  }
}
