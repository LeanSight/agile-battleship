// Fleet.js

var Fleet = {
  boatLengths: {
    "aircraft-carrier": 5,
    "battleship": 4,
    "submarine": 3,
    "cruiser": 3,
    "destroyer": 2
  },
};

Fleet.boatTypes = Object.keys(Fleet.boatLengths);
