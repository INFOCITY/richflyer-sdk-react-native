#import <UserNotifications/UserNotifications.h>

// Import this header (not RCTRichFlyer.h) from your AppDelegate. RCTRichFlyer.h
// pulls in the New Architecture codegen spec header (RNRichflyerSpec.h), which
// is only on the header search path for this pod's own target, not the app
// target -- importing it directly from AppDelegate.mm fails to compile under
// the New Architecture. This header only depends on UserNotifications, so it's
// always safely importable from the app target regardless of architecture.
@interface RCTRichFlyerAppDelegateBridge : NSObject

// Call this from your AppDelegate's own RFNotificationDelegate
// implementation (didReceiveNotificationWithCenter:response:withCompletionHandler:).
// AppDelegate registers as RFNotificationDelegate before JS has loaded, so a
// notification tap that cold-launches the app is delivered there first --
// before RCTRichFlyer exists to receive it via its own registration in
// initialize(). If that module is already up and listening, the event is
// forwarded to JS immediately; otherwise it's held and replayed as soon as
// JS subscribes to it (see addOpenNotificationListener).
+ (void)appDelegateDidReceiveNotificationWithCenter:(nonnull UNUserNotificationCenter *)center
                                            response:(nonnull UNNotificationResponse *)response
                              withCompletionHandler:(nonnull void (^)(void))completionHandler;

@end
