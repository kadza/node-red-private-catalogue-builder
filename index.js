const fs = require('fs')
const cors = require('cors')
const path = require('path')
const http = require('http')
const morgan = require('morgan')
const express = require('express')
const bodyParser = require('body-parser')
const superagent = require('superagent')
const nodeRedModule = require('node-red-module-parser')


const port = (process.env.PORT || 4874)
const listenHost = (process.env.HOST || '0.0.0.0')
const registryHost = (process.env.REGISTRY || 'registry:4873')
const mappedRegistryHost = 'localhost:4873';
const keyword = (process.env.KEYWORD || "node-red")

const url = "http://" + registryHost +  "/-/v1/search"

const catalogue = {
  "name":"Ben's custom catalogue",
  "updated_at": new Date().toISOString(),
  "modules": [
    // {
    //   "id": "@ben/ben-node-random",
    //   "version": "1.0.0",
    //   "description": "A node-red node that generates random numbers",
    //   "keywords": [
    //     "node-red",
    //     "random"
    //   ],
    //   "updated_at": "2020-09-21T18:37:50.673Z",
    //   "url": "http://flows.hardill.me.uk/node/ben-red-random"
    // }
  ]
}

function update() {

	//reset list
	catalogue.modules = [];

	superagent.get(url)
	.end(async (err, res) => {
		if (!err) {
			const nodes = res.body.objects;
			var nodeNames = nodes.map(node => node.package.name);
            console.log(nodeNames);
			const index = nodeNames.indexOf("_updated");
			if (index > -1) {
			  nodeNames.splice(index, 1);
			}

			for (const node in nodeNames) {
				var n = nodes[node].package;
                console.log(n);
				if (n.keywords) {
					if (n.keywords.indexOf(keyword) != -1) {
						try {
						  let details = await superagent
						  	.get("http://" + registryHost + "/" + nodeNames[node])
						  	.set('accept', 'json')
						  let latest = details.body['dist-tags'].latest
						  let version = details.body.versions[latest]
						  let tar = version.dist.tarball
                          const sanitizedNodeName = nodeNames[node].replace(/[^a-zA-Z ]/g, "");
						  fs.mkdirSync(path.dirname(path.join("temp", sanitizedNodeName)))
						  let tarPath = path.join('temp', sanitizedNodeName + ".tgz")
						  let tarRes = await superagent.get(tar).responseType('blob')
						  fs.writeFileSync(tarPath, tarRes.body)
						  let moduleDetails = nodeRedModule.examinTar(tarPath, "temp")
						  fs.rmSync(tarPath)

						  var entry = {
								id: n.name,
								version: n.version,
								description: n.description,
								keywords: n.keywords,
								updated_at: n.date,
								url: "http://" + mappedRegistryHost + "/-/web/detail/" + n.name
							}

							if (moduleDetails.types) {
								entry.types = moduleDetails.types
							}
							if (moduleDetails["node-red"]) {
								catalogue.modules.push(entry)
							}
						} catch (e) {
							console.log("err",e)
						}
					}
				}
			}

			console.log(JSON.stringify(catalogue, null, 2));
		} else {
			console.log(err);
		}
	});

}

const app = express()
app.use(morgan("combined"))
app.use(bodyParser.json())

app.post('/update', (req, res, next) => {
	const updateRequest = req.body
	console.log(JSON.stringify(updateRequest,null, 2))

	update()
	res.status(200).send();
})

app.get('/catalogue.json', cors(), (req, res, next) => {
	res.send(catalogue)
})

// app.head('/catalogue.json', (req,res,next) => {

// })

update()

const server = http.Server(app);
server.listen(port, listenHost, function(){
	console.log('App listening on  %s:%d!', listenHost, port);
});
