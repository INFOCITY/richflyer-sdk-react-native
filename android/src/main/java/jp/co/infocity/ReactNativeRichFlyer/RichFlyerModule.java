package jp.co.infocity.ReactNativeRichFlyer;


import android.app.Activity;
import android.content.Intent;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.FirebaseMessaging;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import jp.co.infocity.richflyer.RichFlyer;
import jp.co.infocity.richflyer.RichFlyerResultListener;
import jp.co.infocity.richflyer.RichFlyerPostingResultListener;
import jp.co.infocity.richflyer.action.RFAction;
import jp.co.infocity.richflyer.action.RFActionListener;
import jp.co.infocity.richflyer.history.ActionButton;
import jp.co.infocity.richflyer.history.RFContent;
import jp.co.infocity.richflyer.util.RFResult;

@ReactModule(name = RichFlyerModule.NAME)
public class RichFlyerModule extends ReactContextBaseJavaModule {
  public static final String NAME = "RichFlyer";

  public RichFlyerModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }


  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  public void multiply(double a, double b, Promise promise) {
    promise.resolve(a * b);
  }

  @ReactMethod
  public void initialize(ReadableMap readableMap, Promise promise) {
    boolean result = true;
    // RichFlyerの管理サイトで発行されたSDK実行キー
    final String serviceKey = readableMap.getString("serviceKey");

    // 通知ダイアログのテーマカラー(RGB)
    final String themeColor = readableMap.getString("themeColor");

    final ReadableArray launchMode =readableMap.getArray("launchMode");
    final ArrayList<String> rfLaunchMode = new ArrayList<>();
    for (int i = 0; i < launchMode.size(); i++) {
      String mode = launchMode.getString(i);
      if (mode.equals("Text")) {
        rfLaunchMode.add(RichFlyer.TypeText);
      }
      if (mode.equals("Image")) {
        rfLaunchMode.add(RichFlyer.TypeImage);
      }
      if (mode.equals("Gif")) {
        rfLaunchMode.add(RichFlyer.TypeGif);
      }
      if (mode.equals("Movie")) {
        rfLaunchMode.add(RichFlyer.TypeMovie);
      }
    }


    // 通知から起動した時に呼ばれるアクティビティ
    //final Class targetActivity = MainActivity.class;
    final Class targetActivity = getCurrentActivity().getClass();
    RichFlyer.checkNotificationPermission(getCurrentActivity());

    this.addLifeCycleEventListener();

    FirebaseMessaging.getInstance().getToken().addOnCompleteListener(task -> {
        String deviceToken = task.getResult();

        RichFlyer richFlyer = new RichFlyer(getReactApplicationContext(), deviceToken, serviceKey,
          themeColor, targetActivity);
        richFlyer.startSetting(new RichFlyerResultListener() {
          @Override
          public void onCompleted(RFResult result) {
            if (result.isResult()) {
              RichFlyer.setLaunchMode(getReactApplicationContext(), rfLaunchMode.toArray(new String[rfLaunchMode.size()]));
              promise.resolve(String.valueOf(result.getErrorCode()));
            } else {
              promise.reject(String.valueOf(result.getErrorCode()), result.getMessage());
            }
          }
        });
      }
    );
  }

  @ReactMethod
  public void registerSegments(ReadableMap stringSegments,
                               ReadableMap intSegments,
                               ReadableMap booleanSegments,
                               ReadableMap dateSegments,
                               Promise promise) {

    HashMap<String, String> rfStringSegments = new HashMap<>();
    HashMap<String, Integer> rfIntSegments = new HashMap<>();
    HashMap<String, Date> rfDateSegments = new HashMap<>();
    HashMap<String, Boolean> rfBooleanSegments = new HashMap<>();

    if (stringSegments != null) {
      Iterator<Map.Entry<String, Object>> it = stringSegments.getEntryIterator();
      while (it.hasNext()) {
        Map.Entry<String, Object> entry = it.next();
        rfStringSegments.put(entry.getKey(), stringSegments.getString(entry.getKey()));
      }
    }

    if (intSegments != null) {
      Iterator<Map.Entry<String, Object>> it = intSegments.getEntryIterator();
      while (it.hasNext()) {
        Map.Entry<String, Object> entry = it.next();
        Double value = intSegments.getDouble(entry.getKey());

        rfIntSegments.put(entry.getKey(), value.intValue());
      }
    }

    if (booleanSegments != null) {
      Iterator<Map.Entry<String, Object>> it = booleanSegments.getEntryIterator();
      while (it.hasNext()) {
        Map.Entry<String, Object> entry = it.next();
        rfBooleanSegments.put(entry.getKey(), booleanSegments.getBoolean(entry.getKey()));
      }
    }

    if (dateSegments != null) {
      Iterator<Map.Entry<String, Object>> it = dateSegments.getEntryIterator();
      while (it.hasNext()) {
        Map.Entry<String, Object> entry = it.next();
        Double value = dateSegments.getDouble(entry.getKey());
        rfDateSegments.put(entry.getKey(), new Date(value.longValue()));
      }
    }


    RichFlyer.registerSegments(
      rfStringSegments, rfIntSegments, rfBooleanSegments, rfDateSegments,
      getReactApplicationContext(),
      new RichFlyerResultListener() {
        @Override
        public void onCompleted(RFResult result) {
          if (result.isResult()) {
            promise.resolve(String.valueOf(result.getErrorCode()));
          } else {
            promise.reject(String.valueOf(result.getErrorCode()), result.getMessage());
          }
        }
      });
  }

  @ReactMethod
  public void getSegments(Promise promise) {
    Map<String,String> segments = RichFlyer.getSegments(getReactApplicationContext());
    WritableNativeMap rnSegments = new WritableNativeMap();
    for (Map.Entry<String, String> entry: segments.entrySet()) {
      rnSegments.putString(entry.getKey(), entry.getValue());
    }
    promise.resolve(rnSegments);
  }

  @ReactMethod
  public void getReceivedNotifications(Promise promise) {
    ArrayList<RFContent> histories = RichFlyer.getHistory(getReactApplicationContext());

    WritableNativeArray rnHistories = new WritableNativeArray();
    if (histories == null) {
      promise.resolve(rnHistories);
      return;
    }

    for (RFContent history : histories) {
      WritableNativeArray rnButtons = new WritableNativeArray();
      ActionButton[] actionButtons = history.getActionButtonArray();
      if (actionButtons != null && actionButtons.length > 0) {
        for (ActionButton actionButton : actionButtons) {
          WritableNativeMap button = new WritableNativeMap();
          button.putString("title", actionButton.getLabel());
          button.putString("type", actionButton.getActionType());
          button.putString("value", actionButton.getAction());
          button.putDouble("index", actionButton.getIndex());
          rnButtons.pushMap(button);
        }
      }

      WritableNativeMap rnContent = new WritableNativeMap();
      rnContent.putString("title", history.getTitle());
      rnContent.putString("body", history.getMessage());
      rnContent.putString("notificationId", history.getNotificationId());
      rnContent.putString("imagePath", history.getImagePath());
      rnContent.putDouble("receivedDate", history.getReceivedDate());
      rnContent.putDouble("notificationDate", history.getNotificationDate());
      rnContent.putArray("actionButtons", rnButtons);

      rnHistories.pushMap(rnContent);
    }

    promise.resolve(rnHistories);
  }

  @ReactMethod
  public void getLatestReceivedNotification(Promise promise) {
    RFContent content = RichFlyer.getLatestNotification(getReactApplicationContext());

    if (content == null) {
      promise.reject("910", "No received notification.");
      return;
    }

   WritableNativeArray rnButtons = new WritableNativeArray();
    ActionButton[] actionButtons = content.getActionButtonArray();
    if (actionButtons != null && actionButtons.length > 0) {
      for (ActionButton actionButton : actionButtons) {
        WritableNativeMap button = new WritableNativeMap();
        button.putString("title", actionButton.getLabel());
        button.putString("type", actionButton.getActionType());
        button.putString("value", actionButton.getAction());
        button.putDouble("index", actionButton.getIndex());
        rnButtons.pushMap(button);
      }
    }

    WritableNativeMap rnContent = new WritableNativeMap();
    rnContent.putString("title", content.getTitle());
    rnContent.putString("body", content.getMessage());
    rnContent.putString("notificationId", content.getNotificationId());
    rnContent.putString("imagePath", content.getImagePath());
    rnContent.putDouble("receivedDate", content.getReceivedDate());
    rnContent.putDouble("notificationDate", content.getNotificationDate());
    rnContent.putDouble("type", content.getContentType());
    rnContent.putArray("actionButtons", rnButtons);

    promise.resolve(rnContent);
  }

  @ReactMethod
  public void showReceivedNotification(String notificationId, Promise promise) {

    ArrayList<RFContent> histories = RichFlyer.getHistory(getReactApplicationContext());
    RFContent displayContent = null;
    if (histories != null) {
      for (RFContent history : histories) {
        if (history.getNotificationId().equals(notificationId)) {
          displayContent = history;
          break;
        }
      }
    }

    if (displayContent == null) {
      promise.reject("900", "Display content not found.");
      return;
    }

    RichFlyer.showHistoryNotification(getReactApplicationContext(), displayContent.getNotificationId());
  }

  @ReactMethod
  public void resetBadgeNumber(Promise promise) {
    // iOS用のメソッドなので何もしない
    promise.resolve(true);
  }

  @ReactMethod
  public void setForegroundNotification(boolean badge, boolean alert, boolean sound, Promise promise) {
    // iOS用のメソッドなので何もしない
    promise.resolve(true);
  }

  private void addLifeCycleEventListener() {

    getReactApplicationContext().addActivityEventListener(new ActivityEventListener() {
      @Override
      public void onActivityResult(Activity activity, int i, int i1, @Nullable Intent intent) {
      }

      @Override
      public void onNewIntent(Intent intent) {
        openNotification(intent);
      }
    });

    getReactApplicationContext().addLifecycleEventListener(new LifecycleEventListener() {
      @Override
      public void onHostResume() {
        openNotification(getCurrentActivity().getIntent());
      }

      @Override
      public void onHostPause() {

      }

      @Override
      public void onHostDestroy() {

      }
    });
  }

  private void openNotification(Intent intent) {
    if (RichFlyer.richFlyerAction(intent)) {
      RichFlyer.parseAction(intent, new RFActionListener() {
        @Override
        public void onRFEventOnClickButton(@NonNull RFAction action, @NonNull String index) {

          WritableNativeMap rnAtion = new WritableNativeMap();
          rnAtion.putString("notificationId", action.notificationId);
          rnAtion.putString("title", action.actionTitle);
          rnAtion.putString("type", action.actionType);
          rnAtion.putString("value", action.actionValue);

          sendEvent(getReactApplicationContext(), "RFOpenNotification", rnAtion);

          intent.removeExtra("ActionId");
          intent.removeExtra("ExtendedProperty");
        }

        @Override
        public void onRFEventOnClickStartApplication(String notificationId, String extendedProperty, @NonNull String index) {
          WritableNativeMap rnAtion = new WritableNativeMap();
          rnAtion.putString("notificationId", notificationId);
          rnAtion.putString("extendedProperty", extendedProperty);

          sendEvent(getReactApplicationContext(), "RFOpenNotification", rnAtion);
        }
      });
    }

  }

  private int listenerCount = 0;


  @ReactMethod
  public void addListener(String eventName) {
    listenerCount += 1;
  }

  @ReactMethod
  public void removeListeners(Integer count) {
    listenerCount -= count;
  }
  private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
    if (listenerCount > 0) {
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }
  }

  @ReactMethod
  public void postMessage(ReadableArray events, ReadableMap variables, Integer standbyTime, Promise promise) {
    ArrayList<String> rfEvents = new ArrayList<>();
    HashMap<String, String> rfVariables = new HashMap<>();
    Integer rfStandbyTime = null;
    for (int i = 0; i < events.size(); i++) {
      rfEvents.add(events.getString(i));
    }
    if (variables != null) {
      Iterator<Map.Entry<String, Object>> it = variables.getEntryIterator();
      while (it.hasNext()) {
        Map.Entry<String, Object> entry = it.next();
        rfVariables.put(entry.getKey(), variables.getString(entry.getKey()));
      }
    }
    if (standbyTime >= 0) {
      rfStandbyTime = standbyTime;
    }
    RichFlyer.postMessage(rfEvents.toArray(new String[rfEvents.size()]), rfVariables, rfStandbyTime, getReactApplicationContext(), new RichFlyerPostingResultListener() {
        @Override
        public void onCompleted(RFResult result, String[] eventPostIds) {
          if (result.isResult()) {
              WritableNativeArray postIds = new WritableNativeArray();
              for (String postId: eventPostIds) {
                postIds.pushString(postId);
              }
              promise.resolve(postIds);
          } else {
              promise.reject(String.valueOf(result.getErrorCode()), result.getMessage());
          }
        }
    });
  }

  @ReactMethod
  public void cancelPosting(String eventPostId, Promise promise) {
    RichFlyer.cancelPosting(eventPostId, getReactApplicationContext(), new RichFlyerPostingResultListener() {
        @Override
        public void onCompleted(RFResult result, String[] eventPostIds) {
          if (result.isResult()) {
              promise.resolve(String.valueOf(result.getErrorCode()));
          } else {
              promise.reject(String.valueOf(result.getErrorCode()), result.getMessage());
          }
        }
    });
  }

}
