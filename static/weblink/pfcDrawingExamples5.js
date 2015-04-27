/*  
   HISTORY

23-JUL-07   L-01-35   $$1  SNV     Created and submitted

*/

/*====================================================================*\
 FUNCTION : placeDetailSymbol() 
 PURPOSE  : This function creates a free instance of a symbol 
 			definition with drawing unit heights, variable text and 
 			groups. A symbol is placed with no leaders at a specified 
 			location.  
\*====================================================================*/
function placeDetailSymbol(groupName , variableText, symHeight)
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
  var symDef = drawing.RetrieveSymbolDefinition ("detail_symbol_example", 
						 "./", void null, void null);
  
/*--------------------------------------------------------------------*\ 
  Select the locations for the symbol
\*--------------------------------------------------------------------*/
  var browserSize = session.CurrentWindow.GetBrowserSize();
  session.CurrentWindow.SetBrowserSize (0.0);
  
  var stop = false;
  var point
  while (!stop)
    {
	    var mouse = 
		session.UIGetNextMousePick (pfcCreate ("pfcMouseButton").MouseButton_nil);
	      
	    if (mouse.SelectedButton == pfcCreate ("pfcMouseButton").MOUSE_BTN_LEFT)
		{
		  point = mouse.Position;
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
    
/*--------------------------------------------------------------------*\    
 Set the symbol height in drawing units 
\*--------------------------------------------------------------------*/ 
  if (symHeight > 0)
  {
	  instrs.ScaledHeight = symHeight;
  }    

/*--------------------------------------------------------------------*\    
 Set text to the variable text in the symbol. This will be displayed 
 instead of the text defined when creating the symbol
\*--------------------------------------------------------------------*/        
  if (variableText != void null)
  {
	  var varText = pfcCreate ("pfcDetailVariantText").Create("VAR_TEXT" , variableText);
	  var varTexts = pfcCreate("pfcDetailVariantTexts");
	  varTexts.Append(varText);
	  
	  instrs.TextValues = varTexts;
  }

/*--------------------------------------------------------------------*\    
 Display the groups in symbol depending on group name
\*--------------------------------------------------------------------*/ 	    
  if (groupName == "ALL")
  	instrs.SetGroups(pfcCreate("pfcDetailSymbolGroupOption").DETAIL_SYMBOL_GROUP_ALL , null);
  else if (groupName == "NONE")
    instrs.SetGroups(pfcCreate("pfcDetailSymbolGroupOption").DETAIL_SYMBOL_GROUP_NONE , null);
  else
  {
  	var allGroups = instrs.SymbolDef.ListSubgroups();
  	group = getGroup(allGroups , groupName );
  	if (group != void null)
  	{
  		groups = pfcCreate("pfcDetailSymbolGroups");
  		groups.Append(group);
  		instrs.SetGroups (pfcCreate("pfcDetailSymbolGroupOption").DETAIL_SYMBOL_GROUP_CUSTOM , groups);
  	}			
  }
                
/*--------------------------------------------------------------------*\    
  Set the attachment structure
\*--------------------------------------------------------------------*/ 
  var position = pfcCreate ("pfcFreeAttachment").Create (point);
  var allAttachments = pfcCreate ("pfcDetailLeaders").Create ();	
  allAttachments.ItemAttachment = position;
  
  instrs.InstAttachment = allAttachments;

/*--------------------------------------------------------------------*\    
  Create and display the symbol 
\*--------------------------------------------------------------------*/  
  var symInst = drawing.CreateDetailItem (instrs);
  symInst.Show();
       
}

/*====================================================================*\
 FUNCTION : getGroup() 
 PURPOSE  : Return the specific group depending on the group name. 
\*====================================================================*/    
function getGroup(groups, groupName)
{
    var group;
    var groupInstrs;
    
    if (groups.Count <=0 )
    {
	    return null;
    }
    
/*--------------------------------------------------------------------*\    
   Loop through all the groups in the symbol and return the group with 
   the selected name
\*--------------------------------------------------------------------*/  
    for(var i=0;i<groups.Count;i++)
    {
	    group = groups.Item(i);
	    groupInstrs = group.GetInstructions();
	    
	    if (groupInstrs.Name == groupName)
	    	return group;		    
    }
    return null;	    
}
