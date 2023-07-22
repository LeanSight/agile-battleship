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

var CellView = AbstractCellView.extend({
  tagName: "td",
  className: "cell",
  events: {
    "click": "fire",
    "mouseover": "mouseOverCell",
    "mouseleave": "mouseLeaveCell",
  },
  initialize: function() {
    AbstractCellView.prototype.initialize.call(this);
    _.bindAll(this, "renderBoat", "updateState", "disable");
    this.model.bind("change:boat", this.renderBoat);
    this.model.bind("change:state", this.updateState);
    this.model.bind("change:disabled", this.disable);
		
		this.in_header = this.cell_x==0 || this.cell_y==0;
		this.in_board  = !this.in_header && this.cell_x<=10 && this.cell_y<=10;
	},

  render: function() {
		this.$el.attr("id", this.id);
		
    // fila superior con los números
		if(this.cell_y === 0) {
			this.disable();
			this.$el.addClass("cell-title-top");
			if(this.cell_x>0 && this.cell_x<=10 ){
				this.$el.html(this.cell_x);		  
			}
		}

    // primera columna con las letras
		var A_charcode = "A".charCodeAt(0);
		if(this.cell_x === 0) {
			this.disable();
			this.$el.addClass("cell-title-left");
			if(this.cell_y>0 && this.cell_y <= 10){
				this.$el.html(String.fromCharCode(A_charcode+this.cell_y-1));
			}
		}
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
    this.$el.unbind("click");
  },
  disable: function() {
    this.$el.unbind("click");
  }
  ,
  highlightCell: function(doHighlight){
      this.$el.toggleClass("cell-hover",doHighlight);
      
      var column_header_id   = this.build_cell_id(this.cell_x,0);
		  var column_header_cell = this.$el.closest('table').find("#"+column_header_id);
		  
		  var row_header_id   = this.build_cell_id(0,this.cell_y);
  		var row_header_cell = this.$el.closest('table').find("#"+row_header_id);

      column_header_cell.toggleClass("cell-title-hover",doHighlight);
  		row_header_cell.toggleClass("cell-title-left-hover",doHighlight);
  },
  mouseOverCell: function(){
    if(this.in_board){
      this.highlightCell(true);
    }
  },
  mouseLeaveCell: function(){
    if(this.in_board){
      this.highlightCell(false);
    }
  },
});


