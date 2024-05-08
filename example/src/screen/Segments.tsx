import React, { useState } from 'react';
import { useColorScheme, View, StyleSheet, Text } from 'react-native';
import { PaperProvider, Dialog, Portal, Button } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { RichFlyer } from 'react-native-richflyer';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import moment from 'moment';

import ScrollArea from '../component/ScrollArea';
import Section from '../component/Section';
import {
  PICKER_SELECT_ITEMS,
  SEGMENTS,
  APPEARANCE_SETTING,
  MOMENT_FORMAT,
  LOG_MESSAGE,
} from '../const';

export default function Segments() {
  const isDarkMode = useColorScheme() === APPEARANCE_SETTING.DARK;

  const [genre, setGenre] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [registered, setRegistered] = useState<boolean>(false);
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [installedDate, setInstalledDate] = useState<Date>(new Date());
  const [registerSegmentResult, setRegisterSegmentResult] =
    useState<boolean>(false);

  const [birthdayPickerOpen, setBirthdayPickerOpen] = useState<boolean>(false);
  const [birthdayTimePickerOpen, setBirthdayTimePickerOpen] =
    useState<boolean>(false);
  const [installedDatePickerOpen, setInstalledDatePickerOpen] =
    useState<boolean>(false);
  const [installedDateTimePickerOpen, setInstalledDateTimePickerOpen] =
    useState<boolean>(false);
  const [registerSegmentDialogOpen, setRegisterSegmentDialogOpen] =
    useState<boolean>(false);

  const onPressRegister = () => {
    const segments = {
      genre: genre,
      day: day,
      age: age,
      registered: registered,
      birthday: birthday,
      installedDate: installedDate,
    };
    const richflyer = new RichFlyer();
    richflyer
      .registerSegments(segments)
      .then((result) => {
        console.log(`${LOG_MESSAGE.RESULT}${result}`);
        setRegisterSegmentResult(result);
        showRegisterSegmentDialog();
      })
      .catch((error) => {
        console.log(`${LOG_MESSAGE.ERROR}${error}`);
        setRegisterSegmentResult(false);
        showRegisterSegmentDialog();
      });
  };

  const showBirthdayPicker = () => setBirthdayPickerOpen(true);
  const hideBirthdayPicker = () => setBirthdayPickerOpen(false);

  const showBirthdayTimePicker = () => setBirthdayTimePickerOpen(true);
  const hideBirthdayTimePicker = () => setBirthdayTimePickerOpen(false);

  const showRegisterSegmentDialog = () => setRegisterSegmentDialogOpen(true);
  const hideRegisterSegmentDialog = () => setRegisterSegmentDialogOpen(false);

  const selectBirthday = (date: Date) => {
    setBirthday(date);
    hideBirthdayPicker();
  };

  const selectBirthdayTime = (date: Date) => {
    setBirthday(date);
    hideBirthdayTimePicker();
  };

  const showInstalledDatePicker = () => setInstalledDatePickerOpen(true);
  const hideInstalledDatePicker = () => setInstalledDatePickerOpen(false);

  const showInstalledDateTimePicker = () =>
    setInstalledDateTimePickerOpen(true);
  const hideInstalledDateTimePicker = () =>
    setInstalledDateTimePickerOpen(false);

  const selectInstalledDate = (date: Date) => {
    setInstalledDate(date);
    hideInstalledDatePicker();
  };

  const selectInstalledDateTime = (date: Date) => {
    setInstalledDate(date);
    hideInstalledDateTimePicker();
  };

  const formatSegmentDate = (date: Date) => {
    return moment(date).format(MOMENT_FORMAT.YEAR_MONTH_DAY_HOUR_MIN);
  };

  const styles = StyleSheet.create({
    segmentInputContainer: {
      marginBottom: 20,
    },
    registerButton: {
      width: 80,
      height: 80,
      borderRadius: 50,
      backgroundColor: '#555',
      marginVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
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
    registerButtonView: {
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
              title={SEGMENTS.KEY.GENRE}
              children={
                <View style={styles.pickerSelectView}>
                  <RNPickerSelect
                    itemKey={SEGMENTS.KEY.GENRE}
                    placeholder={PICKER_SELECT_ITEMS.PLACEHOLDER}
                    style={pickerSelectStyles}
                    value={genre}
                    onValueChange={(value) => setGenre(value)}
                    items={PICKER_SELECT_ITEMS.GENRE}
                  />
                </View>
              }
            />
            <Section
              title={SEGMENTS.KEY.DAY}
              children={
                <View style={styles.pickerSelectView}>
                  <RNPickerSelect
                    itemKey={SEGMENTS.KEY.DAY}
                    placeholder={PICKER_SELECT_ITEMS.PLACEHOLDER}
                    style={pickerSelectStyles}
                    value={day}
                    onValueChange={(value) => setDay(value)}
                    items={PICKER_SELECT_ITEMS.DAY}
                  />
                </View>
              }
            />
            <Section
              title={SEGMENTS.KEY.AGE}
              children={
                <View style={styles.pickerSelectView}>
                  <RNPickerSelect
                    itemKey={SEGMENTS.KEY.AGE}
                    placeholder={PICKER_SELECT_ITEMS.PLACEHOLDER}
                    style={pickerSelectStyles}
                    value={age}
                    onValueChange={(value) => setAge(value)}
                    items={PICKER_SELECT_ITEMS.AGE}
                  />
                </View>
              }
            />
            <Section
              title={SEGMENTS.KEY.REGISTERED}
              children={
                <View style={styles.pickerSelectView}>
                  <RNPickerSelect
                    itemKey={SEGMENTS.KEY.REGISTERED}
                    placeholder={PICKER_SELECT_ITEMS.PLACEHOLDER}
                    style={pickerSelectStyles}
                    value={registered ? SEGMENTS.VALUE.YES : SEGMENTS.VALUE.NO}
                    onValueChange={(value) =>
                      setRegistered(value === SEGMENTS.VALUE.YES ? true : false)
                    }
                    items={PICKER_SELECT_ITEMS.REGISTERED}
                  />
                </View>
              }
            />
            <Section
              title={SEGMENTS.KEY.BIRTHDAY}
              children={
                <View style={styles.pickerSelectView}>
                  <View style={styles.date}>
                    <Text style={styles.dateText}>
                      {formatSegmentDate(birthday)}
                    </Text>
                    <View style={styles.editButton}>
                      <Text
                        style={{ color: Colors.white }}
                        onPress={showBirthdayPicker}
                      >
                        {SEGMENTS.BUTTON.EDIT_DATE}
                      </Text>
                    </View>
                    <View style={styles.editButton}>
                      <Text
                        style={{ color: Colors.white }}
                        onPress={showBirthdayTimePicker}
                      >
                        {SEGMENTS.BUTTON.EDIT_TIME}
                      </Text>
                    </View>
                    <DateTimePickerModal
                      mode={SEGMENTS.PICKER_PROP_VALUE.DATE}
                      display={SEGMENTS.PICKER_PROP_VALUE.CALENDAR}
                      date={birthday}
                      isVisible={birthdayPickerOpen}
                      onConfirm={selectBirthday}
                      onCancel={hideBirthdayPicker}
                    />
                    <DateTimePickerModal
                      mode={SEGMENTS.PICKER_PROP_VALUE.TIME}
                      date={birthday}
                      isVisible={birthdayTimePickerOpen}
                      onConfirm={selectBirthdayTime}
                      onCancel={hideBirthdayTimePicker}
                    />
                  </View>
                </View>
              }
            />
            <Section
              title={SEGMENTS.KEY.INSTALLED_DATE}
              children={
                <View style={styles.pickerSelectView}>
                  <View style={styles.date}>
                    <Text style={styles.dateText}>
                      {formatSegmentDate(installedDate)}
                    </Text>
                    <View style={styles.editButton}>
                      <Text
                        style={{ color: Colors.white }}
                        onPress={showInstalledDatePicker}
                      >
                        {SEGMENTS.BUTTON.EDIT_DATE}
                      </Text>
                    </View>
                    <View style={styles.editButton}>
                      <Text
                        style={{ color: Colors.white }}
                        onPress={showInstalledDateTimePicker}
                      >
                        {SEGMENTS.BUTTON.EDIT_TIME}
                      </Text>
                    </View>
                    <DateTimePickerModal
                      mode={SEGMENTS.PICKER_PROP_VALUE.DATE}
                      display={SEGMENTS.PICKER_PROP_VALUE.CALENDAR}
                      date={installedDate}
                      isVisible={installedDatePickerOpen}
                      onConfirm={selectInstalledDate}
                      onCancel={hideInstalledDatePicker}
                    />
                    <DateTimePickerModal
                      mode={SEGMENTS.PICKER_PROP_VALUE.TIME}
                      date={installedDate}
                      isVisible={installedDateTimePickerOpen}
                      onConfirm={selectInstalledDateTime}
                      onCancel={hideInstalledDateTimePicker}
                    />
                  </View>
                </View>
              }
            />
            <View style={styles.registerButtonView}>
              <View style={styles.registerButton}>
                <Text onPress={onPressRegister} style={{ color: Colors.white }}>
                  {SEGMENTS.BUTTON.REGISTER}
                </Text>
              </View>
            </View>
            <Portal>
              <Dialog
                visible={registerSegmentDialogOpen}
                onDismiss={hideRegisterSegmentDialog}
              >
                <Dialog.Title>{SEGMENTS.DIALOG_MESSAGE.REGISTER}</Dialog.Title>
                <Dialog.Content>
                  <Text>
                    {registerSegmentResult
                      ? `${SEGMENTS.KEY.GENRE}: ${genre}\n${
                          SEGMENTS.KEY.DAY
                        }: ${day}\n${SEGMENTS.KEY.AGE}: ${age}\n${
                          SEGMENTS.KEY.REGISTERED
                        }: ${registered}\n${SEGMENTS.KEY.BIRTHDAY}: ${moment(
                          birthday
                        ).format(MOMENT_FORMAT.YEAR_MONTH_DAY_HOUR_MIN)}\n${
                          SEGMENTS.KEY.INSTALLED_DATE
                        }: ${moment(installedDate).format(
                          MOMENT_FORMAT.YEAR_MONTH_DAY_HOUR_MIN
                        )}\n${SEGMENTS.DIALOG_MESSAGE.SUCCESS_REGISTER}`
                      : SEGMENTS.DIALOG_MESSAGE.FAILED_REGISTER}
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={hideRegisterSegmentDialog}>
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    minWidth: 300,
    marginTop: 10,
    fontSize: 16,
    color: Colors.white,
  },
  inputAndroid: {
    minWidth: 300,
    marginTop: 10,
    fontSize: 16,
    color: Colors.white,
  },
});
