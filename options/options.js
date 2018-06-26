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
function saveOptions(e){
	e.preventDefault();
	browser.storage.local.set({
		dUrl: document.querySelector('#dUrl').value
	});
}

function restoreOptions(){
	function setCurrentChoice(result){
		document.querySelector('#dUrl').value = result.dUrl || 'http://delugeweb:port/';
	}

	function onError(error){
		console.log(error);
	}

	var getting = browser.storage.local.get("dUrl");
	getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.getElementById("textAbout").innerHTML = browser.i18n.getMessage("textAboutOptions");
document.getElementById("about").innerHTML = browser.i18n.getMessage("aboutOptions");