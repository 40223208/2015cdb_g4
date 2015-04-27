# Q&A

Q: 是否可以將 markdown 資料以外的內容放入 gitbook 電子書資料中?

A: 可以, gitbook 利用 SUMMARY.md 與 README.md 來安排電子書的內容, 其中 README.md 為內定的 Introduction, 而 SUMMARY.md 則為目錄架構, 定義各章節標題與對應儲存的檔案名稱.

使用者可以在 gitbook 對應的 github 倉儲中, 設法利用 git 放入其他專案執行過程中所需要的其他資料.

Q: 為何在 gitbook 中儲存以中文命名的檔案, 最前頭需要加上底線符號?

A: 因為目前的 gitbook 系統無法對應以中文開頭命名的檔案, 因此必須在中文名稱前加上 ASCII 可以辨識的任何符號, 在此選擇加入底線符號.

