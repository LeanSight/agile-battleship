var StatusPanel = Backbone.View.extend({
    className: 'col-xs-12',

    template: _.template(
        '<div class="panel <%= panelClass %>">' +
            '<div class="panel-heading">' +
                '<div class="row">' +
                    '<div class="col-xs-3">' +
                        '<img src="<%= iconSrc %>" class="status-icon-svg">' +
                    '</div>' +
                    '<div class="col-xs-9 text-right">' +
                        '<div>' +
                            '<span class="logo-text" id="<%= spanId %>"></span>' +
                        '</div>' +
                        '<div><%= description %></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'
    ),

    initialize: function(options) {
        this.panelClass = options.panelClass;
        this.iconSrc = options.iconSrc;
        this.spanId = options.spanId;
        this.description = options.description;
    },

    render: function() {
        this.$el.html(this.template({
            panelClass: this.panelClass,
            iconSrc: this.iconSrc,
            spanId: this.spanId,
            description: this.description
        }));

        return this;
    }
});