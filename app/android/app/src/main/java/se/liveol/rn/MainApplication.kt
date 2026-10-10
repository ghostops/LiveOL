package se.liveol.rn

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.facebook.react.soloader.OpenSourceMergedSoMapping


import com.bugsnag.android.Bugsnag

class MainApplication : Application(), ReactApplication {
  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }
  override fun onCreate() {
    super.onCreate()
    Bugsnag.start(this)
    createNotificationChannels()
    loadReactNative(this)
  }

  // Ids must match androidChannelId() in server/src/jobs/push/send-push.ts
  private fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java) ?: return
    listOf(
      "results_finish" to R.string.notification_channel_finish,
      "results_split" to R.string.notification_channel_split,
      "results_start" to R.string.notification_channel_start,
      "results_status" to R.string.notification_channel_status,
      "results_placeChange" to R.string.notification_channel_place,
    ).forEach { (id, name) ->
      manager.createNotificationChannel(
        NotificationChannel(id, getString(name), NotificationManager.IMPORTANCE_HIGH),
      )
    }
  }
}