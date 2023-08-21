var CellHeader = Backbone.Model.extend({
  initialize: function() {
    const x = this.get("x");
    const y = this.get("y");

    // fila superior con los números
		if(y === 0) {
			if(x>0 && x<=10 ){
        this.text = x;
			}
		}

    // primera columna con las letras
		var A_charcode = "A".charCodeAt(0);
		if(x === 0) {
			if(y>0 && y<= 10){
        this.text = String.fromCharCode(A_charcode+y-1);
			}
		}    
  },

  defaults: {
    text: ""    
  },

});

var Cell = Backbone.Model.extend({
  defaults: {
    state: "empty"
  },
  fire: function() {
    this.trigger("fire", this);
  },
  updateState: function() {
    if (this.has("boat")) {
      this.get("boat").hit(this);
      this.set("state", "hit");
    } else {
      this.set("state", "miss");
    }
  }
});


var AbstractCellView = Backbone.View.extend({
  build_cell_id: function (x, y)
  {
    return 'cell_' + x + '_' + y;
  },
  initialize: function ()
  {
    this.cell_x = this.model.get("x");
    this.cell_y = this.model.get("y");
    this.id = this.build_cell_id(this.cell_x, this.cell_y);
  }

});

var CellHeaderView = AbstractCellView.extend({
  tagName: "th",
  className: "cell-header",

  initialize: function() {
    AbstractCellView.prototype.initialize.call(this);
	},

  render: function() {
		this.$el.attr("id", this.id);
    this.$el.html(this.model.text);
    return this;
  },

});

var CellView = AbstractCellView.extend({
  tagName: "td",
  className: "cell",
  defaults: {
    fired : false, //todo: esto debiera estar en el modelo?
  },
  events: {
    "click": "fire",
    "mouseover": "mouseOverCell",
    "mouseleave": "mouseLeaveCell",
  },
  initialize: function() {
    AbstractCellView.prototype.initialize.call(this);
    _.bindAll(this, "renderBoat", "updateState", "disable", "fire");
    this.model.bind("change:boat", this.renderBoat);
    this.model.bind("change:state", this.updateState);
    this.model.bind("change:disabled", this.disable);
		
	},
  render: function() {
		this.$el.attr("id", this.id);
    this.renderBoat();
    return this;
  },
  renderBoat: function() {
    if (this.model.has('boat')) 
    {
      if (this.model.get("boat").get("visible")) 
      {
        this.$el.addClass("showBoat");
        this.$el.addClass(this.model.get("boat").get("type"));
      }
      this.model.get('boat').bind("change:visible", this.renderBoat);
    }
  },
  updateState: function() {
    if (this.model.get("state") == "hit") {
      this.$el.html("<img class='hit marker animated bounceIn' src='images/fire.svg'/>");
    } 
    else if (this.model.get("state") == "miss") {
      this.$el.html("<img class='miss marker animated bounceIn' src='images/miss.svg'></i>");
      this.$el.addClass("miss-cell");
    }
  },
  fire: function() {
    this.$el.html("<img class='target marker' src='images/coordenada.svg'/>");
    this.model.fire();
    this.fired = true;
    this.$el.unbind("click");
  },
  disable: function(model, doDisable) 
  {
    if (doDisable) {
      this.$el.unbind("click"); // Desvincula el evento de clic si enable es false
      
    } else if(!this.fired)
    {
      this.$el.bind("click", this.fire); // Vincula el evento de clic si enable es true y no ha sido disparada la celda
    }
  },
  highlightCell: function(doHighlight){
      this.$el.toggleClass("cell-hover",doHighlight);
      
      var column_header_id   = this.build_cell_id(this.cell_x,0);
		  var column_header_cell = this.$el.closest('table').find("#"+column_header_id);
		  
		  var row_header_id   = this.build_cell_id(0,this.cell_y);
  		var row_header_cell = this.$el.closest('table').find("#"+row_header_id);

      column_header_cell.toggleClass("cell-header-hover",doHighlight);
  		row_header_cell.toggleClass("cell-header-hover",doHighlight);
  },
  mouseOverCell: function(){
      this.highlightCell(true);
  },
  mouseLeaveCell: function(){
      this.highlightCell(false);
  },
});


