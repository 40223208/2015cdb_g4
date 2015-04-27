/*
   HISTORY
   
14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
07-MAR-03   K-01-03   $$2   JCN      UNIX support

*/

function replaceBoltsInAssembly ()
{
  var oldInstance = "PHILLIPS7_8";
  var newInstance = "SLOT7_8";
  
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
   Get the new instance model for use in replacement
 \*--------------------------------------------------------------------*/  
  var bolt = session.GetModel ("BOLT", pfcCreate ("pfcModelType").MDL_PART);
  
  var row = bolt.GetRow (newInstance);  
  
  var newBolt = row.CreateInstance();
  
  var replaceOps = pfcCreate ("pfcFeatureOperations");
 
 /*--------------------------------------------------------------------*\ 
   Visit the assembly components
 \*--------------------------------------------------------------------*/  				
  var components = assembly.ListFeaturesByType (false,
						pfcCreate ("pfcFeatureType").FEATTYPE_COMPONENT);
  
  for (ii = 0; ii < components.Count; ii++)
    {
      var component = components.Item(ii);
      
      var desc = component.ModelDescr;
      
      if (desc.InstanceName == oldInstance)
	{
	  var replace = component.CreateReplaceOp (newBolt);
	  
	  replaceOps.Append (replace);
	}
    }
  
 /*--------------------------------------------------------------------*\ 
   Carry out the replacements
 \*--------------------------------------------------------------------*/  
  assembly.ExecuteFeatureOps (replaceOps, null);
  
  return;
}


/*=====================================================================*\
 This function displays each constraint of the component visually on 
 the screen, and includes a text explanation for each constraint.
\*=====================================================================*/

/*=====================================================================*\
FUNCTION: highlightConstraints
PURPOSE:  Highlights and labels a component's constraints
\*=====================================================================*/
function highlightConstraints ()
{
  
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");	
/*---------------------------------------------------------------------*\
  Get the constraints for the component.
\*---------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  
  session.CurrentWindow.SetBrowserSize (0.0);
  
  var options = pfcCreate ("pfcSelectionOptions").Create ("membfeat");
  options.MaxNumSels  = 1;
  var selections = session.Select (options, void null);
  if (selections == void null || selections.Count == 0)
    return;
  
  selections.Item(0).UnHighlight();
  
  var feature = selections.Item (0).SelItem;
  
  if (feature.FeatType != pfcCreate ("pfcFeatureType").FEATTYPE_COMPONENT)
    return;
  
  var asmcomp = feature;
  
  var constrs = asmcomp.GetConstraints ();
  
  if (constrs == void null || constrs.Count == 0)
    return;
  
  for (var i = 0; i < constrs.Count; i++)
    {
/*---------------------------------------------------------------------*\
  Highlight the assembly reference geometry
\*---------------------------------------------------------------------*/
      var c = constrs.Item (i);
      
      var asmRef = c.AssemblyReference;
      
      if (asmRef != void null)
	asmRef.Highlight (pfcCreate ("pfcStdColor").COLOR_ERROR);

/*---------------------------------------------------------------------*\
  Highlight the component reference geometry
\*---------------------------------------------------------------------*/
      var compRef = c.ComponentReference;
      
      if (compRef != void null)
	compRef.Highlight (pfcCreate ("pfcStdColor").COLOR_WARNING);
      
/*---------------------------------------------------------------------*\
  Prepare and display the message text.
\*---------------------------------------------------------------------*/
      var offset = c.Offset;
      var offsetString = "";
      if (offset != void null)
	offsetString = ", offset of "+offset;
      
      var cType  = c.Type;
      var cTypeString = constraintTypeToString (cType);
      
      alert  ("Showing constraint " + (i+1) +" of " + constrs.Count + "\n" + 
	      cTypeString + offsetString + ".");
	
/*---------------------------------------------------------------------*\
  Clean up the UI for the next constraint
\*---------------------------------------------------------------------*/
      if (asmRef != void null)
	{
	  asmRef.UnHighlight ();
	}
      
      if (compRef != void null)
	{
	  compRef.UnHighlight ();
	}
    }
}
    
/*=====================================================================*\
FUNCTION: constraintTypeToString
PURPOSE:  Utility: convert the constraint type to a string for printing
\*=====================================================================*/
function constraintTypeToString (type /* pfcComponentConstraintType */)
{	
  var constrTypeClass = pfcCreate ("pfcComponentConstraintType");
  switch (type)
    {
    case constrTypeClass.ASM_CONSTRAINT_MATE:
      return ("(Mate)");		
    case constrTypeClass.ASM_CONSTRAINT_MATE_OFF:
      return ("(Mate Offset)");		
    case constrTypeClass.ASM_CONSTRAINT_ALIGN:
      return ("(Align)");		
    case constrTypeClass.ASM_CONSTRAINT_ALIGN_OFF:
      return ("(Align Offset)");		
    case constrTypeClass.ASM_CONSTRAINT_INSERT:
      return ("(Insert)");		
    case constrTypeClass.ASM_CONSTRAINT_ORIENT:
      return ("(Orient)");		
    case constrTypeClass.ASM_CONSTRAINT_CSYS:
      return ("(Csys)");		
    case constrTypeClass.ASM_CONSTRAINT_TANGENT:
      return ("(Tangent)");		
    case constrTypeClass.ASM_CONSTRAINT_PNT_ON_SRF:
      return ("(Point on Surf)");		
    case constrTypeClass.ASM_CONSTRAINT_EDGE_ON_SRF:
      return ("(Edge on Surf)");		
    case constrTypeClass.ASM_CONSTRAINT_DEF_PLACEMENT:
      return ("(Default)");		
    case constrTypeClass.ASM_CONSTRAINT_SUBSTITUTE:
      return ("(Substitute)");		
    case constrTypeClass.ASM_CONSTRAINT_PNT_ON_LINE:
      return ("(Point on Line)");		
    case constrTypeClass.ASM_CONSTRAINT_FIX:
      return ("(Fix)");		
    case constrTypeClass.ASM_CONSTRAINT_AUTO:
      return ("(Auto)");		
    default:
      return ("(Unrecognized Type)");		
    }
}

/* 
   The following example demonstrates how to assemble a component into an
   assembly, and how to constrain the component by aligning datum planes.
   If the complete set of datum planes is not found, the function will show
   the component constraint dialog to the user to allow them to adjust the
   placement as they wish.
*/

/*=====================================================================*\
FUNCTION: UserAssembleByDatums
PURPOSE:  Assemble a component by aligning named datums.         
\*=====================================================================*/
function assembleByDatums (componentFilename /* string as ?????.??? */)
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  var interactFlag = false;
  var identityMatrix = pfcCreate ("pfcMatrix3D");
  for (var x = 0; x < 4; x++)
    for (var y = 0; y < 4; y++)
      {
	if (x == y)
	  identityMatrix.Set (x, y, 1.0);
	else
	  identityMatrix.Set (x, y, 0.0);
      }
  var transf = pfcCreate ("pfcTransform3D").Create (identityMatrix);
/*-----------------------------------------------------------------*\
  Get the current assembly
\*-----------------------------------------------------------------*/  
  var session = pfcGetProESession ();
  var model = session.CurrentModel;
  if (model == void null || model.Type != pfcCreate ("pfcModelType").MDL_ASSEMBLY)
    throw new Error (0, "Current model is not an assembly.");
  
  var assembly = model;
  
  var descr = 
    pfcCreate ("pfcModelDescriptor").CreateFromFileName (componentFilename);
  var componentModel = session.GetModelFromDescr (descr);
  
  if (componentModel == void null)
    {
      componentModel = session.RetrieveModel (descr);
    }
  
/*-----------------------------------------------------------------*\
  Set up the arrays of datum names
\*-----------------------------------------------------------------*/
  var asmDatums = new Array ("ASM_D_FRONT", "ASM_D_TOP", "ASM_D_RIGHT");
  var compDatums = new Array ("COMP_D_FRONT", 
			      "COMP_D_TOP", 
			      "COMP_D_RIGHT");
	  
/*-----------------------------------------------------------------*\
  Package the component initially
\*-----------------------------------------------------------------*/
  var asmcomp = assembly.AssembleComponent (componentModel,
					    transf);
  
/*-----------------------------------------------------------------*\
  Prepare the constraints array
\*-----------------------------------------------------------------*/
  var constrs = pfcCreate ("pfcComponentConstraints");
  
  for (var i = 0; i < 3; i++)
    {
/*-----------------------------------------------------------------*\
  Find the assembly datum 
\*-----------------------------------------------------------------*/
      var asmItem = 
	assembly.GetItemByName (pfcCreate ("pfcModelItemType").ITEM_SURFACE, 
				asmDatums [i]);
      
      if (asmItem == void null) 
	{
	  interactFlag = true;
	  continue;
	}
      
/*-----------------------------------------------------------------*\
  Find the component datum
\*-----------------------------------------------------------------*/
      var compItem = 
	componentModel.GetItemByName (pfcCreate ("pfcModelItemType").ITEM_SURFACE, 
				      compDatums [i]);
      
      if (compItem == void null) 
	{
	  interactFlag = true;
	  continue;
	}

/*-----------------------------------------------------------------*\
  For the assembly reference, initialize a component path.
  This is necessary even if the reference geometry is in the assembly.
\*-----------------------------------------------------------------*/
      var ids = pfcCreate ("intseq");
      
      var path = pfcCreate ("MpfcAssembly").CreateComponentPath (assembly,
								 ids);
      
/*-----------------------------------------------------------------*\
  Allocate the references
\*-----------------------------------------------------------------*/
      var MpfcSelect = pfcCreate ("MpfcSelect");
      var asmSel = MpfcSelect.CreateModelItemSelection (asmItem, path);
      var compSel = MpfcSelect.CreateModelItemSelection (compItem, void null);
      
/*-----------------------------------------------------------------*\
  Allocate and fill the constraint.
\*-----------------------------------------------------------------*/
      var constr = pfcCreate ("pfcComponentConstraint").Create (
								pfcCreate ("pfcComponentConstraintType").ASM_CONSTRAINT_ALIGN);
      
      constr.AssemblyReference  = asmSel;
      constr.ComponentReference = compSel;
      
      constr.Attributes = pfcCreate ("pfcConstraintAttributes").Create (false, false);
      
      constrs.Append (constr);
    }

/*-----------------------------------------------------------------*\
  Set the assembly component constraints and regenerate the assembly.
\*-----------------------------------------------------------------*/
  asmcomp.SetConstraints (constrs, void null);
  
  assembly.Regenerate (void null);
  
  session.GetModelWindow (assembly).Repaint();

/*-----------------------------------------------------------------*\
  If any of the expect datums was not found, prompt the user to constrain
  the new component.
\*-----------------------------------------------------------------*/
  if (interactFlag)
    {
      alert ("Unable to locate all required datum references.  New component is packaged.");
      asmcomp.RedefineThroughUI();
    }
}


