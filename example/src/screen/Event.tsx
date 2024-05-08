import React, { useState } from 'react';
import {
  useColorScheme,
  View,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { PaperProvider, Dialog, Portal, Button } from 'react-native-paper';
import { RichFlyer } from 'react-native-richflyer';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import ScrollArea from '../component/ScrollArea';
import Section from '../component/Section';
import { SEGMENTS, APPEARANCE_SETTING, EVENT } from '../const';

interface Variables {
  key: string;
  value: string;
}

export default function Segments() {
  const isDarkMode = useColorScheme() === APPEARANCE_SETTING.DARK;

  const [events, setEvents] = useState<Array<string>>(Array(3).fill(''));
  const [variables, setVariables] = useState<Array<Variables>>(
    Array(3).fill({ key: '', value: '' })
  );
  const [standbyTime, setStandbyTime] = useState<string>('');
  const [eventPostIds, setEventPostIds] = useState<Array<string>>([]);

  const [postMessageResult, setPostMessageResult] = useState<string>('');

  const [postMessageDialogOpen, setPostMessageDialogOpen] =
    useState<boolean>(false);
  const [cancelPostingDialogOpen, setCancelPostingDialogOpen] =
    useState<boolean>(false);
  const [eventPostErrorDialogOpen, setEventPostErrorDialogOpen] =
    useState<boolean>(false);

  const onPressSendPosting = () => {
    const richflyer = new RichFlyer();
    const rfEvents = [];
    const rfVariables = {};
    for (const event of events) {
      if (event) {
        rfEvents.push(event);
      }
    }
    for (const variable of variables) {
      if (variable.key && variable.value) {
        Object.assign(rfVariables, { [`${variable.key}`]: variable.value });
      }
    }
    //空文字は管理サイトの待機時間を採用する
    const rfStandbyTime = standbyTime.length === 0 ? -1 : Number(standbyTime);
    richflyer
      .postMessage(rfEvents, rfVariables, rfStandbyTime)
      .then((result) => {
        setPostMessageResult(result);
        setEventPostIds(result);
        setPostMessageDialogOpen(true);
      })
      .catch((error) => {
        setPostMessageResult(error);
        setEventPostErrorDialogOpen(true);
      });
  };
  const onPressCancelPosting = () => {
    const richflyer = new RichFlyer();
    for (const id of eventPostIds) {
      richflyer
        .cancelPosting(id)
        .then((result) => {
          setPostMessageResult(result);
          setCancelPostingDialogOpen(true);
        })
        .catch((error) => {
          setPostMessageResult(error);
          setEventPostErrorDialogOpen(true);
        });
    }
  };

  const onChangeEvents = (text: string, index: number) => {
    const newEvents = events.map((event, i) => {
      return i === index ? text : event;
    });
    setEvents(newEvents);
  };

  const onChangeVariables = (text: string, key: string, index: number) => {
    const newVariables = variables.map((variable, i) => {
      if (key === EVENT.KEY) {
        return i === index ? { key: text, value: variable.value } : variable;
      }
      return i === index ? { key: variable.key, value: text } : variable;
    });
    setVariables(newVariables);
  };

  const hidePostMessageDialog = () => setPostMessageDialogOpen(false);
  const hideCancelPostingDialog = () => setCancelPostingDialogOpen(false);
  const hideEventPostErrorDialog = () => setEventPostErrorDialogOpen(false);

  const styles = StyleSheet.create({
    textInput: {
      textAlign: 'left',
      height: 50,
      color: 'white',
      fontSize: 15,
    },
    eventContent: {
      height: 160,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    eventInputView: {
      borderColor: Colors.white,
      borderBottomWidth: 2,
      color: Colors.white,
    },
    variablesContent: {
      height: 160,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    variablesView: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    variablesKey: {
      width: 140,
      borderColor: Colors.white,
      borderBottomWidth: 2,
      color: Colors.white,
    },
    variablesValue: {
      width: 140,
      borderColor: Colors.white,
      borderBottomWidth: 2,
      color: Colors.white,
    },
    standbyTimeView: {
      borderColor: Colors.white,
      borderBottomWidth: 2,
      color: Colors.white,
    },
    standbyTimeInput: {
      textAlign: 'left',
      height: 50,
      color: 'white',
      fontSize: 15,
    },
    segmentInputContainer: {
      marginBottom: 20,
    },
    postingButton: {
      width: 200,
      height: 40,
      borderRadius: 10,
      backgroundColor: '#555',
      marginVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      width: 200,
      color: Colors.white,
      textAlign: 'center',
    },
    pickerSelectView: {
      flexDirection: 'row',
      justifyContent: 'center',
      borderColor: Colors.white,
      borderBottomWidth: 2,
    },
    date: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 120,
      marginRight: 5,
    },
    dateText: {
      minWidth: 120,
      color: Colors.white,
      fontSize: 16,
    },
    postingButtonView: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    editButton: {
      borderColor: Colors.white,
      padding: 8,
      borderWidth: 2,
      borderRadius: 20,
      marginLeft: 8,
    },
  });

  return (
    <ScrollArea>
      <PaperProvider>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}
        >
          <View style={styles.segmentInputContainer}>
            <Section
              title={EVENT.EVENT_NAME}
              children={
                <View style={styles.eventContent}>
                  {events.map((event, index) => {
                    return (
                      <View
                        style={styles.eventInputView}
                        key={`evnet-${index}`}
                      >
                        <TextInput
                          style={styles.textInput}
                          placeholder={`event${index + 1}`}
                          onChangeText={(text) => {
                            onChangeEvents(text, index);
                          }}
                          value={event}
                        />
                      </View>
                    );
                  })}
                </View>
              }
            />
            <Section
              title={EVENT.VARIABLES}
              children={
                <View style={styles.variablesContent}>
                  {variables.map((variable, index) => {
                    return (
                      <View
                        style={styles.variablesView}
                        key={`variables-${index}`}
                      >
                        <View style={styles.variablesKey}>
                          <TextInput
                            style={styles.textInput}
                            placeholder={EVENT.KEY}
                            onChangeText={(text) => {
                              onChangeVariables(text, EVENT.KEY, index);
                            }}
                            value={variable.key}
                          />
                        </View>
                        <View style={styles.variablesValue}>
                          <TextInput
                            style={styles.textInput}
                            placeholder={EVENT.VALUE}
                            onChangeText={(text) => {
                              onChangeVariables(text, EVENT.VALUE, index);
                            }}
                            value={variable.value}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              }
            />
            <Section
              title={EVENT.STANDBY_TIME}
              children={
                <View style={styles.standbyTimeView}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={EVENT.MINUITE}
                    onChangeText={(text) => {
                      setStandbyTime(text);
                    }}
                    value={standbyTime}
                  />
                </View>
              }
            />

            <View style={styles.postingButtonView}>
              <View style={styles.postingButton}>
                <Text onPress={onPressSendPosting} style={styles.buttonText}>
                  {EVENT.SEND_POSTING}
                </Text>
              </View>
            </View>
            <View style={styles.postingButtonView}>
              <View style={styles.postingButton}>
                <Text onPress={onPressCancelPosting} style={styles.buttonText}>
                  {EVENT.CANCEL_POSTING}
                </Text>
              </View>
            </View>
            <Portal>
              <Dialog
                visible={postMessageDialogOpen}
                onDismiss={hidePostMessageDialog}
              >
                <Dialog.Title>{SEGMENTS.DIALOG_MESSAGE.REGISTER}</Dialog.Title>
                <Dialog.Content>
                  <Text>{`${EVENT.SUCCESS_POST}${postMessageResult}`}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={hidePostMessageDialog}>
                    {SEGMENTS.BUTTON.OK}
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            <Portal>
              <Dialog
                visible={cancelPostingDialogOpen}
                onDismiss={hideCancelPostingDialog}
              >
                <Dialog.Title>{SEGMENTS.DIALOG_MESSAGE.REGISTER}</Dialog.Title>
                <Dialog.Content>
                  <Text>{`${EVENT.SUCCESS_POST_CANCEL}${postMessageResult}`}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={hideCancelPostingDialog}>
                    {SEGMENTS.BUTTON.OK}
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            <Portal>
              <Dialog
                visible={eventPostErrorDialogOpen}
                onDismiss={hideEventPostErrorDialog}
              >
                <Dialog.Title>{SEGMENTS.DIALOG_MESSAGE.REGISTER}</Dialog.Title>
                <Dialog.Content>
                  <Text>{`${EVENT.FAIL_POST_PROCESS}${postMessageResult}`}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={hideEventPostErrorDialog}>
                    {SEGMENTS.BUTTON.OK}
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </View>
        </View>
      </PaperProvider>
    </ScrollArea>
  );
}
