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
let allowedOrigins = ["http://localhost:8080","https://james-fleming.herokuapp.com/"]

// app.use(cors({
//   origin: (origin, callback) => {
//     // allow requests with no origin
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
    var temperature = req.body['temperature']
    const pythonProcess = spawn('python3',[__dirname + "/../childProcessCode/cpxFittingCalculator.py", arg1, arg2, temperature]);

    pythonProcess.stdout.on('data', (data : any) => {
        
        try {
            console.log(data.toString())
            var resultString = data.toString().replace(/'/g, '"')
            
            console.log(resultString)
            var results = JSON.parse(resultString)
            res.json(results)
        } catch(err) {
            console.log(err)
            res.render(__dirname + '/../views/error.ejs',{
                errorMesssage: "A server error occurred during the parsing of results."
            })
        }
        
        // Do something with the data returned from python script
    })

    pythonProcess.stderr.on('data', (data :any) => {
        console.log("Python error occured")
        var errorMessage : string
        try {
            console.log(`stderr: ${data.toString()}`);
            errorMessage = data.toString();
        }
        catch(err) {
            console.log(err)
            errorMessage = "During the handling of this error, a JS error occurred..."
        }
        
        res.render(__dirname + '/../views/error.ejs',{
            errorMesssage: errorMessage
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