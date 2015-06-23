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

		, targetClassIndex: function() {
			var target = $(".target");
			var targetParent = target.parent();
			console.log(targetParent.attr("class"));
			if (targetParent.hasClass("component-row")) {
				return targetParent.index();
			} else {
				return target.index();
			}
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

			var $set = this.$el.children();
			var i = 0;
			console.log("----+++++", $set.length)
			while (i < $set.length) {
				if ($($set[i]).hasClass("col-lg-6")) {
					$set.slice(i, i + 2).wrapAll('<div class="row component-row"/>');
					i += 2;
				} else {
					$set.slice(i, i + 1).wrapAll('<div class="row component-row"/>');
					i += 1;
				}
			}
			this.prettifyComponentRows();
			this.$el.appendTo("#build form");
			this.delegateEvents();
		}

		, addComponent: function() {
			//Render Snippet Views
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
			this.$el.appendTo("#build form");
			this.prettifyComponentRows();
			this.delegateEvents();
		}

		, getBottomAbove: function(eventY) {
			var myFormBits = $(this.$el.find(".component-row"));
			var topelement = _.find(myFormBits, function(renderedSnippet) {
				if (($(renderedSnippet).offset().top + $(renderedSnippet).height()) > eventY) {
					//console.log("Top", $(renderedSnippet).offset().top, " ", $(renderedSnippet).offset().top + $(renderedSnippet).height(), " Mouse ", eventY)
					return true;
				}
				else {
					//console.log("Top", $(renderedSnippet).offset().top, " ", $(renderedSnippet).offset().top + $(renderedSnippet).height(), " Mouse ", eventY)
					return false;
				}
			});

			if (topelement) {
				return topelement;
			} else {
				return this.$el.children()[this.$el.children().length - 1];
			}
		}

		, rearrangeComponentRow: function($row) {
			//this.prettifyComponentRows();
			/*
			 $row.find(".component").each(function() {
			 var $child = $(this);
			 $child.removeClass("col-lg-12");
			 $child.removeClass(function(index, css) {
			 return (css.match(/(^|\s)col-\S+/g) || []).join(' ');
			 });
			 $child.addClass("col-lg-6");
			 });
			 */
		}

		, prettifyComponentRows: function() {
			$("#build form .component-row").each(function() {
				var $children = $(this).find(".component");
				console.log("Mooooooo", $children.length);
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

		, createTargetBox: function($component, children) {
			var targetClass = new this.TargetClass();
			targetClass.height = $component.height();

			switch (children) {
				case 0:
					targetClass.className = "target component col-lg-12";
					break;
				case 1:
					targetClass.className = "target component col-lg-6";
					break;
			}
			return $("<div />")
					.addClass(targetClass.className)
					.height(targetClass.height);
		}

		, determinePosition: function($component, mouseEvent) {
			var thisModel = this;


			//var $mouseOverComponent = $(mouseEvent.target);
			//console.log("I am on - ", $mouseOverComponent.attr("class"));

			//if ($component.find(".component").length === 0) {
			//case when there are no form elements, i.e. only the label name
			//	thisModel.createTargetBox($component, 0).insertAfter($component);
			//	thisModel.rearrangeComponentRow($parent);
			if (mouseEvent.pageY >= $component.offset().top + $component.height() - 20) {
				//case when there are no form elements, i.e. only the label name
				thisModel.createTargetBox($component, 0).insertAfter($component);
				//	thisModel.rearrangeComponentRow($parent);
			} else {
				var $parent = $component;

				var childrenCount = $parent.length;
				//console.log("Sons and Daughters", childrenCount)
				$parent.find(".component").each(function() {
					var $child = $(this);
					//when the cursor is inside the component tot he left

					//console.log("Mouse", mouseEvent.pageY, "Child", $child.offset())
					if (mouseEvent.pageX >= $component.offset().left &&
							mouseEvent.pageX < (($component.width() / (childrenCount + 1)) + $component.offset().left)) {
						thisModel.createTargetBox($component, childrenCount).insertBefore($child);
						thisModel.rearrangeComponentRow($parent);
						return false;
						//when the cursor is inside the component tot he right
					} else if (mouseEvent.pageX >= (($component.width() / (childrenCount + 1)) + $component.offset().left) &&
							mouseEvent.pageX < (($component.width()) + $component.offset().left)) {
						thisModel.createTargetBox($component, childrenCount).insertAfter($child);
						thisModel.rearrangeComponentRow($parent);
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
			//$(".target").removeClass("target");
			if (mouseEvent.pageX >= this.$build.offset().left &&
					mouseEvent.pageX < (this.$build.width() + this.$build.offset().left) &&
					mouseEvent.pageY >= this.$build.offset().top &&
					mouseEvent.pageY < (this.$build.height() + this.$build.offset().top)) {
				var $parent = $(this.getBottomAbove(mouseEvent.pageY));
				this.determinePosition($parent, mouseEvent);
				this.prettifyComponentRows();
				console.log("Tag Index", $(".target").index())
			} else {
				this.removeTargetClasses($(".target"));
				this.prettifyComponentRows();
				//$(".target").removeClass("target");
			}
		}

		, handleTempDrop: function(mouseEvent, model, index) {
			if (mouseEvent.pageX >= this.$build.offset().left &&
					mouseEvent.pageX < (this.$build.width() + this.$build.offset().left) &&
					mouseEvent.pageY >= this.$build.offset().top &&
					mouseEvent.pageY < (this.$build.height() + this.$build.offset().top)) {
				var targetBox = $(".target");

				var index = this.targetClassIndex();
				console.log("Index", index);
				targetBox.removeClass("target");
				//this.rearrangeElement();

				//$(".target").removeClass("target");
				model.set("className", targetBox.attr("class"));
				console.log("ModelClass", model.get("className"));
				//this.removeTargetClasses($(".target"));

				targetBox.remove();
				this.collection.add(model, {at: index});
				//console.log("model", model);
			} else {
				this.removeTargetClasses($(".target"));
				//$(".target").removeClass("target");
			}
		}
	})
});
