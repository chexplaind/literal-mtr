const csvFilePath = "src/data/mtr_lines_and_stations.csv"
const csv = require("csvtojson")
const fs = require("fs")
const mdbg = require("mdbg")

processFile(csvFilePath)

async function processFile(path) {
  let jsonArray = await csv().fromFile(path)
  for await (const station of jsonArray) {
    processStation(station)
  }
}

function processStation(station) {
  let characters = [...station.chineseName]
  var cedictPromises = []
  for (let i = 0; i < characters.length; i++) {
    cedictPromises.push(queryDict(characters[i]))
  }
  return Promise.all(cedictPromises).then(cedictResults => {
    station.characters = cedictResults
    // console.log(station)
    writeToFile(station)
  })
}

function queryDict(character) {
  return mdbg.getByHanzi(character).catch(err => {
    console.log(err)
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
