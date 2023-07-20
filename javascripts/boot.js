$(function() {
	'use strict';
	// app ignores f5, preventing to reset the game by mistake
	document.onkeydown = function(){
		switch (event.keyCode){
			case 116 : //F5 button
				event.returnValue = false;
				event.keyCode = 0;
				return false;
			case 82 : //R button
				if (event.ctrlKey){ 
					event.returnValue = false;
					event.keyCode = 0;
					return false;
				}
		}
	}
	
	var game;
	
	// Custom fleet positions
	const customFleet = [
		{type: "aircraft-carrier", x: 4, y: 1, direction: "vertical"},
		{type: "battleship", x: 9, y: 2, direction: "vertical"},
		{type: "submarine", x: 6, y: 7, direction: "vertical"},
		{type: "cruiser", x: 2, y: 9, direction: "horizontal"},
		{type: "destroyer", x: 1, y: 4, direction: "vertical"}
	];
	
	function startGame(shotsPerIteration, fleet) {
		if (game) {
			game.destroy();
		}
	
		game = new Game({shotsPerIteration: shotsPerIteration, fleet: fleet});
		new GameView({model: game}).render();
	}
	
	$("#newGame").click(function() {
		var shotsPerIteration = $("#shotsPerIteration").val();
		var fleet = window.fixedFleet ? customFleet : [];
		startGame(shotsPerIteration, fleet);
	});
	});
	