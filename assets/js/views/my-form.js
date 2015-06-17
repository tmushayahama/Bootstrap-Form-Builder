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
			this.collection.on("add", this.render, this);
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
			this.className = 'target';
			this.height = 0;
		}

		, removeTargetClasses: function($target) {
			/*
			$target.removeClass(function(index, css) {
				return (css.match(/(^|\s)target-\S+/g) || []).join(' ');
			});
			$target.removeClass("target");
			*/
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
			this.$el.appendTo("#build form");
			this.delegateEvents();
		}

		, getBottomAbove: function(eventY) {
			var myFormBits = $(this.$el.find(".component"));
			var topelement = _.find(myFormBits, function(renderedSnippet) {
				if (($(renderedSnippet).offset().top + $(renderedSnippet).height()) > eventY - 90) {
					return true;
				}
				else {
					return false;
				}
			});
			if (topelement) {
				return topelement;
			} else {
				return myFormBits[0];
			}
		}

		, determinePosition: function($component, mouseEvent) {
			var targetClass = new this.TargetClass();
			if (($component).hasClass("row")) {
				targetClass.className = "target target-down";
				targetClass.height = $component.height();
				return targetClass;
			} else {
				var $parent = $component.closest("row");
				console.log("Parent", $parent);
				var childrenCount = $parent.length();
				$parent.each(function() {
					var $child = $(this);
					if (mouseEvent.pageX >= $child.offset().left &&
							mouseEvent.pageX < ((this.$child.width() / 2) + this.$build.offset().left)) {
						targetClass.className = "col-1g-6 target";
						targetClass.height = $component.height();
						return targetClass;
					} else if (mouseEvent.pageX >= ((this.$child.width() / 2) + this.$build.offset().left) &&
							mouseEvent.pageX < ((this.$child.width()) + this.$build.offset().left)) {
						targetClass.className = "col-1g-6 target";
						targetClass.height = $component.height();
						return targetClass;
					}
				});
			}
			return null;
		}

		, handleSnippetDrag: function(mouseEvent, snippetModel) {
			$("body").append(new TempSnippetView({model: snippetModel}).render());
			this.collection.remove(snippetModel);
			PubSub.trigger("newTempPostRender", mouseEvent);
		}

		, handleTempMove: function(mouseEvent) {
			this.removeTargetClasses($(".target"));
			//$(".target").removeClass("target");
			if (mouseEvent.pageX >= this.$build.offset().left &&
					mouseEvent.pageX < (this.$build.width() + this.$build.offset().left) &&
					mouseEvent.pageY >= this.$build.offset().top &&
					mouseEvent.pageY < (this.$build.height() + this.$build.offset().top)) {
				var $parent = $(this.getBottomAbove(mouseEvent.pageY));
				var targetClass = this.determinePosition($parent, mouseEvent);
				if (targetClass !== null) {
					//$parent.addClass(targetClass.className);
					$parent.append($("<div />").addClass(targetClass.className));
					console.log($parent.html())
					//console.log("targetClass", targetClass);
				}
			} else {
				this.removeTargetClasses($(".target"));
				//$(".target").removeClass("target");
			}
		}

		, handleTempDrop: function(mouseEvent, model, index) {
			if (mouseEvent.pageX >= this.$build.offset().left &&
					mouseEvent.pageX < (this.$build.width() + this.$build.offset().left) &&
					mouseEvent.pageY >= this.$build.offset().top &&
					mouseEvent.pageY < (this.$build.height() + this.$build.offset().top)) {
				var index = $(".target").index();
				this.removeTargetClasses($(".target"));
				//$(".target").removeClass("target");
				this.collection.add(model, {at: index + 1});
			} else {
				this.removeTargetClasses($(".target"));
				//$(".target").removeClass("target");
			}
		}
	})
});
