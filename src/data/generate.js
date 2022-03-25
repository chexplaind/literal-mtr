const csvFilePath = "src/data/mtr_lines_and_stations.csv"
const csv = require("csvtojson")
const fs = require("fs")
const mdbg = require("mdbg")

readFile()

async function readFile() {
  let jsonArray = await csv().fromFile(csvFilePath)
  for await (const station of jsonArray) {
    processStation(station)
    console.log("After waiting")
  }
  
}

function processStation(station) {
  station.characters = [...station.chineseName]
  var cedictPromises = []
  for (let i = 0; i < station.characters.length; i++) {
    cedictPromises.push(
      mdbg
        .getByHanzi(station.characters[i])
        .then(cedictObj => {
          station.characters[i] = cedictObj
          console.log(station)
          writeToFile(station)
        })
        .catch(err => {
          console.log(err)
        })
    )
  }
  return Promise.all(cedictPromises)
}

function queryDict(characters) {
  var cedictPromises = []
  var enrichedCharacters = []

  for (let i = 0; i < characters.length; i++) {
    cedictPromises.push(
      mdbg
        .getByHanzi(characters[i])
        .then(cedictObj => {
          console.log(cedictObj)
          enrichedCharacters.push(cedictObj)
        })
        .catch(err => {
          console.log(err)
        })
    )
  }
  console.log("dict queries: " + cedictPromises.length)

  return Promise.all(cedictPromises)
    .then(() => {
      console.log("enriched chars: " + enrichedCharacters.length)
      return enrichedCharacters
    })
    .catch(err => {
      console.log(err)
      return enrichedCharacters
    })
}

function writeToFile(station) {
  fs.writeFile(
    "src/data/stations/" + station.stationCode + ".json",
    JSON.stringify(station),
    err => {
      if (err) {
        throw err
      }
    }
  )
}
