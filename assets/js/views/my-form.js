define([
	"jquery", "underscore", "backbone"
			, "views/temp-snippet"
			, "helper/pubsub"
			, "text!templates/app/renderform.html"
], function(
		$, _, Backbone
		, TempSnippetView
		, PubSub
		, _renderForm
		) {
	return Backbone.View.extend({
		tagName: "fieldset"
		, initialize: function() {
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

		, TargetClass: function() {
			this.className = null;
			this.height = 0;
		}

		, targetRoomIndex: function() {
			var target = $(".target");
			var targetParent = target.parent();
			console.log(targetParent.attr("class"));
			if (targetParent.hasClass("component-row")) {
				return targetParent.index() + target.index();
			} else {
				return target.index();
			}
		}

		, removeTargetClasses: function($target) {
			$(".target").remove();
		}

		, render: function() {
			//Render Snippet Views
			this.$el.empty();
			var that = this;
			_.each(this.collection.renderAll(), function(snippet) {
				that.$el.append(snippet);
			});
			$("#render").val(that.renderForm({
				text: _.map(this.collection.renderAllClean(), function(e) {
					return e.html()
				}).join("\n")
			}));

			this.wrapRooms();
			this.$el.appendTo("#build form");
			this.prettifyComponentRows();
			this.delegateEvents();
		}

		, addComponent: function() {
			//Render Snippet Views
			this.prettifyCollection();
			this.$el.empty();
			var that = this;
			_.each(this.collection.renderAll(), function(snippet) {
				that.$el.append(snippet);
			});
			$("#render").val(that.renderForm({
				text: _.map(this.collection.renderAllClean(), function(e) {
					return e.html();
				}).join("\n")
			}));

			this.wrapRooms();
			this.$el.appendTo("#build form");
			this.prettifyComponentRows();
			this.delegateEvents();
		}

		, getHousePosition: function(eventY) {
			var myFormBits = $(this.$el.find(".component-row"));
			var topelement = _.find(myFormBits, function(renderedSnippet) {
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

		, wrapRooms: function() {
			var $set = this.$el.children();
			var i = 0;
			console.log("---------------", $set.length);

			while (i < $set.length) {
				console.log("class", ($($set[i]).attr("class")))
				i++;
			}
			i = 0;
			while (i < $set.length) {
				if ($($set[i]).hasClass("col-lg-6")) {
					$set.slice(i, i + 2).wrapAll('<div class="row component-row"/>');
					i += 2;
				} else {
					$set.slice(i, i + 1).wrapAll('<div class="row component-row"/>');
					i += 1;
				}
			}
		}

		, prettifyCollection: function() {
			var thisModel = this;
			var $components = $("#build form .component");
			for (var i = 0; i < $components.length; i++) {
				var $child = $($components[i]);
				console.log("Coo", $child);
				thisModel.collection.models[i].set("className", $child.attr("class"));
			}
		}

		, prettifyComponentRows: function() {
			var thisModel = this;
			var i = 0;
			$("#build form .component-row").each(function() {
				var $children = $(this).find(".component");
				//console.log("Mooooooo", $children.length);
				switch ($children.length) {
					case 1:
						$children.each(function() {
							var $child = $(this);
							$child.removeClass(function(index, css) {
								return (css.match(/(^|\s)col-\S+/g) || []).join(' ');
							});
							$child.addClass("col-lg-12");
						});
						break;
					case 2:
						$children.each(function() {
							var $child = $(this);
							$child.removeClass(function(index, css) {
								return (css.match(/(^|\s)col-\S+/g) || []).join(' ');
							});
							$child.addClass("col-lg-6");
						});
						break;
				}
			});
		}

		, createTargetRoom: function($component, children) {
			var targetRoom = new this.TargetClass();
			targetRoom.height = $component.height();

			switch (children) {
				case 0:
					targetRoom.className = "target component col-lg-12";
					break;
				case 1:
					targetRoom.className = "target component col-lg-6";
					break;
			}
			return $("<div />")
					.addClass(targetRoom.className)
					.height(targetRoom.height);
		}

		, makeRoom: function($component, mouseEvent) {
			var thisModel = this;
			if (mouseEvent.pageY >= $component.offset().top + $component.height() - 20) {
				//case when there are no form elements, i.e. only the label name
				thisModel.createTargetRoom($component, 0).insertAfter($component);
			} else {
				var childrenCount = $component.length;
				$component.find(".component").each(function() {
					var $child = $(this);
					//when the cursor is inside the component to the left
					if (mouseEvent.pageX >= $component.offset().left &&
							mouseEvent.pageX < (($component.width() / (childrenCount + 1)) + $component.offset().left)) {
						thisModel.createTargetRoom($component, childrenCount).insertBefore($child);
						return false;
						//when the cursor is inside the component tot he right
					} else if (mouseEvent.pageX >= (($component.width() / (childrenCount + 1)) + $component.offset().left) &&
							mouseEvent.pageX < (($component.width()) + $component.offset().left)) {
						thisModel.createTargetRoom($component, childrenCount).insertAfter($child);
						return false;
					}
				});
			}
		}

		, handleSnippetDrag: function(mouseEvent, snippetModel) {
			$("body").append(new TempSnippetView({model: snippetModel}).render());
			this.collection.remove(snippetModel);
			PubSub.trigger("newTempPostRender", mouseEvent);
		}

		, handleTempMove: function(mouseEvent) {
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

		, handleTempDrop: function(mouseEvent, model, index) {
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
