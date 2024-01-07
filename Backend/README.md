#endpoints

> Create user:

http://localhost:3000/user?username=**ainz**
(ainz is username)
this will return :
```json
    [
        "39fea088-a972-4d7e-8f48-c3bb5109d8f0": {
        "uuid": "39fea088-a972-4d7e-8f48-c3bb5109d8f0",
        "username": "ainz",
        "rightAnswers": 2,
        "wrongAnswers": 0,
        "successRate": 100,
        "averageTime": 0,
        "level": 1,
        "gameType": "dad"
        }
    ]
```

> get game

http://localhost:3000/game?type=**dad**&uuid=**39fea088-a972-4d7e-8f48-c3bb5109d8f0**

Get game content: response data:
```json
    {
      "level": "0",
      "type": "dad",
      "images": [
        {
          "src": "assets/images/sun.png",
          "alt": "_un",
          "word": "Sun"
        },
        {
          "src": "assets/images/bun.png",
          "alt": "_un",
          "word": "Bun"
        }
      ],
      "letters": [
        {
          "static": [
            "u"
          ],
          "draggable": [
            "B",
            "S"
          ]
        }
      ]
    }
```

> check results

http://localhost:3000/check?userId=**39fea088-a972-4d7e-8f48-c3bb5109d8f0**&answers=**B,S**

answers must be in same capitalism and order as draggable to be counted as true, response format

```json

{
    "userId": "39fea088-a972-4d7e-8f48-c3bb5109d8f0",
    "level": 1,
    "gameType": "dad",
    "rightAnswers": 2,
    "wrongAnswers": 0,
    "successRate": 100,
    "next": "next level",
    "nextGameType": "dad"
}
```