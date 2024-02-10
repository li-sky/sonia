# a simple flask app to serve frontend
# apis:
# /updateState : POST, json body
# /initState : GET, return json
# /setRecognitionBackend : POST, json body
# /getRecognitionBackend : GET, return json
# /startRecognition : GET
# /stopRecognition : GET

# port: --port arg

import os
import sys
import argparse
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

state = {
    "voiceCommands": {},
    "otherSettings": {
        "language" : "zh-cn",
        "theme" : "light",
        "voiceCommandBackends" : ["A", "B"],
        "currentVoiceCommandBackend" : "",
        "voiceCommandBackendSettings" : {}
    }
}

settingspath = os.path.expandvars('%APPDATA%/sonia/sonia/settings.json')

@app.route('/updateState', methods=['POST'])
def updateState():
    global state
    state = request.json
    if os.path.exists(settingspath):
        with open(settingspath, 'w') as f:
            json.dump(state, f)
    else:
        # create path
        os.makedirs(os.path.dirname(settingspath), exist_ok=True)
        with open(settingspath, 'w') as f:
            json.dump(state, f)
    return jsonify(state)

@app.route('/getState', methods=['GET'])
def initState():
    global state
    print('initState', state)
    return jsonify(state["voiceCommands"])

@app.route('/getOtherSettingsState', methods=['GET'])
def getOtherSettingsState():
    global state
    return jsonify(state["otherSettings"])


@app.route('/setRecognitionBackend', methods=['POST'])
def setRecognitionBackend():
    global state
    state["otherSettings"]['currentVoiceCommandBackend'] = request.json['currentVoiceCommandBackend']
    if os.path.exists(settingspath):
        with open(settingspath, 'w') as f:
            json.dump(state, f)
    else:
        # create path
        os.makedirs(os.path.dirname(settingspath), exist_ok=True)
        with open(settingspath, 'w') as f:
            json.dump(state, f)
    return jsonify(state["otherSettings"]["currentVoiceCommandBackend"])

@app.route('/getRecognitionBackend', methods=['GET'])
def getRecognitionBackend():
    global state
    return jsonify(state["otherSettings"]['voiceCommandBackends'])

@app.route('/setRecognitionState', methods=['POST'])
def setRecognitionState():
    global state
    state["otherSettings"]['recognitionState'] = request.json['recognitionState']
    if os.path.exists(settingspath):
        with open(settingspath, 'w') as f:
            json.dump(state, f)
    else:
        # create path
        os.makedirs(os.path.dirname(settingspath), exist_ok=True)
        with open(settingspath, 'w') as f:
            json.dump(state, f)
    return jsonify(state)

def readStateonProgramStart():
    global state
    if os.path.exists(settingspath):
        with open(settingspath, 'r') as f:
            state = json.load(f)
            print('readStateonProgramStart', state)
    else:
        # create path
        os.makedirs(os.path.dirname(settingspath), exist_ok=True)
        with open(settingspath, 'w') as f:
            json.dump(state, f)


if __name__ == '__main__':
    readStateonProgramStart()
    print('state', state)
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5000)
    args = parser.parse_args()
    app.run(host='localhost', port=args.port)
