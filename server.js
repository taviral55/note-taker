import path from "path";
import fs from "fs";
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const PORT = 5000;
const dbPath = "./db/db.json";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

// json file reader function
const jsonReader = (dbPath, cb) => {
  fs.readFile(dbPath, "utf-8", (err, jsonString) => {
    if (err) {
      return cb && cb(err);
    } else {
      try {
        const data = JSON.parse(jsonString);
        return cb && cb(null, data);
      } catch (error) {
        console.log(error);
      }
    }
  });
};

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/notes.html"));
});

app.get("/api/notes", (req, res) => {
  jsonReader(dbPath, (err, response) => {
    if (err) {
      console.log(err);
    } else {
      res.send(response);
    }
  });
});

app.post("/api/notes", (req, res) => {
  req.body.id = uuidv4();
  jsonReader(dbPath, (err, response) => {
    if (err) {
      console.log(err);
      return;
    } else {
      try {
        const updatedData = JSON.stringify([...response, req.body]);
        fs.writeFile(dbPath, updatedData, (err) => {
          if (err) {
            console.log("Couldn't insert task", err);
            return;
          } else {
            res.status(200).json({ msg: "Successfully task inserted." });
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  });
});

app.delete("/api/notes/:id", (req, res) => {
  const params = req.params;
  jsonReader(dbPath, (err, response) => {
    if (err) {
      console.log(err);
      return;
    } else {
      try {
        const filtertasks = response.filter((task) => task.id != params.id);
        const updatedData = JSON.stringify(filtertasks);
        fs.writeFile(dbPath, updatedData, (err) => {
          if (err) {
            console.log("Error deleting task", err);
            return;
          } else {
            res.status(200).json({ msg: "Successfully deleted." });
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}.`);
});
