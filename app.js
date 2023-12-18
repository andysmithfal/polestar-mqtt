const mqtt = require('mqtt');
const Polestar = require("@andysmithfal/polestar.js")

require('dotenv').config();

const baseTopic = "polestar/"
let vin = null


const polestar = new Polestar(process.env.POLESTAR_EMAIL, process.env.POLESTAR_PASSWORD)

const mqttClient = mqtt.connect(`mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`, {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD
})

async function getCarInfo() {
    try{
        const battery = await polestar.getBattery()
        const odometer = await polestar.getOdometer()
        mqttClient.publish(baseTopic+'/'+vin+'/battery', JSON.stringify(battery))
        mqttClient.publish(baseTopic+'/'+vin+'/odometer', JSON.stringify(odometer))
    } catch(e){
        console.log(e)
    }
}

async function main() {
    try {
        await polestar.login()
        const vehicles = await polestar.getVehicles()
        vin = vehicles[0].vin
        await polestar.setVehicle(vin)
        console.log("Successfully logged into Polestar account and set vehicle")
        getCarInfo()
        setInterval(getCarInfo, 60000)
    } catch (e) {
        throw new Error(e)
    }
}

main()