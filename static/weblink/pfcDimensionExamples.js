/*
   HISTORY

14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
07-MAR-03   K-01-03   $$2   JCN      UNIX support

*/

/*
  The following example code shows a utility function that sets angular 
  tolerances to a specified range.   For each angular dimension in the current 
  model the function gets the dimension value and adds or subtracts the range 
  to it to get the upper and lower limits.  The function then initializes a 
  pfcDimTolLimits tolerance object and assigns it to the dimension.   The 
  function displays each shown dimension.
*/

function setAngularToleranceToLimits (range /* number */)
{
  
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
 /*--------------------------------------------------------------------*\ 
   Get the current solid model 
 \*--------------------------------------------------------------------*/  
  var session = pfcGetProESession();
  var model = session.CurrentModel;
  
  if (model == void null || (model.Type != pfcCreate ("pfcModelType").MDL_PART && 
			     model.Type != pfcCreate ("pfcModelType").MDL_ASSEMBLY))
    throw new Error (0, "Current model is not a part or assembly.");
  
			
 /*--------------------------------------------------------------------*\ 
   Ensure that dimensions will be shown with tolerances 
 \*--------------------------------------------------------------------*/  
  session.SetConfigOption ("tol_display", "yes");
	
 /*--------------------------------------------------------------------*\ 
   List all model dimensions
 \*--------------------------------------------------------------------*/  
  var dimensions = model.ListItems (pfcCreate ("pfcModelItemType").ITEM_DIMENSION);
  
  for (var i = 0;  i < dimensions.Count; i++)
    {
      var dimension = dimensions.Item (i);

 /*--------------------------------------------------------------------*\ 
   Check for angular dimensions
 \*--------------------------------------------------------------------*/  
      var dType = dimension.DimType;  // from class pfcBaseDimension
      
      
      if (dType == pfcCreate ("pfcDimensionType").DIM_ANGULAR)
	{
	  
 /*--------------------------------------------------------------------*\ 
   Assign the limits tolerance 
 \*--------------------------------------------------------------------*/  
	  var dvalue = dimension.DimValue;  //from class pfcBaseDimension
	  
	  var upper = dvalue + range/2.0;
	  var lower = dvalue - range/2.0;
	  
	  limits =  pfcCreate ("pfcDimTolLimits").Create(upper, lower);
	  
	  dimension.Tolerance = limits;  // from class pfcDimension
		
 /*--------------------------------------------------------------------*\ 
   Display the modified dimension
 \*--------------------------------------------------------------------*/  
	  var showInstrs = 
	    pfcCreate ("pfcComponentDimensionShowInstructions").Create (void null);
	  
	  dimension.Show (showInstrs);
	  
	}
    }
}
