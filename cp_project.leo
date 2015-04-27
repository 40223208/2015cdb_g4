<?xml version="1.0" encoding="utf-8"?>
<!-- Created by Leo (http://leoeditor.com/leo_toc.html) -->
<?xml-stylesheet ekr_test?>
<leo_file xmlns:leo="http://www.leo-editor.org/2011/leo" >
<leo_header file_format="2" tnodes="0" max_tnode_index="0" clone_windows="0"/>
<globals body_outline_ratio="0.5" body_secondary_ratio="0.5">
	<global_window_position top="50" left="50" height="500" width="700"/>
	<global_log_window_position top="0" left="0" height="0" width="0"/>
</globals>
<preferences/>
<find_panel_settings/>
<vnodes>
<v t="2014fall.20141212095015.1784"><vh>@settings</vh>
<v t="2014fall.20141212095015.1785"><vh>@data qt-gui-plugin-style-sheet</vh></v>
<v t="2014fall.20141212095015.1786"><vh>@string initial_split_orientation = horizontal</vh></v>
</v>
<v t="2015.20150330144929.1714"><vh>以下為協同產品開發程式</vh></v>
<v t="2014fall.20141212095015.1774" a="E"><vh>@path ./</vh>
<v t="2014fall.20141212095015.1775" a="E"
expanded="2014fall.20141212095015.1777,"><vh>@file wsgi.py</vh></v>
<v t="office.20150407074720.1"
expanded="office.20150407074720.3,"><vh>@file gear.py</vh></v>
<v t="2014fall.20141212095015.1780"><vh>@edit setup.py</vh></v>
</v>
<v t="amd.20150415215803.1" a="E"><vh>@path static/Brython3.1.1-20150328-091302/Lib/site-packages/</vh>
<v t="amd.20150415215843.1"><vh>@edit spur.py</vh></v>
</v>
<v t="2015.20150330144929.1715"><vh>以下為專案報告相關檔案</vh>
<v t="2015.20150330144929.1716"><vh>@edit SUMMARY.md</vh></v>
<v t="2015.20150330144929.1717"><vh>@edit README.md </vh></v>
<v t="2015.20150330144929.1720"><vh>@edit _建立分組協同報告.md</vh></v>
<v t="2015.20150330144929.1721"><vh>@edit _新產品開發流程.md</vh></v>
<v t="amd.20150414195734.1"><vh>@edit _協同上機考試.md</vh></v>
<v t="amd.20150414195826.1"><vh>@edit scrumaster.md</vh></v>
<v t="amd.20150414195850.1"><vh>@edit scrum_1.md</vh></v>
<v t="amd.20150414195859.1"><vh>@edit scrum_2.md</vh></v>
<v t="amd.20150414195906.1"><vh>@edit scrum_3.md</vh></v>
<v t="amd.20150414195916.1"><vh>@edit scrum_4.md</vh></v>
<v t="amd.20150414195741.1"><vh>@edit product_owner.md</vh></v>
</v>
<v t="2015.20150330144929.1763" a="E"><vh>以下為參考資料</vh>
<v t="2015.20150330144929.1764"><vh>Brython 正齒輪程式</vh></v>
<v t="amd.20150415160041.1"><vh>fourbar 參考程式</vh></v>
<v t="amd.20150416213450.1"><vh>@url Cango Gear examples</vh></v>
</v>
</vnodes>
<tnodes>
<t tx="2014fall.20141212095015.1774"></t>
<t tx="2014fall.20141212095015.1784"></t>
<t tx="2014fall.20141212095015.1785">QSplitter::handle {
    background-color: #CAE1FF; /* lightSteelBlue1 */
}

QStackedWidget {
    /* background-color:lightpink; */
    border-color: red;
    padding: 0px;
    /* border-width: 0px; */
    /* background-color: yellow; */
}

QSplitter {
    border-color: white;
    background-color: white;
    border-style: solid;
}

QTreeWidget {
    /* These apply to the selected item, but not to editing items.*/
    background-color: #ffffec; /* Leo's traditional tree color */
    selection-color: black; /* was white */
    selection-background-color: lightgrey;
    /* font-family: SansSerif; */
    /*font-family: DejaVu Sans Mono;*/
    font-family:YaHei Mono;
    /* 標題字型大小設定 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal, italic,oblique */
 }

/* Headline edit widgets */
QTreeWidget QLineEdit {
    background-color: cornsilk;
    selection-color: white;
    selection-background-color: blue;
    /*font-family: DejaVu Sans Mono;*/    
    font-family:YaHei Mono;
    /* 沒有特別對應字型大小 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal, italic,oblique */
}

/* The log panes */
QTextEdit {
    background-color: #f2fdff;
    selection-color: red;
    selection-background-color: blue;
    /* font-family: Courier New; */
    font-family:YaHei Mono;
    /* log font 大小 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal, italic,oblique */
}

/* The body pane */
QTextEdit#richTextEdit {
    background-color: #fdf5f5; /* A kind of pink. */
    selection-color: white;
    selection-background-color: red;
    /*font-family: DejaVu Sans Mono;*/
    /* font-family: Courier New; */
    font-family:YaHei Mono;
    /* 內文字型大小 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal,italic,oblique */
}

QLabel {
    font-family:YaHei Mono;
    /* 下方的 Minibuffer 標題字型大小 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal,italic,oblique */
}

/* Editor labels */
QLineEdit#editorLabel {
    background-color: #ffffec;
    font-family:YaHei Mono;
    /* 沒有直接對應字型大小 */
    font-size: 20px;
    font-weight: normal; /* normal,bold,100,..,900 */
    font-style: normal; /* normal,italic,oblique */
    border: 2px;
    margin: 2px;
}</t>
<t tx="2014fall.20141212095015.1786">horizontal: body pane to the left
vertical: body pane on the botton</t>
<t tx="2015.20150330144929.1714"></t>
<t tx="2015.20150330144929.1715"></t>
<t tx="2015.20150330144929.1763"></t>
<t tx="2015.20150330144929.1764">@language python
from math import *

# 準備在 id="plotarea" 的 canvas 中繪圖
canvas = doc["plotarea"]
ctx = canvas.getContext("2d")

def create_line(x1, y1, x2, y2, width=3, fill="red"):
	ctx.beginPath()
	ctx.lineWidth = width
	ctx.moveTo(x1, y1)
	ctx.lineTo(x2, y2)
	ctx.strokeStyle = fill
	ctx.stroke()

# 導入數學函式後, 圓周率為 pi
# deg 為角度轉為徑度的轉換因子
deg = pi/180.
#
# 以下分別為正齒輪繪圖與主 tkinter 畫布繪圖
#
# 定義一個繪正齒輪的繪圖函式
# midx 為齒輪圓心 x 座標
# midy 為齒輪圓心 y 座標
# rp 為節圓半徑, n 為齒數
def gear(midx, midy, rp, n, 顏色):
    # 將角度轉換因子設為全域變數
    global deg
    # 齒輪漸開線分成 15 線段繪製
    imax = 15
    # 在輸入的畫布上繪製直線, 由圓心到節圓 y 軸頂點畫一直線
    create_line(midx, midy, midx, midy-rp)
    # 畫出 rp 圓, 畫圓函式尚未定義
    #create_oval(midx-rp, midy-rp, midx+rp, midy+rp, width=2)
    # a 為模數 (代表公制中齒的大小), 模數為節圓直徑(稱為節徑)除以齒數
    # 模數也就是齒冠大小
    a=2*rp/n
    # d 為齒根大小, 為模數的 1.157 或 1.25倍, 這裡採 1.25 倍
    d=2.5*rp/n
    # ra 為齒輪的外圍半徑
    ra=rp+a
    print("ra:", ra)
    # 畫出 ra 圓, 畫圓函式尚未定義
    #create_oval(midx-ra, midy-ra, midx+ra, midy+ra, width=1)
    # rb 則為齒輪的基圓半徑
    # 基圓為漸開線長齒之基準圓
    rb=rp*cos(20*deg)
    print("rp:", rp)
    print("rb:", rb)
    # 畫出 rb 圓 (基圓), 畫圓函式尚未定義
    #create_oval(midx-rb, midy-rb, midx+rb, midy+rb, width=1)
    # rd 為齒根圓半徑
    rd=rp-d
    # 當 rd 大於 rb 時
    print("rd:", rd)
    # 畫出 rd 圓 (齒根圓), 畫圓函式尚未定義
    #create_oval(midx-rd, midy-rd, midx+rd, midy+rd, width=1)
    # dr 則為基圓到齒頂圓半徑分成 imax 段後的每段半徑增量大小
    # 將圓弧分成 imax 段來繪製漸開線
    dr=(ra-rb)/imax
    # tan(20*deg)-20*deg 為漸開線函數
    sigma=pi/(2*n)+tan(20*deg)-20*deg
    for j in range(n):
        ang=-2.*j*pi/n+sigma
        ang2=2.*j*pi/n+sigma
        lxd=midx+rd*sin(ang2-2.*pi/n)
        lyd=midy-rd*cos(ang2-2.*pi/n)
        #for(i=0;i&lt;=imax;i++):
        for i in range(imax+1):
            r=rb+i*dr
            theta=sqrt((r*r)/(rb*rb)-1.)
            alpha=theta-atan(theta)
            xpt=r*sin(alpha-ang)
            ypt=r*cos(alpha-ang)
            xd=rd*sin(-ang)
            yd=rd*cos(-ang)
            # i=0 時, 繪線起點由齒根圓上的點, 作為起點
            if(i==0):
                last_x = midx+xd
                last_y = midy-yd
            # 由左側齒根圓作為起點, 除第一點 (xd,yd) 齒根圓上的起點外, 其餘的 (xpt,ypt)則為漸開線上的分段點
            create_line((midx+xpt),(midy-ypt),(last_x),(last_y),fill=顏色)
            # 最後一點, 則為齒頂圓
            if(i==imax):
                lfx=midx+xpt
                lfy=midy-ypt
            last_x = midx+xpt
            last_y = midy-ypt
        '''
        the line from last end of dedendum point to the recent
        end of dedendum point
        '''
        # lxd 為齒根圓上的左側 x 座標, lyd 則為 y 座標
        # 下列為齒根圓上用來近似圓弧的直線
        create_line((lxd),(lyd),(midx+xd),(midy-yd),fill=顏色)
        #for(i=0;i&lt;=imax;i++):
        for i in range(imax+1):
            r=rb+i*dr
            theta=sqrt((r*r)/(rb*rb)-1.)
            alpha=theta-atan(theta)
            xpt=r*sin(ang2-alpha)
            ypt=r*cos(ang2-alpha)
            xd=rd*sin(ang2)
            yd=rd*cos(ang2)
            # i=0 時, 繪線起點由齒根圓上的點, 作為起點
            if(i==0):
                last_x = midx+xd
                last_y = midy-yd
            # 由右側齒根圓作為起點, 除第一點 (xd,yd) 齒根圓上的起點外, 其餘的 (xpt,ypt)則為漸開線上的分段點
            create_line((midx+xpt),(midy-ypt),(last_x),(last_y),fill=顏色)
            # 最後一點, 則為齒頂圓
            if(i==imax):
                rfx=midx+xpt
                rfy=midy-ypt
            last_x = midx+xpt
            last_y = midy-ypt
        # lfx 為齒頂圓上的左側 x 座標, lfy 則為 y 座標
        # 下列為齒頂圓上用來近似圓弧的直線
        create_line(lfx,lfy,rfx,rfy,fill=顏色)

gear(400,400,300,41,"blue")

</t>
<t tx="amd.20150415160041.1">#要注意 javascript 轉 python 語法差異

#document.getElementById -&gt; doc[]
#module Math -&gt; math
#Math.PI -&gt; math.pi
#abs -&gt; fabs
#array 可用 list代替

import math
import time
from browser import doc
import browser.timer

# 點類別
class Point(object):
    # 起始方法
    def __init__(self, x, y):
        self.x = x
        self.y = y
        
    # 繪製方法
    def drawMe(self, g, r):
        self.g = g
        self.r = r
        self.g.save()
        self.g.moveTo(self.x,self.y)
        self.g.beginPath()
        # 根據 r 半徑繪製一個圓代表點的所在位置
        self.g.arc(self.x, self.y, self.r, 0, 2*math.pi, true)
        self.g.moveTo(self.x,self.y)
        self.g.lineTo(self.x+self.r, self.y)
        self.g.moveTo(self.x, self.y)
        self.g.lineTo(self.x-self.r, self.y)
        self.g.moveTo(self.x, self.y)
        self.g.lineTo(self.x, self.y+self.r)
        self.g.moveTo(self.x, self.y)
        self.g.lineTo(self.x, self.y-self.r)
        self.g.restore()
        self.g.stroke()

    # 加入 Eq 方法
    def Eq(self, pt):
        self.x = pt.x
        self.y = pt.y

    # 加入 setPoint 方法
    def setPoint(self, px, py):
        self.x = px
        self.y = py

    # 加上 distance(pt) 方法, 計算點到 pt 的距離
    def distance(self, pt):
        self.pt = pt
        x = self.x - self.pt.x
        y = self.y - self.pt.y
        return math.sqrt(x * x + y * y)
    
    # 利用文字標示點的座標位置
    def tag(self, g):
        self.g = g
        self.g.beginPath()
        self.g.fillText("%d, %d"%(self.x, self.y),self.x, self.y)
        self.g.stroke()


# Line 類別物件
class Line(object):

    # 起始方法
    def __init__(self, p1, p2):
        self.p1 = p1
        self.p2 = p2
        # 直線的第一點, 設為線尾
        self.Tail = self.p1
        # 直線組成的第二點, 設為線頭
        self.Head = self.p2
        # 直線的長度屬性
        self.length = math.sqrt(math.pow(self.p2.x-self.p1.x, 2)+math.pow(self.p2.y-self.p1.y,2))

    # setPP 以指定頭尾座標點來定義直線
    def setPP(self, p1, p2):
        self.p1 = p1
        self.p2 = p2
        self.Tail = self.p1
        self.Head = self.p2
        self.length = math.sqrt(math.pow(self.p2.x-self.p1.x, 2)+math.pow(self.p2.y-self.p1.y,2))

    # setRT 方法 for Line, 應該已經確定 Tail 點, 然後以 r, t 作為設定 Head 的參考
    def setRT(self, r, t):
        self.r = r
        self.t = t
        x = self.r * math.cos(self.t)
        y = self.r * math.sin(self.t)
        self.Tail.Eq(self.p1)
        self.Head.setPoint(self.Tail.x + x,self.Tail.y + y)

    # getR 方法 for Line
    def getR(self):
        # x 分量與 y 分量
        x = self.p1.x - self.p2.x
        y = self.p1.y - self.p2.y
        return math.sqrt(x * x + y * y)

    # 根據定義 atan2(y,x), 表示 (x,y) 與 正 x 軸之間的夾角, 介於 pi 與 -pi 間
    def getT(self):
        x = self.p2.x - self.p1.x
        y = self.p2.y - self.p1.y
        if (math.fabs(x) &lt; math.pow(10,-100)):
            if(y &lt; 0.0):
                return (-math.pi/2)
            else:
                return (math.pi/2)
        else:
            return math.atan2(y, x)

    # setTail 方法 for Line
    def setTail(self, pt):
        self.pt = pt
        self.Tail.Eq(pt)
        self.Head.setPoint(self.pt.x + self.x, self.pt.y + self.y)

    # getHead 方法 for Line
    def getHead(self):
        return self.Head

    def getTail(self):
        return self.Tail

    def drawMe(self, g):
        self.g = g
        self.g.beginPath()
        self.g.moveTo(self.p1.x,self.p1.y)
        self.g.lineTo(self.p2.x,self.p2.y)
        self.g.stroke()

    def test(self):
        return ("this is pure test to Inherit")


class Link(Line):
    def __init__(self, p1, p2):
        self.p1 = p1
        self.p2 = p2
        self.length = math.sqrt(math.pow((self.p2.x - self.p1.x), 2) + math.pow((self.p2.y - self.p1.y), 2))

    #g context
    def drawMe(self, g):
        self.g = g
        hole = 5
        radius = 10
        length = self.getR()
        # alert(length)
        # 儲存先前的繪圖狀態
        self.g.save()
        self.g.translate(self.p1.x,self.p1.y)
        #alert(str(self.p1.x)+","+str(self.p1.y))
        #self.g.rotate(-((math.pi/2)-self.getT()))
        self.g.rotate(-math.pi*0.5 + self.getT())
        #alert(str(self.getT()))
        #self.g.rotate(10*math.pi/180)
        #this.g.rotate(-(Math.PI/2-this.getT()));
        # 必須配合畫在 y 軸上的 Link, 進行座標轉換, 也可以改為畫在 x 軸上...
        self.g.beginPath()
        self.g.moveTo(0,0)
        self.g.arc(0, 0, hole, 0, 2*math.pi, true)
        self.g.stroke()
        self.g.moveTo(0,length)
        self.g.beginPath()
        self.g.arc(0,length, hole, 0, 2*math.pi, true)
        self.g.stroke()
        self.g.moveTo(0,0)
        self.g.beginPath()
        self.g.arc(0,0, radius, 0, math.pi, true)
        self.g.moveTo(0+radius,0)
        self.g.lineTo(0+radius,0+length)
        self.g.stroke()
        self.g.moveTo(0,0+length)
        self.g.beginPath()
        self.g.arc(0, 0+length, radius, math.pi, 0, true)
        self.g.moveTo(0-radius,0+length)
        self.g.lineTo(0-radius,0)
        self.g.stroke()
        self.g.restore()
        
        self.g.beginPath()
        self.g.fillStyle = "red"
        self.g.font = "bold 18px sans-serif"
        self.g.fillText("%d, %d"%(self.p2.x, self.p2.y),self.p2.x, self.p2.y)
        self.g.stroke()
        self.g.restore()


class Triangle(object):
    def __init__(self, p1, p2, p3):
        self.p1 = p1
        self.p2 = p2
        self.p3 = p3

    def getLenp3(self):
        p1 = self.p1
        ret = p1.distance(self.p2)
        return ret

    def getLenp1(self):
        p2 = self.p2
        ret = p2.distance(self.p3)
        return ret

    def getLenp2(self):
        p1 = self.p1
        ret = p1.distance(self.p3)
        return ret

    # 角度
    def getAp1(self):
        ret = math.acos(((self.getLenp2() * self.getLenp2() + self.getLenp3() * self.getLenp3()) - self.getLenp1() * self.getLenp1()) / (2* self.getLenp2() * self.getLenp3()))
        return ret

    #
    def getAp2(self):
        ret =math.acos(((self.getLenp1() * self.getLenp1() + self.getLenp3() * self.getLenp3()) - self.getLenp2() * self.getLenp2()) / (2* self.getLenp1() * self.getLenp3()))
        return ret

    def getAp3(self):
        ret = math.acos(((self.getLenp1() * self.getLenp1() + self.getLenp2() * self.getLenp2()) - self.getLenp3() * self.getLenp3()) / (2* self.getLenp1() * self.getLenp2()))
        return ret

    def drawMe(self, g):
        self.g = g
        r = 5
        # 繪出三個頂點
        self.p1.drawMe(self.g,r)
        self.p2.drawMe(self.g,r)
        self.p3.drawMe(self.g,r)
        line1 = Line(self.p1,self.p2)
        line2 = Line(self.p1,self.p3)
        line3 = Line(self.p2,self.p3)
        # 繪出三邊線
        line1.drawMe(self.g)
        line2.drawMe(self.g)
        line3.drawMe(self.g)

    # ends Triangle def
    # 透過三個邊長定義三角形
    def setSSS(self, lenp3, lenp1, lenp2):
        self.lenp3 = lenp3
        self.lenp1 = lenp1
        self.lenp2 = lenp2
        self.ap1 = math.acos(((self.lenp2 * self.lenp2 + self.lenp3 * self.lenp3) - self.lenp1 * self.lenp1) / (2* self.lenp2 * self.lenp3))
        self.ap2 = math.acos(((self.lenp1 * self.lenp1 + self.lenp3 * self.lenp3) - self.lenp2 * self.lenp2) / (2* self.lenp1 * self.lenp3))
        self.ap3 = math.acos(((self.lenp1 * self.lenp1 + self.lenp2 * self.lenp2) - self.lenp3 * self.lenp3) / (2* self.lenp1 * self.lenp2))

    # 透過兩個邊長與夾角定義三角形
    def setSAS(self, lenp3, ap2, lenp1):
        self.lenp3 = lenp3
        self.ap2 = ap2
        self.lenp1 = lenp1
        self.lenp2 = math.sqrt((self.lenp3 * self.lenp3 + self.lenp1 * self.lenp1) - 2* self.lenp3 * self.lenp1 * math.cos(self.ap2))
        #等於 SSS(AB, BC, CA)

    def setSaSS(self, lenp2, lenp3, lenp1):
        self.lenp2 = lenp2
        self.lenp3 = lenp3
        self.lenp1 = lenp1
        if(self.lenp1 &gt; (self.lenp2 + self.lenp3)):
        #&lt;CAB 夾角為 180 度, 三點共線且 A 介於 BC 之間
            ret = math.pi
        else :
            # &lt;CAB 夾角為 0, 三點共線且 A 不在 BC 之間
            if((self.lenp1 &lt; (self.lenp2 - self.lenp3)) or (self.lenp1 &lt; (self.lenp3 - self.lenp2))):
                ret = 0.0
            else :
            # 透過餘絃定理求出夾角 &lt;CAB 
                ret = math.acos(((self.lenp2 * self.lenp2 + self.lenp3 * self.lenp3) - self.lenp1 * self.lenp1) / (2 * self.lenp2 * self.lenp3))
        return ret

    # 取得三角形的三個邊長值
    def getSSS(self):
        temp = []
        temp.append( self.getLenp1() )
        temp.append( self.getLenp2() )
        temp.append( self.getLenp3() )
        return temp

    # 取得三角形的三個角度值
    def getAAA(self):
        temp = []
        temp.append( self.getAp1() )
        temp.append( self.getAp2() )
        temp.append( self.getAp3() )
        return temp

    # 取得三角形的三個角度與三個邊長
    def getASASAS(self):
        temp = []
        temp.append(self.getAp1())
        temp.append(self.getLenp1())
        temp.append(self.getAp2())
        temp.append(self.getLenp2())
        temp.append(self.getAp3())
        temp.append(self.getLenp3())
        return temp
    #2P 2L return mid P
    def setPPSS(self, p1, p3, lenp1, lenp3):
        temp = []
        self.p1 = p1
        self.p3 = p3
        self.lenp1 = lenp1
        self.lenp3 = lenp3

        #bp3 is the angle beside p3 point, cp3 is the angle for line23, p2 is the output
        line31 = Line(p3, p1)
        self.lenp2 = line31.getR()
        #self.lenp2 = self.p3.distance(self.p1)
        #這裡是求角3
        ap3 = math.acos(((self.lenp1 * self.lenp1 + self.lenp2 * self.lenp2) - self.lenp3 * self.lenp3) / (2 * self.lenp1 * self.lenp2))
        #ap3 = math.acos(((self.lenp1 * self.lenp1 + self.lenp3 * self.lenp3) - self.lenp2 * self.lenp2) / (2 * self.lenp1 * self.lenp3))
        bp3 = line31.getT()
        cp3 = bp3 - ap3
        temp.append(p3.x + self.lenp1*math.cos(cp3))#p2.x
        temp.append(p3.y + self.lenp1*math.sin(cp3))#p2.y
        return temp

def tag(g, p):
    None

# 執行繪圖流程, 注意 x, y 為 global variables
def draw():
    global theta
    context.clearRect(0, 0, canvas.width, canvas.height)
    line1.drawMe(context)
    line2.drawMe(context)
    line3.drawMe(context)
    #triangle1.drawMe(context)
    #triangle2.drawMe(context)
    theta += dx
    p2.x = p1.x + line1.length*math.cos(theta*degree)
    p2.y = p1.y - line1.length*math.sin(theta*degree)
    p3.x, p3.y = triangle2.setPPSS(p2,p4,link2_len,link3_len)
    p1.tag(context)

# 以上為相關函式物件的定義區
# 全域變數
# 幾何位置輸入變數
x=10
y=10
r=10

# 畫布與繪圖內容
# 其他輸入變數
theta = 0
degree = math.pi/180.0
dx = 2
dy = 4

#set p1.p2.p3.p4 position
p1 =  Point(150,100)
p2 =  Point(150,200)
p3 =  Point(300,300)
p4 =  Point(350,100)

#accord position create link
line1 =  Link(p1,p2)
line2 =  Link(p2,p3)
line3 =  Link(p3,p4)
line4 =  Link(p1,p4)
line5 =  Link(p2,p4)

link2_len = p2.distance(p3)
link3_len = p3.distance(p4)

#link2_len = line1.getR()
#link3_len = line3.getR()
#alert(str(link2_len)+','+str(link3_len))

triangle1 =  Triangle(p1,p2,p4)
triangle2 =  Triangle(p2,p3,p4)

# 視窗載入時執行內容
# 繪圖畫布設定

canvas = doc["plotarea"]
context = canvas.getContext("2d")

# 座標轉換, 移動 canvas.height 並且 y 座標變號, 也就是將原點座標移到畫面左下角
context.translate(0,canvas.height)
context.scale(1,-1)

#以間隔 10 micro seconds 重複呼叫 draw()
#time.set_interval(draw,20)
browser.timer.set_interval(draw,10)
</t>
<t tx="amd.20150415215803.1"></t>
<t tx="amd.20150416213450.1">http://www.arc.id.au/GearDrawing.html</t>
</tnodes>
</leo_file>
