/*
   HISTORY
   
14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
07-MAR-03   K-01-03   $$2   JCN      UNIX support
*/
 
/*
  This example code demonstrates how to invoke an interactive selection. 
*/
function selectItems (options /* string[] */, max /* integer */)
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  
/*--------------------------------------------------------------------*\ 
  Get the session. If no model in present abort the operation. 
\*--------------------------------------------------------------------*/  
  var session = pfcGetProESession ();
  var model = session.CurrentModel;
  
  if (model == void null)
    throw new Error (0, "No current model.");
  
/*--------------------------------------------------------------------*\ 
  Collect the options array into a comma delimited list
\*--------------------------------------------------------------------*/  
  var optString = "";
  for (var i = 0; i < options.length; i++)
    {
      optString += options [i];
      if (i != options.length -1)
	optString += ",";
    }
  
/*--------------------------------------------------------------------*\ 
  Prompt for selection.
\*--------------------------------------------------------------------*/  
  selOptions = pfcCreate ("pfcSelectionOptions").Create (optString);
  
  if (max != "UNLIMITED")
    {
      selOptions.MaxNumSels = parseInt (max);
    }
  
  session.CurrentWindow.SetBrowserSize (0.0);
  
  var selections = void null;
  try {
    selections = session.Select (selOptions, void null);
  }
  catch (err) {
/*--------------------------------------------------------------------*\ 
  Handle the situation where the  user didn't make selections, but picked 
  elsewhere instead.
  \*--------------------------------------------------------------------*/  
    if (pfcGetExceptionType (err) == "pfcXToolkitUserAbort" || 
	pfcGetExceptionType (err) == "pfcXToolkitPickAbove")
      return (void null);
    else
      throw err;
  }
  if (selections.Count == 0)
    return (void null);
  
/*--------------------------------------------------------------------*\ 
  Write selection info to the browser window
\*--------------------------------------------------------------------*/  
  var newWin = window.open ('', "_IS", "scrollbars");
  if (pfcIsWindows())
    {
      newWin.resizeTo (300, screen.height/2.0);
      newWin.moveTo (screen.width-300, 0);
    }
  newWin.document.writeln ("<html><head></head><body>");
  
  for (var i = 0; i < selections.Count; i ++)
    {
      var sel = selections.Item (i);
      newWin.document.writeln ("<h2>Selection "+(i+1)+": </h2>");
      newWin.document.writeln ("<table>");
      
      var selModelName = "N/A";
      if (sel.SelModel != void null)
	selModelName = sel.SelModel.FullName;	
      newWin.document.writeln ("<tr><td>Sel model: </td><td>"+
			       selModelName+"</td></tr>");
      
      var selItemInfo = "N/A";
      if (sel.SelItem != void null)
	selItemInfo = "Type: "+ sel.SelItem.Type.toString() + 
	  " id: "+sel.SelItem.Id;
      
      newWin.document.writeln ("<tr><td>Sel item: </td><td>" +
			       selItemInfo + "</td></tr>");
      newWin.document.writeln ("</table>");
    }
  
  newWin.document.writeln ("<html><head></head><body>");
  
  return (selections);
}


/* 
   This method highlights all the features in all levels of an assembly that have a given name. 
*/
function createAndHighlightSelections (featureName /* string */)
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  
/*--------------------------------------------------------------------*\ 
  Get the session. If no model in present abort the operation. 
\*--------------------------------------------------------------------*/  
  var session = pfcGetProESession ();
  var assem = session.CurrentModel;
  
  if (assem == void null || 
      assem.Type != pfcCreate ("pfcModelType").MDL_ASSEMBLY)
    throw new Error (0, "Current model is not an assembly.");
  
/*--------------------------------------------------------------------*\ 
  Start a recursive traversal of the assembly structure. 
\*--------------------------------------------------------------------*/ 
  intPath = pfcCreate ("intseq");
  
  highlightFeaturesRecursively (assem, intPath, featureName);
}

function highlightFeaturesRecursively (assem /* pfcAssembly */, 
				       intPath /* intseq */,
				       featureName /* string */)
{
/*--------------------------------------------------------------------*\ 
  Obtain the model at the current assembly level.
\*--------------------------------------------------------------------*/
  var subcomponent;
  var cmpPath = void null;
  if (intPath.Count == 0)
    subcomponent = assem;
  else
    {
      cmpPath = 
	pfcCreate ("MpfcAssembly").CreateComponentPath( assem, intPath );
      subcomponent = cmpPath.Leaf; 
    }
   
/*--------------------------------------------------------------------*\ 
  Search for the desired feature.
\*--------------------------------------------------------------------*/ 
  var theFeat = subcomponent.GetFeatureByName (featureName);
  if (theFeat != void null)
    {
      var cmpSelection = 
	pfcCreate ("MpfcSelect").CreateModelItemSelection ( theFeat, cmpPath );
      
      cmpSelection.Highlight(pfcCreate ("pfcStdColor").COLOR_HIGHLIGHT);
    }
  
/*--------------------------------------------------------------------*\ 
  Search for subcomponents, and traverse each of them.
\*--------------------------------------------------------------------*/ 
  var components = subcomponent.ListFeaturesByType(true, 
	    pfcCreate ("pfcFeatureType").FEATTYPE_COMPONENT);
  for (var i = 0; i < components.Count; i++)
    {
      var compFeat = components.Item (i);
      if (compFeat.Status == pfcCreate ("pfcFeatureStatus").FEAT_ACTIVE)
	{
	  intPath.Append (components.Item (i).Id);
	  highlightFeaturesRecursively (assem, intPath, featureName); 
	}
    }
    
/*--------------------------------------------------------------------*\ 
  Clean up the assembly ids at this level before returning.
\*--------------------------------------------------------------------*/ 
  if (intPath.Count > 0)
    {
      intPath.Remove (intPath.Count - 1, intPath.Count);
    } 
}
