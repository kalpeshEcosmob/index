const auth = {
  username: "d4331b0d-17fc-40aa-b9f8-17f96aa136bd", // Project ID
  password: "PT50446e18fbd690ea3cad2c6662bdd6d7e2846d86b82733cb", // API token
};
const apiurl = `https://khushal.signalwire.com/api/video`;

// Basic express boilerplate
const express = require("express");
const SDK = require("@signalwire/realtime-api");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
// ✅ Do this if using JAVASCRIPT

let token;

const app = express();
app.set("view engine","ejs")
app.use(bodyParser.json());
app.use(cors());
// End basic express boilerplate
app.get('/check',(req,res,next)=>{
    res.render('index');
})
// Endpoint to request token for video call
app.post("/get_token", async (req, res) => {
  // const video = new SDK.Video.Client({
  //     project: "d4331b0d-17fc-40aa-b9f8-17f96aa136bd",
  //     token: "PT50446e18fbd690ea3cad2c6662bdd6d7e2846d86b82733cb",
  //   });
  // const newsession = await video.getRoomSessions();
  // console.log('newsession',newsession)

  let { user_name, room_name } = req.body;
  console.log("Received name", user_name);
  try {
     token = await axios.post(
      apiurl + "/room_tokens",
      {
        user_name,
        room_name: room_name,
        permissions: [
          "room.list_available_layouts",
          "room.set_layout",
          "room.self.audio_mute",
          "room.self.audio_unmute",
          "room.self.video_mute",
          "room.self.video_unmute",
        ],
      },
      { auth }
    );
    // console.log(token.data.token);

    // const video = new SDK.Video.Client({
    //   project: "d4331b0d-17fc-40aa-b9f8-17f96aa136bd",
    //   token: "PT50446e18fbd690ea3cad2c6662bdd6d7e2846d86b82733cb",
    // });

    // video.on("room.started", async (roomSession) => {
    //     console.log('Calling')
    //   console.log("This is my RoomSession object:", roomSession);
    // });
    return res.json({ token: token.data.token });
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});

app.get("/", async (req, res, next) => {
  try {
    const sessionsResponse = await axios.get(
      `https://khushal.signalwire.com/api/video/room_sessions`,
      { auth: auth, params: { status: "in-progress" } }
    );
    const sessions = sessionsResponse.data?.data;

    if (Array.isArray(sessions)) {
      return res.send({ sessions, error: false });
    } else {
      console.log(sessions, sessionsResponse.data, sessionsResponse.status);
      return res.status(400).send({ error: true });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: true });
  }
});

app.use(express.static("src/frontend/"));

async function start(port) {
  app.listen(port, () => {
    console.log("Server listening at port", port);
  });
}



const video = new SDK.Video.Client({
  project: "d4331b0d-17fc-40aa-b9f8-17f96aa136bd",
  token: "PT50446e18fbd690ea3cad2c6662bdd6d7e2846d86b82733cb",
});
video.on("room.started", async (roomSession) => {
  console.log("This is my RoomSession object:=============>");
  //   const id = roomSession.roomId;
  console.log("==================>", roomSession.layoutName);
  console.log("Member meta:", roomSession.meta);
  console.log("Member name:", roomSession.name);
//   console.log("Member recording:", roomSession.recording);
//   console.log("Member audioMute:", roomSession.audioMute);
  roomSession.on("member.joined", async (member) => {
    console.log("Member joined:", member.name);
  });
  //   roomSession.join();
});
video.on("room.ended", async (roomSession) => {
  console.log("Room ended");
});

start(8080);
