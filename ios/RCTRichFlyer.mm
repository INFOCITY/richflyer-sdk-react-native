#import "RCTRichFlyer.h"
#import <React/RCTLog.h>
#import <RichFlyer/RichFlyer.h>

NSString* const foregroundNotificationSettingsKey = @"RFForegroundNotificationSettings";

@implementation RCTRichFlyer
RCT_EXPORT_MODULE()

// Example method
// See // https://reactnative.dev/docs/native-modules-ios
RCT_EXPORT_METHOD(multiply:(double)a
                  b:(double)b
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSNumber *result = @(a * b);

    resolve(result);
}

RCT_EXPORT_METHOD(initialize:(NSDictionary*)settings resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject)
{
    NSNumber* result = [NSNumber numberWithBool:YES];
    RCTLogInfo(@"initialize richflyer...");
  
  NSString* serviceKey = settings[@"serviceKey"];
  NSString* groupId = settings[@"groupId"];
  NSNumber* sandbox = settings[@"sandbox"];
  NSDictionary* prompt = settings[@"prompt"];
  NSArray* launchMode = settings[@"launchMode"];

  [RFApp setServiceKey:serviceKey appGroupId:groupId sandbox:[sandbox boolValue]];
  [RFApp setRFNotificationDelegate:self];
  
  int rfLaunchMode = RFLaunchModeNone;
  for (NSString* mode in launchMode) {
    if ([mode isEqual:@"Text"]) {
      rfLaunchMode |= RFLaunchModeText;
    }
    if ([mode isEqual:@"Image"]) {
      rfLaunchMode |= RFLaunchModeImage;
    }
    if ([mode isEqual:@"Gif"]) {
      rfLaunchMode |= RFLaunchModeGif;
    }
    if ([mode isEqual:@"Movie"]) {
      rfLaunchMode |= RFLaunchModeMovie;
    }
  }
  [RFApp setLaunchMode:rfLaunchMode];

  // OSにプッシュ通知の受信許可をリクエスト
  dispatch_async(dispatch_get_main_queue(),
                 ^{
    if (prompt) {
      NSString* title = prompt[@"title"];
      NSString* message = prompt[@"message"];
      NSString* image = prompt[@"image"];
      RFAlertController* alert = [[RFAlertController alloc] initWithApplication:[UIApplication sharedApplication]
                                                                          title:title ? title : @""
                                                                        message:message ? message: @""];
      if (image) {
        [alert addImage:image];
      }
      
      [alert present:^{
        [RFApp requestAuthorization:[UIApplication sharedApplication]
                                   applicationDelegate:[UIApplication sharedApplication].delegate];
      }];
    } else {
      [RFApp requestAuthorization:[UIApplication sharedApplication]
                                  applicationDelegate:[UIApplication sharedApplication].delegate];
    }
    resolve(result);
  });
}

RCT_EXPORT_METHOD(registerSegments:(NSDictionary*)stringSegments
                  intSegments:(NSDictionary*)intSegments
                  boolSegments:(NSDictionary*)boolSegments
                  dateSegments:(NSDictionary*)dateSegments
                  resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject)
{
  
  NSMutableDictionary* rnDateSegments = [NSMutableDictionary dictionary];
  if (dateSegments) {
    for (NSString* key in [dateSegments allKeys] ) {
      NSNumber* dateEpocMilli = [dateSegments objectForKey:key];
      NSDate* date = [NSDate dateWithTimeIntervalSince1970:[dateEpocMilli longLongValue]/1000];
      [rnDateSegments setObject:date forKey:key];
    }
  }
  
  [RFApp registSegments:stringSegments
            intSegments:intSegments
           boolSegments:boolSegments
           dateSegments:rnDateSegments
             completion:^(RFResult * _Nonnull result) {
    if (result.result) {
      resolve([NSNumber numberWithBool:result.result]);
    } else {
      reject([NSString stringWithFormat:@"%ld", result.code], result.message, nil);
    }
  }];
}

RCT_EXPORT_METHOD(getSegments:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject)
{
  NSDictionary* segments = [RFApp getSegments];
  resolve(segments);
}

RCT_EXPORT_METHOD(getReceivedNotifications:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSArray<RFContent*>* histories = [RFApp getReceivedData];

  NSMutableArray* rnHistories = [NSMutableArray array];
  for (RFContent* content in histories) {
    
    NSMutableArray* buttons = [NSMutableArray array];
    if (content.actionButtons && content.actionButtons.count > 0) {
      for (RFAction* action in content.actionButtons) {
        NSString* title = [action getTitle];
        NSString* type = [action getType];
        NSString* value = [action getValue];
        NSDictionary* button = @{
          @"title" : title ? title : @"",
          @"type" : type ? type : @"",
          @"value" : value ? value : @"",
          @"index" : [NSNumber numberWithUnsignedLong:[action getIndex]]
        };
        [buttons addObject:button];
      }
    }
    
    NSDictionary* rnContent = @{
      @"title" : content.title ? content.title : @"",
      @"body" : content.body ? content.body : @"",
      @"notificationId" : content.notificationId ? content.notificationId : @"",
      @"imagePath" : content.imagePath ? [content.imagePath absoluteString] : @"",
      @"receivedDate" : [NSNumber numberWithLong:[content.receivedDate timeIntervalSince1970]],
      @"notificationDate" : [NSNumber numberWithLong:[content.notificationDate timeIntervalSince1970]],
      @"actionButtons" : buttons
    };
    [rnHistories addObject:rnContent];
  }
  
  
  resolve(rnHistories);
}

RCT_EXPORT_METHOD(getLatestReceivedNotification:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  RFContent* content = [RFApp getLatestReceivedData];
  if (!content) {
    reject(@"910", @"No received notification.", nil);
    return;
  }
  
  NSMutableArray* buttons = [NSMutableArray array];
  if (content.actionButtons && content.actionButtons.count > 0) {
    for (RFAction* action in content.actionButtons) {
      NSDictionary* button = @{
        @"title" : [action getTitle] ? [action getTitle] : @"",
        @"type" : [action getType],
        @"value" : [action getValue] ? [action getValue] : @"",
        @"index" : [NSNumber numberWithUnsignedLong:[action getIndex]]
      };
      [buttons addObject:button];
    }
  }
  
  NSDictionary* rnContent = @{
    @"title" : content.title,
    @"body" : content.body,
    @"notificationId" : content.notificationId,
    @"imagePath" : content.imagePath ? content.imagePath : @"",
    @"receivedDate" : [NSNumber numberWithLong:[content.receivedDate timeIntervalSince1970]],
    @"notificationDate" : [NSNumber numberWithLong:[content.notificationDate timeIntervalSince1970]],
    @"type" : [NSNumber numberWithUnsignedInteger:content.type],
    @"actionButtons" : buttons
  };
  resolve(rnContent);

}

RCT_EXPORT_METHOD(showReceivedNotification:(NSString*)notificationId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSArray<RFContent*>* histories = [RFApp getReceivedData];
  RFContent* displayContent;
  for (RFContent* content in histories) {
    if ([content.notificationId isEqualToString:notificationId]) {
      displayContent = content;
      break;
    }
  }
  
  if (!displayContent) {
    reject(@"900", @"Display content not found.", nil);
    return;
  }
  
  dispatch_async(dispatch_get_main_queue(),^{
    RFContentDisplay* rfDisplay = [[RFContentDisplay alloc] initWithContent:displayContent];
    
    //        guard let window = UIApplication.shared.windows.first else { return }
    //guard let rootVC = window.rootViewController else { return }
    
    UIWindow* window = UIApplication.sharedApplication.windows.firstObject;
    UIViewController* rootViewController = window.rootViewController;
    
    if (rootViewController) {
      [rfDisplay present:rootViewController completeHandler:^(RFAction* action) {

        NSMutableDictionary* param = [NSMutableDictionary dictionary];
        if (action) {
          param[@"title"] = [action getTitle];
          param[@"type"] = [action getType];
          param[@"value"] = [action getValue];
        }
        
        [rfDisplay dismiss];
        
        // JSにイベントを送信
        [self sendEventWithName:@"RFOpenNotification" body:param];

      }];
      resolve([NSNumber numberWithBool:YES]);
    } else {
      reject(@"900", @"RootViewController not found.", nil);
    }
  });
}

RCT_EXPORT_METHOD(resetBadgeNumber:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(),^{
    [RFApp resetBadgeNumber:UIApplication.sharedApplication];
    resolve([NSNumber numberWithBool:YES]);
  });
}

RCT_EXPORT_METHOD(setForegroundNotification:(BOOL)badge
                  alert:(BOOL)alert
                  sound:(BOOL)sound
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSDictionary* foregroundSettings = @{
    @"badge" : [NSNumber numberWithBool:badge],
    @"alert" : [NSNumber numberWithBool:alert],
    @"sound" : [NSNumber numberWithBool:sound]
  };
  
  NSUserDefaults* userDefaults = [NSUserDefaults standardUserDefaults];
  [userDefaults setObject:foregroundSettings forKey:foregroundNotificationSettingsKey];
  [userDefaults synchronize];
  
  resolve([NSNumber numberWithBool:YES]);
}

RCT_EXPORT_METHOD(postMessage:(NSArray*)events
                  variables:(NSDictionary*)variables
                  standbyTime:(nonnull NSNumber*)standbyTime
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSNumber *rfStandbyTime = nil;
    if ([standbyTime intValue] >= 0) {
        rfStandbyTime = standbyTime;
    }
    [RFApp postMessage:events variables:variables standbyTime:rfStandbyTime 
        completion:^(RFResult * _Nonnull result, NSArray<NSString *> * _Nonnull eventPostIds) {
    if (result.result) {
      resolve(eventPostIds);
    } else {
      reject([NSString stringWithFormat:@"%ld", result.code], result.message, nil);
    }
  }];
}

RCT_EXPORT_METHOD(cancelPosting:(NSString*)eventPostId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [RFApp cancelPosting:eventPostId completion:^(RFResult * _Nonnull result) {
    if (result.result) {
      resolve([NSString stringWithFormat:@"%ld", result.code]);
    } else {
      reject([NSString stringWithFormat:@"%ld", result.code], result.message, nil);
    }
  }];
}


#pragma mark - RFNotificationDelegate
- (void)didReceiveNotificationWithCenter:(UNUserNotificationCenter *)center response:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler {

  if (![RFApp isRichFlyerNotification:response.notification.request.content.userInfo]) {
    return;
  }
  
  [RFApp didReceiveNotification:response handler:^(RFAction *action, NSString* extendedProperty) {
    
    NSString* notificationId = RFLastNotificationInfo.identifier;
        
    NSMutableDictionary* param = [NSMutableDictionary dictionary];
    param[@"notificationId"] = notificationId;
    
    if (action) {
      param[@"title"] = [action getTitle];
      param[@"type"] = [action getType];
      param[@"value"] = [action getValue];
    }
    
    if (extendedProperty) {
      param[@"extendedProperty"] = extendedProperty;
    }

    // JSにイベントを送信
    [self sendEventWithName:@"RFOpenNotification" body:param];
    
  }];
  
  completionHandler();
}

- (void)willPresentNotificationWithCenter:(UNUserNotificationCenter *)center notification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  NSUserDefaults* userDefaults = [NSUserDefaults standardUserDefaults];
  
  NSDictionary* settings = [userDefaults objectForKey:foregroundNotificationSettingsKey];

  UNNotificationPresentationOptions options = 0;
  if ([[settings objectForKey:@"badge"] boolValue]) {
    options |= UNNotificationPresentationOptionBadge;
  }
  if ([[settings objectForKey:@"alert"] boolValue]) {
    if (@available(iOS 14.0, *)) {
      options |= (UNNotificationPresentationOptionBanner|UNNotificationPresentationOptionList);
    } else {
      options |= UNNotificationPresentationOptionAlert;
    }
  }
  if ([[settings objectForKey:@"sound"] boolValue]) {
    options |= UNNotificationPresentationOptionSound;
  }
  
  if (options) {
    [RFApp willPresentNotification:options completionHandler:completionHandler];
  }
}

#pragma mark - RCTEventEmitter
- (NSArray<NSString *> *)supportedEvents {
  return @[@"RFOpenNotification"];
}

@end
