/*
   HISTORY

14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
07-MAR-03   K-01-03   $$2   JCN      UNIX support
*/

/*
   This method allows a user to evaluate the assembly for a presence of any
   interferences. Upon finding one, this method will highlight the interfering
   surfaces, compute and highlight the interference volume.
*/
function showInterferences()
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

/*--------------------------------------------------------------------*\ 
  Get the current assembly 
\*--------------------------------------------------------------------*/  
  var session = pfcGetProESession ();
  var assembly = session.CurrentModel;
  
  if (assembly.Type != pfcCreate ("pfcModelType").MDL_ASSEMBLY)
    throw new Error (0, "Current model is not an assembly");
  
/*--------------------------------------------------------------------*\ 
  Calculate the assembly interference
\*--------------------------------------------------------------------*/
  var gblEval = 
    pfcCreate ("MpfcInterference").CreateGlobalEvaluator(assembly);
  
  var gblInters = gblEval.ComputeGlobalInterference(true);
  
  if (gblInters != void null)
    {
      var size = gblInters.Count;
      
/*--------------------------------------------------------------------*\ 
  For each interference object display the interfering surfaces
  and compute the interference volume
\*--------------------------------------------------------------------*/
      session.CurrentWindow.SetBrowserSize (0.0);
      session.CurrentWindow.Repaint();
      alert ("Interferences detected, highlighting each instance.");
      for (var i = 0; i < size; i++)
	{
	  var gblInter = gblInters.Item (i);
	  
	  var selectPair = gblInter.SelParts;
	  var sel1 = selectPair.Sel1;
	  var sel2 = selectPair.Sel2;
	  sel1.Highlight(pfcCreate ("pfcStdColor").COLOR_HIGHLIGHT);
	  sel2.Highlight(pfcCreate ("pfcStdColor").COLOR_HIGHLIGHT);
	  
	  var vol = gblInter.Volume;
	  var totalVolume = vol.ComputeVolume();
	  vol.Highlight(pfcCreate ("pfcStdColor").COLOR_PREHIGHLIGHT);
	  alert ("Interference " + (i + 1) + " = " + totalVolume);
	  
	  sel1.UnHighlight();
	  sel2.UnHighlight();			
	}
    }
}
