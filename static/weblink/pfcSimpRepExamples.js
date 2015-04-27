/*
   HISTORY
   
02-Aug-10   L-05-28   $$1   pdeshmuk      Created.

*/

function deleteItemsInSimpRep ()
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
   Get the current active simprep.
 \*--------------------------------------------------------------------*/  
  var simp_rep = assembly.GetActiveSimpRep();
 
 /*--------------------------------------------------------------------*\ 
   Get the current number of items
 \*--------------------------------------------------------------------*/  
  var simp_rep_instructions = simp_rep.GetInstructions();
    
  var number_items = simp_rep_instructions.Items.Count;
  document.getElementById("numItems").value = number_items;

 
 /*--------------------------------------------------------------------*\ 
   Deleting items
 \*--------------------------------------------------------------------*/  				
  var simp_rep_instructions_item = simp_rep_instructions.Items.Item(number_items-1);
  simp_rep_instructions_item.Action = null;    
  simp_rep.SetInstructions(simp_rep_instructions);  
  number_items = simp_rep.GetInstructions().Items.Count;
  document.getElementById("numItems").value = number_items;
  

  
  return;
}


    


function addItemsInSimpRep ()
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
   Get the current active simprep.
 \*--------------------------------------------------------------------*/  
  var simp_rep = assembly.GetActiveSimpRep();
 
 /*--------------------------------------------------------------------*\ 
   Get the current number of items
 \*--------------------------------------------------------------------*/  
  var simp_rep_instructions = simp_rep.GetInstructions();
    
  var number_items = simp_rep_instructions.Items.Count;
  document.getElementById("numItems").value = number_items;			

  
 /*--------------------------------------------------------------------*\ 
   Add an item  
 \*--------------------------------------------------------------------*/  
  var item_path = pfcCreate ("intseq");
  
  /*--------------------------------------------------------------------*\ 
  Prompt for selection.
\*--------------------------------------------------------------------*/  
  selOptions = pfcCreate ("pfcSelectionOptions").Create ("feature");
  
  selOptions.MaxNumSels = parseInt (1);
  
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

  var selection = selections.Item(0);
  var componentpath = selection.Path;
  var intseqIds = componentpath.ComponentIds;
  item_path.Append(intseqIds.Item(0));
  simp_rep_comp_item_path = pfcCreate("pfcSimpRepCompItemPath").Create(item_path);
  
  simp_rep_item = pfcCreate("pfcSimpRepItem").Create(simp_rep_comp_item_path);
  
  simp_rep_action = pfcCreate("pfcSimpRepExclude").Create();
  
  simp_rep_item.Action = simp_rep_action;
  
  simp_rep_instructions.Items.Append(simp_rep_item);
  
  simp_rep.SetInstructions(simp_rep_instructions);
  
  simp_rep_instructions = simp_rep.GetInstructions();
  
  number_items = simp_rep_instructions.Items.Count;
  document.getElementById("numItems").value = number_items;	
  
  return;
}

