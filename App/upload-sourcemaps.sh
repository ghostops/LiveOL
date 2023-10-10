API_KEY=01177ad57df730f5ba96d55a8112b3fa
APP_VERSION=$(jq -r .version package.json)

echo "App Version:"
echo $APP_VERSION
echo ""

echo "Uploading Android..."
npx bugsnag-source-maps upload-react-native \
  --api-key $API_KEY \
  --app-version $APP_VERSION \
  --platform android \
  --source-map android/app/build/generated/sourcemaps/react/release/index.android.bundle.map \
  --bundle android/app/build/generated/assets/react/release/index.android.bundle