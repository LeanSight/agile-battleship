var Game = Backbone.Model.extend({
  defaults: {
    shotsPerIteration: 40,
    maxShots: 40,
    costPerShot: 10000,
    sunkenBoatCellReward: 50000,
  },
  setRandomFleet: function ()
  {
    var self = this;
    var board = this.get("board");
    var directions = ["vertical", "horizontal"];

    _(Fleet.boatTypes).each(function (type)
    {
      var placed = false;
      while (!placed)
      {
        var boat = new Boat({
          x: self.random(board.get("gridSize").x + 1),
          y: self.random(board.get("gridSize").y + 1),
          direction: directions[self.random(2)],
          type: type,
          visible: false
        });
        if (board.validBoatPlacement(boat))
        {
          self.addBoat(boat);
          placed = true;
        }
      }
    });
  },
  setFixedFleet: function (board, fleetData)
  {
    var self = this;
    _(fleetData).each(function (data)
    {
      var boat = new Boat({
        x: data.x,
        y: data.y,
        direction: data.direction,
        type: data.type,
        visible: false
      });
      if (board.validBoatPlacement(boat))
      {
        self.addBoat(boat); // Here we are using Game's addBoat method.
      } else
      {
        throw new Error("Invalid boat placement for boat: " + data.type);
      }
    });
  },
  initialize: function (args)
  {
    _.bindAll(this, "sunkenBoat", "shotFired");
    this.set("shotsRemainingForIteration", args.shotsPerIteration);
    this.set("shotsRemainingForGame", this.get("maxShots"));
    this.set("funds", this.get("maxShots") * this.get("costPerShot"));
    this.set("initialBudget", this.get("funds"));
    this.set("manualLaunchMode", args.manualLaunchMode);
    this.set("manualLaunchEnabled", false);

    this.sunken = 0;
    this.set("board", new Board());
    var board = this.get("board");
    board.bind("fire", this.shotFired);

    ChartData.series[0].values = [];

    if (args.fleet.length == 0) 
    {
      this.setRandomFleet(board);
    } else
    {
      this.setFixedFleet(board, args.fleet);
    }

  },
  random: function (max)
  {
    return Math.floor(Math.random() * max);
  },
  destroy: function ()
  {
    this.get("board").destroy();
    Game.__super__.destroy();
  },
  addBoat: function (boat)
  {
    console.log(boat.toString())
    boat.bind("sunken", this.sunkenBoat);
    this.get("board").addBoat(boat);
  },
  shotFired: function ()
  {
    this.set("shotsRemainingForIteration", this.get("shotsRemainingForIteration") - 1);
    this.set("funds", this.get("funds") - this.get("costPerShot"));
    this.set("shotsRemainingForGame", this.get("shotsRemainingForGame") - 1);

    if (this.get("shotsRemainingForIteration") <= 0)
    {
      this.set("shotsRemainingForIteration", this.get("shotsPerIteration"));
      if (this.get("manualLaunchMode") === true)
      {
        this.set("manualLaunchEnabled", true);
      }
      else
        this.get("board").showFeedback();
    }
    if (this.get("shotsRemainingForGame") <= 0)
    {
      this.endGame();
    }


  },
  sunkenBoat: function (boat)
  {
    this.sunken++;
    this.set("funds", this.get("funds") + boat.length() * this.get("sunkenBoatCellReward"));
    if (this.fleetDestroyed() && this.get("shotsRemainingForGame") > 0)
    {
      this.endGame();
    }
  },
  fleetDestroyed: function ()
  {
    return this.sunken >= this.get("board").fleetSize();
  },
  endGame: function ()
  {
    if (!this.has("endGameState"))
    {
      if (this.get("manualLaunchMode") === true)
      {
        this.set("manualLaunchEnabled", true);
      }
      else
      {
        this.get("board").disable();
        this.get("board").showFleet();
      }
      if (this.fleetDestroyed())
      {
        this.set("endGameState", "win");
      }
      else
      {
        this.set("endGameState", "lose");
      }
      this.set("shotsRemainingForIteration", 0);

    }
  }
});

var GameView = Backbone.View.extend({
  initialize: function (args)
  {
    _.bindAll(this, "updateShotsRemainingForGame", "updateShotsRemainingForIteration", "updateEndGameState", "updateFunds","showEndGameState","handleManualLaunch");
    $(".message").addClass('hidden');
    $(".stats").removeClass('hidden');
    this.model.bind("change:shotsRemainingForGame", this.updateShotsRemainingForGame);
    this.model.bind("change:shotsRemainingForIteration", this.updateShotsRemainingForIteration);
    this.model.bind("change:funds", this.updateFunds);
    this.model.bind("change:endGameState", this.updateEndGameState);
    this.model.bind("change:manualLaunchEnabled", this.handleManualLaunch);

  },
  handleManualLaunch: function (model, doEnable) 
  {
    console.log("valor de habilitacion de boton: " + doEnable);
    if (doEnable)
    {
      $("#launchMissiles").closest('.input-group').removeClass('hidden');
      $("#launchMissiles").click(function ()
      {
        model.set("manualLaunchEnabled", false);
      });
      model.get("board").disable();
    }
    else 
    {
      var board = model.get("board");

      if (!model.has("endGameState"))
      {
        board.setDisable(false);
        board.showFeedback();
      }
      else
      {
        board.showFeedback();
        board.showFleet();
        this.showEndGameState(model.get("endGameState"));
      }

      $("#launchMissiles").closest('.input-group').addClass('hidden');
    }
  },
  render: function ()
  {
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

  updateChart: function ()
  {
    var remainingShots = this.model.get("shotsRemainingForGame");
    var gameShots = 40 - remainingShots;
    var iterationShots = this.model.get("shotsRemainingForIteration");
    var chartDisplayFunds = this.model.get("funds") / 1000;
    ChartData.series[0].values.push([gameShots, chartDisplayFunds]);
    console.log("[" + gameShots + "," + chartDisplayFunds + "]");
    zingchart.render({
      id: "chartDiv",
      data: ChartData,
      height: 400,
    });
  },
  updateShotsRemainingForGame: function ()
  {
    $("#totalShotsRemaining").html(this.model.get("shotsRemainingForGame"));
  },
  updateShotsRemainingForIteration: function ()
  {
    $("#shotsRemainingForIteration").html(this.model.get("shotsRemainingForIteration"));
  },
  updateFunds: function ()
  {
    var funds = this.model.get("funds");
    $("#funds").html(this.formatMoney(funds));
    this.updateChart();
  },
  showEndGameState: function (endGameState) 
  {
    var diff = this.model.get("funds") - this.model.get("maxShots") * this.model.get("costPerShot");
    var message = "";
    var alertType = "alert-info";

    if (endGameState === "lose")
    {
      if (diff > 0)
      {
        message = '<strong>¡Juego Finalizado!</strong> Ganaste ' + this.formatMoney(diff);
        alertType = "alert-success";
      } else if (diff < 0)
      {
        message = '<strong>¡Juego Finalizado!</strong> Perdiste ' + this.formatMoney(diff);
        alertType = "alert-danger";
      } else
      {
        message = '<strong>¡Juego Finalizado!</strong> Mantuviste tu dinero';
      }
    } else
    {
      message = '<strong>¡Has destruido la flota!</strong> Ganaste ' + this.formatMoney(diff);
      alertType = "alert-success";
    }

    $("#endGameResult").html('<div class="alert ' + alertType + ' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message + '</div>');

  },
  updateEndGameState: function (model, endGameState)
  {
    if (model.get("manualLaunchMode") === true)
    {
      model.set("manualLaunchEnabled", true);
    }
    else
      this.showEndGameState(endGameState);
  },
  formatMoney: function (amount)
  {
    return "US&dollar; " + $.formatNumber(amount, {
      format: "#,##0",
      locale: "nl"
    });
  }
});
