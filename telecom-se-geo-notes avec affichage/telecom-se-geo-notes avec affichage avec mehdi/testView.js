var ListView = Backbone.View.extend({

    initialize: function() {
        this.render();
    },  

    events: {
        'click ul#perpage span': 'setperpage'
    },

    setperpage: function(event) {
        this.collection.perpageurl = '/perpage/' + $(event.target).text();
        this.collection.fetch();
        this.render();
    },

    render: function() {

    template = _.template('\
	<table>\
    <% _(collection).each(function(model){%>\
    <tr><td><%=model.id%></td><td><%=model.name%></td><td><%=model.email%></td></tr>\
    <%}); %>\
    </table>\
    <ul id="perpage">\
    <li><span>5</span></li>\
    <li><span>10</span></li>\
    </ul>\
    ');

        var context = {collection: this.collection.toJSON()};
        $(this.el).html(template(context));
        $('#app').html(this.el);
        return this;
    }
});