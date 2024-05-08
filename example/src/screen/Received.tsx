import React, { useEffect, useState } from 'react';
import {
  Text,
  useColorScheme,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import type { EventConsumer, EventMapBase } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { RichFlyer, type RFContent } from 'react-native-richflyer';

import ScrollArea from '../component/ScrollArea';
import { RECEIVED, APPEARANCE_SETTING } from '../const';

type Props = {
  navigation: EventConsumer<EventMapBase>;
};

export default function Received({ navigation }: Props) {
  const isDarkMode = useColorScheme() === APPEARANCE_SETTING.DARK;

  const [postingHistories, setPostingHistories] = useState<RFContent[]>([]);

  const showReceivedNotification = (notificationId: string) => {
    const richflyer = new RichFlyer();
    return richflyer.showReceivedNotification(notificationId);
  };

  const getHistories = () => {
    const richflyer = new RichFlyer();
    richflyer
      .getReceivedNotifications()
      .then((result) => {
        setPostingHistories(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    //初回のレンダリングで履歴を取得
    getHistories();
  }, []);

  useEffect(() => {
    //通知受信結果を取得するリスナーの登録
    const getHistoriesListener = navigation.addListener('tabPress', () => {
      getHistories();
    });
    return getHistoriesListener;
  }, [navigation]);

  return (
    <PaperProvider>
      <ScrollArea>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}
        >
          {postingHistories.length ? (
            postingHistories.map((result, index) => {
              return (
                <View key={`received-list-${index}`}>
                  <TouchableOpacity
                    style={styles.postingResultContent}
                    onPress={() =>
                      showReceivedNotification(result.notificationId)
                    }
                  >
                    <View style={styles.postingResultText}>
                      <Text style={styles.postingResultTitle}>
                        {result.title.length > RECEIVED.STRING_LENGTH.TITLE_MAX
                          ? `${result.title.slice(
                              RECEIVED.STRING_LENGTH.SLICE_START_POS,
                              RECEIVED.STRING_LENGTH.SLICE_TITLE_END_POS
                            )}${RECEIVED.LIST.THREE_DOTS}`
                          : result.title}
                      </Text>
                      <Text style={styles.postingResult}>
                        {result.body.length > RECEIVED.STRING_LENGTH.BODY_MAX
                          ? `${result.body.slice(
                              RECEIVED.STRING_LENGTH.SLICE_START_POS,
                              RECEIVED.STRING_LENGTH.SLICE_BODY_END_POS
                            )}${RECEIVED.LIST.THREE_DOTS}`
                          : result.body}
                      </Text>
                    </View>
                    {result.imagePath ? (
                      <Image
                        source={{ uri: `file://${result.imagePath}` }}
                        style={styles.postingResultImage}
                      />
                    ) : null}
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.noResultContent}>
              <Text style={styles.noResultText}>
                {RECEIVED.LIST.NO_NOTIFICATIONS}
              </Text>
            </View>
          )}
        </View>
      </ScrollArea>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  postingResultContent: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  noResultContent: {
    height: 100,
    margin: 10,
  },
  postingResultText: {
    maxWidth: 250,
  },
  postingResultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noResultText: {
    fontSize: 14,
    paddingTop: 10,
  },
  postingResult: {
    marginBottom: 20,
    fontSize: 15,
  },
  postingResultImage: {
    width: 100,
    height: 100,
  },
});
