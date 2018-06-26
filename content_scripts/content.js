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
browser.runtime.onMessage.addListener(request =>{
	//The request will be sent, but the it never return value to response1 in time,
	// because the xhr.onreadystatechange = processRequest is asynchronous. 
	var response1 = montaBodyDownload(request.url);

	function montaBodyDownload(Url){
		var xhr = new XMLHttpRequest();
		var configMethod = "core.get_config";
		var bodyConfig = JSON.stringify({"id": 1, "method": configMethod, "params": []});
		xhr.open('POST', Url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		//send method core.get_config to get de delug configuration
		// and then create the body "params" with it		
		xhr.send(bodyConfig);
		xhr.onreadystatechange = processRequest;
		function processRequest(e) {
			//xmlHttpRequest is DONE === 4 
			if (xhr.readyState == 4 && xhr.status == 200) {
				var config = JSON.parse(xhr.responseText);
				if (config.error) {
					console.error(browser.i18n.getMessage("errorDelugeMethod",[config.error.message,configMethod]));
					return false;
				}
				var body = {
					"method": "web.add_torrents",
				   	"params": [
				      	[
				      		{
					        	"path": request.magnetLink,
								"options": {
									"file_priorities":[ ],
									"add_paused": config.result.add_paused,
									"compact_allocation": config.result.compact_allocation,
						            "download_location": config.result.download_location,
						            "move_completed": config.result.move_completed,
						            "move_completed_path": config.result.move_completed_path,
						            "max_connections": config.result.max_connections_per_torrent,
						            "max_download_speed": config.result.max_download_speed,
						            "max_upload_slots": config.result.max_upload_slots_per_torrent,
						            "max_upload_speed": config.result.max_upload_speed,
						            "prioritize_first_last_pieces": config.result.prioritize_first_last_pieces
								}
							}
				      	]
				   	],
				   	"id":2
				};
				//Send the xmlHttpRequest with params to download the Torrent
				sendDownload(Url, body);
			}else if(xhr.readyState == 4 && xhr.status != 200){
				console.error(browser.i18n.getMessage("errorXmlHttpRequest",[xhr.status,configMethod]));
				return false;
			}
		}
	}

	function sendDownload(Url, bodyDownload){
		var xhr2 = new XMLHttpRequest();
		xhr2.open('POST', Url, true);
		xhr2.setRequestHeader("Content-Type", "application/json");
		xhr2.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		xhr2.send(JSON.stringify(bodyDownload));
		xhr2.onreadystatechange = processRequest2;
		function processRequest2(e) {
			if (xhr2.readyState == 4 && xhr2.status == 200) {
				var downloadRespose = JSON.parse(xhr2.responseText);
				if (downloadRespose.error) {
					console.error(browser.i18n.getMessage("errorDelugeMethod",[downloadRespose.error.message,bodyDownload.method]));
					return false;
				}
				return downloadRespose;
			}else if(xhr2.readyState == 4 && xhr2.status != 200){
				console.error(browser.i18n.getMessage("errorXmlHttpRequest",[xhr2.status,bodyDownload.method]));
				return false;
			}
		}
	}
});


