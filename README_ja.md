# GPK FWBuilder

**[English](README.md) | 日本語**

QMK/Vialファームウェアを作成するアプリケーション

https://github.com/darakuneko/gpk_fwbuilder/assets/5214078/70497d3d-4729-4b58-b9b3-c4626b0f21d9

https://github.com/darakuneko/gpk_fwbuilder/assets/5214078/55f463ee-44eb-4aa6-bde4-87bfe379ebf0

CUI版
-------
GPK FWMaker  
https://github.com/darakuneko/gpk_fwmaker

使用前の準備
-------
Docker Desktopをインストールしてください  
リンク: https://www.docker.com  
注意：docker composeが使用できれば、互換性のあるものであれば何でも構いません。

![docker](https://user-images.githubusercontent.com/5214078/209291875-596663b3-71a5-4d22-8b4c-309c1edbcb61.jpg)

Windows版DockerはHyper-Vが有効になっている必要があります。

別のサーバーにGPK FWMakerがある場合は、それを設定してください。    
<img width="1015" alt="スクリーンショット 2023-05-05 11 16 11" src="https://user-images.githubusercontent.com/5214078/236365021-39ff4fb2-c74f-4b5c-9d0e-01b7201a075b.png">



ダウンロード
-------

https://github.com/darakuneko/gpk_fwbuilder/releases

ファームウェアビルド
-------
アプリケーションがインストールされ初期化された後、「GPKFW」ディレクトリが作成されます。

例：   
windows: C:\Users\xxxx\GPKFW   
mac: /Users/xxxx/GPKFW   
ubuntu: /home/xxxx/GPKFW    

キーボードファイルを「GPKFW」ディレクトリにコピーしてください。   
ファームウェアもここで作成されます。   

新しいキーボードファイルを作成する際はこちらを参考にしてください。   
https://github.com/qmk/qmk_firmware/tree/master/keyboards

例：    
コマンド  
make reviung/reviung41:default  
   
パラメータ  
keyboard: reviung/reviung41  
keymap: default 

Vial（Vialファイルのエクスポート）からQMK keymap.cへの変換
-------
この素晴らしいプロダクトをベースに作成しています👍    
http://ymkn.github.io/vial2c/


via.jsonへの変換
-------
QMK info.jsonとKLE jsonを使用してvia.jsonを作成します。   

info.json - 必須フィールド  
```
{
  "keyboard_name": "Your Keyboard's Name",
  "usb": {
    "vid": "0xFEED",
    "pid": "0x0001",
  },
  "matrix_size": {
    "cols": 1,
    "rows": 1
  }
}
 ```

KLE jsonはVIAのように編集されています  
https://www.caniusevia.com/docs/layouts 


変換（KLE jsonからQMK/Vialへ）
-------
Firmware 'scripts'をベースにしています。   
zykrahの素晴らしいプロジェクト👍      
https://github.com/zykrah/firmware-scripts    

https://user-images.githubusercontent.com/5214078/212449688-c9263962-5a9b-4e65-ae74-3c8a1c443887.mp4

#### KLEガイドライン

<img width="896" src="https://user-images.githubusercontent.com/5214078/212449850-e3fb4a3b-211d-4841-9128-7072bb05c7da.png">

キーボード名と作成者が入力されている場合、インポート時にkeyboardとusernameが自動的に設定されます。      

![switch](https://user-images.githubusercontent.com/5214078/212447224-56b04aa8-387c-4bf9-a8d3-bf383770c18c.png)

- 0: info.jsonの「label」とレイヤー0 
- 1: レイヤー1
- 2: （VIAL専用）ここに「u」がある場合、そのキーはアンロックコンボのキーとして含まれます（Firmware 'scripts'と同様）
- 3: マルチレイアウトインデックス（Firmware 'scripts'と同様）
- 4: （VIAL専用）ここに「e」がある場合、そのキーはエンコーダーです（Firmware 'scripts'と同様）
- 5: マルチレイアウトの値（Firmware 'scripts'と同様）
- 6: セカンダリマルチレイアウト名（Firmware 'scripts'と同様）
- 7: プライマリマルチレイアウト名/ラベル（Firmware 'scripts'と同様）
- 8: レイヤー2
- 9: 行
- 11: 列

0にはラベルが使用できます。　　　　   
キーコードのラベルがKLE Jsonの0の値と一致する場合、レイヤー0で「aliases」または「key」に変換されます。     
info.jsonでは、そのまま使用されます。    
https://keyboards.qmk.fm/v1/constants/keycodes_0.0.3.json     
0、1、8で空白スペースはKC_NOです。    

これらのKLEを参考にして作成してください。    
https://t.ly/bNH0    
https://t.ly/Y3BEW      
https://t.ly/xiJG8     

主なラベル   
```
A
B
C
D
E
F
G
H
I
J
K
L
M
N
O
P
Q
R
S
T
U
V
W
X
Y
Z
1
2
3
4
5
6
7
8
9
0
Enter
Esc
Backspace
Tab
Spacebar
-
=
]
[
\\
#
;
'
`
,
.
/
Caps Lock
F1
F2
F3
F4
F5
F6
F7
F8
F9
F10
F11
F12
Print Screen
Scroll Lock
Pause
Insert
Home
Page Up
Delete
End
Page Down
Right
Left
Down
Up
Num Lock
Menu
Mute
Volume Up
Volume Down
Caps Lock
Num Lock
Left Control
Left Shift
Left Alt
Left GUI
Right Control
Right Shift
Right Alt
Right GUI
```

リポジトリ
-------
QMKとVialのフォークリポジトリを最大5つまで追加できます。
このようなエラーが出た場合は、リポジトリを更新してください。     
```
error: branch 'x.x.x' not found.
```