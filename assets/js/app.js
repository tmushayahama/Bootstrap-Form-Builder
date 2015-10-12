define([
 "jquery", "underscore", "backbone"
         , "collections/snippets", "collections/my-form-snippets"
         , "views/tab", "views/my-form"
         , "text!data/input.json", "text!data/combination-input.json", "text!data/radio.json", "text!data/select.json", "text!data/buttons.json"
         , "text!templates/app/render.html", "text!templates/app/about.html",
 'ResizeSensor', 'ElementQueries',
], function (
        $, _, Backbone
        , SnippetsCollection, MyFormSnippetsCollection
        , TabView, MyFormView
        , inputJSON, combinationInputJSON, radioJSON, selectJSON, buttonsJSON
        , renderTab, aboutTab
        , ResizeSensor, ElementQueries
        ) {
 return {
  initialize: function () {

   //Bootstrap tabs from json.
   new TabView({
    title: "Basic Controls",
    iconClassName: "fa fa-list-alt",
    collection: new SnippetsCollection(JSON.parse(inputJSON))
   });
   new TabView({
    title: "Advanced Controls",
    iconClassName: "fa fa-th-large",
    collection: new SnippetsCollection(JSON.parse(combinationInputJSON))
   });

   /*
    new TabView({
    title: "Radios / Checkboxes"
    , collection: new SnippetsCollection(JSON.parse(radioJSON))
    });
    new TabView({
    title: "Select"
    , collection: new SnippetsCollection(JSON.parse(selectJSON))
    });
    new TabView({
    title: "Buttons"
    , collection: new SnippetsCollection(JSON.parse(buttonsJSON))
    });
    new TabView({
    title: "Rendered"
    , content: renderTab
    });

    new TabView({
    title: "About"
    , content: aboutTab
    });
    */


   $('[data-toggle="offcanvas"]').click(function () {
    $('#wrapper').toggleClass('toggled');
   });

   //Tab form initialization
   $(".fb-form-snippets .component").wrap("<li />");

   //Make the first tab active!
   $("#components .tab-pane").first().addClass("active");
   $("#formtabs li").first().addClass("active");

   $('#toggle_bs_style').on('click', function (e) {
    e.preventDefault();
    if ($('#bootstrap-classic-theme').attr('href') == '') {
     $('#bootstrap-classic-theme').attr('href', 'assets/css/lib/bootstrap-3.0.0/dist/css/bootstrap-theme.min.css');
    } else {
     $('#bootstrap-classic-theme').attr('href', '');
    }

   });


   new MyFormView({
    title: "Original"
    , collection: new MyFormSnippetsCollection([
     {
      "className": "fb-house-full component col-lg-12",
      "title": "Form Name",
      "fields": {
       "name": {
        "label": "Form Name",
        "type": "input",
        "value": "Form Name",
       }
      }
     }
    ])
   });
  }
 }
});