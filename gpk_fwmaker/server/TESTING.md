# GPK FWMaker APIテスト実行ガイド

## 準備完了したもの

✅ **Vitest環境構築完了**
- Vitest、SuperTest、TypeScript型定義インストール済み
- vitest.config.ts設定完了
- テストディレクトリ構造作成済み

✅ **作成済みファイル**
```
server/
├── vitest.config.ts
├── tests/
│   ├── setup.ts
│   ├── helpers/
│   │   ├── test-server.ts
│   │   ├── test-client.ts
│   │   └── mock-data.ts
│   ├── unit/
│   │   └── vial2c.test.ts  ✅動作確認済み
│   └── api/
│       ├── basic.test.ts
│       ├── basic.mock.test.ts
│       ├── qmk.test.ts
│       └── vial.test.ts
```

✅ **NPMスクリプト追加済み**
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run", 
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:api": "vitest run tests/api",
    "test:unit": "vitest run tests/unit"
  }
}
```

## 動作確認済みテスト

### ✅ 単体テスト
```bash
npm run test:unit
```

**結果**: 全6テスト成功
- vial2c関数の基本動作
- レイアウト変換
- エラーハンドリング
- エイリアス解決

## 現在の課題と解決方法

### APIテストの課題

1. **QMKディレクトリ依存**: `/root/qmk_firmware`がテスト環境に存在しない
2. **ポート競合**: 本番サーバーとテストサーバーのポート競合
3. **外部コマンド実行**: 実際のgitコマンドが実行される

### 推奨解決アプローチ

#### オプション1: モック環境（推奨）
```bash
# 完全にモック化されたテスト
npm run test:unit  # ✅ 動作済み
```

#### オプション2: Docker環境でのAPIテスト
```bash
# Dockerコンテナ内でのテスト実行
docker compose exec gpk_fwmaker npm run test:api
```

#### オプション3: CI/CD統合テスト
- GitHub Actionsでの自動テスト
- QMK環境をセットアップしてからAPIテスト実行

## 手動APIテスト（推奨）

現在Dockerコンテナが動作しているため、手動でのAPIテストが最も確実：

```bash
# 基本動作確認
curl http://127.0.0.1:3123/

# QMKタグ取得
curl http://127.0.0.1:3123/tags/qmk

# ビルドテスト（注意：時間がかかります）
curl -X POST -H "Content-Type: application/json" \
  -d '{"kb": "planck", "km": "default", "tag": "0.19.3"}' \
  http://127.0.0.1:3123/build/qmk
```

## 今後の改善案

### 1. テスト専用設定
```typescript
// tests/config/test-app.ts
import app from '../../src/app'

// テスト用にcommandモジュールをモック
export const testApp = app
```

### 2. Environment変数での制御
```bash
# テスト実行時
NODE_ENV=test npm run test:api
```

### 3. Docker Composeでのテスト環境
```yaml
# docker-compose.test.yml
services:
  test:
    build: ./server
    environment:
      - NODE_ENV=test
    command: npm run test:run
```

## 結論

**現時点での推奨アプローチ**:

1. ✅ **単体テスト**: 完全動作確認済み
2. 🔄 **手動APIテスト**: Dockerコンテナ経由で確認済み
3. 📋 **今後**: モック環境またはCI/CD環境でのAPIテスト自動化

Vitestによるテスト環境は正常に構築されており、単体テストは完全に動作しています。APIテストについては、実際のQMK環境依存部分をモック化するか、完全な環境を用意してからの実行が必要です。