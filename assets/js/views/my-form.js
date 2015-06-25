define([
 "jquery", "underscore", "backbone"
         , "views/temp-snippet"
         , "helper/pubsub"
         , "text!templates/app/renderform.html"
], function (
        $, _, Backbone
        , TempSnippetView
        , PubSub
        , _renderForm
        ) {
 return Backbone.View.extend({
  tagName: "fieldset"
  , initialize: function () {
   this.collection.on("add", this.addComponent, this);
   this.collection.on("remove", this.render, this);
   this.collection.on("change", this.render, this);
   PubSub.on("mySnippetDrag", this.handleSnippetDrag, this);
   PubSub.on("tempMove", this.handleTempMove, this);
   PubSub.on("tempDrop", this.handleTempDrop, this);
   this.$build = $("#build");
   this.renderForm = _.template(_renderForm);
   this.render();
  }

  , TargetClass: function () {
   this.className = null;
   this.height = 0;
  }

  , targetRoomIndex: function () {
   var $components = $(this.$el.find(".component"));
   for (var i = 0; i < $components.length; i++) {
    var $component = $components.eq(i);
    if ($component.hasClass('target')) {
     return i;
    }
   }
   return -1;
  }

  , removeTargetClasses: function ($target) {
   $(".target").remove();
  }

  , render: function () {
   //Render Snippet Views
   this.$el.empty();
   var that = this;
   _.each(this.collection.renderAll(), function (snippet) {
    that.$el.append(snippet);
   });
   $("#render").val(that.renderForm({
    text: _.map(this.collection.renderAllClean(), function (e) {
     return e.html()
    }).join("\n")
   }));

   this.wrapRooms();
   this.$el.appendTo("#build form");
   this.prettifyComponentRows();
   this.delegateEvents();
  }

  , addComponent: function () {
   //Render Snippet Views
   this.prettifyCollection();
   this.$el.empty();
   var that = this;
   _.each(this.collection.renderAll(), function (snippet) {
    that.$el.append(snippet);
   });
   $("#render").val(that.renderForm({
    text: _.map(this.collection.renderAllClean(), function (e) {
     return e.html();
    }).join("\n")
   }));

   this.wrapRooms();
   this.$el.appendTo("#build form");
   this.prettifyComponentRows();
   this.delegateEvents();
  }

  , getHousePosition: function (eventY) {
   var myFormBits = $(this.$el.find(".component-row"));
   var topelement = _.find(myFormBits, function (renderedSnippet) {
    if (($(renderedSnippet).offset().top + $(renderedSnippet).height()) > eventY) {
     return true;
    }
    else {
     return false;
    }
   });

   if (topelement) {
    return topelement;
   } else {
    return this.$el.children()[this.$el.children().length - 1];
   }
  }

  , wrapRooms: function () {
   var $set = this.$el.children();
   var i = 0;
   console.log("---------------", $set.length);

   while (i < $set.length) {
    console.log("class", ($($set[i]).attr("class")))
    i++;
   }
   i = 0;
   while (i < $set.length) {
    if ($($set[i]).hasClass("col-lg-4")) {
     $set.slice(i, i + 3).wrapAll('<div class="row component-row"/>');
     i += 3;
    } else if ($($set[i]).hasClass("col-lg-6")) {
     $set.slice(i, i + 2).wrapAll('<div class="row component-row"/>');
     i += 2;
    } else {
     $set.slice(i, i + 1).wrapAll('<div class="row component-row"/>');
     i += 1;
    }
   }
  }

  , prettifyCollection: function () {
   var thisModel = this;
   var $components = $("#build form .component");
   for (var i = 0; i < $components.length; i++) {
    var $child = $($components[i]);
    console.log("Coo", $child);
    thisModel.collection.models[i].set("className", $child.attr("class"));
   }
  }

  , prettifyComponentRows: function () {
   var thisModel = this;
   var i = 0;
   $("#build form .component-row").each(function () {
    var $children = $(this).find(".component");
    //console.log("Mooooooo", $children.length);
    switch ($children.length) {
     case 1:
      $children.each(function () {
       var $child = $(this);
       $child.removeClass(function (index, css) {
        return (css.match(/(^|\s)col-\S+/g) || []).join(' ');
       });
       $child.addClass("col-lg-12");
      });
      break;
     case 2:
      var maxHeight = 0;
      $children.each(function () {
       var $child = $(this);
       $child.removeClass(function (index, css) {
        return (css.match(/(^|\s)col-\S+/g) || []).join(' ');
       });
       $child.addClass("col-lg-6");
       if ($child.height() > maxHeight) {
        maxHeight = $child.height();
       }
      });
      $children.each(function () {
       var $child = $(this);
       $child.height(maxHeight);
      });
      break;
     case 3:
      var maxHeight = 0;
      $children.each(function () {
       var $child = $(this);
       $child.removeClass(function (index, css) {
        return (css.match(/(^|\s)col-\S+/g) || []).join(' ');
       });
       $child.addClass("col-lg-4");
       if ($child.height() > maxHeight) {
        maxHeight = $child.height();
       }
      });
      $children.each(function () {
       var $child = $(this);
       $child.height(maxHeight);
      });
      break;
    }
   });
  }

  , createTargetRoom: function ($component, children) {
   var targetRoom = new this.TargetClass();
   targetRoom.height = $component.height();

   switch (children) {
    case 0:
     targetRoom.className = "target component col-lg-12";
     targetRoom.heigh = "10px";
     break;
    case 1:
     targetRoom.className = "target component col-lg-6";
     break;
    case 2:
     targetRoom.className = "target component col-lg-4";
     break;
   }
   return $("<div />")
           .addClass(targetRoom.className)
           .height(targetRoom.height);
  }
  , getRoomNumber: function ($component, childrenCount, pageX) {
   var roomWidth = $component.width() / (childrenCount + 1);
   var houseLeftPosition = $component.offset().left;
   for (var n = 0; n < childrenCount + 1; n++) {
    if (pageX >= houseLeftPosition + (roomWidth * n) &&
            pageX < houseLeftPosition + (roomWidth * (n + 1))) {
     console.log("nnnnnnnn", n)
     return n;
    }
   }
   return -1;
  }

  , makeRoom: function ($component, mouseEvent) {
   var thisModel = this;
   if (mouseEvent.pageY >= $component.offset().top + $component.height() - 20) {
    //case when there are no form elements, i.e. only the label name
    thisModel.createTargetRoom($component, 0).insertAfter($component);
   } else {
    var childrenCount = $component.length;
    var roomNumber = thisModel.getRoomNumber($component, childrenCount, mouseEvent.pageX);
    console.log("pppppppppp", roomNumber, childrenCount);
    if (roomNumber === 0) {
     var $room = $component.children(".component").eq(0);
     thisModel.createTargetRoom($component, childrenCount).insertBefore($room);
    } else if (roomNumber === 1) {
     var $room = $component.children(".component").eq(0);
     thisModel.createTargetRoom($component, childrenCount).insertAfter($room);
    } else {
     var $room = $component.children(".component").eq(roomNumber);
     console.log("3+  ", roomNumber, $room);
     thisModel.createTargetRoom($component, childrenCount).insertAfter($room);
    }
    return false;
   }
  }

  , handleSnippetDrag: function (mouseEvent, snippetModel) {
   $("body").append(new TempSnippetView({model: snippetModel}).render());
   this.collection.remove(snippetModel);
   PubSub.trigger("newTempPostRender", mouseEvent);
  }

  , handleTempMove: function (mouseEvent) {
   this.removeTargetClasses($(".target"));
   if (mouseEvent.pageX >= this.$build.offset().left &&
           mouseEvent.pageX < (this.$build.width() + this.$build.offset().left) &&
           mouseEvent.pageY >= this.$build.offset().top &&
           mouseEvent.pageY < (this.$build.height() + this.$build.offset().top)) {
    var $parent = $(this.getHousePosition(mouseEvent.pageY));
    this.makeRoom($parent, mouseEvent);
   } else {
    this.removeTargetClasses($(".target"));
   }
   this.prettifyComponentRows();
  }

  , handleTempDrop: function (mouseEvent, model, index) {
   if (mouseEvent.pageX >= this.$build.offset().left &&
           mouseEvent.pageX < (this.$build.width() + this.$build.offset().left) &&
           mouseEvent.pageY >= this.$build.offset().top &&
           mouseEvent.pageY < (this.$build.height() + this.$build.offset().top)) {

    var index = this.targetRoomIndex();
    $(".target").removeClass("target");
    console.log("Index", index);
    this.prettifyComponentRows();
    this.collection.add(model, {at: index});

    for (var i = 0; i < this.collection.models.length; i++) {
     console.log('log item.', this.collection.models[i].get("className"));
    }
    console.log("ModelClass--", model.get("className"));
   } else {
    this.removeTargetClasses($(".target"));
   }
   this.removeTargetClasses($(".target"));
  }
 })
});
