/*
   HISTORY
   
14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
07-MAR-03   K-01-03   $$2   JCN      UNIX support
*/

/* This method retrieves a MassProperty object from the provided solid
 * model. Then solid's mass, volume, and center of gravity point are printed
 */
function printMassProperties ()
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  
/*--------------------------------------------------------------------*\ 
  Get the session. If no model in present abort the operation. 
\*--------------------------------------------------------------------*/  
  var session = pfcGetProESession ();
  var solid = session.CurrentModel;
  
  if (solid == void null || (solid.Type != pfcCreate ("pfcModelType").MDL_PART &&
			     solid.Type != pfcCreate ("pfcModelType").MDL_ASSEMBLY))
    throw new Error (0, "Current model is not a part or assembly.");
  
/*--------------------------------------------------------------------*\ 
  Calculate the mass properties.  Pass null to use the model 
	coordinate system.
\*--------------------------------------------------------------------*/  
  properties = solid.GetMassProperty(void null);
  
/*--------------------------------------------------------------------*\ 
  Display selected results.
\*--------------------------------------------------------------------*/  
  var newWin = window.open ('', "_MP", "scrollbars");
  if (pfcIsWindows())
    {
      newWin.resizeTo (300, screen.height/2.0);
      newWin.moveTo (screen.width-300, 0);
    }
  newWin.document.writeln ("<html><head></head><body>");
  
  newWin.document.writeln ("<p>The solid mass is: " + properties.Mass);
  newWin.document.writeln ("<p>The solid volume is: " + properties.Volume);
  
  COG = properties.GravityCenter;
  newWin.document.writeln ("<hr><p>The Center Of Gravity is at ");
  newWin.document.writeln ("<table>");
  newWin.document.writeln ("<tr><td>X</td><td>"+COG.Item(0)+"</td></tr>");
  newWin.document.writeln ("<tr><td>Y</td><td>"+COG.Item(1)+"</td></tr>");
  newWin.document.writeln ("<tr><td>Z</td><td>"+COG.Item(2)+"</td></tr>");
  newWin.document.writeln ("</table>");	
  newWin.document.writeln ("<html><head></head><body>");
}
