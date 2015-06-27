({
	name: "../main",
	out: "../main-built.js"
	, shim: {
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		},
		'bootstrap': {
			deps: ['jquery'],
			exports: '$.fn.popover'
		},
		'ResizeSensor': {
			deps: ['jquery'],
			exports: 'ResizeSensor'
		},
		'ElementQueries': {
			deps: ['jquery'],
			exports: 'ElementQueries'
		}
	}
	, paths: {
		app: ".."
		, collections: "../collections"
		, data: "../data"
		, models: "../models"
		, helper: "../helper"
		, templates: "../templates"
		, views: "../views"
	}
})
