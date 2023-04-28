
const automotive = require("./automotive.json")
const {saveDataToJSON}=require("./saveDataToJson")

const express = require("express");
const cors = require("cors");
const app = express();
const axios = require("axios");
const fs = require("fs");

app.use(cors());



    
// app.get("/", async (req, res) => {
//   try {
//     const personTitles = [
//       "data manager",
//       "head of data",
//       "principal data scientist",
//       "data science manager",
//       "senior data scientist",
//       "engineering manager",
//       "senior data engineer",
//     ];
//     const result = await massSearchReturnJson({
//       industries: ["automotive"],
//       locations: ["united states"],
//       titles: personTitles,
//      apiKey : "yQ_Bv_7h0H-O3BwRQu1rnQ"
//     });
//     res.send(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal server error");
//   }
// });

app.get("/", (req, res) => {
    const data = JSON.parse(fs.readFileSync("automotive.json"));
    const formattedData = JSON.stringify(data, null, 2);
    res.send(formattedData);
});

app.get("/", (req, res) => {
    const data = { name: "John Doe", age: 30 }; // Sample data to be saved as JSON
    const filename = "automotives.json"; // Name of the output file

    saveDataToJSON(data, filename); // Call the saveDataToJSON function

    res.send("JSON saved to file");
});

// Start the Express app
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
