﻿/* Place to store your global handlebars helpers */

/* jQuery function to check if array of promises have all finished */
if (jQuery.when.all === undefined) {
    jQuery.when.all = function (deferreds) {
        var deferred = new jQuery.Deferred();
        jQuery.when.apply(jQuery, deferreds).then(
            function () {
                deferred.resolve(Array.prototype.slice.call(arguments));
            },
            function () {
                deferred.fail(Array.prototype.slice.call(arguments));
            });
        return deferred;
    };
}

/* function to get the value of a field from sharepoint results */
if (Handlebars.helpers.getValueByKey === undefined) {
    Handlebars.registerHelper("getValueByKey", function (key, obj) {
        /* filter objects by the key name, return when key matches */
        var data = obj.filter(function (item) {
            return item.Key == key;
        });

        /* return value of object if key has been found, if no value return empty string */
        return data.length > 0
            ? data[0].Value
            : null;
    });
}

/* helper function to handle profile picture url */
if (Handlebars.helpers.getProfilePicture === undefined) {
    Handlebars.registerHelper("getProfilePicture", function (obj) {
        /* run handlerbar helper to get pictureUrl value */
        var pictureUrl = Handlebars.helpers.getValueByKey("PictureURL", obj);

        /* if no pictureUrl return SharePoint default image from Layouts*/
        return pictureUrl === null
            ? "/_layouts/15/images/PersonPlaceholder.96x96x32.png"
            : pictureUrl;
    });
}
