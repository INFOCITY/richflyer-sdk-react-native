#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <RCTRichFlyerAppDelegateBridge.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"RichFlyerApp";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  [RFApp setRFNotificationDelegate:self];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// A notification tap that cold-launches the app is delivered here (this is
// the RFNotificationDelegate registered at app launch, before JS has run
// and react-native-richflyer's own module has registered itself). Forward
// it to react-native-richflyer so it's still delivered to JS once ready,
// instead of being silently dropped.
- (void)didReceiveNotificationWithCenter:(UNUserNotificationCenter *)center
                                 response:(UNNotificationResponse *)response
                    withCompletionHandler:(void (^)(void))completionHandler
{
  [RCTRichFlyerAppDelegateBridge appDelegateDidReceiveNotificationWithCenter:center
                                                                     response:response
                                                        withCompletionHandler:completionHandler];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RFApp registDevice:deviceToken completion:^(RFResult * _Nonnull result) {
    NSLog(@"register device result:%@", result.result?@"success": @"failed");
  }];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
