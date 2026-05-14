const mqtt = require("mqtt")
const Polestar = require("@andysmithfal/polestar.js")

require("dotenv").config()

const baseTopic = "polestar/"

const polestar = new Polestar(
  process.env.POLESTAR_EMAIL,
  process.env.POLESTAR_PASSWORD
)

const mqttClient = mqtt.connect(
  `mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`,
  {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
  }
)

let vins = []

async function getCarInfo() {
  for (const vin of vins) {
    try {
      await polestar.setVehicle(vin)
      const battery = await polestar.getBattery()
      const odometer = await polestar.getOdometer()
      const health = await polestar.getHealthData()
      mqttClient.publish(baseTopic + vin + "/battery", JSON.stringify(battery))
      mqttClient.publish(baseTopic + vin + "/odometer", JSON.stringify(odometer))
      mqttClient.publish(baseTopic + vin + "/health", JSON.stringify(health))
    } catch (e) {
      console.log(`Error fetching data for ${vin}:`, e)
    }
  }
}

async function main() {
  try {
    await polestar.login()
    const vehicles = await polestar.getVehicles()
    vins = vehicles.map((v) => v.vin)
    console.log(`Successfully logged in. Found ${vins.length} vehicle(s): ${vins.join(", ")}`)
    getCarInfo()
    setInterval(getCarInfo, 60000)
  } catch (e) {
    throw new Error(e)
  }
}

main()
