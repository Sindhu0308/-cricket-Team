const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3009, () => {
      console.log("Server Running at http://localhost:3009/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Return a list of all players in the team
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    *
    FROM 
    cricket_team;`;
  const cricketArray = await db.all(getPlayersQuery);
  response.send(
    PlayersArray.map((eachPlayer) =>
      convertDBObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/player:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT 
    * 
    FROM 
    cricket_team 
    WHERE
    player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//Creates a new Player in the team (database).player_id is auto-incremented

app.post("/players/", async (requesr, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, rele } = playerDetails;
  const addPlayerQuery = `INSERT INTO 
    cricket_team (player_name,jersey_number,role)
    VALUES 
    
    ( 
      ${playerName},
       ${jerseyNumber},
       ${role});`;

  const dbResponse = await db.run(addPlayerQuery);

  response.send("Player Added to Team");
});

//Return a player based on player ID

//Updates the details of a player in team

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = ` UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Deletes a player from the team
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM 
    cricket_team 
    WHERE 
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
