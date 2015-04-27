/*
   HISTORY
   
14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
07-MAR-03   K-01-03   $$2   JCN      UNIX support
08-JAN-08   L-01-42   $$3   SNV      Fix for SPR 1430116
*/

/*====================================================================*\
FUNCTION: createDrawingFromTemplate
PURPOSE:  Create a new drawing using a predefined template.
\*====================================================================*/
function createDrawingFromTemplate (newDrawingName /* string */)
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");	
  
  var predefinedTemplate = "c_drawing";
  
  if (newDrawingName == "")
    {
      throw new Error ("Please supply a drawing name.  Aborting...");
    }
  
/*------------------------------------------------------------------*\
  Use the current model to create the drawing.
\*------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  var solid = session.CurrentModel;
  modelTypeClass = pfcCreate ("pfcModelType");
  
  if (solid == void null || (solid.Type != modelTypeClass.MDL_PART && 
			     solid.Type != modelTypeClass.MDL_ASSEMBLY))
    {
      throw new Error ("Current model is not usable for new drawing.  Aborting...");
    }
  
  var options = pfcCreate ("pfcDrawingCreateOptions");
  options.Append (pfcCreate ("pfcDrawingCreateOption").DRAWINGCREATE_DISPLAY_DRAWING);
  
/*------------------------------------------------------------------*\
  Create the required drawing.
\*------------------------------------------------------------------*/
  var drw = session.CreateDrawingFromTemplate  (newDrawingName, 
						predefinedTemplate,
						solid.Descr, options);
}


/*====================================================================*\
FUNCTION : listSheets() 
PURPOSE  : Command to list drawing sheet info in an information window
\*====================================================================*/
function listSheets()
{ 
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");  

/*--------------------------------------------------------------------*\
  Open a browser window to contain the information to be displayed
\*--------------------------------------------------------------------*/ 

  var newWin = window.open ('', "_LS", "scrollbars");
  if (pfcIsWindows())
    {
      newWin.resizeTo (300, screen.height/2.0);
      newWin.moveTo (screen.width-300, 0);
    }
  newWin.document.writeln ("<html><head></head><body>");
   
/*--------------------------------------------------------------------*\ 
  Get the current drawing
\*--------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  var drawing = session.CurrentModel;
  
  if (drawing.Type != pfcCreate ("pfcModelType").MDL_DRAWING)
    throw new Error (0, "Current model is not a drawing");
  
/*--------------------------------------------------------------------*\ 
  Get the number of sheets
\*--------------------------------------------------------------------*/
  var sheets = drawing.NumberOfSheets;
  
  for (i = 1; i <= sheets; i++)
    {
/*--------------------------------------------------------------------*\
  Get the drawing sheet size etc.
\*--------------------------------------------------------------------*/
      var info = drawing.GetSheetData (i);
      
      var format = drawing.GetSheetFormat (i);
      
/*--------------------------------------------------------------------*\ 
  Print the information to the window
\*--------------------------------------------------------------------*/ 

      var unit = "unknown";
      var lengthUnitClass = pfcCreate ("pfcLengthUnitType");
      
      switch (info.Units.GetType())
	{
	case lengthUnitClass.LENGTHUNIT_INCH:
	  unit = "inches";
	  break;
	case lengthUnitClass.LENGTHUNIT_FOOT:
	  unit = "feet";
	  break;
	case lengthUnitClass.LENGTHUNIT_MM:
	  unit = "mm";
	  break;
	case lengthUnitClass.LENGTHUNIT_CM:
	  unit = "cm";
	  break;
	case lengthUnitClass.LENGTHUNIT_M:
	  unit = "m";
	  break;
	case lengthUnitClass.LENGTHUNIT_MCM:
	  unit = "mcm";
	  break;
	}
      
      
      
      newWin.document.writeln ("<h2>Sheet "+ i + "</h2>");
      newWin.document.writeln ("<table>");
      newWin.document.writeln (" <tr><td> Width </td><td> "+ 
			       info.Width + " </td></tr> ");
      newWin.document.writeln ("  <tr><td> Height </td><td> "+ 
			       info.Height + " </td></tr> ");
      newWin.document.writeln (" <tr><td> Units </td><td> "+ 
			       unit + " </td></tr> ");
      var formatName;
      if (format == void null)
	formatName = "none";
      else
	formatName = format.FullName;
      newWin.document.writeln (" <tr><td> Format </td><td> "+ 
			       formatName + " </td></tr> ");
      newWin.document.writeln ("</table>");
      newWin.document.writeln ("<br>");
      
    }
  newWin.document.writeln ("</body></html>");
} 

/*====================================================================*\ 
FUNCTION : listViews()
PURPOSE  : Command to list view info in an information window 
\*====================================================================*/
function listViews() 
{
  
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 

/*--------------------------------------------------------------------*\
     Open a browser window to contain the information to be displayed
\*--------------------------------------------------------------------*/ 
  
  var newWin = window.open ('', "_LV", "scrollbars");
  if (pfcIsWindows())
    {
      newWin.resizeTo (300, screen.height/2.0);
      newWin.moveTo (screen.width-300, 0);
    }
  newWin.document.writeln ("<html><head></head><body>");

/*--------------------------------------------------------------------*\ 
   Get the current drawing
\*--------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  var drawing = session.CurrentModel;
  
  if (drawing.Type != pfcCreate ("pfcModelType").MDL_DRAWING)
    throw new Error (0, "Current model is not a drawing");
  
/*--------------------------------------------------------------------*\  
  Collect the views 
\*--------------------------------------------------------------------*/

  var views = drawing.List2DViews ();
  
  for(i=0; i<views.Count; i++)
    { 
      
      var view = views.Item (i);

/*--------------------------------------------------------------------*\ 
  Get the name & sheet number for this view
\*--------------------------------------------------------------------*/
      var viewName = view.Name;
      var sheetNo = view.GetSheetNumber ();

/*--------------------------------------------------------------------*\ 
  Get the name of the solid that the view contains
\*--------------------------------------------------------------------*/ 
      var solid  = view.GetModel ();
      var descr = solid.Descr;
      
/*--------------------------------------------------------------------*\  
  Get the outline, scale, and display state
\*--------------------------------------------------------------------*/ 
      var outline = view.Outline;
      var scale = view.Scale;
      var display = view.Display;
	
/*--------------------------------------------------------------------*\ 
  Write the information to the browser window file
\*--------------------------------------------------------------------*/
      displayStyleClass = pfcCreate ("pfcDisplayStyle"); 
      var dispStyle;
      switch(display.Style)
	{         
	case displayStyleClass.DISPSTYLE_DEFAULT: 
	  dispStyle = "default"; 
	  break;
	case displayStyleClass.DISPSTYLE_WIREFRAME: 
	  dispStyle = "wireframe"; 
	  break;
	case displayStyleClass.DISPSTYLE_HIDDEN_LINE: 
	  dispStyle = "hidden line"; 
	  break;
	case displayStyleClass.DISPSTYLE_NO_HIDDEN: 
	  dispStyle = "no hidden";
	  break;
	case displayStyleClass.DISPSTYLE_SHADED: 
	  dispStyle = "shaded"; 
	  break;         
	}
      
      newWin.document.writeln ("<h2>View "+ viewName + "</h2>");
      newWin.document.writeln ("<table>");
      newWin.document.writeln (" <tr><td> Sheet </td><td> "+ 
			       sheetNo + " </td></tr> ");
      newWin.document.writeln ("  <tr><td> Model </td><td> "+ 
			       descr.GetFullName() + " </td></tr> ");
      newWin.document.writeln (" <tr><td> Outline </td><td> ");
      newWin.document.writeln ("<table><tr><td> <i>Lower left:</i> </td><td>");
      newWin.document.writeln (outline.Item (0).Item (0) + ", " + 
			       outline.Item (0).Item(1) + ", " + 
			       outline.Item (0).Item(2));
      newWin.document.writeln ("</td></tr><tr><td> <iUpper right:</i></td><td>");
      newWin.document.writeln (outline.Item (1).Item (0) + ", " + 
			       outline.Item (1).Item(1) + ", " + 
			       outline.Item (1).Item(2));
      newWin.document.writeln ("</td></tr></table></td>");
      newWin.document.writeln (" <tr><td> Scale </td><td> "+ scale + 
			       " </td></tr> ");
      newWin.document.writeln (" <tr><td> Display style </td><td> "+ 
			       dispStyle + " </td></tr>");
      newWin.document.writeln ("</table>");
      newWin.document.writeln ("<br>");
    }
  newWin.document.writeln ("</body></html>");
}

/*==================================================================*\
FUNCTION: drawingSolidReplace()
PURPOSE:  Replaces all instance solid models in a drawing with their
          generic.  Similar to the Pro/ENGINEER behavior,  
          the function will not replace models if the target generic 
          model is already present in the drawing.
\*==================================================================*/
function replaceModels()
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
/*--------------------------------------------------------------------*\ 
  Get the current drawing
\*--------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  var drawing = session.CurrentModel;
  
  if (drawing.Type != pfcCreate ("pfcModelType").MDL_DRAWING)
    throw new Error (0, "Current model is not a drawing");
	
/*------------------------------------------------------------------*\
  Visit the drawing models.
\*------------------------------------------------------------------*/
  var solids = drawing.ListModels ();
  
/*------------------------------------------------------------------*\
  Loop on all of the drawing models.
\*------------------------------------------------------------------*/  
  for (i = 0; i < solids.Count; i++)
    {
      var solid = solids.Item (i);
/*------------------------------------------------------------------*\
  If the generic is not an instance, continue (Parent property 
  from class pfcFamilyMember)
\*------------------------------------------------------------------*/ 
      var generic = solid.Parent;
      
      if (generic == void null)
		continue;
      
/*------------------------------------------------------------------*\
  Replace all instances with their (top-level) generic.
\*------------------------------------------------------------------*/
      try
	{
	  drawing.ReplaceModel (solid, generic, true);
	}
      catch (err)
	{
	  if (pfcGetExceptionType (err) == "pfcXToolkitFound")
	    ; // Target generic is already in drawing; do nothing
	  else
	    throw err;
	}
    }
}

/*====================================================================*\ 
FUNCTION : util_solidFind()
PURPOSE  : Utility to select a solid using the file browser and retrieve
           it if it is not already in session.
\*====================================================================*/ 
function util_solidFind(filename /* string "????.???" format */)
{
/*--------------------------------------------------------------------*\ 
   Find it, if its in session and return it
\*--------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  var mdlDescr = 
    pfcCreate ("pfcModelDescriptor").CreateFromFileName (filename);
  var mdl = session.GetModelFromDescr (mdlDescr);
  
  if (mdl != void null)
    return mdl;
  
/*--------------------------------------------------------------------*\     
  Try to retieve the solid 
\*--------------------------------------------------------------------*/ 
  mdl = session.RetrieveModel (mdlDescr);
  
  if (mdl != void null)
    return mdl;
  
  throw new Error (0, 
		   "Model "+filename+" cannot be found or retrieved.");
  
  return void null;
}


/*====================================================================*\ 
FUNCTION : createSheetAndViews() 
PURPOSE  : Create a new drawing sheet with a general, and two
           projected,views of a selected solid 
\*====================================================================*/ 
function createSheetAndViews(solidName /* string as ????.??? */)
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
/*--------------------------------------------------------------------*\ 
  Get the current drawing, create a new sheet
\*--------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  var drawing = session.CurrentModel;
  
  if (drawing.Type != pfcCreate ("pfcModelType").MDL_DRAWING)
    throw new Error (0, "Current model is not a drawing");
  
  var sheetNo = drawing.AddSheet ();
  drawing.CurrentSheetNumber = sheetNo;
  
/*--------------------------------------------------------------------*\ 
  Find the solid model, if its in session
\*--------------------------------------------------------------------*/
  var mdlDescr = 
    pfcCreate ("pfcModelDescriptor").CreateFromFileName (solidName);
  var solidMdl = session.GetModelFromDescr (mdlDescr);
  
  if (solidMdl == void null)
    {
/*--------------------------------------------------------------------*\     
  If its not found, try to retieve the solid model
\*--------------------------------------------------------------------*/ 
      solidMdl = session.RetrieveModel (mdlDescr);
      
      if (solidMdl == void null)
	throw new Error (0, 
			 "Model "+solidName+" cannot be found or retrieved.");
    }
		
/*--------------------------------------------------------------------*\     
  Try to add it to the drawing
\*--------------------------------------------------------------------*/ 	
  try
    { 
      drawing.AddModel (solidMdl);
    }
  catch (err)
    {
      if (pfcGetExceptionType (err) == "pfcXToolkitInUse")
	; // model is already in this drawing, nothing to do
      else
	throw err;
    }
  
/*--------------------------------------------------------------------*\ 
  Create a general view from the Z axis direction at a predefined location 
\*--------------------------------------------------------------------*/ 
  var matrix = pfcCreate ("pfcMatrix3D");
  for (i = 0; i < 4; i++)
    for (j = 0; j < 4; j++)
      {
	if (i == j)
	  matrix.Set (i, j, 1.0);
	else
	  matrix.Set (i, j, 0.0);
      }
  
  var transf = pfcCreate ("pfcTransform3D").Create (matrix);
  
  var pos = pfcCreate ("pfcPoint3D");
  pos.Set (0, 200.0);
  pos.Set (1, 600.0);
  pos.Set (2, 0.0);
  
  var instrs = 
    pfcCreate ("pfcGeneralViewCreateInstructions").Create (solidMdl,
							   sheetNo, pos, transf);
  
  var genView = drawing.CreateView (instrs);
    
/*--------------------------------------------------------------------*\     
  Get the position and size of the new view 
\*--------------------------------------------------------------------*/ 
  var outline = genView.Outline;

/*--------------------------------------------------------------------*\     
  Create a projected view to the right of the general view 
\*--------------------------------------------------------------------*/ 
  pos.Set (0, outline.Item (1).Item (0) + (outline.Item(1).Item(0) - 
					   outline.Item (0).Item (0)));
  pos.Set (1, (outline.Item (0).Item(1) + outline.Item (1).Item(1))/2);
  
  instrs = 
    pfcCreate ("pfcProjectionViewCreateInstructions").Create (genView, 
							      pos);
  
  drawing.CreateView (instrs);
    
/*--------------------------------------------------------------------*\     
  Create a projected view below the general view 
\*--------------------------------------------------------------------*/ 
  pos.Set (0, (outline.Item (0).Item(0) + outline.Item (1).Item(0))/2);
  pos.Set (1, outline.Item (0).Item (1) - (outline.Item(1).Item(1) - 
					   outline.Item (0).Item (1)));
  
  instrs = 
    pfcCreate ("pfcProjectionViewCreateInstructions").Create (genView, 
							      pos);
	
  drawing.CreateView (instrs);
}


/*====================================================================*\ 
FUNCTION : lineEntityCreate() 
PURPOSE  : Utility to create a line entity between specified points 
\*====================================================================*/ 
function lineEntityCreate()
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
  
  var color = pfcCreate ("pfcStdColor").COLOR_QUILT;
  var session = pfcGetProESession ();
  
/*--------------------------------------------------------------------*\ 
  Get the current drawing & its background view
\*--------------------------------------------------------------------*/  
  var drawing = session.CurrentModel;
  
  if (drawing.Type != pfcCreate ("pfcModelType").MDL_DRAWING)
    throw new Error (0, "Current model is not a drawing");
  
  var currSheet = drawing.CurrentSheetNumber;
  var view = drawing.GetSheetBackgroundView (currSheet);
 
/*--------------------------------------------------------------------*\ 
   Select the endpoints of the line
\*--------------------------------------------------------------------*/
  session.CurrentWindow.SetBrowserSize (0.0);
  
  var left = pfcCreate ("pfcMouseButton").MOUSE_BTN_LEFT;
  var mouse1 = session.UIGetNextMousePick (left);
  var start = mouse1.Position;
  var mouse2 = session.UIGetNextMousePick (left);
  var end = mouse2.Position;
  
/*--------------------------------------------------------------------*\ 
  Allocate and initialize a curve descriptor 
\*--------------------------------------------------------------------*/     
  var geom = pfcCreate ("pfcLineDescriptor").Create (start, end);
  
/*--------------------------------------------------------------------*\ 
  Allocate data for the draft entity 
\*--------------------------------------------------------------------*/     
  var instrs = pfcCreate ("pfcDetailEntityInstructions").Create (geom, 
								 view);

/*--------------------------------------------------------------------*\ 
  Set the color to the specified Pro/ENGINEER predefined color 
\*--------------------------------------------------------------------*/
  var rgb = session.GetRGBFromStdColor (color);
  instrs.Color = rgb;     
  
/*--------------------------------------------------------------------*\ 
  Create the entity 
\*--------------------------------------------------------------------*/     
  drawing.CreateDetailItem (instrs);

/*--------------------------------------------------------------------*\ 
  Display the entity 
\*--------------------------------------------------------------------*/     
  session.CurrentWindow.Repaint(); 
}
 
 
/*====================================================================*\
FUNCTION : createSurfNote() 
PURPOSE  : Utility to create a note that documents the surface name or id.
The note text will be placed at the upper right corner of the selected view.
\*====================================================================*/
function createSurfNote()
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
/*--------------------------------------------------------------------*\ 
  Get the current drawing & its background view
\*--------------------------------------------------------------------*/  
  var session = pfcGetProESession ();
  var drawing = session.CurrentModel;
  
  if (drawing.Type != pfcCreate ("pfcModelType").MDL_DRAWING)
    throw new Error (0, "Current model is not a drawing");
  
/*--------------------------------------------------------------------*\  
  Interactively select a surface in a drawing view
\*--------------------------------------------------------------------*/ 
  var browserSize = session.CurrentWindow.GetBrowserSize();
  session.CurrentWindow.SetBrowserSize(0.0);
  
  var options = pfcCreate ("pfcSelectionOptions").Create ("surface");
  options.MaxNumSels = 1;
  
  var sels = session.Select (options, void null);
  var selSurf = sels.Item (0);
  var item = selSurf.SelItem;
  
  var name = item.GetName();
  if (name == void null)
    name = new String ("Surface ID "+item.Id);
  
  session.CurrentWindow.SetBrowserSize(browserSize);
    
/*--------------------------------------------------------------------*\  
  Allocate a text item, and set its properties
\*--------------------------------------------------------------------*/   
  var text = pfcCreate ("pfcDetailText").Create (name);
 
/*--------------------------------------------------------------------*\ 
  Allocate a new text line, and add the text item to it
/*--------------------------------------------------------------------*/ 
  var texts = pfcCreate ("pfcDetailTexts");
  texts.Append (text);
  
  var textLine = pfcCreate ("pfcDetailTextLine").Create (texts);
  
  var textLines = pfcCreate ("pfcDetailTextLines");
  textLines.Append (textLine);

/*--------------------------------------------------------------------*\    
  Set the location of the note text 
\*--------------------------------------------------------------------*/ 
  var dwgView = selSurf.SelView2D;
  var outline = dwgView.Outline;
  var textPos = outline.Item (1);
  
  // Force the note to be slightly beyond the view outline boundary
 textPos.Set (0, textPos.Item (0) + 0.25 * (textPos.Item (0) - 
					    outline.Item (0).Item(0)));
 textPos.Set (1, textPos.Item (1) + 0.25 * (textPos.Item (1) - 
					    outline.Item (0).Item(1)));
 
 var position = pfcCreate ("pfcFreeAttachment").Create (textPos);
 position.View = dwgView;
 
/*--------------------------------------------------------------------*\    
  Set the attachment for the note leader
\*--------------------------------------------------------------------*/ 
 var leaderToSurf = pfcCreate ("pfcParametricAttachment").Create (selSurf);

/*--------------------------------------------------------------------*\    
  Set the attachment structure
\*--------------------------------------------------------------------*/ 
 var allAttachments = pfcCreate ("pfcDetailLeaders").Create ();
 allAttachments.ItemAttachment = position;
 allAttachments.Leaders = pfcCreate ("pfcAttachments");
 allAttachments.Leaders.Append (leaderToSurf);
    
/*--------------------------------------------------------------------*\ 
  Allocate a note description, and set its properties
\*--------------------------------------------------------------------*/    
 var instrs = pfcCreate ("pfcDetailNoteInstructions").Create (textLines);
 
 instrs.Leader = allAttachments;
   
/*--------------------------------------------------------------------*\    
  Create the note
\*--------------------------------------------------------------------*/    
 var note = drawing.CreateDetailItem (instrs);
 
/*--------------------------------------------------------------------*\    
  Display the note
\*--------------------------------------------------------------------*/  
 note.Show (); 
}

/*====================================================================*\
 FUNCTION : placeSymInst() 
 PURPOSE  :  Place a CG symbol with no leaders at a specified location  
\*====================================================================*/
function placeSymInst()
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
 /*--------------------------------------------------------------------*\ 
   Get the current drawing
 \*--------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  var drawing = session.CurrentModel;
  
  if (drawing.Type != pfcCreate ("pfcModelType").MDL_DRAWING)
    throw new Error (0, "Current model is not a drawing");
  
/*--------------------------------------------------------------------*\  
  Retrieve the symbol definition from the system
\*--------------------------------------------------------------------*/    
  var symDef = drawing.RetrieveSymbolDefinition ("CG", 
						 void null, void null, void null);
  
/*--------------------------------------------------------------------*\ 
  Select the locations for the symbol
\*--------------------------------------------------------------------*/
  var browserSize = session.CurrentWindow.GetBrowserSize();
  session.CurrentWindow.SetBrowserSize (0.0);
  
  var stop = false;
  var points = pfcCreate ("pfcPoint3Ds");
  while (!stop)
    {
      var mouse = 
	session.UIGetNextMousePick (pfcCreate ("pfcMouseButton").MouseButton_nil);
      
      if (mouse.SelectedButton == 
	  pfcCreate ("pfcMouseButton").MOUSE_BTN_LEFT)
	{
	  points.Append (mouse.Position);
	}
      else
	stop = true;
    }
  
  session.CurrentWindow.SetBrowserSize (browserSize);
 
/*--------------------------------------------------------------------*\  
  Allocate the symbol instance instructions 
\*--------------------------------------------------------------------*/ 
  var instrs = 
    pfcCreate ("pfcDetailSymbolInstInstructions").Create (symDef); 
  var position = pfcCreate ("pfcFreeAttachment").Create (points.Item (0));
  var allAttachments = pfcCreate ("pfcDetailLeaders").Create ();	
  for (i = 0; i < points.Count; i++)
    {
      
/*--------------------------------------------------------------------*\    
  Set the location of the note text 
\*--------------------------------------------------------------------*/ 
      position.AttachmentPoint = points.Item (i);
      
/*--------------------------------------------------------------------*\    
  Set the attachment structure
\*--------------------------------------------------------------------*/ 
      allAttachments.ItemAttachment = position;
      
      instrs.InstAttachment = allAttachments;

/*--------------------------------------------------------------------*\    
  Create and display the symbol 
\*--------------------------------------------------------------------*/  
      var symInst = drawing.CreateDetailItem (instrs);
      symInst.Show();
    }   
}
 
 
/*====================================================================*\
 FUNCTION : createGroup() 
 PURPOSE  : Command to create a new group with selected items 
\*====================================================================*/
function createGroup (groupName /* string */)
{ 
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");    
/*--------------------------------------------------------------------*\    
  Select notes, draft entities, symbol instances 
\*--------------------------------------------------------------------*/     
  var session = pfcGetProESession ();
  var selOptions = 
    pfcCreate ("pfcSelectionOptions").Create ("any_note,draft_ent,dtl_symbol");
  var selections = session.Select (selOptions, void null);
  
  if (selections == void null || selections.Count == 0)
    return;
		 
/*--------------------------------------------------------------------*\    
  Allocate and fill a sequence with the detail item handles 
\*--------------------------------------------------------------------*/     
  var items = pfcCreate ("pfcDetailItems");
  
  for (i = 0; i < selections.Count; i ++)
    {
      items.Append (selections.Item (i).SelItem);
    }
	
/*--------------------------------------------------------------------*\    
  Get the drawing which will own the group
\*--------------------------------------------------------------------*/     
  var drawing = items.Item (0).DBParent;

/*--------------------------------------------------------------------*\    
  Allocate group data and set the group items
\*--------------------------------------------------------------------*/
  var instrs = 
    pfcCreate ("pfcDetailGroupInstructions").Create (groupName, items);
  
/*--------------------------------------------------------------------*\    
  Create the group
\*--------------------------------------------------------------------*/     
  drawing.CreateDetailItem (instrs);
}

/*====================================================================*\
FUNCTION : createTableOfPoints() 
PURPOSE  : Command to create a table of points
\*====================================================================*/
function createTableOfPoints() 
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");   
  
  var widths = new Array ();
  widths [0] = 8.0;
  widths [1] = 10.0;
  widths [2] = 10.0;
  widths [3] = 10.0;
   
/*--------------------------------------------------------------------*\
  Select a coordinate system. This defines the model (the top one
  in that view), and the reference for the datum point positions.
\*--------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  
  session.CurrentWindow.SetBrowserSize (0.0);
  
  var selOptions = pfcCreate ("pfcSelectionOptions").Create("csys");
  selOptions.MaxNumSels = 1;
  var selections = session.Select (selOptions, void null);
  
  if (selections == void null || selections.Count == 0)
    return;
  
/*--------------------------------------------------------------------*\    
  Extract the csys handle, and assembly path, and view handle.
\*--------------------------------------------------------------------*/ 
  var selItem = selections.Item (0).SelItem;
  var selPath = selections.Item (0).Path;  
  var selView = selections.Item (0).SelView2D;
  
  if (selView == void null)
    throw new Error (0, "Must select coordinate system from a drawing view.");
  
  var drawing = selView.DBParent;
 
/*--------------------------------------------------------------------*\    
  Extract the csys location (property CoordSys from class pfcCoordSystem)
\*--------------------------------------------------------------------*/
  var csysTransf = selItem.CoordSys;
  csysTransf.Invert ();
  
/*--------------------------------------------------------------------*\    
  Extract the cys name
\*--------------------------------------------------------------------*/
  var csysName = selItem.GetName();    
 
/*--------------------------------------------------------------------*\    
  Get the root solid, and the transform from the root to the
  component owning the csys
\*--------------------------------------------------------------------*/
  
  var asmTransf = void null;
  var rootSolid = selItem.DBParent;
  if (selPath != void null)
    {
      rootSolid = selPath.Root;
      asmTransf = selPath.GetTransform(false);   
    }

/*--------------------------------------------------------------------*\ 
  Get a list of datum points in the model
\*--------------------------------------------------------------------*/
  
  var points = rootSolid.ListItems (
				    pfcCreate ("pfcModelItemType").ITEM_POINT);
  
  if (points == void null || points.Count == 0)
    return;

/*--------------------------------------------------------------------*\    
  Set the table position
\*--------------------------------------------------------------------*/ 
  var location = pfcCreate ("pfcPoint3D");
  location.Set (0, 200.0);
  location.Set (1, 600.0);
  location.Set (2, 0.0);
	   
/*--------------------------------------------------------------------*\    
  Setup the table creation instructions
\*--------------------------------------------------------------------*/ 
  var instrs = 
    pfcCreate ("pfcTableCreateInstructions").Create (location);   
  
  instrs.SizeType =
    pfcCreate ("pfcTableSizeType").TABLESIZE_BY_NUM_CHARS;
  
  var columnInfo = pfcCreate ("pfcColumnCreateOptions");
  
  for (i = 0; i < widths.length; i++)
    {
      var column = pfcCreate ("pfcColumnCreateOption").Create (
                  pfcCreate ("pfcColumnJustification").COL_JUSTIFY_LEFT,
		  widths [i]);
      columnInfo.Append (column);
    }
  instrs.ColumnData = columnInfo;
  
  var rowInfo = pfcCreate ("realseq");
  
  for (i = 0; i < points.Count + 2; i++)
    {
      rowInfo.Append (1.0);
    }
  instrs.RowHeights = rowInfo;

/*--------------------------------------------------------------------*\    
  Create the table
\*--------------------------------------------------------------------*/    
  var dwgTable = drawing.CreateTable (instrs);
  
/*--------------------------------------------------------------------*\    
  Merge the top row cells to form the header
\*--------------------------------------------------------------------*/ 
  var topLeft = pfcCreate ("pfcTableCell").Create (1, 1);
  var bottomRight = pfcCreate ("pfcTableCell").Create (1, 4);
  dwgTable.MergeRegion (topLeft, bottomRight, void null);

/*--------------------------------------------------------------------*\    
  Write header text specifying model and csys
\*--------------------------------------------------------------------*/
  writeTextInCell (dwgTable, 1, 1, 
		   "Datum points for "+rootSolid.FileName + " w.r.t. csys "+csysName);    

/*--------------------------------------------------------------------*\    
  Add subheadings to columns
\*--------------------------------------------------------------------*/
  writeTextInCell (dwgTable, 2, 1, "Point");
  writeTextInCell (dwgTable, 2, 2, "X");
  writeTextInCell (dwgTable, 2, 3, "Y");
  writeTextInCell (dwgTable, 2, 4, "Z");

/*--------------------------------------------------------------------*\ 
  For each datum point...
\*--------------------------------------------------------------------*/    
  for(p=0; p<points.Count; p++)
    { 
      var point = points.Item (p);
/*--------------------------------------------------------------------*\    
  Add the point name to column 1
\*--------------------------------------------------------------------*/   
      writeTextInCell (dwgTable, p+3, 1, point.GetName());
      
/*--------------------------------------------------------------------*\   
 Transform the location w.r.t to the csys
\*--------------------------------------------------------------------*/
      var trfPoint = point.Point;
      if (asmTransf != void null)
	trfPoint = asmTransf.TransformPoint (point.Point);
      trfPoint = csysTransf.TransformPoint (trfPoint);

/*--------------------------------------------------------------------*\   
  Add the XYZ to column 2,3,4
\*--------------------------------------------------------------------*/   
      writeTextInCell (dwgTable, p+3, 2, trfPoint.Item (0));
      writeTextInCell (dwgTable, p+3, 3, trfPoint.Item (1));
      writeTextInCell (dwgTable, p+3, 4, trfPoint.Item (2));   
    }
/*--------------------------------------------------------------------*\  
  Display the table
\*--------------------------------------------------------------------*/
  dwgTable.Display ();
}
 
/*====================================================================*\
FUNCTION : writeTextInCell() 
PURPOSE  : Utility to add one text line to a table cell
\*====================================================================*/
function writeTextInCell(table /* pfcTable */, row /* integer */,
			 col /* integer */, text /* string */)
{
  var cell = pfcCreate ("pfcTableCell").Create (row, col);
  var lines = pfcCreate ("stringseq");
  lines.Append (text);
  table.SetText (cell, lines);
}

/*====================================================================*\
FUNCTION: createPointDims() 
PURPOSE  : Command to create dimensions to each of the models' datum points
\*====================================================================*/
function createPointDims()
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");   
  var hBaseline = void null;
  var vBaseline = void null;

/*--------------------------------------------------------------------*\
  Select a coordinate system. This defines the model (the top one
  in that view), and the common attachments for the dimensions
\*--------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  
  session.CurrentWindow.SetBrowserSize (0.0);
  
  var selOptions = pfcCreate ("pfcSelectionOptions").Create("csys");
  selOptions.MaxNumSels = 1;
  var selections = session.Select (selOptions, void null);
  
  if (selections == void null || selections.Count == 0)
    return;
	    
/*--------------------------------------------------------------------*\    
  Extract the csys handle, and assembly path, and view handle.
\*--------------------------------------------------------------------*/
  var csysSel = selections.Item (0);
  var selItem = csysSel.SelItem;
  var selPath = csysSel.Path;  
  var selView = csysSel.SelView2D;
  var selPos = csysSel.Point;
  
  if (selView == void null)
    throw new Error (0, "Must select coordinate system from a drawing view.");
  
  var drawing = selView.DBParent;
	
/*--------------------------------------------------------------------*\    
  Get the root solid, and the transform from the root to the
  component owning the csys
\*--------------------------------------------------------------------*/

  var asmTransf = void null;
  var rootSolid = selItem.DBParent;
  if (selPath != null)
    {
      rootSolid = selPath.Root;
      asmTransf = selPath.GetTransform(true);   
    }
  
/*--------------------------------------------------------------------*\ 
  Get a list of datum points in the model
\*--------------------------------------------------------------------*/
  
  var points = 
    rootSolid.ListItems (pfcCreate ("pfcModelItemType").ITEM_POINT);
  
  if (points == void null || points.Count == 0)
    return;
  
/*--------------------------------------------------------------------*\
  Calculate where the csys is located on the drawing
\*--------------------------------------------------------------------*/ 
  
  var csysPos = selPos;
  if (asmTransf != void null)
    {
      csysPos = asmTransf.TransformPoint (selPos);
    }
  var viewTransf = selView.GetTransform();
  csysPos = viewTransf.TransformPoint (csysPos);
  
  var csys3DPos = pfcCreate ("pfcVector2D");
  
  csys3DPos.Set (0, csysPos.Item (0));
  csys3DPos.Set (1, csysPos.Item (1));  
  
/*--------------------------------------------------------------------*\    
  Get the view outline
\*--------------------------------------------------------------------*/    
  var outline = selView.Outline;
  
/*--------------------------------------------------------------------*\    
  Allocate the attachment arrays
\*--------------------------------------------------------------------*/    
  var senses = pfcCreate ("pfcDimensionSenses");
  var attachments = pfcCreate ("pfcSelections");
	
/*--------------------------------------------------------------------*\    
  For each datum point...
\*--------------------------------------------------------------------*/    
  for(var p=0; p <points.Count; p++)
    {
      
/*--------------------------------------------------------------------*\  
  Calculate the position of the point on the drawing
\*--------------------------------------------------------------------*/ 
      var point = points.Item (p);
      var pntPos = point.Point;
      
      pntPos = viewTransf.TransformPoint (pntPos);
      
/*--------------------------------------------------------------------*\  
  Set up the "sense" information
\*--------------------------------------------------------------------*/  
      var sense1 = pfcCreate ("pfcPointDimensionSense").Create (
		 	pfcCreate ("pfcDimensionPointType").DIMPOINT_CENTER);
      senses.Set (0, sense1);
      var sense2 = pfcCreate ("pfcPointDimensionSense").Create (
			pfcCreate ("pfcDimensionPointType").DIMPOINT_CENTER);
      senses.Set (1, sense2);
		
/*--------------------------------------------------------------------*\ 
  Set the attachment information
\*--------------------------------------------------------------------*/
      var pntSel = 
	pfcCreate ("MpfcSelect").CreateModelItemSelection (point, 
							   void null);
      pntSel.SelView2D = selView;
      attachments.Set (0, pntSel);
      attachments.Set (1, csysSel);
		
/*--------------------------------------------------------------------*\  
  Calculate the dim position to be just to the left of the
  drawing view, midway between the point and csys
\*--------------------------------------------------------------------*/ 
      var dimPos = pfcCreate ("pfcVector2D");
      dimPos.Set (0, outline.Item (0).Item (0) - 20.0);
      dimPos.Set (1, (csysPos.Item (1) + pntPos.Item (1))/2.0);
		
/*--------------------------------------------------------------------*\  
  Create and display the dimension
\*--------------------------------------------------------------------*/
      var createInstrs = 
	pfcCreate ("pfcDrawingDimCreateInstructions").Create (attachments, 
							      senses,
							      dimPos, 
							      pfcCreate ("pfcOrientationHint").ORIENTHINT_VERTICAL);
      var dim = drawing.CreateDrawingDimension (createInstrs);
      
      var showInstrs =
	pfcCreate ("pfcDrawingDimensionShowInstructions").Create (selView, 
																	void null);
      dim.Show (showInstrs);
      
/*--------------------------------------------------------------------*\    
  If this is the first vertical dim, create an ordinate base
  line from it, else just convert it to ordinate
\*--------------------------------------------------------------------*/  
      if(p==0)
	{
	  vBaseline = dim.ConvertToBaseline (csys3DPos);
	}
      
      else
	dim.ConvertToOrdinate (vBaseline);
		    
/*--------------------------------------------------------------------*\   
  Set this dimension to be horizontal
\*--------------------------------------------------------------------*/   
      createInstrs.OrientationHint =
	pfcCreate ("pfcOrientationHint").ORIENTHINT_HORIZONTAL;
/*--------------------------------------------------------------------*\    
  Calculate the dim position to be just to the bottom of the
  drawing view, midway between the point and csys
\*--------------------------------------------------------------------*/   
      dimPos.Set (0, (csysPos.Item (0) + pntPos.Item (0))/2.0);
      dimPos.Set (1, outline.Item (1).Item (1) - 20.0);
      
      createInstrs.TextLocation = dimPos;
      
/*--------------------------------------------------------------------*\    
  Create and display the dimension
\*--------------------------------------------------------------------*/ 
      dim = drawing.CreateDrawingDimension (createInstrs);
      dim.Show (showInstrs);
      
/*--------------------------------------------------------------------*\     
  If this is the first horizontal dim, create an ordinate base line
  from it, else just convert it to ordinate
\*--------------------------------------------------------------------*/   
      if(p==0)
	{
	  hBaseline = dim.ConvertToBaseline (csys3DPos);
	}
      
      else
	dim.ConvertToOrdinate (hBaseline);
      
    }
}





