<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<html>
	<head>
		<meta name="robots" content="noindex,nofollow"/>
		 <meta content="yes" name="apple-mobile-web-app-capable" />
		 <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
		<link rel="icon" type="image/vnd.microsoft.icon" href="img/favicon.ico"/>                          <link rel="shortcut icon" type="image/vnd.microsoft.icon" href="images/umbrella.ico"/>         		 
		<link rel="stylesheet" type="text/css" href="/css/Blob_dynamic_css" />
		<link rel="stylesheet" type="text/css" href="/css/Blob_static.css" />		 
		
				<script type="text/javascript">
			var headID = document.getElementsByTagName("head")[0];         
			var cssNode = document.createElement('link');
			cssNode.type = 'text/css';
			cssNode.rel = 'stylesheet';
			cssNode.href = '/css/PortalCSS' + (document.documentMode !== undefined ? "?documentMode=" + document.documentMode : "");
			headID.appendChild(cssNode);
		</script>
		<script type="text/javascript" src="/3rdp/json2.js"></script>

		<script type="text/javascript">
			/*
========================================================================================================================
PORTAL IS - ESSENTIALS INCLUSION - START
________________________________________________________________________________________________________________________
*/


window.WEBAPP_NAME = '';
window.ACTION_EXT = '';
window.DEFAULT_DATE_FORMAT = "d/m/y";
// TODO:This should be replaced with ResourceType
//=============================================================================================
window.__AppType = function() // DEPRECATED.
{
	this.FILE 	= 0;
	this.WEB 	= 1;
	this.MAIL 	= 2;
}
//=============================================================================================


// Resource types - enumeration.
//=============================================================================================
window.__ResourceType = function()
{
	// Todo: Match this enum with the backend's.
	this.UNKNOWN    = 0;
	this.FILE       = 1;
	this.WEB        = 2;
	this.MAIL       = 3;
	this.NATIVE     = 4;
	this.CITRIX     = 5;
	this.DIVIDER    = 6;
}
//=============================================================================================


//=============================================================================================
window.__ActionType = function()
{
	this.ADD 	= 0;
	this.EDIT 	= 1;
	this.DELETE	= 2;
}
//=============================================================================================


//=============================================================================================
window.Realm = function()
{

    m_name		                  = null;
	m_displayName	              = null;
	m_type	                      = null;
	m_authnInstructionMessageId	  = null;
	m_authnInstructionMessage	  = null;
}
//=============================================================================================


//=============================================================================================
window.__BrowserType = function()
{
	this.UNKNOWN	= 0;
	this.IE 		= 1;
	this.FIREFOX 	= 2;
	this.SAFARI		= 3;
	this.OPERA 		= 4;
	this.SCM 		= 5; // Secure Client Mobile.
	this.CHROME     = 6;
	// TODO: Check for other browser types.
}
//=============================================================================================


//=============================================================================================
window.__OSType = function()
{
	this.UNKNOWN	= 0;
	this.WIN_XP 	= 1;
	this.WIN_VISTA 	= 2;
	this.OTHER_WIN  = 3;
	this.MAC		= 4;
	this.LINUX      = 5;
	this.MOBILE		= 6; // TODO: Make this more granular.
}
//=============================================================================================


// Browser detection.
//=============================================================================================
window.BrowserDetails = function()
{
	this.browserType;
	this.osType;
	this.isJavaSupported;

	this.init = function()
	{
		this.browserType 		= this.detectBrowserType();
		this.browserVersion     = this.detectBrowserVersion();
		this.osType				= this.detectOSType();
		this.isJavaSupported	= this.detectJavaSupport();
	}


	this.detectBrowserType = function()
	{
		//TODO: Recheck implementation.
		var browserType = BrowserType.UNKNOWN;

        var userAgent = window.navigator.userAgent;

		if(userAgent.indexOf("MSIE ") >= 0)
		{
			browserType = BrowserType.IE; // If Internet Explorer version 4.7 or higher set IE.
		}
		else if(userAgent.indexOf("Firefox") >= 0)
		{
			browserType = BrowserType.FIREFOX;
		}
		else if(userAgent.indexOf("Chrome") >= 0)
		{
			browserType = BrowserType.CHROME;
		}
		else if(userAgent.indexOf("Opera") >= 0)
		{
			browserType = BrowserType.OPERA;
		}
		else if(userAgent.indexOf("Safari") >= 0 && userAgent.indexOf("Chrome") < 0)
		{
			browserType = BrowserType.SAFARI;
		}

		return browserType;
	}
	
	this.detectBrowserVersion = function()
	{
		var version = 0.0;
		var userAgent = window.navigator.userAgent;
		var match = null;
		
		switch(this.browserType)
		{
			case BrowserType.IE:
				match = userAgent.match(/MSIE ([0-9]+\.[0-9]*)/);
				if (match != null)
					version = parseFloat(match[1]);
			break;
			case BrowserType.FIREFOX:
				match = userAgent.match(/Firefox\/([0-9]+(\.[0-9]*)?)/);
				if (match != null)
					version = parseFloat(match[1]);			
			break;
			case BrowserType.CHROME:
				match = userAgent.match(/Chrome\/([0-9]+(\.[0-9]*)?)/);
				if (match != null)
					version = parseFloat(match[1]);			
			break;
			case BrowserType.OPERA:
				match = userAgent.match(/Opera\/([0-9]+(\.[0-9]*)?)/);
				if (match != null)
					version = parseFloat(match[1]);			
			break;
			case BrowserType.SAFARI:
				match = userAgent.match(/Version\/([0-9]+(\.[0-9]*)?)/);
				if (match != null)
					version = parseFloat(match[1]);			
			break;
		}
		return version;
	}

	this.detectOSType = function()
	{
		//TODO: Implement.
		return OSType.WIN_XP;
	}

	this.detectJavaSupport = function()
	{
		//TODO: Implement.
		return true;
	}

	this.isWinOS = function()
	{
		var isWinOS = false;
		
		if (    (this.osType == OSType.WIN_XP)
			||  (this.osType == OSType.WIN_VISTA)
			||  (this.osType == OSType.OTHER_WIN) )
		{
			isWinOS = true;
		}

		return isWinOS;

	}
	
	this.isPngSupported = function()
	{
		return (this.detectBrowserType() != BrowserType.IE || this.detectBrowserVersion() > 6);
	}

	// Try to detect
	this.isFirebugAvailable = function()
	{
		var isFirebugAvailable = false;
		try
		{
			isFirebugAvailable = ( (this.detectBrowserType() == BrowserType.FIREFOX) && (window.console) && (window.console.firebug != '') );
		}
		catch(e)
		{
			// Do nothing.
		}

		return isFirebugAvailable;
	}
}
//=============================================================================================


// Portal status.
//=============================================================================================
window.PortalStatus = function()
{
    this.css        = '';
    this.script     = '';
    this.content    = '';
    // TODO: Consider providing filenames to be loaded by the client side instead of server side inclusion.
}
//=============================================================================================


//=============================================================================================
// Callback object.
window.Callback = function(copyCallback)
{
    // "Copy constructor" of callback.
	if (copyCallback != undefined)
	{
		copyCallbcak = new Callback()
		copyCallbcak.callbackId         = callback.callbackId;
		copyCallbcak.methodReference    = callback.methodReference;
		copyCallbcak.thisArgument       = callback.thisArgument;
		copyCallbcak.args               = callback.args;
		return copyCallback;
	}

	this.callbackId         = "";   // A unique identifier of the callback. This is the ID
									// by which the callback will be called.

	this.methodReference    = null; // The required method reference to be invoked.

	this.thisArgument       = null;   // Optional: An extra argrument to hold the "this" reference
									  // of the method.
									  // Please read about JavaScript Call() and Apply() for more information.

	this.args               = new Array();

	this.call = function()
	{
		if (this.methodReference != null)
		{
			try
			{
				this.methodReference.apply(this.thisArgument, this.args);
			}
			catch(e)
			{
				DEBUG.out("Callback call failed.", DEBUG.ERROR,  e);
			}
		}
	}
}
//=============================================================================================



//=============================================================================================

window.__PortalErrorType = function()
{
    this.GENERAL	= 0;
    this.NETWORK_TIMEOUT 	= 1;
	this.BAD_XHR_STATUS = 2;
}


// PortalException object.
window.PortalException = function()
{
	this.status 	= -1;
	this.errMsg 	= "";
	this.logRefId 	= -1;
	this.portalErrorType = PortalErrorType.GENERAL;
}
//=============================================================================================


window.AppType 	        = new __AppType();// DEPRECATED
window.ResourceType	    = new __ResourceType();
window.ActionType 	    = new __ActionType();
window.BrowserType      = new __BrowserType();
window.OSType 		    = new __OSType();
window.PortalErrorType  = new __PortalErrorType();

window.browserDetails 	= new BrowserDetails();
browserDetails.init();
// Set namespace.
window.PORTAL_IS = {};
window.PORTAL_IS.TOOLS = {}


// Includes START
//=============================================================================================
// Set namespace.
PORTAL_IS.CONF = {};

PORTAL_IS.CONF.AJAX_REQ_TIMEOUT = 15000;

// These properties describes the external references of the portal.
PORTAL_IS.CONF.MULTI_PORTALS = {};
PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_PATH 		= "";
PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_PORT		= 443;
PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_HOST		= "192.168.0.0";
PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_SCHEME	= "https";
PORTAL_IS.CONF.MULTI_PORTALS.XSRF_TOKEN			= "";

// The current web application name.
PORTAL_IS.CONF.WEBAPP_NAME = "";



// Set namespace.
__AJAX_MGR = function()
{

   	//=============================================================================================
	this.getXmlHttpObject = function()
	{
		var xhr;
		if (window.XMLHttpRequest) // (Native XMLHTTPRequest) IE7, Mozilla, Safari, ...
		{
			xhr = new XMLHttpRequest();
			if (xhr.overrideMimeType)
			{
				// set type accordingly to anticipated content type
				xhr.overrideMimeType('text/html');
			}
		}
		else if (window.ActiveXObject) // IE6.x (and below)
		{
			try
			{
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			}
			catch (e)
			{
				try
				{
					xhr = new ActiveXObject("Microsoft.XMLHTTP");
				}
				catch (e)
				{
					//DEBUG.out("Cannot create XMLHTTP instance.", DEBUG.ERROR, e);
				}
			}
		}

		if (!xhr)
		{
			return null;
		}

		return xhr;
	}
	//=============================================================================================



	//=============================================================================================
	this.sendAsyncReq = function(url, parameters, callback, errorHandler, timeoutHandler, defaultErrorMsg, method, contentType)
	{
		DEBUG.out('PORTAL_IS.AJAX_MGR.sendAsyncReq: Submitting form asynchronous, URL:'+url);

		var isTimedOut = false;

		// Input validations and setting defaults.
		if (isNothingness(parameters))
		{
			parameters = '';
		}

		if (isNothingness(callback))
		{
			callback = new Callback();
		}

		if (isNothingness(errorHandler))
		{
			errorHandler = genericErrorHandler;
		}

		if (isNothingness(timeoutHandler))
		{
			timeoutHandler = genericTimeoutHandler;
		}

		if (isNothingness(method))
		{
			method = "POST";
		}

		if (isNothingness(contentType))
		{
			contentType = "application/x-www-form-urlencoded";
		}

		// Set Ajax object.
		var xhr = this.getXmlHttpObject();
        if (isNothingness(xhr))
        {
            checkError(xhr, errorHandler, timeoutHandler);
        	return;
		}

		// Set headers.
		xhr.open(method, url, true);
		xhr.setRequestHeader("Content-type", contentType);
		xhr.setRequestHeader("Content-length", parameters.length);
		xhr.setRequestHeader("Connection", "close");

        // Timeout vars.
        var reqTimeout, preTimeout;

        //.........................................................................................
		// In some cases (FF+FireBug bugs) ready state change function is not being called so we're getting false timeouts.
		// In order to detect these false timeouts we schedule a check much earlier than the timout value.
		preemptiveTimeout = function()
		{
			if (xhr.readyState == 4)
			{
				DEBUG.out('[preemptiveTimeout] Try to resume normal flow.', DEBUG.ERROR);

				// Check for errors.
				checkError(xhr, errorHandler, timeoutHandler);

				// Cleartimeouts.
				clearTimeout(reqTimeout);
				clearTimeout(preTimeout);

				// Concatenate the request's status and response.
				callback.args = [xhr.status, xhr.responseText].concat(callback.args);

				// Call to callback method.
				callback.call();
            	return true;
			}
			return true;
		}
        //.........................................................................................

        //.........................................................................................
		// This function will be called after an amount of time considered as timeout.
		// Checks if not false timeout (see preemptiveTimeout() for details).
		handleTimeout = function()
		{
			DEBUG.out('[handleTimeout] ReadyState:' + xhr.readyState, DEBUG.ERROR);
			// Check is we got here while the request has already arrived.
			// Seen somtimes that the onreadystatechange function is not being called. So we check for ourselves.
            if (xhr.readyState == 4)
			{
				DEBUG.out('[handleTimeout - timeout with state == 4] Try to resume normal flow.', DEBUG.ERROR);

				// Check for errors.
				checkError(xhr, errorHandler, timeoutHandler);

				// Cleartimeouts.
				if (browserDetails.isFirebugAvailable())
				{
					clearTimeout(preTimeout);
				}

				clearTimeout(reqTimeout);
				
				DEBUG.out('PORTAL_IS.AJAX_MGR.sendAsyncReq: Timeout ('+reqTimeout+') cleared for URL:' + url);

				// Concatenate the request's status and response.
				callback.args = [xhr.status, xhr.responseText].concat(callback.args);

				// Call to callback method.
				callback.call();
            	return;
			}

			isTimedOut = true;
			DEBUG.out('[handleTimeout] Ajax request timeout detected. Aborting request for URL:' + url, DEBUG.ERROR);
			xhr.abort();

			// Cleartimeouts.
            DEBUG.out('[handleTimeout] PORTAL_IS.AJAX_MGR.sendAsyncReq: Timeout ('+reqTimeout+') cleared for URL:' + url, DEBUG.ERROR);
			clearTimeout(reqTimeout);
			
			// Cleartimeouts.
			if (browserDetails.isFirebugAvailable())
			{
				clearTimeout(preTimeout);
			}

			var portalException = new PortalException();
			portalException.portalErrorType = PortalErrorType.NETWORK_TIMEOUT;
			portalException.errMsg = "Network communication error.";
			portalException.errMsg += ( isNothingness(defaultErrorMsg) ? "" : "\n" + defaultErrorMsg );			

			errorHandler(portalException, callback);
		}
        //.........................................................................................


        //.........................................................................................
		// Async Ajax impel.
		xhr.onreadystatechange=function()
		{
			DEBUG.out('XmlHttpRequest::onreadystatechange [xhr.readyState = ' + xhr.readyState + '] for url:' + url);

			if (isTimedOut)
			{
				DEBUG.out('XmlHttpRequest::onreadystatechange [xhr.readyState = ' + xhr.readyState + '] for url:' + url + 'Already timed out. Stop flow.');
				return;
			}

			switch (xhr.readyState)
			{
				case 1: // (Open) Response is ready.				

					// Set timeouts.
                	reqTimeout = setTimeout(handleTimeout, PORTAL_IS.CONF.AJAX_REQ_TIMEOUT);

                	// Clear timeouts.
					if (browserDetails.isFirebugAvailable())
					{
						preTimeout = setTimeout(preemptiveTimeout, Math.ceil(PORTAL_IS.CONF.AJAX_REQ_TIMEOUT/10));
					}                	
                	
                	DEBUG.out('PORTAL_IS.AJAX_MGR.sendAsyncReq: Timeout ('+reqTimeout+') set for URL:' + url);
				break;

				case 4: // (Loaded) Response is ready.
				    // Cleartimeouts.
					clearTimeout(reqTimeout);

					if (browserDetails.isFirebugAvailable())
					{
						clearTimeout(preTimeout);
					}

					// Check for errors.
					checkError(xhr, errorHandler, timeoutHandler);

					DEBUG.out('PORTAL_IS.AJAX_MGR.sendAsyncReq: Timeout ('+reqTimeout+') cleared for URL:' + url);
					
					// Concatenate the request's status and response.
					callback.args = [xhr.status, xhr.responseText].concat(callback.args);

					// Call to callback method.
					callback.call();
				break;

				default:
					// Do nothing.
				break;
			}
		}
        //.........................................................................................

        // Send the request.
		xhr.send(parameters);
	}
	//=============================================================================================
}


PORTAL_IS.AJAX_MGR = new __AJAX_MGR();

//=============================================================================================
// Includes END


// Debug object.
//=============================================================================================
function __Debug()
{
	// Debug levels.
	this.INFORMATIVE	= 10;
	this.WARNING 		= 20;
    this.ERROR 			= 50;
    this.DEBUG			= 70;
    this.OFF			= 100;

    // Maximum size of log stack.
    this.MAX_STACK_SIZE	= 1000;

	// Collect debug output without creating a window or printing it.
	this.QUIET_MODE		= "on".toLowerCase() == "on";
	
    this.DEBUG_LEVEL 	= 100;
    this.DEBUG_DEFUALT 	= this.INFORMATIVE;

    this.debugWindow		= null;
    this.debugConsoleDiv	= null;
    this.debugBuffer		= "";
    this.debugLine			= 0;
    this.debugStack			= new Array();
    this.dumpped			= false;

    // The debug window (console-like).
	this.out = function (msg, type, exception)
	{
		if ((type == undefined) || (type == null))
		{
			type = this.DEBUG_DEFUALT;
		}

        if (type >=  this.DEBUG_LEVEL)
		{		
			// create a log entety.
			var logEnt = new DebugLogEntety();
			logEnt.msg			= msg;
			logEnt.type			= type;
			logEnt.exception	= exception;
			logEnt.time			= new Date();			

			// Remove first elements as long as the stack is not smaller than it's max size.
			while (this.debugStack.length >= this.MAX_STACK_SIZE)
			{
				this.debugStack.shift();
			}

			this.debugStack.push(logEnt);

			// If quiet mode is off, and the debug window is available, print to debug window.
			if ((!this.QUIET_MODE) && (this.debugWindow != null) && (this.debugConsoleDiv != null))
			{
				this.debugConsoleDiv.innerHTML += this.formatMessage(logEnt);				
			}
		}
	}


	this.init = function()
	{
        var windowParams = "";

        if ((this.DEBUG_LEVEL < this.OFF) && (!this.QUIET_MODE))
        {
            this.debugWindow = window.open(getURL("js/Debug"), "Debug", windowParams);

            if ((this.debugWindow == false)||(this.debugWindow == undefined)||(this.debugWindow == null))
            {
                DEBUG.out('Cannot locate debug window.', DEBUG.ERROR);
            }
            else
            {
				try
				{
					this.debugConsoleDiv = this.debugWindow.document.getElementById('debugConsoleDiv');
				}
				catch(e)
				{
					this.debugConsoleDiv = null;
				}
            }
        }
	}


	this.dump = function()
	{
		this.QUIET_MODE = false; 			// Turn quiet mode off.
		this.init();						// Create window and HTML elements.
		var userDetails = "";
		userDetails += "<b>User Details</b><br>_______________________________________________________________________________________________________________<br>";
		userDetails += "<b>User Agent</b>: <i>" 		+ navigator.userAgent 		+ "</i><br>";
		userDetails += "<b>Platform</b>: <i>" 			+ navigator.platform 		+ "</i><br>";
		userDetails += "<b>Browser Language</b>: <i>" 	+ navigator.browserLanguage + "</i><br>";
		userDetails += "<b>User Language</b>: <i>" 		+ navigator.userLanguage 	+ "</i><br>";
		userDetails += "<b>Window Location</b>: <i>" 	+ window.location 			+ "</i><br>";
		userDetails += "<b>Cookies</b>: <i>" 			+ document.cookie 			+ "</i><br>";
        userDetails += "_______________________________________________________________________________________________________________<br>";
        userDetails += "Debug output dumped.<br>"+userDetails;
        this.out(userDetails);
		setTimeout("alert('Debug output dumped.');DEBUG.actualDump()", 5);	// Must output somthing in order for the buffer to be dumped to window.
	}


	this.actualDump = function()
	{
		var i=0;
		try
		{
			for (i=0; i<this.debugStack.length; i++)
			{
				if (!isNothingness(this.debugStack[i]))
				{
					this.debugConsoleDiv.innerHTML += this.formatMessage(this.debugStack[i]);
				}
			}
		}
		catch(e)
		{
			setTimeout("DEBUG.actualDump();", 5);
		}
	}



	this.formatMessage = function(logEnt, useHTMLFormat)
	{
		useHTMLFormat = useHTMLFormat != false; // Make true default.
		var output="";
		//var date = new Date();

		if (useHTMLFormat)
		{
			output += 	'<div class="'+( ( (this.debugLine++) % 2 == 0 ) ? 'debug_even_line':'debug_odd_line')+'">';

			// Output line number and timestamp.
			output +=		'[<i>' + logEnt.time.getHours() + ':' + logEnt.time.getMinutes() + ':' + logEnt.time.getSeconds() + '.' + logEnt.time.getMilliseconds() + '</i>]';
			output +=		'&nbsp;&nbsp;&nbsp;';

			// Output message acording to it's type.
			switch (logEnt.type)
			{
				case this.ERROR:
					output += '<span class="debug_error">'+logEnt.msg;
					if ((logEnt.exception != undefined) && (logEnt.exception != null))
					{
						if (logEnt.exception.description != undefined)
						{output += '<br><i><b>description:</b>'+logEnt.exception.description+'</i>';}

						if (logEnt.exception.message != undefined)
						{output += '<br><i><b>message:</b>'+logEnt.exception.message+'</i>';}

						if ((logEnt.exception.filename != undefined) && (logEnt.exception.lineNumber != undefined))
						{output += '<br><i><b>line #:</b>'+logEnt.exception.lineNumber+'<b> at </b>'+logEnt.exception.filename+'</i>';}

						// TODO: Add stack trace print.
					}
					output += '</span>';
				break;

				default:
					output += logEnt.msg;
				break;
			}

			output +=	'</div>';
		}
		else // if (useHTMLFormat)
		{
        	// Output line number and timestamp.
			output +=		'[' + logEnt.time.getHours() + ':' + logEnt.time.getMinutes() + ':' + logEnt.time.getSeconds() + '.' + logEnt.time.getMilliseconds() + ']  ';

			// Output message acording to it's type.
			switch (logEnt.type)
			{
				case this.ERROR:
					output += '[ERROR]'+logEnt.msg;
					if ((logEnt.exception != undefined) && (logEnt.exception != null))
					{
						if (logEnt.exception.description != undefined)
						{output += '\nDescription: '+logEnt.exception.description;}

						if (logEnt.exception.message != undefined)
						{output += '\nMessage:'+logEnt.exception.message;}

						if ((logEnt.exception.filename != undefined) && (logEnt.exception.lineNumber != undefined))
						{output += '\nLine #:'+logEnt.exception.lineNumber+' at '+logEnt.exception.filename;}

						// TODO: Add stack trace print.
					}
				break;

				default:
					output += logEnt.msg;
				break;
			}
		}

		return output;
	}


	// Check if debug is on or not (quietMode is considered on).
	// Returns true if debug is no or false otherwise.
	this.isActive = function()
	{
		var isActive = false;
	 	if ((this.DEBUG_LEVEL < this.OFF) && (!this.QUIET_MODE))
	 	{
			isActive = true;
		}

		return isActive;
	}


	// Send client error report to the server (sends the client denug logs).
	// Note that this may not send the report immidiatly but ask the user for confirmation and other
	// information.
	// This is an empty method and should be overridden by each portal.
	// Params:
	// callback		- Callback to be called post the error reporting.
	this.sendErrorReport = function(callback)
	{
		// Override me.
		DEBUG.out("DEBUG.sendErrorReport was not overridden, empty implementation os used.", DEBUG.ERROR);
	}


	this.showErrorReport = function(callback)
	{
		// Override me.
		DEBUG.out("DEBUG.showErrorReport was not overridden, empty implementation os used.", DEBUG.ERROR);
	}


	this.compileErrorReport = function()
	{
		var errorReport = ""

		var userDetails = "";
		userDetails += "User Details_______________________________________________________________________________________________________________\n";
		userDetails += "User Agent: " 			+ navigator.userAgent + "\n";
		userDetails += "Platform: " 			+ navigator.platform + "\n";
		userDetails += "Browser Language: " 	+ navigator.browserLanguage + "\n";
		userDetails += "User Language: " 		+ navigator.userLanguage + "\n";
		userDetails += "Window Location: " 		+ window.location + "\n";
		userDetails += "Cookies: " 				+ document.cookie + "\n";
        userDetails += "_______________________________________________________________________________________________________________\n";

        errorReport += "CLIENT REPORT - START _______________________________________________________________________________________________________________\n";
        errorReport += userDetails;

		try
		{
			for (i=0; i<this.debugStack.length; i++)
			{
				if (!isNothingness(this.debugStack[i]))
				{
					errorReport += this.formatMessage(this.debugStack[i], false) + "\n";
				}
			}
		}
		catch(e){}

		errorReport += "CLIENT REPORT - END _______________________________________________________________________________________________________________\n\n";

		return errorReport;
	}
}
//=============================================================================================


// Debug log entety.
//=============================================================================================
window.DebugLogEntety = function()
{
	this.msg		= "";
	this.type		= DEBUG.INFORMATIVE;
	this.exception	= null;
	this.time		= null;
}
//=============================================================================================


// Action response object.
//=============================================================================================
function ActionResponse()
{
	this.context;
	this.type;
	this.message;
	this.opaque;
	this.nextStateId;
}
//=============================================================================================


// Dynamically load JavaScript file.
// param: sFileName <String>	- Script name to be loaded, just the name, no path or extensions.
//								  Example: loadScriptFile("Credentials");
//=============================================================================================
function loadScriptFile(sFileName, errorHandler, timeoutHandler)
{
	var sAbsoluteScriptFile = getURL("js/"+sFileName);
	loadScriptFileFromAbsoluteUrl(sAbsoluteScriptFile);
}

function loadScriptFileFromAbsoluteUrl (sAbsoluteScriptFile, errorHandler, timeoutHandler)
{
	DEBUG.out('Dynamically load script: '+sAbsoluteScriptFile);
	var ajx = GetXmlHttpObject();
	ajx.open("GET", sAbsoluteScriptFile, false); // false=synch
	ajx.send(null);
    // Check for errors.
	checkError(ajx, errorHandler, timeoutHandler);

	if (ajx.status == 200)
	{
    	var newScript = ajx.responseText;
    	//DEBUG.out("Received:\n<hr>"+newScript+"<hr>");
    	try{
        	window.eval(newScript);
    	}
    	catch(e)
    	{
    		DEBUG.out("Error while loading script into window.<br>", DEBUG.ERROR, e);
    	}
	}
	else
	{
		DEBUG.out('Loading '+sAbsoluteScriptFile+' failed.', DEBUG.ERROR);
	}
}
//=============================================================================================


// Dynamically load CSS file.
// param: sFileName <String>	- CSS name to be loaded, just the name, no path or extensions.
//								  Example: loadCSS("Credentials");
//=============================================================================================
function loadCSS(sFileName, errorHandler, timeoutHandler)
{
//todo: take webapp name from resource bundle

	//var sAbsoluteCSSFile = WEBAPP_NAME+"/css/"+sFileName+ACTION_EXT;
	var sAbsoluteCSSFile = getURL("css/"+sFileName);
	DEBUG.out('Dynamically load css: '+sAbsoluteCSSFile);
	var ajx = GetXmlHttpObject();
	ajx.open("GET", sAbsoluteCSSFile, false); // false=synch
	ajx.send(null);

	// Do not check for errors when loading CSS.

	if (ajx.status == 200)
	{
    	var newCSS = ajx.responseText;
    	//DEBUG.out("Received:\n<hr>"+newCSS+"<hr>");
    	try
    	{
    		var oLink = window.document.createElement("link")
			oLink.href 		= sAbsoluteCSSFile;
			oLink.rel 		= "stylesheet";
			oLink.type 		= "text/css";
			oLink.media 	= 'screen';
			oLink.title 	= 'dynamicLoadedSheet';
			window.document.getElementsByTagName("head")[0].appendChild(oLink);
    	}
    	catch(e)
    	{
    		DEBUG.out("Error while loading CSS into window.", DEBUG.ERROR, e);
    	}
	}
	else
	{
		DEBUG.out('Loading '+sAbsoluteCSSFile+' failed.', DEBUG.ERROR);
	}
}

//function loadPreLoginCSS(sFileName)
//{
//<!--todo: take webapp name from resource bundle-->
//	var sAbsoluteCSSFile = getURL("css/" + sFileName);
//	DEBUG.out('Dynamically load pre login css: '+sAbsoluteCSSFile);
//
//	try
//	{
//		var oLink = window.document.createElement("link");
//		oLink.href 		= sAbsoluteCSSFile;
//		oLink.rel 		= "stylesheet";
//		oLink.type 		= "text/css";
//		oLink.media 	= 'screen';
//		oLink.title 	= 'dynamicLoadedSheet';
//		window.document.getElementsByTagName("head")[0].appendChild(oLink);
//	}
//	catch(e)
//	{
//		DEBUG.out("Error while loading CSS into window.", DEBUG.ERROR, e);
//	}
//}
//=============================================================================================


// Dynamically load HTML content into a desired DIV element. In case both DIV identifier and handler
// are provided, the handler will be used.
// param: sContentName <String>	- Content name to be loaded, just the name, no path or extensions.
//								  Example: loadCSS("Credentials");
// param: [sDivID] <String>		- The desired DIV identifier in the DOM.
// param: [sDivHand] <DIV>		- The desired DIV handler in the DOM.
//=============================================================================================
function loadContentIntoDiv(sContentName, sDivID, sDivHand, errorHandler, timeoutHandler)
{
//<!--todo: take webapp name from resource bundle-->
	//var sAbsoluteContentFile = WEBAPP_NAME+"/"+sContentName+ACTION_EXT;
	var sAbsoluteContentFile = sContentName;

    DEBUG.out('Dynamically load content: '+sAbsoluteContentFile);
    var oDiv = null;
	if (sDivHand != undefined)
	{oDiv = sDivHand;}
	else
	{oDiv = document.getElementById(sDivID);}

	var ajx = GetXmlHttpObject();

	if ((ajx != null) && (oDiv != null))
	{
		ajx.open("GET", sAbsoluteContentFile, false); // false=synch
		ajx.send(null);

		// Check for errors.
		checkError(ajx, errorHandler, timeoutHandler);

		if (ajx.status == 200)
		{
			var sResponseText = ajx.responseText;
			oDiv.innerHTML = sResponseText;
		}
		else
		{
			DEBUG.out("Loading content into div ["+sDivID+"] failed.\nStatus: "+ajx.status+" \n", DEBUG.ERROR);
		}
	}
	else
	{
		DEBUG.out("Error while loading content into div ["+sDivID+"].\n", DEBUG.ERROR);
	}
}
//=============================================================================================




// Get the url from an action name.
// The returned url is absolute (to root, not including host, port or scheme).
// param: url <String>		- The required action name.
//=============================================================================================
function getURL(url)
{
	return PORTAL_IS.TOOLS.getURL(url);
	//return WEBAPP_NAME + '/' + actionName + ACTION_EXT;
}

PORTAL_IS.TOOLS.getURL = function(url)
{
	var XSRFToken = PORTAL_IS.CONF.MULTI_PORTALS.XSRF_TOKEN;

	return  	  ((PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_PATH == "") ? ("") : ("/" + PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_PATH))
				+ ((PORTAL_IS.CONF.WEBAPP_NAME == "") ? ("") : ("/" + PORTAL_IS.CONF.WEBAPP_NAME ) )
				+ (((XSRFToken.length > 0) && (XSRFToken.charAt(0) != "/")) ? ("/" + XSRFToken) : ("" + XSRFToken))
				+ (((url.length > 0) && (url.charAt(0) != "/")) ? ("/" + url) : ("" + url))
				+ ACTION_EXT;
}
//=============================================================================================


// Get the url from an action name.
// param: actionName <String>		- The required action name.
//=============================================================================================
PORTAL_IS.TOOLS.getFullURL = function(actionName)
{
	var port = "";
	var fullUrl = "";

	// Add port only when needed.
	if 	(	((PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_SCHEME.toLowerCase() == "https") && (PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_PORT != 443))
			||
			((PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_SCHEME.toLowerCase() == "http") && (PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_PORT != 80))
		)
	{
		port = ":" + PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_PORT;
	}

	// Construct full url.
	fullUrl = 		PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_SCHEME + "://"
				+   PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_HOST
				+	port
				+	"/" + PORTAL_IS.CONF.MULTI_PORTALS.EXTERNAL_PATH
				+	((PORTAL_IS.CONF.MULTI_PORTALS.XSRF_TOKEN == "") ? ("/" + PORTAL_IS.CONF.MULTI_PORTALS.XSRF_TOKEN ) : ("") )
				+	"/" + actionName + ACTION_EXT;

	return fullUrl;
}
//=============================================================================================

// Generates and return an XMLHTTPRequest object.
//=============================================================================================
function GetXmlHttpObject()
{
	return PORTAL_IS.AJAX_MGR.getXmlHttpObject();	
}
//=============================================================================================


// Synchronously submit a form using a XMLHTTPRequest method.
// param: url <String>			- The URL to which the request will be send to.
// param: [parameters] <String>	- The parameters string of the form. String In canse none are provided
//                                an empty string will be sent.
// param: [method] <String>		- The method to submit a request by (e.g, POST, GET). In canse
//                                none are provided POST will be used.
// return: <String>				- XMLHTTPRequest responseText, empty string in case response
//								  is not OK (other then 200).
//=============================================================================================
function submitForm(url, parameters, method, errorHandler, timeoutHandler)
{
	DEBUG.out('Submitting form:<br>URL:'+url+'<br>Params:'+parameters);

	var sResponseText = '';

	if (parameters == undefined)
	{
		parameters = '';
	}

	if (method == undefined)
	{
		method = 'POST';
	}

	var xhr = GetXmlHttpObject();

	xhr.open(method, url, false);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-length", parameters.length);
    xhr.setRequestHeader("Connection", "close");

    xhr.send(parameters);

	// Check for errors.
	checkError(xhr, errorHandler, timeoutHandler);

    if (xhr.status == 200)
	{
		sResponseText = xhr.responseText;
	}
	else
	{
		DEBUG.out('Submitting form failed:<br>'+xhr.status, DEBUG.ERROR);
	}

	return sResponseText;
}


// ************ DEPRECATED ************ Use PORTAL_IS.AJAX_MGR.sendAsyncReq() instead.
// Asynchronously send a request using a XMLHTTPRequest method.
// The request will be sent with the provided parameters. Upon completing the request a callback function will be called.
// The callback function recieves the response status (e.g. 200, 404 or 401), the resoponse body and any additional parameters-
// received in the callbackParams.
// param: url <String>			        - The URL to which the request will be send to.
// param: [parameters] <String>	        - The parameters string of the form. String In canse none are provided
//                                        an empty string will be sent.
// param: [method] <String>		        - The method to submit a request by (e.g, POST, GET). In canse
//                                        none are provided POST will be used.
// param: [callback] <Function>         - The callback object to be called on completion.
// return: <Void>				        - nothing.
//=============================================================================================
// ************ DEPRECATED ************ Use PORTAL_IS.AJAX_MGR.sendAsyncReq() instead.
function sendAsynchronousRequest(url, parameters, callbackMethod, callbackThis, callbackParams, errorHandler, timeoutHandler)
{
    callback = new Callback();

    if (!isNothingness(callbackMethod))
	{
		callback.methodReference = callbackMethod;
	}

	if (!isNothingness(callbackThis))
	{
		callback.thisArgument = callbackThis;
	}

	if (!isNothingness(callbackParams))
	{
		callback.args = callbackParams;
	}

    PORTAL_IS.AJAX_MGR.sendAsyncReq(url, parameters, callback, errorHandler, timeoutHandler);
}

// ************ DEPRECATED ************ Use PORTAL_IS.AJAX_MGR.sendAsyncReq() instead.
// A wrapper for the sendAsynchronousRequest function just with callback object instead of three args.
function sendAsyncReq(url, parameters, callback, errorHandler, timeoutHandler)
{
	PORTAL_IS.AJAX_MGR.sendAsyncReq(url, parameters, callback, errorHandler, timeoutHandler)
}
//=============================================================================================




// Synchronously send a request using a XMLHTTPRequest method.
// The request will be sent with the provided parameters. Upon completing the request the result will be returned.
// The callback function recieves the response status (e.g. 200, 404 or 401), the resoponse body and any additional parameters-
// received in the callbackParams.
// param: url <String>			        - The URL to which the request will be send to.
// param: [parameters] <String>	        - The parameters string of the form. String In canse none are provided
//                                        an empty string will be sent.
// param: [method] <String>		        - The method to submit a request by (e.g, POST, GET). In canse
//                                        none are provided POST will be used.
// param: [callback] <Function>         - The callback function to be called on complete. The callback function will be called
//                                        with the results as the first parameter. The following parameters (callbackParams) will be
//                                        appended.
// param: [callbackThis] <Function>     - The callback function 'this' reference.
// param: [callbackParams] <Function>   - Array of argument to be passed to the callback along with the result. Allowing the caller
//                                        to chain parameters to the callback function.
// return: <Void>				        - nothing.
//=============================================================================================
function sendSynchronousRequest(url, parameters, errorHandler, timeoutHandler)
{
	//DEBUG.out('Submitting form asynchronous:<br>URL:'+url+'<br>Params:'+parameters+'<br>callback:'+callback);
	DEBUG.out('Submitting form synchronously, URL:'+url);

	var sResponseText = '';

	if (parameters == undefined)
	{
		parameters = '';
	}

	var method = 'POST';

    // Set Ajax object.
	var xhr = GetXmlHttpObject();

	xhr.open(method, url, false);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-length", parameters.length);
    xhr.setRequestHeader("Connection", "close");

	xhr.send(parameters);

	// Check for errors.
	checkError(xhr, errorHandler, timeoutHandler);

    if (xhr.status == 200)
	{
		sResponseText = xhr.responseText;
	}
	else
	{
		DEBUG.out('Submitting form synchronously, failed:<br>'+xhr.status, DEBUG.ERROR);
	}

	return sResponseText;
}
//=============================================================================================


// Flatten Javascript object to a string of key=value separated by "&" (HTTP post).
// param: obj <Object>			- The required object.
// return: <String>
//=============================================================================================
function flattenObject(obj)
{
	var objString = "";

	for (member in obj)
	{
		objString += "&"+member+"="+encodeURIComponent(obj[member]);
	}

	// Cuts the first "&" char.
	if (objString.length > 1)
	{objString = objString.substr(1, objString.length);}

	return objString;
}
//=============================================================================================


// Tells whether a state is secured.
//=============================================================================================
//function isStateSecure(state)
//{
//	var secured = false;
//
//    // TODO: this differentiation should be change.
//    if (state == "MainPortal" ||
//        state == "ISW" ||
//        state == "IswEntry" ||
//        state == "AdvancedPage" ||
//        state == "AlternatePortal")
//    {
//        secured = true;
//    }
//
//    return secured;
//}
//=============================================================================================


// Rendering functions - CSS, Content and JavaScript
//=============================================================================================
function evaluateJavaScript(script)
{
	// Evaluate JavaScript Code.
	try
	{
		window.eval(script);
	}
	catch(e)
	{
		DEBUG.out("Error while loading script into window.<br>", DEBUG.ERROR, e);
	}
}

function evaluateCSS(cssText, source)
{
	var oLink = window.document.createElement("link")
	oLink.href 		= source;
	oLink.rel 		= "stylesheet";
	oLink.type 		= "text/css";
	oLink.media 	= 'screen';
	oLink.title 	= 'dynamicLoadedSheet';
	window.document.getElementsByTagName("head")[0].appendChild(oLink);
}

function evaluateHTMLContent(htmlContent, destinationRef)
{
	if ((destinationRef == undefined) || (destinationRef == null))
	{
	    DEBUG.out("Retrieving default container DOM reference...");
	    destinationRef = document.getElementById("portal_main_view");
	}

	destinationRef.innerHTML = htmlContent;
}


// Change the portal's language and reloads the portal content.
// param: newLanguage <String>		- Desired new languge.
//=============================================================================================
function changePortalLanguage(newLanguage , portalContext)
{
	DEBUG.out("Change portal language to: "+newLanguage+". context:" + portalContext);
    var sAbsoluteURL = getURL( "ChangeLanguage");
    var parameters = 'requestedLanguagePack='+newLanguage;
    submitForm(sAbsoluteURL, parameters);

    // Todo: The rendering is done async. so provide a progress indicator.     
    //renderState(200, portalContext);
    viewManager.gotoNextState();
}
//=============================================================================================


// Display progress indicator.
//=============================================================================================
function __showProgressIndicator()
{
	DEBUG.out("Show progress indicator.");
	setTimeout('__showProgressIndicator();', 1);
}

function showProgressIndicator()
{
	DEBUG.out("__Show progress indicator.");
	//window.document.getElementById("PortalScreenShader").className = "screenShaderShow";
	window.document.getElementById("portalUserInteraction").className = "userInteractionDivShow";
}
//=============================================================================================


// Hide progress indicator.
//=============================================================================================
function __hideProgressIndicator()
{
	DEBUG.out("Hide progress indicator.");
	setTimeout('__hideProgressIndicator();', 1);
}

function hideProgressIndicator()
{
	DEBUG.out("__Hide progress indicator.");
	window.document.getElementById("PortalScreenShader").className = "screenShaderHide";
	window.document.getElementById("portalUserInteraction").className = "userInteractionDivHide";
}
//=============================================================================================



function getSNXController()
{
	var newSNXController = null;
	try
	{
		newSNXController = new SnxController();
	}
	catch(e)
	{
		DEBUG.out('Error while retrieving SNX controller.', DEBUG.ERROR, e);
	}

	return newSNXController;
}

function getISWController()
{
	return null;
}

function getICSController()
{
	return null;
}

function getCShellController()
{
	return null;
}





var DEBUG = new __Debug();
DEBUG.init();
DEBUG.out('JavaScript Tools loaded.');


// Set a cookie.
// param: name <String>     - The cookie name.
// param: value <String>    - The cookie value.
// param: expires <int>     - The cookie life time in seconds (the cookie will expire in [expires] seconds).
/************************* todo: beautification ********************/
function setCookie(name, value, expires, path, domain, secure) {
  if ( expires )
  {
    expires = expires * 1000;
  }
  var today = new Date();
  var expires_date = new Date( today.getTime() + (expires) );
  var curCookie = name + "=" + encodeURIComponent(value) +
      ((expires) ? "; expires=" + expires_date.toGMTString() : "") +
      ((path) ? "; path=" + path : "") +
      ((domain) ? "; domain=" + domain : "") +
      ((secure) ? "; secure" : "");
  document.cookie = curCookie;
}

function deleteCookie(name, path)
{
    document.cookie = name + "=" +
        ((path) ? "; path=" + path : "");

}


/*
  name - name of the desired cookie
  return string containing value of specified cookie or null
  if cookie does not exist
*/

function getCookie(name) {
  var dc = document.cookie;
  var prefix = name + "=";
  var begin = dc.indexOf("; " + prefix);
  if (begin == -1) {
    begin = dc.indexOf(prefix);
    if (begin != 0) return null;
  } else
    begin += 2;
  var end = document.cookie.indexOf(";", begin);
  if (end == -1)
    end = dc.length;
  return unescape(dc.substring(begin + prefix.length, end));
}
// Disable all child elements (within a specific form) of a certain parent.
// param: containingFormId <String>  - The containing form ID.
// param: parentId <String>    - Parent ID.
//=============================================================================================
 disable_child_elements  = function(containingFormId, parentId)
 {
    var disableChildElementsError = false;
    try
    {
        var oForm = document.getElementById(containingFormId);
        var formElementCount = oForm.length;
        for (var i=0; i<formElementCount; i++)
        {
            var element = oForm.elements[i];
            if (element.getAttribute('parent') == parentId )
            {
            // Disable all the children-elements of parentId.
            element.disabled = true;

            // Disable children of each element.
            disable_child_elements(containingFormId, element.id);
            }
        }
        var spanList = oForm.getElementsByTagName("span");
        for(var j=0; j<spanList.length; j++)
        {
           var spanElement = spanList[j];
           if(spanElement.getAttribute("perentForText"))
           {
            if(spanElement.getAttribute("perentForText")== parentId)
            {
                spanElement.className = "textDisable";
            }
           }
        }
    }
    catch(e)
    {
        disableChildElementsError = true;
    }
    if (disableChildElementsError)
    {
       DEBUG.out('Disable child elements of: '+parentId+' in form: '+containingFormId+' failed.',DEBUG.ERROR);
    }
 }

//=============================================================================================

// enable all child elements (within a specific form) of a specific parent. For each element
// (according to the sub-trees) enable it to it's previous state (checked/unchecked),using the 'is_selected'
// attribute, and proceeds enabling it's childs accordingly (relevant mainly to radio element for which 'is_selected' = checked/unchecked).
// param: containingFormId <String>  - The containing form ID.
// param: parentId <String>    - Parent ID.
//=============================================================================================
 enable_child_elements  = function(containingFormId, parentId)
 {
    try
    {
        var oForm = document.getElementById(containingFormId);
        var formElementCount = oForm.length;
        for (var i=0; i<formElementCount; i++)
        {
            var element = oForm.elements[i];
            if (element.getAttribute('parent') == parentId )
            {

                // By default enable all.
				element.disabled = false;

                // Disable all direct children which their attribute of keepDisabled is set to TRUE.
                if ( (element.getAttribute('keepDisabled')) && (element.getAttribute('keepDisabled').toLowerCase() == "true") )
                {
                	element.disabled = true;
                }

                //checking whether the element is a radio or a checkbox cause then it
               // may have children to call the enable on them
                if (element.type == "radio" || element.type == "checkbox")
                {
                    if (element.checked)
                    {
                       // enable childs of elements that were checked".
                        enable_child_elements(containingFormId, element.id);
                    }
                }
            }
        }

        var spanList = oForm.getElementsByTagName("span");
        for(var j=0; j<spanList.length; j++)
        {
           var spanElement = spanList[j];
           if(spanElement.getAttribute("perentForText"))
           {
            if(spanElement.getAttribute("perentForText")== parentId)
            {
                spanElement.className = "textEnable";
            }
           }
        }
    }
    catch(e)
    {
        DEBUG.out('Enable child elements of: '+parentId+' in form: '+containingFormId+' failed.',DEBUG.ERROR);
    }
 }
//=============================================================================================


// Create image tag.
//=============================================================================================
function draw_img_tag(src)
{
	var output = '';

	if (!browserDetails.isPngSupported())
	{
		output = "<div style=\" width:100%; filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+src+"', sizingMethod='image');\">&nbsp;</div>";
	}
	else
	{
		output = "<img src="+src+">";
	}

	return output;
}
//=============================================================================================


// In case browser is IE  5.5 <= ver < 7 rotate the documet's images and fix the PNGs to make
// them transparent.
//=============================================================================================
function fixIEPngImages()
{
	DEBUG.out("Fix PNGs.");

    var arVersion = navigator.appVersion.split("MSIE")
	var version = parseFloat(arVersion[1])

	if ((version >= 5.5) && (document.body.filters))
	{
	   for(var i=0; i<document.images.length; i++)
	   {
		  var img = document.images[i]
		  var imgName = img.src.toUpperCase()
		  if (imgName.substring(imgName.length-3, imgName.length) == "PNG")
		  {
			 var imgID = (img.id) ? "id='" + img.id + "' " : ""
			 var imgClass = (img.className) ? "class='" + img.className + "' " : ""
			 var imgTitle = (img.title) ? "title='" + img.title + "' " : "title='" + img.alt + "' "
			 var imgStyle = "display:inline-block;" + img.style.cssText
			 if (img.align == "left") imgStyle = "float:left;" + imgStyle
			 if (img.align == "right") imgStyle = "float:right;" + imgStyle
			 if (img.parentElement.href) imgStyle = "cursor:hand;" + imgStyle
			 var strNewHTML = "<span " + imgID + imgClass + imgTitle
			 + " style=\"" + "width:" + img.width + "px; height:" + img.height + "px;" + imgStyle + ";"
			 + "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"
			 + "(src=\'" + img.src + "\', sizingMethod='scale');\"></span>"
			 img.outerHTML = strNewHTML
			 i = i-1
		  }
	   }
	}
}
//=============================================================================================


// Iterate on the form and retrieve it's fields parameters and construct a POST string.
// Encrypts password fields according to "encrytPasswords" and if JS_RSA.js was included
// Default of encrytPasswords is true (if not passed to the function)
//=============================================================================================
function getFormParams(formId,encrytPasswords)
{
    DEBUG.out('Get form params for: '+formId);
    var getFormParamsError = false;
    var parameters = "";
    var count = 0;
    var element, value;
	
	if (typeof encrytPasswords == "undefined")	// default of encrytPasswords is true
	{
		encrytPasswords = true;
	}
	
    try
    {
        oForm = document.getElementById(formId);
        iFormElementCount = oForm.length;
        for (var i=0; i<iFormElementCount; i++)
        {
            element = oForm.elements[i];
            if ( (element.getAttribute('cpname') != undefined) && (element.getAttribute('cpname') != "") )
            {
                if (element.type == 'radio')
                {
                    DEBUG.out('checked =  "' + element.checked);
                }
                if (element.type != 'radio' || element.checked == true)
                {
                    if (count++>0)
                    {
                        parameters += "&";
                    }
                
					if (element.type == 'checkbox')
					{
					  value=element.checked;
					}
					else
					{
						value = element.value;
					}			
                                        if ((element.type == 'password') && encrytPasswords && (window.cpRSAobj))
                    {
                        value = window.cpRSAobj.encrypt(value);
                        DEBUG.out('Enc password\n' + value);
                    }

                    parameters += element.getAttribute('cpname')+"="+encodeURIComponent(value);

                }
            }

        }
    }
    catch(e)
    {
        getFormParamsError = true;
        DEBUG.out('Get form params failed.', DEBUG.ERROR, e);
    }

    return parameters;
}
//=============================================================================================


// Create a progress indicatior thingy.
//=============================================================================================
ProgressIndicator = function()
{
    this.m_width = 10;
    this.m_speed = 5; //Value range 1-10
    this.m_id	= "progressIndicator";
    this.m_index	= 0;
    this.m_size	= this.m_width*2;
    this.m_cease = false;
    this.m_domElement = null;

    this.draw_table = function()
    {
        var output = "<table id=\""+this.m_id+"_table\" class=\"progressIndicator\">";

        output += "<tr>";
        for (i=0; i<this.m_width; i++)
        {
            output += "<td id=\""+this.m_id+"_td_"+i+"\" class=\"progressIndicator\"></td>";
        }
        output += "</tr>";

        index = 0;
        output += "<tr>";
        for (i=0; i<this.m_width; i++)
        {
            output += "<td id=\""+this.m_id+"_td_"+(this.m_size-i-1)+"\" class=\"progressIndicator\"></td>";
        }
        output += "</tr>";

        output += "</table>";
        this.m_domElement.innerHTML = output;
    }


    this.clear_table = function()
    {
        this.m_domElement.innerHTML = "";
    }


    this.shift = function()
    {
        var j=0;
        var opacity = 1;
        for (i=0; i<(this.m_size); i++)
        {
            j = (this.m_index+i) % this.m_size;

            opacity = (i/this.m_size*2);

            if (opacity>1)
            {
                opacity = 0;
            }

            try
            {
                document.getElementById(this.m_id+"_td_"+j).style.MozOpacity=opacity;
                document.getElementById(this.m_id+"_td_"+j).style.filter = "alpha(Opacity="+(opacity*100)+"); ";
            }
            catch(e)
            {
                return;
            }
        }

        this.m_index++;
        if (!this.m_cease)
        {
            setTimeout("try{"+this.m_id+".shift();}catch(e){}", 150-(this.m_speed*10));
        }
    }


    this.start = function(name, container, speed, width)
    {
        this.m_id 		= name;
        this.m_speed 	= speed;
        this.m_width 	= width;
        this.m_size		= this.m_width*2;
        this.m_index	= 0;
        this.m_domElement = container;

        try
        {
            this.m_domElement.innerHTML = "";
        }
        catch(e)
        {
            //alert('Cannot find container.');
            return;
        }

        this.draw_table();
        this.shift();
    }

    this.stop = function()
    {
        this.m_cease = true;
        this.clear_table();
    }

}
//=============================================================================================

// Close page warning message - function.
//=============================================================================================
showCloseWarningMessage    = false; // Will the warning message will be shown at all.
operativeClientCount       = 0;    // Count how many clients required the warning to be shown.

pageClosingWarning = function()
{
	if (showCloseWarningMessage)
	{
		return "Closing this window will limit your network access. Are you sure you want to proceed?";
	}
	else
	{
		return;
	}
}

disablePageClosingWarning = function()
{
	showCloseWarningMessage = false;
}

enablePageClosingWarning = function()
{
	showCloseWarningMessage = true;
}

pageClosingWarningRegisterClient = function()
{
	operativeClientCount++;
}

pageClosingWarningUnregisterClient = function()
{
	operativeClientCount--;
}
//=============================================================================================

// Keep Alive + popup blocker
//=============================================================================================
assumePopupBlocker = function()
{
	onunload=null;
	onbeforeunload=null;
	var sid = getCookie("NACSID");
	// if we think popup blocker was detected, we add a cookie indicating that.
	// this cookie will be read when the keep alive page is loaded, and if exists - 
	// window.open will be called.
	setCookie("cpnacportal_popup_blocker", sid , 30);
	
}


// Detect Caps Lock
//=============================================================================================
capsDetect = function(e, divName)
{
	DEBUG.out("capsDetect, e:"+e+", div:"+divName);
	
	//if the browser did not pass event information to the handler, check in window.event
	if( !e ) { e = window.event; } if( !e ) { return; }
	//what (case sensitive in good browsers) key was pressed
	//this uses all three techniques for checking, just in case
	var theKey = 0;
	if( e.which ) { theKey = e.which; } //Netscape 4+, etc.
	else if( e.keyCode ) { theKey = e.keyCode; } //Internet Explorer, etc.
	else if( e.charCode ) { theKey = e.charCode } //Gecko - probably not needed
	//was the shift key was pressed
	var theShift = false;
	if( e.shiftKey ) { theShift = e.shiftKey; } //Internet Explorer, etc.
	else if( e.modifiers )
	{ //Netscape 4
		//check the third bit of the modifiers value (says if SHIFT is pressed)
		if( e.modifiers & 4 )
		{ //bitwise AND
		  theShift = true;
		}
	}

	//if upper case, check if shift is not pressed
	// or, if lower case, check if shift is pressed
	if (( theKey > 64 && theKey < 91 && !theShift ) || ( theKey > 96 && theKey < 123 && theShift ))
	{
		document.getElementById(divName).className="capsLockWarning_show";
		//HideCapsDiv(false);
	}
//
//	//if lower case, check if shift is pressed
//	else if( theKey > 96 && theKey < 123 && theShift )
//	{
//		//HideCapsDiv(false);
//	}
	else
	{
		document.getElementById(divName).className="capsLockWarning_hide";
		//Hide caps note ;
		//HideCapsDiv(true);
	}
}
//=============================================================================================



// Generic error handlers.
//=============================================================================================
window.genericErrorHandler = function(portalException, callback)
{
	if ((portalException == undefined) || (portalException == null))
	{
		portalException = new PortalException();
	}

	if (isNothingness(callback))
	{
		callback = new Callback();
	}

    // Quite mode, just send error to log.
    DEBUG.out("Unhandled generic error: "+portalException.errMsg + ", Log reference ID:"+portalException.logRefId, DEBUG.ERROR);

    callback.call();
    
    return true;	// This is required for the execption to stop from being passed to the browser. 
}

window.genericTimeoutHandler = function(portalException)
{
	if ((portalException == undefined) || (portalException == null))
	{
		portalException = new PortalException();
	}
	
	// Quite mode, just send error to log.
    DEBUG.out("Unhandled timeout generic error: "+portalException.errMsg + ", Log reference ID:"+portalException.logRefId, DEBUG.ERROR);
}
//=============================================================================================


// Check respons error (e.g. not HTTP 200 OK status code).
//=============================================================================================
window.checkError = function(xhr, errorHandler, timeoutHandler)
{
	var allOk = true;

	// Set default timeout error handler (is no argument is proided).
	if ((timeoutHandler == undefined) || (timeoutHandler == null))
	{
		timeoutHandler = genericTimeoutHandler;
	}

	// Set default general error handler (is no argument is proided).
	if ((errorHandler == undefined) || (errorHandler == null))
	{
		errorHandler = genericErrorHandler;
	}

	// If the XML HTTP Request itself is faulty, throw a general error.
	if (isNothingness(xhr))
	{
		DEBUG.out("Unknown error", DEBUG.ERROR);
		var portalException = new PortalException();
		portalException.status 		= -1;
		portalException.errMsg 		= "Unknown error.";
		portalException.logRefId 	= -1;

		errorHandler(portalException);
		allOk = false;
	}

	if ((allOk) && (xhr.status != 200))
	{
		allOk = false;

		// Try to parse the response.
		try
		{
			var portalException = JSON.parse(xhr.responseText);
			if ( isNothingness(portalException.status) || isNothingness(portalException.errMsg) || isNothingness(portalException.logRefId))
			{
				throw("Returned error is of unexpected format (not JSON, of PortalException)");
			}
		}
		catch(e)
		{
			DEBUG.out("Returned error is of unexpected format (not JSON, of PortalException)", DEBUG.ERROR, e);
			var portalException = new PortalException();
		}

		// Check specific error code (401, 500 etc.).
		if (xhr.status == 401)  // Session timeout.
		{
			DEBUG.out("Error 401, Log reference ID:"+portalException.logRefId, DEBUG.ERROR);
			timeoutHandler(portalException);
		}
		else // Default general error (!200).
		{
			DEBUG.out("Error !200, Log reference ID:"+portalException.logRefId, DEBUG.ERROR);
			portalException.errMsg = "xhrStatus is " + xhr.status;
			portalExceptoin.portalErrorType = BAD_XHR_STATUS;
			errorHandler(portalException);
		}

	}

	return allOk;
}
//=============================================================================================


// Encode a string to HTML enteties.
//=============================================================================================
// The function returns an array mapping of character to HTML entity.
function getHTMLSpecialCharactersArray()
{
	// In order to avoid initializing of the array each time we store it in the global scope
	// and create one only if none exists.
	if (window.___CP_HTMLSpecialCharactersArray___ == undefined || window.___CP_HTMLSpecialCharactersArray___ == null)
	{
		HTMLSpecialCharactersArray = new Array();
		HTMLSpecialCharactersArray[9] = '&nbsp;&nbsp;&nbsp;&nbsp;';
		HTMLSpecialCharactersArray[32] = '&nbsp;';
		HTMLSpecialCharactersArray[34] = '&quot;';
		HTMLSpecialCharactersArray[38] = '&amp;';
		HTMLSpecialCharactersArray[39] = '&#039;';
		HTMLSpecialCharactersArray[60] = '&lt;';
		HTMLSpecialCharactersArray[62] = '&gt;';
		HTMLSpecialCharactersArray[160] = '&nbsp;';
		HTMLSpecialCharactersArray[161] = '&iexcl;';
		HTMLSpecialCharactersArray[162] = '&cent;';
		HTMLSpecialCharactersArray[163] = '&pound;';
		HTMLSpecialCharactersArray[164] = '&curren;';
		HTMLSpecialCharactersArray[165] = '&yen;';
		HTMLSpecialCharactersArray[166] = '&brvbar;';
		HTMLSpecialCharactersArray[167] = '&sect;';
		HTMLSpecialCharactersArray[168] = '&uml;';
		HTMLSpecialCharactersArray[169] = '&copy;';
		HTMLSpecialCharactersArray[170] = '&ordf;';
		HTMLSpecialCharactersArray[171] = '&laquo;';
		HTMLSpecialCharactersArray[172] = '&not;';
		HTMLSpecialCharactersArray[173] = '&shy;';
		HTMLSpecialCharactersArray[174] = '&reg;';
		HTMLSpecialCharactersArray[175] = '&macr;';
		HTMLSpecialCharactersArray[176] = '&deg;';
		HTMLSpecialCharactersArray[177] = '&plusmn;';
		HTMLSpecialCharactersArray[178] = '&sup2;';
		HTMLSpecialCharactersArray[179] = '&sup3;';
		HTMLSpecialCharactersArray[180] = '&acute;';
		HTMLSpecialCharactersArray[181] = '&micro;';
		HTMLSpecialCharactersArray[182] = '&para;';
		HTMLSpecialCharactersArray[183] = '&middot;';
		HTMLSpecialCharactersArray[184] = '&cedil;';
		HTMLSpecialCharactersArray[185] = '&sup1;';
		HTMLSpecialCharactersArray[186] = '&ordm;';
		HTMLSpecialCharactersArray[187] = '&raquo;';
		HTMLSpecialCharactersArray[188] = '&frac14;';
		HTMLSpecialCharactersArray[189] = '&frac12;';
		HTMLSpecialCharactersArray[190] = '&frac34;';
		HTMLSpecialCharactersArray[191] = '&iquest;';
		HTMLSpecialCharactersArray[192] = '&Agrave;';
		HTMLSpecialCharactersArray[193] = '&Aacute;';
		HTMLSpecialCharactersArray[194] = '&Acirc;';
		HTMLSpecialCharactersArray[195] = '&Atilde;';
		HTMLSpecialCharactersArray[196] = '&Auml;';
		HTMLSpecialCharactersArray[197] = '&Aring;';
		HTMLSpecialCharactersArray[198] = '&AElig;';
		HTMLSpecialCharactersArray[199] = '&Ccedil;';
		HTMLSpecialCharactersArray[200] = '&Egrave;';
		HTMLSpecialCharactersArray[201] = '&Eacute;';
		HTMLSpecialCharactersArray[202] = '&Ecirc;';
		HTMLSpecialCharactersArray[203] = '&Euml;';
		HTMLSpecialCharactersArray[204] = '&Igrave;';
		HTMLSpecialCharactersArray[205] = '&Iacute;';
		HTMLSpecialCharactersArray[206] = '&Icirc;';
		HTMLSpecialCharactersArray[207] = '&Iuml;';
		HTMLSpecialCharactersArray[208] = '&ETH;';
		HTMLSpecialCharactersArray[209] = '&Ntilde;';
		HTMLSpecialCharactersArray[210] = '&Ograve;';
		HTMLSpecialCharactersArray[211] = '&Oacute;';
		HTMLSpecialCharactersArray[212] = '&Ocirc;';
		HTMLSpecialCharactersArray[213] = '&Otilde;';
		HTMLSpecialCharactersArray[214] = '&Ouml;';
		HTMLSpecialCharactersArray[215] = '&times;';
		HTMLSpecialCharactersArray[216] = '&Oslash;';
		HTMLSpecialCharactersArray[217] = '&Ugrave;';
		HTMLSpecialCharactersArray[218] = '&Uacute;';
		HTMLSpecialCharactersArray[219] = '&Ucirc;';
		HTMLSpecialCharactersArray[220] = '&Uuml;';
		HTMLSpecialCharactersArray[221] = '&Yacute;';
		HTMLSpecialCharactersArray[222] = '&THORN;';
		HTMLSpecialCharactersArray[223] = '&szlig;';
		HTMLSpecialCharactersArray[224] = '&agrave;';
		HTMLSpecialCharactersArray[225] = '&aacute;';
		HTMLSpecialCharactersArray[226] = '&acirc;';
		HTMLSpecialCharactersArray[227] = '&atilde;';
		HTMLSpecialCharactersArray[228] = '&auml;';
		HTMLSpecialCharactersArray[229] = '&aring;';
		HTMLSpecialCharactersArray[230] = '&aelig;';
		HTMLSpecialCharactersArray[231] = '&ccedil;';
		HTMLSpecialCharactersArray[232] = '&egrave;';
		HTMLSpecialCharactersArray[233] = '&eacute;';
		HTMLSpecialCharactersArray[234] = '&ecirc;';
		HTMLSpecialCharactersArray[235] = '&euml;';
		HTMLSpecialCharactersArray[236] = '&igrave;';
		HTMLSpecialCharactersArray[237] = '&iacute;';
		HTMLSpecialCharactersArray[238] = '&icirc;';
		HTMLSpecialCharactersArray[239] = '&iuml;';
		HTMLSpecialCharactersArray[240] = '&eth;';
		HTMLSpecialCharactersArray[241] = '&ntilde;';
		HTMLSpecialCharactersArray[242] = '&ograve;';
		HTMLSpecialCharactersArray[243] = '&oacute;';
		HTMLSpecialCharactersArray[244] = '&ocirc;';
		HTMLSpecialCharactersArray[245] = '&otilde;';
		HTMLSpecialCharactersArray[246] = '&ouml;';
		HTMLSpecialCharactersArray[247] = '&divide;';
		HTMLSpecialCharactersArray[248] = '&oslash;';
		HTMLSpecialCharactersArray[249] = '&ugrave;';
		HTMLSpecialCharactersArray[250] = '&uacute;';
		HTMLSpecialCharactersArray[251] = '&ucirc;';
		HTMLSpecialCharactersArray[252] = '&uuml;';
		HTMLSpecialCharactersArray[253] = '&yacute;';
		HTMLSpecialCharactersArray[254] = '&thorn;';
		HTMLSpecialCharactersArray[255] = '&yuml;';

		window.___CP_HTMLSpecialCharactersArray___ = HTMLSpecialCharactersArray;
	}
	return window.___CP_HTMLSpecialCharactersArray___;
}
//=============================================================================================



// Encode each character which have a matching HTML entity in the ___CP_HTMLSpecialCharactersArray___ array.
//=============================================================================================
function HTMLEncode(str, nl2br)
{
	if (isNothingness(str))
	{
		return "";
	}

    // Parse all input as string.
	str = String(str);

	// By default, nl2br set to true.
 	if (nl2br != false)
 	{
 		nl2br = true;
 	}

 	var output = "";
 	var HTMLSpecialCharactersArray = getHTMLSpecialCharactersArray();

	for (var i=0; i<str.length; i++)
	{
		// Check if there's a matching HTML entity in the array.
    	if ( (HTMLSpecialCharactersArray[str.charCodeAt(i)] != undefined) && (HTMLSpecialCharactersArray[str.charCodeAt(i)] != null) )
		{
			output += HTMLSpecialCharactersArray[str.charCodeAt(i)];
		}
		// If char is CR
		else if ( (nl2br) && (str.charCodeAt(i) == 10) )
		{
			output += "<br>";
		}
		// If char pair is CR NL
		else if ( (nl2br) && ((str.charCodeAt(i)) == 13) && (i+1<str.length) && ((str.charCodeAt(i+1)) == 10) )
		{
			output += "<br>";
			i++; // Advance and exrta character as it's a pair.
		}
		// If char pair is NL CR (reversed).
		else if ( (nl2br) && ((str.charCodeAt(i)) == 10) && (i+1<str.length) && ((str.charCodeAt(i+1)) == 13) )
		{
			output += "<br>";
			i++; // Advance and exrta character as it's a pair.
		}
		else
		{
			output += str.charAt(i);
		}
    }

    return output;
}
//=============================================================================================


function isNothingness(variable)
{
	if ((variable == null) || (variable == undefined))
	{
		return true;
	}

	return false;
}


//=============================================================================================
// Assign default browser execption interceptor to a JS function.
window.onerror = genericErrorHandler;
//=============================================================================================

// =======================================================================================
function convertToGmt(date)
{
	var d = new Date(date * 1000);
    var shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	var hour = d.getHours(), hourt;
	if ( hour > 11 ) {
		hour = hour==12 ? 12 : hour - 12;
		hourt = 1;
	} else {
		hour = hour==0 ? 12 : hour;
		hourt = 0;
	}

    var dateStr = shortDays[d.getDay()] + " " + (d.getMonth()+1) + "/" + (d.getDate()) + "/" + d.getFullYear() + " ";
	dateStr += (hour<10 ? '0' : '') + hour + ':' + (d.getMinutes()<10 ? '0' : '') +  d.getMinutes() + ' ' + (hourt==1 ? 'PM' : 'AM') + ' ';

	return dateStr;
}
// =======================================================================================

// Show form's progress indicator.
	//=============================================================================================
	function show_authn_progress_indicator(formId)
	{
    	DEBUG.out('Show progress indicator for form: '+formId);
		var showProgressIndicatorError = false;
		try
		{
		    window.authProgressIndicator = new ProgressIndicator();
	        authProgressIndicator.start("authProgressIndicator", document.getElementById("authentication_progress_indicator"), 10, 5);
			document.getElementById("authentication_progress_message").style.display='block';
		}
		catch(e)
		{
			showProgressIndicatorError = true;
			DEBUG.out('Show progress indicator failed.\n', DEBUG.ERROR, e);
		}

		return showProgressIndicatorError;
	}
	//=============================================================================================

	// Hide form's progress indicator.
	//=============================================================================================
	function hide_authn_progress_indicator(formId)
	{
    	DEBUG.out('Hide progress indicator for form: '+formId);
		var hideProgressIndicatorError = false;
		try
		{
		    authProgressIndicator.stop();
			document.getElementById("authentication_progress_message").style.display='none';
		}
		catch(e)
		{
			hideProgressIndicatorError = true;
			DEBUG.out('Hide progress indicator failed.\n', DEBUG.ERROR, e);
		}

		return hideProgressIndicatorError;
	}


//=============================================================================================
PORTAL_IS.TOOLS.addNamespace = function(namespace)
{
	DEBUG.out("Adding namespace [" + namespace + "].\n");
    try
    {
		eval("window." + namespace + " = {};");
	}
	catch(e)
	{
		DEBUG.out("Adding namespace [" + namespace + "] failed.\n", DEBUG.ERROR, e);
	}
}
//=============================================================================================

// Includes START
//=============================================================================================


// prng4.js - uses Arcfour as a PRNG

function Arcfour() {
  this.i = 0;
  this.j = 0;
  this.S = new Array();
}

// Initialize arcfour context from key, an array of ints, each from [0..255]
function ARC4init(key) {
  var i, j, t;
  for(i = 0; i < 256; ++i)
    this.S[i] = i;
  j = 0;
  for(i = 0; i < 256; ++i) {
    j = (j + this.S[i] + key[i % key.length]) & 255;
    t = this.S[i];
    this.S[i] = this.S[j];
    this.S[j] = t;
  }
  this.i = 0;
  this.j = 0;
}

function ARC4next() {
  var t;
  this.i = (this.i + 1) & 255;
  this.j = (this.j + this.S[this.i]) & 255;
  t = this.S[this.i];
  this.S[this.i] = this.S[this.j];
  this.S[this.j] = t;
  return this.S[(t + this.S[this.i]) & 255];
}

Arcfour.prototype.init = ARC4init;
Arcfour.prototype.next = ARC4next;

// Plug in your RNG constructor here
function prng_newstate() {
  return new Arcfour();
}

// Pool size must be a multiple of 4 and greater than 32.
// An array of bytes the size of the pool will be passed to init()
var rng_psize = 256;
// Random number generator - requires a PRNG backend, e.g. prng4.js

// For best results, put code like
// <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
// in your main HTML document.

var rng_state;
var rng_pool;
var rng_pptr;

// Mix in a 32-bit integer into the pool
function rng_seed_int(x) {
  rng_pool[rng_pptr++] ^= x & 255;
  rng_pool[rng_pptr++] ^= (x >> 8) & 255;
  rng_pool[rng_pptr++] ^= (x >> 16) & 255;
  rng_pool[rng_pptr++] ^= (x >> 24) & 255;
  if(rng_pptr >= rng_psize) rng_pptr -= rng_psize;
}

// Mix in the current time (w/milliseconds) into the pool
function rng_seed_time() {
  rng_seed_int(new Date().getTime());
}

// Initialize the pool with junk if needed.
if(rng_pool == null) {
  rng_pool = new Array();
  rng_pptr = 0;
  var t;
  if(navigator.appName == "Netscape" && navigator.appVersion < "5" && window.crypto) {
    // Extract entropy (256 bits) from NS4 RNG if available
    var z = window.crypto.random(32);
    for(t = 0; t < z.length; ++t)
      rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
  }  
  while(rng_pptr < rng_psize) {  // extract some randomness from Math.random()
    t = Math.floor(65536 * Math.random());
    rng_pool[rng_pptr++] = t >>> 8;
    rng_pool[rng_pptr++] = t & 255;
  }
  rng_pptr = 0;
  rng_seed_time();
  //rng_seed_int(window.screenX);
  //rng_seed_int(window.screenY);
}

function rng_get_byte() {
  if(rng_state == null) {
    rng_seed_time();
    rng_state = prng_newstate();
    rng_state.init(rng_pool);
    for(rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
      rng_pool[rng_pptr] = 0;
    rng_pptr = 0;
    //rng_pool = null;
  }
  // TODO: allow reseeding after first request
  return rng_state.next();
}

function rng_get_bytes(ba) {
  var i;
  for(i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
}

function SecureRandom() {}

SecureRandom.prototype.nextBytes = rng_get_bytes;
// Copyright (c) 2005  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Basic JavaScript BN library - subset useful for RSA encryption.

// Bits per digit
var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary&0xffffff)==0xefcafe);

// (public) Constructor
function BigInteger(a,b,c) {
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}

// return new, unset BigInteger
function nbi() { return new BigInteger(null); }

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this[i++]+w[j]+c;
    c = Math.floor(v/0x4000000);
    w[j++] = v&0x3ffffff;
  }
  return c;
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(i,x,w,j,c,n) {
  var xl = x&0x7fff, xh = x>>15;
  while(--n >= 0) {
    var l = this[i]&0x7fff;
    var h = this[i++]>>15;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
    c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
    w[j++] = l&0x3fffffff;
  }
  return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this[i]&0x3fff;
    var h = this[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w[j++] = l&0xfffffff;
  }
  return c;
}
if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
  BigInteger.prototype.am = am2;
  dbits = 30;
}
else if(j_lm && (navigator.appName != "Netscape")) {
  BigInteger.prototype.am = am1;
  dbits = 26;
}
else { // Mozilla/Netscape seems to prefer am3
  BigInteger.prototype.am = am3;
  dbits = 28;
}

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n) { return BI_RM.charAt(n); }
function intAt(s,i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this[0] = x;
  else if(x < -1) this[0] = x+DV;
  else this.t = 0;
}

// return bigint initialized to value
function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

// (protected) set from string and radix
function bnpFromString(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8; // byte array
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this[this.t++] = x;
    else if(sh+k > this.DB) {
      this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this[this.t++] = (x>>(this.DB-sh));
    }
    else
      this[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s&this.DM;
  while(this.t > 0 && this[this.t-1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this[i]&((1<<p)-1))<<(k-p);
        d |= this[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += int2char(d);
    }
  }
  return m?r:"0";
}

// (public) -this
function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

// (public) |this|
function bnAbs() { return (this.s<0)?this.negate():this; }

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return r;
  while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
  for(i = n-1; i >= 0; --i) r[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n,r) {
  for(var i = n; i < this.t; ++i) r[i-n] = this[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r[i+ds+1] = (this[i]>>cbs)|c;
    c = (this[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r[i] = 0;
  r[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r[0] = this[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r[i-ds-1] |= (this[i]&bm)<<cbs;
    r[i-ds] = this[i]>>bs;
  }
  if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]-a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r[i++] = this.DV+c;
  else if(c > 0) r[i++] = c;
  r.t = i;
  r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x[i],r,2*i,0,1);
    if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r[i+x.t] -= x.DV;
      r[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r[r.t++] = 1;
    r.subTo(t,r);
  }
  BigInteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y);	// "negative" y so we can replace sub with am later
  while(y.t < ys) y[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
    if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) BigInteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
  if(ts < 0) BigInteger.ZERO.subTo(r,r);
}

// (public) this mod a
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
  return r;
}

// Modular reduction using "classic" algorithm
function Classic(m) { this.m = m; }
function cConvert(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
function cRevert(x) { return x; }
function cReduce(x) { x.divRemTo(this.m,null,x); }
function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this[0];
  if((x&1) == 0) return 0;
  var y = x&3;		// y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?this.DV-y:-y;
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}

// xR mod m
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}

// x/R mod m
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while(x.t <= this.mt2)	// pad x so am has enough room later
    x[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x[i]*mp mod DV
    var j = x[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i+this.m.t;
    x[j] += this.m.am(0,u0,x,i,0,this.m.t);
    // propagate carry
    while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = "xy/R mod m"; x,y != r
function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even
function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e,z) {
  if(e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
  g.copyTo(r);
  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e,z);
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);
// Depends on jsbn.js and rng.js

// convert a (hex) string to a bignum object
function parseBigInt(str,r) {
  return new BigInteger(str,r);
}

function linebrk(s,n) {
  var ret = "";
  var i = 0;
  while(i + n < s.length) {
    ret += s.substring(i,i+n) + "\n";
    i += n;
  }
  return ret + s.substring(i,s.length);
}

function byte2Hex(b) {
  if(b < 0x10)
    return "0" + b.toString(16);
  else
    return b.toString(16);
}

// *************** custom addition - begin *****************/
// PKCS#1 (type 1,FF) pad input string s to n bytes, and return a bigint
// Custom addition to origianl rsa.js
function pkcs1pad1(s,n) {
  
  if(n < s.length + 11) {
	alert("Message too long for RSA");
	return null;
  }
  
  var ba = new Array();

   ba[--n] = 0; // as if adding null to the string to be padded

  var i = s.length - 1;
  while(i >= 0 && n > 0) ba[--n] = s.charCodeAt(i--);
  ba[--n] = 0;
  
  while(n > 2) { 
	ba[--n] = 0xFF;
  }
  ba[--n] = 1;
  ba[--n] = 0;
  
  return new BigInteger(ba);
}
// *************** custom addition - end ******************/


// PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint
function pkcs1pad2(s,n) {
  if(n < s.length + 11) {
    //alert("Message too long for RSA");	    // **** custom addition - line commented
    return null;
  }
  var ba = new Array();

    // *************** custom addition - begin *****************/
   ba[--n] = 0; // as if adding null to the string to be padded
    // *************** custom addition - end ******************/

  var i = s.length - 1;
  while(i >= 0 && n > 0) ba[--n] = s.charCodeAt(i--);
  ba[--n] = 0;
  var rng = new SecureRandom();
  var x = new Array();
  while(n > 2) { // random non-zero pad
    x[0] = 0;
    while(x[0] == 0) rng.nextBytes(x);
    ba[--n] = x[0];
  }
  ba[--n] = 2;
  ba[--n] = 0;
  return new BigInteger(ba);
}

// "empty" RSA key constructor
function RSAKey() {
  this.n = null;
  this.e = 0;
  this.d = null;
  this.p = null;
  this.q = null;
  this.dmp1 = null;
  this.dmq1 = null;
  this.coeff = null;

    // *************** custom addition - begin ******************/
    this.publicKeyInit = false;
    // *************** custom addition - end ******************/
}

// Set the public key fields N and e from hex strings
function RSASetPublic(N,E) {
  if(N != null && E != null && N.length > 0 && E.length > 0) {
    this.n = parseBigInt(N,16);
    this.e = parseInt(E,16);

    // *************** custom addition - begin ******************/
    this.publicKeyInit = true; // custom addition
    // *************** custom addition - end ******************/

  }
  else
  {
    //alert("Invalid RSA public key");     // **** custom addition - line commented
      this.publicKeyInit = false; // custom addition
  }
}

// Perform raw public operation on "x": return x^e (mod n)
function RSADoPublic(x) {
  return x.modPowInt(this.e, this.n);
}

// Return the PKCS#1 RSA encryption of "text" as an even-length hex string
function RSAEncrypt(text) {
  var m = pkcs1pad2(text,(this.n.bitLength()+7)>>3);
  if(m == null) return null;
  var c = this.doPublic(m);
  if(c == null) return null;
  var h = c.toString(16);
  if((h.length & 1) == 0) return h; else return "0" + h;
}

// *************** custom addition - begin ******************/
// Return the PKCS#1 RSA encryption of "text" according to specific pad type and len
// Custom addition to original rsa.js
function RSAEncryptEx(text,padType,padLen) {
	
  var m;
  switch (padType)
  {
	case 1:
		m = pkcs1pad1(text,padLen);
		break;
	
	case 2:
		m = pkcs1pad2(text,padLen);
		break;
	
	default:
		return null;
  }
  
  if(m == null) return null;
  var c = this.doPublic(m);
  if(c == null) return null;
  var h = c.toString(16);
  if((h.length & 1) == 0) return h; else return "0" + h;
}
// *************** custom addition - end ******************/


// Return the PKCS#1 RSA encryption of "text" as a Base64-encoded string
//function RSAEncryptB64(text) {
//  var h = this.encrypt(text);
//  if(h) return hex2b64(h); else return null;
//}

// protected
RSAKey.prototype.doPublic = RSADoPublic;

// public
RSAKey.prototype.setPublic = RSASetPublic;
RSAKey.prototype.encrypt = RSAEncrypt;
RSAKey.prototype.encryptEx = RSAEncryptEx;	// custom addition to original rsa.js
//RSAKey.prototype.encrypt_b64 = RSAEncryptB64;

/* ********************* END OF JSBN/RSA CODE *************************** */

window.cpRSA = function()
{
    //this.ENCRYPT_LENGTH = 128;
    //this.PKCS1_PADDING_TYPE = 1;	// 1 - FF, 2 - Random

    this.isPublicKeySet = false;
    this.m = "";	// part of public key
    this.e = "";	// part of public key
    this.token = null;    // if login requires to encrypt password with token
	this.isAuthenticated = false; // for captive portal use - in case this session is already authenticated
	this.orgUrl = ""; // for captive portal use

    this.oRSAkey = null;
	this.rsaCB = function(){}

    /* ***************************************************************** */
    this.initPublicKey = function()
    {
        this.oRSAkey = new RSAKey();	// jsbn library

        DEBUG.out('RSA: calling server to get public key.');
        sendAsynchronousRequest('RSASettings','',this.savePublicKey,this);
    }
    /* ***************************************************************** */

    /* ***************************************************************** */
    this.isReadyToEncrypt = function()
    {
        return this.isPublicKeySet;      
    }
    /* ***************************************************************** */

    /* ***************************************************************** */
    this.savePublicKey = function(xhrStatus, xhrResponse)
    {
        if (xhrStatus != 200)
        {
            DEBUG.out('RSA: get Settings failed. ('+xhrStatus+')', DEBUG.ERROR);
            this.isPublicKeySet = false;
            //alert("RSA Error!");
            return;
        }

        var rsaJSONObj = JSON.parse(xhrResponse);

        this.m = rsaJSONObj.m;
        this.e = rsaJSONObj.e;

        if (!isNothingness(rsaJSONObj.loginToken))
        {
            this.token = rsaJSONObj.loginToken;
        }

        if (!isNothingness(rsaJSONObj.isAuthenticated))
        {
                this.isAuthenticated = rsaJSONObj.isAuthenticated;
        }
        else
        {
            this.isAuthenticated = false;
        }


        if (!isNothingness(rsaJSONObj.orgUrl))
        {
                this.orgUrl = rsaJSONObj.orgUrl;
        }        
        else
        {
            this.orgUrl = "";
        }
		
		
        // init inner rsa object
        this.oRSAkey.setPublic(this.m,this.e);

        // making sure rsa settngs are valid
        this.isPublicKeySet = this.oRSAkey.publicKeyInit;
        if (!this.isPublicKeySet)
        {
            DEBUG.out('savePublicKey: RSA public key invalid!\nm(' + this.m +')\ne(' + this.e + ')',DEBUG.ERROR);
        }
		this.rsaCB();
    }
    /* ***************************************************************** */


    /* ***************************************************************** */
    this.updatePublicKey = function(e, m)
    {        
        this.m = m;
        this.e = e;

        // init inner rsa object
        this.oRSAkey.setPublic(this.m,this.e);

        // making sure rsa settngs are valid
        this.isPublicKeySet = this.oRSAkey.publicKeyInit;
        if (!this.isPublicKeySet)
        {
            DEBUG.out('updatePublicKey: RSA public key invalid!\nm(' + this.m +')\ne(' + this.e + ')',DEBUG.ERROR);
        }
    }
    /* ***************************************************************** */


    /* ***************************************************************** */
    this.encrypt = function(text)
    {
    	// Try update keys from cookies.
    	var e = getCookie("RSASetting_e");
    	var m = getCookie("RSASetting_m");
        if ((!isNothingness(e)) && (!isNothingness(m)))
        {
        	DEBUG.out('Update RSA keys from cookie.');
        	this.updatePublicKey(e, m);
		}

        if (!this.isPublicKeySet)	// did you call this.initPublicKey?
        {
            DEBUG.out('Did you call initPublicKey? Did it fail?',DEBUG.ERROR);
            return "";
        }

                text = unescape( encodeURIComponent( text ) );

        if (!isNothingness(this.token))
        {
            text = this.token + text;    
        }

        // call the ecryption itself
        var value = this.oRSAkey.encrypt(text);  
		        if (value.length > 2)
        {
            var newPass = "";
            for (var j=value.length-2; j>=0; j=j-2)
            {
                newPass = newPass.concat(value.substr(j,2));
            }
            value = newPass;
        }

        return value;
    }
    /* ***************************************************************** */

}


window.cpRSAobj = new cpRSA();
window.cpRSAobj.initPublicKey();
//=============================================================================================
// Includes END

// Set namespace.
PORTAL_IS.VALIDATOR = {};

//=============================================================================================
PORTAL_IS.VALIDATOR.Validity = function()
{
	this.isValid = true;
	this.message = "";
	this.opaque = null;
}
//=============================================================================================



//=============================================================================================
PORTAL_IS.VALIDATOR.ValidatorStack = function()
{
	this.validatorStack = new Array();
	this.invalidMessage = "";

	// Add valkidator to the stack.
	this.add = function(validator)
	{
		this.validatorStack.push(validator);
	}

	// Empty the validator stack.
	this.clear = function()
	{
		this.validatorStack = new Array();
	}

	// Set a single message for invalidity. The message will override any of the validators'
	// messages.
	this.setInvalidMessage = function(message)
	{
		this.invalidMessage = message;
	}

	// Evaluate the stack. Retutn a Validity object.
	this.evaluate = function(value)
	{
		var validity = new PORTAL_IS.VALIDATOR.Validity();

		var i;
		var validatorStackSize = this.validatorStack.length;

		// Check each validator.
		for (i=0; ((validity.isValid)&&(i<validatorStackSize)); i++)
		{
			validity = this.validatorStack[i].validate(value);
		}

		// In case of invalidation and a message is assigned to the stack override the message with the stack's one.
		if ((!validity.isValid) && (this.invalidMessage != ""))
		{
        	validity.message = this.invalidMessage;
		}

		// Return validity.
		return validity;
	}
}
//=============================================================================================



//=============================================================================================
PORTAL_IS.VALIDATOR.Validator = function()
{
	// PRIVATE: (try not to use these methods).
	// The method used to validate the value. This method should return a PORTAL_IS.VALIDATOR.Validity object
	// representing the validity of the values as well as a message representing a reason for
	// being invalid.
	// OVERRIDE THIS METHOD WITH YOUR IMPLEMENTATION.
	this.validatingMethod = function(value, messageArr, argArr){return new PORTAL_IS.VALIDATOR.Validity();};

	// Arguments array to be passed to the validating method for a more generic usage (e.g. upper and lower range).
	this.argArr = new Array();

	// This message array should hold possible messages for various validation results.
	this.messageArr = new Array();


	// PUBLIC:
	// This function should be used to perform the validation.
	this.validate = function(value)
	{
		return this.validatingMethod(value, this.messageArr, this.argArr);
	}

	// Set arguments array to be passed to the validating method.
	this.setArgArr = function(argArr)
	{
		this.argArr = argArr;
	}

	// Assign message and matching id.
	this.setMessage = function(id, msg)
	{
		this.messageArr[id] = msg;
	}
}
//=============================================================================================



//=============================================================================================
PORTAL_IS.VALIDATOR.IsNotEmpty = function()
{
	this.validatingMethod = function(value)
	{
		var validity = new PORTAL_IS.VALIDATOR.Validity();

		// Check validity.
		validity.isValid = (!isNothingness(value) && (value.length >= 1));

		// Assign messages.
		if (!validity.isValid)
		{
			validity.message = this.messageArr[0];
		}

		// Extra stuff.

		// Return validity.
		return validity;
	}

	// Set defaults.
	this.setMessage(0, "Value may not be empty.");
}
//=============================================================================================



//=============================================================================================
PORTAL_IS.VALIDATOR.IsUnderMaxLength = function()
{
	// args=[max length, inclusive]
	// defaults: [0, true]

	this.validatingMethod = function(value)
	{
		var validity = new PORTAL_IS.VALIDATOR.Validity();

		var inclusive = (isNothingness(this.argArr[1]) ?  true : this.argArr[1] );

		// Check validity.
		validity.isValid = (!isNothingness(value) && ( inclusive ? (value.length <= this.argArr[0]) : (value.length < this.argArr[0]) ));

		// Assign messages.
		if (!validity.isValid)
		{
			validity.message = this.messageArr[0];
		}

		// Extra stuff.

		// Return validity.
		return validity;
	}

	// Set defaults.
	this.setMessage(0, "Value length should be under :"+this.argArr[1]);
}
//=============================================================================================



//=============================================================================================
PORTAL_IS.VALIDATOR.IsNumeric = function()
{
	this.validatingMethod = function(value)
	{
		var validity = new PORTAL_IS.VALIDATOR.Validity();

		// Check validity.
		validity.isValid = !isNaN(value);

		// Assign messages.
		if (!validity.isValid)
		{
			validity.message = this.messageArr[0];
		}

		// Extra stuff.

		// Return validity.
		return validity;
	}

	// Set defaults.
	this.setMessage(0, "Value must be numeric.");
}
//=============================================================================================



//=============================================================================================
PORTAL_IS.VALIDATOR.IsInteger = function()
{
	this.validatingMethod= function(value)
	{
		var validity = new PORTAL_IS.VALIDATOR.Validity();

		// Check validity.
		validity = new PORTAL_IS.VALIDATOR.IsNumeric().validate(value); // Check if numeric.

		if (validity.isValid)
		{
			validity.isValid = (parseInt(value) == value);

			// Assign messages.
			if (!validity.isValid)
			{
				validity.message = this.messageArr[0];
			}
		}

		// Return validity.
		return validity;
	}

	// Set defaults.
	this.setMessage(0, "Value must be an integer.");
}
//=============================================================================================



//=============================================================================================
PORTAL_IS.VALIDATOR.IsNumberInRange = function()
{
	// args=[lower, upper, inclusive]
	// To ommit any of the limits pass null.
	// Examples:
	// 		value >  0 => arge=[0, null, false]
	// 		value <= 0 => arge=[null, 0, true]
	// Default args: [ null, null, false]
	this.validatingMethod= function(value)
	{
		if (isNothingness(this.argArr))
		{
			this.argArr = [null, null, false];
		}
		var lowerLimit 	= (isNothingness(this.argArr[0]) ? null : this.argArr[0]);
		var upperLimit 	= (isNothingness(this.argArr[1]) ? null : this.argArr[1]);
		var inclusive	= (this.argArr[2] == true);

		var validity = new PORTAL_IS.VALIDATOR.Validity();

		// Check validity.
		validity = new PORTAL_IS.VALIDATOR.IsNumeric().validate(value); // Check if numeric.

		if ((!isNothingness(this.argArr[0])) && (validity.isValid))
		{
			if (!(validity.isValid = (inclusive ? (value >= this.argArr[0]) : (value > this.argArr[0])) ))
			{
				// Assign messages.
				validity.message = this.messageArr[0];
			}
		}

		// Check validity.
		if ((!isNothingness(this.argArr[1])) && (validity.isValid))
		{
			if (!(validity.isValid = (inclusive ? (value <= this.argArr[1]) : (value < this.argArr[1])) ))
			{
				// Assign messages.
				validity.message = this.messageArr[1];
			}
		}

		// Return validity.
		return validity;
	}

	// Set defaults.
	this.setMessage(0, "Value is below valid range.");
	this.setMessage(1, "Value is above valid range.");
	this.setArgArr([null, null, false]); // Set no range and exclusive.
}
//=============================================================================================



//=============================================================================================
PORTAL_IS.VALIDATOR.IsPositiveNumber = function()
{
	// Set defaults.
	this.setMessage(0, "Value must be a positive integer.");
	this.setArgArr([0, null, false]); // ==> value > 0
}
//=============================================================================================



//=============================================================================================
PORTAL_IS.VALIDATOR.IsNegativeNumber = function()
{
	// Set defaults.
	this.setMessage(0, "Value must be a negative integer.");
	this.setArgArr([null, 0, false]); // ==> value < 0
}
//=============================================================================================



//=============================================================================================
// Extend Validator.
PORTAL_IS.VALIDATOR.IsNotEmpty.prototype 		= new PORTAL_IS.VALIDATOR.Validator();
PORTAL_IS.VALIDATOR.IsUnderMaxLength.prototype 	= new PORTAL_IS.VALIDATOR.Validator();
PORTAL_IS.VALIDATOR.IsNumeric.prototype 		= new PORTAL_IS.VALIDATOR.Validator();
PORTAL_IS.VALIDATOR.IsInteger.prototype 		= new PORTAL_IS.VALIDATOR.Validator();
PORTAL_IS.VALIDATOR.IsNumberInRange.prototype	= new PORTAL_IS.VALIDATOR.Validator();

// Extend others validators.
PORTAL_IS.VALIDATOR.IsPositiveNumber.prototype = new PORTAL_IS.VALIDATOR.IsNumberInRange();
PORTAL_IS.VALIDATOR.IsNegativeNumber.prototype = new PORTAL_IS.VALIDATOR.IsNumberInRange();
//=============================================================================================



//=============================================================================================
PORTAL_IS.VALIDATOR.evaluateValidatorStack = function(validatorStack, value)
{
	var validity = new PORTAL_IS.VALIDATOR.Validity();
	
	var i;
	var validatorStackSize = validatorStack.length;

	for (i=0; ((validity.isValid)&&(i<validatorStackSize)); i++)
	{
		validity = validatorStack[i].validate(value);
	}

	// Return validity.
	return validity;
}
//=============================================================================================






// Portal IS's view manager.
window.ViewManager = function()
{
	// Initialize view manager.
	//=============================================================================================
	this.init = function()
	{
		DEBUG.out("ViewManager::init");

		// Bind history change handler.
		$(window).bind('hashchange', viewManager.handleHistoryChange);        
	}
	//=============================================================================================



	// Hash to view mapping, enables us to set display another value than the actual view name.
	//==================================================================================================================
	this.hashViewMap = new Array();

	// Set default view and hash, override if you will:
	this.hashViewMap_defaultView = "Init";
	this.hashViewMap_defaultHash = "Init";

	//              Hash name									View name
	//________________________________________________________________________________________________________________
	/*
	Example:
	this.hashViewMap["Init"]								=	"Init";
	this.hashViewMap["Authentication"]						=	"Authentication";
	this.hashViewMap["SingleIncidentReview"]				=	"SingleIncidentReview";
	this.hashViewMap["SenderListAllQuarantinedEmails"]		=	"SenderListAllQuarantinedEmails";
	this.hashViewMap["MainWithMenuView"]					=	"MainWithMenuView";
	this.hashViewMap["Menu"]								=	"Menu";
	this.hashViewMap["Logout"]								=	"Logout";
	this.hashViewMap["MainView"]							=	"MainView";
	this.hashViewMap["Error"]								=	"Error";
	*/

	// Get View name from Hash name.
	this.hash2View = function(hash)
	{
		var view = this.hashViewMap[hash];

		if (isNothingness(view))
		{
			view = this.hashViewMap_defaultView;
		}
		return view;
	}


	// Get Hash name from View name.
	this.view2Hash = function(view)
	{
		var hash = this.hashViewMap_defaultHash;
		for (key in this.hashViewMap)
		{
			if (this.hashViewMap[key] == view)
			{
				var hash = key;
			}
		}
		return hash;
	}
	//==================================================================================================================



	// HASH/HISTORY RELATED METHODS
	// _________________________________________________________________________________________________________________


	// Return the address hash, unparsed.
	//=============================================================================================
	this.getAddressHash = function()
	{
		return top.location.hash.replace('#','');
	}
	//=============================================================================================


    // Handle history changes (back/reload).
    // OVERRIDE ME.
	//=============================================================================================
	this.handleHistoryChange = function(e, ui)
	{
		DEBUG.out("ViewManager::handleHistoryChange, hash changed to:" + ui.value);
		DEBUG.out("ViewManager::handleHistoryChange, unhandled hash change.");
	}
	//=============================================================================================


	//==================================================================================================================
	this.generateHash = function(view, data)
    {
    	var outputStr = "";
        var dataStr = "";

		dataStr = "/"+$.base64Encode(JSON.stringify(data));

		outputStr = "#"+this.view2Hash(view) + dataStr;

		return outputStr;
    }
    //==================================================================================================================

	//==================================================================================================================
	this.parseHash = function()
	{
		var hash = this.getAddressHash();

		var hashObj = {};
        hashObj.view = null;
        hashObj.data = {};

        var splitPoint = hash.indexOf("/");

        if (splitPoint > -1)
        {
        	hashObj.view = hash.substr(0, splitPoint);

        	if (hash.length > splitPoint)
			{
				try
				{
					hashObj.data = JSON.parse($.base64Decode(hash.substring(splitPoint+1, hash.length)));
				}
				catch (e)
				{
					DEBUG.out('ViewManager::parseHash Error while parsing hash data.', DEBUG.ERROR, e);
				}
			}
		}
		else if (hash != "")
		{
		    hashObj.view = this.hash2View(hash);
		}

		return hashObj;
	}
	//==================================================================================================================


	//==================================================================================================================
	this.changeHash = function(view, data, quietly)
	{
		DEBUG.out('ViewManager::changeHash.');


		if (isNothingness(quietly))
		{
			quietly = false;
		}

		if (quietly)
		{
			DEBUG.out('ViewManager::changeHash, Changing hash quietly.');
			viewManager.ignoreHashChange = true;
		}

		$(window).history('add', this.generateHash(view, data));
	}
	//==================================================================================================================
}	
/*
________________________________________________________________________________________________________________________

PORTAL IS - ESSENTIALS INCLUSION - END
========================================================================================================================
*/
// NAC's view manager.
window.NacViewManager = function()
{
	this.lastRenderedCustomContentContainers = new Array();
	this.callback = new Callback();

	// Get state with it's View (CSS, JS and HTML).
	// Will call upon callback when done rendering the view.
	// In case the returned view is of the given "suppressedViewName" it's view render will be ignored.
	//=============================================================================================
	this.gotoNextState = function(callback, suppressedViewName, delayInterval)
	{
    	DEBUG.out("ViewManager::gotoNextState");

    	if (callback == undefined)
    	{
    	    callback = new Callback();
		}

		if (isNothingness(suppressedViewName))
    	{
    	    suppressedViewName = "";
		}

        var sAbsoluteURL = getURL("GetStateAndView");
        var params = "";
        var cb = new Callback();
        cb.methodReference = this.handleNewView;
        cb.thisArgument = this;
        cb.args = [callback, suppressedViewName,delayInterval];
        PORTAL_IS.AJAX_MGR.sendAsyncReq(sAbsoluteURL,params,cb,this.errorHandler);

	}
	//=============================================================================================


	// Get view contents (CSS, JS and HTML).
	// Will call upon callback when done rendering the view.
	//=============================================================================================
	this.gotoView = function(view, callback)
	{
		if (callback == undefined)
    	{
    	    callback = new Callback();
		}

    	DEBUG.out("ViewManager::gotoView ("+view+")");


        // fetch the org url
        var sAbsoluteURL = getURL("GetViewData");
        var params = "view="+view;
        var cb = new Callback();
        cb.methodReference = this.handleNewView;
        cb.thisArgument = this;
        cb.args = [callback];
        PORTAL_IS.AJAX_MGR.sendAsyncReq(sAbsoluteURL,params,cb,this.errorHandler);

	}
	//=============================================================================================

    //=============================================================================================

    this.errorHandler = function(portalException, callback)
    {
        DEBUG.out('NAC Access:  ViewManager request failed. ' +
                    'PortalException:' + portalException.errMsg, DEBUG.ERROR);


        //if (portalException.portalErrorType == PortalErrorType.NETWORK_TIMEOUT)
		if (portalException.portalErrorType != PortalErrorType.BAD_XHR_STATUS)
        {
            alert(portalException.errMsg + " Please try reloading the page.");
            return;
        }

    }

    //=============================================================================================

	//=============================================================================================
	this.handleNewView = function(xhrStatus, xhrResponse, callback, suppressedViewName, delayInterval)
	{
		if (callback == undefined)
    	{
    	    callback = new Callback();
		}

		if (xhrStatus != 200)
		{
			// TODO: Handle error.
			DEBUG.out('Retreiving view failed. ('+xhrStatus+')', DEBUG.ERROR);
			callback.call();
			return;
		}

		var newViewJSONObj = JSON.parse(xhrResponse);
        var newView = newViewJSONObj.view;
		DEBUG.out("Parsed from JSON - view:" + newView);
	
		if (suppressedViewName == newView)
		{
			this.callback = callback;
			setTimeout("window.viewManager.callback.call()", delayInterval);
			DEBUG.out('NacViewManager::handleNewView - suppressing view changes ' + delayInterval);
			
			//callback.call();
			return;
		}	
		// if there is a suppressed view name, just not in this stage
		else if (suppressedViewName != undefined && suppressedViewName != "")
		{
			callback = new Callback();
		}
		
		var useDefaultContainerId   = true;
		var requiredContainerId     = "";
		var requiredView            = "";
		var viewCallback = "";
		
		switch (newView)
		{

			// Login Sequence View group ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case "Authentication":
                viewCallback = "window.oAuthentication.onRender()";

			case "Agreement":
            case "Final":
            case "Error":
			case "AgentChoice":
            case "Agent":
			case "AgentInstalled":
            case "SignOff":
	                useDefaultContainerId   = false;
                requiredContainerId     = "LoginSequencePage_Content";
				requiredView            = "LoginSequenceView";
            break;

			default: // View will be rendered into main page view.

				useDefaultContainerId   = true;
				
               	/*
				DEBUG.out('Render new view ('+newViewJSONObj.view+') into default location.');
				evaluateCSS(newViewJSONObj.css, getURL("css/" + newViewJSONObj.view));
				evaluateHTMLContent(newViewJSONObj.html);
				evaluateJavaScript(newViewJSONObj.javascript);
				*/
			break;
		}


 	    // Check if the Main View is already rendered.
		if  (
				useDefaultContainerId
				||
		        (    (document.getElementById(requiredContainerId) != undefined)
			      && (document.getElementById(requiredContainerId) != null)    )
		)

		{
			DEBUG.out('Render new view ('+newViewJSONObj.view+') into ' + (useDefaultContainerId ? "DefaultContainer" : requiredContainerId) + ".");
			
			// Render CSS.
			evaluateCSS(newViewJSONObj.css, getURL("css/" + newViewJSONObj.view));
			
			// Render HTML Content.
			
            var destinationRef;
			if (useDefaultContainerId)
			{
			    destinationRef = document.getElementById("portal_main_view");
				//evaluateHTMLContent(newViewJSONObj.html);
			}
			else
			{
			    destinationRef = document.getElementById(requiredContainerId);
			}
			
            destinationRef.style.display = "none";
		    evaluateHTMLContent(newViewJSONObj.html, destinationRef);

			// Render JavaScript Content.
			// might add content to html (like realms)
			evaluateJavaScript(newViewJSONObj.javascript);

            // Render custom content.
            // todo : see is we want to implement this xxx
			this.getViewCustomContent(newViewJSONObj.view);
			
            destinationRef.style.display = "block";
			
            if (viewCallback)
            {
                eval(viewCallback);
                //setTimeout(containerCallback,0);
            }

		}
		else
		{
			DEBUG.out('Main View needs to be rendered first.');

			// Set the previous view results in a callback, it will be called when finished rendering of the login sequence page.
			var requiredViewCallback = new Callback();
			requiredViewCallback.methodReference    = this.handleNewView;
			requiredViewCallback.thisArgument       = this;
			requiredViewCallback.args               = [200, xhrResponse]; // Set fake status and response.

			// Request specific view.
			this.gotoView(requiredView, requiredViewCallback);
			
		}


		// Done here, call the callback.
		callback.call();
	}
	//=============================================================================================


	// Get the view's custom Content.
	//=============================================================================================
	this.getViewCustomContent = function(view)
	{

        var userAgent = window.navigator.userAgent.toLowerCase();
        if  ((userAgent.indexOf("iphone") != -1) ||
			 (userAgent.indexOf("ndroid") != -1) ||
             (userAgent.indexOf("ipod") != -1) )
        {
            // no custom content in iphone
            return;
        }


		this.clearLastCustomContent();

        // fetch the org url
        var sAbsoluteURL = getURL("viewManager/GetViewCustomContent");
        var params = "view="+view;
        var cb = new Callback();
        cb.methodReference = this.renderCustomContent;
        cb.thisArgument = this;
        PORTAL_IS.AJAX_MGR.sendAsyncReq(sAbsoluteURL,params,cb);

	}
	//=============================================================================================


	// Render the custom content.
	//=============================================================================================
	this.renderCustomContent = function(xhrStatus, xhrResponse, callbackObj)
	{
		DEBUG.out('Render custom content.');
		callback = new Callback(callbackObj);

		if (xhrStatus != 200)
		{
			// TODO: Handle error.
			DEBUG.out('Retreiving custom content failed. ('+xhrStatus+')', DEBUG.ERROR);
			callback.call();
			return;
		}

		// The container Id is: "CustomContent_<VIEW NAME>_<RESOURCE KEY>".
		// For example: the "ISW" view and the resource key of "top" will be rendered into "CustomContent_ISW_top".

		var newCustomContentJSONObj = JSON.parse(xhrResponse);
        var keyArr  = newCustomContentJSONObj.keyMap;
        var view    = newCustomContentJSONObj.view

        // you could choose a different view for different states
	    var usedView = "LoginSequencePage";

        // Iterate on each of the custom content object.
        var customContent, containerId, key;
        //for (var key in keyMap)
        
        for (key in keyArr)
		{
			customContent = keyArr[key];
			containerId = "CustomContent_"+usedView+"_"+key;
			DEBUG.out('Render custom content: usedView:['+usedView+"] into:["+containerId+"]");
            this.evaluateCustomContent(customContent, containerId);
            this.lastRenderedCustomContentContainers.push(containerId);
		}

		// Call the callback.
		callback.call();
	}

    // Encapsulate conditional rendering of the custom content.
	this.evaluateCustomContent = function(customContent, containerId)
	{
		destinationRef = document.getElementById(containerId);
		if ( (destinationRef != null) && (destinationRef != undefined) )
		{
			evaluateHTMLContent(customContent, destinationRef);
		}
	}
	//=============================================================================================


	// Clear last rendered containers.
	//=============================================================================================
	this.clearLastCustomContent = function()
	{
		for (var containerIndex in this.lastRenderedCustomContentContainers)
		{
			this.evaluateCustomContent("&nbsp;", this.lastRenderedCustomContentContainers[containerIndex]);
		}

		this.lastRenderedCustomContentContainers = new Array();
	}
    //=============================================================================================
	
	//Changes the button CSS class (workaround for IE6-8).
	this.setButtonState = function(state,button)
	{
		
		var correctClass = "class";
		if(window.browserDetails.browserType == window.BrowserType.IE && window.browserDetails.browserVersion <= 7 && document.documentMode === undefined)
		{
			correctClass = "className";
		}
		
		if(button.getAttribute(correctClass).indexOf("disabled") == -1)
		{
			//The button is not disabled.
			button.setAttribute(correctClass, "button" + state);
		}
		
	}
	
	
}

// Extend ViewManager (Portal IS).
NacViewManager.prototype = new ViewManager();
window.viewManager = new NacViewManager();

var isTabActive = true;

window.onfocus = function () {
        isTabActive = true;
};

window.onblur = function () {
        isTabActive = false;
};

createPageClosingWarningOnfocus = function()
{
        if (window.isTabActive)
        {
                return pageClosingWarning();
        }
        else
        {
                return;
        }
}

        </script>
        
                

		<title>Network Login</title>
		
	
		<script type="text/javascript">		
			window.cpRSAobj.rsaCB = function()
			{
				if (window.cpRSAobj.isAuthenticated)
				{			
					document.getElementById("portal_main_view").style.visibility = "hidden";
					var anchor = document.createElement("a");
					anchor.href = window.cpRSAobj.orgUrl;
					if(anchor.protocol != "javascript:") {
						location.href = window.cpRSAobj.orgUrl;
					}
				}
				else
				{
					document.getElementById("portal_main_view").style.visibility = "visible";
				}
				return;
			}
		</script>
		
		<script type="text/javascript">
                onbeforeunload = createPageClosingWarningOnfocus;
		</script>
	</head>

	<body class="usercheck_body_background_class" unselectable="on">
		<noscript>
			This portal requires browser which support JavaScript.<br>Please make sure that you are using an updated browser and that JavaScript is enabled.        </noscript>
		
		<div class="div_expanded" unselectable="on">
			<table height="100%" width="100%" BORDER=0 CELLPADDING=0 CELLSPACING=0 class="">
				<tr>
					<td id="portal_center_div" valign="top" unselectable="on" class="usercheck_main_background_class">
						<div id="portal_top_pane_div" class="usercheck_header_class usercheck_main_background_class">
							
<!--position: fixed; bottom: -1px; left: 50%; margin-left: -435px; -->

<table width="100%" cellpadding="0" cellspacing="0" class="usercheck_header_table_class usercheck_content_table_class">
	<tr height="93px">
		<td class="usercheck_header_left_class" unselectable="on">
		</td>
		<td class="usercheck_header_center_class" unselectable="on">
		</td>
		<td class="usercheck_header_right_class" unselectable="on">
			<img src="images/cp_logo_1.png" class="usercheck_company_logo_class" id="usercheck_company_logo" ></img>
		</td>
	</tr>
</table>

<div class="usercheck_page_title_class" id="usercheck_page_title" unselectable="on">INTA</div>						</div>
				<BR/>
						<div style="text-align: center;" unselectable="on">
						<table cellpadding="0" cellspacing="0" class="usercheck_content_table_class">
						<tr>
							<td rowspan="2" valign="top"><div id="usercheck_img_div" unselectable="on">&nbsp;</div></td>
							<td><div id="usercheck_title_div" class="usercheck_title_class" unselectable="on">&nbsp;</div></td>
						</tr>
						<tr>
							<td><div id="portal_main_view" class="usercheck_message_class" unselectable="on">&nbsp;</div></td>
						</tr>
						<tr>
						<td colspan="2" style="text-align: center;" unselectable="on">
							<center>
							<div id="usercheck_ok_div" class="usercheck_ok_button_div_class">&nbsp;</div>
							</center>
						</td>
						</tr>
						</table></div>
					</td>
				</tr>
				<tr>
					<td id="usercheck_footer_td" class="usercheck_footer_class usercheck_footer_height_class">
						<div id="portal_bottom_pane_div">
							
<!--position: fixed; bottom: -1px; left: 50%; margin-left: -435px; -->

<table cellpadding="0" cellspacing="0" class="usercheck_footer_table_class">
	<tr>
		<td class="usercheck_footer_height_class">
		<div id="usercheck_language_selection_div" class="usercheck_lang_select_div_class" style="display: none;">
			<label for="language_selection">                  
			<select id="usercheck_language_selection" class="usercheck_lang_select_class" onchange='oAuthentication.select_lang(this.options[selectedIndex].value);location.reload();' disabled>
						<option class="languageOption" value='en_US' selected>
				English</option>
			            </select>
            </label>
			</div>
		</td>
	</tr>
</table>
						</div>
					</td>
				</tr>
			</table>
        </div>
	</body>


    <script type="text/javascript">
	//Add workaround for IE6-7.
	if(window.browserDetails.browserType == window.BrowserType.IE && window.browserDetails.browserVersion <= 7 && (document.documentMode === undefined || document.documentMode <= 7))
	{
		var footer_td = document.getElementById('usercheck_footer_td');
		footer_td.setAttribute("className", footer_td.getAttribute("className") + " usercheck_main_background_class");
	}
	
	viewManager.gotoNextState();
		
    </script>

</html>
