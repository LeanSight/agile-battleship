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


var CellView = Backbone.View.extend({
  tagName: "td",
  className: "cell",
  events: {
    "click": "fire",
    "mouseover": "mousehovercell",
    "mouseleave": "mousehovercell",
  },
  build_cell_id: function(val_x,val_y){
    return "cell-" + val_x + "-" + val_y;
  },
  initialize: function() {
    _.bindAll(this, "renderBoat", "updateState", "disable");
    this.model.bind("change:boat", this.renderBoat);
    this.model.bind("change:state", this.updateState);
    this.model.bind("change:disabled", this.disable);
		this.cell_x = this.model.get("x");
		this.cell_y = this.model.get("y");
		
		this.in_header = this.cell_x==0 || this.cell_y==0;
		this.in_board  = !this.in_header && this.cell_x<=10 && this.cell_y<=10;
		this.id = this.build_cell_id(this.cell_x, this.cell_y);
  },

  render: function() {
		this.$el.attr("id", this.id);

		if(this.cell_x > 10){
			this.disable();
			this.$el.addClass("cell-title-right");
		}
		
		if(this.cell_y > 10){
			this.disable();
			this.$el.addClass("cell-title-bottom");
		}
		
		if(this.cell_y === 0) {
			this.disable();
			this.$el.addClass("cell-title-top");
			if(this.cell_x>0 && this.cell_x<=10 ){
				this.$el.html(this.cell_x);		  
			}
		}

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
      this.$el.html("<img class='hit marker animated bounceIn' src='images/1331900690_fire.png'/>");
    } 
    else if (this.model.get("state") == "miss") {
      this.$el.html("<i class='miss marker animated flipInX fa fa-times fa-2x text-muted'></i>");
      this.$el.addClass("miss-cell");
    }
  },
  fire: function() {
    this.$el.html("<img class='target marker' src='images/1331901174_bullet_red.png'/>");
    this.model.fire();
    this.$el.unbind("click");
  },
  disable: function() {
    this.$el.unbind("click");
  }
  ,
  mousehovercell: function(){
    console.log("in board "+this.in_board);
    if(this.in_board){
      var column_header_id = this.build_cell_id(this.cell_x,0);
		  var col_hdr_cell = this.$el.closest('table').find("#"+column_header_id);
		  
		  var row_header_id = this.build_cell_id(0,this.cell_y);
  		var row_hdr_cell = this.$el.closest('table').find("#"+row_header_id);

      col_hdr_cell.toggleClass("cell-title-hover");
  		row_hdr_cell.toggleClass("cell-title-left-hover");
    }
  },
});


