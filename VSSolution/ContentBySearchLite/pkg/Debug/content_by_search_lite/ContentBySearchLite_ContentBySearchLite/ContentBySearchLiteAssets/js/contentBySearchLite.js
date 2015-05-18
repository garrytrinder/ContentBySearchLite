/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

; (function ($, window, document, undefined) {

    // Create the defaults once
    var pluginName = "contentBySearchLite",
        defaults = {
            params: {
                "querytext": "'SharePoint'",
                "selectproperties": "'Title,Description,Author,Path'"
            },
            display: "basic.hbs",
            noresults: "noresults.hbs"
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        // container elements
        this.element = element;
        this.$element = jQuery(element);
        
        // mix defaults and user defined options
        this.options = $.extend({}, defaults, options);

        // plugin variables
        this.pluginDefaults = defaults;
        this.pluginName = pluginName;

        // sharepoint specific variables
        this.clientId = "idlive";
        this.searchEndPoint = _spPageContextInfo.siteServerRelativeUrl + "_api/search/query";
        this.styleLibraryPath = _spPageContextInfo.siteAbsoluteUrl + "/Style Library/" + this.clientId + "/contentbysearchlite";
        this.isWikiPage = PageState.ItemIsWikiPage === "1" ? true : false;
        
        // start plugin code
        this.init();
    }
    
    Plugin.prototype = {

        init: function () {
            var that = this;

            // check to see if the sharepoint page is in display or edit mode
            if (that.isPageInEditMode()) {
                that.editMode();
            } else {
                that.displayMode();
            }
        },
        isPageInEditMode: function () {
            var that = this;

            if (that.isWikiPage) {
                var val = jQuery("#_wikiPageMode").attr("value");
                if (val === "Edit") {
                    return true;
                }
            } else {
                var val = jQuery("#MSOLayout_InDesignMode").attr("value");
                if (val === "1") {
                    return true;
                }
            }
            return false;
        },
        editMode: function () {
            var that = this;

            // return message to page and end plugin code
            that.$element.html("<p><i>Page in Edit Mode. Edit the web part, click Edit Snippet"
                + "and change options to change Content By Search Lite behaviour." 
                + "Save the page to persist changes.</i></p>");
        },
        displayMode: function () {
            var that = this;

            // store promises in array
            var $promises = [];

            // create display template promise
            var display = that.getTemplate(that.options.display);
            $promises.push(display);

            // create noresults template promise
            var noresults = that.getTemplate(that.options.noresults);
            $promises.push(noresults);

            // create sharepoint search results promise
            var results = that.getResults(that.searchEndPoint, that.options.params);
            $promises.push(results);

            // wait till all promises in array have completed, then mix the templates and data
            jQuery.when.all($promises).then(function (schemas) {
                that.mix(schemas);
            });
        },
        getTemplate: function (template) {
            var that = this;
            return jQuery.ajax({
                url: that.styleLibraryPath + "/hbs/" + template,
                type: "GET",
                cache: true,
                data: {},
                dataType: "html",
                contentType: "text/html"
            });
        },
        getResults: function (url, data) {
            var that = this;            
            return jQuery.ajax({
                url: url,
                data: data,
                dataType: "json",
                headers: {
                    Accept: "application/json;odata=nometadata"
                }
            });
        },
        mix: function (schemas) {
            var that = this;

            var displaytemplate = schemas[0][0];
            var noresultstemplate = schemas[1][0];
            var results = that.getRelevantResults(schemas[2][0]);

            // check to see if we have results and chose the correct template
            results.length !== 0
                ? that.display(results, displaytemplate) 
                : that.display(results, noresultstemplate);
        },
        display: function (results, template) {
            var that = this;

            // compile handlebars template to JS variable
            var compiledTemplate = Handlebars.compile(template);

            // wrap results JSON to make it easier to loop in handlebar template
            var wrapper = { "results": results }

            // mix wrapped JSON with handlebars template to generate HTML
            var outputHtml = compiledTemplate(wrapper);

            // set container element HTML
            that.$element.html(outputHtml);
        },
        getRelevantResults: function (data) {
            //trims down the response from SharePoint to get the actual results
            return data.PrimaryQueryResult.RelevantResults.Table.Rows;
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);

/* sourceURL is requied so you can debug dynamic JS in Chrome */

//# sourceURL=contentbysearchlite.js