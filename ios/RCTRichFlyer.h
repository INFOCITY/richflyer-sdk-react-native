#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <RichFlyer/RichFlyer.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNRichflyerSpec.h"

@interface RCTRichFlyer : RCTEventEmitter <NativeRichflyerSpec, RFNotificationDelegate, UIApplicationDelegate>
#else
@interface RCTRichFlyer : RCTEventEmitter <RCTBridgeModule, RFNotificationDelegate, UIApplicationDelegate>
#endif

// Called from RCTRichFlyerAppDelegateBridge (see RCTRichFlyerAppDelegateBridge.h)
// -- AppDelegate should import that lightweight header instead of this one, since
// this header pulls in the New Architecture codegen spec, which isn't on the app
// target's header search path.
+ (void)appDelegateDidReceiveNotificationWithCenter:(nonnull UNUserNotificationCenter *)center
                                            response:(nonnull UNNotificationResponse *)response
                              withCompletionHandler:(nonnull void (^)(void))completionHandler;

@end
