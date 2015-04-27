/*
   HISTORY

14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
07-MAR-03   K-01-02   $$3   JCN      UNIX support
*/

/*====================================================================*\
FUNCTION: createParametersFromArguments
PURPOSE:  Create/modify parameters in the model based on name-value pairs 
			in the page URL
\*====================================================================*/
function createParametersFromArguments ()  
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  
  var propValue;
  var propsfile = "params.properties";
  var p;

  var args = getArgs ();
  
/*------------------------------------------------------------------*\
  Use the current model as the parameter owner.
\*------------------------------------------------------------------*/
  var session = pfcGetProESession ();
  var pOwner = session.CurrentModel;
  
  if (pOwner == void null)
    throw new Error (0, "No current model.");

/*------------------------------------------------------------------*\
  Process each name/value pair as a Pro/E parameter.
\*------------------------------------------------------------------*/
  for (var i = 0; i < args.length; i++)
    {
      var pName = args[i].Name;
      var pv = createParamValueFromString(args[i].Value);
      p = pOwner.GetParam(pName);
/*------------------------------------------------------------------*\
  GetParam returns null if it can't find the param.  Create it.
\*------------------------------------------------------------------*/
      if (p == void null) 
	{
	  pOwner.CreateParam (pName, pv);
	}
      else
	{
	  p.Value = pv;
	}
    }
  
  session.RunMacro ("~ Select `main_dlg_cur` `MenuBar1` `Utilities`;~ Close `main_dlg_cur` `MenuBar1`;~ Activate `main_dlg_cur` `Utilities.psh_params`");
}

/*====================================================================*\
FUNCTION: getArgs
PURPOSE:  Parse arguments passed via the URL
\*====================================================================*/
function getArgs ()
{
  var args = new Array ();
  
  var query = location.search.substring (1);
  
  var pairs = query.split ("&");
  for (var i = 0; i < pairs.length; i++)
    {	
      var pos = pairs [i].indexOf ('=');
      if (pos == -1) continue;
      var argname = pairs[i].substring (0, pos);
      var value = pairs[i].substring (pos+1);
      var argPair = new Object ();
      argPair.Name = argname;
      argPair.Value = unescape (value);
      args.push (argPair);
    }
  
  return args;
}

/*====================================================================*\
FUNCTION: createParamValueFromString
PURPOSE:  Parses a string into a pfcParamValue object, checking for most 
		restrictive possible type to use.
\*====================================================================*/	
function createParamValueFromString (s /* string */)
{
  if (s.indexOf (".") == -1)
    {
      var i = parseInt (s);
      if (!isNaN(i))
	return pfcCreate ("MpfcModelItem").CreateIntParamValue(i);
    }
  else
    {
      var d = parseFloat (s);
      if (!isNaN(d))
	return pfcCreate ("MpfcModelItem").CreateDoubleParamValue(d);
    }
  if (s.toUpperCase() == "Y" || s.toUpperCase ()== "TRUE")
    return pfcCreate ("MpfcModelItem").CreateBoolParamValue(true);
  
  if (s.toUpperCase() == "N" || s.toUpperCase ()== "FALSE")
    return pfcCreate ("MpfcModelItem").CreateBoolParamValue(false);
  
  return pfcCreate ("MpfcModelItem").CreateStringParamValue(s);
}

					
	
