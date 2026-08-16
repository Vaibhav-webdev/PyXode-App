import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const bannerAdUnitId = __DEV__ 
  ? TestIds.BANNER 
  : 'ca-app-pub-2990397099587279/8039843909';

export default function BannerAdComponent_CodeRunner() {
  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => console.error('Banner failed: ', error)}
      />
    </View>
  );
}