import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const bannerAdUnitId = __DEV__ 
  ? TestIds.BANNER 
  : 'ca-app-pub-2990397099587279/9648439040';

export default function BannerAdComponent_Home() {
  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => console.error('Banner failed: ', error)}
      />
    </View>
  );
}