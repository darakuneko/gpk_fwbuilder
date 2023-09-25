# GPK FWBuilder
Application to create QMK/Vial firmware.  

CUI version
-------
GPK FWMaker  
https://github.com/darakuneko/gpk_fwmaker

Before use
-------
Install Docker Desktop    
link: https://www.docker.com

![docker](https://user-images.githubusercontent.com/5214078/209291875-596663b3-71a5-4d22-8b4c-309c1edbcb61.jpg)

Docker for Windows requires Hyper-V to be enabled. 

If you have GPK FWMaker on another server, set it up.    
<img width="1015" alt="スクリーンショット 2023-05-05 11 16 11" src="https://user-images.githubusercontent.com/5214078/236365021-39ff4fb2-c74f-4b5c-9d0e-01b7201a075b.png">



Download
-------

https://github.com/darakuneko/gpk_fwbuilder/releases

Firmware Build
-------
https://user-images.githubusercontent.com/5214078/209667452-385875e9-a826-4edf-befd-ad2817b7a7fe.mov

After the application is installed and initialized, "GPKFW" directory will be created.

e.g.   
windows: C:\Users\xxxx\GPKFW   
mac: /Users/xxxx/GPKFW   
ubuntu: /home/xxxx/GPKFW    

Copy the keyboard files to "GPKFW" directory.   
Firmware is also created here.   

Please refer to here when creating a new keyboard file.   
https://github.com/qmk/qmk_firmware/tree/master/keyboards

e.g.    
Command  
make reviung/reviung41:default  
   
Parameter  
keyboard: reviung/reviung41  
keymap: default 

Convert to via.json
-------
QMK info.json and KLE json are used to create via.json.   

info.json - required fields  
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

KLE json edited like VIA  
https://www.caniusevia.com/docs/layouts 


Convert (KLE json to QMK/Vial)
-------
It is based on Firmware 'scripts'.   
zykrah's Nice project👍      
https://github.com/zykrah/firmware-scripts    

https://user-images.githubusercontent.com/5214078/212449688-c9263962-5a9b-4e65-ae74-3c8a1c443887.mp4

#### KLE Guidelines

<img width="896" src="https://user-images.githubusercontent.com/5214078/212449850-e3fb4a3b-211d-4841-9128-7072bb05c7da.png">

If Keyboard Name and Author are entered, keyboard and username will be automatically populated upon import.      

![switch](https://user-images.githubusercontent.com/5214078/212447224-56b04aa8-387c-4bf9-a8d3-bf383770c18c.png)

- 0: "label" in the info.json and layer 0 
- 1: layer 1
- 2: (VIAL only) If there is a 'u' here, the key is included as a key for the unlock combo （Same as Firmware 'scripts）
- 3: Multilayout index （Same as Firmware 'scripts）
- 4: (VIAL only) If there is an 'e' here, the key is an encoder （Same as Firmware 'scripts）
- 5: Multilayout value （Same as Firmware 'scripts）
- 6: Secondary Multilayout name （Same as Firmware 'scripts）
- 7: Primary Multilayout name/label （Same as Firmware 'scripts）
- 8: layer 2
- 9: Row
- 11: Col

0 can use label.　　　　   
If the label of keycodes matches the 0 value of KLE Json, it is converted to "aliases" or "key" at layer 0.     
In info.json, it is used as is.    
https://keyboards.qmk.fm/v1/constants/keycodes_0.0.3.json     
In 0, 1, and 8, a blank space is KC_NO.    

Please refer to these KLE and make it.    
https://t.ly/bNH0    
https://t.ly/Y3BEW      
https://t.ly/xiJG8     

Main labels   
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

Repository
-------
You can add 5 fork repositories for QMK and Vial.
If you get an error like this, please update the repository.     
```
error: branch 'x.x.x' not found.
```
