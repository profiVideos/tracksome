package com.tracksome;

import android.app.Application;

import com.facebook.react.ReactApplication;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.firestore.RNFirebaseFirestorePackage;
import io.realm.react.RealmReactPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactnativenavigation.NavigationApplication;
import com.oblador.vectoricons.VectorIconsPackage;
import cl.json.RNSharePackage;
import cl.json.ShareApplication;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication implements ShareApplication {

  @Override
  public boolean isDebug() {
     // Make sure you are using BuildConfig from your own application
     return BuildConfig.DEBUG;
  }

  @Override
  public String getFileProviderAuthority() {
     // ... 03.22.2018 - MG - Added for react native share ...
     //return "${applicationId}.provider";
     return "com.tracksome.provider";
  }

  protected List<ReactPackage> getPackages() {
     // Add additional packages you require here
     // No need to add RnnPackage and MainReactPackage
     // Since we're using React Native Navigation
     return Arrays.<ReactPackage>asList(
        // ... above says we don't need this - new MainReactPackage(),
        new VectorIconsPackage(),
        new PickerPackage(),
        new RNSharePackage(),
        new RealmReactPackage(),
        new RNFirebasePackage(),
        new RNFirebaseAuthPackage(),
        new RNFirebaseFirestorePackage()
     );
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
     return getPackages();
  }

  @Override
  public String getJSMainModuleName() {
      return "index";
  }
  
}

/*
public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNFirebasePackage(),
            new RealmReactPackage(),
            new PickerPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, false);
  }

}
*/
