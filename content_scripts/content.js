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

	return 	add_torrent(request.url,request.magnetLink);

	function add_torrent(url,magnetLink){
		return new Promise((resolve,reject) =>{
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");
			myHeaders.append("X-Requested-With", "XMLHttpRequest");
			var myBody = JSON.stringify({
				method: 'core.add_torrent_magnet',
				params: [
					magnetLink,
					{}
				],
				id: 2
			});
			var init = {
				credentials: 'same-origin', //Necessario para firefox versão < 60, envia os cookie da pagina de origem
				method: 'POST',
				headers: myHeaders,
				body: myBody
			}
			fetch(url,init).then(response => {
				if(response.ok){
					return response.json();
				}else{
					console.error("Connection Error: " + response.status.toString()+" "+ response.statusText);
				}
			}).then( json => {
				if(json.error === null){
					resolve({ torrentName: getName(magnetLink)});
				}else{
					reject(new Error(JSON.stringify({
						torrentName: getName(magnetLink),
						errorMessage: json.error.message
					})));
				}
			}).catch((error) => {
				reject(new Error(JSON.stringify({
						torrentName: url,
						errorMessage: error.message
				})));
			});
		});
	}

	function getName(url){
		var url_dec = decodeURIComponent(url);
		var urlArray = url_dec.split('&');
		var torrentName = null;
		for (var i = 0; i < urlArray.length; i++) {
			if (urlArray[i].startsWith('dn=')) {
				torrentName = urlArray[i].slice(3,urlArray[i].length);
			}
		}
		if (torrentName === null) torrentName = browser.i18n.getMessage("errorGetTorrentName");
		return torrentName;
	}
});