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
<v t="2014pythonE.20140310183734.6420" a="E"><vh>@settings</vh>
<v t="2014pythonE.20140310183734.6421"><vh>@data qt-gui-plugin-style-sheet</vh></v>
<v t="2014pythonE.20140310183734.6422"><vh>@string initial_split_orientation = horizontal</vh></v>
</v>
<v t="2014pythonE.20140310183734.6523"><vh>轉換程式說明</vh></v>
<v t="ekr.20121013084734.16370" a="E"><vh>Recursive import script (with cleanups)</vh>
<v t="ekr.20121013084734.16371" a="E"><vh>class ImportController</vh>
<v t="ekr.20121013084734.16372"><vh>Pass 1: import_dir</vh></v>
<v t="ekr.20121013084734.16373" a="E"><vh>Pass 2: clean_all &amp; helpers</vh>
<v t="ekr.20121013084734.16374"><vh>clean</vh></v>
<v t="ekr.20121013084734.16375"><vh>clean_blank_lines</vh></v>
<v t="ekr.20121013084734.16376"><vh>merge_comment_nodes</vh></v>
<v t="ekr.20121013084734.16377"><vh>merge_extra_nodes</vh></v>
<v t="ekr.20121013084734.16378"><vh>move_decorator_lines</vh></v>
<v t="ekr.20121013084734.16379"><vh>move_doc_string</vh></v>
<v t="ekr.20121013084734.16380"><vh>move_shebang_line</vh></v>
<v t="ekr.20121013084734.16381"><vh>rename_decls</vh></v>
</v>
<v t="ekr.20121013084734.16382" a="E"><vh>Pass 3: post_process &amp; helpers</vh>
<v t="ekr.20121013084734.16383"><vh>clear_dirty_bits</vh></v>
<v t="ekr.20121013084734.16384"><vh>dump_headlines</vh></v>
<v t="ekr.20121013084734.16385"><vh>fix_back_slashes</vh></v>
<v t="ekr.20121013084734.16386"><vh>minimize_headlines</vh></v>
<v t="ekr.20121013084734.16387"><vh>remove_empty_nodes</vh></v>
</v>
<v t="ekr.20121013084734.16388"><vh>run</vh></v>
</v>
</v>
</vnodes>
<tnodes>
<t tx="2014pythonE.20140310183734.6420"></t>
<t tx="2014pythonE.20140310183734.6421">QSplitter::handle {
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
<t tx="2014pythonE.20140310183734.6422">horizontal: body pane to the left
vertical: body pane on the botton</t>
<t tx="2014pythonE.20140310183734.6523">點選 Recursive import script 然後按下 ctrl+b 即可執行轉換</t>
<t tx="ekr.20121013084734.16370">'''Recursively import all python files in a directory and clean the result.'''

# Latest change: do some fixups for languages other than python.

import os
import time

use_at_edit = False # True: create @edit nodes
safe_at_file = True # True: create @@file nodes instead of @file nodes.
oneFile = False # True: only import one file.


theTypes = ('.py',)
dir_ = './'

@others

# g.cls()

if g.os_path_exists(dir_):
    # Import all files in dir_ after c.p.
    try:
        ImportController().run(c,p,dir_,theTypes,
            oneFile=oneFile,recursive=not oneFile)
    finally:
        c.redraw()
else:
    print('Does not exist: %s' % (dir_))
</t>
<t tx="ekr.20121013084734.16371">class ImportController():
    
    # There is no ctor.

    @others
</t>
<t tx="ekr.20121013084734.16372">def import_dir(self,c,root,dir_,theTypes,oneFile=False,recursive=True):

    g.es("dir: " + dir_,color="blue")
    dirs,files,files2 = [],os.listdir(dir_),[]
    for f in files:
        path = g.os_path_join(dir_,f)
        if g.os_path_isfile(path):
            name, ext = g.os_path_splitext(f)
            if not theTypes or ext in theTypes:
                files2.append(path)
        elif recursive:
            dirs.append(path)
    if files2 or dirs:
        child = root.insertAsLastChild()
        child.h = dir_
        c.selectPosition(child,enableRedrawFlag=False)
    if files2:
        if oneFile: files2 = [files2[0]]
        if use_at_edit:
            for fn in files2:
                parent = child or root
                p = parent.insertAsLastChild()
                p.h = fn.replace('\\','/')
                s,e = g.readFileIntoString(fn,encoding='utf-8',kind='@edit')
                p.b = s
        else:
            c.importCommands.importFilesCommand(files2,'@file',redrawFlag=False)
                # '@auto' causes problems.
    if dirs:
        for dir_ in sorted(dirs):
            prefix = dir_
            self.import_dir(c,child,dir_,theTypes)
</t>
<t tx="ekr.20121013084734.16373">def clean_all (self,c,p):
    
    for p in p.self_and_subtree():
        h = p.h
        if h.startswith('@file') or h.startswith('@@file'):
            i = 6 if h[1] == '@' else 5
            path = h[i:].strip()
            junk,ext = g.os_path_splitext(path)
            self.clean(c,p,ext)
</t>
<t tx="ekr.20121013084734.16374">def clean(self,c,p,ext):
    
    '''
    - Move a shebang line from the first child to the root.
    - Move a leading docstring in the first child to the root.
    - Use a section reference for declarations.
    - Remove leading and trailing blank lines from all nodes.
    - Merge a node containing nothing but comments with the next node.
    - Merge a node containing no class or def lines with the previous node.
    '''

    root = p.copy()
    for tag in ('@@file','@file'):
        if p.h.startswith(tag):
            p.h = p.h[len(tag):].strip()
            break
            
    self.move_shebang_line(c,root)
    self.move_doc_string(c,root)
    self.rename_decls(c,root)

    for p in root.self_and_subtree():
        self.clean_blank_lines(c,p)
        
    # Get the single-line comment delim.
    if ext.startswith('.'): ext = ext[1:]
    language = g.app.extension_dict.get(ext)
    if language:
        delim,junk,junk = g.set_delims_from_language(language)
    else:
        delim = None
        
    # g.trace('ext: %s language: %s delim: %s' % (ext,language,delim))
        
    if delim:
        # Do general language-dependent cleanups.
        for p in root.subtree():
            self.merge_comment_nodes(c,p,delim)
    if ext == 'py':
        # Do python only cleanups.
        for p in root.subtree():
            self.merge_extra_nodes(c,p)
        for p in root.subtree():
            self.move_decorator_lines(c,p)
</t>
<t tx="ekr.20121013084734.16375">def clean_blank_lines(self,c,p):
    
    '''Remove leading and trailing blank lines from all nodes.
    '''
    
    s = p.b
    if not s.strip():
        return
    
    result = g.splitLines(s)
    for i in 0,-1:
        while result:
            if result[i].strip():
                break
            else:
                del result[i]
        
    s = ''.join(result)
    if not s.endswith('\n'): s = s + '\n'
    if s != p.b:
        p.b = s
</t>
<t tx="ekr.20121013084734.16376">def merge_comment_nodes(self,c,p,delim):
    
    '''Merge a node containing nothing but comments with the next node.'''
    
    if not p.hasChildren() and p.hasNext() and p.h.strip().startswith(delim):
        p2 = p.next()
        b = p.b.lstrip()
        b = b + ('\n' if b.endswith('\n') else '\n\n')
        p2.b = b + p2.b
        p.doDelete(p2)
        # g.trace(p2.h)
</t>
<t tx="ekr.20121013084734.16377">def merge_extra_nodes(self,c,p):
    
    '''Merge a node containing no class or def lines with the previous node'''
    
    s = p.b
    if p.hasChildren() or p.h.strip().startswith('&lt;&lt;') or not s.strip():
        return
        
    for s2 in g.splitLines(s):
        if s2.strip().startswith('class') or s2.strip().startswith('def'):
            return

    p2 = p.back()
    if p2:
        nl = '\n' if s.endswith('\n') else '\n\n'
        p2.b = p2.b + nl + s
        h = p.h
        p.doDelete(p2)
</t>
<t tx="ekr.20121013084734.16378">def move_decorator_lines (self,c,p):
    
    '''Move trailing decorator lines to the next node.'''
    
    trace = False
    p2 = p.next()
    if not p2: return False
    
    lines = g.splitLines(p.b)
    n = len(lines) -1
    while n &gt;= 0:
        s = lines[n]
        if s.startswith('@'):
            i = g.skip_id(s,1,chars='-')
            word = s[1:i]
            if word in g.globalDirectiveList:
                break
            else:
                n -= 1
        else:
            break
        
    head = ''.join(lines[:n+1])
    tail = ''.join(lines[n+1:])
    if not tail: return False

    assert head.endswith('\n')
    assert p.b == head+tail
    
    if trace:
        if tail not in seen:
            seen.append(tail)
            g.trace(tail.strip())
    
    if 1:
        nl = '' if tail.endswith('\n') else '\n'
        p.b = head
        p2.b = tail+nl+p2.b
        
    return True
</t>
<t tx="ekr.20121013084734.16379">def move_doc_string(self,c,root):

    '''Move a leading docstring in the first child to the root node.'''
    
    # To do: copy comments before docstring
    
    p = root.firstChild()
    s = p and p.b or ''
    if not s: return
    
    # if root.h.endswith('pgen.py'):
        # g.pdb()

    result = []
    for s2 in g.splitLines(s):
        delim = None
        s3 = s2.strip()
        if not s3:
            result.append(s2)
        elif s3.startswith('#'):
            result.append(s2)
        elif s3.startswith('"""'):
            delim = '"""'
            break
        elif s3.startswith("'''"):
            delim = "'''"
            break
        else:
            break
       
    if not delim:
        comments = ''.join(result)
        if comments:
            nl = '\n\n' if root.b.strip() else ''
            if root.b.startswith('@first #!'):
                lines = g.splitLines(root.b)
                root.b = lines[0] + '\n' + comments + nl + ''.join(lines[1:])
            else:
                root.b = comments + nl + root.b
            p.b = s[len(comments):]
        return

    i = s.find(delim)
    assert i &gt; -1
    i = s.find(delim,i+3)
    if i == -1:
        return
        
    doc = s[:i+3]
    p.b = s[i+3:].lstrip()
    
    # Move docstring to front of root.b, but after any shebang line.
    nl = '\n\n' if root.b.strip() else ''
    if root.b.startswith('@first #!'):
        lines = g.splitLines(root.b)
        root.b = lines[0] + '\n' + doc + nl + ''.join(lines[1:])
    else:
        root.b = doc + nl + root.b
</t>
<t tx="ekr.20121013084734.16380">def move_shebang_line (self,c,root):
    
    '''Move a shebang line from the first child to the root.'''
    
    p = root.firstChild()
    s = p and p.b or ''
    if s.startswith('#!'):
        lines = g.splitLines(s)
        nl = '\n\n' if root.b.strip() else ''
        root.b = '@first ' + lines[0] + nl + root.b
        p.b = ''.join(lines[1:])
</t>
<t tx="ekr.20121013084734.16381">def rename_decls (self,c,root):
    
    '''Use a section reference for declarations.'''
    
    p = root.firstChild()
    h = p and p.h or ''
    
    tag = 'declarations'
    if not h.endswith(tag):
        return
        
    if not p.b.strip():
        return # The blank node will be deleted.

    name = h[:-len(tag)].strip()
    decls = g.angleBrackets(tag)
    p.h = '%s (%s)' % (decls,name)
    
    i = root.b.find('@others')
    if i == -1:
        g.trace('can not happen')
        return
    else:
        nl = '' if i == 0 else '\n'
        root.b = root.b[:i] + nl + decls + '\n' + root.b[i:]

    # p.setDirty()
    # root.setDirty()
    # root.setMarked()
    # c.setChanged(True)

    # self.changed += 1
    #g.trace('%s --&gt; %s' % (p.h,root.h))
</t>
<t tx="ekr.20121013084734.16382">def post_process (self,c,p,prefix,theTypes):
    
    '''Traverse p's tree, replacing all nodes that start with prefix
       by the smallest equivalent @path or @file node.
    '''

    assert p
    root = p.copy()
    self.fix_back_slashes(root.copy())
    prefix = prefix.replace('\\','/')
    
    # self.dump_headlines(root.copy())
    if not use_at_edit:
        self.remove_empty_nodes(c,root.copy())
    self.minimize_headlines(c,root.copy().firstChild(),prefix,theTypes)
    self.clear_dirty_bits(c,root.copy())
    
    ## self.munge_at_file(c,root.copy().firstChild())
</t>
<t tx="ekr.20121013084734.16383">def clear_dirty_bits (self,c,p):
    
    c.setChanged(False)
    for p in p.self_and_subtree():
        p.clearDirty()
</t>
<t tx="ekr.20121013084734.16384">def dump_headlines (self,p):
    
    # show all headlines.
    for p in p.self_and_subtree():
        print(p.h)
</t>
<t tx="ekr.20121013084734.16385">def fix_back_slashes (self,p):
    
    '''Convert backslash to slash in all headlines.'''

    for p in p.self_and_subtree():
        s = p.h.replace('\\','/')
        if s != p.h:
            p.h = s
</t>
<t tx="ekr.20121013084734.16386">def minimize_headlines (self,c,p,prefix,theTypes):
    
    '''Create @path nodes to minimize the paths required in descendant nodes.'''

    trace = False
    
    # This could only happen during testing.
    if p.h.startswith('@'):
        g.trace('** skipping: %s' % (p.h))
        return
        
    h2 = p.h[len(prefix):].strip()
    
    ends_with_ext = any([h2.endswith(z) for z in theTypes])
    
    if p.h == prefix:
        if trace: g.trace('@path %s' % (p.h))
        p.h = '@path %s' % (p.h)
        for p in p.children():
            self.minimize_headlines(c,p,prefix,theTypes)
    elif h2.find('/') &lt;= 0 and ends_with_ext:
            if h2.startswith('/'): h2 = h2[1:]
            if use_at_edit:
                p.h = '@edit %s' % (h2)
            elif safe_at_file:
                if trace: g.trace('@@file %s' % (h2))
                p.h = '@@file %s' % (h2)
            else:
                if trace: g.trace('@file %s' % (h2))
                p.h = '@file %s' % (h2)
            # We never scan the children of @file nodes.
    else:
        if h2.startswith('/'): h2 = h2[1:]
        if trace:
            print('')
            g.trace('@path [%s/]%s' % (prefix,h2))
        p.h = '@path %s' % (h2)
        prefix2 = prefix if prefix.endswith('/') else prefix + '/'
        prefix2 = prefix2 + h2
        for p in p.children():
            self.minimize_headlines(c,p,prefix2,theTypes)
</t>
<t tx="ekr.20121013084734.16387">def remove_empty_nodes (self,c,p):
    
    root = p.copy()
    
    # Restart the scan once a node is deleted.
    changed = True
    while changed:
        changed = False
        for p in root.self_and_subtree():
            if not p.b and not p.hasChildren():
                # g.trace('** deleting',p.h)
                p.doDelete()
                c.selectPosition(root)
                changed = True
                break
                
</t>
<t tx="ekr.20121013084734.16388">def run (self,c,p,dir_,theTypes,oneFile=False,recursive=True):
    
    '''Import all the .py files in dir_.'''

    try:
        t1 = time.time()
        p1 = p.copy()
        g.app.disable_redraw = True
        bunch = c.undoer.beforeChangeTree(p1)
        assert p == c.p
        root = p.insertAfter()
        # root.h = '@path %s' % (dir_)
        root.h = 'imported files'
        prefix = dir_
        self.import_dir(c,root.copy(),dir_,theTypes,oneFile=oneFile,recursive=recursive)
        n = 0
        for p in root.self_and_subtree():
            n += 1
        if not use_at_edit:
            self.clean_all(c,root.copy())
        self.post_process(c,root.copy(),dir_,theTypes)
        c.undoer.afterChangeTree(p1,'recursive-import',bunch)
    finally:
        g.app.disable_redraw = False
        root.contract()
        c.redraw(root)
    
    t2 = time.time()
    g.trace('imported %s nodes in %2.2f sec' % (n,t2-t1))
</t>
</tnodes>
</leo_file>
