/*  
	DelugeAddTorrent,
	Copyright (C) 2018  Murilo Portugal

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see [http://www.gnu.org/licenses/].
 */
browser.contextMenus.create({
	id: browser.i18n.getMessage("contextId"),
	title: browser.i18n.getMessage("contextTitle"),
	contexts: ["link"],
});
 
browser.contextMenus.onClicked.addListener((info, tab) => {
	//Get delugeWeb Url informed in options
	browser.storage.local.get("dUrl", function(result){
		if (!result.dUrl) {
			notification(browser.i18n.getMessage("errorUrlOptions"));
			console.error(browser.i18n.getMessage("errorUrlOptions"));
			browser.runtime.openOptionsPage();
			return false;
		}
		if (!info.linkUrl.startsWith('magnet')) {
			console.error(browser.i18n.getMessage("errorNotMagnet",[info.linkUrl]));
			return false
		}
		var magnetLink = info.linkUrl;
		var url = result.dUrl;
		var queryUrl = result.dUrl;
		//Add the /json 
		if(url.endsWith("/")){
			url = url+"json";
		}else{
			url = url + "/json";
		}
		var jsonObj = {"magnetLink": magnetLink, "url": url};
		
		//Remove http,https if exists
		if(queryUrl.match("http?.://")){
			queryUrl = queryUrl.replace(queryUrl.match("http?.://"),"");
		}
		//Remove port if exists
		if(queryUrl.match(":[0-9]+")){
			queryUrl = queryUrl.replace(queryUrl.match(":[0-9]+"),"");
		}
		//Remove the last / if exists
		if(queryUrl.endsWith("/")){
			queryUrl = queryUrl.slice(0,queryUrl.length -1);
		}
		//Create the correct Match pattern structure
		queryUrl = "*://"+queryUrl+"/";		
		//Use tabs.query({url}) to find the tab.id of delugeWeb,
		//then inject the content.js script in that tab to send the requests from there.
		//This is necessary to avoid CORS, otherwise the Twisted server will send the error 405
		function logTabs(tabs) {
		  if (tabs.length===0) {
		  	console.error(browser.i18n.getMessage("errorQueryURL",[url,queryUrl]));
		  	return false;
		  }
		  for (let tab1 of tabs) {
			browser.tabs.executeScript(tab1.id,{file: 'content_scripts/content.js'}, function() {
				browser.tabs.sendMessage(tab1.id,jsonObj).then( response => {
					notification(browser.i18n.getMessage("sucessTorrent",[response.torrentName]));
				}, error => {
					var error_message = JSON.parse(error.message);
					console.error(browser.i18n.getMessage("failTorrent",[error_message.torrentName, error_message.errorMessage]));
					notification(browser.i18n.getMessage("failTorrent",[error_message.torrentName, error_message.errorMessage]));
				});
			});
		  }
		}

		function notification(message){
			browser.notifications.create({
				type: 'basic',
		        iconUrl: browser.extension.getURL('icons/deluge-48.png'),
		        title: browser.i18n.getMessage("extensionName"),
				message: message
			}).then((id) =>{
				setTimeout(() => browser.notifications.clear(id), 5000);
			});
		}

		function onError(error) {
		  console.error(browser.i18n.getMessage("errorQueryURL",[url,queryUrl]));
		  return false;
		}

		var querying = browser.tabs.query({url: queryUrl});
		querying.then(logTabs, onError);
	});
});



