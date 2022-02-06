import requests
import json


data = ""
with open('./metadata.json') as f:
  data = json.load(f)
  print(len(data))

for i in range(len(data)):
    URL = data[i]["image"]
    r = requests.get(URL)
    with open('front/' + data[i]["name"] + '.gif', 'wb') as fd:
        for chunk in r.iter_content(1):
            fd.write(chunk)    
    URL = data[i]["image"].replace("ani", "ani-back")
    r = requests.get(URL)
    with open('back/' + data[i]["name"] + '.gif', 'wb') as fd:
        for chunk in r.iter_content(1):
            fd.write(chunk)    

