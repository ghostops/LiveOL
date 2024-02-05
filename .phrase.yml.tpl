phrase:
  access_token: X
  project_id: 77f4490b1101313ac9f39abddea53d9e
  push:
    sources:
    - file: ./App/assets/locales/en.json
      params:
        update_translations: true
        autotranslate: true
        locale_id: a61cd4f3dde450679d5ffd38e3d50613
        file_format: nested_json
  pull:
    targets:
    - file: "./App/assets/locales/<locale_name>.json"
      params:
        file_format: nested_json
