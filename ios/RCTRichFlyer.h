
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNRichflyerSpec.h"

@interface RCTRichFlyer : NSObject <NativeRichflyerSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <RichFlyer/RichFlyer.h>

@interface RCTRichFlyer : RCTEventEmitter <RCTBridgeModule, RFNotificationDelegate, UIApplicationDelegate>
#endif

@end
