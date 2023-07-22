var Boat = Backbone.Model.extend({
  initialize: function (args)
  {
    this.hits = 0;
  },

  defaults: {
    "visible": false
  },
  length: function ()
  {
    var boatLengths = Fleet.boatLengths;
    return boatLengths[this.get("type")];
  },
  setCells: function (cells)
  {
    this.cells = cells;
    var self = this;
    _(cells).each(function (cell)
    {
      cell.set("boat", self);
    });
  },
  hit: function (cell)
  {
    this.hits++;
    if (this.sunken())
    {
      this.set("visible", true);
      this.trigger("sunken", this);
    }
  },
  sunken: function ()
  {
    return this.cells.length <= this.hits;
  },
  toString: function ()
  {
    return "Boat: " + this.get("type") + " length: " + this.length() + " (x: " + this.get("x") + ", y: " + this.get("y") + ") direction: " + this.get("direction");
  }
});