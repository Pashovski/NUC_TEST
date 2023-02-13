from typing import Union

from fastapi import FastAPI, WebSocket
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

app = FastAPI()

clients = {}

origins = [
    "http://192.168.1.230:8001/",
    "http://192.168.1.230:8002/",
    "http://localhost:8001/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=[""],
    allow_headers=[""],
)

def get_washer_state():
    token = "pruK-KQgmbmDHBxgnh4Eg22lNMlFydmad2cTn_MI89CZMX5EPZHR2zNXg24pLgGZ_SagNaU0rC7Hex03jAHjag=="
    org = "docker"
    bucket = "home_assistant"
    client = InfluxDBClient(url="http://influx.pash.home/", token=token)
    query = f'''
        from(bucket: "home_assistant")
        |> range(start: -24h)
        |> filter(fn: (r) => r["entity_id"] == "washer_state")
        |> filter(fn: (r) => r["_field"] == "state")
        |> last()
    '''
    tables = client.query_api().query(query, org="docker")
    return tables.to_json(indent=5)

@app.get("/")
async def read_root():
    return 'Hello World'

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    clients[client_id] = websocket
    output = get_washer_state()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(output)

@app.get("/send/{client_id}/status/{status}")
async def send_message(client_id: str, status:str):
    if client_id in clients:
        await clients[client_id].send_text(status)
    else:
        return {"message": "WebSocket connection not established"}