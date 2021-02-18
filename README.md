# vlaskola
SPA Learning platform. Flask + Vue
[![Screenshot](https://0x0.st/-XhZ.png)](https://youtu.be/PLMcKoabn5g)

## Introduction
The mecanics of this platform consist of JSON files rendered as questions that pertain to an exam,
and users' answers will be compared against the ones in the JSON file and stored in database to make up an index of submitters.
See [the example](#Example)

## Guide
### Getting started
One you've set up the enviroment, initialize the database.

`$ flask init-db`

And create the role "admin".

`$ flask roles create admin`

### Exam access
In order to make exams visible to users you'll need to create roles for them like so

`$ flask roles create biology`

and assign them from the admin panel of users.

### Example
Every question must have an ID.
```json
[
  {
    "id": 1,
    "question": "¿Qué movimiento anticlásico surgió hacia el 1520 y perduró hasta 1570?",
    "answer": "Manierismo",
    "input": {"type": "text"}
  },
  {
    "id": 2,
    "question": "¿En dónde surgió el suprematismo?",
    "answer": "Moscú",
    "input": {
      "type": "selection",
      "options": ["Holanda", "Moscú", "Alemania"]
    }
  }
]
```
