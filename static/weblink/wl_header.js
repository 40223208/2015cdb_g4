/*
   HISTORY
   
14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
07-MAR-03   K-01-03   $$2   JCN      UNIX support
 */


try
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  
  wpwl = pfcGetScript ();
  document.pwl = wpwl;
  wpwlc = wpwl.GetPWLConstants ();
  document.pwlc = wpwlc;
  wpwlf = wpwl.GetPWLFeatureConstants ();
  document.pwlf = wpwlf;
}
catch (err)
{
  alert ("Exception caught: "+pfcGetExceptionType (err));
}

function WlProEStart()
{ 
  if (document.pwl == void null)
    {
      alert("Connect failed.");
      return ;
    }
}

function WlProEConnect()
//	Connect to a running Pro/ENGINEER session.
{
  WlProEStart();
}

function WlModelOpen()
//	Open a Pro/ENGINEER model.
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  if (document.main.ModelName.value == "")
    return ;
  var ret = document.pwl.pwlMdlOpen(document.main.ModelName.value,
				    document.main.ModelPath.value, true);
  if (!ret.Status)
    {
      if (ret.ErrorCode == -4 && document.main.ModelPath.value == "")
	return ;
      else
        {
	  alert("pwlMdlOpen failed (" + ret.ErrorCode + ")");
	  return ;
        }
    }
}

function WlModelRegenerate()
//	Regenerate the Pro/ENGINEER model.
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  var ret = document.pwl.pwlMdlRegenerate(document.main.ModelNameExt.value);
  if (!ret.Status)
    {
      alert("pwlMdlRegenerate failed (" + ret.ErrorCode + ")");
      return ;
    }
}

function WlModelSave()
//	Save a Pro/ENGINEER model.
{ 
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  var ret = document.pwl.pwlMdlSaveAs(document.main.ModelNameExt.value, void null, void null);
  if (!ret.Status)
    {
      alert("pwlMdlSaveAs failed (" + ret.ErrorCode + ")");
      return ;
    }
}

function WlModelSaveAs()
//	Save a Pro/ENGINEER model under a new name.
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  var NewPath = document.main.NewPath.value;
  var NewName = document.main.NewName.value;
  if (NewPath == "")
    {
      NewPath = void null;
    }
  if (NewName == "")
    {
      NewName = void null;
    }
  var ret = document.pwl.pwlMdlSaveAs(document.main.ModelNameExt.value,
				      NewPath, NewName);
  if (!ret.Status)
    {
      alert("pwlMdlSaveAs failed (" + ret.ErrorCode + ")");
      return ;
    }
}

function WlWindowRepaint()
//	Repaint the active window.
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  var get_ret = document.pwl.pwlWindowActiveGet();
  if (!get_ret.Status)
    {
      alert("pwlWindowActiveGet failed (" + get_ret.ErrorCode + ")");
      return ;
    }
  /* You can also repaint the active window using -1 as the window
     identifier. */
  var ret = document.pwl.pwlWindowRepaint(parseInt(get_ret.WindowID));
  if (!ret.Status)
    {
      alert("pwlWindowRepaint failed (" + ret.ErrorCode + ")");
      return ;
    }
}

// Define the form with all the buttons to perform the above actions.
document.writeln("<form name='main'>");

document.writeln("<hr>");
document.writeln("<h4>Main Controls</h4>");
document.writeln("<p>");
document.writeln("<center>");
document.writeln("<input type='button' value='Start Pro/E' onclick='WlProEStart()'>");
document.writeln("<input type='button' value='Connect to Pro/E' onclick='WlProEConnect()'>");
document.writeln("<p>");
document.writeln("Path: <input type='text' name='ModelPath' onchange='WlModelOpen()'>");
document.writeln("<spacer size=20>");
document.writeln("Model: <input type='text' name='ModelName' onchange='WlModelOpen()'>");
document.writeln("<spacer size=20>");
document.writeln("<input type='button' value='Open Model' onclick='WlModelOpen()'>");
document.writeln("<p>");
document.writeln("<table>");
document.writeln("<tr>");
document.writeln("<td><center>Model:</center></td>");
document.writeln("<td><center>New Path:</center></td>");
document.writeln("<td><center>New Name:</center></td></tr>");
document.writeln("<tr>");
document.writeln("<td><input type='text' name='ModelNameExt'></td>");
document.writeln("<td><input type='text' name='NewPath'></td>");
document.writeln("<td><input type='text' name='NewName'></td></tr>");
document.writeln("</table>");
document.writeln("<input type='button' value='Regenerate Model' onclick='WlModelRegenerate()'>");
document.writeln("<spacer size=10>");
document.writeln("<input type='button' value='Save Model' onclick='WlModelSave()'>");
document.writeln("<spacer size=10>");
document.writeln("<input type='button' value='Save Model As' onclick='WlModelSaveAs()'>");
document.writeln("<p>");
document.writeln("<input type='button' value='REPAINT  SCREEN' onclick='WlWindowRepaint()'>");
document.writeln("</center>");
document.writeln("<hr>");

document.writeln("</form>");
