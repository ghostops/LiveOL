package se.liveol.rn

import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.uimanager.ViewManager

/**
 * Android does not display FCM notifications while the app is in the
 * foreground, so JS posts them here. A tap opens MainActivity with a
 * liveol-push:// URI that JS reads through Linking.
 *
 * Experimental: if this causes problems, remove it and the toast fallback in
 * src/lib/push/foreground.ts takes over.
 */
class ForegroundNotificationModule(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  override fun getName() = "LiveOLForegroundNotification"

  @ReactMethod
  fun show(title: String, body: String?, channelId: String, tag: String?, data: ReadableMap) {
    val context = reactApplicationContext
    val manager = NotificationManagerCompat.from(context)
    if (!manager.areNotificationsEnabled()) return

    val uri = Uri.Builder().scheme("liveol-push").authority("open").apply {
      val iterator = data.keySetIterator()
      while (iterator.hasNextKey()) {
        val key = iterator.nextKey()
        if (data.getType(key) == ReadableType.String) {
          data.getString(key)?.let { appendQueryParameter(key, it) }
        }
      }
    }.build()

    val intent = Intent(Intent.ACTION_VIEW, uri, context, MainActivity::class.java)
      .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
    val requestCode = (tag ?: uri.toString()).hashCode()
    val pendingIntent = PendingIntent.getActivity(
      context,
      requestCode,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val notification = NotificationCompat.Builder(context, channelId)
      .setSmallIcon(R.drawable.ic_notification)
      .setContentTitle(title)
      .setContentText(body)
      .setStyle(NotificationCompat.BigTextStyle().bigText(body))
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setAutoCancel(true)
      .setContentIntent(pendingIntent)
      .build()

    try {
      // Same tag as the FCM payload, so a newer update replaces the older one
      manager.notify(tag, 0, notification)
    } catch (e: SecurityException) {
      // POST_NOTIFICATIONS revoked between the check and the post
    }
  }
}

class ForegroundNotificationPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> =
    listOf(ForegroundNotificationModule(context))

  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> =
    emptyList()
}
