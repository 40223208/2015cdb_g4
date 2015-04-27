/*  
   HISTORY

23-JUL-07   L-01-35   $$1  SNV     Created and submitted

*/

/*====================================================================*\
FUNCTION: createParamDimRelation_script_wrapper
PURPOSE:  Wrapper function for createParamDimRelation.
\*====================================================================*/
function createParamDimRelation_script_wrapper()
{	
	var i;
	var selections;
  	var options ;
  	
	var session = pfcGetProESession ();
  	/*=====================================================================*\
	Get the current part model
  	\*=====================================================================*/      
	var solid = session.CurrentModel;
	modelTypeClass = pfcCreate ("pfcModelType");
	
	if (solid == void null || (solid.Type != modelTypeClass.MDL_PART))
	{
	    throw new Error  (0, "Current model is not a part.");
	}
	  
	/*=====================================================================*\
		Get selected components
	\*=====================================================================*/				
	var browserSize = session.CurrentWindow.GetBrowserSize();
	session.CurrentWindow.SetBrowserSize (0.0);
	
	options = pfcCreate("pfcSelectionOptions").Create("feature");
	selections = session.Select (options, void null);
	
	session.CurrentWindow.SetBrowserSize (browserSize);
	if (selections == void null || selections.Count == 0)
	{
		throw new Error  (0, "Nothing selected");
	}
	
	var features = pfcCreate("pfcFeatures");
	for (i =0; i < selections.Count ; i++)
  	{
	  	features.Append(selections.Item(i).SelItem);	  		  			
  	}
  	
  	createParamDimRelation(features);
	
}


/*====================================================================*\
FUNCTION: createParamDimRelation
PURPOSE:  This function creates parameters for all dimensions in input 
		  features of a part model and adds relation between them.
\*====================================================================*/
function createParamDimRelation (features)
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    
  var i,j;
  var relations;
  var items;  
  var dimName , paramName;
  var dimValue;
  var paramAdded;
  var param ;
  var paramValue;
                   
  for (i =0; i < features.Count ; i++)
  {	  
      /*=====================================================================*\
		Get the selected feature
	  \*=====================================================================*/	  
      var feature = features.Item(i);
      if (feature == void null)
      {
	      continue;
      }
      
      /*=====================================================================*\
		Get the dimensions in the current feature
	  \*=====================================================================*/
      items = feature.ListSubItems(pfcCreate ("pfcModelItemType").ITEM_DIMENSION);

      if ((items == void null) || (items.Count == 0 ))
	  {
		  continue;
	  }
	  	  	  
	  relations = pfcCreate("stringseq");
	        
	  /*=====================================================================*\
		Loop through all the dimensions and create relations
	  \*=====================================================================*/
      for (j = 0; j < items.Count; j++)
	  {		  
	  	  var item = items.Item(j);	  	  
	  	  dimName = item.GetName();	  	  
	  	  paramName = paramName = "PARAM_" + dimName;	  	  

	  	  dimValue = item.DimValue;
	  	  	  	  	  	  
	  	  param = feature.GetParam(paramName);	  	  
	  	  paramAdded = false;
	  	  
	  	  if (param == void null)
	  	  {
		  	  paramValue = pfcCreate ("MpfcModelItem").CreateDoubleParamValue(dimValue);
		  	  feature.CreateParam (paramName, paramValue);
		  	  paramAdded = true;
	  	  }
	  	  else
	  	  {
		  	  if (param.Value.discr == pfcCreate ("pfcParamValueType").PARAM_DOUBLE)
		  	  {
			  	  paramValue = pfcCreate ("MpfcModelItem").CreateDoubleParamValue(dimValue);
			  	  param.Value = paramValue;
			  	  paramAdded = true;
		  	  }
	  	  }
	  	  
	  	  if (paramAdded == true)
	  	  {
		  	  relations.Append(dimName + " = " + paramName);		  		  
	  	  }
	  	  param = void null;
	  	  
  	  }
      feature.Relations = relations;
  }
} 	  	  
	
	  
