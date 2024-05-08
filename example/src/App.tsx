import * as React from 'react';
import { Alert, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ParamListBase, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Segments from './screen/Segments';
import Received from './screen/Received';
import Event from './screen/Event';
import { SCREEN_NAME, ION_ICONS_NAME, LOG_MESSAGE } from './const/index';
import { RichFlyer, RFLaunchMode, type RFAction } from 'react-native-richflyer';

type TabBarIconArg = {
  color: string;
  size: number;
};

type ScreenOptionsRoute = {
  route: RouteProp<ParamListBase, string>;
};

const getIconName = (routeName: string) => {
  switch (routeName) {
    case SCREEN_NAME.SEGMENTS:
      return ION_ICONS_NAME.CREATE_OUTLINE;
    case SCREEN_NAME.RECEIVED:
      return ION_ICONS_NAME.SYNC_OUTLINE;
    case SCREEN_NAME.EVENT:
      return ION_ICONS_NAME.SEND_OUTLINE;
    default:
      return '';
  }
};

const screenOptions = ({ route }: ScreenOptionsRoute) => ({
  tabBarIcon: ({ color, size }: TabBarIconArg) => {
    const iconName = getIconName(route.name);
    return <Ionicons name={iconName} color={color} size={size} />;
  },
});

const Tab = createBottomTabNavigator();
const richflyer = new RichFlyer();

export default function App() {
  const [initResult, setInitResult] = React.useState<string | undefined>();

  //通知開封時の処理を登録
  const openNotificationListener = () => {
    richflyer.addOpenNotificationListener(async (action: RFAction) => {
      if (action.extendedProperty) {
        console.log(`${LOG_MESSAGE.EXTENDED_PROP}${action.extendedProperty}`);
      }
      const supported = await Linking.canOpenURL(action.value);
      console.log(supported);
      if (action.title && supported) {
        console.log(
          `${LOG_MESSAGE.ACTION}${action.title}\n${LOG_MESSAGE.VALUE}${action.value}\n${LOG_MESSAGE.TYPE}${action.type}`
        );
        await Linking.openURL(action.value);
      } else {
        Alert.alert(`${LOG_MESSAGE.CANNOT_OPEN_URL}${action.value}`);
      }
    });
  };

  React.useEffect(() => {
    const settings = {
      serviceKey: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      groupId: 'group.net.richflyer.app',
      sandbox: true,
      themeColor: '#468ACE',
      launchMode: [RFLaunchMode.Movie, RFLaunchMode.Gif],
    };
    richflyer
      .initialize(settings)
      .then((code: string) => {
        setInitResult(`${LOG_MESSAGE.CODE}${code}`);
        console.log(initResult);
        richflyer.setForegroundNotification(true, true, true);
      })
      .catch((err: any) => {
        setInitResult(
          `${LOG_MESSAGE.CODE}${err.code} ${LOG_MESSAGE.MESSAGE}${err.message}`
        );
        console.log(initResult);
      });

    openNotificationListener();
  }, [initResult]);

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name={SCREEN_NAME.SEGMENTS} component={Segments} />
        <Tab.Screen name={SCREEN_NAME.RECEIVED} component={Received} />
        <Tab.Screen name={SCREEN_NAME.EVENT} component={Event} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
