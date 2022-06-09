import { BeePackage } from "./BeePackage.class.js";

/*
	Index.js
*/

function ElementSelect(x, p = document) { return p.querySelector(x) }


/* The below is the file in question. */
var pkg;
/* The below is the variable declaring whether or not it is a zip or a bee_pack */
var zipType = "zip";
/* The below is for downloading the file */
const btnDownload = ElementSelect('#btn-download');
/* The below is for saving the project for future purposes */
const btnSave = ElementSelect('#button-save');
/* The below is the button to toggle between zip and bee_pack */
const btnZipTypeToggle = ElementSelect('#button-zip-type-toggle');
/* The below is the button to merge bee_pack */
const btnMergePack = ElementSelect('#button-merge-pack');

/* if ever find ye an explanation of the following, please inform me. -IMyself*/
function removeAllChildren(el) {
	while (el.lastChild) { el.removeChild(el.lastChild) }
}

function setupPackage(json={}) {
	pkg = new BeePackage(json);

	// Run HTML setup, append generated html to container
	
	// This isn't necessary. Packages can't be loaded by file yet.
	// removeAllChildren(q('#pkg-container'));
	ElementSelect('#pkg-container').appendChild(pkg.html());

	btnDownload.onclick = () => {
		btnDownload.disabled = true;
		btnDownload.innerText = 'Processing...';

		pkg.export().then((x)=>{

			btnDownload.innerText = 'Saving...';
			if (zipType == "zip") {

				saveAs(x, `ucp_${pkg.idl}.zip`);
				btnDownload.disabled = false;
				btnDownload.innerHTML = 'Download .zip';
			}
			else if (zipType == "bee")
			{
				saveAs(x, `ucp_${pkg.idl}.bee_pack`);
				btnDownload.disabled = false;
				btnDownload.innerHTML = 'Download .bee';
			};

		}).catch((err)=>{
			
			btnDownload.disabled = false;
			btnDownload.innerText = 'Download';

			console.warn( 'An error occurred:\n\n', err );
			alert( 'An error occurred:\n\n' + err + '\n\nDumped to console.' );

		})
	}
}

function restoreSave() {
	const stored = localStorage.getItem('beepkg-autosave');
	try {
		if (stored != null)
			//important
			return JSON.parse(LZString.decompressFromUTF16(stored));
	}
	catch {
		console.warn( 'Your package could not be recovered successfully.', stored );
		alert('Your package could not be recovered successfully. Save dumped to console.');
	}
	return {}
}

var needsSave = true;

btnSave.onclick = function() {
	if (!needsSave) { return }
	this.classList.remove('needs-save');
	btnSave.innerText = 'Changes Saved';
	localStorage.setItem( 'beepkg-autosave', pkg.compress() );
	needsSave = false;
}

btnZipTypeToggle.onclick = function ()
{
	if (zipType == "zip") {
		zipType = "bee";
		btnZipTypeToggle.innerHTML = "to .zip"
		btnDownload.innerHTML = "Download .bee"
	}
	else if (zipType == "bee") {
		zipType = "zip";
		btnZipTypeToggle.innerHTML = "to .bee_pack"
		btnDownload.innerHTML = "Download .zip"
	};
}
btnMergePack.onclick = function ()
{
	alert("This button is in alpha developing state. No proper function yet available.")

	//Disable screen, overlay with merger container.
	/* Greyed out screen */
	var page = document.getElementById("mainHTML");
	var btnMerge = document.getElementById("button-merge-pack")
	var btnZip = document.getElementById("button-zip-type-toggle")
	page.innerHTML += `<div id="grey-screen"></div>`;
	btnMerge.disabled = true;
	btnZip.disabled = true;
	/* Merger overlay */
	var overlay = document.getElementById("grey-screen")
	overlay.innerHTML += `<div id="merger-overlay"></div>`
	overlay = document.getElementById("merger-overlay")
	overlay.innerHTML += `<div id="merger-input"></div>`
	overlay = document.getElementById("merger-input")
	overlay.innerHTML += `<div>
<p style="color:darkgrey;">First package</p>
<br />
<input type="file"></input>
<br />
<p style="color:darkgrey;">Second package</p>
<br />
<input type="file"></input>
</div>`

    
	
}


function beginAutosaveLoop() {

	ElementSelect('#pkg-container').addEventListener('input',()=>{
		btnSave.classList.add('needs-save');
		btnSave.innerText = 'Save Now';
		needsSave = true;
	})

	setInterval( ()=>{
		if (!needsSave) { return }
		btnSave.classList.remove('needs-save');
		btnSave.innerText = 'Changes Saved';
		localStorage.setItem( 'beepkg-autosave', pkg.compress() )
		needsSave = false;
	}, 1000*30 )
}

setupPackage(restoreSave())
beginAutosaveLoop()
