import express from "express";

const app = express();

// https://hooks.integrix.com/hooks/catch/:userId/:zapId
app.post("/hooks/catch/:userId/:zapId", (req, res) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;

    // store in db
    // push it on a queue
})

app.listen(3000, () => {
    console.log("Server started on port 3000");
});