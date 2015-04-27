/*
   HISTORY
   
14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
07-MAR-03   K-01-03   $$2   JCN      UNIX support
*/

/*====================================================================*\
FUNCTION: addHoleDiameterColumns
PURPOSE:  Add all hole diameters to the family table of a model.
\*====================================================================*/
function addHoleDiameterColumns ()
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  
/*------------------------------------------------------------------*\
  Use the current solid model.
\*------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  var solid = session.CurrentModel;
  modelTypeClass = pfcCreate ("pfcModelType");
  
  if (solid == void null || (solid.Type != modelTypeClass.MDL_PART && 
			     solid.Type != modelTypeClass.MDL_ASSEMBLY))
    {
      throw new Error  (0, "Current model is not a part or assembly.");
    }
     
/*------------------------------------------------------------------*\
  List all holes in the solid model
\*------------------------------------------------------------------*/ 
  var holeFeatures = solid.ListFeaturesByType (true, 
		 pfcCreate ("pfcFeatureType").FEATTYPE_HOLE);
  for (var ii =0; ii < holeFeatures.Count; ii++)
    {
      var holeFeat = holeFeatures.Item(ii);
      
/*------------------------------------------------------------------*\
  List all dimensions in the feature 
\*------------------------------------------------------------------*/
      dimensions = 
	holeFeat.ListSubItems(pfcCreate ("pfcModelItemType").ITEM_DIMENSION);
      
      for (var jj = 0; jj < dimensions.Count; jj++)
	{
	  var dim = dimensions.Item(jj);
	  
/*------------------------------------------------------------------*\
  Determine if the dimension is a diameter dimension
\*------------------------------------------------------------------*/	        
	  if (dim.DimType == pfcCreate ("pfcDimensionType").DIM_DIAMETER) 
	    {
/*------------------------------------------------------------------*\
  Create the family table column (from pfcFamilyMember class)
\*------------------------------------------------------------------*/	  		  
	      var dimColumn = solid.CreateDimensionColumn(dim);
/*------------------------------------------------------------------*\
  Add the column to the family table.  Second argument could be
  a sequence of pfcParamValues to use for each family table instance.
\*------------------------------------------------------------------*/  	  
	      solid.AddColumn(dimColumn, void null);
	    }
	}
    }
}
