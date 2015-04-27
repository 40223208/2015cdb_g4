/*
   HISTORY
   
14-NOV-02   J-03-38   $$1   JCN      Adapted from J-Link examples.
07-MAR-03   K-01-03   $$2   JCN      UNIX support

 */
 
/* 
   A sample that shows the use of the GetProEArguments
   method to access the Pro/ENGINEER command line arguments. 
   The first argument is always the full path to the Pro/E executable. 
   For this application the next two arguments can be either ("+runtime" or 
   "+development") or ("-Unix" or "-NT"). Based on these values 2 boolean 
   variables are set and passed on to another function which makes use of 
   this information.   
*/    

var runtime = true;
var unix = false;

function getArguments ()
{
  if (!pfcIsWindows())
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  
  var argseq = pfcCreate ("MpfcCOMGlobal").GetProEArguments();         
  
/*------------------------------------------------------------------*\
  Making sure that there are three arguments.
\*------------------------------------------------------------------*/
  if (argseq.Count == 3)
    {
/*------------------------------------------------------------------*\
  First argument is Pro/E executable  - skip it
\*------------------------------------------------------------------*/
/*------------------------------------------------------------------*\
  Set flags based on Pro/E input arguments
\*------------------------------------------------------------------*/
      var val=argseq.Item(1);
      
      setFlags (val);
     
/*------------------------------------------------------------------*\
  Set third flag based on Pro/E input argument
\*------------------------------------------------------------------*/
      val=argseq.Item(2);
      
      setFlags (val);
    }
/*------------------------------------------------------------------*\
  Pass the boolean values to another function
\*------------------------------------------------------------------*/
  //runApplication(runtime,unix);
}
    
    
function setFlags (val /* string */)
{
  if (val == "+runtime")
    {
      runtime=true;
    }
  else if (val == "+development")
    {                   
      runtime=false;
    }      
  else if (val == "-Unix")
    {
      unix=true;
    }
  else if (val == "-NT")
    {
      unix=false;
    }
}
           


