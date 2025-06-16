# GPK FWBuilder

<div align="center">

**QMKとVialキーボードファームウェアを簡単にビルドするデスクトップアプリケーション**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![QMK](https://img.shields.io/badge/QMK-1e88e5?style=flat&logo=qmk&logoColor=white)](https://qmk.fm/)
[![Vial](https://img.shields.io/badge/Vial-purple?style=flat)](https://get.vial.today/)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/darakuneko/gpk_fwbuilder)

**[English](README.md) | 日本語**

</div>

## 概要

GPK FWBuilderは、カスタムメカニカルキーボードのファームウェアビルドプロセスを簡素化する、使いやすいデスクトップアプリケーションです。  
QMKとVialファームウェアのコンパイルにグラフィカルインターフェースを提供します。

https://github.com/user-attachments/assets/dcf499e6-8604-40dd-981c-61882ef3df7e

## 機能

### ファームウェアビルド
- **QMK**と**Vial**ファームウェアの両方をサポート
- ドロップダウンメニューから簡単にキーボードとキーマップを選択
- バージョン管理のためのタグ/コミットベースのビルド
- 最大5つのカスタムQMK/Vialフォークリポジトリをサポート
- サイドパネルビューでリアルタイムビルドログ表示
- `~/GPKFW/`ディレクトリへの自動ファームウェア出力

### ファイル生成
- **QMKキーボードファイル**: テンプレートキーボード設定ファイルを生成
  - info.json、rules.mk、config.h、keymapファイルを作成
  - 各種MCUタイプをサポート
  - キーボード名と作成者をカスタマイズ可能
- **Vialユニークid**: Vial対応キーボード用のユニーク識別子を作成
  - Vialに必要な8バイトのユニークIDを生成

### 変換ツール
- **Vial to Keymap.c**: Vial JSONファイルをQMK keymap.c形式に変換
  - Vialからエクスポートした.vilファイルをインポート
  - 自動キーマップ生成
- **KLE to Keyboard**: KLE（Keyboard Layout Editor）JSONファイルをQMK/Vialキーボードファイルに変換
　- [zykrah/firmware-scripts](https://github.com/zykrah/firmware-scripts)ベース

### 設定
- **リポジトリ管理**: 
  - カスタムファームウェアリポジトリの設定と更新
  - GitHub URLをサポート
- **Dockerイメージ**: 
  - Dockerビルド環境の再構築と管理
- **外部サーバー**: 
  - リモートビルド用の外部GPK FWMakerサーバーを設定
- **更新通知**: 
  - 更新履歴の表示
- **言語サポート**: 
  - 英語と日本語のインターフェース

## システム要件

### 前提条件
Docker Desktopを https://www.docker.com からインストール  
*注意：docker composeをサポートするDocker互換環境であれば動作します*

## はじめに

### 1. 初期設定
- GPK FWBuilderを起動
- 初回実行時、アプリケーションはDocker環境を初期化します
- ビルドイメージのダウンロードに数分かかる場合があります
- 必要に応じてDockerチェックをスキップできます（推奨しません）

### 2. ファームウェアのビルド

1. **ファームウェアタイプを選択**
   - ドロップダウンからQMKまたはVialを選択
   - 選択に基づいてキーボードリストが更新されます

2. **キーボードを選択**
   - リストからターゲットキーボードを選択
   - 検索機能を使用して素早くナビゲート
   - 必要に応じてキーボードファイルをローカルにコピー

3. **キーマップを選択**
   - 利用可能なキーマップから選択
   - 通常、デフォルトキーマップが良い出発点です

4. **ビルドオプションの設定**（オプション）
   - 特定のタグまたはコミットを選択
   - フォークを使用している場合はカスタムリポジトリを選択

5. **ビルド**
   - 「Build」ボタンをクリック
   - ログパネルで進行状況を監視
   - ファームウェアは`~/GPKFW/`に保存されます

### 3. ファイルの場所

- **ファームウェア出力**: `~/GPKFW/`
- **キーボードファイル**: カスタムキーボードを`~/GPKFW/keyboards/`にコピー
- **ビルドログ**: アプリケーション内に表示

## 高度な機能

### カスタムリポジトリ
QMKとVialそれぞれに最大5つのフォークリポジトリを追加できます：
1. 設定 → リポジトリに移動
2. GitHubリポジトリのURLを入力
3. 更新をクリックして同期

### KLEからキーボードへの変換
1. [Keyboard Layout Editor](http://www.keyboard-layout-editor.com/)でレイアウトを作成
2. JSONファイルをエクスポート
3. 変換 → KLE to Keyboard Fileを使用
4. マトリクス設定を構成してファイルを生成

![KLEガイドライン](https://user-images.githubusercontent.com/5214078/212449850-e3fb4a3b-211d-4841-9128-7072bb05c7da.png)

### Via.json生成
QMK info.jsonとKLEレイアウトからVia設定ファイルを生成：
1. info.jsonファイルを選択
2. KLEレイアウトファイルを選択
3. VIAコンフィギュレーター互換のvia.jsonを生成

## トラブルシューティング

### Docker接続の問題
- アプリ起動前にDocker Desktopが実行されていることを確認
- Docker Desktopの設定でリソース割り当てを確認
- WindowsではHyper-Vが有効になっていることを確認
- 設定 → イメージからDockerイメージの再構築を試す

### ビルドの失敗
- ビルドログで具体的なエラーメッセージを確認
- キーボードとキーマップ名が正しいことを確認
- リポジトリが最新であることを確認
- 十分なディスク容量があることを確認

### キーボードが見つからない
- 「更新」をクリックしてキーボードリストを更新
- 設定 → リポジトリからリポジトリを更新
- 選択したファームウェアタイプにキーボードが存在することを確認

## 開発

### 開発セットアップ
```bash
# リポジトリをクローン
git clone https://github.com/darakuneko/gpk_fwbuilder.git
cd gpk_fwbuilder

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# 別のターミナルでElectronを起動
npm run start
```

### ソースからのビルド
```bash
# 全プラットフォーム用にビルド
npm run build

# プラットフォーム固有のビルド
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

## 関連プロジェクト

- **CUIバージョン**: [GPK FWMaker](https://github.com/darakuneko/gpk_fwmaker) - コマンドライン版
- **Firmware Scripts**: [zykrah/firmware-scripts](https://github.com/zykrah/firmware-scripts)ベース
- **Vial2C**: Vial変換に[ymkn/vial2c](http://ymkn.github.io/vial2c/)を使用

## Developer Support

**Buy me a coffee**  
[Amazon Wishlist](https://www.amazon.co.jp/hz/wishlist/ls/66VQJTRHISQT) | [Ko-fi](https://ko-fi.com/darakuneko)

## License

This project is released under the [MIT License](LICENSE).

---

<div align="center">

**GPK FWBuilder - Making QMK/Vial firmware generation easier**

Made with ❤ by [darakuneko](https://github.com/darakuneko)

</div>
