# GPK FWBuilder
Application to create QMK/Vial firmware.  

Before use
-------
Install Docker Desktop    
link: https://www.docker.com

![docker](https://user-images.githubusercontent.com/5214078/209291875-596663b3-71a5-4d22-8b4c-309c1edbcb61.jpg)

Docker for Windows requires Hyper-V to be enabled. 

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

Update Repository
-------
Clone again to the latest state.    
If you get an error like this, please update the repository.     
```
error: branch 'x.x.x' not found.
```
 
CUI version
-------
GPK FWMaker  
https://github.com/darakuneko/gpk_fwmaker
