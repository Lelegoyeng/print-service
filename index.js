var express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs')
const html_to_pdf = require('html-pdf-node');
const { getPrinters, print } = require("pdf-to-printer");
var pdf = require("html-pdf-lts");
const { formatDateOnly } = require('./helper');
const https = require('https');
require('dotenv').config();

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(bodyParser.json({limit:'50mb'}));

let jardir = __dirname+"/jar/Launcher.jar";
let jdkdir = __dirname+"/jar/jdk/bin";
let smtdir = __dirname+"/jar/SumatraPDF"
let tmp = __dirname+"/tmp"

const printOptions = {
	printer: "EPSON LQ-310 ESC/P2",
	paperSize: "A5",
	orientation: "landscape",
	silent:true,
}

app.get("/printers", async (req, res) => {

	// getPrinters().then(console.log);
	const printers = await getPrinters();
	return res.send(printers);
})

app.post("/print", (req, res) => {

	const {
		width, height, content, printer, paperSize, orientation, user
	} = req.body;

	const printerSet = printer || "EPSON LQ-310 ESC/P2";
	const paperSizeSet = paperSize || "invoice2";

	const pdfOption =  {
		path: tmp+"/print.pdf",
		width: `${orientation === 'landscape' ? height : width}mm`,
		height: `${orientation === 'landscape' ? width : height}mm`,
		printBackground :true,
		headerTemplate: "LAlalala", 
		footerTemplate: "<div class='date'>wkj2ke2jek2<div>",
		margin: {
			left: 20,
			top: 20,
			right: 20,
			bottom: 20,
		}
	}

	const file = { 
		content: `
		<html>
		<body style="position:relative;padding:0px; margin:0px; background:#fff !important;width:100%;height:100%;border:0px solid #333; font-family:sans-serif">
			${content}

			</body>
			</html>` 
			// <div style="position:absolute;bottom:0;left:0">${user} - ${new Date()}</div>
		};

	html_to_pdf.generatePdf(file, pdfOption).then(pdfBuffer => {
    // const sumatraCommand = smtdir+'/sumatrapdf.exe -silent -print-to "'+printerSet+'" -print-settings "'+orientation+',paper='+paperSizeSet+'" '+tmp+'/print-invoice.pdf'
		// exec(sumatraCommand,
		// function (err, stdout, stderr) {
		// 	if (err) {
		// 		console.log(err)
		// 	}
		// 	// console.log(stdout)
		// })
		// res.send({status:"Print Success"})
		res.status(200).json({
      success: true,
      flag: 200,
      message: "Print Success",
      
    })
	});
})

app.post("/print2", (req, res) => {
	const {
		width, height, content, printer, paperSize, orientation, user, counter
	} = req.body;

	const printerSet = printer || "EPSON LQ-310 ESC/P2";
	const paperSizeSet = paperSize || "invoice";

	const pdfOption =  {
		"directory": tmp+"/print2.pdf",
		"width": `${orientation === 'landscape' ? height : width}mm`,
		"height": `${orientation === 'landscape' ? width : height}mm`,
		"border": {
			"top": "5mm",
			"right": "5mm",
			"bottom": "5mm",
			"left": "5mm"
		},
		"paginationOffset": 0,
		"footer": {
			"height": "7mm",
			"contents": {
				// first: 'Cover page',
				// 2: 'Second page', // Any page number is working. 1-based index
				default: `<div style="color:#111;font-size:11px;overflow:hidden;font-family:sans-serif;">
					<div style="float:left;">${user} - ${formatDateOnly(new Date())} ${counter !== null ? `- ${counter}x` : ''}</div>
					<div style="float:right;">{{page}} / {{pages}}</div>
				</div>`, // fallback value
				// last: 'Last Page'
			}
		},
	}

	const html =`
		<html>
		<body style="position:relative;padding:0px; margin:0px; background:#fff !important;width:100%;height:100%;border:0px solid #333; font-family:sans-serif">
		${content}
		</body>
		<style>
			thead {display: table-header-group;}
			tfoot {display: table-footer-group;}
			tbody {display: table-row-group;}
		</style>
		</html>`;

	pdf.create(html, pdfOption).toFile(tmp+"/print2.pdf", function (err, result) {
		if (err) return console.log(err);
		
		
		const Sorientation = orientation === 'landscape' ? 'portrait' : 'landscape' || "portrait";
		const sumatraCommand = smtdir+'/sumatrapdf.exe -silent -print-to "'+printerSet+'" -print-settings "'+Sorientation+',paper='+paperSizeSet+'" '+tmp+'/print2.pdf'
		// const sumatraCommand = smtdir+'/sumatrapdf.exe -print-to "'+printerSet+'" -print-settings "'+Sorientation+',paper='+paperSizeSet+'" '+tmp+'/print2.pdf';


		console.log(sumatraCommand)
		// return res.status(200).json({message: 'ok'})
		exec(sumatraCommand, (err, stdout, stderr) => {
			if (err) {
				console.log(err)
				return res.status(500).json({
					success: true,
					flag: 500,
					message: err?.message,
				})	
			}
			return res.status(200).json({
				success: true,
				flag: 200,
				message: "Print Success",
			})
		})
		
		// console.log(result); // { filename: '/app/businesscard.pdf' }
	});
})

app.get('/print', (req, res) => {
	
	let options = { 
		path: tmp+"/test.pdf",
		width: "200mm",
		height: "130mm",
		printBackground :true
	};
  let html = `
    <div style="margin-top:60px;">---        ---TESTING ${new Date()}</div>
  `;

  // <style>`+cssPrint+`</style>
  let file = { 
		content: `
		<html>
		<body style="padding:0px; margin:0px; background:#fff !important;width:98%;height:98%;border:1px solid #333">
			`+html+`
		</body>
		</html>` 
	};

  html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
		// console.log("PDF Buffer:-", pdfBuffer);


		// print(tmp+'/test.pdf', printOptions).then(console.log);

    // let sumatraCommand = smtdir+'/sumatrapdf.exe -print-dialog '+tmp+'/test.pdf'
    // // let sumatraCommand = smtdir+'/sumatrapdf.exe -silent -print-to "EPSON LQ-310 ESC/P2" -print-settings landscape fit "paper=invoice" '+tmp+'/test.pdf'
    // // let sumatraCommand = smtdir+'/sumatrapdf.exe -silent -print-to "EPSON LQ-310 ESC/P2" -print-settings portrait "paper=A5" '+tmp+'/test.pdf'
		
    // // 192.168.0.26
    let sumatraCommand = smtdir+'/sumatrapdf.exe -silent -print-to "EPSON LQ-310 ESC/P2" -print-settings "portrait,paper=invoice2" '+tmp+'/test.pdf'
		exec(sumatraCommand,
		function (err, stdout, stderr) {
			if (err) {
				console.log(err)
			}
			// console.log(stdout)
		})
		res.send({status:"ok alallalal"})
	});
})

app.get('/', (req, res) => {
	return res.status(200).json({
		success: true,
		flag: 200,
		message: "Print Success",
	})
})

var host = process.env.HOST;
var port = process.env.PORT;
// app.listen(port, host, function () {
// 	console.log("Example app listening at http://%s:%s", host, port)
// })

var options = {
  key: fs.readFileSync('./cert/CA2/key.pem'),
  cert: fs.readFileSync('./cert/CA2/cert.pem')
};

https.createServer(options, app).listen(port, host, ()=> {
	console.log('running https')
});
// https://nayzawlin.info/2020/05/02/how-to-auto-start-pm2-with-node-application-on-windows-after-reboot/