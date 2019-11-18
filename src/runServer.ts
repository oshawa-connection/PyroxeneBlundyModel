const express = require( "express" );
const app = express();
import { Request, Response, NextFunction } from 'express';
const spawn = require("child_process").spawn;
var cors = require('cors');
var bodyParser = require('body-parser')

app.use("/views",express.static(__dirname +"/../views/"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// let allowedOrigins = ["http://localhost:8080","https://james-fleming.herokuapp.com/"]

// app.use(cors({
//   origin: function(origin, callback) {
//     // allow requests with no origin
//     // (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       console.log(origin)
//       var msg = 'The CORS policy for this site does not ' +
//         'allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   }
// }));

// allow access from client app
app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS,   PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Only uncomment the next line if you find the idea of chopping your own ball
  // s off fun
  // res.setHeader('Content-Type', 'text/plain');
  // Set to true if you need the website to include cookies in the   requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', false);
  // Pass to next layer of middleware
  next();
});


// define a route handler for the default home page
app.get( "/", ( req :Request, res : Response ) => {
    res.render(__dirname + '/../views/index.ejs')
    
} );


app.get( "/submitjob", ( req :Request, res : Response ) => {
    
    res.render(__dirname + '/../views/form.ejs')
} );

app.post("/pyroxeneFitting", (req:Request,res:Response)=> {
    var arg1 = req.body['ionList']
    var arg2 = req.body['partitionCoefficients']
    const pythonProcess = spawn('python3',[__dirname + "/../childProcessCode/cpxFittingCalculator.py", arg1, arg2]);

    pythonProcess.stdout.on('data', (data : any) => {
        console.log(data.toString())
        try {
            var resultString = data.toString().replace(/'/g, '"')
            
            console.log(resultString)
            var results = JSON.parse(resultString)
            res.json(results).send()
        } catch(err) {
            console.log(err)
            res.render(__dirname + '/../views/error.ejs',{
                errorMesssage: "ERROR: its on fire yo"
            })
        }
        
        // Do something with the data returned from python script
    })

    pythonProcess.stderr.on('data', (data :any) => {
        console.log("Python error:")
        console.log(`stderr: ${data.toString()}`);
        res.render(__dirname + '/../views/error.ejs',{
            errorMesssage: data.toString()
        })
    });
})



app.post("/test123", (req:Request,res:Response)=> {
    console.log(req.body['ionList'])
    console.log(req.body['partitionCoefficients'])
    

    res.send("worked")
})

app.get('*', function(req, res){
    res.status(404);
    // res.send("sorry missed")
    res.render(__dirname + '/../../views/404.ejs');
  });

const port = process.env.PORT || 8080;
// start the Express app
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );