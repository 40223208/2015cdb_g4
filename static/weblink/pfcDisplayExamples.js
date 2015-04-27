/*

  HISTORY:
 
 14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
 07-MAR-03   K-01-03   $$2   JCN      UNIX support
 02-Jun-03   K-01-08   $$3   JCN      Fix comparison for mouse button
*/

/* 
   This example demonstrates the use of mouse tracking methods to draw graphics
   on the screen.  The static method DrawRubberbandLine prompts the user to
   pick a screen point.  The example uses 'complement mode' to cause the line 
   to display and erase as the user moves the mouse around the window.  
   
   NOTE:  This example uses the method transformPosition to convert the 
   coordinates into the 3D coordinate system of a solid model, if one is 
   displayed.
*/
function drawRubberbandLine () 
{
  
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");	
/*--------------------------------------------------------------------*\ 
  Select the first end of the rubber band line.  Expect the user to pick with 
  the left mouse button.
\*--------------------------------------------------------------------*/      
  var session = pfcGetProESession();
  
  session.CurrentWindow.SetBrowserSize (0.0);
  
  mouse = session.UIGetNextMousePick (pfcCreate ("pfcMouseButton").MOUSE_BTN_LEFT);
  
/*--------------------------------------------------------------------*\ 
  Transform screen point -> model location, if necessary
\*--------------------------------------------------------------------*/  
  var firstPos = transformPosition (session, mouse.Position);
  
/*--------------------------------------------------------------------*\ 
  Set graphics mode to complement, so that graphics erase after use. 
\*--------------------------------------------------------------------*/ 
  var currentMode = session.CurrentGraphicsMode;
  session.CurrentGraphicsMode = pfcCreate ("pfcGraphicsMode").DRAW_GRAPHICS_COMPLEMENT;
  
/*--------------------------------------------------------------------*\ 
  Get current mouse position.
\*--------------------------------------------------------------------*/ 
  var mouse = session.UIGetCurrentMouseStatus (false);
  while (mouse.SelectedButton == pfcCreate ("pfcMouseButton").MouseButton_nil)
    {  
      session.SetPenPosition (firstPos);
      var secondPos = transformPosition (session, mouse.Position);

/*--------------------------------------------------------------------*\ 
  Draw rubberband line 
\*--------------------------------------------------------------------*/ 
      session.DrawLine (secondPos);
      
      mouse = session.UIGetCurrentMouseStatus (false);
      
/*--------------------------------------------------------------------*\ 
  Erase previously drawn line
\*--------------------------------------------------------------------*/ 
      session.SetPenPosition (firstPos);
      session.DrawLine (secondPos);    
    }
  
  session.CurrentGraphicsMode =  currentMode;
  
  return;
}


/* This method transforms the 2D screen coordinates into 
   3D model coordinates - if necessary. */
function transformPosition (s /* pfcSession */, inPnt /* pfcPoint3D */)
{
  var mdl = s.CurrentModel;
  
/*--------------------------------------------------------------------*\ 
  Skip transform if not in 3D model 
\*--------------------------------------------------------------------*/ 
  if (mdl == void null)
    return inPnt;
  
  var type = mdl.Type;
  var modelTypeClass =  pfcCreate ("pfcModelType");
  var isSolid = ((type == modelTypeClass.MDL_PART) || 
		 (type == modelTypeClass.MDL_ASSEMBLY) || 
		 (type == modelTypeClass.MDL_MFG));
  if (!isSolid)
    return inPnt;
  
/*--------------------------------------------------------------------*\ 
  Get current view's orientation and invert it
\*--------------------------------------------------------------------*/ 
  var currView = mdl.GetCurrentView();
  var invOrient = currView.Transform;
  invOrient.Invert();
  
/*--------------------------------------------------------------------*\ 
  Get the point in the model csys
\*--------------------------------------------------------------------*/ 
  var outPnt = invOrient.TransformPoint (inPnt);
  
  return outPnt;
}
