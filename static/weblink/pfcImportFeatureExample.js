/*
  HISTORY
  
  14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
  07-MAR-03   K-01-03   $$2   JCN      UNIX support
  09-APR-09   L-03-29   $$3   SRV      Remvng Enum:pfcIntfCATIA 
  02-Oct-09   L-05-10   $$4 tshmeleva  Removed pfcIntfPDGS
*/

/*
  This function will return a Feature object when provided with a solid
  a coordinate system name and an import feature's filename. The method
  find the coordinate system in the model, sets the Import Feature Attributes,
  and creates the Import Feature. Then the Feature is returned.
*/
function createImportFeatureFromDataFile (fileType /* string */, 
					  fileName /* string */,
					  csysName /* string */) 
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  
  var fileClass = void null;
  
  if (fileType == "Neutral")
    fileClass = pfcCreate ("pfcIntfNeutralFile");
  else if (fileType == "IGES")
    fileClass = pfcCreate ("pfcIntfIges");
  else if (fileType == "SET")
    fileClass = pfcCreate ("pfcIntfSet");
  else if (fileType == "STEP")
    fileClass = pfcCreate ("pfcIntfStep");
  else if (fileType == "VDA")
    fileClass = pfcCreate ("pfcIntfVDA");
  else
    throw new Error (0, "Unrecognized file type");
  
/*--------------------------------------------------------------------*\ 
  Get the current part 
\*--------------------------------------------------------------------*/  
  var session = pfcGetProESession ();
  var solid = session.CurrentModel;
  
  if (solid.Type != pfcCreate ("pfcModelType").MDL_PART)
    throw new Error (0, "Current model is not an assembly");

/*--------------------------------------------------------------------*\ 
  Find the indicated coordinate system
\*--------------------------------------------------------------------*/ 
  var cSystem = solid.GetItemByName (pfcCreate ("pfcModelItemType").ITEM_COORD_SYS, 
				     csysName);
  if (cSystem == void null)
    throw new Error (0, "Couldn't find named coordinate system.");

/*--------------------------------------------------------------------*\ 
  Prepare the import feature instructions classes and create the feature
\*--------------------------------------------------------------------*/ 
  var dataSource = fileClass.Create(fileName);
  var featAttr = pfcCreate ("pfcImportFeatAttr").Create();
  featAttr.JoinSurfs = true;
  featAttr.MakeSolid = true;
  featAttr.Operation = pfcCreate("pfcOperationType").ADD_OPERATION;
  
  var importFeature = solid.CreateImportFeat(dataSource, cSystem, featAttr);
  
  return importFeature;
}

