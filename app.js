const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const InitilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

InitilizeDbAndServer();
const convertdbobjecttoResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertdirectoryobjecttoRespnseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//get all movie names API
app.get("/movies/", async (request, response) => {
  const getAllMovieNames = `
    SELECT * FROM movie
    `;
  const MovieNamesArray = await db.all(getAllMovieNames);
  response.send(
    MovieNamesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
//get onemovie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmovieQuery = `
    SELECT * FROM movie
    WHERE movie_id=${movieId}`;
  const dbResponse = await db.get(getmovieQuery);
  response.send(convertdbobjecttoResponseObject(dbResponse));
});
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addmovieQuery = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES(
     '${directorId}',
      ${movieName},
     '${leadActor}'
  )
  `;
  await db.run(addmovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetails = `
          UPDATE 
           movie
          SET 
           director_id='${directorId}',
           movie_name= ${movieName},
           lead_actor='${leadActor}'
          WHERE 
           movie_id=${movieId}`;
  await db.run(updateMovieDetails);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    SELECT * FROM movie
    WHERE movie_id=${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});
app.get("/directors/", async (request, response) => {
  const getdirectorsQuery = `
    SELECT *
     FROM director
    `;
  const dbResponse = await db.all(getdirectorsQuery);
  response.send(
    dbResponse.map((eachDirector) =>
      convertdirectoryobjecttoRespnseObject(eachDirector)
    )
  );
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNames = `
    SELECT movie_name  FROM movie
    WHERE director_id=${directorId}
    `;
  const dbResponse = await db.all(getMovieNames);
  response.send(
    dbResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
