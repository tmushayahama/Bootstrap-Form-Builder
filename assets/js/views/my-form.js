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
			this.className = null;
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

		, addElement: function($target) {
			$target.replace();

			$target.removeClass(function(index, css) {
				return (css.match(/(^|\s)target-\S+/g) || []).join(' ');
			});
			$target.removeClass("target");

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
			var myFormBits = $(this.$el.find(".component-row"));
			var topelement = _.find(myFormBits, function(renderedSnippet) {
				if (($(renderedSnippet).position().top + $(renderedSnippet).height()) > eventY - 90) {
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
		
		, rearrangeComponentRow: function($row) {
			$row.find(".component").each(function() {
				var $child = $(this);
				$child.removeClass("col-lg-12");
				$child.addClass("col-lg-6");
			});
		}

		, determinePosition: function($component, mouseEvent) {
			var thisModel = this;
			var targetClass = new this.TargetClass();

			//case when there are no form elements, i.e. only the label name
			if ($component.hasClass("component-row") && $component.find(".component").length === 0) {
				targetClass.className = "target row";
				targetClass.height = $component.height();
				if (targetClass !== null) {
					$component.parent().append($("<div />")
							.addClass(targetClass.className)
							.height(targetClass.height));
				}
			} else {
				var $parent = $component.closest(".component-row");

				var childrenCount = $parent.length;
				$parent.find(".component").each(function() {
					var $child = $(this);
					//console.log("Child", $child.offset());
					if (mouseEvent.pageX >= $child.offset().left &&
							mouseEvent.pageX < (($child.width() / 2) + $child.offset().left)) {
						targetClass.className = "target col-lg-6";
						targetClass.height = $child.height();
						$parent.prepend($("<div />")
								.addClass(targetClass.className)
								.height(targetClass.height));
						thisModel.rearrangeComponentRow($parent);
						return false;
					} else if (mouseEvent.pageX >= (($child.width() / 2) + $child.offset().left) &&
							mouseEvent.pageX < (($child.width()) + $child.offset().left)) {
						//targetClass.className = "target target-right";
						//targetClass.height = $component.height();
						return false;
					}
				});


				return targetClass;
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
				this.determinePosition($parent, mouseEvent);

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
				//this.rearrangeElement();
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
