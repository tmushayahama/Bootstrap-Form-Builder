define(function(require) {
  var formname               = require('text!templates/snippet/formname.html')
  , prependedtext            = require('text!templates/snippet/prependedtext.html')
  , search                   = require('text!templates/snippet/searchinput.html')
  , textinput                = require('text!templates/snippet/textinput.html')
  , appendedcheckbox         = require('text!templates/snippet/appendedcheckbox.html')
  , appendedtext             = require('text!templates/snippet/appendedtext.html')
  , datetimepicker           = require('text!templates/snippet/datetimepicker.html')
  , filebutton               = require('text!templates/snippet/filebutton.html')
  , imagebox                 = require('text!templates/snippet/imagebox.html')
  , button                   = require('text!templates/snippet/button.html')
  , buttondouble             = require('text!templates/snippet/buttondouble.html')
  , buttondropdown           = require('text!templates/snippet/buttondropdown.html')
  , multiplecheckboxes       = require('text!templates/snippet/multiplecheckboxes.html')
  , multiplecheckboxesinline = require('text!templates/snippet/multiplecheckboxesinline.html')
  , multipleradios           = require('text!templates/snippet/multipleradios.html')
  , multipleradiosinline     = require('text!templates/snippet/multipleradiosinline.html')
  , passwordinput            = require('text!templates/snippet/passwordinput.html')
  , prependedcheckbox        = require('text!templates/snippet/prependedcheckbox.html')
  , prependedtext            = require('text!templates/snippet/prependedtext.html')
  , searchinput              = require('text!templates/snippet/searchinput.html')
  , selectbasic              = require('text!templates/snippet/selectbasic.html')
  , selectmultiple           = require('text!templates/snippet/selectmultiple.html')
  , signature                = require('text!templates/snippet/signature.html')
  , textarea                 = require('text!templates/snippet/textarea.html')
  , table                    = require('text!templates/snippet/table.html')
  , whitespace               = require('text!templates/snippet/whitespace.html');;

  return {
    formname                   : formname
    , prependedtext            : prependedtext
    , search                   : search
    , textinput                : textinput
    , appendedcheckbox         : appendedcheckbox
    , appendedtext             : appendedtext
    , datetimepicker           : datetimepicker
    , filebutton               : filebutton
    , singlebutton             : button
    , doublebutton             : buttondouble
    , buttondropdown           : buttondropdown
    , multiplecheckboxes       : multiplecheckboxes
    , multiplecheckboxesinline : multiplecheckboxesinline
    , multipleradios           : multipleradios
    , multipleradiosinline     : multipleradiosinline
    , passwordinput            : passwordinput
    , prependedcheckbox        : prependedcheckbox
    , searchinput              : searchinput
    , selectbasic              : selectbasic
    , selectmultiple           : selectmultiple
    , signature                : signature
    , table                    : table
    , textarea                 : textarea
    , imagebox                 : imagebox
	, whitespace			   : whitespace
  };
});
