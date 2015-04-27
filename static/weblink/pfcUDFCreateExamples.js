/*
   HISTORY

14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
07-MAR-03   K-01-03   $$2   JCN      UNIX support
 */

/*====================================================================*\
FUNCTION: createNodeUDFInPart
PURPOSE:  Places copies of a node UDF at a particular coordinate system 
		  location in a part.  The node UDF is a spherical cut centered at the 
          coordinate system whose diameter is driven by the 'diam' argument to the 
          method.
\*====================================================================*/
function createNodeUDFInPart (csysName /* string */, 
			      diam /* number */) 
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  
/*------------------------------------------------------------------*\
  Use the current model to place the UDF.
\*------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  var solid = session.CurrentModel;
  
  if (solid == void null || solid.Type != pfcCreate ("pfcModelType").MDL_PART)
	throw new Error (0, "Current model is not a part.  Aborting...");
  
/*------------------------------------------------------------------*\
  The instructions for the UDF creation.
\*------------------------------------------------------------------*/  
  var instrs = 
    pfcCreate ("pfcUDFCustomCreateInstructions").Create ("node");
	
/*------------------------------------------------------------------*\
  Make non-variant dimensions blank so they cannot be changed.
\*------------------------------------------------------------------*/  
  instrs.DimDisplayType = 
    pfcCreate ("pfcUDFDimensionDisplayType").UDFDISPLAY_BLANK;
  
/*------------------------------------------------------------------*\
  Initialize the UDF reference and assign it to the instructions.  
  The string argument is the reference prompt for the particular 
  reference.
\*------------------------------------------------------------------*/  	 
  csys = 
    solid.GetItemByName (pfcCreate ("pfcModelItemType").ITEM_COORD_SYS, 
			 csysName);
  if (csys == void null)
    throw new Error (0, "Requested coordinate system "+csysName+" not found.");
  csysSel = 
    pfcCreate ("MpfcSelect").CreateModelItemSelection  (csys, void null);
  
  var csysRef = 
    pfcCreate ("pfcUDFReference").Create ("REF_CSYS", csysSel);
  
  var refs = pfcCreate ("pfcUDFReferences");
  refs.Append (csysRef);
  
  instrs.References = refs;
  
/*------------------------------------------------------------------*\
  Initialize the variant dimension and assign it to the instructions.  
  The string argument is the dimension symbol for the variant 
  dimension.
\*------------------------------------------------------------------*/  
   var varDiam = 
     pfcCreate ("pfcUDFVariantDimension").Create ("d11", diam);
   
   var vals = pfcCreate ("pfcUDFVariantValues");
   vals.Append (varDiam);
   
   instrs.VariantValues = vals;
   
/*------------------------------------------------------------------*\
  Create the new UDF placement.
\*------------------------------------------------------------------*/  
   var group = solid.CreateUDFGroup (instrs);
    return (group);
}
