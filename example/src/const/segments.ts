export const SEGMENTS = {
  KEY: {
    GENRE: 'genre',
    DAY: 'day',
    AGE: 'age',
    REGISTERED: 'registerd',
    BIRTHDAY: 'birthday',
    INSTALLED_DATE: 'installedDate',
  },
  VALUE: {
    YES: 'YES',
    NO: 'NO',
  },
  BUTTON: {
    EDIT_DATE: 'EditDate',
    EDIT_TIME: 'EditTime',
    REGISTER: '登録',
    OK: 'OK',
  },
  DIALOG_MESSAGE: {
    REGISTER: 'Segmentの登録',
    SUCCESS_REGISTER: '以上の内容でSegmentを登録しました。',
    FAILED_REGISTER: 'Segmentの登録に失敗しました。',
  },
  PICKER_PROP_VALUE: {
    DATE: 'date',
    CALENDAR: 'calendar',
    TIME: 'time',
  },
} as const;
