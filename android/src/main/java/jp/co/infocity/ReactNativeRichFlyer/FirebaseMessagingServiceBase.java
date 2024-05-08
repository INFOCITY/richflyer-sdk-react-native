package jp.co.infocity.ReactNativeRichFlyer;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;
import jp.co.infocity.richflyer.RFSendPushInformation;
import jp.co.infocity.richflyer.RichFlyer;
import jp.co.infocity.richflyer.RichFlyerResultListener;
import jp.co.infocity.richflyer.util.RFResult;


public class FirebaseMessagingServiceBase extends FirebaseMessagingService{

    // メッセージの取得
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        // 通知受信時に通知バーに表示するアイコンを設定
        int notificationIcon = getApplicationContext().getResources().getIdentifier("rf_notification", "mipmap", getApplicationContext().getPackageName());
        RFSendPushInformation spi = new RFSendPushInformation(getApplicationContext(), notificationIcon);
        Map<String, String> data = remoteMessage.getData();
        // 通知ドロワーに受信したプッシュ通知を表示する
        if (spi.isRichFlyerNotification(data)) {
            // RichFlyerからの通知を表示する。
            spi.setPushData(data);
        }
    }

    // デバイストークンを管理する
    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        // デバイストークンを管理サーバに通知する
        RichFlyer richFlyer = new RichFlyer(getApplicationContext());
        richFlyer.tokenRefresh(token, new RichFlyerResultListener() {
            @Override
            public void onCompleted(RFResult result) {
            }
        });
    }
}
