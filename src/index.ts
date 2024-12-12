import express, { NextFunction, Request, Response, Express } from "express";
import path from "path";
import morgan from "morgan";
import session from "express-session";
import router from "./router";
import { OpenAI } from 'openai'
// api
import GetData from "./api/GetData";
import ReceiveAndStoreData from "./api/ReceiveAndStoreData";
import database from "./config/database/database";
import { publishMessage } from "./config/mqtt/connectToMqttBroker";
import PublishData from "./api/PublishData";
import updateUserLightColor from "./api/updateUserLightColor";
import updateUserLightBrightness from "./api/updateUserLightBrightness";

const port: number = 3000;
const app: Express = express();
database();

/* Configuration */
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), "public")));
/* Session configuration */
app.use(
  session({
    secret: "NO", 
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,           
      secure: false,  
    },
  })
);

router(app);
ReceiveAndStoreData(app);
PublishData(app);
GetData(app);
updateUserLightColor(app);
updateUserLightBrightness(app);


/* Set view Engine */
app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "src", "views"));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
