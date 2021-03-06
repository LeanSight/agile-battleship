var Game = Backbone.Model.extend({
  defaults: {
    shotsPerIteration: 40,
    maxShots: 40,
    costPerShot: 10000,
    sunkenBoatCellReward: 50000,
    fleet: []
  },
  initialize: function(args) {
    _.bindAll(this, "sunkenBoat", "shotFired");
    this.set("shotsRemainingForIteration", args.shotsPerIteration);
    this.set("shotsRemainingForGame", this.get("maxShots"));
    this.set("funds", this.get("maxShots") * this.get("costPerShot"));
    this.set("initialBudget", this.get("funds"));

    this.sunken = 0;
    this.set("board", new Board());
    this.get("board").bind("fire", this.shotFired);

    ChartData.series[0].values = [];

    var directions = ["vertical", "horizontal"];

    var self = this;
    var board = this.get("board");
    if (this.get("fleet").length === 0) {
      _(["aircraft-carrier", "battleship", "submarine", "cruiser", "destroyer"]).each(function(type) {
        var placed = false;
        while (!placed) {
          var boat = new Boat({
            x: self.random(board.get("gridSize").x + 1),
            y: self.random(board.get("gridSize").y + 1),
            direction: directions[self.random(2)],
            type: type,
            visible: false
          });
          if (board.validBoatPlacement(boat)) {
            self.addBoat(boat);
            placed = true;
          }
        }
      });
    }
    else {
      _(this.get("fleet")).each(function(boat) {
        self.addBoat(boat);
      });
    }
  },
  random: function(max) {
    return Math.floor(Math.random() * max);
  },
  destroy: function() {
    this.get("board").destroy();
    Game.__super__.destroy();
  },
  addBoat: function(boat) {
    boat.bind("sunken", this.sunkenBoat);
    this.get("board").addBoat(boat);
  },
  shotFired: function() {
    this.set("shotsRemainingForIteration", this.get("shotsRemainingForIteration") - 1);
    this.set("funds", this.get("funds") - this.get("costPerShot"));
    this.set("shotsRemainingForGame", this.get("shotsRemainingForGame") - 1);

    if (this.get("shotsRemainingForIteration") <= 0) {
      this.set("shotsRemainingForIteration", this.get("shotsPerIteration"));
      this.get("board").showFeedback();
    }
    if (this.get("shotsRemainingForGame") <= 0) {
      this.endGame();
    }


  },
  sunkenBoat: function(boat) {
    this.sunken++;
    this.set("funds", this.get("funds") + boat.length() * this.get("sunkenBoatCellReward"));
    if (this.fleetDestroyed() && this.get("shotsRemainingForGame") > 0) {
      this.endGame();
    }
  },
  fleetDestroyed: function() {
    return this.sunken >= this.get("board").fleetSize();
  },
  endGame: function() {
    if (!this.has("endGameState")) {
      if (this.fleetDestroyed()) {
        this.set("endGameState", "win");
      }
      else {
        this.set("endGameState", "lose");
      }
      this.set("shotsRemainingForIteration", 0);
      this.get("board").disable();
      this.get("board").showFleet();
    }
  }
});

var GameView = Backbone.View.extend({
  initialize: function(args) {
    _.bindAll(this, "updateShotsRemainingForGame", "updateShotsRemainingForIteration", "updateEndGameState", "updateFunds");
    $(".message").addClass('hidden');
    $(".stats").removeClass('hidden');
    this.model.bind("change:shotsRemainingForGame", this.updateShotsRemainingForGame);
    this.model.bind("change:shotsRemainingForIteration", this.updateShotsRemainingForIteration);
    this.model.bind("change:funds", this.updateFunds);
    this.model.bind("change:endGameState", this.updateEndGameState);
  },
  render: function() {
    this.boardView = new BoardView({
      model: this.model.get("board")
    });
    $("#boardcontainer").append(this.boardView.render().el);

    this.updateShotsRemainingForGame();
    this.updateShotsRemainingForIteration();
    this.updateFunds();
    $("#endGameResult").html("");
    return this;
  },
  updateChart: function() {
    var remainingShots = this.model.get("shotsRemainingForGame");
    var gameShots = 40 - remainingShots;
    var iterationShots = this.model.get("shotsRemainingForIteration");
    var chartDisplayFunds = this.model.get("funds") / 1000;
    ChartData.series[0].values.push([gameShots, chartDisplayFunds]);
    console.log("[" + gameShots + ","+ chartDisplayFunds+"]" );
    zingchart.render({
      id: "chartDiv",
      data: ChartData,
      height:400,
    });
  },
  updateShotsRemainingForGame: function() {
    $("#totalShotsRemaining").html(this.model.get("shotsRemainingForGame"));
  },
  updateShotsRemainingForIteration: function() {
    $("#shotsRemainingForIteration").html(this.model.get("shotsRemainingForIteration"));
  },
  updateFunds: function() {
    var funds = this.model.get("funds");
    $("#funds").html(this.formatMoney(funds));
    this.updateChart();
  },
  updateEndGameState: function(model, endGameState) {
    var diff = this.model.get("funds") - this.model.get("maxShots") * this.model.get("costPerShot");
    if (endGameState === "lose") { // No se destruyo toda la flota enemiga
      // console.log(diff);
      if (diff > 0) {
        $("#endGameResult").html('<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong><i class="fa fa-flag-checkered"></i> ¡Juego Finalizado!</strong> Ganaste ' + this.formatMoney(diff) + '</div>');
      }
      else if (diff < 0) {
        $("#endGameResult").html('<div class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong><i class="fa fa-flag-checkered"></i> ¡Juego Finalizado!</strong> Perdiste ' + this.formatMoney(diff) + '</div>');
      }
      else {
        $("#endGameResult").html('<div class="alert alert-info alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong><i class="fa fa-flag-checkered"></i> ¡Juego Finalizado!</strong> Mantuviste tu dinero</div>');
      }
    }
    else { // Se destruyo toda la flota
      $("#endGameResult").html('<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong><i class="fa fa-trophy"></i> ¡Has destruido la flota!</strong> Ganaste ' + this.formatMoney(diff) + '</div>');
    }
  },
  formatMoney: function(amount) {
    return "US&dollar; " + $.formatNumber(amount, {
      format: "#,##0",
      locale: "nl"
    });
  }
});
