var express = require('express')
var path = require('path')
var logger = require('morgan')
var neo4j = require('neo4j-driver')
var $ = require('jquery');
var app = express()

//for POST
var bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

//set views folder
app.set('views', path.join(__dirname, 'views'))
app.engine('html', require('ejs').renderFile);
app.set('view engine' , 'ejs')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')))

var driver = neo4j.driver('bolt://192.168.0.234:7687/' , neo4j.auth.basic('neo4j','password'))

app.get('/',(req,res)=>{
	let hasil = "";
	let session = driver.session()
	session
	.run(`
	MATCH p=()-[r:MENGHUBUNGI]->() RETURN p
	`)
	/*.run(`
	MATCH p=()-[r:MENGHUBUNGI]->() RETURN p
	`)*/
	/*.run(`
	MATCH (n) RETURN n 
	`)*/
	.then((result)=>{
		session.close()
		// result.records.forEach((record)=>{
			// parsed = record._fields[0]
			
			// console.log(parsed.segments[0].start)
			// console.log(parsed.segments[0].end)
			// console.log(parsed.segments[0].relationship)
			
			// console.log("==========================================================")
		// })
		let data = {
				"nodes":[ ],"links":[ ]
			}
		for(let i=0; i<result.records.length;i++){
			data.nodes.push({"id":result.records[i]._fields[0].segments[0].start.identity.low , "style":{ "fillColor": "rgba(236,46,46,0.8)", "label":result.records[i]._fields[0].segments[0].start.properties.name }})
			data.nodes.push({"id":result.records[i]._fields[0].segments[0].end.identity.low , "style":{"label":result.records[i]._fields[0].segments[0].end.properties.name} })
			
			data.links.push({
				"id":result.records[i]._fields[0].segments[0].relationship.identity.low , 
				"from":result.records[i]._fields[0].segments[0].relationship.start.low,
				"to":result.records[i]._fields[0].segments[0].relationship.end.low,
				"value":result.records[i]._fields[0].segments[0].relationship.properties.timestamp,
				"style":{ "toDecoration":"arrow" }
				})
		}
                        
		//console.log(data)
		res.render('index.html',{data:data});
		//res.render('index1.html',{data:data});
	})
	.catch((err)=>{
		console.log(err)
	})
})

app.get('/index',(req,res)=>{
	res.render('index1.html');
})

app.get('/api',(req,res)=>{
	//http://localhost:3000/api?name=6281381625712&timestamp=2020-04-11
	if (Object.keys(req.query).length === 0){
		res.send('Failed')		
	}else{
		console.log(req.query.name)
		console.log(req.query.timestamp)
		let query = `
			MATCH p=(anum:anumber)-[r:MENGHUBUNGI]->(bnum:bnumber)
			WHERE anum.name = "`+req.query.name+`" AND date(datetime(r.timestamp)) = date(datetime("`+req.query.timestamp+`"))
			RETURN p`;
		let session = driver.session()
		session.run(query)
		.then((result)=>{
			session.close()
			result.records.forEach((record)=>{
				console.log(record)
				res.send(record)
			})
		}).catch((err)=>{
			console.log(err)
		})
	}
})

app.get('/edit',(req,res)=>{
	let session = driver.session()
	session
	.run(`
	MATCH (a:anumber {name: 'Jennifer'})
	SET p.birthdate = date('1980-01-01')
	RETURN p
	`)
	.then((result)=>{
		session.close()
		result.records.forEach((record)=>{
			console.log(record)
		})
	})
	.catch((err)=>{
		console.log(err)
	})
	
	res.send('edit')
})

app.get('/delete',(req,res)=>{
	let session = driver.session()
	session
	.run(`
	MATCH (j:Person {name: 'Jennifer'})-[r:IS_FRIENDS_WITH]->(m:Person {name: 'Mark'})
	DELETE r
	`)
	.then((result)=>{
		session.close()
		result.records.forEach((record)=>{
			console.log(record)
		})
	})
	.catch((err)=>{
		console.log(err)
	})
	
	res.send('edit')
})

app.get('/add',(req,res)=>{
	let session = driver.session()
	session
	.run(`
	CREATE (:Person {name:"Anna"})-[:LOVES]->(:Person{name:"Erwin"})
	CREATE (:Person {name:"Ary"})-[:LOVES]->(:Person{name:"Lidya"})
	CREATE (:Person {name:"Danny"})-[:LOVES]->(:Person{name:"Lidya"})
	`)
	/*
	.run(`
	CREATE (anum:anumber {name:'1'})
	CREATE (bnum:bnumber {name:'2'})
	CREATE (anum)-[:MENGHUBUNGI {Tipe:['Telepon']}]->(bnum)

	CREATE (anum1:anumber {name:'1'})
	CREATE (bnum1:bnumber {name:'3'})
	CREATE (anum1)-[:MENGHUBUNGI {Tipe:['Telepon']}]->(bnum1)

	CREATE (anum2:anumber {name:'1'})
	CREATE (bnum2:bnumber {name:'4'})
	CREATE (anum2)-[:MENGHUBUNGI {Tipe:['Telepon']}]->(bnum2)

	CREATE (anum3:anumber {name:'a1'})
	CREATE (bnum3:bnumber {name:'5'})
	CREATE (anum3)-[:MENGHUBUNGI {Tipe:['Telepon']}]->(bnum2)
	
	`)*/
	/*
	.run(`
	CREATE (a:anumber {name:'089121212'})
	
	CREATE (b:bnumber {name:'089999999'})
	CREATE (a)-[:MENGHUBUNGI {Tipe:['Telepon']}]->(b)
	CREATE (c:bnumber {name:'088888888'})
	CREATE (a)-[:MENGHUBUNGI {Tipe:['SMS']}]->(c)
	
	CREATE (d:nik {name:'3173012907941001'})
	CREATE (a)-[:PUNYA_NIK {Tipe:['KTP']}]->(d)
	CREATE (e:nama {name:'Erwin'})
	CREATE (d)-[:PUNYA_NAMA {Tipe:['ktp']}]->(e)
	CREATE (f:nkk {name:'3193012020202001'})
	CREATE (d)-[:PUNYA_KK {Tipe:['KTP']}]->(f)
	`)
	*/
	/*.run(`
	CREATE (TheUnique:Movie {title:'The Unique', released:2020, tagline:'Welcome to the Unique'})
	CREATE (Erwin:Person {name:'Erwin San', born:1994})
	CREATE (Taufiq:Person {name:'Tqufiqqqqqqqqqqq', born:1993})
	CREATE (Erwin)-[:ACTED_IN {roles:['EW']}]->(TheUnique)
	CREATE (Taufiq)-[:ACTED_IN {roles:['TF']}]->(TheUnique)
	CREATE (Ugah:Person {name:'Anugrah', born:1994})
	CREATE (Ceri:Person {name:'Cerian', born:1994})
	`)*/
	.then((result)=>{
		session.close()
		result.records.forEach((record)=>{
			console.log(record)
		})
	})
	.catch((err)=>{
		console.log(err)
	})
	
	res.send('add')
})

app.get('/load',(req,res)=>{
	let hasil = "";
	let session = driver.session()
	session
	.run(`
	LOAD CSV WITH HEADERS FROM 'http://192.168.0.79/test/csvneo4j2.csv' AS row
	FIELDTERMINATOR '|'
	CREATE (a:anumber {name: row.ANumber})
	CREATE (b:bnumber {name: row.BNumber})
	CREATE (a)-[:MENGHUBUNGI {timestamp:row.datetime}]->(b)
	`)
	.then((result)=>{
		session.close()
		result.records.forEach((record)=>{
			//console.log(record._fields.toString())
			hasil = hasil + record._fields.toString()
		})
		//res.redirect('/merge')
		if (Object.keys(req.query).length === 0){
			res.send('loaded')
		}else{
			res.redirect('/merge?chain=1')
		}
		
	})
	.catch((err)=>{
		console.log(err)
	})
})

app.get('/merge',(req,res)=>{
	let hasil = "";
	let session = driver.session()
	session
	.run(`
	MATCH (n1:anumber),(n2:anumber)
	WHERE n1.name=n2.name and id(n1) < id(n2)
	WITH [n1,n2] as ns
	CALL apoc.refactor.mergeNodes(ns) yield node
	RETURN node
	`)
	/*.run(`
	MATCH (n1:anumber),(n2:anumber)
	WHERE n1.name=n2.name and id(n1) < id(n2)
	WITH [n1,n2] as ns
	CALL apoc.refactor.mergeNodes(ns) yield node
	RETURN node
	`)*/
	.then((result)=>{
		session.close()
		result.records.forEach((record)=>{
		})
		//res.redirect('/merge2')
		if (Object.keys(req.query).length === 0){
			res.send('merged')
		}else{
			res.redirect('/merge2?chain=1')
		}
	})
	.catch((err)=>{
		console.log(err)
	})
})

app.get('/merge2',(req,res)=>{
	let hasil = "";
	let session = driver.session()
	session
	.run(`
	MATCH (n1:bnumber),(n2:bnumber)
	WHERE n1.name=n2.name and id(n1) < id(n2)
	WITH [n1,n2] as ns
	CALL apoc.refactor.mergeNodes(ns) yield node
	RETURN node
	`)
	.then((result)=>{
		session.close()
		result.records.forEach((record)=>{
		})
		//res.redirect('/merge3')
		if (Object.keys(req.query).length === 0){
			res.send('merged2')
		}else{
			res.redirect('/merge3')
		}
	})
	.catch((err)=>{
		console.log(err)
	})
})

app.get('/merge3',(req,res)=>{
	let hasil = "";
	let session = driver.session()
	session
	.run(`
	MATCH (n1:bnumber),(n2:anumber)
	WHERE n1.name=n2.name and id(n1) < id(n2)
	WITH [n1,n2] as ns
	CALL apoc.refactor.mergeNodes(ns) yield node
	RETURN node
	`)
	.then((result)=>{
		session.close()
		result.records.forEach((record)=>{
		})
		res.send('merged3')
	})
	.catch((err)=>{
		console.log(err)
	})
})

app.get('/del',(req,res)=>{
	let session = driver.session()
	session
	.run('MATCH (n) DETACH DELETE n')
	.then((result)=>{
		session.close()
		result.records.forEach((record)=>{
			console.log(record)
		})
	})
	.catch((err)=>{
		console.log(err)
	})
	
	if ( Object.keys(req.query).length === 0 ){
		res.send('delete')
	}else{
		res.redirect('/load?chain=1')
	}
	
})

app.get('/rf',(req,res)=>{
	res.redirect('/del?chain=1')
})

app.listen(3000)
console.log('server running')

module.exports = app