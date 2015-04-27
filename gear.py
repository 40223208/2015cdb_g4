#@+leo-ver=5-thin
#@+node:office.20150407074720.1: * @file gear.py
#@@language python
#@@tabwidth -4

#@+<<declarations>>
#@+node:office.20150407074720.2: ** <<declarations>> (application)
#@@language python

import cherrypy
import os
import sys
# 這個程式要計算正齒輪的齒面寬, 資料庫連結希望使用 pybean 與 SQLite
# 導入 pybean 模組與所要使用的 Store 及 SQLiteWriter 方法
from pybean import Store, SQLiteWriter
import math

# 確定程式檔案所在目錄, 在 Windows 有最後的反斜線
_curdir = os.path.join(os.getcwd(), os.path.dirname(__file__))
# 將所在目錄設為系統搜尋目錄
sys.path.append(_curdir)
if 'OPENSHIFT_REPO_DIR' in os.environ.keys():
    # while program is executed in OpenShift
    download_root_dir = os.environ['OPENSHIFT_DATA_DIR']
    data_dir = os.environ['OPENSHIFT_DATA_DIR']
else:
    # while program is executed in localhost
    download_root_dir = _curdir + "/local_data/"
    data_dir = _curdir + "/local_data/"

# 這是 Gear 設計資料表的定義
'''

lewis.db 中有兩個資料表, steel 與 lewis

 CREATE TABLE steel ( 
    serialno      INTEGER,
    unsno         TEXT,
    aisino        TEXT,
    treatment     TEXT,
    yield_str     INTEGER,
    tensile_str   INTEGER,
    stretch_ratio INTEGER,
    sectional_shr INTEGER,
    brinell       INTEGER 
);

CREATE TABLE lewis ( 
    serialno INTEGER PRIMARY KEY
                     NOT NULL,
    gearno   INTEGER,
    type1    NUMERIC,
    type4    NUMERIC,
    type3    NUMERIC,
    type2    NUMERIC 
);
'''

#@-<<declarations>>
#@+others
#@+node:office.20150407074720.3: ** class Gear
class Gear(object):
    #@+others
    #@+node:office.20150407074720.4: *3* __init__
    def __init__(self):
        # hope to create downloads and images directories　
        if not os.path.isdir(download_root_dir+"downloads"):
            try:
                os.makedirs(download_root_dir+"downloads")
            except:
                print("mkdir error")
        if not os.path.isdir(download_root_dir+"images"):
            try:
                os.makedirs(download_root_dir+"images")
            except:
                print("mkdir error")
        if not os.path.isdir(download_root_dir+"tmp"):
            try:
                os.makedirs(download_root_dir+"tmp")
            except:
                print("mkdir error")
    #@+node:office.20150407074720.5: *3* default
    @cherrypy.expose
    def default(self, attr='default', *args, **kwargs):
        raise cherrypy.HTTPRedirect("/")
    #@+node:office.20150407074720.6: *3* index
    # 各組利用 index 引導隨後的程式執行
    @cherrypy.expose
    def index(self, *args, **kwargs):
        # 進行資料庫檔案連結,  並且取出所有資料
        try:
            # 利用 Store  建立資料庫檔案對應物件, 並且設定 frozen=True 表示不要開放動態資料表的建立
            # 因為程式以 application 所在目錄執行, 因此利用相對目錄連結 lewis.db 資料庫檔案
            SQLite連結 = Store(SQLiteWriter(_curdir+"/lewis.db", frozen=True))
            #material = SQLite連結.find_one("steel","serialno = ?",[序號])
            # str(SQLite連結.count("steel")) 將傳回 70, 表示資料庫中有 70 筆資料
            material = SQLite連結.find("steel")
            # 所傳回的 material 為 iterator
            '''
            outstring = ""
            for material_item in material:
                outstring += str(material_item.serialno) + ":" + material_item.unsno + "_" + material_item.treatment + "<br />"
            return outstring
            '''
        except:
            return "抱歉! 資料庫無法連線<br />"

        outstring = '''
<form id=entry method=post action="gear_width">
請填妥下列參數，以完成適當的齒尺寸大小設計。<br />
馬達馬力:<input type=text name=horsepower id=horsepower value=100 size=10>horse power<br />
馬達轉速:<input type=text name=rpm id=rpm value=1120 size=10>rpm<br />
齒輪減速比: <input type=text name=ratio id=ratio value=4 size=10><br />
齒形:<select name=toothtype id=toothtype>
<option value=type1>壓力角20度,a=0.8,b=1.0
<option value=type2>壓力角20度,a=1.0,b=1.25
<option value=type3>壓力角25度,a=1.0,b=1.25
<option value=type4>壓力角25度,a=1.0,b=1.35
</select><br />
安全係數:<input type=text name=safetyfactor id=safetyfactor value=3 size=10><br />
齒輪材質:<select name=material_serialno id=material_serialno>
'''
        for material_item in material:
            outstring += "<option value=" + str(material_item.serialno) + ">UNS - " + \
                material_item.unsno + " - " + material_item.treatment
        outstring += "</select><br />"
        
        outstring += "小齒輪齒數:<input type=text name=npinion id=npinion value=18 size=10><br />"
        outstring += "<input type=submit id=submit value=進行運算>"
        outstring += "</form>"

        return outstring
    #@+node:office.20150407074720.7: *3* interpolation
    @cherrypy.expose
    def interpolation(self, small_gear_no=18, gear_type=1):
        SQLite連結 = Store(SQLiteWriter(_curdir+"/lewis.db", frozen=True))
        # 使用內插法求值
        # 找出比目標齒數大的其中的最小的,就是最鄰近的大值
        lewis_factor = SQLite連結.find_one("lewis","gearno > ?",[small_gear_no])
        if(gear_type == 1):
            larger_formfactor = lewis_factor.type1
        elif(gear_type == 2):
            larger_formfactor = lewis_factor.type2
        elif(gear_type == 3):
            larger_formfactor = lewis_factor.type3
        else:
            larger_formfactor = lewis_factor.type4
        larger_toothnumber = lewis_factor.gearno
     
        # 找出比目標齒數小的其中的最大的,就是最鄰近的小值
        lewis_factor = SQLite連結.find_one("lewis","gearno < ? order by gearno DESC",[small_gear_no])
        if(gear_type == 1):
            smaller_formfactor = lewis_factor.type1
        elif(gear_type == 2):
            smaller_formfactor = lewis_factor.type2
        elif(gear_type == 3):
            smaller_formfactor = lewis_factor.type3
        else:
            smaller_formfactor = lewis_factor.type4
        smaller_toothnumber = lewis_factor.gearno
        calculated_factor = larger_formfactor + (small_gear_no - larger_toothnumber) * (larger_formfactor - smaller_formfactor) / (larger_toothnumber - smaller_toothnumber)
        # 只傳回小數點後五位數
        return str(round(calculated_factor, 5))
    #@+node:office.20150407074720.8: *3* gear_width
    # 改寫為齒面寬的設計函式
    @cherrypy.expose
    def gear_width(self, horsepower=100, rpm=1000, ratio=4, toothtype=1, safetyfactor=2, material_serialno=1, npinion=18):
        SQLite連結 = Store(SQLiteWriter(_curdir+"/lewis.db", frozen=True))
        outstring = ""
        # 根據所選用的齒形決定壓力角
        if(toothtype == 1 or toothtype == 2):
            壓力角 = 20
        else:
            壓力角 = 25
     
        # 根據壓力角決定最小齒數
        if(壓力角== 20):
            最小齒數 = 18
        else:
            最小齒數 = 12
     
        # 直接設最小齒數
        if int(npinion) <= 最小齒數:
            npinion = 最小齒數
        # 大於400的齒數則視為齒條(Rack)
        if int(npinion) >= 400:
            npinion = 400
     
        # 根據所選用的材料查詢強度值
        # 由 material之序號查 steel 表以得材料之降伏強度S單位為 kpsi 因此查得的值要成乘上1000
        # 利用 Store  建立資料庫檔案對應物件, 並且設定 frozen=True 表示不要開放動態資料表的建立
        #SQLite連結 = Store(SQLiteWriter("lewis.db", frozen=True))
        # 指定 steel 資料表
        steel = SQLite連結.new("steel")
        # 資料查詢
        #material = SQLite連結.find_one("steel","unsno=? and treatment=?",[unsno, treatment])
        material = SQLite連結.find_one("steel","serialno=?",[material_serialno])
        # 列出 steel 資料表中的資料筆數
        #print(SQLite連結.count("steel"))
        #print (material.yield_str)
        strengthstress = material.yield_str*1000
        # 由小齒輪的齒數與齒形類別,查詢lewis form factor
        # 先查驗是否有直接對應值
        on_table = SQLite連結.count("lewis","gearno=?",[npinion])
        if on_table == 1:
            # 直接進入設計運算
            #print("直接運算")
            #print(on_table)
            lewis_factor = SQLite連結.find_one("lewis","gearno=?",[npinion])
            #print(lewis_factor.type1)
            # 根據齒形查出 formfactor 值
            if(toothtype == 1):
                formfactor = lewis_factor.type1
            elif(toothtype == 2):
                formfactor = lewis_factor.type2
            elif(toothtype == 3):
                formfactor = lewis_factor.type3
            else:
                formfactor = lewis_factor.type4
        else:
            # 沒有直接對應值, 必須進行查表內插運算後, 再執行設計運算
            #print("必須內插")
            #print(interpolation(npinion, gear_type))
            formfactor = self.interpolation(npinion, toothtype)
     
        # 開始進行設計運算
     
        ngear = int(npinion) * int(ratio)
     
        # 重要的最佳化設計---儘量用整數的diametralpitch
        # 先嘗試用整數算若 diametralpitch 找到100 仍無所獲則改用 0.25 作為增量再不行則宣告 fail
        counter = 0
        i = 0.1
        facewidth = 0
        circularpitch = 0
        while (facewidth <= 3 * circularpitch or facewidth >= 5 * circularpitch):
            diametralpitch = i
            #circularpitch = 3.14159/diametralpitch
            circularpitch = math.pi/diametralpitch
            pitchdiameter = int(npinion)/diametralpitch
            #pitchlinevelocity = 3.14159*pitchdiameter*rpm/12
            pitchlinevelocity = math.pi*pitchdiameter * float(rpm)/12
            transmittedload = 33000*float(horsepower)/pitchlinevelocity
            velocityfactor = 1200/(1200 + pitchlinevelocity)
            # formfactor is Lewis form factor
            # formfactor need to get from table 13-3 and determined ty teeth number and type of tooth
            # formfactor = 0.293
            # 90 is the value get from table corresponding to material type
            facewidth = transmittedload*diametralpitch*float(safetyfactor)/velocityfactor/formfactor/strengthstress
            if(counter>5000):
                outstring += "超過5000次的設計運算,仍無法找到答案!<br />"
                outstring += "可能所選用的傳遞功率過大,或無足夠強度的材料可以使用!<br />"
                # 離開while迴圈
                break
            i += 0.1
            counter += 1
        facewidth = round(facewidth, 4)
        if(counter<5000):
            # 先載入 cube 程式測試
            #outstring = self.cube_weblink()
            # 再載入 gear 程式測試
            outstring = self.gear_weblink()

            outstring += "進行"+str(counter)+"次重複運算後,得到合用的facewidth值為:"+str(facewidth)
        return outstring
    #@+node:office.20150407074720.9: *3* cube_weblink
    @cherrypy.expose
    def cube_weblink(self):
        outstring = '''<script type="text/javascript" src="/static/weblink/pfcUtils.js"></script>
    <script type="text/javascript" src="/static/weblink/wl_header.js">
    document.writeln ("Error loading Pro/Web.Link header!");
    </script>
    <script type="text/javascript" language="JavaScript">
    // 若第三輸入為 false, 表示僅載入 session, 但是不顯示
    // ret 為 model open return
     var ret = document.pwl.pwlMdlOpen("cube.prt", "v:/tmp", false);
    if (!ret.Status) {
        alert("pwlMdlOpen failed (" + ret.ErrorCode + ")");
    }
        //將 ProE 執行階段設為變數 session
        var session = pfcGetProESession();
        // 在視窗中打開零件檔案, 並且顯示出來
        var window = session.OpenFile(pfcCreate("pfcModelDescriptor").CreateFromFileName("cube.prt"));
        var solid = session.GetModel("cube.prt",pfcCreate("pfcModelType").MDL_PART);
        var length,width,myf,myn,i,j,volume,count,d1Value,d2Value;
        // 將模型檔中的 length 變數設為 javascript 中的 length 變數
        length = solid.GetParam("a1");
        // 將模型檔中的 width 變數設為 javascript 中的 width 變數
        width = solid.GetParam("a2");
    //改變零件尺寸
        //myf=20;
        //myn=20;
        volume=0;
        count=0;
        try
        {
                // 以下採用 URL 輸入對應變數
                //createParametersFromArguments ();
                // 以下則直接利用 javascript 程式改變零件參數
                for(i=0;i<=5;i++)
                {
                    //for(j=0;j<=2;j++)
                    //{
                        myf=20.0;
                        myn=10.0+i*0.5;
    // 設定變數值, 利用 ModelItem 中的 CreateDoubleParamValue 轉換成 Pro/Web.Link 所需要的浮點數值
             d1Value = pfcCreate ("MpfcModelItem").CreateDoubleParamValue(myf);
             d2Value = pfcCreate ("MpfcModelItem").CreateDoubleParamValue(myn);
    // 將處理好的變數值, 指定給對應的零件變數
                        length.Value = d1Value;
                        width.Value = d2Value;
                        //零件尺寸重新設定後, 呼叫 Regenerate 更新模型
                        solid.Regenerate(void null);
                        //利用 GetMassProperty 取得模型的質量相關物件
                        properties = solid.GetMassProperty(void null);
                        //volume = volume + properties.Volume;
    volume = properties.Volume;
                        count = count + 1;
    alert("執行第"+count+"次,零件總體積:"+volume);
    // 將零件存為新檔案
    var newfile = document.pwl.pwlMdlSaveAs("cube.prt", "v:/tmp", "cube"+count+".prt");
    if (!newfile.Status) {
        alert("pwlMdlSaveAs failed (" + newfile.ErrorCode + ")");
    }
    //} // 內圈 for 迴圈
                } //外圈 for 迴圈
                //alert("共執行:"+count+"次,零件總體積:"+volume);
                //alert("零件體積:"+properties.Volume);
                //alert("零件體積取整數:"+Math.round(properties.Volume));
            }
        catch(err)
            {
                alert ("Exception occurred: "+pfcGetExceptionType (err));
            }
    </script>
    '''
        return outstring
    #@+node:office.20150407074720.10: *3* gear_weblink
    @cherrypy.expose
    def gear_weblink(self, facewidth=5, n=18):
        outstring = '''<script type="text/javascript" src="/static/weblink/pfcUtils.js"></script>
    <script type="text/javascript" src="/static/weblink/wl_header.js">// <![CDATA[
    document.writeln ("Error loading Pro/Web.Link header!");
    // ]]></script>
    <script type="text/javascript" language="JavaScript">// <![CDATA[
    if (!pfcIsWindows()) netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    // 若第三輸入為 false, 表示僅載入 session, 但是不顯示
    // ret 為 model open return
     var ret = document.pwl.pwlMdlOpen("gear.prt", "v:/", false);
    if (!ret.Status) {
        alert("pwlMdlOpen failed (" + ret.ErrorCode + ")");
    }
        //將 ProE 執行階段設為變數 session
        var session = pfcGetProESession();
        // 在視窗中打開零件檔案, 並且顯示出來
        var window = session.OpenFile(pfcCreate("pfcModelDescriptor").CreateFromFileName("gear.prt"));
        var solid = session.GetModel("gear.prt",pfcCreate("pfcModelType").MDL_PART);
        var length,width,myf,myn,i,j,volume,count,d1Value,d2Value;
        // 將模型檔中的 length 變數設為 javascript 中的 length 變數
        length = solid.GetParam("n");
        // 將模型檔中的 width 變數設為 javascript 中的 width 變數
        width = solid.GetParam("face_width");
    //改變零件尺寸
        //myf=20;
        //myn=20;
        volume=0;
        count=0;
        try
        {
                // 以下採用 URL 輸入對應變數
                //createParametersFromArguments ();
                // 以下則直接利用 javascript 程式改變零件參數
                for(i=0;i<=5;i++)
                {
                    //for(j=0;j<=2;j++)
                    //{
                        myf=25+i*2;
                        myn=10.0+i*0.5;
    // 設定變數值, 利用 ModelItem 中的 CreateDoubleParamValue 轉換成 Pro/Web.Link 所需要的浮點數值
             //d1Value = pfcCreate ("MpfcModelItem").CreateDoubleParamValue(myf);
             d1Value = pfcCreate ("MpfcModelItem").CreateIntParamValue(myf);
             d2Value = pfcCreate ("MpfcModelItem").CreateDoubleParamValue(myn);

    // 將處理好的變數值, 指定給對應的零件變數
                        length.Value = d1Value;
                        width.Value = d2Value;
                        //零件尺寸重新設定後, 呼叫 Regenerate 更新模型
                        solid.Regenerate(void null);
                        //利用 GetMassProperty 取得模型的質量相關物件
                        properties = solid.GetMassProperty(void null);
                        //volume = volume + properties.Volume;
    volume = properties.Volume;
                        count = count + 1;
    alert("執行第"+count+"次,零件總體積:"+volume);
    // 將零件存為新檔案
    var newfile = document.pwl.pwlMdlSaveAs("gear.prt", "v:/", "mygear_"+count+".prt");
    if (!newfile.Status) {
        alert("pwlMdlSaveAs failed (" + newfile.ErrorCode + ")");
    }
    //} // 內圈 for 迴圈
                } //外圈 for 迴圈
                //alert("共執行:"+count+"次,零件總體積:"+volume);
                //alert("零件體積:"+properties.Volume);
                //alert("零件體積取整數:"+Math.round(properties.Volume));
            }
        catch(err)
            {
                alert ("Exception occurred: "+pfcGetExceptionType (err));
            }
    // ]]></script>
    '''
        return outstring
    #@-others
#@-others
root = Gear()

# setup static, images and downloads directories
application_conf = {
        '/static':{
        'tools.staticdir.on': True,
        'tools.staticdir.dir': _curdir+"/static"},
        '/images':{
        'tools.staticdir.on': True,
        'tools.staticdir.dir': data_dir+"/images"},
        '/downloads':{
        'tools.staticdir.on': True,
        'tools.staticdir.dir': data_dir+"/downloads"}
    }

# if inOpenshift ('OPENSHIFT_REPO_DIR' exists in environment variables) or not inOpenshift
if __name__ == '__main__':
    if 'OPENSHIFT_REPO_DIR' in os.environ.keys():
        # operate in OpenShift
        application = cherrypy.Application(root, config = application_conf)
    else:
        # operate in localhost
        cherrypy.quickstart(root, config = application_conf)

#@-leo
